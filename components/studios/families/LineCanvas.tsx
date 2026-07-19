'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type p5Type from 'p5';
import type { RendererProps } from '@/lib/generative-art/families';
import { buildShells, shellsToSvg } from '@/lib/generative-art/sketch';
import { PRESETS, type PresetId } from '@/lib/generative-art/presets';
import { stampWatermarkOnCanvas, stampWatermarkOnSvg } from '@/lib/generative-art/watermark';

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

export function LineCanvas({ presetId, values, seed, onExportersReady }: RendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5Type | null>(null);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const [ready, setReady] = useState(false);

  const preset = PRESETS[presetId as PresetId] ?? PRESETS.bloom;

  const stateRef = useRef({ presetId, values, seed });
  stateRef.current = { presetId, values, seed };

  const draw = useCallback((p: p5Type) => {
    const { presetId: pid, values: vals, seed: s } = stateRef.current;
    const preset = PRESETS[pid as PresetId] ?? PRESETS.bloom;
    const { w, h } = sizeRef.current;
    p.background(preset.palette.ground);
    p.strokeJoin(p.ROUND);
    const shells = buildShells({
      width: w,
      height: h,
      params: {
        preset: preset.id,
        shells: vals.shells,
        warp: vals.warp,
        hue: preset.hue,
        tint: preset.tint,
        alpha: vals.alpha,
        stroke: vals.stroke,
        noise: vals.noise,
        seed: s,
      },
      preset,
    });
    for (const shell of shells) {
      const [fr, fg, fb] = hexToRgb(shell.fillHex);
      const [sr, sg, sb] = hexToRgb(shell.strokeHex);
      p.fill(fr, fg, fb, Math.round(shell.fillAlpha * 255));
      p.stroke(sr, sg, sb, Math.round(shell.strokeAlpha * 255));
      p.strokeWeight(vals.stroke);
      p.beginShape();
      for (const pt of shell.points) p.vertex(pt.x, pt.y);
      p.endShape(p.CLOSE);
    }
  }, []);

  useEffect(() => {
    let disposed = false;
    let instance: p5Type | null = null;

    async function init() {
      const mod = await import('p5');
      const P5 = (mod as { default: typeof p5Type }).default;
      if (disposed || !containerRef.current) return;

      instance = new P5((p: p5Type) => {
        p.setup = () => {
          const rect = containerRef.current!.getBoundingClientRect();
          const w = Math.max(320, rect.width);
          const h = Math.max(320, rect.height);
          sizeRef.current = { w, h };
          p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
          p.createCanvas(w, h);
          p.noLoop();
          draw(p);
          setReady(true);
        };
        p.windowResized = () => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const w = Math.max(320, rect.width);
          const h = Math.max(320, rect.height);
          sizeRef.current = { w, h };
          p.resizeCanvas(w, h);
          draw(p);
        };
        p.draw = () => draw(p);
      }, containerRef.current);
      p5Ref.current = instance;
    }

    init();
    return () => {
      disposed = true;
      instance?.remove();
      p5Ref.current = null;
    };
  }, [draw]);

  useEffect(() => {
    if (!p5Ref.current) return;
    const raf = requestAnimationFrame(() => p5Ref.current?.redraw());
    return () => cancelAnimationFrame(raf);
  }, [presetId, values, seed]);

  const png = useCallback(async (): Promise<Blob | null> => {
    if (!p5Ref.current) return null;
    const el = containerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!el) return null;
    const { presetId: pid } = stateRef.current;
    const preset = PRESETS[pid as PresetId] ?? PRESETS.bloom;
    const stamped = stampWatermarkOnCanvas(el, preset.palette.ground);
    return await new Promise<Blob | null>((resolve) => stamped.toBlob((b) => resolve(b), 'image/png'));
  }, []);

  const svg = useCallback((): string | null => {
    const { w, h } = sizeRef.current;
    const { presetId: pid, values: vals, seed: s } = stateRef.current;
    const preset = PRESETS[pid as PresetId] ?? PRESETS.bloom;
    const shells = buildShells({
      width: w,
      height: h,
      params: {
        preset: preset.id,
        shells: vals.shells,
        warp: vals.warp,
        hue: preset.hue,
        tint: preset.tint,
        alpha: vals.alpha,
        stroke: vals.stroke,
        noise: vals.noise,
        seed: s,
      },
      preset,
    });
    const svg = shellsToSvg(shells, w, h, preset.palette.ground, vals.stroke);
    return stampWatermarkOnSvg(svg, preset.palette.ground);
  }, []);

  useEffect(() => {
    onExportersReady?.({ png, svg });
  }, [onExportersReady, png, svg]);

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="relative mx-auto aspect-[0.92/1] w-full max-w-[720px] overflow-hidden rounded-[3px] border border-[color:var(--assembl-cloud)]"
        style={{ background: preset.palette.ground }}
      />
      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[10.5px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
          assembling…
        </div>
      )}
    </div>
  );
}
