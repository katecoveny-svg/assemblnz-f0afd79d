/**
 * assembl / living — product widget
 * ---------------------------------
 * One product, made yours: a body colour, an accent colour where a part
 * prints in a second colour, a lid or insert where the product has choices,
 * a name where a part carries lettering, and a quantity. Everything here is
 * pure and deterministic: it reads the CAD manifest and returns a typed item
 * configuration that a store page can attach to its own add-to-cart form.
 *
 * Honesty rules: estimates are labelled as estimates and never called a
 * quote; the widget never adds to a cart itself; purchasing is the store's
 * decision, recorded as such on the item.
 */

import { z } from 'zod';
import { CAD_MANIFEST, CAD_PACK, INTERFACE_ID, PITCH_MM, partCode, printFile } from './catalogue';
import { AC02, AC02_HANDLE_PREFIX, AC02_LETTERED, ac02Assembly, ac02Lines, ac02Part, ac02Roles, type Ac02Assembly } from './ac02';
import type { Colour, Colourway, ManifestKit, ManifestProduct } from './system';

export const ITEM_SCHEMA = 'assembl.living.item/1' as const;

/** Planning figures only. A slicer on the real print profile replaces them. */
export const PRINT_ASSUMPTIONS = {
  gramsPerHour: 30,
  filamentNzdPerKg: 45,
  note: 'Estimated from part mass at 30 g/h and NZD 45/kg filament. Not a slicer result and not a quote.',
} as const;

export type PartRole = 'body' | 'accent';
export type ChoiceKey = 'lid' | 'insert' | 'shape' | 'skin';
export type ChoiceOption = { id: string; label: string; partIds: string[] };
export type Choice = { key: ChoiceKey; label: string; options: ChoiceOption[]; defaultId: string };
export type TextSpec = { partId: string; label: string; maxChars: number; pattern: RegExp; hint: string };

export type WidgetLine = { handle: string; title: string; qty: number };
export type WidgetSpec = {
  kind: 'product' | 'kit' | 'prototype';
  handle: string;
  title: string;
  blurb: string;
  size: string;
  material: string;
  type: string;
  short: string | null;
  colourSet: 'living' | 'dayrally' | 'natural';
  /** Proposed retail; null for AC-02 prototypes, which carry no price until quoted. */
  priceNzd: number | null;
  shipG: number;
  colours: Colour[];
  choices: Choice[];
  /** A kit's contents (products and quantities); empty for a single product. */
  lines: WidgetLine[];
  /** Parts for a selection: the default parts with each chosen option swapped in; a kit's parts are every line's parts × qty. */
  partsFor: (choices: Record<string, string>) => { id: string; qty: number }[];
  /** The manifest SKU for a colour, where the manifest records one (products); kits use `kitSku`. */
  skus: { colour: string; sku: string }[];
  /** Explicit part roles (AC-02 assemblies decide accent by designed colour, not by part id). */
  roles?: Record<string, PartRole>;
  /** Assembled 3D view and CAD preview image for prototypes. */
  glb?: string;
  previewImage?: string;
  revision: string;
};

const PART_IDS = new Set(CAD_MANIFEST.parts.map((p) => p.id));

/** Parts that print in the second colour: lettering, inlays and tag names. */
export function partRole(id: string): PartRole {
  return /-(inlay|text|pattern)$/.test(id) || id === 'dr-bag-tag-name' ? 'accent' : 'body';
}

