'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type p5Type from 'p5';
import type { RendererProps } from '@/lib/generative-art/families';
import { useDragAdjust } from '@/lib/generative-art/use-drag-adjust';
import { FLOW_PALETTES } from '@/lib/generative-art/families/flow';
import { stampWatermarkOnCanvas } from '@/lib/generative-art/watermark';
import { canvasScaledToBlob } from '@/lib/generative-art/render-utils';

interface Particle {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  colorIndex: number;
}

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

export function FlowCanvas({ presetId, values, seed, onAdjust, onExportersReady }: RendererProps) {
  const drag = useDragAdjust(onAdjust, (nx, ny) => ({ noise: Number((0.2 + nx * 2.8).toFixed(2)), speed: Number((0.2 + (1 - ny) * 2.8).toFixed(2)) }));
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5Type | null>(null);
  const [ready, setReady] = useState(false);

  const palette = FLOW_PALETTES[presetId] ?? FLOW_PALETTES.silk;
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
        let particles: Particle[] = [];
        let w = 0;
        let h = 0;
        const noiseScale = 0.0028;

        const respawnAll = () => {
          const { values: v, seed: s } = stateRef.current;
          const rand = mulberry32(s ^ 0xa5a5a5);
          const target = Math.max(20, Math.round(v.particles ?? 800));
          particles = Array.from({ length: target }, () => ({
            x: rand() * w,
            y: rand() * h,
            age: rand() * (v.life ?? 220),
            maxAge: (v.life ?? 220) * (0.6 + rand() * 0.8),
            colorIndex: Math.floor(rand() * stateRef.current.palette.stops.length),
          }));
        };

        p.setup = () => {
          const rect = containerRef.current!.getBoundingClientRect();
          w = Math.max(320, rect.width);
          h = Math.max(320, rect.height);
          p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
          p.createCanvas(w, h);
          p.noiseSeed(stateRef.current.seed);
          p.background(stateRef.current.palette.ground);
          p.strokeCap(p.ROUND);
          p.noFill();
          respawnAll();
          setReady(true);
        };

        p.windowResized = () => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return;
          w = Math.max(320, rect.width);
          h = Math.max(320, rect.height);
          p.resizeCanvas(w, h);
          p.background(stateRef.current.palette.ground);
          respawnAll();
        };

        p.draw = () => {
          const { values: v, palette: pal } = stateRef.current;
          const speed = v.speed ?? 0.9;
          const noiseMul = v.noise ?? 1.1;
          const alpha = v.alpha ?? 0.06;
          const strokeW = v.stroke ?? 1.0;
          const targetCount = Math.max(20, Math.round(v.particles ?? 800));
          if (particles.length !== targetCount) respawnAll();

          // Gentle overlay of the ground colour so old trails fade instead of
          // running the canvas into muck over time.
          const [gr, gg, gb] = hexToRgb(pal.ground);
          p.noStroke();
          p.fill(gr, gg, gb, 6);
          p.rect(0, 0, w, h);

          p.strokeWeight(strokeW);
          for (const particle of particles) {
            const nx = particle.x * noiseScale * noiseMul;
            const ny = particle.y * noiseScale * noiseMul;
            const angle = p.noise(nx, ny, particle.colorIndex * 0.5) * Math.PI * 4;
            const prevX = particle.x;
            const prevY = particle.y;
            particle.x += Math.cos(angle) * speed * 1.4;
            particle.y += Math.sin(angle) * speed * 1.4;
            particle.age += 1;

            const [r, g, b] = hexToRgb(pal.stops[particle.colorIndex % pal.stops.length]);
            p.stroke(r, g, b, alpha * 255);
            p.line(prevX, prevY, particle.x, particle.y);

            if (
              particle.age > particle.maxAge ||
              particle.x < -20 || particle.x > w + 20 ||
              particle.y < -20 || particle.y > h + 20
            ) {
              particle.x = Math.random() * w;
              particle.y = Math.random() * h;
              particle.age = 0;
              particle.maxAge = (v.life ?? 220) * (0.6 + Math.random() * 0.8);
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

  // Reset the canvas when the preset changes (fresh ground colour).
  useEffect(() => {
    const inst = p5Ref.current;
    if (!inst) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (inst as any).background(palette.ground);
  }, [palette.ground, presetId, seed]);

  const png = useCallback(async (): Promise<Blob | null> => {
    const canvas = containerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) return null;
    const stamped = stampWatermarkOnCanvas(canvas, palette.ground);
    return await new Promise<Blob | null>((resolve) => stamped.toBlob((b) => resolve(b), 'image/png'));
  }, [palette.ground]);

  const renderAtSize = useCallback(
    async (w: number, h: number): Promise<Blob | null> => {
      const canvas = containerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
      if (!canvas) return null;
      // Flow is stateful — the trails ARE the current sim. Scale the current
      // frame into the target size with the ground colour behind so the
      // aspect never gets stretched.
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
