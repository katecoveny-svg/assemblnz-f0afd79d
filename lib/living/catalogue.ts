/**
 * assembl / living — parts catalogue
 * ----------------------------------
 * Dimensions, mass, print plan and validation come from the CAD manifest
 * written by `tools/living-cad/build.py`. This file adds the commercial and
 * merchandising layer: what a part is for, where it mounts, what it might
 * cost. Prices are indicative NZD bands and always subject to quotation.
 */

import manifest from './cad-manifest.json';
import {
  CadManifestSchema,
  type CadManifest,
  type CadPart,
  type Foundation,
  type Part,
  type SpaceId,
} from './system';

export const CAD_MANIFEST: CadManifest = CadManifestSchema.parse(manifest);
export const INTERFACE_SPEC = CAD_MANIFEST.interface_spec;
export const CAD_PACK = CAD_MANIFEST.pack;
export const INTERFACE_ID = CAD_MANIFEST.interface;

/** Gap left between adjacent panels so they can be screwed independently. */
export const PANEL_GAP_MM = 8;
export const PANEL_SIZE_MM = INTERFACE_SPEC.pitch_mm * 8;
export const PANEL_CELLS = 8;

function cad(id: string): CadPart {
  const part = CAD_MANIFEST.parts.find((p) => p.id === id);
  if (!part) throw new Error(`assembl/living: CAD manifest has no part "${id}". Re-run tools/living-cad/build.py.`);
  return part;
}

type Commercial = Omit<Part, 'id' | 'cad' | 'foundation' | 'name'> & { name?: string };

function part(id: string, c: Commercial): Part {
  const c3 = cad(id);
  return { ...c, id, name: c.name ?? c3.name, foundation: c3.foundation, cad: c3 };
}

const ALL: SpaceId[] = ['my-room', 'my-space', 'work-and-create', 'store-and-organise', 'pets-and-everyday', 'plants-and-objects'];

