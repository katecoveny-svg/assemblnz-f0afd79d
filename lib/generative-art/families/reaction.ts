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
  coral:       { ground: '#FBF7EE', low: '#F5E7CC', high: '#B7412A', edge: '#5A1B10' },
  leopard:     { ground: '#F1EDE1', low: '#E5D8B0', high: '#3A2612', edge: '#0F0A05' },
  mitosis:     { ground: '#F5F5F0', low: '#E8E5DA', high: '#1D2A35', edge: '#08111A' },
  bloom:       { ground: '#F5EAEF', low: '#F0C6D7', high: '#8A2A57', edge: '#3E102A' },
  fingerprint: { ground: '#F7F5F0', low: '#DDD7C8', high: '#2E2A22', edge: '#0F0D07' },
  emerald:     { ground: '#F1F5F1', low: '#CFE2D5', high: '#1F5A4A', edge: '#0A2B22' },
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
  { id: 'emerald',     label: 'Emerald Coral', blurb: 'coral in a green register',            sliders: SLIDERS,
    defaults: { feed: 0.062, kill: 0.062, stepsPerFrame: 12, seedDensity: 0.35, contrast: 1.10 } },
];

export const REACTION_FAMILY: Family = {
  id: 'reaction',
  label: 'Reaction',
  blurb: 'WebGL — Gray-Scott chemistry, alive on your GPU',
  ground: '#FBF7EE',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: false,
  supportsBackground: true,
  supportsText: true,
};
