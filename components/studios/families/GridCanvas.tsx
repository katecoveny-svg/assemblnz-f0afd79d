'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type p5Type from 'p5';
import type { RendererProps } from '@/lib/generative-art/families';
import { useDragAdjust } from '@/lib/generative-art/use-drag-adjust';
import { GRID_PALETTES } from '@/lib/generative-art/families/grid';
import { stampWatermarkOnCanvas } from '@/lib/generative-art/watermark';
import { canvasScaledToBlob } from '@/lib/generative-art/render-utils';

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
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

export function GridCanvas({ presetId, values, seed, onAdjust, onExportersReady }: RendererProps) {
  const drag = useDragAdjust(onAdjust, (nx, ny) => ({ jitter: Number(nx.toFixed(2)), cols: Math.round(4 + (1 - ny) * 20) }));
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5Type | null>(null);
  const [ready, setReady] = useState(false);
  const palette = GRID_PALETTES[presetId] ?? GRID_PALETTES.molnar;
  const stateRef = useRef({ values, palette, seed });
  stateRef.current = { values, palette, seed };

  useEffect(() => {
    let disposed = false;
    let instance: p5Type | null = null;

    async function init() {
      const mod = await import('p5');
      const P5 = (mod as { default: typeof p5Type }).default;
      if (disposed || !containerRef.current) return;

      instance = new P5((p: p5Type) => {
        p.setup = () => {
          const r = containerRef.current!.getBoundingClientRect();
          const w = Math.max(320, r.width);
          const h = Math.max(320, r.height);
          p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
          p.createCanvas(w, h);
          p.noLoop();
          render(p);
          setReady(true);
        };
        p.windowResized = () => {
          const r = containerRef.current?.getBoundingClientRect();
          if (!r) return;
          p.resizeCanvas(Math.max(320, r.width), Math.max(320, r.height));
          render(p);
        };
        p.draw = () => render(p);
      }, containerRef.current);
      p5Ref.current = instance;
    }

    function render(p: p5Type) {
      const { values: v, palette: pal, seed: s } = stateRef.current;
      const w = p.width;
      const h = p.height;
      p.background(pal.ground);
      const cols = Math.max(1, Math.round(v.cols ?? 14));
      const rows = Math.max(1, Math.round(v.rows ?? 20));
      const jitter = v.jitter ?? 0.65;
      const scale = v.scale ?? 0.88;
      const strokeW = v.strokeW ?? 1.1;
      const density = v.density ?? 0.05;

      const cellW = w / cols;
      const cellH = h / rows;
      const cell = Math.min(cellW, cellH);
      const rand = mulberry32(s);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cx = (x + 0.5) * cellW;
          const cy = (y + 0.5) * cellH;
          const rot = (rand() - 0.5) * Math.PI * jitter;
          // Cascade the row a bit so vertical strips of similar rotation
          // don't line up — Molnár-style variation.
          const rowScale = scale * (0.9 + 0.2 * rand());
          const size = cell * rowScale;
          const stops = pal.stops;
          const color = stops[Math.floor(rand() * stops.length)];
          const [r, g, b] = hexToRgb(color);

          p.push();
          p.translate(cx, cy);
          p.rotate(rot);
          const fillRoll = rand();
          if (fillRoll < density) {
            p.fill(r, g, b, Math.round(pal.fillAlpha * 255));
          } else {
            p.noFill();
          }
          p.stroke(r, g, b, Math.round(pal.strokeAlpha * 255));
          p.strokeWeight(strokeW);
          p.rectMode(p.CENTER);
          p.rect(0, 0, size, size);
          p.pop();
        }
      }
    }

    init();
    return () => {
      disposed = true;
      instance?.remove();
      p5Ref.current = null;
    };
  }, []);

  useEffect(() => {
    if (!p5Ref.current) return;
    const raf = requestAnimationFrame(() => p5Ref.current?.redraw());
    return () => cancelAnimationFrame(raf);
  }, [presetId, values, seed]);

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
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[10.5px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
          assembling…
        </div>
      )}
    </div>
  );
}
