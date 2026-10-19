/**
 * assembl / living — storefront entry points
 * ------------------------------------------
 * Organised by space first, interest second. These are six doors into one
 * catalogue, not six product families. A panel is the same panel in a
 * teenager's room, a workshop or a vanity — the suggested accessories and
 * colourways change.
 */

import type { Aesthetic, SpaceId, Surface } from './system';

export type SpaceEntry = {
  id: SpaceId;
  name: string;
  line: string;
  /** Example situations, in the customer's words. */
  examples: string[];
  /** Surfaces this space usually starts from, most common first. */
  surfaces: Surface[];
  /** Kit ids merchandised under this door. */
  kits: string[];
  defaultAesthetic: Aesthetic;
};

export const SPACE_ENTRIES: SpaceEntry[] = [
  {
    id: 'my-room',
    name: 'my room',
    line: 'Desks, gaming setups, pegboards, shelves, wardrobe storage and the things that make a room yours.',
    examples: ['My desk is covered in cables and controllers', 'Nowhere to put my headset', 'I want a wall that looks like me'],
    surfaces: ['wall', 'desk', 'wardrobe'],
    kits: ['setup-wall', 'quiet-desk'],
    defaultAesthetic: 'contrast',
  },
  {
    id: 'my-space',
    name: 'my space',
    line: 'Vanity, bedside, jewellery, beauty, hobbies, study and everyday essentials.',
    examples: ['Makeup everywhere and no bench space', 'Rings and earrings get lost in the drawer', 'A calm bedside'],
    surfaces: ['vanity', 'drawer', 'wall'],
    kits: ['get-ready-wall', 'vanity-drawer'],
    defaultAesthetic: 'warm',
  },
  {
    id: 'work-and-create',
    name: 'work & create',
    line: 'Home offices, craft spaces, workshops, tech setups and creative studios.',
    examples: ['Tools I use every day are never where I left them', 'A small parts wall for the workbench', 'Pens, tape, scissors, all within reach'],
    surfaces: ['wall', 'desk', 'drawer'],
    kits: ['maker-wall', 'quiet-desk'],
    defaultAesthetic: 'calm',
  },
  {
    id: 'store-and-organise',
    name: 'store & organise',
    line: 'Wardrobes, drawers, cupboards, entryways and small-space storage.',
    examples: ['Keys and sunglasses by the door', 'The junk drawer', 'A wardrobe with no sensible spot for belts'],
    surfaces: ['drawer', 'wardrobe', 'wall'],
    kits: ['vanity-drawer', 'entry-rail'],
    defaultAesthetic: 'calm',
  },
  {
    id: 'pets-and-everyday',
    name: 'pets & everyday',
    line: 'Leads, treats, grooming and the daily kit, within reach and off the bench.',
    examples: ['Leads and poo bags somewhere sensible', 'Grooming brushes off the bathroom bench', 'Treat jar at the door'],
    surfaces: ['wall', 'drawer'],
    kits: ['entry-rail'],
    defaultAesthetic: 'warm',
  },
  {
    id: 'plants-and-objects',
    name: 'plants & objects',
    line: 'Small plants, display stands, decorative storage and small sculptural objects.',
    examples: ['Propagation cuttings off the windowsill', 'A place for the things I like looking at', 'Small shelves, not big ones'],
    surfaces: ['wall', 'desk'],
    kits: ['quiet-desk'],
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
