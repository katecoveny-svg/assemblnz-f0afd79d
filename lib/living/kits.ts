/**
 * assembl / living — curated kits
 * -------------------------------
 * Kits are the merchandising layer, not separate products. Every kit is a
 * saved arrangement of the same parts on the same interface. Someone can buy
 * the get-ready wall and later add gaming accessories to it.
 *
 * All kits are `indicative`: no kit has been quoted, printed as a set or
 * tested in a room yet.
 */

import type { Kit } from './system';

export const KITS: Kit[] = [
  {
    id: 'setup-wall',
    name: 'the setup wall',
    tagline: 'Headset, controllers, cables and a shelf for the things you look at.',
    description: 'A single panel beside the desk. Two hooks for the headset and cable loom, a cup for pens and a ledge for a controller or speaker.',
    space: 'my-room',
    aesthetic: 'contrast',
    panels: { cols: 1, rows: 1 },
    placements: [
      { partId: 'grid-hook-single', col: 0, row: 0 },
      { partId: 'grid-hook-single', col: 2, row: 0 },
      { partId: 'grid-cup-48', col: 5, row: 0 },
      { partId: 'grid-ledge-96', col: 0, row: 4 },
      { partId: 'grid-hook-single', col: 6, row: 4 },
    ],
    extras: [],
    status: 'indicative',
  },
  {
    id: 'get-ready-wall',
    name: 'the get-ready wall',
    tagline: 'Brushes up, skincare on a ledge, jewellery on hooks.',
    description: 'Two panels side by side above the vanity. Cups for brushes, a ledge for skincare, hooks for necklaces, and a half tray for rings on the bench.',
    space: 'my-space',
    aesthetic: 'warm',
    panels: { cols: 2, rows: 1 },
    placements: [
      { partId: 'grid-cup-48', col: 0, row: 0 },
      { partId: 'grid-cup-48', col: 2, row: 0 },
      { partId: 'grid-ledge-96', col: 4, row: 0 },
      { partId: 'grid-hook-single', col: 9, row: 0 },
      { partId: 'grid-hook-single', col: 11, row: 0 },
      { partId: 'grid-hook-single', col: 13, row: 0 },
      { partId: 'grid-ledge-96', col: 0, row: 5 },
      { partId: 'grid-ledge-96', col: 10, row: 5 },
    ],
    extras: [{ partId: 'tile-tray-96x48', qty: 2 }, { partId: 'tile-clip', qty: 4 }],
    status: 'indicative',
  },
  {
    id: 'maker-wall',
    name: 'the maker wall',
    tagline: 'Everyday tools where you can see them.',
    description: 'A 2 × 2 panel field above the bench. Hooks for pliers and tape, cups for screwdrivers and markers, a ledge for the things in progress.',
    space: 'work-and-create',
    aesthetic: 'calm',
    panels: { cols: 2, rows: 2 },
    placements: [
      { partId: 'grid-hook-single', col: 0, row: 0 },
      { partId: 'grid-hook-single', col: 2, row: 0 },
      { partId: 'grid-hook-single', col: 4, row: 0 },
      { partId: 'grid-hook-single', col: 6, row: 0 },
      { partId: 'grid-cup-48', col: 9, row: 0 },
      { partId: 'grid-cup-48', col: 12, row: 0 },
      { partId: 'grid-ledge-96', col: 0, row: 5 },
      { partId: 'grid-ledge-96', col: 8, row: 5 },
      { partId: 'grid-hook-single', col: 0, row: 10 },
      { partId: 'grid-hook-single', col: 2, row: 10 },
      { partId: 'grid-cup-48', col: 5, row: 10 },
      { partId: 'grid-cup-48', col: 9, row: 10 },
      { partId: 'grid-ledge-96', col: 12, row: 13 },
    ],
    extras: [],
    status: 'indicative',
  },
  {
    id: 'tackle-wall',
    name: 'the tackle wall',
    tagline: 'Lures in cups, leaders on hooks, small parts in trays.',
    description: 'One panel in the garage or shed. Cups for sleeved lures, hooks for leader spools and pliers, and two half trays on a riser below for swivels and hooks. The adventure-facing companion to Dayrally.',
    space: 'work-and-create',
    aesthetic: 'contrast',
    panels: { cols: 1, rows: 1 },
    placements: [
      { partId: 'grid-cup-48', col: 0, row: 0 },
      { partId: 'grid-cup-48', col: 2, row: 0 },
      { partId: 'grid-hook-single', col: 5, row: 0 },
      { partId: 'grid-hook-single', col: 7, row: 0 },
      { partId: 'grid-hook-single', col: 0, row: 4 },
      { partId: 'grid-ledge-96', col: 2, row: 5 },
    ],
    extras: [{ partId: 'stack-riser-192', qty: 1 }, { partId: 'tile-tray-96x48', qty: 2 }, { partId: 'tile-clip', qty: 4 }],
    status: 'indicative',
  },
  {
    id: 'quiet-desk',
    name: 'the quiet desk',
    tagline: 'A riser, two trays, nothing on the wall.',
    description: 'For renters and anyone who does not want to drill. A riser under the monitor or beside the bed with two trays in its bays.',
    space: 'work-and-create',
    aesthetic: 'calm',
    panels: { cols: 1, rows: 1 },
    placements: [],
    extras: [{ partId: 'stack-riser-192', qty: 1 }, { partId: 'tile-tray-96x96', qty: 2 }],
    status: 'indicative',
  },
  {
    id: 'vanity-drawer',
    name: 'the vanity drawer',
    tagline: 'A drawer that stays the way you set it.',
    description: 'Two full trays and four half trays clipped into a layout. Measured to the drawer, printed to fit.',
    space: 'my-space',
    aesthetic: 'warm',
    panels: { cols: 1, rows: 1 },
    placements: [],
    extras: [{ partId: 'tile-tray-96x96', qty: 2 }, { partId: 'tile-tray-96x48', qty: 4 }, { partId: 'tile-clip', qty: 8 }],
    status: 'indicative',
  },
  {
    id: 'entry-rail',
    name: 'the entry rail',
    tagline: 'Keys, leads and sunglasses by the door.',
    description: 'One rail and four hooks. Fits beside a door frame or inside a wardrobe where a panel will not.',
    space: 'store-and-organise',
    aesthetic: 'calm',
    panels: { cols: 1, rows: 1 },
    placements: [],
    extras: [{ partId: 'rail-bar-192', qty: 1 }, { partId: 'grid-hook-single', qty: 4 }],
    status: 'indicative',
  },
];

const BY_ID = new Map(KITS.map((k) => [k.id, k]));

export function kitById(id: string): Kit | undefined {
  return BY_ID.get(id);
}

/** Kits that do not need a panel on the wall. */
export function kitNeedsPanel(kit: Kit): boolean {
  return kit.placements.length > 0;
}
