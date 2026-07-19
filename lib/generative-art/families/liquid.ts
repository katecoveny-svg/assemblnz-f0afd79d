import type { Family, FamilyPreset } from '../families';

const SLIDERS = [
  { key: 'intensity', label: 'intensity', min: 0, max: 1, step: 0.05, format: (v: number) => v.toFixed(2) },
  { key: 'viscosity', label: 'viscosity', min: 0, max: 1, step: 0.05, format: (v: number) => v.toFixed(2) },
  { key: 'glow', label: 'glow', min: 0, max: 1, step: 0.05, format: (v: number) => v.toFixed(2) },
];

const PRESETS: FamilyPreset[] = [
  {
    id: 'champagne',
    label: 'Champagne Droplet',
    blurb: 'macro gold liquid in glass sphere · granular sparkle',
    sliders: SLIDERS,
    defaults: { intensity: 0.75, viscosity: 0.55, glow: 0.60 },
  },
  {
    id: 'ink',
    label: 'Ink in Water',
    blurb: 'black ink dispersion in a milk-white glass',
    sliders: SLIDERS,
    defaults: { intensity: 0.65, viscosity: 0.35, glow: 0.25 },
  },
  {
    id: 'honey',
    label: 'Honey Amber',
    blurb: 'golden honey macro, slow pour',
    sliders: SLIDERS,
    defaults: { intensity: 0.80, viscosity: 0.85, glow: 0.55 },
  },
];

function adjective(value: number, low: string, mid: string, high: string): string {
  if (value <= 0.34) return low;
  if (value >= 0.67) return high;
  return mid;
}

function promptFor(presetId: string, v: Record<string, number>): string {
  const intensity = adjective(v.intensity ?? 0.7, 'delicate, understated', 'balanced, cinematic', 'rich, saturated');
  const viscosity = adjective(v.viscosity ?? 0.5, 'fast-flowing, thin liquid', 'medium viscosity, silken flow', 'thick, slow-flowing, molten');
  const glow = adjective(v.glow ?? 0.5, 'soft ambient light', 'natural rim light with soft highlights', 'luminous rim light, bright specular highlights');

  if (presetId === 'champagne') {
    return `macro photography, champagne gold liquid droplet suspended in a translucent glass sphere, ${intensity} tones, ${viscosity}, ${glow}, granular sparkle inside the sphere catching the light, editorial minimalist cream background, luxurious cinematography, natural daylight rim, 8k detail, extreme depth of field, no text, no logo, no watermark`;
  }
  if (presetId === 'ink') {
    return `macro photography, single drop of black indian ink dispersing in clear water inside a milk-white glass vessel, ${intensity} density, ${viscosity}, ${glow}, soft edge tendrils, editorial minimalist white background, high-speed camera stop-motion feel, natural side light, 8k detail, extreme depth of field, no text, no logo, no watermark`;
  }
  return `macro photography, golden honey slow-pouring against soft cream light, ${intensity} tones, ${viscosity}, ${glow}, catching a bright bead of light at the crest, editorial minimalist background, luxurious cinematography, natural daylight, 8k detail, extreme depth of field, no text, no logo, no watermark`;
}

export const LIQUID_FAMILY: Family = {
  id: 'liquid',
  label: 'Liquid',
  blurb: 'AI photoreal — Fal Flux 1.1 Pro renders each pass',
  ground: '#FDFCF9',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  isAiFirst: true,
  aiPrompt: promptFor,
};

export { promptFor as liquidPromptFor };
