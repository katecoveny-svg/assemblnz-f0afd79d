/**
 * Universal background choices Kate asked for — ink, sea fog, paper white.
 * Families that opt in read the ground colour + the text colour from here
 * so a piece re-shot on a different ground stays legible.
 */

export type BackgroundId = 'paper' | 'ink' | 'seaFog';

export interface BackgroundSpec {
  id: BackgroundId;
  label: string;
  /** Solid ground colour. */
  ground: string;
  /** Ink colour to use for foreground / text against this ground. */
  ink: string;
  /** Softer supporting ink (for edges, less-important marks). */
  inkSoft: string;
}

export const BACKGROUNDS: BackgroundSpec[] = [
  {
    id: 'paper',
    label: 'Paper White',
    ground: '#FBF7EE',
    ink: '#23211F',
    inkSoft: '#5B5049',
  },
  {
    id: 'ink',
    label: 'Ink',
    ground: '#0F1116',
    ink: '#F5F1E8',
    inkSoft: '#8A93A0',
  },
  {
    id: 'seaFog',
    label: 'Sea Fog',
    ground: '#DDE5EA',
    ink: '#1F2A32',
    inkSoft: '#5A6B76',
  },
];

export function backgroundById(id: BackgroundId | null | undefined): BackgroundSpec | null {
  if (!id) return null;
  return BACKGROUNDS.find((b) => b.id === id) ?? null;
}
