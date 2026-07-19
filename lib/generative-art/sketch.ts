import type { Preset, SketchParams } from './presets';
import { PRESETS } from './presets';

export interface ShellPoint {
  x: number;
  y: number;
}

export interface ShellSpec {
  index: number;
  t: number;
  fillHex: string;
  strokeHex: string;
  fillAlpha: number;
  strokeAlpha: number;
  points: ShellPoint[];
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function lerpPalette(stops: string[], t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const segments = stops.length - 1;
  const pos = clamped * segments;
  const i = Math.min(Math.floor(pos), segments - 1);
  const f = pos - i;
  const [r1, g1, b1] = hexToRgb(stops[i]);
  const [r2, g2, b2] = hexToRgb(stops[i + 1]);
  return rgbToHex(r1 + (r2 - r1) * f, g1 + (g2 - g1) * f, b1 + (b2 - b1) * f);
}

function darken(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * (1 - amt), g * (1 - amt), b * (1 - amt));
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(seed: number) {
  const rand = mulberry32(seed);
  const gridSize = 128;
  const grid: number[][] = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => rand())
  );
  const smooth = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number): number => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const g = (gx: number, gy: number) =>
      grid[((gx % gridSize) + gridSize) % gridSize][((gy % gridSize) + gridSize) % gridSize];
    const u = smooth(xf);
    const v = smooth(yf);
    const a = g(xi, yi);
    const b = g(xi + 1, yi);
    const c = g(xi, yi + 1);
    const d = g(xi + 1, yi + 1);
    return a + u * (b - a) + v * (c - a) + u * v * (a - b - c + d);
  };
}

export interface BuildOptions {
  width: number;
  height: number;
  params: SketchParams;
  preset?: Preset;
}

export function buildShells({ width, height, params, preset }: BuildOptions): ShellSpec[] {
  const p = preset ?? PRESETS[params.preset];
  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.min(width, height) * 0.46;

  const shellCount = Math.max(3, Math.floor(params.shells));
  const shells: ShellSpec[] = [];
  const pointsPerShell = 260;

  const globalRand = mulberry32(params.seed ^ 0x9e3779b9);
  const globalNoise = makeNoise(params.seed);

  for (let i = 0; i < shellCount; i++) {
    const t = shellCount === 1 ? 0 : i / (shellCount - 1);
    const eased = easeOutQuart(t);
    const baseRadius = maxR * (0.10 + 0.90 * eased);

    // Palette: innermost = deepest colour stop, outermost = lightest.
    const paletteT = 1 - Math.pow(1 - t, 0.65);
    const fillHex = lerpPalette(p.palette.stops, paletteT);
    const strokeHex = darken(fillHex, 0.22);

    // Alpha ramp — inner shells much more saturated, outer wispy but their
    // edge stays visible so the layering reads.
    const alphaRamp = Math.pow(1 - t, 1.55);
    const fillAlpha = params.alpha * p.palette.fillAlphaScale * (0.35 + 1.55 * alphaRamp);
    const strokeAlpha = params.alpha * p.palette.strokeAlphaScale * (1.15 + 0.9 * alphaRamp);

    // Per-shell state so no two shells share a silhouette.
    const shellNoise = makeNoise(params.seed + i * 977 + 31);
    const shellRand = mulberry32(params.seed + i * 613 + 7);

    const rotation = (shellRand() - 0.5) * 0.55; // ±0.275 rad ~ ±15.8°
    const stretchX = 1 + (shellRand() - 0.5) * 0.22;
    const stretchY = (1 + (shellRand() - 0.5) * 0.22) * 0.94; // slight vertical squash
    const driftX = (shellRand() - 0.5) * baseRadius * 0.08;
    const driftY = (shellRand() - 0.5) * baseRadius * 0.08;

    const layerNoiseScale = params.noise * (0.9 + 0.5 * globalNoise(i * 0.11, 0));
    const warpFactor =
      params.warp *
      baseRadius *
      (0.22 + 0.55 * Math.pow(t, 0.6));

    const shellPoints: ShellPoint[] = [];
    for (let k = 0; k <= pointsPerShell; k++) {
      const a = (k / pointsPerShell) * Math.PI * 2 + rotation;
      const nx = Math.cos(a) * layerNoiseScale;
      const ny = Math.sin(a) * layerNoiseScale;
      // Two octaves of noise for organic petal edges.
      const n1 = shellNoise(nx + 12, ny + 12);
      const n2 = shellNoise(nx * 2.3 + 40, ny * 2.3 + 40) * 0.55;
      const warp = ((n1 + n2) / 1.55 - 0.5) * 2 * warpFactor;
      const r = baseRadius + warp;
      const x = cx + driftX + r * Math.cos(a) * stretchX;
      const y = cy + driftY + r * Math.sin(a) * stretchY;
      shellPoints.push({ x, y });
    }

    shells.push({
      index: i,
      t,
      fillHex,
      strokeHex,
      fillAlpha,
      strokeAlpha,
      points: shellPoints,
    });
  }

  return shells;
}

export function shellsToSvg(shells: ShellSpec[], width: number, height: number, ground: string, strokeWeight: number): string {
  const paths = shells
    .map((shell) => {
      const d = shell.points
        .map((pt, i) => {
          const x = pt.x.toFixed(2);
          const y = pt.y.toFixed(2);
          return `${i === 0 ? 'M' : 'L'}${x} ${y}`;
        })
        .join(' ') + ' Z';
      return `<path d="${d}" fill="${shell.fillHex}" fill-opacity="${shell.fillAlpha.toFixed(3)}" stroke="${shell.strokeHex}" stroke-opacity="${shell.strokeAlpha.toFixed(3)}" stroke-width="${strokeWeight}" stroke-linejoin="round"/>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect width="${width}" height="${height}" fill="${ground}"/>
  ${paths}
</svg>`;
}
