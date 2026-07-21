import type { Family, FamilyPreset } from '../families';

export interface TerrainPalette {
  ground: string;   // fallback sky/ground
  low: string;      // valley colour
  mid: string;      // slope colour
  high: string;     // peak colour
  metalness: number;
  roughness: number;
}

export const TERRAIN_PALETTES: Record<string, TerrainPalette> = {
  sunrise: { ground: '#F6EEDA', low: '#3D2A1A', mid: '#B78256', high: '#F5E0BA', metalness: 0.05, roughness: 0.75 },
  dune:    { ground: '#F5E9D3', low: '#8F5A2E', mid: '#D3A566', high: '#F5E4C4', metalness: 0.05, roughness: 0.80 },
  peak:    { ground: '#E7EEF3', low: '#2B4457', mid: '#94A9B7', high: '#F5F1E8', metalness: 0.10, roughness: 0.70 },
  basin:   { ground: '#F0F1EA', low: '#2E4529', mid: '#6E957F', high: '#DDE1CB', metalness: 0.05, roughness: 0.72 },
  volcano: { ground: '#1B1712', low: '#0D0806', mid: '#5C1A0E', high: '#F0A24C', metalness: 0.15, roughness: 0.65 },
  moon:    { ground: '#12141A', low: '#1C222B', mid: '#525C6A', high: '#DADDE1', metalness: 0.25, roughness: 0.55 },
};

const SLIDERS = [
  { key: 'amp',       label: 'amplitude',   min: 0.1, max: 1.4, step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'freq',      label: 'frequency',   min: 0.4, max: 3.0, step: 0.05, format: (v: number) => v.toFixed(2) },
  { key: 'octaves',   label: 'detail',      min: 1,   max: 6,   step: 1,    format: (v: number) => String(Math.round(v)) },
  { key: 'ridge',     label: 'ridge',       min: 0,   max: 1,   step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'tilt',      label: 'camera tilt', min: -0.6, max: 0.6, step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'spin',      label: 'spin',        min: 0,   max: 1,   step: 0.02, format: (v: number) => `${v.toFixed(2)}×` },
];

const PRESETS: FamilyPreset[] = [
  { id: 'sunrise', label: 'Sunrise Ridge', blurb: 'warm ridge in the first light', sliders: SLIDERS,
    defaults: { amp: 0.65, freq: 1.2, octaves: 4, ridge: 0.55, tilt: -0.05, spin: 0.15 } },
  { id: 'dune',    label: 'Dune Field',    blurb: 'wind-carved dunes',              sliders: SLIDERS,
    defaults: { amp: 0.50, freq: 1.4, octaves: 3, ridge: 0.20, tilt: -0.05, spin: 0.12 } },
  { id: 'peak',    label: 'Alpine Peak',   blurb: 'snow-capped alpine peaks',       sliders: SLIDERS,
    defaults: { amp: 1.00, freq: 1.1, octaves: 5, ridge: 0.85, tilt: -0.15, spin: 0.18 } },
  { id: 'basin',   label: 'Sage Basin',    blurb: 'sage valley in soft light',      sliders: SLIDERS,
    defaults: { amp: 0.45, freq: 1.0, octaves: 4, ridge: 0.30, tilt: 0.00, spin: 0.10 } },
  { id: 'volcano', label: 'Ember Ridge',   blurb: 'lava-veined ridge in night',     sliders: SLIDERS,
    defaults: { amp: 0.90, freq: 1.3, octaves: 5, ridge: 0.75, tilt: -0.10, spin: 0.20 } },
  { id: 'moon',    label: 'Sea of Rains',  blurb: 'lunar mare — cratered plain',    sliders: SLIDERS,
    defaults: { amp: 0.55, freq: 1.6, octaves: 4, ridge: 0.35, tilt: -0.08, spin: 0.14 } },
];

export const TERRAIN_FAMILY: Family = {
  id: 'terrain',
  label: 'Terrain',
  blurb: 'real-time 3D — heightmap landscapes under a low sun',
  ground: '#F6EEDA',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: false,
  supportsBackground: true,
};
