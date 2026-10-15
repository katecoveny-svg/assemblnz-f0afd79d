import type { Family, FamilyPreset } from '../families';

export interface RipplesPalette {
  ground: string;
  crest: string; // peak wave colour
  trough: string; // trough colour
  edge: string;
}

export const RIPPLES_PALETTES: Record<string, RipplesPalette> = {
  pond:  { ground: '#EDEFEB', crest: '#3A1E31', trough: '#C4B9BD', edge: '#896E77' },
  moon:  { ground: '#2A1126', crest: '#E1DBDC', trough: '#31172B', edge: '#9D8D95' },
  ink:   { ground: '#F5F0EF', crest: '#2A1025', trough: '#C1B6BB', edge: '#604B5A' },
  gold:  { ground: '#F4EEED', crest: '#7D5D67', trough: '#E6DBDB', edge: '#B59A9E' },
  rose:  { ground: '#F5ECEF', crest: '#72515C', trough: '#DDD0D1', edge: '#4F3040' },
};

const SLIDERS = [
  { key: 'damping',      label: 'damping',      min: 0.90, max: 0.999, step: 0.001, format: (v: number) => v.toFixed(3) },
  { key: 'dropRate',     label: 'drops/sec',    min: 0,    max: 6,     step: 0.1,   format: (v: number) => v.toFixed(1) },
  { key: 'dropStrength', label: 'dropStrength', min: 0.1,  max: 1,     step: 0.02,  format: (v: number) => v.toFixed(2) },
  { key: 'stepsPerFrame',label: 'speed',        min: 1,    max: 6,     step: 1,     format: (v: number) => `${Math.round(v)}×` },
  { key: 'contrast',     label: 'contrast',     min: 0.5,  max: 3,     step: 0.05,  format: (v: number) => v.toFixed(2) },
];

const PRESETS: FamilyPreset[] = [
  { id: 'pond',  label: 'Still Pond', blurb: 'raindrops on quiet water',           sliders: SLIDERS, defaults: { damping: 0.995, dropRate: 1.5, dropStrength: 0.55, stepsPerFrame: 2, contrast: 1.2 } },
  { id: 'moon', label: 'Moonlit Sea', blurb: 'phosphor crests on dark water',      sliders: SLIDERS, defaults: { damping: 0.997, dropRate: 0.8, dropStrength: 0.6,  stepsPerFrame: 2, contrast: 1.4 } },
  { id: 'ink',  label: 'Ink on Paper',blurb: 'ink ripples on chalk',               sliders: SLIDERS, defaults: { damping: 0.994, dropRate: 2.0, dropStrength: 0.5,  stepsPerFrame: 2, contrast: 1.5 } },
  { id: 'gold', label: 'Rose Basin',  blurb: 'rose ripples in warm light',         sliders: SLIDERS, defaults: { damping: 0.996, dropRate: 1.2, dropStrength: 0.55, stepsPerFrame: 2, contrast: 1.3 } },
  { id: 'rose', label: 'Rose Water',  blurb: 'rose crests on pale rose',          sliders: SLIDERS, defaults: { damping: 0.995, dropRate: 1.6, dropStrength: 0.55, stepsPerFrame: 2, contrast: 1.3 } },
];

export const RIPPLES_FAMILY: Family = {
  id: 'ripples',
  label: 'Ripples',
  blurb: 'physics — 2D wave equation, live on your GPU',
  ground: '#EDEFEB',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: false,
  supportsBackground: true,
};
