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
export type ChoiceKey = 'lid' | 'insert' | 'shape';
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
  return /-(inlay|text)$/.test(id) || id === 'dr-bag-tag-name' ? 'accent' : 'body';
}

const TEXT_PARTS: Record<string, Omit<TextSpec, 'partId'>> = {
  'grid-name-plate-text': { label: 'Name', maxChars: 12, pattern: /^[A-Za-z0-9 .'&-]*$/, hint: 'Up to 12 letters, printed in the accent colour.' },
  'dr-bag-tag-name': { label: 'Name', maxChars: 10, pattern: /^[A-Za-z0-9 .'&-]*$/, hint: 'Up to 10 letters on the tag.' },
  'bike-number-plate-text': { label: 'Plate number', maxChars: 3, pattern: /^[0-9]*$/, hint: 'One to three digits.' },
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
  return PART_IDS.has(`${id}-inlay`) ? [id, `${id}-inlay`] : [id];
}

function optionsFromPrefix(prefix: string): ChoiceOption[] {
  return CAD_MANIFEST.parts
    .filter((p) => p.id.startsWith(prefix) && !p.id.endsWith('-inlay'))
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

export function widgetSpec(handle: string): WidgetSpec | null {
  const product = WIDGET_PRODUCTS.find((p) => p.handle === handle);
  if (product) return productSpec(product);
  const kit = WIDGET_KITS.find((k) => k.handle === handle);
  if (kit) return kitSpec(kit);
  if (handle.startsWith(AC02_HANDLE_PREFIX)) {
    const a = ac02Assembly(handle.slice(AC02_HANDLE_PREFIX.length));
    if (a) return prototypeSpec(a);
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
  const sku = spec.kind === 'kit' ? kitSku(spec, colour.id) : spec.kind === 'prototype' ? `AC02-${spec.handle.slice(AC02_HANDLE_PREFIX.length).toUpperCase()}-${colourShort}` : skuFor(spec);
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
    interface: spec.kind === 'prototype' ? { id: AC02.interfaces.wall, pack: AC02.revision, pitchMm: PITCH_MM } : { id: INTERFACE_ID, pack: CAD_PACK, pitchMm: PITCH_MM },
    purchasing: spec.kind === 'prototype'
      ? { channel: 'shopify', status: 'not_enabled', note: 'AC-02 digital prototype: unprinted, not approved for manufacture, no price. The store must not list it until samples pass.' }
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
