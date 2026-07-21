import type { Family, FamilyPreset } from '../families';

export type ChromeShape =
  | 'torus'
  | 'torus-knot'
  | 'sphere'
  | 'icosahedron'
  | 'cube'
  | 'wobble';

export type ChromePalette =
  | 'chrome'
  | 'gold'
  | 'rose'
  | 'emerald'
  | 'pearl'
  | 'obsidian'
  | 'copper'
  | 'ocean';

export interface ChromePaletteSpec {
  id: ChromePalette;
  label: string;
  color: string;
  metalness: number;
  iridescence: number;
  clearcoat: number;
  envIntensity: number;
  ground: string;
}

export const CHROME_PALETTES: ChromePaletteSpec[] = [
  { id: 'chrome',   label: 'Chrome',   color: '#EDEFF1', metalness: 1.00, iridescence: 1.00, clearcoat: 1.0, envIntensity: 1.30, ground: '#EBECED' },
  { id: 'gold',     label: 'Gold',     color: '#F4CE7A', metalness: 1.00, iridescence: 0.35, clearcoat: 1.0, envIntensity: 1.20, ground: '#FBF6EA' },
  { id: 'rose',     label: 'Rose',     color: '#F1B7A6', metalness: 1.00, iridescence: 0.50, clearcoat: 1.0, envIntensity: 1.15, ground: '#FBEFEA' },
  { id: 'emerald',  label: 'Emerald',  color: '#5E8C7A', metalness: 0.85, iridescence: 0.75, clearcoat: 1.0, envIntensity: 1.10, ground: '#EBF0EC' },
  { id: 'pearl',    label: 'Pearl',    color: '#F4F1EB', metalness: 0.55, iridescence: 1.00, clearcoat: 1.0, envIntensity: 1.10, ground: '#F7F4EE' },
  { id: 'obsidian', label: 'Obsidian', color: '#22262C', metalness: 1.00, iridescence: 0.60, clearcoat: 1.0, envIntensity: 1.25, ground: '#DFE1E3' },
  { id: 'copper',   label: 'Copper',   color: '#C9743E', metalness: 1.00, iridescence: 0.25, clearcoat: 1.0, envIntensity: 1.20, ground: '#F4ECE3' },
  { id: 'ocean',    label: 'Ocean',    color: '#3C7FA0', metalness: 0.90, iridescence: 0.80, clearcoat: 1.0, envIntensity: 1.20, ground: '#E7EFF3' },
];

export const CHROME_SHAPES: { id: ChromeShape; label: string }[] = [
  { id: 'torus',       label: 'Torus' },
  { id: 'torus-knot',  label: 'Torus Knot' },
  { id: 'sphere',      label: 'Sphere' },
  { id: 'icosahedron', label: 'Icosahedron' },
  { id: 'cube',        label: 'Cube' },
  { id: 'wobble',      label: 'Wobble Sphere' },
];

/**
 * The Chrome family's "preset" now bundles shape + palette + material params.
 * Sliders and two chip rows (shape + palette) sit under the canvas.
 */
const SLIDERS = [
  { key: 'shape', label: 'shape', min: 0, max: CHROME_SHAPES.length - 1, step: 1,
    format: (v: number) => CHROME_SHAPES[Math.max(0, Math.min(CHROME_SHAPES.length - 1, Math.round(v)))].label },
  { key: 'palette', label: 'palette', min: 0, max: CHROME_PALETTES.length - 1, step: 1,
    format: (v: number) => CHROME_PALETTES[Math.max(0, Math.min(CHROME_PALETTES.length - 1, Math.round(v)))].label },
  { key: 'ior',        label: 'ior',        min: 1.0, max: 2.4, step: 0.02,  format: (v: number) => v.toFixed(2) },
  { key: 'roughness',  label: 'roughness',  min: 0,   max: 1,   step: 0.01,  format: (v: number) => v.toFixed(2) },
  { key: 'dispersion', label: 'dispersion', min: 0,   max: 0.2, step: 0.005, format: (v: number) => v.toFixed(3) },
  { key: 'wobble',     label: 'wobble',     min: 0,   max: 1,   step: 0.01,  format: (v: number) => v.toFixed(2) },
  { key: 'spin',       label: 'spin',       min: 0,   max: 2,   step: 0.05,  format: (v: number) => `${v.toFixed(2)}×` },
];

const PRESETS: FamilyPreset[] = [
  {
    id: 'iridescent-torus',
    label: 'Iridescent Torus',
    blurb: 'chrome torus, prismatic dispersion',
    sliders: SLIDERS,
    defaults: { shape: 0, palette: 0, ior: 1.5, roughness: 0.05, dispersion: 0.06, wobble: 0, spin: 0.5 },
  },
  {
    id: 'gold-knot',
    label: 'Gold Knot',
    blurb: 'gilded torus knot, editorial studio',
    sliders: SLIDERS,
    defaults: { shape: 1, palette: 1, ior: 1.45, roughness: 0.08, dispersion: 0.02, wobble: 0, spin: 0.35 },
  },
  {
    id: 'rose-sphere',
    label: 'Rose Sphere',
    blurb: 'satin rose gold sphere',
    sliders: SLIDERS,
    defaults: { shape: 2, palette: 2, ior: 1.45, roughness: 0.25, dispersion: 0.02, wobble: 0, spin: 0.30 },
  },
  {
    id: 'emerald-ico',
    label: 'Emerald Ico',
    blurb: 'faceted emerald icosahedron',
    sliders: SLIDERS,
    defaults: { shape: 3, palette: 3, ior: 1.55, roughness: 0.10, dispersion: 0.05, wobble: 0, spin: 0.45 },
  },
  {
    id: 'pearl-cube',
    label: 'Pearl Cube',
    blurb: 'pearlescent cube, soft edges',
    sliders: SLIDERS,
    defaults: { shape: 4, palette: 4, ior: 1.55, roughness: 0.20, dispersion: 0.04, wobble: 0, spin: 0.30 },
  },
  {
    id: 'obsidian-wobble',
    label: 'Obsidian Wobble',
    blurb: 'black glass, gentle flex',
    sliders: SLIDERS,
    defaults: { shape: 5, palette: 5, ior: 1.60, roughness: 0.04, dispersion: 0.08, wobble: 0.35, spin: 0.55 },
  },
  {
    id: 'copper-torus',
    label: 'Copper Torus',
    blurb: 'copper mirror, warm register',
    sliders: SLIDERS,
    defaults: { shape: 0, palette: 6, ior: 1.5, roughness: 0.08, dispersion: 0.03, wobble: 0, spin: 0.4 },
  },
  {
    id: 'ocean-ico',
    label: 'Ocean Ico',
    blurb: 'teal glass icosahedron',
    sliders: SLIDERS,
    defaults: { shape: 3, palette: 7, ior: 1.55, roughness: 0.05, dispersion: 0.07, wobble: 0, spin: 0.5 },
  },
];

export const CHROME_FAMILY: Family = {
  id: 'chrome',
  label: 'Chrome',
  blurb: 'real-time 3D — glass and metal, live in your browser',
  ground: '#EBECED',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: true,
};
