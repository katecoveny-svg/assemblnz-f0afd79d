'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type p5Type from 'p5';
import type { RendererProps } from '@/lib/generative-art/families';
import { useDragAdjust } from '@/lib/generative-art/use-drag-adjust';
import { DLA_PALETTES, type DlaPalette } from '@/lib/generative-art/families/dla';
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

interface Walker { x: number; y: number; }

export function DlaCanvas({ presetId, values, seed, background, onAdjust, onExportersReady }: RendererProps) {
  const drag = useDragAdjust(onAdjust, (nx, ny) => ({ stickBias: Number((0.7 + nx * 0.3).toFixed(3)), walkers: Math.round(20 + (1 - ny) * 180) }));
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5Type | null>(null);
  const [ready, setReady] = useState(false);

  const basePalette = DLA_PALETTES[presetId] ?? DLA_PALETTES.coral;
  const bg = backgroundById(background);
  const palette: DlaPalette = useMemo(() => {
    if (!bg) return basePalette;
    return { ground: bg.ground, coral: bg.ink, tip: bg.inkSoft };
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
        // Grid-based occupancy so "is this walker adjacent to the structure?"
        // is O(1) — much faster than checking distance to every stuck point.
        let occ: Uint8Array = new Uint8Array(0);
        let gridW = 0;
        let gridH = 0;
        let cell = 4;              // grid cell size in canvas pixels
        let w = 0, h = 0;
        let particleCount = 0;
        let walkers: Walker[] = [];
        let rand = mulberry32(1);
        let lastVersion = -1;

        function isOccupied(gx: number, gy: number) {
          if (gx < 0 || gy < 0 || gx >= gridW || gy >= gridH) return false;
          return occ[gy * gridW + gx] !== 0;
        }
        function markOccupied(gx: number, gy: number, gen: number) {
          occ[gy * gridW + gx] = Math.min(255, gen);
        }

        function reset() {
          const { values: v, seed: s, palette: pal } = stateRef.current;
          rand = mulberry32(s);
          const wanted = Math.max(60, Math.round(v.targetCount ?? 3000));
          particleCount = wanted;
          cell = 4;
          gridW = Math.max(60, Math.floor(w / cell));
          gridH = Math.max(60, Math.floor(h / cell));
          occ = new Uint8Array(gridW * gridH);
          // Seed with a central dot.
          const cx = Math.floor(gridW / 2);
          const cy = Math.floor(gridH / 2);
          markOccupied(cx, cy, 1);
          walkers = [];
          spawnWalkers();
          p.background(pal.ground);
          // Draw the seed point.
          const [pr, pg, pb] = hexToRgb(pal.coral);
          p.noStroke();
          p.fill(pr, pg, pb);
          p.circle(cx * cell, cy * cell, v.dotSize ?? 2.2);
        }

        function spawnWalkers() {
          const { values: v } = stateRef.current;
          const wantedWalkers = Math.max(1, Math.round(v.walkers ?? 80));
          while (walkers.length < wantedWalkers) {
            // Spawn on a large circle around centre so walkers drift inward.
            const cx = gridW / 2;
            const cy = gridH / 2;
            const R = Math.min(gridW, gridH) * 0.5;
            const angle = rand() * Math.PI * 2;
            walkers.push({
              x: cx + Math.cos(angle) * R,
              y: cy + Math.sin(angle) * R,
            });
          }
        }

        p.setup = () => {
          const r = containerRef.current!.getBoundingClientRect();
          w = Math.max(320, r.width);
          h = Math.max(320, r.height);
          p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
          p.createCanvas(w, h);
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
          const stickBias = v.stickBias ?? 0.95;
          const stepSize = v.stepSize ?? 2;
          const dotSize = v.dotSize ?? 2.2;
          const remaining = particleCount - occCount();
          if (remaining <= 0) return;

          spawnWalkers();

          const [pr, pg, pb] = hexToRgb(pal.coral);
          const [tr, tg, tb] = hexToRgb(pal.tip);
          p.noStroke();

          // Iterate walkers — random walk, stick if a neighbour is occupied.
          for (let k = 0; k < walkers.length; k++) {
            const wRef = walkers[k];
            const dir = Math.floor(rand() * 4);
            if (dir === 0) wRef.x += stepSize / cell;
            else if (dir === 1) wRef.x -= stepSize / cell;
            else if (dir === 2) wRef.y += stepSize / cell;
            else wRef.y -= stepSize / cell;

            // Wrap so wandering walkers don't disappear off the field.
            if (wRef.x < 0) wRef.x = gridW - 1;
            if (wRef.x >= gridW) wRef.x = 0;
            if (wRef.y < 0) wRef.y = gridH - 1;
            if (wRef.y >= gridH) wRef.y = 0;

            const gx = Math.floor(wRef.x);
            const gy = Math.floor(wRef.y);
            const adjacent = isOccupied(gx + 1, gy) || isOccupied(gx - 1, gy)
                          || isOccupied(gx, gy + 1) || isOccupied(gx, gy - 1);
            if (adjacent && rand() < stickBias) {
              markOccupied(gx, gy, 1);
              // Draw the new point — colour interpolates from coral to tip
              // based on how full the structure is (later grains are tip).
              const fill = occCount() / particleCount;
              const r = Math.round(pr + (tr - pr) * fill);
              const g = Math.round(pg + (tg - pg) * fill);
              const b = Math.round(pb + (tb - pb) * fill);
              p.fill(r, g, b);
              p.circle(gx * cell, gy * cell, dotSize);
              // Respawn this walker on the outer ring.
              const cx = gridW / 2;
              const cy = gridH / 2;
              const R = Math.min(gridW, gridH) * 0.5;
              const angle = rand() * Math.PI * 2;
              wRef.x = cx + Math.cos(angle) * R;
              wRef.y = cy + Math.sin(angle) * R;
            }
          }
        };

        function occCount() {
          // Cheap live counter — occ is Uint8Array, we do a compact sum by
          // sampling every 16th cell and extrapolating. Exact per-frame
          // count would kill perf on a 200×200 grid.
          let s = 0;
          for (let i = 0; i < occ.length; i += 16) if (occ[i]) s++;
          return s * 16;
        }
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
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[10.5px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
          seeding coral…
        </div>
      )}
    </div>
  );
}
