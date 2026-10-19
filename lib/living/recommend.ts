/**
 * assembl / living — "three ways to improve it"
 * ---------------------------------------------
 * Deterministic proposals from the customer's space, surface, words and
 * aesthetic. The same inputs always assemble the same three designs. Every
 * proposal is `proposed`; none has read a photograph.
 */

import { gridAccessories, productByHandle, productsForSpace } from './catalogue';
import { canPlace, gridSize, newDesign, placementId } from './design';
import { kitById } from './kits';
import { requireSpace } from './spaces';
import type { Aesthetic, Placement, Product, SpaceDesign, SpaceId, Surface } from './system';

export type ProposalId = 'minimal' | 'system' | 'expressive';
export type Proposal = { id: ProposalId; title: string; summary: string; why: string[]; design: SpaceDesign };

export type Understanding = {
  needs: string[];
  matchedProducts: Product[];
  surface: Surface;
  keep: string[];
  noDrill: boolean;
  photoAnalysisAvailable: false;
};

const STOP = new Set(['the', 'a', 'an', 'and', 'my', 'is', 'are', 'in', 'on', 'of', 'to', 'i', 'it', 'for', 'with', 'no', 'all', 'at', 'not']);

export function tokenise(text: string): string[] {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w));
}

export function understand(input: { space: SpaceId; surface: Surface; need: string; keep: string[] }): Understanding {
  const words = new Set(tokenise(input.need));
  const w = (...xs: string[]) => xs.some((x) => words.has(x));
  const scored = productsForSpace(input.space)
    .map((p) => ({ p, score: p.cues.filter((c) => words.has(c)).length }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.p.handle.localeCompare(b.p.handle));

  const noDrill = w('rent', 'renting', 'landlord', 'drill', 'holes', 'flat', 'hostel', 'dorm') || input.surface === 'door' || input.surface === 'wardrobe';
  const needs: string[] = [];
  if (w('cable', 'cables', 'chargers', 'charger', 'headphones', 'headset')) needs.push('Cables, chargers and headphones need a home off the desk: hooks and a bin.');
  if (w('makeup', 'brushes', 'brush', 'skincare', 'lipstick', 'palette')) needs.push('Beauty things want to stand upright where you can see them: cups and a shelf.');
  if (w('keys', 'lead', 'leads', 'leash', 'bag', 'bags', 'caps', 'cap')) needs.push('Grab-and-go things belong at eye level by the door: hooks and a name plate.');
  if (w('tools', 'pliers', 'screwdriver', 'bits', 'parts', 'workshop')) needs.push('Tools used every day should be seen, not stored: hooks, cups and bins.');
  if (w('lure', 'lures', 'tackle', 'hooks', 'rod', 'rods', 'fishing')) needs.push('Tackle needs slots with the hooks inside the walls, and rods want cradles.');
  if (w('drawer', 'drawers')) needs.push('The drawer wants a tray sized to it, or pockets cut to the things you own.');
  if (w('plant', 'plants', 'cuttings', 'perfume')) needs.push('Small things you look at want a shelf with a lip.');
  if (w('clutter', 'cluttered', 'mess', 'messy', 'everywhere', 'pile')) needs.push('The surface is doing too many jobs. Move the small things up onto a board.');
  if (w('name', 'mine', 'personal')) needs.push('A name plate makes it theirs.');
  if (noDrill) needs.push('No drilling: hang the board over a door or from the wardrobe rail, and keep it to light things.');
  if (needs.length === 0) needs.push(`Make the ${input.surface} easier to use with fewer loose things on it.`);

  return { needs, matchedProducts: scored.map((s) => s.p), surface: input.surface, keep: input.keep, noDrill, photoAnalysisAvailable: false };
}

function fill(design: SpaceDesign, handles: string[]): SpaceDesign {
  const placements: Placement[] = [...design.placements];
  const { cols, rows } = gridSize(design);
  for (const handle of handles) {
    const product = productByHandle(handle);
    if (!product?.footprint) continue;
    let placed = false;
    for (let r = 0; r < rows && !placed; r++) {
      for (let c = 0; c < cols && !placed; c++) {
        const candidate: Placement = { id: placementId(), handle, col: c, row: r };
        if (canPlace({ field: design.field, placements }, candidate)) {
          placements.push(candidate);
          placed = true;
        }
      }
    }
  }
  return { ...design, placements };
}

function preferredAccessories(space: SpaceId, understanding: Understanding): string[] {
  const grid = new Set(gridAccessories().map((p) => p.handle));
  const matched = understanding.matchedProducts.filter((p) => grid.has(p.handle)).map((p) => p.handle);
  const defaults: Record<SpaceId, string[]> = {
    'my-room': ['al-hook', 'al-hook', 'al-shelf-2', 'al-cup', 'al-bin-2'],
    'my-space': ['al-cup', 'al-cup', 'al-shelf-2', 'al-bin-2', 'al-hook'],
    'work-and-create': ['al-hook', 'al-hook', 'al-cup', 'al-bin-2', 'al-shelf-2'],
    'store-and-organise': ['al-hook', 'al-hook', 'al-hook', 'al-bin-2'],
    'pets-and-everyday': ['al-hook', 'al-hook', 'al-bin-2', 'al-name-plate'],
    'plants-and-objects': ['al-shelf-2', 'al-shelf-2', 'al-hook', 'al-cup'],
  };
  return [...matched, ...defaults[space]];
}

export function recommend(input: { space: SpaceId; surface: Surface; need: string; keep: string[]; aesthetic: Aesthetic; now?: string }): Proposal[] {
  const understanding = understand(input);
  const entry = requireSpace(input.space);
  const base = () => newDesign({ ...input, origin: 'proposal' });
  const accessories = preferredAccessories(input.space, understanding);
  const drawer = input.surface === 'drawer';
  const hanger = input.surface === 'wardrobe' ? 'al-rail-hanger' : 'al-over-door';

  /* 1 · minimal refresh — a single board with three accessories, or a made-to-measure tray. */
  let minimal: SpaceDesign = base();
  if (drawer) {
    minimal = { ...minimal, extras: [{ handle: 'al-tray-custom', qty: 1 }] };
  } else {
    minimal = fill(minimal, accessories.slice(0, 3));
    if (understanding.noDrill) minimal = { ...minimal, extras: [{ handle: hanger, qty: 1 }] };
  }

  /* 2 · full organisation system — two boards filled from what was said. */
  let system: SpaceDesign = { ...base(), field: { columns: [4, 4], rows: 1 } };
  if (drawer) {
    system = { ...system, field: { columns: [4], rows: 1 }, extras: [{ handle: 'al-tray-custom', qty: 2 }, { handle: 'al-tray-cutout', qty: 1 }] };
  } else {
    system = fill(system, accessories.slice(0, 7));
    system = { ...system, extras: understanding.noDrill ? [{ handle: hanger, qty: 1 }] : [{ handle: 'al-tray-custom', qty: 1 }] };
  }

  /* 3 · expressive — the first kit for this door, in the expressive aesthetic, with a name plate. */
  const kit = kitById(entry.kits[0]) ?? kitById('teen-room-starter')!;
  let expressive: SpaceDesign = {
    ...base(),
    aesthetic: 'expressive',
    boardColour: 'sage',
    accessoryColour: 'plum',
    field: { columns: [...kit.field.columns], rows: kit.field.rows },
    placements: kit.placements.map((p) => ({ ...p, id: placementId() })),
    extras: kit.extras.map((e) => ({ ...e })),
  };
  if (!expressive.placements.some((p) => p.handle === 'al-name-plate')) {
    const withPlate = fill(expressive, ['al-name-plate']);
    expressive = withPlate;
  }
  if (understanding.noDrill && !expressive.extras.some((e) => e.handle === hanger)) {
    expressive = { ...expressive, field: { columns: [4], rows: 1 }, placements: [], extras: [{ handle: hanger, qty: 1 }] };
    expressive = fill(expressive, [...accessories.slice(0, 3), 'al-name-plate']);
  }
  if (drawer) {
    expressive = { ...expressive, field: { columns: [4], rows: 1 }, placements: [], extras: [{ handle: 'al-tray-cutout', qty: 1 }, { handle: 'al-tray-custom', qty: 1 }] };
  }

  return [
    { id: 'minimal', title: 'minimal refresh', summary: drawer ? 'One tray sized to the drawer.' : 'One board and the three accessories that matter most.', why: [understanding.needs[0], 'Start small; every later accessory locks onto the same board.'], design: minimal },
    { id: 'system', title: 'full organisation system', summary: drawer ? 'Two measured trays and a cut-out tray for the things you use most.' : 'Two boards filled from what you told us.', why: [...understanding.needs.slice(0, 2), 'Every part uses the same 42 mm grid and TURN key, so nothing here is a dead end.'], design: system },
    { id: 'expressive', title: 'expressive layout', summary: `${kit.name.toLowerCase()}, in sage and plum, with a name plate.`, why: [kit.note, 'Swap colourways any time; the parts do not change.'], design: expressive },
  ];
}
