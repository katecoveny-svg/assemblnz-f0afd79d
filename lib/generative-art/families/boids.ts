import type { Family, FamilyPreset } from '../families';
import { CANON, rgbToHex, toneRgb } from '../canon';
import { engineSpecies, speciesById, type SpeciesId } from '../species';

export interface BoidsPalette {
  ground: string;
  body: string;
  trail: string;
}

/**
 * The 2D flocking presets now draw from the species registry (species.ts):
 * each keeps its old id so shared links resolve, and takes its name, ground
 * and body tone from the species. Old palettes (cream, teal, terracotta,
 * near-black, phosphor green) are recorded in docs/design/generative-assembly.md.
 */
const BOIDS_SPECIES: Record<string, SpeciesId> = {
  murmuration: 'starling',
  fish: 'kahawai',
  wanderer: 'piwakawaka',
  corvid: 'corvid',
  plankton: 'plankton',
};

const GROUNDS = { plum: CANON.plum, paper: CANON.paper, chalk: CANON.chalk } as const;

function paletteFor(presetId: string): BoidsPalette {
  const sp = speciesById(BOIDS_SPECIES[presetId] ?? 'starling');
  const ground = GROUNDS[sp.ground];
  const light = sp.ground !== 'plum';
  const tones = engineSpecies(sp, light);
  const body = rgbToHex(tones.upper[0] as [number, number, number]);
  const trail = light ? rgbToHex(toneRgb({ t: 0.62, rose: 0.35 })) : rgbToHex(toneRgb({ t: 0.42, rose: 0.6 }));
  return { ground, body, trail };
}

export const BOIDS_PALETTES: Record<string, BoidsPalette> = Object.fromEntries(
  Object.keys(BOIDS_SPECIES).map((id) => [id, paletteFor(id)]),
);

const SLIDERS = [
  { key: 'count',       label: 'flock',      min: 40,  max: 800, step: 5,   format: (v: number) => String(Math.round(v)) },
  { key: 'separation',  label: 'separation', min: 0,   max: 3,   step: 0.05, format: (v: number) => v.toFixed(2) },
  { key: 'alignment',   label: 'alignment',  min: 0,   max: 3,   step: 0.05, format: (v: number) => v.toFixed(2) },
  { key: 'cohesion',    label: 'cohesion',   min: 0,   max: 3,   step: 0.05, format: (v: number) => v.toFixed(2) },
  { key: 'vision',      label: 'vision',     min: 20,  max: 140, step: 1,   format: (v: number) => `${Math.round(v)}px` },
  { key: 'speed',       label: 'speed',      min: 0.4, max: 3.5, step: 0.05, format: (v: number) => v.toFixed(2) },
  { key: 'trail',       label: 'trail',      min: 0,   max: 0.3, step: 0.005, format: (v: number) => v.toFixed(3) },
];

const PRESETS: FamilyPreset[] = [
  { id: 'murmuration', label: speciesById('starling').name, blurb: speciesById('starling').gloss, sliders: SLIDERS,
    defaults: { count: 480, separation: 1.4, alignment: 1.1, cohesion: 0.95, vision: 42, speed: 1.5, trail: 0.04 } },
  { id: 'fish',        label: speciesById('kahawai').name, blurb: speciesById('kahawai').gloss, sliders: SLIDERS,
    defaults: { count: 260, separation: 1.2, alignment: 1.5, cohesion: 0.8,  vision: 60, speed: 1.4, trail: 0.03 } },
  { id: 'wanderer',    label: speciesById('piwakawaka').name,   blurb: speciesById('piwakawaka').gloss, sliders: SLIDERS,
    defaults: { count: 90,  separation: 1.6, alignment: 0.5, cohesion: 0.3,  vision: 100, speed: 1.1, trail: 0.02 } },
  { id: 'corvid',      label: speciesById('corvid').name,      blurb: speciesById('corvid').gloss, sliders: SLIDERS,
    defaults: { count: 220, separation: 1.5, alignment: 1.2, cohesion: 1.0,  vision: 55, speed: 1.6, trail: 0.06 } },
  { id: 'plankton',    label: speciesById('plankton').name,    blurb: speciesById('plankton').gloss, sliders: SLIDERS,
    defaults: { count: 600, separation: 1.0, alignment: 1.3, cohesion: 1.1,  vision: 34, speed: 1.2, trail: 0.08 } },
];

export const BOIDS_FAMILY: Family = {
  id: 'boids',
  label: 'Boids',
  blurb: 'physics — flocking via separation / alignment / cohesion',
  ground: BOIDS_PALETTES.murmuration.ground,
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: false,
  supportsBackground: true,
};
