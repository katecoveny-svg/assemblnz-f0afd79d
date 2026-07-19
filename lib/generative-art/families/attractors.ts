import type { Family, FamilyPreset } from '../families';

export interface AttractorPalette {
  ground: string;
  hueStart: number;   // 0-360
  hueEnd: number;
  sat: number;        // 0-100
  light: number;      // 0-100
}

export const ATTRACTOR_PALETTES: Record<string, AttractorPalette> = {
  lorenz:    { ground: '#F5F1E8', hueStart: 200, hueEnd: 260, sat: 45, light: 30 },
  aizawa:    { ground: '#101216', hueStart: 30,  hueEnd: 180, sat: 60, light: 55 },
  rossler:   { ground: '#F1EDE1', hueStart: 340, hueEnd: 20,  sat: 55, light: 32 },
  halvorsen: { ground: '#F2EFE4', hueStart: 150, hueEnd: 210, sat: 45, light: 30 },
  thomas:    { ground: '#181B22', hueStart: 40,  hueEnd: 320, sat: 50, light: 55 },
};

const SLIDERS = [
  { key: 'iterations', label: 'iterations',   min: 5000,   max: 100000, step: 1000, format: (v: number) => `${Math.round(v/1000)}k` },
  { key: 'stepSize',   label: 'stepSize',     min: 0.002,  max: 0.02,   step: 0.0005, format: (v: number) => v.toFixed(4) },
  { key: 'alpha',      label: 'alpha',        min: 0.01,   max: 0.4,    step: 0.01, format: (v: number) => v.toFixed(2) },
  { key: 'zoom',       label: 'zoom',         min: 0.4,    max: 3.5,    step: 0.05, format: (v: number) => `${v.toFixed(2)}×` },
  { key: 'rotation',   label: 'rotation',     min: 0,      max: Math.PI * 2, step: 0.02, format: (v: number) => `${(v*180/Math.PI).toFixed(0)}°` },
];

const PRESETS: FamilyPreset[] = [
  { id: 'lorenz',    label: 'Lorenz',    blurb: 'butterfly wings — the classic',        sliders: SLIDERS,
    defaults: { iterations: 40000, stepSize: 0.008, alpha: 0.06, zoom: 1.4, rotation: 0.6 } },
  { id: 'aizawa',    label: 'Aizawa',    blurb: 'spiralling helix in dark space',       sliders: SLIDERS,
    defaults: { iterations: 60000, stepSize: 0.008, alpha: 0.05, zoom: 1.2, rotation: 1.2 } },
  { id: 'rossler',   label: 'Rössler',   blurb: 'coiled ribbon on cream',               sliders: SLIDERS,
    defaults: { iterations: 40000, stepSize: 0.012, alpha: 0.05, zoom: 1.5, rotation: 0.9 } },
  { id: 'halvorsen', label: 'Halvorsen', blurb: 'three-lobed rotational symmetry',      sliders: SLIDERS,
    defaults: { iterations: 50000, stepSize: 0.006, alpha: 0.06, zoom: 1.6, rotation: 0.4 } },
  { id: 'thomas',    label: 'Thomas',    blurb: 'sparse cyclic weave in the dark',      sliders: SLIDERS,
    defaults: { iterations: 60000, stepSize: 0.012, alpha: 0.04, zoom: 1.4, rotation: 1.5 } },
];

export const ATTRACTORS_FAMILY: Family = {
  id: 'attractors',
  label: 'Attractors',
  blurb: 'physics — trace strange attractors in phase space',
  ground: '#F5F1E8',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: false,
  supportsBackground: true,
};

/**
 * Attractor step equations. Each returns the derivative (dx, dy, dz) at
 * the given (x, y, z). Integrated with forward Euler + a small step.
 */
export type AttractorId = keyof typeof ATTRACTOR_STEPS;

export const ATTRACTOR_STEPS = {
  lorenz(x: number, y: number, z: number): [number, number, number] {
    const s = 10, r = 28, b = 8 / 3;
    return [s * (y - x), x * (r - z) - y, x * y - b * z];
  },
  aizawa(x: number, y: number, z: number): [number, number, number] {
    const a = 0.95, b = 0.7, c = 0.6, d = 3.5, e = 0.25, f = 0.1;
    return [
      (z - b) * x - d * y,
      d * x + (z - b) * y,
      c + a * z - (z * z * z) / 3 - (x * x + y * y) * (1 + e * z) + f * z * x * x * x,
    ];
  },
  rossler(x: number, y: number, z: number): [number, number, number] {
    const a = 0.2, b = 0.2, c = 5.7;
    return [-y - z, x + a * y, b + z * (x - c)];
  },
  halvorsen(x: number, y: number, z: number): [number, number, number] {
    const a = 1.4;
    return [-a * x - 4 * y - 4 * z - y * y, -a * y - 4 * z - 4 * x - z * z, -a * z - 4 * x - 4 * y - x * x];
  },
  thomas(x: number, y: number, z: number): [number, number, number] {
    const b = 0.208186;
    return [Math.sin(y) - b * x, Math.sin(z) - b * y, Math.sin(x) - b * z];
  },
};
