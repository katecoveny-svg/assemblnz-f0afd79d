import type { Family, FamilyPreset } from '../families';

export interface DlaPalette {
  ground: string;
  coral: string;
  tip: string;   // colour at the newest additions
}

export const DLA_PALETTES: Record<string, DlaPalette> = {
  coral:   { ground: '#F8F4F2', coral: '#6F4D58', tip: '#BBA3A6' },
  frost:   { ground: '#F4F0EF', coral: '#533747', tip: '#D2C6C9' },
  bronze:  { ground: '#F2ECEB', coral: '#523343', tip: '#BAA1A4' },
  moss:    { ground: '#F5F0EF', coral: '#503444', tip: '#B69EA2' },
  night:   { ground: '#280F24', coral: '#F5F0EF', tip: '#BFA7AA' },
};

const SLIDERS = [
  { key: 'targetCount', label: 'particles', min: 500,   max: 8000, step: 50,   format: (v: number) => `${Math.round(v)}` },
  { key: 'walkers',     label: 'walkers',   min: 20,    max: 200,  step: 5,    format: (v: number) => String(Math.round(v)) },
  { key: 'stickBias',   label: 'stickBias', min: 0.7,   max: 1,    step: 0.005, format: (v: number) => v.toFixed(3) },
  { key: 'stepSize',    label: 'stepSize',  min: 1,     max: 4,    step: 0.5,  format: (v: number) => `${v.toFixed(1)}px` },
  { key: 'dotSize',     label: 'dotSize',   min: 1.2,   max: 4,    step: 0.1,  format: (v: number) => `${v.toFixed(1)}px` },
];

const PRESETS: FamilyPreset[] = [
  { id: 'coral',  label: 'Coral',       blurb: 'sea-fan coral, warm palette',        sliders: SLIDERS, defaults: { targetCount: 3000, walkers: 80,  stickBias: 0.95, stepSize: 2, dotSize: 2.2 } },
  { id: 'frost',  label: 'Frost',       blurb: 'window frost, pale plum on chalk',           sliders: SLIDERS, defaults: { targetCount: 4000, walkers: 100, stickBias: 0.98, stepSize: 1.5, dotSize: 1.8 } },
  { id: 'bronze', label: 'Plum Coral',blurb: 'plum branches on chalk',           sliders: SLIDERS, defaults: { targetCount: 3500, walkers: 90,  stickBias: 0.94, stepSize: 2, dotSize: 2.4 } },
  { id: 'moss',   label: 'Lichen',        blurb: 'lichen — organic sprawl',            sliders: SLIDERS, defaults: { targetCount: 4500, walkers: 110, stickBias: 0.92, stepSize: 2.5, dotSize: 2.6 } },
  { id: 'night',  label: 'Night Coral', blurb: 'bright coral on ink',                sliders: SLIDERS, defaults: { targetCount: 3000, walkers: 70,  stickBias: 0.97, stepSize: 2, dotSize: 2.2 } },
];

export const DLA_FAMILY: Family = {
  id: 'dla',
  label: 'DLA',
  blurb: 'physics — diffusion-limited coral growth',
  ground: '#F8F4F2',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: false,
  supportsBackground: true,
};
