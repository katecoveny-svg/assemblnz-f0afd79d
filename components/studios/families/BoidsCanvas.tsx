'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type p5Type from 'p5';
import type { RendererProps } from '@/lib/generative-art/families';
import { useDragAdjust } from '@/lib/generative-art/use-drag-adjust';
import { BOIDS_PALETTES, type BoidsPalette } from '@/lib/generative-art/families/boids';
import { backgroundById } from '@/lib/generative-art/backgrounds';
import { stampWatermarkOnCanvas } from '@/lib/generative-art/watermark';
import { canvasScaledToBlob } from '@/lib/generative-art/render-utils';

interface Boid { x: number; y: number; vx: number; vy: number; }

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

export function BoidsCanvas({ presetId, values, seed, background, onAdjust, onExportersReady }: RendererProps) {
  const drag = useDragAdjust(onAdjust, (nx, ny) => ({ cohesion: Number((nx * 3).toFixed(2)), separation: Number(((1 - ny) * 3).toFixed(2)) }));
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5Type | null>(null);
  const [ready, setReady] = useState(false);

  const basePalette = BOIDS_PALETTES[presetId] ?? BOIDS_PALETTES.murmuration;
  const bg = backgroundById(background);
  const palette: BoidsPalette = useMemo(() => {
    if (!bg) return basePalette;
    return { ground: bg.ground, body: bg.ink, trail: bg.inkSoft };
  }, [basePalette, bg]);

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
        let boids: Boid[] = [];
        let w = 0;
        let h = 0;

        function respawn() {
          const { values: v, seed: s } = stateRef.current;
          const rand = mulberry32(s ^ 0xb01d5);
          const target = Math.max(10, Math.round(v.count ?? 480));
          const speed = v.speed ?? 1.5;
          boids = Array.from({ length: target }, () => {
            const angle = rand() * Math.PI * 2;
            return {
              x: rand() * w,
              y: rand() * h,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
            };
          });
        }

        p.setup = () => {
          const rect = containerRef.current!.getBoundingClientRect();
          w = Math.max(320, rect.width);
          h = Math.max(320, rect.height);
          p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
          p.createCanvas(w, h);
          p.background(stateRef.current.palette.ground);
          respawn();
          setReady(true);
        };
        p.windowResized = () => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return;
          w = Math.max(320, rect.width);
          h = Math.max(320, rect.height);
          p.resizeCanvas(w, h);
          p.background(stateRef.current.palette.ground);
          respawn();
        };
        p.draw = () => {
          const { values: v, palette: pal } = stateRef.current;
          const target = Math.max(10, Math.round(v.count ?? 480));
          if (boids.length !== target) respawn();
          const separation = v.separation ?? 1.4;
          const alignment = v.alignment ?? 1.1;
          const cohesion = v.cohesion ?? 0.95;
          const vision = v.vision ?? 42;
          const vision2 = vision * vision;
          const separationRange2 = (vision * 0.5) * (vision * 0.5);
          const maxSpeed = v.speed ?? 1.5;
          const trailAlpha = v.trail ?? 0.04;

          // Trail fade — draw ground on top with low alpha so past positions
          // linger before the ground closes over them.
          const [gr, gg, gb] = hexToRgb(pal.ground);
          p.noStroke();
          p.fill(gr, gg, gb, Math.round((1 - trailAlpha) * 40 + 8));
          p.rect(0, 0, w, h);

          // Reynolds' three rules — O(n²) is fine at flock sizes ≤ 800.
          for (let i = 0; i < boids.length; i++) {
            const b = boids[i];
            let sx = 0, sy = 0;      // separation accumulator
            let ax = 0, ay = 0;      // alignment (avg velocity)
            let cx = 0, cy = 0;      // cohesion (avg position)
            let seen = 0;
            for (let j = 0; j < boids.length; j++) {
              if (i === j) continue;
              const other = boids[j];
              const dx = other.x - b.x;
              const dy = other.y - b.y;
              const d2 = dx * dx + dy * dy;
              if (d2 > vision2 || d2 === 0) continue;
              seen++;
              ax += other.vx;
              ay += other.vy;
              cx += other.x;
              cy += other.y;
              if (d2 < separationRange2) {
                sx -= dx / d2;
                sy -= dy / d2;
              }
            }
            let dvx = 0, dvy = 0;
            if (seen > 0) {
              ax /= seen; ay /= seen;
              cx = cx / seen - b.x;
              cy = cy / seen - b.y;
              dvx += ax * 0.05 * alignment;
              dvy += ay * 0.05 * alignment;
              dvx += cx * 0.002 * cohesion;
              dvy += cy * 0.002 * cohesion;
            }
            dvx += sx * 30 * separation;
            dvy += sy * 30 * separation;

            b.vx += dvx;
            b.vy += dvy;

            // Clamp to max speed.
            const spd = Math.hypot(b.vx, b.vy);
            if (spd > maxSpeed) {
              b.vx = (b.vx / spd) * maxSpeed;
              b.vy = (b.vy / spd) * maxSpeed;
            } else if (spd < maxSpeed * 0.4) {
              // Nudge stuck agents so the flock doesn't clot.
              b.vx = (b.vx / (spd || 1)) * maxSpeed * 0.4;
              b.vy = (b.vy / (spd || 1)) * maxSpeed * 0.4;
            }

            b.x += b.vx;
            b.y += b.vy;
            // Wrap.
            if (b.x < -8) b.x = w + 8;
            else if (b.x > w + 8) b.x = -8;
            if (b.y < -8) b.y = h + 8;
            else if (b.y > h + 8) b.y = -8;
          }

          // Render each boid as a small directed triangle.
          const [br, bg2, bb] = hexToRgb(pal.body);
          const [tr, tg, tb] = hexToRgb(pal.trail);
          p.noStroke();
          for (const b of boids) {
            const angle = Math.atan2(b.vy, b.vx);
            // Trail dot behind the body.
            p.fill(tr, tg, tb, 190);
            p.circle(b.x - Math.cos(angle) * 3, b.y - Math.sin(angle) * 3, 1.6);
            // Body triangle.
            p.fill(br, bg2, bb, 235);
            p.push();
            p.translate(b.x, b.y);
            p.rotate(angle);
            p.triangle(3.5, 0, -2, -1.6, -2, 1.6);
            p.pop();
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
        className="relative mx-auto ga-canvas w-full touch-none cursor-crosshair overflow-hidden rounded-[3px] border border-[color:var(--assembl-cloud)]"
        style={{ background: palette.ground }}
      />
      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[12px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
          assembling…
        </div>
      )}
    </div>
  );
}
