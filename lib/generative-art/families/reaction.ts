import type { Family, FamilyPreset } from '../families';

/**
 * Gray-Scott reaction-diffusion palettes. Two colour stops per palette:
 * `low` shades regions where chemical B is scarce, `high` where it accumulates
 * into the pattern. The ground is only visible during warmup.
 */
export interface ReactionPalette {
  ground: string;
  low: string;
  high: string;
  edge: string;
}

export const REACTION_PALETTES: Record<string, ReactionPalette> = {
  coral:       { ground: '#F8F4F3', low: '#EAE1E0', high: '#84646C', edge: '#5A3A48' },
  leopard:     { ground: '#F1ECEB', low: '#E0D3D4', high: '#3C2033', edge: '#2B1126' },
  mitosis:     { ground: '#F5F5F0', low: '#E9E3E3', high: '#381E31', edge: '#30152A' },
  bloom:       { ground: '#F1ECEB', low: '#DDD0D1', high: '#6A4854', edge: '#4F3040' },
  fingerprint: { ground: '#F7F5F0', low: '#DDD5D6', high: '#392134', edge: '#2B1126' },
  emerald:     { ground: '#F7F3F2', low: '#E2DADA', high: '#614552', edge: '#3B1F31' },
};

/**
 * Gray-Scott feed / kill rates. These are the two governing parameters of
 * the classic Gray-Scott system — different pairs produce dots, stripes,
 * mitotic bubbles, coral, or fingerprints. Numbers are the canonical
 * literature values.
 */
const SLIDERS = [
  { key: 'feed',       label: 'feed',       min: 0.010, max: 0.10,  step: 0.001, format: (v: number) => v.toFixed(3) },
  { key: 'kill',       label: 'kill',       min: 0.040, max: 0.075, step: 0.001, format: (v: number) => v.toFixed(3) },
  { key: 'stepsPerFrame', label: 'speed',   min: 1,     max: 40,    step: 1,     format: (v: number) => `${Math.round(v)}×` },
  { key: 'seedDensity',  label: 'seedDensity', min: 0,   max: 1,     step: 0.02,  format: (v: number) => v.toFixed(2) },
  { key: 'contrast',     label: 'contrast', min: 0.5,   max: 2,     step: 0.02,  format: (v: number) => v.toFixed(2) },
];

const PRESETS: FamilyPreset[] = [
  { id: 'coral',       label: 'Coral',       blurb: 'coral-branch growth in warm salt water', sliders: SLIDERS,
    defaults: { feed: 0.062, kill: 0.062, stepsPerFrame: 12, seedDensity: 0.35, contrast: 1.10 } },
  { id: 'leopard',     label: 'Leopard',     blurb: 'spots holding their pattern',            sliders: SLIDERS,
    defaults: { feed: 0.040, kill: 0.064, stepsPerFrame: 14, seedDensity: 0.30, contrast: 1.20 } },
  { id: 'mitosis',     label: 'Mitosis',     blurb: 'cells splitting slowly through the field', sliders: SLIDERS,
    defaults: { feed: 0.030, kill: 0.062, stepsPerFrame: 10, seedDensity: 0.25, contrast: 1.05 } },
  { id: 'bloom',       label: 'Bloom',       blurb: 'blossoms opening from seed pixels',      sliders: SLIDERS,
    defaults: { feed: 0.050, kill: 0.062, stepsPerFrame: 10, seedDensity: 0.40, contrast: 1.15 } },
  { id: 'fingerprint', label: 'Fingerprint', blurb: 'labyrinth ridges — dermatoglyphs',        sliders: SLIDERS,
    defaults: { feed: 0.037, kill: 0.060, stepsPerFrame: 16, seedDensity: 0.35, contrast: 1.20 } },
  { id: 'emerald',     label: 'Plum Coral', blurb: 'coral in a muted plum register',            sliders: SLIDERS,
    defaults: { feed: 0.062, kill: 0.062, stepsPerFrame: 12, seedDensity: 0.35, contrast: 1.10 } },
];

export const REACTION_FAMILY: Family = {
  id: 'reaction',
  label: 'Reaction',
  blurb: 'WebGL — Gray-Scott chemistry, alive on your GPU',
  ground: '#F8F4F3',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: false,
  supportsBackground: true,
  supportsText: true,
};
