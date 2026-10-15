/**
 * Universal background choices, on the plum canon (docs/assembl-brand-system.md).
 * Families that opt in read the ground colour + the text colour from here
 * so a piece re-shot on a different ground stays legible.
 *
 * The ids are kept from the first set (paper white, ink, sea fog) so shared
 * links still resolve: `ink` is now deep plum and `seaFog` is now chalk.
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
    label: 'Paper',
    ground: '#FFFDFB',
    ink: '#492B3E',
    inkSoft: '#654A4E',
  },
  {
    id: 'ink',
    label: 'Plum',
    ground: '#240B21',
    ink: '#F5F1F2',
    inkSoft: '#916A70',
  },
  {
    id: 'seaFog',
    label: 'Chalk',
    ground: '#F5F1F2',
    ink: '#492B3E',
    inkSoft: '#916A70',
  },
];

export function backgroundById(id: BackgroundId | null | undefined): BackgroundSpec | null {
  if (!id) return null;
  return BACKGROUNDS.find((b) => b.id === id) ?? null;
}
