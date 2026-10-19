/**
 * assembl / living — catalogue
 * ----------------------------
 * The generated manifest (`cad-manifest.json`, written by
 * `tools/living-cad/manifest.py`) carries every print file, product, kit,
 * colour and price. This file adds what the Space Studio needs to reason:
 * which foundation a product belongs to, where it mounts, how many grid
 * cells it takes and which words make it relevant.
 */

import manifest from './cad-manifest.json';
import { CadManifestSchema, type CadManifest, type Colour, type Colourway, type Foundation, type Mount, type PrintFile, type Product, type ProductKind, type SpaceId } from './system';

export const CAD_MANIFEST: CadManifest = CadManifestSchema.parse(manifest);
export const INTERFACE_SPEC = CAD_MANIFEST.interface_spec;
export const CAD_PACK = CAD_MANIFEST.pack;
export const INTERFACE_ID = CAD_MANIFEST.interface;

/** TURN grid: 42 mm pitch; a 4×4 board is 168 mm; boards butt edge to edge so the grid runs on across them. */
export const PITCH_MM = INTERFACE_SPEC.pitch_mm;
export const BOARD_CELLS = 4;
export const BOARD_MM = PITCH_MM * BOARD_CELLS;
export const BOARD_GAP_MM = 0;

const PRINT_BY_ID = new Map(CAD_MANIFEST.parts.map((p) => [p.id, p]));
export function printFile(id: string): PrintFile {
  const p = PRINT_BY_ID.get(id);
  if (!p) throw new Error(`assembl/living: unknown print file "${id}"`);
  return p;
}

export const LIVING_COLOURS: Colour[] = CAD_MANIFEST.colours.living;
export const DAYRALLY_COLOURS: Colour[] = CAD_MANIFEST.colours.dayrally;
export function colourHex(id: Colourway): string {
  return LIVING_COLOURS.find((c) => c.id === id)?.hex ?? '#F1ECE3';
}
export function colourName(id: Colourway): string {
  return LIVING_COLOURS.find((c) => c.id === id)?.name ?? id;
}
/** Text colour that reads on a colourway. */
export function colourInk(id: Colourway): string {
  return ['plum', 'ink', 'clay'].includes(id) ? '#FFFDFB' : '#492B3E';
}

const ALL: SpaceId[] = ['my-room', 'my-space', 'work-and-create', 'store-and-organise', 'pets-and-everyday', 'plants-and-objects'];

type Semantics = {
  foundation: Foundation;
  kind: ProductKind;
  footprint?: { cols: number; rows: number };
  perUnit?: number;
  mount: Mount;
  spaces: SpaceId[];
  cues: string[];
};

/**
 * Footprints are in 42 mm cells, counted from the accessory's key row downward,
 * from the installed geometry in `lib.py`: a hook is a key above a locator nub
 * (1 × 2); a 2-wide shelf has two keys and drops 40 mm below them (2 × 2); the
 * cup runs 104 mm from its key (1 × 3); the lure garage is three keys wide and
 * 104 mm tall (3 × 3); the name plate is four cells wide and one tall.
 */
