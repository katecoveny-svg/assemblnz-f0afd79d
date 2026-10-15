import type { Family, FamilyPreset } from '../families';

export interface GridPalette {
  ground: string;
  stops: string[];
  strokeAlpha: number;
  fillAlpha: number;
}

export const GRID_PALETTES: Record<string, GridPalette> = {
  molnar:   { ground: '#F1EFE8', stops: ['#2E152A', '#65515F', '#91808A'],                     strokeAlpha: 0.92, fillAlpha: 0 },
  bauhaus:  { ground: '#F2ECEB', stops: ['#84646C', '#BBA3A6', '#74535E', '#2E152A'],          strokeAlpha: 0.05, fillAlpha: 0.95 },
  pounamu:  { ground: '#F7F4EE', stops: ['#705460', '#99848C', '#BBAFB4', '#30172C'],          strokeAlpha: 0.75, fillAlpha: 0.10 },
  cream:    { ground: '#F8F4F3', stops: ['#513B4B', '#79636F', '#AC999F'],                     strokeAlpha: 0.85, fillAlpha: 0.06 },
  night:    { ground: '#280F24', stops: ['#BFA7AA', '#9F8287', '#8D6D75', '#BDA4A7'],          strokeAlpha: 0.20, fillAlpha: 0.85 },
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
    blurb: 'Vera Molnár homage, rotated squares on chalk',
    sliders: SLIDERS,
    defaults: { cols: 14, rows: 20, jitter: 0.65, scale: 0.88, strokeW: 1.1, density: 0.05 },
  },
  {
    id: 'bauhaus',
    label: 'Bauhaus',
    blurb: 'plum and rose blocks, minimal outline',
    sliders: SLIDERS,
    defaults: { cols: 10, rows: 14, jitter: 0.15, scale: 0.95, strokeW: 0.6, density: 0.55 },
  },
  {
    id: 'pounamu',
    label: 'Plum Lattice',
    blurb: 'muted plum grid on paper',
    sliders: SLIDERS,
    defaults: { cols: 12, rows: 16, jitter: 0.4, scale: 0.90, strokeW: 1.0, density: 0.20 },
  },
  {
    id: 'cream',
    label: 'Chalk',
    blurb: 'warm minimalist grid',
    sliders: SLIDERS,
    defaults: { cols: 12, rows: 16, jitter: 0.5, scale: 0.85, strokeW: 1.0, density: 0.10 },
  },
  {
    id: 'night',
    label: 'Night Grid',
    blurb: 'rose blocks on deep plum',
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
