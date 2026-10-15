import type { Family, FamilyPreset } from '../families';

export interface ChladniPalette {
  ground: string;
  plate: string;
  sand: string;
  edge: string;
}

export const CHLADNI_PALETTES: Record<string, ChladniPalette> = {
  paper:  { ground: '#F5F0EF', plate: '#F5F0EF', sand: '#2E152A', edge: '#91808A' },
  ink:    { ground: '#2A1025', plate: '#2E1428', sand: '#F5F0EF', edge: '#594353' },
  metal:  { ground: '#E1DBDD', plate: '#E1DBDD', sand: '#3E2639', edge: '#9D8D95' },
  brass:  { ground: '#EAE1E0', plate: '#EAE1E0', sand: '#523343', edge: '#A3898F' },
  midnight:{ ground: '#2B1126', plate: '#2D1328', sand: '#AA989E', edge: '#896E77' },
};

const SLIDERS = [
  { key: 'm',        label: 'mode m',    min: 1,  max: 12, step: 1,   format: (v: number) => String(Math.round(v)) },
  { key: 'n',        label: 'mode n',    min: 1,  max: 12, step: 1,   format: (v: number) => String(Math.round(v)) },
  { key: 'blend',    label: 'blend',     min: 0,  max: 1,  step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'contrast', label: 'contrast',  min: 0.5, max: 4,  step: 0.05, format: (v: number) => v.toFixed(2) },
  { key: 'grain',    label: 'grain',     min: 0,  max: 1,  step: 0.02, format: (v: number) => v.toFixed(2) },
];

const PRESETS: FamilyPreset[] = [
  { id: 'paper',    label: 'Paper Nodal',    blurb: 'ink sand on paper plate',       sliders: SLIDERS,
    defaults: { m: 3, n: 5, blend: 0.30, contrast: 1.6, grain: 0.30 } },
  { id: 'ink',      label: 'Ink Plate',      blurb: 'bright sand on dark plate',     sliders: SLIDERS,
    defaults: { m: 4, n: 6, blend: 0.35, contrast: 1.7, grain: 0.25 } },
  { id: 'metal',    label: 'Steel',          blurb: 'physics-textbook plate',        sliders: SLIDERS,
    defaults: { m: 5, n: 4, blend: 0.20, contrast: 1.8, grain: 0.35 } },
  { id: 'brass',    label: 'Rose Plate',    blurb: 'warm rose plate, dark sand',     sliders: SLIDERS,
    defaults: { m: 6, n: 3, blend: 0.30, contrast: 1.5, grain: 0.30 } },
  { id: 'midnight', label: 'Midnight',       blurb: 'dusty rose ripples on deep plum',           sliders: SLIDERS,
    defaults: { m: 7, n: 5, blend: 0.40, contrast: 1.9, grain: 0.28 } },
];

export const CHLADNI_FAMILY: Family = {
  id: 'chladni',
  label: 'Chladni',
  blurb: 'physics — sand on a vibrating plate, live in a shader',
  ground: '#F5F0EF',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: false,
  supportsBackground: true,
};
