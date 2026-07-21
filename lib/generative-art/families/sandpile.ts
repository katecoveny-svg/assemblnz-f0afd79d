import type { Family, FamilyPreset } from '../families';

export interface SandpilePalette {
  ground: string;
  cells: string[]; // colour per grain-count bucket (0..3, and 4+ during avalanche)
}

export const SANDPILE_PALETTES: Record<string, SandpilePalette> = {
  paper:  { ground: '#F5F1E8', cells: ['#F5F1E8', '#D0C0AA', '#8A7660', '#4A4139', '#231F1B'] },
  ink:    { ground: '#0F1116', cells: ['#0F1116', '#2A3038', '#5C6672', '#B4BAC4', '#F5F1E8'] },
  ember:  { ground: '#F5EFDE', cells: ['#F5EFDE', '#F0B421', '#C7462B', '#5B2418', '#231F1B'] },
  ocean:  { ground: '#E9EFF2', cells: ['#E9EFF2', '#A4C2CE', '#4A97A9', '#164856', '#08222A'] },
  moss:   { ground: '#EBF0EC', cells: ['#EBF0EC', '#CDD9A7', '#8AAF6D', '#2E4529', '#101711'] },
};

const SLIDERS = [
  { key: 'grid',         label: 'grid',         min: 60,  max: 200, step: 2,   format: (v: number) => `${Math.round(v)}²` },
  { key: 'topple',       label: 'threshold',    min: 4,   max: 8,   step: 1,   format: (v: number) => String(Math.round(v)) },
  { key: 'grainsPerStep',label: 'grainsPerStep',min: 1,   max: 200, step: 1,   format: (v: number) => String(Math.round(v)) },
  { key: 'dropRandom',   label: 'randomDrop',   min: 0,   max: 1,   step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'speed',        label: 'speed',        min: 1,   max: 30,  step: 1,   format: (v: number) => `${Math.round(v)}×` },
];

const PRESETS: FamilyPreset[] = [
  { id: 'paper', label: 'Paper',  blurb: 'centre-drop pile on paper',        sliders: SLIDERS, defaults: { grid: 140, topple: 4, grainsPerStep: 40, dropRandom: 0.0,  speed: 8 } },
  { id: 'ink',   label: 'Ink',    blurb: 'bright grains on dark ground',     sliders: SLIDERS, defaults: { grid: 140, topple: 4, grainsPerStep: 30, dropRandom: 0.05, speed: 8 } },
  { id: 'ember', label: 'Ember',  blurb: 'warm avalanche cascade',           sliders: SLIDERS, defaults: { grid: 130, topple: 4, grainsPerStep: 45, dropRandom: 0.10, speed: 10 } },
  { id: 'ocean', label: 'Ocean',  blurb: 'teal grains, wider threshold',     sliders: SLIDERS, defaults: { grid: 150, topple: 5, grainsPerStep: 60, dropRandom: 0.10, speed: 12 } },
  { id: 'moss',  label: 'Moss',   blurb: 'random-drop mossy growth',         sliders: SLIDERS, defaults: { grid: 140, topple: 4, grainsPerStep: 25, dropRandom: 1.00, speed: 6 } },
];

export const SANDPILE_FAMILY: Family = {
  id: 'sandpile',
  label: 'Sand pile',
  blurb: 'physics — Bak-Tang-Wiesenfeld avalanches',
  ground: '#F5F1E8',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: false,
  supportsBackground: true,
};
