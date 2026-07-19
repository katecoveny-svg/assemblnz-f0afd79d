'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type p5Type from 'p5';
import type { RendererProps } from '@/lib/generative-art/families';
import { useDragAdjust } from '@/lib/generative-art/use-drag-adjust';
import { GROWTH_PALETTES, L_SYSTEMS, expandLSystem, type GrowthPalette } from '@/lib/generative-art/families/growth';
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

export function GrowthCanvas({ presetId, values, seed, background, onAdjust, onExportersReady }: RendererProps) {
  const drag = useDragAdjust(onAdjust, (nx, ny) => ({ angle: Number((8 + nx * 52).toFixed(1)), iterations: Math.round(2 + (1 - ny) * 6) }));
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5Type | null>(null);
  const [ready, setReady] = useState(false);

  const basePalette = GROWTH_PALETTES[presetId] ?? GROWTH_PALETTES.tree;
  const bg = backgroundById(background);
  const palette: GrowthPalette = useMemo(() => {
    if (!bg) return basePalette;
    return { ground: bg.ground, trunk: bg.ink, leaf: bg.inkSoft };
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

        function render() {
          const { values: v, palette: pal, seed: s, presetId: pid } = stateRef.current;
          p.background(pal.ground);
          const system = L_SYSTEMS[pid] ?? L_SYSTEMS.tree;
          const iterations = Math.max(1, Math.round(v.iterations ?? 4));
          const angleDeg = v.angle ?? 22.5;
          const angle = (angleDeg * Math.PI) / 180;
          const baseStep = v.stepLen ?? 6.5;
          const stroke = v.stroke ?? 1.0;
          const taper = v.taper ?? 0.55;
          const jitter = v.jitter ?? 0.1;

          const expanded = expandLSystem(system, iterations);
          const rand = mulberry32(s);

          // Two-pass: first pass computes the bounding box so we auto-fit,
          // second pass draws to the canvas.
          type TurtleState = { x: number; y: number; heading: number; depth: number };
          const startHeading = pid === 'tree' || pid === 'fern' || pid === 'wild'
            ? -Math.PI / 2   // grow up
            : 0;

          const measure = () => {
            const stack: TurtleState[] = [];
            let t: TurtleState = { x: 0, y: 0, heading: startHeading, depth: 0 };
            let minX = 0, maxX = 0, minY = 0, maxY = 0;
            let maxDepth = 0;
            for (let i = 0; i < expanded.length; i++) {
              const c = expanded[i];
              if (c === 'F' || c === 'G' || c === 'A' || c === 'B') {
                const nx = t.x + Math.cos(t.heading) * baseStep;
                const ny = t.y + Math.sin(t.heading) * baseStep;
                t.x = nx; t.y = ny;
                if (nx < minX) minX = nx; if (nx > maxX) maxX = nx;
                if (ny < minY) minY = ny; if (ny > maxY) maxY = ny;
              } else if (c === 'f') {
                t.x += Math.cos(t.heading) * baseStep;
                t.y += Math.sin(t.heading) * baseStep;
              } else if (c === '+') {
                t.heading += angle + (rand() - 0.5) * angle * jitter;
              } else if (c === '-') {
                t.heading -= angle + (rand() - 0.5) * angle * jitter;
              } else if (c === '[') {
                stack.push({ ...t });
                t.depth++;
                if (t.depth > maxDepth) maxDepth = t.depth;
              } else if (c === ']') {
                const popped = stack.pop();
                if (popped) t = popped;
              }
            }
            return { minX, maxX, minY, maxY, maxDepth };
          };

          const { minX, maxX, minY, maxY, maxDepth } = measure();
          const spanX = maxX - minX || 1;
          const spanY = maxY - minY || 1;
          const fit = Math.min(w / spanX, h / spanY) * 0.88;
          const startX = w / 2 - ((maxX + minX) / 2) * fit;
          const startY = h / 2 - ((maxY + minY) / 2) * fit;

          // Draw pass.
          const [tr, tg, tb] = hexToRgb(pal.trunk);
          const [lr, lg, lb] = hexToRgb(pal.leaf);
          const rand2 = mulberry32(s);   // separate PRNG so measure/draw match

          const stack: Array<{ x: number; y: number; heading: number; depth: number }> = [];
          let x = 0, y = 0, heading = startHeading, depth = 0;

          for (let i = 0; i < expanded.length; i++) {
            const c = expanded[i];
            if (c === 'F' || c === 'G' || c === 'A' || c === 'B') {
              const nx = x + Math.cos(heading) * baseStep;
              const ny = y + Math.sin(heading) * baseStep;
              // Interpolate colour + weight along depth: trunk near the root,
              // leaf tone at the tips; thickness tapers.
              const depthT = maxDepth === 0 ? 0 : Math.min(1, depth / maxDepth);
              const r = Math.round(tr + (lr - tr) * depthT);
              const g = Math.round(tg + (lg - tg) * depthT);
              const b = Math.round(tb + (lb - tb) * depthT);
              const weight = stroke * (1 - taper * depthT);
              p.stroke(r, g, b, 235);
              p.strokeWeight(weight);
              p.line(startX + x * fit, startY + y * fit, startX + nx * fit, startY + ny * fit);
              x = nx; y = ny;
            } else if (c === 'f') {
              x += Math.cos(heading) * baseStep;
              y += Math.sin(heading) * baseStep;
            } else if (c === '+') {
              heading += angle + (rand2() - 0.5) * angle * jitter;
            } else if (c === '-') {
              heading -= angle + (rand2() - 0.5) * angle * jitter;
            } else if (c === '[') {
              stack.push({ x, y, heading, depth });
              depth++;
            } else if (c === ']') {
              const popped = stack.pop();
              if (popped) { x = popped.x; y = popped.y; heading = popped.heading; depth = popped.depth; }
            }
          }
        }

        p.setup = () => {
          const r = containerRef.current!.getBoundingClientRect();
          w = Math.max(320, r.width);
          h = Math.max(320, r.height);
          p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
          p.createCanvas(w, h);
          p.noLoop();
          render();
          setReady(true);
        };
        p.windowResized = () => {
          const r = containerRef.current?.getBoundingClientRect();
          if (!r) return;
          w = Math.max(320, r.width);
          h = Math.max(320, r.height);
          p.resizeCanvas(w, h);
          render();
        };
        p.draw = () => {
          if (versionRef.current !== lastVersion) {
            lastVersion = versionRef.current;
            render();
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
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[10.5px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
          growing…
        </div>
      )}
    </div>
  );
}
