import type { Family, FamilyPreset } from '../families';

export interface GridPalette {
  ground: string;
  stops: string[];
  strokeAlpha: number;
  fillAlpha: number;
}

export const GRID_PALETTES: Record<string, GridPalette> = {
  molnar:   { ground: '#F1EFE8', stops: ['#231F1B', '#5C574F', '#8E8479'],                     strokeAlpha: 0.92, fillAlpha: 0 },
  bauhaus:  { ground: '#F5EFDE', stops: ['#C0341C', '#F0B421', '#1F5DAA', '#231F1B'],          strokeAlpha: 0.05, fillAlpha: 0.95 },
  pounamu:  { ground: '#F7F4EE', stops: ['#2B6B57', '#6E957F', '#B8B2A8', '#23211F'],          strokeAlpha: 0.75, fillAlpha: 0.10 },
  cream:    { ground: '#FBF7EE', stops: ['#4A4139', '#786754', '#B29B7B'],                     strokeAlpha: 0.85, fillAlpha: 0.06 },
  night:    { ground: '#101216', stops: ['#F4CE7A', '#4C8BE0', '#8A56D0', '#3EE7B3'],          strokeAlpha: 0.20, fillAlpha: 0.85 },
};

const SLIDERS = [
  { key: 'cols',     label: 'columns',    min: 4,  max: 24, step: 1,   format: (v: number) => String(Math.round(v)) },
  { key: 'rows',     label: 'rows',       min: 4,  max: 32, step: 1,   format: (v: number) => String(Math.round(v)) },
  { key: 'jitter',   label: 'rotation',   min: 0,  max: 1,  step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'scale',    label: 'scale',      min: 0.4, max: 1.05, step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'strokeW',  label: 'strokeW',    min: 0.4, max: 4,  step: 0.1, format: (v: number) => `${v.toFixed(1)}px` },
  { key: 'density',  label: 'fillRate',   min: 0,   max: 1,  step: 0.02, format: (v: number) => `${Math.round(v * 100)}%` },
];

const PRESETS: FamilyPreset[] = [
  {
    id: 'molnar',
    label: 'Molnár',
    blurb: 'Vera Molnár homage — rotated squares on cream',
    sliders: SLIDERS,
    defaults: { cols: 14, rows: 20, jitter: 0.65, scale: 0.88, strokeW: 1.1, density: 0.05 },
  },
  {
    id: 'bauhaus',
    label: 'Bauhaus',
    blurb: 'primary blocks, minimal outline',
    sliders: SLIDERS,
    defaults: { cols: 10, rows: 14, jitter: 0.15, scale: 0.95, strokeW: 0.6, density: 0.55 },
  },
  {
    id: 'pounamu',
    label: 'Pounamu',
    blurb: 'sage grid on paper',
    sliders: SLIDERS,
    defaults: { cols: 12, rows: 16, jitter: 0.4, scale: 0.90, strokeW: 1.0, density: 0.20 },
  },
  {
    id: 'cream',
    label: 'Cream',
    blurb: 'warm minimalist grid',
    sliders: SLIDERS,
    defaults: { cols: 12, rows: 16, jitter: 0.5, scale: 0.85, strokeW: 1.0, density: 0.10 },
  },
  {
    id: 'night',
    label: 'Night Grid',
    blurb: 'saturated blocks on dark',
    sliders: SLIDERS,
    defaults: { cols: 10, rows: 14, jitter: 0.20, scale: 0.92, strokeW: 0.5, density: 0.75 },
  },
];

export const GRID_FAMILY: Family = {
  id: 'grid',
  label: 'Grid',
  blurb: 'algorithmic — rotated blocks, gallery register',
  ground: '#F1EFE8',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: true,
};
