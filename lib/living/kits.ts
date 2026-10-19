/**
 * assembl / living — room kits
 * ----------------------------
 * The seven wall kits come from the launch catalogue (contents and proposed
 * prices in the manifest). This file adds the layout each kit opens with in
 * the Space Studio: the board field and where each accessory sits on the
 * 42 mm grid. A kit is a saved arrangement, not a separate product.
 */

import { CAD_MANIFEST } from './catalogue';
import type { Aesthetic, Field, Kit, SpaceId } from './system';

type Layout = {
  id: string;
  space: SpaceId;
  aesthetic: Aesthetic;
  field: Field;
  placements: { handle: string; col: number; row: number }[];
};

/** Layouts are authored; contents must match the manifest kit lines (tested). */
const LAYOUTS: Record<string, Layout> = {
  'al-kit-teen-room-starter': {
    id: 'teen-room-starter', space: 'my-room', aesthetic: 'contrast', field: { columns: [4, 4], rows: 1 },
    placements: [
      { handle: 'al-name-plate', col: 0, row: 0 },
      { handle: 'al-hook', col: 4, row: 0 }, { handle: 'al-hook', col: 6, row: 0 },
      { handle: 'al-shelf-3', col: 0, row: 1 },
      { handle: 'al-cup', col: 5, row: 1 },
    ],
  },
  'al-kit-gear-wall': {
    id: 'gear-wall', space: 'work-and-create', aesthetic: 'contrast', field: { columns: [4, 4], rows: 1 },
    placements: [
      { handle: 'al-lure-garage', col: 0, row: 1 },
      { handle: 'al-rod-cradle', col: 3, row: 0 }, { handle: 'al-rod-cradle', col: 3, row: 2 },
      { handle: 'al-hook', col: 4, row: 0 }, { handle: 'al-hook', col: 5, row: 0 },
      { handle: 'al-bin-2', col: 4, row: 2 },
    ],
  },
  'al-kit-vanity-lab': {
    id: 'vanity-lab', space: 'my-space', aesthetic: 'warm', field: { columns: [4, 2], rows: 1 },
    placements: [
      { handle: 'al-cup', col: 0, row: 0 }, { handle: 'al-cup', col: 1, row: 0 }, { handle: 'al-cup', col: 2, row: 0 },
      { handle: 'al-shelf-2', col: 4, row: 0 },
      { handle: 'al-bin-2', col: 4, row: 2 },
    ],
  },
  'al-kit-desk-reset': {
    id: 'desk-reset', space: 'work-and-create', aesthetic: 'calm', field: { columns: [4], rows: 1 },
    // Shelf, two cups and a bin fill the board; the hook ships alongside for the desk edge.
    placements: [
      { handle: 'al-shelf-2', col: 0, row: 0 },
      { handle: 'al-cup', col: 2, row: 0 }, { handle: 'al-cup', col: 3, row: 0 },
      { handle: 'al-bin-2', col: 0, row: 2 },
    ],
  },
  'al-kit-workshop-wall': {
    id: 'workshop-wall', space: 'work-and-create', aesthetic: 'calm', field: { columns: [4, 4], rows: 1 },
    placements: [
      { handle: 'al-hook', col: 0, row: 0 }, { handle: 'al-hook', col: 1, row: 0 }, { handle: 'al-hook', col: 2, row: 0 }, { handle: 'al-hook', col: 3, row: 0 },
      { handle: 'al-cup', col: 4, row: 0 }, { handle: 'al-cup', col: 5, row: 0 },
      { handle: 'al-bin-2', col: 0, row: 2 }, { handle: 'al-bin-2', col: 2, row: 2 },
    ],
  },
  'al-kit-entry-and-pets': {
    id: 'entry-and-pets', space: 'pets-and-everyday', aesthetic: 'warm', field: { columns: [4], rows: 1 },
    // Three hooks, a bin and a full-width plate do not all pack onto one board at
    // real footprints; the third hook ships with the kit for the door frame or a
    // second spot and is listed alongside.
    placements: [
      { handle: 'al-name-plate', col: 0, row: 0 },
      { handle: 'al-hook', col: 0, row: 1 }, { handle: 'al-hook', col: 1, row: 1 },
      { handle: 'al-bin-2', col: 2, row: 1 },
    ],
  },
  'al-kit-no-drill-door-wall': {
    id: 'no-drill-door-wall', space: 'store-and-organise', aesthetic: 'calm', field: { columns: [4], rows: 1 },
    placements: [
      { handle: 'al-hook', col: 0, row: 0 }, { handle: 'al-hook', col: 1, row: 0 }, { handle: 'al-hook', col: 2, row: 0 },
      { handle: 'al-cup', col: 3, row: 0 },
    ],
  },
};

export const KITS: Kit[] = CAD_MANIFEST.kits
  .filter((k) => k.collection === 'living' && LAYOUTS[k.handle])
  .map((k) => {
    const layout = LAYOUTS[k.handle];
    const placed = new Map<string, number>();
    for (const p of layout.placements) placed.set(p.handle, (placed.get(p.handle) ?? 0) + 1);
    const extras = k.lines
      .filter((l) => !['al-board-4x4', 'al-board-2x4'].includes(l.handle))
      .map((l) => {
        const onBoard = placed.get(l.handle) ?? 0;
        // cradles and hangers are sold in pairs: one line = two placed items
        const perUnit = l.handle === 'al-rod-cradle' || l.handle === 'al-over-door' || l.handle === 'al-rail-hanger' ? 2 : 1;
        const left = l.qty - Math.ceil(onBoard / perUnit);
        return { handle: l.handle, qty: left };
      })
      .filter((e) => e.qty > 0);
    return {
      id: layout.id,
      handle: k.handle,
      name: k.title,
      note: k.note,
      space: layout.space,
      aesthetic: layout.aesthetic,
      field: layout.field,
      placements: layout.placements,
      extras,
      priceNzd: k.price_nzd,
      status: 'proposed' as const,
    };
  });

const BY_ID = new Map(KITS.map((k) => [k.id, k]));

export function kitById(id: string): Kit | undefined {
  return BY_ID.get(id);
}
