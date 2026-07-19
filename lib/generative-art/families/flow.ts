import type { Family, FamilyPreset } from '../families';

export interface FlowPalette {
  ground: string;
  stops: string[];
}

export const FLOW_PALETTES: Record<string, FlowPalette> = {
  silk:   { ground: '#FBF7EE', stops: ['#4A4139', '#786754', '#B29B7B', '#DBC7A6'] },
  ink:    { ground: '#F6F5F0', stops: ['#0B0B0F', '#1F1F27', '#3D3E48', '#7D7F8B'] },
  aurora: { ground: '#0D1119', stops: ['#3EE7B3', '#4C8BE0', '#8A56D0', '#F0A5C6'] },
  ember:  { ground: '#1B0F0B', stops: ['#F7E7A5', '#F4A25C', '#C7462B', '#7A1A14'] },
  meadow: { ground: '#F1F4EA', stops: ['#2E4529', '#5A7245', '#9AAF6D', '#CDD9A7'] },
};

const SLIDERS = [
  { key: 'particles', label: 'particles', min: 100, max: 2400, step: 20, format: (v: number) => String(Math.round(v)) },
  { key: 'speed',     label: 'speed',     min: 0.2, max: 3,    step: 0.05, format: (v: number) => v.toFixed(2) },
  { key: 'noise',     label: 'noise',     min: 0.2, max: 3,    step: 0.05, format: (v: number) => v.toFixed(2) },
  { key: 'alpha',     label: 'alpha',     min: 0.02, max: 0.30, step: 0.005, format: (v: number) => v.toFixed(3) },
  { key: 'stroke',    label: 'stroke',    min: 0.4, max: 3,    step: 0.05, format: (v: number) => `${v.toFixed(2)}px` },
  { key: 'life',      label: 'life',      min: 20, max: 600,   step: 5,    format: (v: number) => `${Math.round(v)}f` },
];

const PRESETS: FamilyPreset[] = [
  {
    id: 'silk',
    label: 'Silk Flow',
    blurb: 'warm silk ribbons drifting through the frame',
    sliders: SLIDERS,
    defaults: { particles: 800, speed: 0.9, noise: 1.1, alpha: 0.06, stroke: 1.0, life: 220 },
  },
  {
    id: 'ink',
    label: 'Ink Trails',
    blurb: 'black ink trails on paper',
    sliders: SLIDERS,
    defaults: { particles: 1200, speed: 1.4, noise: 1.6, alpha: 0.08, stroke: 0.9, life: 180 },
  },
  {
    id: 'aurora',
    label: 'Aurora',
    blurb: 'green-purple ribbons on dark ground',
    sliders: SLIDERS,
    defaults: { particles: 1600, speed: 0.7, noise: 0.85, alpha: 0.05, stroke: 1.2, life: 320 },
  },
  {
    id: 'ember',
    label: 'Ember',
    blurb: 'warm coal-fire particles rising',
    sliders: SLIDERS,
    defaults: { particles: 1400, speed: 1.6, noise: 1.4, alpha: 0.07, stroke: 1.1, life: 160 },
  },
  {
    id: 'meadow',
    label: 'Meadow',
    blurb: 'soft green strokes, spring air',
    sliders: SLIDERS,
    defaults: { particles: 900, speed: 0.6, noise: 0.9, alpha: 0.05, stroke: 1.15, life: 260 },
  },
];

export const FLOW_FAMILY: Family = {
  id: 'flow',
  label: 'Flow',
  blurb: 'algorithmic — particles drifting through curl noise',
  ground: '#FBF7EE',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: true,
};
