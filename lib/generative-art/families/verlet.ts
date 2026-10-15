import type { Family, FamilyPreset } from '../families';

export interface VerletPalette {
  ground: string;
  fabric: string;
  edge: string;
}

export const VERLET_PALETTES: Record<string, VerletPalette> = {
  linen:  { ground: '#F8F4F3', fabric: '#AC999F', edge: '#513B4B' },
  silk:   { ground: '#F5F0EF', fabric: '#CBBFC2', edge: '#65515F' },
  ink:    { ground: '#2A1025', fabric: '#9D8D95', edge: '#F5F0EF' },
  pounamu:{ ground: '#F7F4EE', fabric: '#99848C', edge: '#705460' },
  bloom:  { ground: '#F3ECEF', fabric: '#DCD0D1', edge: '#72515C' },
};

const SLIDERS = [
  { key: 'cols',      label: 'columns',    min: 8,   max: 36,  step: 1,   format: (v: number) => String(Math.round(v)) },
  { key: 'rows',      label: 'rows',       min: 8,   max: 36,  step: 1,   format: (v: number) => String(Math.round(v)) },
  { key: 'gravity',   label: 'gravity',    min: 0,   max: 0.5, step: 0.005, format: (v: number) => v.toFixed(3) },
  { key: 'wind',      label: 'wind',       min: 0,   max: 0.5, step: 0.005, format: (v: number) => v.toFixed(3) },
  { key: 'stiffness', label: 'stiffness',  min: 0.3, max: 1,   step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'damping',   label: 'damping',    min: 0.90, max: 0.999, step: 0.001, format: (v: number) => v.toFixed(3) },
  { key: 'stroke',    label: 'strokeW',    min: 0.3, max: 2,   step: 0.05, format: (v: number) => `${v.toFixed(2)}px` },
];

const PRESETS: FamilyPreset[] = [
  { id: 'linen',   label: 'Linen',    blurb: 'linen cloth pinned at the corners',     sliders: SLIDERS,
    defaults: { cols: 20, rows: 22, gravity: 0.14, wind: 0.08, stiffness: 0.75, damping: 0.992, stroke: 0.7 } },
  { id: 'silk',   label: 'Silk',     blurb: 'silk sheet in a slow current',           sliders: SLIDERS,
    defaults: { cols: 22, rows: 22, gravity: 0.09, wind: 0.12, stiffness: 0.65, damping: 0.994, stroke: 0.7 } },
  { id: 'ink',    label: 'Ink Net',  blurb: 'bright net over dark ground',            sliders: SLIDERS,
    defaults: { cols: 18, rows: 20, gravity: 0.12, wind: 0.06, stiffness: 0.80, damping: 0.992, stroke: 0.6 } },
  { id: 'pounamu',label: 'Plum Weave',  blurb: 'muted plum weave on paper',              sliders: SLIDERS,
    defaults: { cols: 24, rows: 26, gravity: 0.11, wind: 0.07, stiffness: 0.72, damping: 0.993, stroke: 0.7 } },
  { id: 'bloom',  label: 'Bloom',    blurb: 'rose lace at rest',                      sliders: SLIDERS,
    defaults: { cols: 20, rows: 22, gravity: 0.10, wind: 0.05, stiffness: 0.68, damping: 0.994, stroke: 0.8 } },
];

export const VERLET_FAMILY: Family = {
  id: 'verlet',
  label: 'Cloth',
  blurb: 'physics — Verlet spring mesh hanging in the air',
  ground: '#F8F4F3',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: false,
  supportsBackground: true,
};
