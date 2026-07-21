import type { Family, FamilyPreset } from '../families';

export interface GrowthPalette {
  ground: string;
  trunk: string;
  leaf: string;
}

export const GROWTH_PALETTES: Record<string, GrowthPalette> = {
  tree:       { ground: '#F6F3EB', trunk: '#3A2F24', leaf: '#5E8C7A' },
  fern:       { ground: '#F1F5EC', trunk: '#2E4529', leaf: '#8AAF6D' },
  dragon:     { ground: '#F5EFDE', trunk: '#8F3A22', leaf: '#231F1B' },
  koch:       { ground: '#F7F4EE', trunk: '#23211F', leaf: '#5B5049' },
  sierpinski: { ground: '#EBF0F4', trunk: '#1F5A6E', leaf: '#3C7FA0' },
  wild:       { ground: '#101216', trunk: '#F4CE7A', leaf: '#3EE7B3' },
};

/**
 * L-System spec: an axiom plus one production rule per non-terminal.
 * The turtle interprets the expanded string via drawing commands.
 *
 * Turtle symbols (case-sensitive):
 *   F, G           — step forward and draw
 *   f              — step forward without drawing
 *   +              — turn left by the current angle
 *   -              — turn right by the current angle
 *   [              — push turtle state
 *   ]              — pop turtle state
 *   Any other letter — no-op (used as intermediate non-terminals like X, Y).
 */
export interface LSystem {
  axiom: string;
  rules: Record<string, string>;
}

export const L_SYSTEMS: Record<string, LSystem> = {
  tree: {
    axiom: 'F',
    rules: { F: 'FF+[+F-F-F]-[-F+F+F]' },
  },
  fern: {
    axiom: 'X',
    rules: { X: 'F+[[X]-X]-F[-FX]+X', F: 'FF' },
  },
  dragon: {
    axiom: 'FX',
    rules: { X: 'X+YF+', Y: '-FX-Y' },
  },
  koch: {
    axiom: 'F--F--F',
    rules: { F: 'F+F--F+F' },
  },
  sierpinski: {
    axiom: 'A',
    rules: { A: 'B-A-B', B: 'A+B+A' },
  },
  wild: {
    axiom: 'X',
    rules: { X: 'F+[[-X]+X]+F[+FX]-X', F: 'FF' },
  },
};

const SLIDERS = [
  { key: 'iterations', label: 'iterations', min: 2,   max: 8,   step: 1,    format: (v: number) => String(Math.round(v)) },
  { key: 'angle',      label: 'angle',      min: 8,   max: 60,  step: 0.5,  format: (v: number) => `${v.toFixed(1)}°` },
  { key: 'stepLen',    label: 'stepLen',    min: 2,   max: 20,  step: 0.5,  format: (v: number) => `${v.toFixed(1)}px` },
  { key: 'stroke',     label: 'strokeW',    min: 0.4, max: 3,   step: 0.05, format: (v: number) => `${v.toFixed(2)}px` },
  { key: 'taper',      label: 'taper',      min: 0,   max: 1,   step: 0.02, format: (v: number) => v.toFixed(2) },
  { key: 'jitter',     label: 'jitter',     min: 0,   max: 0.5, step: 0.01, format: (v: number) => v.toFixed(2) },
];

const PRESETS: FamilyPreset[] = [
  { id: 'tree',       label: 'Fractal Tree',       blurb: 'branching tree, hand-drawn feel', sliders: SLIDERS,
    defaults: { iterations: 4, angle: 22.5, stepLen: 6.5, stroke: 1.0, taper: 0.65, jitter: 0.12 } },
  { id: 'fern',       label: 'Fern',               blurb: 'unfurling koru-like fern',        sliders: SLIDERS,
    defaults: { iterations: 5, angle: 25,   stepLen: 4.0, stroke: 0.9, taper: 0.55, jitter: 0.10 } },
  { id: 'dragon',     label: 'Dragon Curve',       blurb: 'space-filling dragon',            sliders: SLIDERS,
    defaults: { iterations: 12, angle: 90,  stepLen: 3.5, stroke: 1.1, taper: 0.0,  jitter: 0.0 } },
  { id: 'koch',       label: 'Koch Snowflake',     blurb: 'triangular fractal edge',         sliders: SLIDERS,
    defaults: { iterations: 4, angle: 60,   stepLen: 3.5, stroke: 1.0, taper: 0.0,  jitter: 0.0 } },
  { id: 'sierpinski', label: 'Sierpinski Arrow',   blurb: 'triangle woven from a path',      sliders: SLIDERS,
    defaults: { iterations: 6, angle: 60,   stepLen: 3.5, stroke: 0.9, taper: 0.0,  jitter: 0.0 } },
  { id: 'wild',       label: 'Wild Growth',        blurb: 'organic tangle on ink',           sliders: SLIDERS,
    defaults: { iterations: 5, angle: 20,   stepLen: 4.0, stroke: 0.9, taper: 0.55, jitter: 0.20 } },
];

export const GROWTH_FAMILY: Family = {
  id: 'growth',
  label: 'Growth',
  blurb: 'L-Systems — recursive grammars, botanical fractals',
  ground: '#F6F3EB',
  presets: PRESETS,
  supportsPngDownload: true,
  supportsSvgDownload: false,
  supportsCodeDownload: false,
  supportsBackground: true,
};

/** Expand an L-system's axiom through N iterations of its production rules. */
export function expandLSystem(system: LSystem, iterations: number): string {
  let s = system.axiom;
  const rules = system.rules;
  for (let i = 0; i < iterations; i++) {
    let next = '';
    for (let j = 0; j < s.length; j++) {
      const ch = s[j];
      next += rules[ch] ?? ch;
    }
    s = next;
    // Guard against runaway strings — Dragon at 20 iterations is ~1M chars.
    if (s.length > 4000000) break;
  }
  return s;
}
