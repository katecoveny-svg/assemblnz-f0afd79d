import type { Family, FamilyPreset } from '../families';

export interface WavesPalette {
  ground: string;
  low: string;   // trough colour
  high: string;  // crest colour
  metalness: number;
  iridescence: number;
  roughness: number;
}

export const WAVES_PALETTES: Record<string, WavesPalette> = {
  silk:    { ground: '#F5F3EE', low: '#91808A', high: '#F1EFE8', metalness: 0.15, iridescence: 0.35, roughness: 0.45 },
  ocean:   { ground: '#F1EDEC', low: '#654956', high: '#C6B8BC', metalness: 0.35, iridescence: 0.60, roughness: 0.35 },
  gold:    { ground: '#F4EEED', low: '#7D5D67', high: '#BFA7AA', metalness: 0.85, iridescence: 0.45, roughness: 0.30 },
  slate:   { ground: '#2D1429', low: '#3E2639', high: '#A09199', metalness: 0.55, iridescence: 0.80, roughness: 0.25 },
  bloom:   { ground: '#F3ECEF', low: '#72515C', high: '#DCD0D1', metalness: 0.20, iridescence: 0.55, roughness: 0.45 },
  pounamu: { ground: '#F2EDED', low: '#573B4A', high: '#B5A4A9', metalness: 0.65, iridescence: 0.50, roughness: 0.30 },
  copper:  { ground: '#F2ECEB', low: '#72525D', high: '#BFA7AA', metalness: 0.85, iridescence: 0.30, roughness: 0.28 },
  lagoon:  { ground: '#EFEBEA', low: '#634654', high: '#AA989E', metalness: 0.55, iridescence: 0.70, roughness: 0.32 },
  pearl:   { ground: '#F5F0EF', low: '#AC999F', high: '#F5F0EF', metalness: 0.50, iridescence: 1.00, roughness: 0.42 },
  aurora:  { ground: '#2D1328', low: '#BDA4A7', high: '#8D6D75', metalness: 0.55, iridescence: 0.90, roughness: 0.22 },
};

const SLIDERS = [
  { key: 'amp',       label: 'amplitude',  min: 0.05, max: 0.9, step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'freq',      label: 'frequency',  min: 0.4, max: 3.2, step: 0.05, format: (v: number) => v.toFixed(2) },
  { key: 'speed',     label: 'speed',      min: 0.05, max: 1.4, step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'tilt',      label: 'tilt',       min: -0.8, max: 0.8, step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'roughness', label: 'roughness',  min: 0, max: 1, step: 0.02, format: (v: number) => v.toFixed(2) },
];

const PRESETS: FamilyPreset[] = [
  { id: 'silk',    label: 'Silk',       blurb: 'warm silk cloth in still air',      sliders: SLIDERS, defaults: { amp: 0.32, freq: 1.2, speed: 0.35, tilt: -0.15, roughness: 0.45 } },
  { id: 'ocean',   label: 'Tide',      blurb: 'tide surface in evening light',    sliders: SLIDERS, defaults: { amp: 0.45, freq: 1.6, speed: 0.55, tilt: -0.20, roughness: 0.35 } },
  { id: 'gold',    label: 'Rose Sheet', blurb: 'rose foil bending under a lamp',  sliders: SLIDERS, defaults: { amp: 0.30, freq: 1.4, speed: 0.30, tilt: -0.10, roughness: 0.30 } },
  { id: 'slate',   label: 'Slate',      blurb: 'deep plum glass, night register',      sliders: SLIDERS, defaults: { amp: 0.50, freq: 1.8, speed: 0.65, tilt: -0.25, roughness: 0.25 } },
  { id: 'bloom',   label: 'Bloom',      blurb: 'rose silk, editorial hero',         sliders: SLIDERS, defaults: { amp: 0.28, freq: 1.1, speed: 0.28, tilt: -0.10, roughness: 0.45 } },
  { id: 'pounamu', label: 'Plum Sheet',    blurb: 'muted plum sheet, brand register',       sliders: SLIDERS, defaults: { amp: 0.30, freq: 1.3, speed: 0.32, tilt: -0.15, roughness: 0.30 } },
  { id: 'copper',  label: 'Warm Rose',     blurb: 'rose foil in a warm lamp',        sliders: SLIDERS, defaults: { amp: 0.28, freq: 1.5, speed: 0.32, tilt: -0.12, roughness: 0.28 } },
  { id: 'lagoon',  label: 'Lagoon',     blurb: 'shallow plum water, gentle chop',   sliders: SLIDERS, defaults: { amp: 0.36, freq: 1.4, speed: 0.42, tilt: -0.18, roughness: 0.32 } },
  { id: 'pearl',   label: 'Pearl',      blurb: 'pearlescent sheet, slow ripple',    sliders: SLIDERS, defaults: { amp: 0.22, freq: 1.0, speed: 0.24, tilt: -0.08, roughness: 0.42 } },
  { id: 'aurora',  label: 'Night Veil',     blurb: 'rose ribbons on deep plum',        sliders: SLIDERS, defaults: { amp: 0.55, freq: 2.0, speed: 0.60, tilt: -0.28, roughness: 0.22 } },
];

export const WAVES_FAMILY: Family = {
  id: 'waves',
  label: 'Waves',
  blurb: 'real-time 3D — silk plane under soft light',
  ground: '#F5F3EE',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: false,
  supportsBackground: true,
};
