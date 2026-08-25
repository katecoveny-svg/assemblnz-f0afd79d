'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type p5Type from 'p5';
import type { RendererProps } from '@/lib/generative-art/families';
import { useDragAdjust } from '@/lib/generative-art/use-drag-adjust';
import { SANDPILE_PALETTES, type SandpilePalette } from '@/lib/generative-art/families/sandpile';
import { backgroundById } from '@/lib/generative-art/backgrounds';
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

export function SandpileCanvas({ presetId, values, seed, background, onAdjust, onExportersReady }: RendererProps) {
  const drag = useDragAdjust(onAdjust, (nx, ny) => ({ dropRandom: Number(nx.toFixed(2)), grainsPerStep: Math.round(1 + (1 - ny) * 199) }));
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5Type | null>(null);
  const [ready, setReady] = useState(false);

  const basePalette = SANDPILE_PALETTES[presetId] ?? SANDPILE_PALETTES.paper;
  const bg = backgroundById(background);
  const palette: SandpilePalette = useMemo(() => {
    if (!bg) return basePalette;
    // Recolour the buckets on the fly against the new ground.
    return {
      ground: bg.ground,
      cells: [bg.ground, bg.inkSoft, bg.inkSoft, bg.ink, bg.ink],
    };
  }, [basePalette, bg]);

  const stateRef = useRef({ values, palette, seed });
  stateRef.current = { values, palette, seed };
  const versionRef = useRef(0);
  useEffect(() => { versionRef.current += 1; }, [presetId, seed, background]);

  useEffect(() => {
    let disposed = false;
    let instance: p5Type | null = null;

    async function init() {
      const mod = await import('p5');
      const P5 = (mod as { default: typeof p5Type }).default;
      if (disposed || !containerRef.current) return;

      instance = new P5((p: p5Type) => {
        let cells: Uint16Array = new Uint16Array(0);
        let N = 140;
        let cellSize = 1;
        let w = 0, h = 0;
        let rand = mulberry32(1);
        let lastVersion = -1;

        function reset() {
          const { values: v, seed: s } = stateRef.current;
          N = Math.max(20, Math.round(v.grid ?? 140));
          cells = new Uint16Array(N * N);
          rand = mulberry32(s);
          cellSize = Math.min(w, h) / N;
        }

        function tick() {
          const { values: v } = stateRef.current;
          const grains = Math.max(1, Math.round(v.grainsPerStep ?? 40));
          const threshold = Math.max(4, Math.round(v.topple ?? 4));
          const dropRandom = v.dropRandom ?? 0;
          const speed = Math.max(1, Math.round(v.speed ?? 8));

          for (let s = 0; s < speed; s++) {
            // Drop grains at the centre (or randomly per dropRandom).
            for (let g = 0; g < grains; g++) {
              const x = dropRandom > rand() ? Math.floor(rand() * N) : Math.floor(N / 2);
              const y = dropRandom > rand() ? Math.floor(rand() * N) : Math.floor(N / 2);
              cells[y * N + x]++;
            }

            // Topple sweep — any cell ≥ threshold spills one grain to each
            // of its four neighbours. Repeat until nothing spills.
            let unstable = true;
            let guard = 0;
            while (unstable && guard < 60) {
              unstable = false;
              guard++;
              for (let y = 0; y < N; y++) {
                for (let x = 0; x < N; x++) {
                  const idx = y * N + x;
                  if (cells[idx] < threshold) continue;
                  const spill = Math.floor(cells[idx] / threshold);
                  cells[idx] -= spill * threshold;
                  if (x > 0)     cells[idx - 1] += spill;
                  if (x < N - 1) cells[idx + 1] += spill;
                  if (y > 0)     cells[idx - N] += spill;
                  if (y < N - 1) cells[idx + N] += spill;
                  unstable = true;
                }
              }
            }
          }
        }

        p.setup = () => {
          const r = containerRef.current!.getBoundingClientRect();
          w = Math.max(320, r.width);
          h = Math.max(320, r.height);
          p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
          p.createCanvas(w, h);
          p.noStroke();
          reset();
          setReady(true);
        };
        p.windowResized = () => {
          const r = containerRef.current?.getBoundingClientRect();
          if (!r) return;
          w = Math.max(320, r.width);
          h = Math.max(320, r.height);
          p.resizeCanvas(w, h);
          reset();
        };
        p.draw = () => {
          if (versionRef.current !== lastVersion) {
            lastVersion = versionRef.current;
            reset();
          }
          const { values: v, palette: pal } = stateRef.current;
          if (Math.round(v.grid ?? 140) !== N) reset();
          tick();
          p.background(pal.ground);
          const cellsPal = pal.cells;
          const buckets = cellsPal.length - 1;
          for (let y = 0; y < N; y++) {
            for (let x = 0; x < N; x++) {
              const c = cells[y * N + x];
              if (c === 0) continue;
              const bucket = Math.min(buckets, c);
              const [r, g, b] = hexToRgb(cellsPal[bucket]);
              p.fill(r, g, b);
              p.rect(x * cellSize, y * cellSize, cellSize + 0.5, cellSize + 0.5);
            }
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
        {...drag}
        className="relative ga-canvas w-full touch-none cursor-crosshair overflow-hidden rounded-[3px] border border-[color:var(--assembl-cloud)]"
        style={{ background: palette.ground }}
      />
      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[12px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
          piling grains…
        </div>
      )}
    </div>
  );
}