const TEXT_PARTS: Record<string, Omit<TextSpec, 'partId'>> = {
  'grid-name-plate-text': { label: 'Name', maxChars: 12, pattern: /^[A-Za-z0-9 .'&-]*$/, hint: 'Up to 12 letters, printed in the accent colour.' },
  'dr-bag-tag-name': { label: 'Name', maxChars: 10, pattern: /^[A-Za-z0-9 .'&-]*$/, hint: 'Up to 10 letters on the tag.' },
  'bike-number-plate-text': { label: 'Plate number', maxChars: 3, pattern: /^[0-9]*$/, hint: 'One to three digits.' },
  'cam-skin-name-pattern': { label: 'Name on the skin', maxChars: 8, pattern: /^[A-Za-z0-9 .'&-]*$/, hint: 'Up to 8 letters, raised in the accent colour beside the shutter.' },
  'ride-slate-name-pattern': { label: 'Name on the slate', maxChars: 8, pattern: /^[A-Za-z0-9 .'&-]*$/, hint: 'Up to 8 letters, raised on the slate in Fredoka Bold.' },
  'mini-bone-tag-name-pattern': { label: 'Name on the tag', maxChars: 7, pattern: /^[A-Za-z0-9 .'&-]*$/, hint: 'Up to 7 letters, raised on the bone tag in Fredoka Bold.' },
  'ride-grip-name-pattern': { label: 'Name on the grip', maxChars: 8, pattern: /^[A-Za-z0-9 .'&-]*$/, hint: 'Up to 8 letters, raised along the grip in Fredoka Bold.' },
  'ride-bar-end-name-pattern': { label: 'Name on the bar end', maxChars: 5, pattern: /^[A-Za-z0-9 .'&-]*$/, hint: 'Up to 5 letters, raised on the 24 mm cap in Fredoka Bold.' },
};
const LID_NAME_TEXT: Omit<TextSpec, 'partId'> = { label: 'Name on the lid', maxChars: 10, pattern: /^[A-Za-z0-9 .'&-]*$/, hint: 'Up to 10 letters, inlaid in the accent colour.' };

/** The text a set of parts asks for, if any. Pod name lids carry their lettering on the inlay. */
export function textSpecFor(partIds: string[]): TextSpec | null {
  for (const id of partIds) {
    const t = TEXT_PARTS[id];
    if (t) return { partId: id, ...t };
    const ac = AC02_LETTERED[id];
    if (ac) return { partId: id, label: ac.label, maxChars: ac.maxChars, pattern: /^[A-Za-z0-9 .'&-]*$/, hint: `Up to ${ac.maxChars} letters, cut into the part when it is rebuilt.` };
    if (/^dr2-lid-[a-z]+-name-inlay$/.test(id)) return { partId: id, ...LID_NAME_TEXT };
  }
  return null;
}

function humanise(slug: string): string {
  const words: Record<string, string> = { topo: 'Topo', 'deep-two': 'Deep, two', 'tackle-deep': 'Tackle, deep' };
  const s = words[slug] ?? slug.replace(/-/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function withInlay(id: string): string[] {
  return [id, ...[`${id}-inlay`, `${id}-pattern`].filter((x) => PART_IDS.has(x))];
}

function optionsFromPrefix(prefix: string): ChoiceOption[] {
  return CAD_MANIFEST.parts
    .filter((p) => p.id.startsWith(prefix) && !/-(inlay|pattern)$/.test(p.id))
    .map((p) => ({ id: p.id.slice(prefix.length), label: humanise(p.id.slice(prefix.length)), partIds: withInlay(p.id) }));
}

function choicesFor(product: ManifestProduct): Choice[] {
  const defaults = new Set(product.parts.map((p) => p.id));
  const pick = (key: ChoiceKey, label: string, prefix: string): Choice | null => {
    const options = optionsFromPrefix(prefix);
    if (options.length < 2) return null;
    const def = options.find((o) => o.partIds.some((id) => defaults.has(id))) ?? options[0];
    return { key, label, options, defaultId: def.id };
  };
  if (product.handle.startsWith('al-pod-')) {
    const size = product.handle.slice('al-pod-'.length);
    return [pick('lid', 'Lid', `dr2-lid-${size}-`), pick('insert', 'Insert', `dr2-insert-${size}-`)].filter((c): c is Choice => c !== null);
  }
  if (product.handle === 'al-bag-charm') return [pick('shape', 'Shape', 'dr2-charm-')].filter((c): c is Choice => c !== null);
  return [];
}

export const WIDGET_PRODUCTS: ManifestProduct[] = CAD_MANIFEST.products;
export const WIDGET_KITS: ManifestKit[] = CAD_MANIFEST.kits;

const COLOUR_SHORT: Record<string, string> = { chalk: 'CHA', oat: 'OAT', sage: 'SAG', clay: 'CLA', plum: 'PLU', ash: 'ASH', ink: 'INK', natural: 'NAT' };

/** Kit SKUs in the launch catalogue carry no check letter: `AL-<short>-<COL>`. */
export function kitSku(kit: Pick<ManifestKit, 'short'>, colourId: string): string | null {
  if (!kit.short) return null;
  return `AL-${kit.short}-${COLOUR_SHORT[colourId] ?? colourId.slice(0, 3).toUpperCase()}`;
}

/** Only colours the launch catalogue actually lists for the item (the manifest colour set can be wider). */
function skuColours(set: Colour[], skus: { colour: string; sku: string }[]): Colour[] {
  const listed = new Set(skus.map((s) => s.colour.toLowerCase()));
  const kept = set.filter((c) => listed.has(c.name.toLowerCase()));
  return kept.length ? kept : set;
}

function productSpec(product: ManifestProduct): WidgetSpec {
  const choices = choicesFor(product);
  const partsFor = (selected: Record<string, string>) => {
    // Every option's parts are removable; the chosen option's parts come back in.
    const swappable = new Set(choices.flatMap((c) => c.options.flatMap((o) => o.partIds)));
    const kept = product.parts.filter((p) => !swappable.has(p.id)).map((p) => ({ ...p }));
    const chosen = choices.flatMap((c) => {
      const o = c.options.find((x) => x.id === (selected[c.key] ?? c.defaultId)) ?? c.options.find((x) => x.id === c.defaultId)!;
      return o.partIds.map((id) => ({ id, qty: 1 }));
    });
    return [...kept, ...chosen];
  };
  return {
    kind: 'product', handle: product.handle, title: product.title, blurb: product.blurb, size: product.size, material: product.material, type: product.type, short: product.short,
    colourSet: product.colours, priceNzd: product.price_nzd, shipG: product.ship_g, colours: skuColours(CAD_MANIFEST.colours[product.colours], product.skus), choices, lines: [], partsFor, skus: product.skus, revision: CAD_PACK,
  };
}

function kitSpec(kit: ManifestKit): WidgetSpec | null {
  const lines = kit.lines.map((l) => ({ line: l, product: WIDGET_PRODUCTS.find((p) => p.handle === l.handle) }));
  if (lines.some((l) => !l.product)) return null;
  const products = lines.map((l) => l.product!);
  const colourSet = products[0].colours;
  // A kit prints in one colour, so only colours every line is catalogued in are offered.
  const colours = products.reduce((acc, p) => skuColours(acc, p.skus), CAD_MANIFEST.colours[colourSet]);
  const materials = [...new Set(products.map((p) => p.material.replace(/,\s*two colours$/i, '')))];
  const partsFor = () => {
    const acc = new Map<string, number>();
    for (const { line, product } of lines) for (const p of product!.parts) acc.set(p.id, (acc.get(p.id) ?? 0) + p.qty * line.qty);
    return [...acc.entries()].map(([id, qty]) => ({ id, qty }));
  };
  return {
    kind: 'kit', handle: kit.handle, title: kit.title, blurb: kit.note, size: `${lines.length} products · ${kit.lines.reduce((s, l) => s + l.qty, 0)} items`, material: materials.join(' · '), type: kit.collection === 'dayrally' ? 'dayrally kits' : 'Room kit', short: kit.short,
    colourSet, priceNzd: kit.price_nzd, shipG: kit.ship_g, colours, choices: [], lines: lines.map(({ line, product }) => ({ handle: line.handle, title: product!.title, qty: line.qty })), partsFor, skus: [], revision: CAD_PACK,
  };
}

/** An AC-02 assembled view as one customisable prototype: one body colour, one accent, a name where a part carries lettering. */
function prototypeSpec(a: Ac02Assembly): WidgetSpec {
  const lines = ac02Lines(a);
  const roles = ac02Roles(a);
  const colourSet = a.brand === 'dayrally' ? 'dayrally' : 'living';
  const parts = lines.map((l) => ac02Part(l.partId)!);
  const massG = lines.reduce((s, l) => s + (ac02Part(l.partId)?.massG ?? 0) * l.qty, 0);
  return {
    kind: 'prototype', handle: `${AC02_HANDLE_PREFIX}${a.id}`, title: a.name, blurb: a.notes, size: `${a.boundsMm.map((n) => Math.round(n)).join(' × ')} mm assembled`,
    material: [...new Set(parts.map((p) => p.material))].join(' · '), type: a.brand === 'dayrally' ? 'dayrally prototypes' : 'Living prototypes', short: null,
    colourSet, priceNzd: null, shipG: Math.round(massG * 1.25 + 40), colours: CAD_MANIFEST.colours[colourSet], choices: [],
    lines: lines.map((l) => ({ handle: l.partId, title: ac02Part(l.partId)?.description ?? l.partId, qty: l.qty })),
    partsFor: () => lines.map((l) => ({ id: l.partId, qty: l.qty })),
    skus: [], roles: Object.fromEntries(lines.map((l) => [l.partId, roles.accentParts.has(l.partId) ? 'accent' : 'body'])),
    glb: a.glb, previewImage: a.preview, revision: a.revision,
  };
}

export const WIDGET_PROTOTYPES = AC02.assemblies;

/**
 * Lab items: designed in the v0.3 pipeline and checked digitally, never printed, no price. The widget shows them
 * so a store page can preview them; purchasing stays `not_enabled` until a test print passes.
 */
export const LAB_HANDLE_PREFIX = 'lab-' as const;
export type LabItem = { id: string; title: string; blurb: string; type: string; colourSet: 'living' | 'dayrally'; size: string; parts: { id: string; qty: number }[]; choice?: { key: ChoiceKey; label: string; prefix: string; defaultId: string }; doc: string };
export const WIDGET_LAB: LabItem[] = [
  {
    id: 'dayrally-cam', title: 'dayrally cam', type: 'dayrally lab', colourSet: 'dayrally', size: '130 × 80 × 81 mm',
    blurb: '120-film pinhole camera: 6×6, 40 mm, f/143, twelve frames a roll, red-window counting, a rotating shutter on a patterned skin, and a TURN cradle so it clips to any dayrally mount. The body prints in ink for light-tightness; the skin and knobs take the colour.',
    parts: [{ id: 'cam-body', qty: 1 }, { id: 'cam-back', qty: 1 }, { id: 'cam-window-cover', qty: 1 }, { id: 'cam-winder-knob', qty: 1 }, { id: 'cam-supply-pin', qty: 1 }, { id: 'cam-shutter-disc', qty: 1 }, { id: 'cam-cradle', qty: 1 }],
    choice: { key: 'skin', label: 'Front skin', prefix: 'cam-skin-', defaultId: 'dots' }, doc: 'docs/living/DAYRALLY-CAM.md',
  },
  {
    id: 'dayrally-rod', title: 'dayrally rod', type: 'dayrally lab', colourSet: 'dayrally', size: '993 mm assembled · 233 × 32 mm packed',
    blurb: 'Fixed-line rod that packs into its own grip: four tapered sections on spigot joints, a line loop at the tip, line-keeper notches on the grip, and a TURN saddle so the packed rod rides a strap, a bar or the wall. Sections print in PETG-CF. Not a casting rod.',
    parts: [{ id: 'rod-grip', qty: 1 }, { id: 'rod-collar', qty: 1 }, { id: 'rod-butt-cap', qty: 1 }, { id: 'rod-section-1', qty: 1 }, { id: 'rod-section-2', qty: 1 }, { id: 'rod-section-3', qty: 1 }, { id: 'rod-tip', qty: 1 }, { id: 'rod-saddle', qty: 1 }],
    doc: 'docs/living/DAYRALLY-ROD.md',
  },
  {
    id: 'dayrally-cast', title: 'dayrally cast', type: 'dayrally lab', colourSet: 'dayrally', size: '0.91 m assembled · 253 × 36 mm packed',
    blurb: 'Casting rod for a real spinning reel: three hollow square sections in PPA-CF printed flat, square spigot pins, a screw-lock reel seat on a grip the sections pack inside, guides and a tip top. Design tip load 2.5 N; set the drag under 300 g. The reel is bought (Shimano 1000 size).',
    parts: [{ id: 'cast-grip', qty: 1 }, { id: 'cast-hood', qty: 1 }, { id: 'cast-nut', qty: 1 }, { id: 'cast-collar', qty: 1 }, { id: 'cast-butt-cap', qty: 1 }, { id: 'cast-section-1', qty: 1 }, { id: 'cast-section-2', qty: 1 }, { id: 'cast-section-3', qty: 1 }, { id: 'cast-pin-1', qty: 1 }, { id: 'cast-pin-2', qty: 1 }, { id: 'cast-tip-top', qty: 1 }, { id: 'cast-guide-1', qty: 1 }, { id: 'cast-guide-2', qty: 1 }, { id: 'cast-guide-3', qty: 1 }],
    doc: 'docs/living/DAYRALLY-CAST.md',
  },
  {
    id: 'wharf-reel', title: 'Wharf reel', type: 'dayrally lab', colourSet: 'dayrally', size: 'Ø100 × 28 mm',
    blurb: 'One-piece V-groove hand reel for about 30 m of mono, with a hand hole, a line anchor and a hook park. Hangs on a Grid hook. No hooks supplied.',
    parts: [{ id: 'rod-wharf-reel', qty: 1 }], doc: 'docs/living/DAYRALLY-ROD.md',
  },
  {
    id: 'dayrally-ride', title: 'dayrally ride pod', type: 'dayrally lab', colourSet: 'dayrally', size: '128 × 84 × 54 mm',
    blurb: 'The hero pod: bento proportion, a printed pin hinge, a latch button in the accent colour, a TPU gasket (splash-proof; untested, not submersible), a lanyard loop, a name slate on the lid, and the same two-key TURN floor as every pod, so it locks to every mount and the Grid. The lid carries the dayrally wordmark inlaid in the second colour.',
    parts: [{ id: 'ride-pod-base', qty: 1 }, { id: 'ride-pod-lid', qty: 1 }, { id: 'ride-pod-lid-pattern', qty: 1 }, { id: 'ride-latch', qty: 1 }, { id: 'ride-hinge-pin', qty: 2 }, { id: 'ride-gasket', qty: 1 }, { id: 'ride-core-split', qty: 1 }],
    choice: { key: 'skin', label: 'Name slate', prefix: 'ride-slate-', defaultId: 'dayrally' }, doc: 'docs/living/DAYRALLY-RIDE.md',
  },
  {
    id: 'ride-grips', title: 'dayrally grips', type: 'dayrally lab', colourSet: 'dayrally', size: '130 × Ø30 mm · 22.2 mm bars',
    blurb: 'TPU 95A push-on handlebar grips for 22.2 mm bars (bikes and most owned scooters; share scooters have moulded grips) with a waves or dots texture, or the rider\'s name raised along a flat land, and six ribs inside to bite the bar. The file is one grip: print two. A bar-end plug closes them. Interference on the bar is set at 1.2 mm on the diameter and tuned on the first print.',
    parts: [], choice: { key: 'skin', label: 'Texture', prefix: 'ride-grip-', defaultId: 'waves' }, doc: 'docs/living/DAYRALLY-RIDE.md',
  },
  {
    id: 'bar-ends', title: 'dayrally bar ends · plain or named', type: 'dayrally lab', colourSet: 'dayrally', size: 'Ø24 cap · 18-20 mm bar ends',
    blurb: 'The press-fit bar-end plug that closes the grips, plain or with the rider\'s name raised on its 24 mm cap in Fredoka Bold (up to 5 letters, second colour). Four slits let it flex into 18 to 20 mm bar ends, bike or scooter. The file is one plug: print two. The keyed bar end in TURN mini takes a charm instead.',
    parts: [], choice: { key: 'skin', label: 'Cap', prefix: 'ride-bar-end-', defaultId: 'plain' }, doc: 'docs/living/DAYRALLY-RIDE.md',
  },
  {
    id: 'ride-watch', title: 'dayrally watch cradle', type: 'dayrally lab', colourSet: 'dayrally', size: '70 × 58 × 28 mm',
    blurb: 'An Apple Watch cradle on two TURN keys: the watch sits in a pocket cut to its case and its own band wraps the slab underneath, through a tunnel over the key heads. A charger-puck pocket under the pocket floor makes the same cradle a bedside dock on the home dock or the Grid. Three sizes: 41/42, 45/46 and 49 mm.',
    parts: [], choice: { key: 'skin', label: 'Watch size', prefix: 'ride-watch-', defaultId: '46' }, doc: 'docs/living/DAYRALLY-RIDE.md',
  },
  {
    id: 'ride-phone', title: 'dayrally phone mount', type: 'dayrally lab', colourSet: 'dayrally', size: '184 × 98 × 39 mm',
    blurb: 'Portrait phone mount on two TURN keys. Paired 45° corner channels centre any phone from 64 to 82 mm wide; a slider on dovetail rails with a ratchet takes 140 to 170 mm lengths and a thumb tab releases it. No springs, no screws. The same plate on the home dock is a desk stand.',
    parts: [{ id: 'ride-phone-plate', qty: 1 }, { id: 'ride-phone-slider', qty: 1 }], doc: 'docs/living/DAYRALLY-RIDE.md',
  },
  {
    id: 'ride-bottle', title: 'dayrally bottle cup', type: 'dayrally lab', colourSet: 'dayrally', size: '81 × 92 × 105 mm',
    blurb: 'A bottle cup with diamond windows for 73 to 75 mm bottles, on two TURN keys and with the standard 64 mm M5 slots, so it bolts to a frame boss, locks to a frame or bar saddle, or sits on the Grid or the home dock as a pen cup. Two inside ridges hold the bottle.',
    parts: [{ id: 'ride-bottle-cup', qty: 1 }], doc: 'docs/living/DAYRALLY-RIDE.md',
  },
  {
    id: 'turn-mini', title: 'TURN mini · components library', type: 'dayrally lab', colourSet: 'dayrally', size: '26 mm cubes · 7.8 mm keyway',
    blurb: 'The TURN at gadget scale (0.6×): a 26 mm base mount with a socket in every face, a double-ended universal key that joins two cubes (push, turn, quarter-turn the next cube), an angle joint, a flat mount, a tube clamp for 22-35 mm bars, an end cap with a loop, and the adapter that locks a cube chain onto any full-size TURN mount, pod floor or Grid board.',
    parts: [{ id: 'mini-universal-key', qty: 3 }, { id: 'mini-cube', qty: 2 }, { id: 'mini-angle-joint', qty: 1 }, { id: 'mini-flat-mount', qty: 1 }, { id: 'mini-tube-clamp', qty: 1 }, { id: 'mini-end-cap', qty: 2 }, { id: 'mini-adapter', qty: 1 }],
    doc: 'docs/living/DAYRALLY-MINI.md',
  },
  {
    id: 'mini-ride', title: 'ride kit · mini mounts', type: 'dayrally lab', colourSet: 'dayrally', size: 'cam mount 26 × 26 × 43 mm',
    blurb: 'The ride kit on TURN mini: an action cam mount with the three-finger fitting (3.0 mm fingers, 3.35 gaps, M5 thumb screw bought), a helmet base curved to a 90 mm shell for a VHB pad, a light mount for a 22-26 mm torch, a phone holder for a cased phone up to 80 × 160 with a silicone strap, a battery dock for a power bank up to 70 × 15, a tube clamp and the keyed bar-end plug.',
    parts: [{ id: 'mini-cam-mount', qty: 1 }, { id: 'mini-helmet-base', qty: 1 }, { id: 'mini-light-mount', qty: 1 }, { id: 'mini-phone-holder', qty: 1 }, { id: 'mini-battery-dock', qty: 1 }, { id: 'mini-tube-clamp', qty: 2 }, { id: 'mini-bar-end', qty: 2 }, { id: 'mini-universal-key', qty: 4 }],
    doc: 'docs/living/DAYRALLY-MINI.md',
  },
  {
    id: 'mini-explore', title: 'explore kit · mini', type: 'dayrally lab', colourSet: 'dayrally', size: 'photo tag 52 × 48 × 7 mm',
    blurb: 'The explore kit on TURN mini: a photo tag that holds a 40 × 30 print under four corner tabs, a device holder with strap slots for a GPS or a power bank, a pole clamp for 12-20 mm poles, and a lantern hook. Pet: a collar mount that slides onto a 20-25 mm collar so a tag, a light or the cam locks on, and rally\'s bone tag with the name raised in Fredoka.',
    parts: [{ id: 'mini-photo-tag', qty: 1 }, { id: 'mini-device-holder', qty: 1 }, { id: 'mini-pole-clamp', qty: 1 }, { id: 'mini-lantern-hook', qty: 1 }, { id: 'mini-collar-mount', qty: 1 }, { id: 'mini-bone-tag-name', qty: 1 }, { id: 'mini-bone-tag-name-pattern', qty: 1 }, { id: 'mini-universal-key', qty: 3 }, { id: 'mini-end-cap', qty: 1 }],
    doc: 'docs/living/DAYRALLY-MINI.md',
  },
  {
    id: 'ride-rack', title: 'dayrally on the bike · rack set', type: 'dayrally lab', colourSet: 'dayrally', size: 'rack mount 150 × 100 mm · quiver 91 × 49 × 130 mm',
    blurb: 'The three mounts that put the kit where the bike picture puts it: a rack mount that straps to a rear-rack platform so the ride pod or the long pod locks on; a two-tube rod quiver for packed rods (the cast rod grip and the fixed-line rod) that straps to a rack stay or the seat tube; and the frame saddle turned inline so a pod lies along the top tube. Straps and zip ties are bought.',
    parts: [{ id: 'rack-mount', qty: 1 }, { id: 'rack-quiver', qty: 1 }, { id: 'rack-toptube-saddle', qty: 1 }], doc: 'docs/living/DAYRALLY-RIDE.md',
  },
  {
    id: 'ride-stand', title: 'dayrally crank stand', type: 'dayrally lab', colourSet: 'dayrally', size: '110 × 70 × 120 mm',
    blurb: 'A crank stand: rest a pedal in the cradle and lean the bike. On the desk the same slot holds a phone at 15°, and the TURN flange in its back locks it onto the Grid so it is not lost. Hollow with three ribs, four rubber-foot recesses. Digitally checked only.',
    parts: [{ id: 'ride-stand', qty: 1 }], doc: 'docs/living/DAYRALLY-RIDE.md',
  },
  {
    id: 'scoot-fish', title: 'dayrally on the scooter · stem saddle and rod quiver', type: 'dayrally lab', colourSet: 'dayrally', size: 'stem saddle 96 × 72 × 42 mm · quiver Ø45 × 150 mm',
    blurb: 'The rod holder for a Flamingo, a Lime or a Honey Whale: a stem saddle that straps to any 32 to 60 mm scooter stem with one 25 mm strap, no tools, off in a minute (share scooters cannot be drilled or clamped), carrying two TURN sockets along the stem; and a one-tube quiver with a full TURN flange that keys onto it and takes the packed fixed-line rod or the packed cast rod. The pod mini or the ride pod lock onto the same saddle. Stem sizes of the three scooters are not measured yet; the V covers the range and the strap does the rest. Strap bought.',
    parts: [{ id: 'scoot-stem-saddle', qty: 1 }, { id: 'scoot-quiver', qty: 1 }], doc: 'docs/living/DAYRALLY-RIDE.md',
  },
  {
    id: 'fish-ruler', title: 'dayrally fish ruler · the long pod, 35 cm end to end', type: 'dayrally lab', colourSet: 'dayrally', size: '176 × 72 × 45 mm · 35.2 cm open',
    blurb: 'The long pod as a fish ruler. Its ruler lid reads 0 to 17.6 cm from the lid\'s own end (half-centimetre ticks and centimetre numbers inlaid flush in the accent colour); its base carries raised marks on the outer wall from 17.6 to 35.2 cm. Open the pod, lay the lid on the wharf end to end with the base, and the two rounded ends touching are one 35 cm rule with nothing extra to carry: 10 mm of sideways slop reads 0.7 mm short. No legal sizes are marked, because they differ by area and change. Same pens, tackle and everyday inserts, same two-key TURN floor. Scales to be checked against a steel rule on the first print.',
    parts: [{ id: 'ruler-pod-long-fish', qty: 1 }, { id: 'dr2-lid-long-ruler', qty: 1 }, { id: 'dr2-lid-long-ruler-inlay', qty: 1 }, { id: 'grid-turn-key', qty: 2 }],
    choice: { key: 'insert', label: 'Insert', prefix: 'dr2-insert-long-', defaultId: 'dr2-insert-long-tackle' }, doc: 'docs/living/DAYRALLY-RULER.md',
  },
  {
    id: 'ruler-15', title: 'dayrally ruler · 15 cm, lives in the pencil pod', type: 'dayrally lab', colourSet: 'dayrally', size: '150 × 10 × 2 mm',
    blurb: 'A 15 cm ruler with millimetre ticks engraved into its top, sized for one of the long pod\'s two middle pen slots (157 mm long), so the school kit carries a ruler. 0 is the end of the ruler. The millimetre ticks are at the limit of a 0.4 mm nozzle; the first print decides whether they read.',
    parts: [{ id: 'ruler-150', qty: 1 }], doc: 'docs/living/DAYRALLY-RULER.md',
  },
  {
    id: 'emergency-pack', title: 'dayrally emergency pack · the wide pod', type: 'dayrally lab', colourSet: 'dayrally', size: '176 × 100 × 55 mm closed',
    blurb: 'The fifth pod size, a third wider and 6 mm taller, on the same two-key TURN floor: it locks to every dayrally mount and any Grid board. The emergency insert takes an earbuds case, a small power bank, a lip balm, two compact tampons, a mini sanitiser lying down and a patch sachet; a wipes sachet rides on top. The card lid holds a bank card against the inside of the lid on two rails, so the card is never under the stuff. Pockets are from published product sizes; the first print checks each against the real thing.',
    parts: [{ id: 'pk-pod-wide', qty: 1 }, { id: 'pk-lid-wide-card', qty: 1 }, { id: 'pk-lid-wide-card-inlay', qty: 1 }, { id: 'grid-turn-key', qty: 2 }],
    choice: { key: 'insert', label: 'Insert', prefix: 'pk-insert-wide-', defaultId: 'pk-insert-wide-emergency' }, doc: 'docs/living/DAYRALLY-POCKET.md',
  },
  {
    id: 'mini-emergency', title: 'dayrally mini emergency kit · the standard pod', type: 'dayrally lab', colourSet: 'dayrally', size: '128 × 72 × 49 mm closed',
    blurb: 'The standard pod with the card lid and an emergency insert: a compact tampon, a lip balm standing, a mini sanitiser lying down, a patch sachet, and room for hair ties or a plaster. The bank card rides in the lid. Same two-key floor, same mounts.',
    parts: [{ id: 'dr2-pod-standard', qty: 1 }, { id: 'pk-lid-standard-card', qty: 1 }, { id: 'pk-lid-standard-card-inlay', qty: 1 }, { id: 'pk-insert-standard-emergency', qty: 1 }, { id: 'grid-turn-key', qty: 2 }],
    doc: 'docs/living/DAYRALLY-POCKET.md',
  },
  {
    id: 'lip-sleeve', title: 'lip sleeve · for a peptide lip tube', type: 'dayrally lab', colourSet: 'dayrally', size: '93 × 28 × 27 mm',
    blurb: 'An open-topped sleeve sized to the slant-tip peptide tubes (rhode 114 × 22 × 21, Laneige 96 × 23 × 23, Summer Fridays about 120 × 23): the tube sits 30 % proud, a thumb scoop pushes it out, a loop takes a ring or a charm, and the name is inlaid flush on the front in the accent colour.',
    parts: [{ id: 'pk-lip-sleeve', qty: 1 }, { id: 'pk-lip-sleeve-inlay', qty: 1 }], doc: 'docs/living/DAYRALLY-POCKET.md',
  },
  {
    id: 'charms-2', title: 'bag charms, second set · bow, cherry, moon, butterfly, smile', type: 'dayrally lab', colourSet: 'dayrally', size: 'about 42 mm · 4 mm thick',
    blurb: 'Five more outlines beside the dayrally six. The bow carries initials inlaid flush; the smile carries its face; cherry, moon and butterfly are plain shapes with a ring hole. Four grams each.',
    parts: [], choice: { key: 'skin', label: 'Shape', prefix: 'pk-charm-', defaultId: 'pk-charm-bow' }, doc: 'docs/living/DAYRALLY-POCKET.md',
  },
  {
    id: 'friend-set', title: 'friend set · one heart, two halves', type: 'dayrally lab', colourSet: 'dayrally', size: '54 mm heart · 4 mm thick · two halves',
    blurb: 'One heart split on a wave into two halves that fit back together with 0.35 mm between them. Each half has a ring hole at its shoulder and one initial inlaid flush. Print the halves in two colours; one each.',
    parts: [{ id: 'pk-friend-left', qty: 1 }, { id: 'pk-friend-left-inlay', qty: 1 }, { id: 'pk-friend-right', qty: 1 }, { id: 'pk-friend-right-inlay', qty: 1 }], doc: 'docs/living/DAYRALLY-POCKET.md',
  },
  {
    id: 'id-tag', title: 'id tag · a code a bystander can scan', type: 'dayrally lab', colourSet: 'dayrally', size: '64 × 38 × 4 mm',
    blurb: 'A tag for the bag, the bike or the pod with a QR code inlaid flush beside the word SCAN: 25 × 25 modules at 1.0 mm. Scanning it opens the owner\'s emergency page (allergies, a parent\'s number, whatever the parent chooses to publish, nothing else). The code in the file is a SAMPLE; the real one is made per order from the page address. The page itself is proposed, not built.',
    parts: [{ id: 'pk-id-tag', qty: 1 }, { id: 'pk-id-tag-inlay', qty: 1 }], doc: 'docs/living/DAYRALLY-POCKET.md',
  },
  {
    id: 'id-lid', title: 'id lid · the mini pod lid with the owner\'s code', type: 'dayrally lab', colourSet: 'dayrally', size: '92 × 60 × 15 mm',
    blurb: 'The mini pod lid with the QR code and the name inlaid flush in its top, so the pod on the bike carries the owner\'s page. Sample code; the real one is made per order.',
    parts: [{ id: 'pk-lid-mini-id', qty: 1 }, { id: 'pk-lid-mini-id-inlay', qty: 1 }], doc: 'docs/living/DAYRALLY-POCKET.md',
  },
  {
    id: 'eraser-sleeve', title: 'eraser sleeve · the rubber is replaceable', type: 'dayrally lab', colourSet: 'dayrally', size: '44 × 27 × 17 mm',
    blurb: 'A sleeve for a standard block eraser (Staedtler Mars plastic, 65 × 23 × 13): the sleeve is yours and named, the rubber slides in and gets pushed up through a thumb slot as it wears. Prints name-side down.',
    parts: [{ id: 'pk-eraser-sleeve', qty: 1 }, { id: 'pk-eraser-sleeve-inlay', qty: 1 }], doc: 'docs/living/DAYRALLY-POCKET.md',
  },
  {
    id: 'pen-g2', title: 'pen · for a G2 refill, named', type: 'dayrally lab', colourSet: 'dayrally', size: '116 × 10 mm',
    blurb: 'A pen body that takes any Parker-style G2 ballpoint refill (98 mm, the most common refill there is): a rounded hexagon with a flat for the name inlay, a tapered nose, and a press-fit back plug with a loop for a charm. Not a click pen; the cap-free kind that lives in the pencil pod.',
    parts: [{ id: 'pk-pen-body', qty: 1 }, { id: 'pk-pen-body-inlay', qty: 1 }, { id: 'pk-pen-plug', qty: 1 }], doc: 'docs/living/DAYRALLY-POCKET.md',
  },
  {
    id: 'pencil-topper', title: 'pencil topper · a charm on the pencil', type: 'dayrally lab', colourSet: 'dayrally', size: '12 mm collar · 24 to 44 mm tall',
    blurb: 'A short collar that press-fits a standard hex pencil (its corners bite a 7.8 mm bore) with a charm outline standing on top: star, heart, bow or smile.',
    parts: [], choice: { key: 'skin', label: 'Charm', prefix: 'pk-topper-', defaultId: 'pk-topper-star' }, doc: 'docs/living/DAYRALLY-POCKET.md',
  },
];

function labSpec(item: LabItem): WidgetSpec {
  const choices: Choice[] = [];
  if (item.choice) {
    const options = optionsFromPrefix(item.choice.prefix);
    if (options.length >= 2) choices.push({ key: item.choice.key, label: item.choice.label, options, defaultId: options.find((o) => o.id === item.choice!.defaultId)?.id ?? options[0].id });
  }
  const partsFor = (selected: Record<string, string>) => {
    const chosen = choices.flatMap((c) => {
      const o = c.options.find((x) => x.id === (selected[c.key] ?? c.defaultId)) ?? c.options.find((x) => x.id === c.defaultId)!;
      return o.partIds.map((id) => ({ id, qty: 1 }));
    });
    return [...item.parts.map((p) => ({ ...p })), ...chosen];
  };
  const massG = partsFor({}).reduce((s, p) => s + printFile(p.id).mass_g_pla * p.qty, 0);
  const materials = [...new Set(partsFor({}).map((p) => printFile(p.id).material))];
  return {
    kind: 'prototype', handle: `${LAB_HANDLE_PREFIX}${item.id}`, title: item.title, blurb: item.blurb, size: item.size, material: materials.join(' · '), type: item.type, short: null,
    colourSet: item.colourSet, priceNzd: null, shipG: Math.round(massG * 1.25 + 40), colours: CAD_MANIFEST.colours[item.colourSet], choices, lines: [], partsFor, skus: [], revision: CAD_PACK,
  };
}

export function isLabHandle(handle: string): boolean {
  return handle.startsWith(LAB_HANDLE_PREFIX);
}

export function widgetSpec(handle: string): WidgetSpec | null {
  const product = WIDGET_PRODUCTS.find((p) => p.handle === handle);
  if (product) return productSpec(product);
  const kit = WIDGET_KITS.find((k) => k.handle === handle);
  if (kit) return kitSpec(kit);
  if (handle.startsWith(AC02_HANDLE_PREFIX)) {
    const a = ac02Assembly(handle.slice(AC02_HANDLE_PREFIX.length));
    if (a) return prototypeSpec(a);
  }
  if (isLabHandle(handle)) {
    const item = WIDGET_LAB.find((l) => `${LAB_HANDLE_PREFIX}${l.id}` === handle);
    if (item) return labSpec(item);
  }
  return null;
}

/** Print-file facts for any part id the widget can meet: the v0.3 pack first, then AC-02. */
export function partInfo(id: string): { id: string; name: string; massG: number; revision: string; sha256: string | null; path: string | null; dims: { x: number; y: number; z: number }; material: string; orientation: string; supports: string; notes: string } {
  const ac = ac02Part(id);
  if (ac) return { id, name: ac.description, massG: ac.massG, revision: ac.revision, sha256: ac.stlSha256, path: null, dims: { x: ac.bboxMm[0], y: ac.bboxMm[1], z: ac.bboxMm[2] }, material: ac.material, orientation: 'as delivered', supports: 'slicer review required', notes: ac.notes };
  const f = printFile(id);
  return { id, name: f.name, massG: f.mass_g_pla, revision: f.revision, sha256: f.file?.sha256 ?? null, path: f.file?.path ?? null, dims: f.dims_mm, material: f.material, orientation: f.print_orientation, supports: f.supports, notes: f.notes };
}

/** True when any part prints in a second colour, so an accent is needed. */
export function needsAccent(partIds: string[]): boolean {
  return partIds.some((id) => partRole(id) === 'accent');
}

/** A readable default accent: the darkest colour on light bodies, the lightest on dark ones. */
export function defaultAccent(colours: Colour[], body: Colour): Colour {
  const lum = (hex: string) => {
    const n = parseInt(hex.replace('#', ''), 16);
    return 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  };
  const sorted = [...colours].filter((c) => c.id !== body.id).sort((a, b) => lum(a.hex) - lum(b.hex));
  return lum(body.hex) > 128 ? sorted[0] : sorted[sorted.length - 1];
}

/* ────────────────────────────────────────────── the item */

export const ColourPickSchema = z.object({ id: z.string(), name: z.string(), hex: z.string() });
export const ItemConfigurationSchema = z.object({
  schema: z.literal(ITEM_SCHEMA),
  status: z.literal('proposed'),
  createdAt: z.string(),
  kind: z.enum(['product', 'kit', 'prototype']),
  handle: z.string(),
  title: z.string(),
  colourSet: z.enum(['living', 'dayrally', 'natural']),
  colour: ColourPickSchema,
  accent: ColourPickSchema.nullable(),
  choices: z.record(z.string(), z.object({ id: z.string(), label: z.string() })),
  text: z.object({ label: z.string(), value: z.string() }).nullable(),
  qty: z.number().int().min(1).max(20),
  sku: z.string().nullable(),
  /** A kit's contents with the SKU each line would carry in the chosen colour. */
  lines: z.array(z.object({ handle: z.string(), title: z.string(), qty: z.number().int().positive(), sku: z.string().nullable() })),
  printFiles: z.array(z.object({ id: z.string(), name: z.string(), qty: z.number().int().positive(), role: z.enum(['body', 'accent']), revision: z.string(), sha256: z.string().nullable(), path: z.string().nullable(), massG: z.number() })),
  estimate: z.object({
    perUnit: z.object({ massG: z.number(), printMinutes: z.number(), materialNzd: z.number(), suggestedRetailNzd: z.number().nullable(), shipG: z.number() }),
    total: z.object({ massG: z.number(), printMinutes: z.number(), materialNzd: z.number(), suggestedRetailNzd: z.number().nullable() }),
    assumptions: z.string(),
  }),
  interface: z.object({ id: z.string(), pack: z.string(), pitchMm: z.number() }),
  purchasing: z.object({ channel: z.literal('shopify'), status: z.enum(['store_decides', 'not_enabled']), note: z.string() }),
});
export type ItemConfiguration = z.infer<typeof ItemConfigurationSchema>;

export type ItemInput = {
  handle: string;
  colour: string;
  accent?: string | null;
  choices?: Record<string, string>;
  text?: string | null;
  qty?: number;
  now?: string;
};

export type BuildResult = { ok: true; item: ItemConfiguration; issues: [] } | { ok: false; item: null; issues: string[] };

export function buildItem(input: ItemInput): BuildResult {
  const spec = widgetSpec(input.handle);
  if (!spec) return { ok: false, item: null, issues: [`Unknown product "${input.handle}".`] };
  const issues: string[] = [];
  const colour = spec.colours.find((c) => c.id === input.colour);
  if (!colour) issues.push('Choose a colour.');

  const selected: Record<string, string> = {};
  for (const c of spec.choices) {
    const want = input.choices?.[c.key] ?? c.defaultId;
    if (!c.options.some((o) => o.id === want)) issues.push(`Choose a ${c.label.toLowerCase()}.`);
    selected[c.key] = c.options.some((o) => o.id === want) ? want : c.defaultId;
  }
  const parts = spec.partsFor(selected);
  const partIds = parts.map((p) => p.id);

  const roleOf = (id: string): PartRole => spec.roles?.[id] ?? partRole(id);
  let accent: Colour | null = null;
  if (partIds.some((id) => roleOf(id) === 'accent')) {
    accent = input.accent ? spec.colours.find((c) => c.id === input.accent) ?? null : colour ? defaultAccent(spec.colours, colour) : null;
    if (!accent) issues.push('Choose an accent colour.');
    else if (colour && accent.id === colour.id) issues.push('The accent colour needs to differ from the body colour so the lettering reads.');
  }

  const textSpec = textSpecFor(partIds);
  const text = (input.text ?? '').trim();
  if (textSpec) {
    if (!text) issues.push(`Add the ${textSpec.label.toLowerCase()}.`);
    else if (text.length > textSpec.maxChars) issues.push(`${textSpec.label} is limited to ${textSpec.maxChars} characters.`);
    else if (!textSpec.pattern.test(text)) issues.push(`${textSpec.label}: ${textSpec.hint}`);
  }

  const qty = input.qty ?? 1;
  if (!Number.isInteger(qty) || qty < 1 || qty > 20) issues.push('Quantity is 1 to 20 per order.');

  if (issues.length || !colour) return { ok: false, item: null, issues };

  const printFiles = parts.map((p) => {
    const f = partInfo(p.id);
    return { id: f.id, name: f.name, qty: p.qty, role: roleOf(p.id), revision: f.revision, sha256: f.sha256, path: f.path, massG: f.massG };
  });
  const massG = round1(printFiles.reduce((s, f) => s + f.massG * f.qty, 0));
  const perUnit = {
    massG,
    printMinutes: Math.round((massG / PRINT_ASSUMPTIONS.gramsPerHour) * 60),
    materialNzd: round2((massG / 1000) * PRINT_ASSUMPTIONS.filamentNzdPerKg),
    suggestedRetailNzd: spec.priceNzd,
    shipG: spec.shipG,
  };
  const skuFor = (s: Pick<WidgetSpec, 'skus' | 'short'>) => s.skus.find((x) => x.colour.toLowerCase() === colour.name.toLowerCase())?.sku ?? partCode(s, colour.id as Colourway);
  const colourShort = COLOUR_SHORT[colour.id] ?? colour.id.slice(0, 3).toUpperCase();
  const isAc02 = spec.handle.startsWith(AC02_HANDLE_PREFIX);
  const sku = spec.kind === 'kit' ? kitSku(spec, colour.id)
    : spec.kind === 'prototype' ? (isAc02 ? `AC02-${spec.handle.slice(AC02_HANDLE_PREFIX.length).toUpperCase()}-${colourShort}` : `LAB-${spec.handle.slice(LAB_HANDLE_PREFIX.length).toUpperCase()}-${colourShort}`)
    : skuFor(spec);
  const lines = spec.lines.map((l) => ({ ...l, sku: spec.kind === 'prototype' ? null : skuFor(widgetSpec(l.handle)!) }));

  const item: ItemConfiguration = {
    schema: ITEM_SCHEMA,
    status: 'proposed',
    createdAt: input.now ?? new Date().toISOString(),
    kind: spec.kind,
    handle: spec.handle,
    title: spec.title,
    colourSet: spec.colourSet,
    colour: { id: colour.id, name: colour.name, hex: colour.hex },
    accent: accent ? { id: accent.id, name: accent.name, hex: accent.hex } : null,
    choices: Object.fromEntries(spec.choices.map((c) => [c.key, { id: selected[c.key], label: c.options.find((o) => o.id === selected[c.key])!.label }])),
    text: textSpec ? { label: textSpec.label, value: text } : null,
    qty,
    sku,
    lines,
    printFiles,
    estimate: {
      perUnit,
      total: { massG: round1(perUnit.massG * qty), printMinutes: perUnit.printMinutes * qty, materialNzd: round2(perUnit.materialNzd * qty), suggestedRetailNzd: perUnit.suggestedRetailNzd === null ? null : round2(perUnit.suggestedRetailNzd * qty) },
      assumptions: PRINT_ASSUMPTIONS.note,
    },
    interface: spec.kind === 'prototype' && isAc02 ? { id: AC02.interfaces.wall, pack: AC02.revision, pitchMm: PITCH_MM } : { id: INTERFACE_ID, pack: CAD_PACK, pitchMm: PITCH_MM },
    purchasing: spec.kind === 'prototype'
      ? { channel: 'shopify', status: 'not_enabled', note: isAc02 ? 'AC-02 digital prototype: unprinted, not approved for manufacture, no price. The store must not list it until samples pass.' : 'Lab item: designed in the v0.3 pipeline and checked digitally, never printed, no price. The store must not list it until a test print passes.' }
      : { channel: 'shopify', status: 'store_decides', note: 'The widget describes the item. Adding to cart, price and availability are the store page’s own; nothing here is a quote.' },
  };
  return { ok: true, item, issues: [] };
}

function round1(n: number): number { return Math.round(n * 10) / 10; }
function round2(n: number): number { return Math.round(n * 100) / 100; }

/* ────────────────────────────────────────────── what the store receives */

/** Shopify line item properties. Underscore-prefixed keys stay off the cart page in most themes. */
export function lineItemProperties(item: ItemConfiguration): Record<string, string> {
  const props: Record<string, string> = { Colour: item.colour.name };
  if (item.accent) props.Accent = item.accent.name;
  for (const [key, c] of Object.entries(item.choices)) props[key.charAt(0).toUpperCase() + key.slice(1)] = c.label;
  if (item.text) props[item.text.label] = item.text.value;
  if (item.sku) props['Part code'] = item.sku;
  if (item.lines.length) props.Contents = item.lines.map((l) => `${l.qty} × ${l.title}`).join(', ');
  props._assembl_item = JSON.stringify({
    schema: item.schema,
    handle: item.handle,
    colour: item.colour.id,
    accent: item.accent?.id ?? null,
    choices: Object.fromEntries(Object.entries(item.choices).map(([k, v]) => [k, v.id])),
    text: item.text?.value ?? null,
    sku: item.sku,
    lines: item.lines.length ? item.lines.map((l) => ({ h: l.handle, q: l.qty, sku: l.sku })) : undefined,
    files: item.printFiles.map((f) => ({ id: f.id, qty: f.qty, role: f.role, rev: f.revision, sha: f.sha256 })),
    estimate: item.estimate.perUnit,
  });
  return props;
}

/** The print sheet a partner receives for this item: files, colours per role, quantities, hashes. */
export function printSheet(item: ItemConfiguration): string {
  return JSON.stringify(
    {
      schema: 'assembl.living.print-sheet/1',
      status: 'proposed',
      createdAt: item.createdAt,
      interface: item.interface,
      item: { kind: item.kind, handle: item.handle, title: item.title, sku: item.sku, qty: item.qty, text: item.text, choices: item.choices, lines: item.lines },
      colours: { body: item.colour, accent: item.accent },
      files: item.printFiles.map((f) => {
        const pf = partInfo(f.id);
        return { ...f, colour: f.role === 'accent' ? item.accent?.name ?? null : item.colour.name, material: pf.material, orientation: pf.orientation, supports: pf.supports, dimsMm: pf.dims, notes: pf.notes, servedFrom: f.path ? 'public pack' : item.kind === 'prototype' ? 'AC-02 delivery archive (STL and STEP by hash)' : 'not in the served pack yet; export from tools/living-cad' };
      }),
      estimate: item.estimate,
      note: 'Proposed. Print only after the TURN test kit has passed on this printer and profile.',
    },
    null,
    2,
  );
}

/* ────────────────────────────────────────────── iframe protocol */

export const WidgetMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('assembl:ready'), handle: z.string() }),
  z.object({ type: z.literal('assembl:size'), height: z.number().positive() }),
  z.object({
    type: z.literal('assembl:item'),
    item: ItemConfigurationSchema,
    properties: z.record(z.string(), z.string()),
    variant: z.object({ option: z.literal('Colour'), value: z.string(), sku: z.string().nullable() }),
  }),
  z.object({ type: z.literal('assembl:invalid'), issues: z.array(z.string()) }),
]);
export type WidgetMessage = z.infer<typeof WidgetMessageSchema>;

export function itemMessage(item: ItemConfiguration): WidgetMessage {
  return { type: 'assembl:item', item, properties: lineItemProperties(item), variant: { option: 'Colour', value: item.colour.name, sku: item.sku } };
}
