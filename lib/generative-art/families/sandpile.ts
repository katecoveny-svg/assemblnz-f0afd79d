import type { Family, FamilyPreset } from '../families';

export interface SandpilePalette {
  ground: string;
  cells: string[]; // colour per grain-count bucket (0..3, and 4+ during avalanche)
}

export const SANDPILE_PALETTES: Record<string, SandpilePalette> = {
  paper:  { ground: '#F5F0EF', cells: ['#F5F0EF', '#CBBFC2', '#88737D', '#513B4B', '#2E152A'] },
  ink:    { ground: '#2A1025', cells: ['#2A1025', '#3E2639', '#725E6B', '#C1B6BB', '#F5F0EF'] },
  ember:  { ground: '#F2ECEB', cells: ['#F2ECEB', '#BBA3A6', '#8D6D75', '#543544', '#2E152A'] },
  ocean:  { ground: '#F1EDEC', cells: ['#F1EDEC', '#C6B8BC', '#9C838A', '#533747', '#371B2E'] },
  moss:   { ground: '#F2EDED', cells: ['#F2EDED', '#D8C9CA', '#B39A9E', '#503444', '#2C1227'] },
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
  { id: 'ember', label: 'Rose Cascade',  blurb: 'warm avalanche cascade',           sliders: SLIDERS, defaults: { grid: 130, topple: 4, grainsPerStep: 45, dropRandom: 0.10, speed: 10 } },
  { id: 'ocean', label: 'Tide',  blurb: 'plum grains, wider threshold',     sliders: SLIDERS, defaults: { grid: 150, topple: 5, grainsPerStep: 60, dropRandom: 0.10, speed: 12 } },
  { id: 'moss',  label: 'Lichen',   blurb: 'random-drop lichen growth',         sliders: SLIDERS, defaults: { grid: 140, topple: 4, grainsPerStep: 25, dropRandom: 1.00, speed: 6 } },
];

export const SANDPILE_FAMILY: Family = {
  id: 'sandpile',
  label: 'Sand pile',
  blurb: 'physics — Bak-Tang-Wiesenfeld avalanches',
  ground: '#F5F0EF',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: false,
  supportsBackground: true,
};
