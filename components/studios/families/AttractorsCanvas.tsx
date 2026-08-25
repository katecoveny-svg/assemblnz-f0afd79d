'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type p5Type from 'p5';
import type { RendererProps } from '@/lib/generative-art/families';
import { useDragAdjust } from '@/lib/generative-art/use-drag-adjust';
import { ATTRACTOR_PALETTES, ATTRACTOR_STEPS, type AttractorId, type AttractorPalette } from '@/lib/generative-art/families/attractors';
import { backgroundById } from '@/lib/generative-art/backgrounds';
import { stampWatermarkOnCanvas } from '@/lib/generative-art/watermark';
import { canvasScaledToBlob } from '@/lib/generative-art/render-utils';

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = ((h % 360) + 360) % 360;
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) { r = c; g = x; }
  else if (hp < 2) { r = x; g = c; }
  else if (hp < 3) { g = c; b = x; }
  else if (hp < 4) { g = x; b = c; }
  else if (hp < 5) { r = x; b = c; }
  else { r = c; b = x; }
  const m = l - c / 2;
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

export function AttractorsCanvas({ presetId, values, seed, background, onAdjust, onExportersReady }: RendererProps) {
  const drag = useDragAdjust(onAdjust, (nx, ny) => ({ rotation: Number((nx * Math.PI * 2).toFixed(2)), zoom: Number((0.4 + (1 - ny) * 3.1).toFixed(2)) }));
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5Type | null>(null);
  const [ready, setReady] = useState(false);

  const basePalette = ATTRACTOR_PALETTES[presetId] ?? ATTRACTOR_PALETTES.lorenz;
  const bg = backgroundById(background);
  const palette: AttractorPalette = useMemo(() => {
    if (!bg) return basePalette;
    // Preserve palette hues; only override the ground and adjust the
    // lightness so hue points stay visible on dark or bright grounds.
    return { ...basePalette, ground: bg.ground };
  }, [basePalette, bg]);

  const stateRef = useRef({ values, palette, seed, presetId });
  stateRef.current = { values, palette, seed, presetId };
  const versionRef = useRef(0);
  useEffect(() => { versionRef.current += 1; }, [presetId, seed, background, values]);

  useEffect(() => {
    let disposed = false;
    let instance: p5Type | null = null;

    async function init() {
      const mod = await import('p5');
      const P5 = (mod as { default: typeof p5Type }).default;
      if (disposed || !containerRef.current) return;

      instance = new P5((p: p5Type) => {
        let w = 0, h = 0;
        let lastVersion = -1;

        function trace() {
          const { values: v, palette: pal, seed: s, presetId: pid } = stateRef.current;
          p.background(pal.ground);
          const iters = Math.max(1000, Math.round(v.iterations ?? 40000));
          const dt = v.stepSize ?? 0.008;
          const alpha = v.alpha ?? 0.06;
          const zoom = v.zoom ?? 1.4;
          const rotation = v.rotation ?? 0.6;

          // Seed the initial position deterministically so the same seed
          // lands on the same starting orbit through the attractor.
          const startJitter = (s % 1000) / 1000 * 0.4 - 0.2;
          let x = 0.1 + startJitter;
          let y = 0 + startJitter * 0.7;
          let z = 0 + startJitter * 0.5;

          const step = ATTRACTOR_STEPS[pid as AttractorId] ?? ATTRACTOR_STEPS.lorenz;
          // Skip the initial transient so we sit on the attractor before drawing.
          for (let i = 0; i < 500; i++) {
            const [dx, dy, dz] = step(x, y, z);
            x += dx * dt;
            y += dy * dt;
            z += dz * dt;
          }

          // Bounding box pass so we can auto-fit the projection to the canvas.
          let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
          const points: Array<[number, number, number]> = new Array(iters);
          const cosR = Math.cos(rotation), sinR = Math.sin(rotation);
          for (let i = 0; i < iters; i++) {
            const [dx, dy, dz] = step(x, y, z);
            x += dx * dt;
            y += dy * dt;
            z += dz * dt;
            // Project (x, y, z) → (u, v) with a rotation about vertical axis.
            const u = x * cosR + z * sinR;
            const vv = y;
            points[i] = [u, vv, z];
            if (u < minU) minU = u; if (u > maxU) maxU = u;
            if (vv < minV) minV = vv; if (vv > maxV) maxV = vv;
          }

          const spanU = maxU - minU || 1;
          const spanV = maxV - minV || 1;
          const fit = Math.min(w / spanU, h / spanV) * 0.9 * zoom;
          const cx = w / 2 - ((maxU + minU) / 2) * fit;
          const cy = h / 2 - ((maxV + minV) / 2) * fit;

          const alphaByte = Math.round(alpha * 255);
          const hueSpan = pal.hueEnd - pal.hueStart;
          const zMin = points.reduce((m, pt) => (pt[2] < m ? pt[2] : m), Infinity);
          const zMax = points.reduce((m, pt) => (pt[2] > m ? pt[2] : m), -Infinity);
          const zSpan = zMax - zMin || 1;

          p.noStroke();
          for (let i = 0; i < points.length; i++) {
            const [u, vv, zi] = points[i];
            const hz = (zi - zMin) / zSpan;
            const hue = pal.hueStart + hz * hueSpan;
            const [r, g, b] = hslToRgb(hue, pal.sat, pal.light);
            p.fill(r, g, b, alphaByte);
            p.circle(cx + u * fit, cy + vv * fit, 1.4);
          }
        }

        p.setup = () => {
          const r = containerRef.current!.getBoundingClientRect();
          w = Math.max(320, r.width);
          h = Math.max(320, r.height);
          p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
          p.createCanvas(w, h);
          p.noLoop();
          trace();
          setReady(true);
        };
        p.windowResized = () => {
          const r = containerRef.current?.getBoundingClientRect();
          if (!r) return;
          w = Math.max(320, r.width);
          h = Math.max(320, r.height);
          p.resizeCanvas(w, h);
          trace();
        };
        p.draw = () => {
          // Re-trace when any input changes; hold otherwise (attractor is
          // fully deterministic per current state).
          if (versionRef.current !== lastVersion) {
            lastVersion = versionRef.current;
            trace();
          }
        };
      }, containerRef.current);
      p5Ref.current = instance;
    }
    init();
    return () => {
      disposed = true;
      instance?.remove();
      p5Ref.current = null;
    };
  }, []);

  useEffect(() => {
    // Nudge redraw when state changes so p.draw picks up versionRef.
    const raf = requestAnimationFrame(() => p5Ref.current?.redraw());
    return () => cancelAnimationFrame(raf);
  }, [presetId, values, seed, background]);

  const png = useCallback(async (): Promise<Blob | null> => {
    const canvas = containerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) return null;
    const stamped = stampWatermarkOnCanvas(canvas, palette.ground);
    return await new Promise((resolve) => stamped.toBlob((b) => resolve(b), 'image/png'));
  }, [palette.ground]);

  const renderAtSize = useCallback(
    async (w: number, h: number): Promise<Blob | null> => {
      const canvas = containerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
      if (!canvas) return null;
      return canvasScaledToBlob(canvas, w, h, palette.ground);
    },
    [palette.ground],
  );

  useEffect(() => {
    onExportersReady?.({ png, renderAtSize });
  }, [onExportersReady, png, renderAtSize]);

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        {...drag}
        className="relative mx-auto ga-canvas w-full touch-none cursor-crosshair overflow-hidden rounded-[3px] border border-[color:var(--assembl-cloud)]"
        style={{ background: palette.ground }}
      />
      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[12px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
          integrating chaos…
        </div>
      )}
    </div>
  );
}
