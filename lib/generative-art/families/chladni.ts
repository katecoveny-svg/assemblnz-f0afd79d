import type { Family, FamilyPreset } from '../families';

export interface ChladniPalette {
  ground: string;
  plate: string;
  sand: string;
  edge: string;
}

export const CHLADNI_PALETTES: Record<string, ChladniPalette> = {
  paper:  { ground: '#F5F1E8', plate: '#F5F1E8', sand: '#231F1B', edge: '#8A8678' },
  ink:    { ground: '#0F1116', plate: '#141821', sand: '#F5F1E8', edge: '#4A4A55' },
  metal:  { ground: '#DCDDE0', plate: '#DCDDE0', sand: '#2A3038', edge: '#8A93A0' },
  brass:  { ground: '#F7EBCF', plate: '#F7EBCF', sand: '#5C3212', edge: '#B08A4A' },
  midnight:{ ground: '#101319', plate: '#151A22', sand: '#79A6B2', edge: '#3C7FA0' },
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
  { id: 'brass',    label: 'Brass Plate',    blurb: 'warm brass with dark sand',     sliders: SLIDERS,
    defaults: { m: 6, n: 3, blend: 0.30, contrast: 1.5, grain: 0.30 } },
  { id: 'midnight', label: 'Midnight',       blurb: 'teal ripples on ink',           sliders: SLIDERS,
    defaults: { m: 7, n: 5, blend: 0.40, contrast: 1.9, grain: 0.28 } },
];

export const CHLADNI_FAMILY: Family = {
  id: 'chladni',
  label: 'Chladni',
  blurb: 'physics — sand on a vibrating plate, live in a shader',
  ground: '#F5F1E8',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: false,
  supportsBackground: true,
};
