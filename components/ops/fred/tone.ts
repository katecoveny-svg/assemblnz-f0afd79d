'use client';

/**
 * Tone for the genome/brief demo components: the gated console keeps the
 * flagship's brand skin; the public /living-site tour renders the same
 * components in the pearl direction (design canon vNext).
 */
import { createContext, useContext } from 'react';

export type TonePalette = {
  /** Structural dark — headings, buttons. */
  ink: string;
  /** Soft accent — chips, borders. */
  accent: string;
  /** Deep accent — eyebrows, links. */
  accentDeep: string;
  /** Tinted wash — highlighted panels. */
  wash: string;
  /** Card background. */
  card: string;
  muted: string;
  /** Confirmation gold. */
  gold: string;
  /** The dark hero panel at the top of each component. */
  headerGrad: string;
  headerSub: string;
};

export const TONE_PALETTES: Record<'brand' | 'pearl', TonePalette> = {
  brand: {
    ink: '#1B2A4A',
    accent: '#D4A5B0',
    accentDeep: '#B87A8A',
    wash: '#F7EEF1',
    card: '#FFFCFB',
    muted: '#6B7389',
    gold: '#C4A574',
    headerGrad: 'linear-gradient(135deg, #1B2A4A, #2a3d5c)',
    headerSub: '#D8DEE9',
  },
  pearl: {
    ink: '#26262b',
    accent: '#c2a15f',
    accentDeep: '#b3945a',
    wash: '#f7f7f8',
    card: '#ffffff',
    muted: '#8a8a93',
    gold: '#b3945a',
    headerGrad: 'linear-gradient(135deg, #26262b, #3f3f47)',
    headerSub: '#d9d9de',
  },
};

export type GenomeTone = keyof typeof TONE_PALETTES;

const ToneContext = createContext<TonePalette>(TONE_PALETTES.brand);
export const ToneProvider = ToneContext.Provider;
export function useTone(): TonePalette {
  return useContext(ToneContext);
}
