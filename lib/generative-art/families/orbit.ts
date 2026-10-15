import type { Family, FamilyPreset } from '../families';

/**
 * Orbit — assembl's own motif, made generative.
 *
 * The mark is an orbit around a gold core: rings passing behind a centre at the
 * top and in front at the bottom. This family turns that into a system — many
 * cores, each ringed, each ring inclined differently — so the output is
 * recognisably assembl rather than generic generative art.
 *
 * Palettes come straight from BRAND-CANON.md §5. No colour here is invented.
 */

export interface OrbitPalette {
  ground: string;
  ring: string;
  ringBack: string;
  core: string;
  coreDeep: string;
  dust: string;
}

export const ORBIT_PALETTES: Record<string, OrbitPalette> = {
  // the mark itself
  mark:    { ground: '#34192D', ring: '#B5A2A7', ringBack: '#715A66', core: '#B9A0A3', coreDeep: '#836770', dust: '#AD9498' },
  // paper canon — for light social posts and print
  paper:   { ground: '#FAFAF7', ring: '#AD9498', ringBack: '#D4C7C8', core: '#B9A0A3', coreDeep: '#836770', dust: '#C2B1B5' },
  // the gallery: bone white, black gloss cores
  gallery: { ground: '#F4F0EF', ring: '#AD9498', ringBack: '#CDC1C4', core: '#280F25', coreDeep: '#240B21', dust: '#AD9498' },
  // ink: near-black ground, chrome rings — the instrument register
  ink:     { ground: '#260D23', ring: '#DED8D9', ringBack: '#6C5966', core: '#B9A0A3', coreDeep: '#775A65', dust: '#9E8F98' },
  // deep navy with cool chrome — the homepage's register
  night:   { ground: '#442738', ring: '#EAE3E3', ringBack: '#79636E', core: '#B9A0A3', coreDeep: '#836770', dust: '#B5A2A7' },
};

const SLIDERS = [
  { key: 'systems',  label: 'systems',   min: 1,   max: 14,  step: 1,    format: (v: number) => String(Math.round(v)) },
  { key: 'rings',    label: 'rings each', min: 1,  max: 5,   step: 1,    format: (v: number) => String(Math.round(v)) },
  { key: 'spread',   label: 'spread',    min: 0.1, max: 1,   step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'tilt',     label: 'tilt',      min: 0,   max: 1,   step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'weight',   label: 'ring weight', min: 0.4, max: 6, step: 0.1,  format: (v: number) => `${v.toFixed(1)}px` },
  { key: 'coreSize', label: 'core',      min: 0.02, max: 0.3, step: 0.01, format: (v: number) => v.toFixed(2) },
  { key: 'dust',     label: 'dust',      min: 0,   max: 1,   step: 0.02, format: (v: number) => `${Math.round(v * 100)}%` },
];

const PRESETS: FamilyPreset[] = [
  {
    id: 'mark',
    label: 'The mark',
    blurb: 'one system, the brand mark itself',
    sliders: SLIDERS,
    defaults: { systems: 1, rings: 2, spread: 0.55, tilt: 0.35, weight: 3.4, coreSize: 0.09, dust: 0.25 },
  },
  {
    id: 'paper',
    label: 'Paper',
    blurb: 'dusty rose on paper · light posts and print',
    sliders: SLIDERS,
    defaults: { systems: 5, rings: 2, spread: 0.6, tilt: 0.5, weight: 2.2, coreSize: 0.05, dust: 0.15 },
  },
  {
    id: 'gallery',
    label: 'Gallery',
    blurb: 'chalk ground, deep plum gloss cores on rose',
    sliders: SLIDERS,
    defaults: { systems: 7, rings: 1, spread: 0.7, tilt: 0.6, weight: 1.8, coreSize: 0.045, dust: 0.1 },
  },
  {
    id: 'ink',
    label: 'Ink',
    blurb: 'chrome rings on near-black',
    sliders: SLIDERS,
    defaults: { systems: 9, rings: 3, spread: 0.75, tilt: 0.7, weight: 1.4, coreSize: 0.035, dust: 0.45 },
  },
  {
    id: 'night',
    label: 'Night',
    blurb: 'ink ground, cool chrome, rose cores',
    sliders: SLIDERS,
    defaults: { systems: 12, rings: 2, spread: 0.85, tilt: 0.8, weight: 1.1, coreSize: 0.03, dust: 0.6 },
  },
];

export const ORBIT_FAMILY: Family = {
  id: 'orbit',
  label: 'Orbit',
  blurb: 'assembl’s own motif — rings around a core, as a system',
  ground: '#34192D',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: true,
};