const SEMANTICS: Record<string, Semantics> = {
  'al-board-4x4': { foundation: 'grid', kind: 'board', mount: 'wall', spaces: ALL, cues: ['wall', 'board', 'pegboard', 'tile', 'hang'] },
  'al-board-2x4': { foundation: 'grid', kind: 'half-board', mount: 'wall', spaces: ALL, cues: ['narrow', 'gap', 'half'] },
  'al-hook': { foundation: 'grid', kind: 'hook', footprint: { cols: 1, rows: 2 }, mount: 'grid', spaces: ALL, cues: ['bag', 'bags', 'headphones', 'headset', 'cap', 'caps', 'lead', 'leads', 'leash', 'keys', 'cables', 'cable', 'hang', 'lanyard', 'towel'] },
  'al-rod-cradle': { foundation: 'grid', kind: 'cradle', footprint: { cols: 1, rows: 2 }, perUnit: 2, mount: 'grid', spaces: ['work-and-create', 'my-room', 'store-and-organise'], cues: ['rod', 'rods', 'fishing', 'display'] },
  'al-shelf-2': { foundation: 'grid', kind: 'shelf', footprint: { cols: 2, rows: 2 }, mount: 'grid', spaces: ALL, cues: ['phone', 'plant', 'perfume', 'reels', 'shelf', 'skincare', 'speaker', 'display'] },
  'al-shelf-3': { foundation: 'grid', kind: 'shelf', footprint: { cols: 3, rows: 2 }, mount: 'grid', spaces: ['my-room', 'work-and-create', 'plants-and-objects', 'my-space'], cues: ['books', 'speakers', 'bottles', 'shelf', 'row', 'display'] },
  'al-bin-2': { foundation: 'grid', kind: 'bin', footprint: { cols: 2, rows: 2 }, mount: 'grid', spaces: ALL, cues: ['chargers', 'charger', 'hair', 'ties', 'tackle', 'keys', 'bin', 'bits', 'small', 'clutter', 'cluttered'] },
  'al-cup': { foundation: 'grid', kind: 'cup', footprint: { cols: 1, rows: 3 }, mount: 'grid', spaces: ['my-space', 'work-and-create', 'my-room', 'plants-and-objects'], cues: ['brushes', 'brush', 'pens', 'pencils', 'pliers', 'makeup', 'tools', 'screwdriver', 'stationery', 'cutlery'] },
  'al-lure-garage': { foundation: 'grid', kind: 'garage', footprint: { cols: 3, rows: 3 }, mount: 'grid', spaces: ['work-and-create', 'store-and-organise', 'my-room'], cues: ['lure', 'lures', 'tackle', 'hooks', 'fishing'] },
  'al-name-plate': { foundation: 'grid', kind: 'plate', footprint: { cols: 4, rows: 1 }, mount: 'grid', spaces: ['my-room', 'pets-and-everyday', 'my-space'], cues: ['name', 'mine', 'teen', 'kid', 'kids', 'room', 'personal', 'personalised'] },
  'al-keys-6': { foundation: 'grid', kind: 'keys', mount: 'grid', spaces: ALL, cues: ['keys', 'spare'] },
  'al-board-renter': { foundation: 'renter', kind: 'renter-board', mount: 'wall', spaces: ALL, cues: ['rent', 'renting', 'landlord', 'strips', 'adhesive', 'drill', 'holes'] },
  'al-over-door': { foundation: 'renter', kind: 'door-hanger', perUnit: 2, mount: 'door', spaces: ['store-and-organise', 'my-room', 'pets-and-everyday', 'my-space'], cues: ['door', 'rent', 'renting', 'landlord', 'drill', 'holes', 'flat', 'hostel', 'dorm'] },
  'al-rail-hanger': { foundation: 'renter', kind: 'rail-hanger', perUnit: 2, mount: 'rail', spaces: ['store-and-organise', 'my-space'], cues: ['wardrobe', 'rail', 'closet', 'belts', 'scarves'] },
  'al-node-corner': { foundation: 'stack', kind: 'node', mount: 'dowel', spaces: ['work-and-create', 'my-room', 'plants-and-objects', 'store-and-organise'], cues: ['shelf', 'shelving', 'frame', 'furniture', 'dowel', 'stand', 'rack', 'build'] },
  'al-node-tee': { foundation: 'stack', kind: 'node', mount: 'dowel', spaces: ['work-and-create', 'my-room', 'plants-and-objects', 'store-and-organise'], cues: ['shelf', 'shelving', 'frame', 'furniture', 'dowel', 'rack', 'build'] },
  'al-foot': { foundation: 'stack', kind: 'foot', mount: 'dowel', spaces: ['work-and-create', 'my-room', 'plants-and-objects', 'store-and-organise'], cues: ['dowel', 'furniture', 'post'] },
  'al-shade-fold': { foundation: 'light', kind: 'shade', mount: 'cord-set', spaces: ['my-room', 'plants-and-objects', 'my-space'], cues: ['light', 'lamp', 'pendant', 'shade', 'lighting'] },
};

