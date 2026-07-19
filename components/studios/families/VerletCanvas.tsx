'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type p5Type from 'p5';
import type { RendererProps } from '@/lib/generative-art/families';
import { VERLET_PALETTES, type VerletPalette } from '@/lib/generative-art/families/verlet';
import { backgroundById } from '@/lib/generative-art/backgrounds';
import { stampWatermarkOnCanvas } from '@/lib/generative-art/watermark';
import { canvasScaledToBlob } from '@/lib/generative-art/render-utils';

interface Point { x: number; y: number; px: number; py: number; pinned: boolean; }
interface Stick  { a: number; b: number; length: number; }

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function VerletCanvas({ presetId, values, seed, background, onExportersReady }: RendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5Type | null>(null);
  const [ready, setReady] = useState(false);

  const basePalette = VERLET_PALETTES[presetId] ?? VERLET_PALETTES.linen;
  const bg = backgroundById(background);
  const palette: VerletPalette = useMemo(() => {
    if (!bg) return basePalette;
    return { ground: bg.ground, fabric: bg.inkSoft, edge: bg.ink };
  }, [basePalette, bg]);

  const stateRef = useRef({ values, palette, seed });
  stateRef.current = { values, palette, seed };
  const versionRef = useRef(0);
  useEffect(() => { versionRef.current += 1; }, [presetId, seed]);

  useEffect(() => {
    let disposed = false;
    let instance: p5Type | null = null;
    async function init() {
      const mod = await import('p5');
      const P5 = (mod as { default: typeof p5Type }).default;
      if (disposed || !containerRef.current) return;

      instance = new P5((p: p5Type) => {
        let points: Point[] = [];
        let sticks: Stick[] = [];
        let cols = 0;
        let rows = 0;
        let w = 0;
        let h = 0;
        let lastVersion = -1;

        function rebuild() {
          const { values: v } = stateRef.current;
          cols = Math.max(2, Math.round(v.cols ?? 20));
          rows = Math.max(2, Math.round(v.rows ?? 22));
          const marginX = w * 0.12;
          const marginY = h * 0.10;
          const cellW = (w - 2 * marginX) / (cols - 1);
          const cellH = (h - 2 * marginY) / (rows - 1);
          const spacing = Math.min(cellW, cellH);
          points = [];
          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              const px = marginX + x * cellW;
              const py = marginY + y * cellH;
              const pinned = y === 0 && (x === 0 || x === cols - 1);
              points.push({ x: px, y: py, px, py, pinned });
            }
          }
          sticks = [];
          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              const i = y * cols + x;
              if (x < cols - 1) sticks.push({ a: i, b: i + 1, length: cellW });
              if (y < rows - 1) sticks.push({ a: i, b: i + cols, length: cellH });
            }
          }
          // Warm up so the cloth settles a bit before first paint.
          for (let i = 0; i < 20; i++) integrate(spacing);
        }

        function integrate(_spacing: number) {
          const { values: v } = stateRef.current;
          const gravity = v.gravity ?? 0.14;
          const wind = v.wind ?? 0.08;
          const damping = v.damping ?? 0.992;
          const stiffness = v.stiffness ?? 0.75;

          // Verlet step per point.
          const windPhase = Math.sin(performance.now() * 0.001) * wind;
          for (const pt of points) {
            if (pt.pinned) continue;
            const vx = (pt.x - pt.px) * damping;
            const vy = (pt.y - pt.py) * damping;
            pt.px = pt.x;
            pt.py = pt.y;
            pt.x += vx + windPhase;
            pt.y += vy + gravity;
          }
          // Constraint relaxation — 6 iterations gives a stable weave without eating CPU.
          const iters = 6;
          for (let it = 0; it < iters; it++) {
            for (const s of sticks) {
              const a = points[s.a];
              const b = points[s.b];
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const d = Math.sqrt(dx * dx + dy * dy) || 0.0001;
              const diff = (d - s.length) * 0.5 * stiffness;
              const nx = (dx / d) * diff;
              const ny = (dy / d) * diff;
              if (!a.pinned) { a.x += nx; a.y += ny; }
              if (!b.pinned) { b.x -= nx; b.y -= ny; }
            }
          }
        }

        p.setup = () => {
          const rect = containerRef.current!.getBoundingClientRect();
          w = Math.max(320, rect.width);
          h = Math.max(320, rect.height);
          p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
          p.createCanvas(w, h);
          rebuild();
          setReady(true);
        };
        p.windowResized = () => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return;
          w = Math.max(320, rect.width);
          h = Math.max(320, rect.height);
          p.resizeCanvas(w, h);
          rebuild();
        };
        p.draw = () => {
          if (versionRef.current !== lastVersion || points.length === 0) {
            lastVersion = versionRef.current;
            rebuild();
          }
          const { values: v, palette: pal } = stateRef.current;
          const stroke = v.stroke ?? 0.7;
          const targetCols = Math.max(2, Math.round(v.cols ?? 20));
          const targetRows = Math.max(2, Math.round(v.rows ?? 22));
          if (cols !== targetCols || rows !== targetRows) rebuild();

          integrate(Math.min(w, h) / Math.max(cols, rows));
          p.background(pal.ground);
          const [fr, fg, fb] = hexToRgb(pal.fabric);
          const [er, eg, ebv] = hexToRgb(pal.edge);
          p.strokeWeight(stroke);
          p.noFill();
          for (const s of sticks) {
            const a = points[s.a];
            const b = points[s.b];
            // Colour by stretch — springs at rest get the fabric tone;
            // stretched ones darken toward the edge colour so tension reads.
            const dx = b.x - a.x, dy = b.y - a.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 0.0001;
            const stretch = Math.min(1.8, d / s.length) - 1; // 0 at rest
            const t = Math.max(0, Math.min(1, stretch * 2.5));
            const r = Math.round(fr + (er - fr) * t);
            const g = Math.round(fg + (eg - fg) * t);
            const bb = Math.round(fb + (ebv - fb) * t);
            p.stroke(r, g, bb, 220);
            p.line(a.x, a.y, b.x, b.y);
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
        className="relative mx-auto aspect-[0.92/1] w-full max-w-[720px] overflow-hidden rounded-[3px] border border-[color:var(--assembl-cloud)]"
        style={{ background: palette.ground }}
      />
      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[10.5px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
          weaving…
        </div>
      )}
    </div>
  );
}
