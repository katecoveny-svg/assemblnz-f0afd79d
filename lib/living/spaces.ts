/**
 * assembl / living — storefront entry points
 * ------------------------------------------
 * Six doors into one catalogue. A board is the same board in a teenager's
 * room, a workshop or a vanity; the suggested accessories, kits and colours
 * change.
 */

import type { Aesthetic, SpaceId, Surface } from './system';

export type SpaceEntry = {
  id: SpaceId;
  name: string;
  line: string;
  examples: string[];
  surfaces: Surface[];
  /** Kit ids merchandised under this door, best fit first. */
  kits: string[];
  defaultAesthetic: Aesthetic;
};

export const SPACE_ENTRIES: SpaceEntry[] = [
  {
    id: 'my-room',
    name: 'my room',
    line: 'Desks, gaming setups, a wall with your name on it, wardrobe storage and the things that make a room yours.',
    examples: ['My desk is covered in cables and headphones', 'A wall with my name on it', 'Caps and bags on the floor'],
    surfaces: ['wall', 'door', 'desk'],
    kits: ['teen-room-starter', 'desk-reset', 'no-drill-door-wall'],
    defaultAesthetic: 'contrast',
  },
  {
    id: 'my-space',
    name: 'my space',
    line: 'Vanity, bedside, jewellery, beauty, claw clips and everyday essentials.',
    examples: ['Makeup everywhere and no bench space', 'Brushes, skincare, claw clips', 'A drawer that fits exactly what I own'],
    surfaces: ['wall', 'vanity', 'drawer'],
    kits: ['vanity-lab', 'desk-reset'],
    defaultAesthetic: 'warm',
  },
  {
    id: 'work-and-create',
    name: 'work & create',
    line: 'Home offices, craft benches, workshops, tackle and the tools you reach for every day.',
    examples: ['Hand tools in reach, not in a drawer', 'Lures, rods, tackle, hooks stay boxed', 'Headphones, chargers, pens'],
    surfaces: ['wall', 'desk', 'drawer'],
    kits: ['workshop-wall', 'gear-wall', 'desk-reset'],
    defaultAesthetic: 'calm',
  },
  {
    id: 'store-and-organise',
    name: 'store & organise',
    line: 'Entryways, wardrobes, drawers and the back of a door. Renting is not a problem.',
    examples: ['Keys and leads by the door', 'I rent and cannot drill', 'A wardrobe with no sensible spot for belts'],
    surfaces: ['door', 'wardrobe', 'wall', 'drawer'],
    kits: ['no-drill-door-wall', 'entry-and-pets'],
    defaultAesthetic: 'calm',
  },
  {
    id: 'pets-and-everyday',
    name: 'pets & everyday',
    line: 'Leads, bags, keys and a name, within reach and off the bench.',
    examples: ['Leads and poo bags somewhere sensible', 'The dog’s name on the wall', 'Treat jar at the door'],
    surfaces: ['wall', 'door'],
    kits: ['entry-and-pets', 'no-drill-door-wall'],
    defaultAesthetic: 'warm',
  },
  {
    id: 'plants-and-objects',
    name: 'plants & objects',
    line: 'Small plants, perfume, reels, speakers and a shade for the pendant.',
    examples: ['Propagation cuttings off the windowsill', 'A place for the things I like looking at', 'A warm light over the desk'],
    surfaces: ['wall', 'desk'],
    kits: ['desk-reset', 'teen-room-starter'],
    defaultAesthetic: 'warm',
  },
];

const BY_ID = new Map(SPACE_ENTRIES.map((s) => [s.id, s]));

export function spaceById(id: string): SpaceEntry | undefined {
  return BY_ID.get(id as SpaceId);
}

export function requireSpace(id: SpaceId): SpaceEntry {
  const s = BY_ID.get(id);
  if (!s) throw new Error(`assembl/living: unknown space "${id}"`);
  return s;
}