/** Made-to-measure tile parts are not in the launch CSV; they are quoted per order from the sample files. */
const MADE_TO_MEASURE: Product[] = [
  {
    handle: 'al-tray-custom', short: 'TRY', title: 'Drawer tray, made to measure', blurb: 'Sized to the inside of your drawer, with the dividers you choose. Sample files show 3×2, 2×1 and 1×1 layouts.',
    size: 'up to 240 × 245 × 50 mm', material: 'PLA Matte', type: 'Tile · drawer', personalised: false, colours: 'living', price_nzd: 0, ship_g: 220,
    parts: [{ id: 'tile-tray-3x2', qty: 1 }], costing: null, skus: [],
    foundation: 'tile', kind: 'tray', mount: 'surface', perUnit: 1, spaces: ['my-space', 'store-and-organise', 'work-and-create', 'my-room'], cues: ['drawer', 'drawers', 'tray', 'divider', 'dividers', 'jewellery', 'jewelry', 'cutlery', 'stationery', 'organise'], priceNzd: null,
  },
  {
    handle: 'al-tray-cutout', short: 'CUT', title: 'Cut-out tray, made to your things', blurb: 'A pocket shaped for each item you own, with a finger scoop. The sample is a vanity drawer: lipsticks, a compact, mascara, a brush, a palette, perfume.',
    size: 'up to 240 × 245 × 24 mm', material: 'PLA Matte', type: 'Tile · drawer', personalised: true, colours: 'living', price_nzd: 0, ship_g: 320,
    parts: [{ id: 'tile-cutout-vanity', qty: 1 }], costing: null, skus: [],
    foundation: 'tile', kind: 'cutout', mount: 'surface', perUnit: 1, spaces: ['my-space', 'store-and-organise', 'work-and-create'], cues: ['makeup', 'lipstick', 'palette', 'vanity', 'perfume', 'compact', 'pockets', 'cutout', 'fitted', 'exact'], priceNzd: null,
  },
];

export const PRODUCTS: Product[] = [
  ...CAD_MANIFEST.products
    .filter((p) => SEMANTICS[p.handle])
    .map((p) => {
      const s = SEMANTICS[p.handle];
      return { ...p, ...s, perUnit: s.perUnit ?? 1, priceNzd: p.price_nzd };
    }),
  ...MADE_TO_MEASURE,
];

const BY_HANDLE = new Map(PRODUCTS.map((p) => [p.handle, p]));

export function productByHandle(handle: string): Product | undefined {
  return BY_HANDLE.get(handle);
}

export function requireProduct(handle: string): Product {
  const p = BY_HANDLE.get(handle);
  if (!p) throw new Error(`assembl/living: unknown product "${handle}"`);
  return p;
}

export function productsForFoundation(foundation: Foundation): Product[] {
  return PRODUCTS.filter((p) => p.foundation === foundation);
}

/** Accessories that lock onto a board and take grid cells. */
export function gridAccessories(): Product[] {
  return PRODUCTS.filter((p) => p.footprint && p.mount === 'grid');
}

/** Everything else a design can add alongside the board: renter hangers, trays, dowel joints, the shade, spare keys. */
export function alongsideProducts(): Product[] {
  return PRODUCTS.filter((p) => !p.footprint && !['board', 'half-board'].includes(p.kind));
}

export function productsForSpace(space: SpaceId): Product[] {
  return PRODUCTS.filter((p) => p.spaces.includes(space));
}

/** Dayrally and bike products stay a separate collection: same TURN key, not part of the wall configurator. */
export const DAYRALLY_PRODUCTS = CAD_MANIFEST.products.filter((p) => p.colours === 'dayrally');
export const DAYRALLY_KITS = CAD_MANIFEST.kits.filter((k) => k.collection === 'dayrally');
export const TEST_KIT = CAD_MANIFEST.test_kit;

/* ────────────────────────────────────────────── part codes */

const COLOUR_SHORT: Record<string, string> = { chalk: 'CHA', oat: 'OAT', sage: 'SAG', clay: 'CLA', plum: 'PLU', ash: 'ASH', ink: 'INK', natural: 'NAT' };

/** Check letter over `PART-COL`, alphabet without 0, O, 1, I, so a mistyped reorder code is caught. */
export function checkChar(body: string): string {
  const alph = CAD_MANIFEST.part_code_alphabet;
  let sum = 0;
  for (let i = 0; i < body.length; i++) sum += (i + 1) * body.charCodeAt(i);
  return alph[sum % alph.length];
}

export function partCode(product: Pick<Product, 'short'>, colour: Colourway | 'natural'): string | null {
  if (!product.short) return null;
  const body = `${product.short}-${COLOUR_SHORT[colour] ?? colour.slice(0, 3).toUpperCase()}`;
  return `AL-${body}-${checkChar(body)}`;
}
