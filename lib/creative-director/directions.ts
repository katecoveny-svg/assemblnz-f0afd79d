/**
 * Exactly three materially different art directions.
 * Metaphor / composition / motion / type all differ — not colour variants.
 */

import type { ArtDirection, CreativeIntent, DirectionId } from './types';

const DIRECTIONS: Record<DirectionId, (intent: CreativeIntent) => ArtDirection> = {
  'aerial-assembly': (intent) => ({
    id: 'aerial-assembly',
    title: 'Aerial assembly',
    metaphor:
      'A top-down fine-art field: many household signals coordinate into one plan — nature’s flocking, not a corporate network.',
    composition:
      'Minimalist aerial hero, full-bleed. Single table-plane. No cards. Negative space does the hierarchy.',
    motion:
      'Still camera. Fragments drift, align, lock into one object within ~2s. Evidence receipt settles last.',
    type: 'Instrument Sans for the plan name; IBM Plex Mono only for meter readings and timestamps.',
    paletteNote: 'Deep plum ground, paper plan object, dusty-rose active seam, soft chrome edges.',
    registryBlocks: ['aerial-world', 'object-assembly', 'nz-material', 'wait-state'],
    whyDifferent: `Metaphor is flocking/assembly from above — not scroll narrative or object theatre. Fits: ${intent.emotion}.`,
  }),

  'object-world': (intent) => ({
    id: 'object-world',
    title: 'Object world',
    metaphor:
      'One sculptural household object (meter / vessel / plan tablet) becomes the world — intelligence as material, not UI chrome.',
    composition:
      'Centered object on paper void. Macro material detail. Edge-to-edge atmosphere, inset UI forbidden in hero.',
    motion:
      'Object rotates or unfolds layers; internal particles assemble a better plan inside the form.',
    type: 'Quiet Instrument Sans caption under the object; mono for proof ticks only.',
    paletteNote: 'Paper field, plum object mass, heather highlights, chrome rim light.',
    registryBlocks: ['object-assembly', 'particle-field', 'cinema-hero', 'nz-material'],
    whyDifferent: `Single-object theatre — camera orbits the thing, not the landscape. Brand spine: ${intent.brand}.`,
  }),

  'editorial-scroll': (intent) => ({
    id: 'editorial-scroll',
    title: 'Editorial sideways story',
    metaphor:
      'A magazine chapter: sideways chapters of “usage → options → one plan,” read as an assembled essay.',
    composition:
      'Horizontal chapter rail. One idea per chapter viewport. Typography leads; image is a supporting plate.',
    motion:
      'Camera-scroll chapters snap; type locks; plates assemble as you move. Reduced-motion → static chapters.',
    type: 'Expressive Instrument Sans headlines; body in calm weight; mono for evidence strips.',
    paletteNote: 'Chalk/paper chapters, plum ink, dusty-rose chapter markers.',
    registryBlocks: ['sideways-story', 'editorial-type', 'camera-scroll', 'agent-live'],
    whyDifferent: `Typography-led narrative scroll — not aerial field or object macro. Audience: ${intent.audience}.`,
  }),
};

/** Produce exactly three directions from a compiled intent. */
export function inventArtDirections(intent: CreativeIntent): ArtDirection[] {
  return (
    ['aerial-assembly', 'object-world', 'editorial-scroll'] as const
  ).map((id) => DIRECTIONS[id](intent));
}

export function getDirection(
  directions: ArtDirection[],
  id: DirectionId | null,
): ArtDirection | null {
  if (!id) return null;
  return directions.find((d) => d.id === id) ?? null;
}
