/**
 * Visual targets + construct grammar for Creative Director PREVIEW.
 * Placeholders are DEMO-honest.
 */

import type {
  ArtDirection,
  ConstructChoice,
  ConstructGrammar,
  VisualTarget,
} from './types';

export function buildVisualTargets(direction: ArtDirection): VisualTarget[] {
  return [
    {
      kind: 'desktop-hero',
      label: 'Desktop hero',
      placeholder: `DEMO plate · ${direction.title} · 1440×900`,
      demoNote:
        'Full-bleed hero plane. One idea. No card grid. Screenshot loop can replace this plate later.',
    },
    {
      kind: 'mobile-hero',
      label: 'Mobile hero',
      placeholder: `DEMO plate · ${direction.title} · 390×844`,
      demoNote: 'Same idea, tighter crop. Brand still hero-level without nav.',
    },
    {
      kind: 'key-interaction',
      label: 'Key interaction',
      placeholder: `DEMO · ${direction.registryBlocks[0] ?? 'block'} interaction`,
      demoNote: direction.composition,
    },
    {
      kind: 'motion-storyboard',
      label: 'Motion storyboard',
      placeholder: 'DEMO · 3-beat board (scatter → coordinate → one)',
      demoNote: direction.motion,
    },
  ];
}

export const CONSTRUCT_CHOICES: ConstructChoice[] = [
  {
    id: 'editorial-css-gsap',
    label: 'Editorial CSS / GSAP',
    summary:
      'Typographic chapters, scroll-linked assembly, paper/plum craft. Fastest path for sideways-story and editorial-type.',
    stack: ['Next.js', 'CSS', 'GSAP / CraftScroll', '@assembl/editorial-type'],
    registryBlocks: ['editorial-type', 'sideways-story', 'camera-scroll', 'nz-material'],
  },
  {
    id: 'cinematic-video',
    label: 'Cinematic video',
    summary:
      'Authored film hero with still-camera assembly. Use when motion must carry the idea before interaction.',
    stack: ['Remotion / authored MP4', 'poster fallback', '@assembl/cinema-hero'],
    registryBlocks: ['cinema-hero', 'wait-state', 'nz-material'],
  },
  {
    id: 'spatial-r3f',
    label: 'Spatial R3F',
    summary:
      'Three/R3F world: aerial field or object assembly with real depth. Heavier, most “world”-like.',
    stack: ['React Three Fiber', 'Drei', '@assembl/aerial-world', '@assembl/object-assembly'],
    registryBlocks: ['aerial-world', 'object-assembly', 'particle-field', 'nz-material'],
  },
];

/** Suggest a construct grammar from the chosen direction. */
export function suggestConstruct(direction: ArtDirection): ConstructGrammar {
  switch (direction.id) {
    case 'editorial-scroll':
      return 'editorial-css-gsap';
    case 'object-world':
      return 'spatial-r3f';
    case 'aerial-assembly':
    default:
      return 'cinematic-video';
  }
}

export function getConstructChoice(id: ConstructGrammar | null): ConstructChoice | null {
  if (!id) return null;
  return CONSTRUCT_CHOICES.find((c) => c.id === id) ?? null;
}
