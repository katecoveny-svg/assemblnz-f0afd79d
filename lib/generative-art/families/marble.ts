import type { Family, FamilyPreset } from '../families';

export interface MarblePalette {
  ground: string;
  inks: string[];
}

export const MARBLE_PALETTES: Record<string, MarblePalette> = {
  suminagashi: { ground: '#F8F4F2', inks: ['#2E152A', '#604B5A', '#AC999F'] },
  ottoman:     { ground: '#F2ECEB', inks: ['#6F4D58', '#BBA3A6', '#74535E', '#503444'] },
  ocean:       { ground: '#F1EDEC', inks: ['#3A1E31', '#654956', '#AA989E'] },
  gold:        { ground: '#F4EEED', inks: ['#7D5D67', '#B59A9E', '#BFA7AA'] },
  bloom:       { ground: '#F3ECEF', inks: ['#6A4854', '#DCD0D1', '#F5F0EF'] },
};

/**
 * Marbling is a compositional process, not a sim: we place concentric ink
 * rings (drops), then sweep straight combs across the pattern. Each op
 * displaces every pixel-space anchor point. The rings render at the end
 * as a stack of translucent circles interpolated between anchors.
 */
const SLIDERS = [
  { key: 'drops',       label: 'drops',       min: 3,   max: 40,  step: 1,    format: (v: number) => String(Math.round(v)) },
  { key: 'combs',       label: 'combs',       min: 0,   max: 12,  step: 1,    format: (v: number) => String(Math.round(v)) },
  { key: 'ringDensity', label: 'ringDensity', min: 5,   max: 30,  step: 1,    format: (v: number) => String(Math.round(v)) },
  { key: 'combStrength',label: 'combStrength',min: 0.2, max: 2.5, step: 0.05, format: (v: number) => v.toFixed(2) },
  { key: 'alpha',       label: 'alpha',       min: 0.3, max: 1,   step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'stroke',      label: 'stroke',      min: 0.6, max: 3,   step: 0.05, format: (v: number) => `${v.toFixed(2)}px` },
];

const PRESETS: FamilyPreset[] = [
  { id: 'suminagashi', label: 'Suminagashi', blurb: 'Japanese ink-on-water',           sliders: SLIDERS,
    defaults: { drops: 22, combs: 5, ringDensity: 15, combStrength: 1.4, alpha: 0.75, stroke: 0.9 } },
  { id: 'ottoman',     label: 'Ottoman',     blurb: 'ebru — Turkish marbling',         sliders: SLIDERS,
    defaults: { drops: 28, combs: 6, ringDensity: 18, combStrength: 1.6, alpha: 0.85, stroke: 1.0 } },
  { id: 'ocean',       label: 'Tide',       blurb: 'deep plum comb-sweep',            sliders: SLIDERS,
    defaults: { drops: 18, combs: 4, ringDensity: 14, combStrength: 1.3, alpha: 0.80, stroke: 1.0 } },
  { id: 'gold',        label: 'Rose Leaf',   blurb: 'rose veins on chalk',             sliders: SLIDERS,
    defaults: { drops: 16, combs: 3, ringDensity: 12, combStrength: 1.1, alpha: 0.75, stroke: 1.1 } },
  { id: 'bloom',       label: 'Bloom',       blurb: 'rose drops in slow water',        sliders: SLIDERS,
    defaults: { drops: 14, combs: 2, ringDensity: 10, combStrength: 0.9, alpha: 0.70, stroke: 1.2 } },
];

export const MARBLE_FAMILY: Family = {
  id: 'marble',
  label: 'Marble',
  blurb: 'ink on water — suminagashi + comb sweeps',
  ground: '#F8F4F2',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: false,
  supportsBackground: true,
};
