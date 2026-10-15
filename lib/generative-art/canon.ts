/**
 * The plum canon for generative work (docs/assembl-brand-system.md).
 *
 * Every colour a family, species or background draws is one of these six
 * tokens or a mix of them: flat family presets use two-token mixes
 * (`mixCanon`), species tones sit on the plum-to-paper ramp with an optional
 * pull toward dusty rose (`toneRgb`). Mixing keeps the tonal range a generative
 * piece needs without stepping outside the palette: no cream, teal, gold,
 * pounamu, cobalt or neon.
 */

export const CANON = {
  plum: '#240B21',
  ink: '#492B3E',
  muted: '#654A4E',
  rose: '#916A70',
  chalk: '#F5F1F2',
  paper: '#FFFDFB',
} as const;

export type CanonToken = keyof typeof CANON;

type Rgb = [number, number, number];

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as Rgb;
}

export function rgbToHex(rgb: Rgb): string {
  return '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
}

/** Linear mix of two canon tokens in sRGB, t = 0 gives `a`, t = 1 gives `b`. */
export function mixCanon(a: CanonToken, b: CanonToken, t: number): string {
  const x = hexToRgb(CANON[a]), y = hexToRgb(CANON[b]);
  return rgbToHex([0, 1, 2].map((i) => x[i] + (y[i] - x[i]) * t) as Rgb);
}

/**
 * A tone on the canon ramp: `t` runs from deep plum (0) to paper (1) and
 * `rose` pulls it toward dusty rose. One number pair per tone keeps species
 * palettes small and lets the studio flip them for a light ground.
 */
export interface Tone { t: number; rose?: number }

export function toneRgb({ t, rose = 0 }: Tone): Rgb {
  const p = hexToRgb(CANON.plum), w = hexToRgb(CANON.paper), r = hexToRgb(CANON.rose);
  const base = [0, 1, 2].map((i) => p[i] + (w[i] - p[i]) * t);
  return [0, 1, 2].map((i) => base[i] + (r[i] - base[i]) * rose) as Rgb;
}

/** The same tone for a light ground: light parts become plum, dark parts stay readable. */
export function toneOnLight({ t, rose = 0 }: Tone): Tone {
  return { t: Math.max(0.02, Math.min(0.9, 0.92 - t * 0.85)), rose };
}

/** The same tone for plum: dark parts lift toward chalk so a dark flock still reads. */
export function toneOnDark({ t, rose = 0 }: Tone): Tone {
  return { t: Math.min(0.95, 0.55 + t * 0.45), rose };
}

/** True when every channel of `hex` lies on a mix of two canon tokens (within `tol` per channel). */
export function isCanonMix(hex: string, tol = 2 / 255): boolean {
  const c = hexToRgb(hex), tokens = Object.values(CANON).map(hexToRgb);
  for (let i = 0; i < tokens.length; i++) {
    for (let j = i; j < tokens.length; j++) {
      const a = tokens[i], b = tokens[j], d = [0, 1, 2].map((k) => b[k] - a[k]);
      const dd = d[0] * d[0] + d[1] * d[1] + d[2] * d[2];
      const t = dd === 0 ? 0 : Math.max(0, Math.min(1, ((c[0] - a[0]) * d[0] + (c[1] - a[1]) * d[1] + (c[2] - a[2]) * d[2]) / dd));
      if ([0, 1, 2].every((k) => Math.abs(a[k] + d[k] * t - c[k]) <= tol)) return true;
    }
  }
  return false;
}
