'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RendererProps } from '@/lib/generative-art/families';
import { useDragAdjust } from '@/lib/generative-art/use-drag-adjust';
import { ORBIT_PALETTES } from '@/lib/generative-art/families/orbit';
import { stampWatermarkOnCanvas } from '@/lib/generative-art/watermark';
import { canvasScaledToBlob } from '@/lib/generative-art/render-utils';

/**
 * Orbit — the assembl mark as a generative system.
 *
 * Plain 2D canvas, no p5: the composition is ellipses with a depth trick (back
 * arc dimmed and drawn first, core, then the front arc at full strength), which
 * is exactly how the brand mark reads. Deterministic from the seed, so a link
 * reproduces a piece.
 */

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

export function OrbitCanvas({ presetId, values, seed, onAdjust, onExportersReady }: RendererProps) {
  const drag = useDragAdjust(onAdjust, (nx, ny) => ({
    spread: Number(nx.toFixed(2)),
    tilt: Number((1 - ny).toFixed(2)),
  }));
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const palette = ORBIT_PALETTES[presetId] ?? ORBIT_PALETTES.mark;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const host = containerRef.current;
    if (!canvas || !host) return;
    const r = host.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.max(320, r.width), H = Math.max(320, r.height);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const rnd = mulberry32(seed);
    const systems = Math.max(1, Math.round(Number(values.systems ?? 5)));
    const ringsEach = Math.max(1, Math.round(Number(values.rings ?? 2)));
    const spread = Number(values.spread ?? 0.6);
    const tilt = Number(values.tilt ?? 0.5);
    const weight = Number(values.weight ?? 2.2);
    const coreSize = Number(values.coreSize ?? 0.05);
    const dustAmt = Number(values.dust ?? 0.2);

    ctx.fillStyle = palette.ground;
    ctx.fillRect(0, 0, W, H);

    const minDim = Math.min(W, H);

    // dust first — it sits behind everything, like the brand's gold drift
    const dustCount = Math.round(dustAmt * 420);
    ctx.fillStyle = palette.dust;
    for (let i = 0; i < dustCount; i++) {
      const x = rnd() * W, y = rnd() * H;
      const s = 0.4 + rnd() * 1.5;
      ctx.globalAlpha = 0.12 + rnd() * 0.3;
      ctx.beginPath();
      ctx.arc(x, y, s, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // one system: rings behind → core → rings in front
    const single = systems === 1;
    for (let s = 0; s < systems; s++) {
      const cx = single ? W / 2 : W * (0.12 + rnd() * 0.76);
      const cy = single ? H / 2 : H * (0.12 + rnd() * 0.76);
      const base = minDim * (single ? 0.34 : 0.05 + rnd() * 0.16 * (0.4 + spread));
      const core = minDim * coreSize * (single ? 1 : 0.5 + rnd());

      const geoms: { rx: number; ry: number; rot: number }[] = [];
      for (let k = 0; k < ringsEach; k++) {
        const rx = base * (1 + k * 0.24);
        const ry = rx * (0.24 + (1 - tilt) * 0.62 + rnd() * 0.12);
        const rot = (rnd() - 0.5) * Math.PI * tilt;
        geoms.push({ rx, ry, rot });
      }

      // back halves
      ctx.strokeStyle = palette.ringBack;
      ctx.lineWidth = weight;
      geoms.forEach((g) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, g.rx, g.ry, g.rot, Math.PI, Math.PI * 2);
        ctx.stroke();
      });

      // the core — a lit sphere, not a flat dot
      const grad = ctx.createRadialGradient(
        cx - core * 0.34, cy - core * 0.34, core * 0.1,
        cx, cy, core,
      );
      grad.addColorStop(0, palette.core);
      grad.addColorStop(1, palette.coreDeep);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, core, 0, Math.PI * 2);
      ctx.fill();

      // front halves
      ctx.strokeStyle = palette.ring;
      geoms.forEach((g) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, g.rx, g.ry, g.rot, 0, Math.PI);
        ctx.stroke();
      });
    }

    setReady(true);
  }, [palette, seed, values]);

  useEffect(() => {
    draw();
    const ro = new ResizeObserver(() => draw());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [draw]);

  const png = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const stamped = stampWatermarkOnCanvas(canvas, palette.ground);
    return await new Promise((resolve) => stamped.toBlob((b) => resolve(b), 'image/png'));
  }, [palette.ground]);

  const renderAtSize = useCallback(
    async (w: number, h: number): Promise<Blob | null> => {
      const canvas = canvasRef.current;
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
      >
        <canvas ref={canvasRef} className="block h-full w-full" />
      </div>
      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[12px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
          assembling…
        </div>
      )}
    </div>
  );
}
