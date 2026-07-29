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
  mark:    { ground: '#050F1C', ring: '#BFA37A', ringBack: '#6E5F47', core: '#D4A843', coreDeep: '#8A6A2E', dust: '#B8964F' },
  // paper canon — for light social posts and print
  paper:   { ground: '#FAFAF7', ring: '#B8964F', ringBack: '#D8C9A8', core: '#D4A843', coreDeep: '#8A6A2E', dust: '#C8B48C' },
  // the gallery: bone white, black gloss cores
  gallery: { ground: '#F4F1EA', ring: '#B8964F', ringBack: '#CFC4AC', core: '#1B1A17', coreDeep: '#000000', dust: '#B8964F' },
  // ink: near-black ground, chrome rings — the instrument register
  ink:     { ground: '#0B0C0E', ring: '#D6DADF', ringBack: '#5A6068', core: '#D4A843', coreDeep: '#7A5F26', dust: '#8E959C' },
  // deep navy with cool chrome — the homepage's register
  night:   { ground: '#0C1836', ring: '#DCE6F2', ringBack: '#5C6B84', core: '#D4A843', coreDeep: '#8A6A2E', dust: '#BFA37A' },
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
    blurb: 'brass on off-white — light posts and print',
    sliders: SLIDERS,
    defaults: { systems: 5, rings: 2, spread: 0.6, tilt: 0.5, weight: 2.2, coreSize: 0.05, dust: 0.15 },
  },
  {
    id: 'gallery',
    label: 'Gallery',
    blurb: 'bone white, black gloss cores on brass',
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
    blurb: 'deep navy, cool chrome, gold cores',
    sliders: SLIDERS,
    defaults: { systems: 12, rings: 2, spread: 0.85, tilt: 0.8, weight: 1.1, coreSize: 0.03, dust: 0.6 },
  },
];

export const ORBIT_FAMILY: Family = {
  id: 'orbit',
  label: 'Orbit',
  blurb: 'assembl’s own motif — rings around a core, as a system',
  ground: '#050F1C',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: true,
};
