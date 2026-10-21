/**
 * assembl / living — the home range
 * ---------------------------------
 * The house side of the system: shelving, furniture and decor from Kate's AC-02 real-CAD collection (19 October),
 * named for the storefront and pictured from their own CAD previews. Every entry is an AC-02 assembled view, so it
 * opens as a prototype widget (`ac02-<id>`) with its parts, its GLB and no price. Digital prototypes: unprinted, not
 * approved for manufacture, not for sale until samples pass. The Grid wall pieces (shelves, bins, cups, hooks) stay in
 * the catalogue; this list is the rest of the room.
 */

import { AC02_HANDLE_PREFIX, ac02Assembly, type Ac02Assembly } from './ac02';

export type HomeGroup = 'shelving' | 'furniture' | 'decor' | 'desk' | 'everyday';

const HOME: { id: string; name: string; group: HomeGroup }[] = [
  { id: 'small-flatpack-shelf', name: 'flat-pack shelf', group: 'shelving' },
  { id: 'wall-station', name: 'wall station', group: 'shelving' },
  { id: 'tabletop-valet', name: 'tabletop valet', group: 'furniture' },
  { id: 'outfit-valet-research', name: 'outfit valet', group: 'furniture' },
  { id: 'orbit-planter', name: 'orbit planter', group: 'decor' },
  { id: 'pleat-shade-study', name: 'pleat shade', group: 'decor' },
  { id: 'manual-rail-clock', name: 'rail clock', group: 'decor' },
  { id: 'desk-rail-set', name: 'desk rail set', group: 'desk' },
  { id: 'desk-rail-compact', name: 'desk rail, compact', group: 'desk' },
  { id: 'desk-edge-perch', name: 'desk-edge perch', group: 'desk' },
  { id: 'vanity-organisers', name: 'vanity organisers', group: 'everyday' },
  { id: 'pet-walk-kit', name: 'pet walk kit', group: 'everyday' },
];

export type HomeRangeItem = { id: string; handle: string; name: string; group: HomeGroup; line: string; preview: string; view: Ac02Assembly };

/** The home range in storefront order; an id with no AC-02 view is left out rather than shown empty. */
export const HOME_RANGE: HomeRangeItem[] = HOME.flatMap(({ id, name, group }) => {
  const view = ac02Assembly(id);
  return view ? [{ id, handle: `${AC02_HANDLE_PREFIX}${id}`, name, group, line: view.description.toLowerCase(), preview: view.preview, view }] : [];
});
