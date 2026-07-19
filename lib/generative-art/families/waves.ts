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
  silk:    { ground: '#F5F3EE', low: '#8E8479', high: '#F1EFE8', metalness: 0.15, iridescence: 0.35, roughness: 0.45 },
  ocean:   { ground: '#E9EFF2', low: '#1F5A6E', high: '#A4C2CE', metalness: 0.35, iridescence: 0.60, roughness: 0.35 },
  gold:    { ground: '#FAF3E4', low: '#8F5A15', high: '#F4CE7A', metalness: 0.85, iridescence: 0.45, roughness: 0.30 },
  slate:   { ground: '#1B1F24', low: '#2A3038', high: '#8A98A4', metalness: 0.55, iridescence: 0.80, roughness: 0.25 },
  bloom:   { ground: '#F3ECEF', low: '#8A3F5C', high: '#EEC8D2', metalness: 0.20, iridescence: 0.55, roughness: 0.45 },
};

const SLIDERS = [
  { key: 'amp',       label: 'amplitude',  min: 0.05, max: 0.9, step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'freq',      label: 'frequency',  min: 0.4, max: 3.2, step: 0.05, format: (v: number) => v.toFixed(2) },
  { key: 'speed',     label: 'speed',      min: 0.05, max: 1.4, step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'tilt',      label: 'tilt',       min: -0.8, max: 0.8, step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'roughness', label: 'roughness',  min: 0, max: 1, step: 0.02, format: (v: number) => v.toFixed(2) },
];

const PRESETS: FamilyPreset[] = [
  { id: 'silk',  label: 'Silk',   blurb: 'warm silk cloth in still air',                sliders: SLIDERS, defaults: { amp: 0.32, freq: 1.2, speed: 0.35, tilt: -0.15, roughness: 0.45 } },
  { id: 'ocean', label: 'Ocean',  blurb: 'ocean surface in evening light',              sliders: SLIDERS, defaults: { amp: 0.45, freq: 1.6, speed: 0.55, tilt: -0.20, roughness: 0.35 } },
  { id: 'gold',  label: 'Gold Sheet', blurb: 'gilded foil bending under a lamp',        sliders: SLIDERS, defaults: { amp: 0.30, freq: 1.4, speed: 0.30, tilt: -0.10, roughness: 0.30 } },
  { id: 'slate', label: 'Slate',  blurb: 'slate glass — night register',                sliders: SLIDERS, defaults: { amp: 0.50, freq: 1.8, speed: 0.65, tilt: -0.25, roughness: 0.25 } },
  { id: 'bloom', label: 'Bloom',  blurb: 'pink silk, editorial hero',                   sliders: SLIDERS, defaults: { amp: 0.28, freq: 1.1, speed: 0.28, tilt: -0.10, roughness: 0.45 } },
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