export const PARTS: Part[] = [
  part('grid-panel-192', {
    kind: 'panel',
    status: 'prototype',
    description: '192 mm square wall panel, 8 × 8 peg holes, integrated 8 mm standoffs and four countersunk screw holes. Tile up to 2 × 2 panels.',
    mountsOn: [],
    spaces: ALL,
    cues: ['wall', 'pegboard', 'board', 'hang', 'display'],
    priceBand: { lowNzd: 39, highNzd: 59 },
    minQty: 1,
  }),
  part('grid-hook-single', {
    kind: 'hook',
    status: 'prototype',
    description: 'Single hook with a 32 mm reach and an upturned lip. Headsets, keys, cables, lanyards, light tools.',
    footprint: { cols: 1, rows: 2 },
    mountsOn: ['grid', 'rail'],
    spaces: ALL,
    cues: ['headset', 'keys', 'cable', 'cables', 'hang', 'lanyard', 'lead', 'leash', 'necklace', 'bag'],
    priceBand: { lowNzd: 9, highNzd: 12 },
    minQty: 2,
  }),
  part('grid-ledge-96', {
    kind: 'ledge',
    status: 'prototype',
    description: '96 × 60 mm ledge with a front lip. Phone, skincare, a small plant, a controller.',
    footprint: { cols: 4, rows: 2 },
    mountsOn: ['grid'],
    spaces: ['my-room', 'my-space', 'work-and-create', 'plants-and-objects'],
    cues: ['phone', 'shelf', 'skincare', 'plant', 'controller', 'display', 'perfume', 'speaker'],
    priceBand: { lowNzd: 19, highNzd: 29 },
    minQty: 1,
  }),
  part('grid-cup-48', {
    kind: 'cup',
    status: 'prototype',
    description: 'Ø48 × 70 mm cup. Brushes, pens, screwdrivers, lures in sleeves.',
    footprint: { cols: 2, rows: 3 },
    mountsOn: ['grid', 'rail'],
    spaces: ['my-space', 'work-and-create', 'my-room'],
    cues: ['brushes', 'brush', 'pens', 'pencils', 'makeup', 'tools', 'screwdriver', 'lures', 'lure', 'stationery'],
    priceBand: { lowNzd: 14, highNzd: 19 },
    minQty: 1,
  }),
  part('tile-tray-96x96', {
    kind: 'tray',
    status: 'prototype',
    description: 'Open tray on the 96 mm footprint. Drawers, vanities, desks. Joins to its neighbours with tile clips.',
    mountsOn: ['stack'],
    spaces: ['my-space', 'store-and-organise', 'work-and-create', 'my-room'],
    cues: ['drawer', 'tray', 'jewellery', 'jewelry', 'makeup', 'vanity', 'stationery', 'insert', 'divider', 'organise'],
    priceBand: { lowNzd: 19, highNzd: 26 },
    minQty: 1,
  }),
  part('tile-tray-96x48', {
    kind: 'tray',
    status: 'prototype',
    description: 'Half tray on the 96 mm footprint. Lipsticks, rings, earbuds, SD cards, hooks and swivels.',
    mountsOn: ['stack'],
    spaces: ['my-space', 'store-and-organise', 'work-and-create', 'my-room'],
    cues: ['drawer', 'tray', 'lipstick', 'rings', 'earbuds', 'small', 'hooks', 'swivels', 'bits', 'organise'],
    priceBand: { lowNzd: 14, highNzd: 19 },
    minQty: 1,
  }),
  part('tile-clip', {
    kind: 'clip',
    status: 'prototype',
    description: 'H-clip that bridges two adjacent tray walls so a drawer layout stays put.',
    mountsOn: ['tile'],
    spaces: ['my-space', 'store-and-organise', 'work-and-create'],
    cues: ['drawer', 'tray', 'insert'],
    priceBand: { lowNzd: 3, highNzd: 4 },
    minQty: 4,
  }),
  part('stack-riser-192', {
    kind: 'riser',
    status: 'prototype',
    description: '192 × 96 mm riser with two tile bays and 56 mm of clear height underneath. Desk, vanity or bedside.',
    mountsOn: [],
    spaces: ['my-room', 'my-space', 'work-and-create', 'plants-and-objects'],
    cues: ['desk', 'riser', 'monitor', 'vanity', 'bedside', 'shelf', 'stand', 'plants', 'display'],
    priceBand: { lowNzd: 34, highNzd: 49 },
    minQty: 1,
  }),
  part('rail-bar-192', {
    kind: 'rail',
    status: 'prototype',
    description: '192 mm hollow rail with eight peg holes. Hooks and cups where a full panel will not fit: under a shelf, beside a door, inside a wardrobe.',
    mountsOn: [],
    spaces: ['store-and-organise', 'pets-and-everyday', 'work-and-create', 'my-room'],
    cues: ['rail', 'wardrobe', 'door', 'entry', 'leads', 'lead', 'leash', 'narrow', 'under', 'keys'],
    priceBand: { lowNzd: 24, highNzd: 34 },
    minQty: 1,
  }),
];

const BY_ID = new Map(PARTS.map((p) => [p.id, p]));

export function partById(id: string): Part | undefined {
  return BY_ID.get(id);
}

export function requirePart(id: string): Part {
  const p = BY_ID.get(id);
  if (!p) throw new Error(`assembl/living: unknown part "${id}"`);
  return p;
}

export function partsForFoundation(foundation: Foundation): Part[] {
  return PARTS.filter((p) => p.foundation === foundation);
}

/** Accessories that can be placed on a grid panel. */
export function gridAccessories(): Part[] {
  return PARTS.filter((p) => p.footprint && p.mountsOn.includes('grid'));
}

export function partsForSpace(space: SpaceId): Part[] {
  return PARTS.filter((p) => p.spaces.includes(space));
}
