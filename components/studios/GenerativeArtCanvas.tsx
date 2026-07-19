'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type p5Type from 'p5';
import {
  PRESETS,
  PRESET_ORDER,
  defaultParams,
  type PresetId,
  type SketchParams,
} from '@/lib/generative-art/presets';
import { buildShells, shellsToSvg } from '@/lib/generative-art/sketch';

type P5Ctor = typeof p5Type;

function paramsToSearch(params: SketchParams): URLSearchParams {
  const s = new URLSearchParams();
  s.set('preset', params.preset);
  s.set('shells', String(params.shells));
  s.set('warp', params.warp.toFixed(2));
  s.set('hue', String(Math.round(params.hue)));
  s.set('tint', params.tint.toFixed(2));
  s.set('alpha', params.alpha.toFixed(3));
  s.set('stroke', params.stroke.toFixed(2));
  s.set('noise', params.noise.toFixed(2));
  s.set('seed', String(params.seed));
  return s;
}

function paramsFromSearch(sp: URLSearchParams | null): SketchParams | null {
  if (!sp) return null;
  const preset = (sp.get('preset') as PresetId) || null;
  if (!preset || !(preset in PRESETS)) return null;
  const base = defaultParams(preset);
  const num = (k: string, fallback: number) => {
    const raw = sp.get(k);
    if (raw == null) return fallback;
    const v = Number(raw);
    return Number.isFinite(v) ? v : fallback;
  };
  return {
    preset,
    shells: Math.round(num('shells', base.shells)),
    warp: num('warp', base.warp),
    hue: num('hue', base.hue),
    tint: num('tint', base.tint),
    alpha: num('alpha', base.alpha),
    stroke: num('stroke', base.stroke),
    noise: num('noise', base.noise),
    seed: Math.round(num('seed', base.seed)),
  };
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, step, display, onChange }: SliderRowProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
        <span>{label}</span>
        <span className="text-[color:var(--text-primary)]">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="ga-slider h-1 w-full cursor-pointer appearance-none bg-[color:var(--assembl-cloud)]"
      />
    </label>
  );
}

export function GenerativeArtCanvas() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialParams = useMemo(
    () => paramsFromSearch(searchParams) ?? defaultParams('bloom'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const [params, setParams] = useState<SketchParams>(initialParams);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5Type | null>(null);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const [canvasReady, setCanvasReady] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const preset = PRESETS[params.preset];

  const draw = useCallback((p: p5Type) => {
    const current = paramsRef.current;
    const preset = PRESETS[current.preset];
    const { w, h } = sizeRef.current;
    p.background(preset.palette.ground);
    p.noFill();
    p.strokeJoin(p.ROUND);
    const shells = buildShells({ width: w, height: h, params: current, preset });
    for (const shell of shells) {
      const [fr, fg, fb] = hexToRgb(shell.fillHex);
      const [sr, sg, sb] = hexToRgb(shell.strokeHex);
      p.fill(fr, fg, fb, Math.round(shell.fillAlpha * 255));
      p.stroke(sr, sg, sb, Math.round(shell.strokeAlpha * 255));
      p.strokeWeight(current.stroke);
      p.beginShape();
      for (const pt of shell.points) {
        p.vertex(pt.x, pt.y);
      }
      p.endShape(p.CLOSE);
    }
  }, []);

  useEffect(() => {
    let disposed = false;
    let p5Instance: p5Type | null = null;

    async function init() {
      const mod = await import('p5');
      const P5: P5Ctor = (mod as { default: P5Ctor }).default;
      if (disposed || !containerRef.current) return;

      const sketch = (p: p5Type) => {
        p.setup = () => {
          const el = containerRef.current!;
          const rect = el.getBoundingClientRect();
          const w = Math.max(320, rect.width);
          const h = Math.max(320, rect.height);
          sizeRef.current = { w, h };
          p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
          p.createCanvas(w, h);
          p.noLoop();
          draw(p);
          setCanvasReady(true);
        };
        p.windowResized = () => {
          const el = containerRef.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const w = Math.max(320, rect.width);
          const h = Math.max(320, rect.height);
          sizeRef.current = { w, h };
          p.resizeCanvas(w, h);
          draw(p);
        };
        p.draw = () => draw(p);
      };

      p5Instance = new P5(sketch, containerRef.current);
      p5Ref.current = p5Instance;
    }

    init();
    return () => {
      disposed = true;
      p5Instance?.remove();
      p5Ref.current = null;
    };
  }, [draw]);

  // Redraw on param change (throttled via rAF).
  useEffect(() => {
    if (!p5Ref.current) return;
    let raf = requestAnimationFrame(() => {
      p5Ref.current?.redraw();
    });
    return () => cancelAnimationFrame(raf);
  }, [params]);

  // Sync URL params (debounced).
  useEffect(() => {
    const t = window.setTimeout(() => {
      const s = paramsToSearch(params);
      router.replace(`?${s.toString()}`, { scroll: false });
    }, 400);
    return () => window.clearTimeout(t);
  }, [params, router]);

  const applyPreset = useCallback((id: PresetId) => {
    setParams({ ...defaultParams(id), seed: paramsRef.current.seed });
  }, []);

  const patch = useCallback((p: Partial<SketchParams>) => {
    setParams((prev) => ({ ...prev, ...p }));
  }, []);

  const reseed = useCallback(() => {
    setParams((prev) => ({ ...prev, seed: Math.floor(Math.random() * 100000) }));
  }, []);

  const downloadPng = useCallback(() => {
    if (!p5Ref.current) return;
    p5Ref.current.saveCanvas(`assembl-${params.preset}-${params.seed}`, 'png');
  }, [params.preset, params.seed]);

  const downloadSvg = useCallback(() => {
    const { w, h } = sizeRef.current;
    const preset = PRESETS[params.preset];
    const shells = buildShells({ width: w, height: h, params, preset });
    const svg = shellsToSvg(shells, w, h, preset.palette.ground, params.stroke);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assembl-${params.preset}-${params.seed}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [params]);

  const copyShareUrl = useCallback(() => {
    const s = paramsToSearch(params);
    const url = `${window.location.origin}${window.location.pathname}?${s.toString()}`;
    navigator.clipboard.writeText(url);
    setCopied('link');
    window.setTimeout(() => setCopied(null), 1600);
  }, [params]);

  return (
    <div className="flex w-full flex-col gap-5">
      {/* Preset chips */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="preset">
        {PRESET_ORDER.map((id) => {
          const p = PRESETS[id];
          const active = params.preset === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => applyPreset(id)}
              className={[
                'rounded-[2px] border px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] transition',
                active
                  ? 'border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
                  : 'border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] text-[color:var(--text-secondary)] hover:border-[color:var(--text-primary)] hover:text-[color:var(--text-primary)]',
              ].join(' ')}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Canvas frame */}
      <div className="relative w-full">
        <div
          ref={containerRef}
          className="relative mx-auto aspect-[0.92/1] w-full max-w-[720px] overflow-hidden rounded-[3px] border border-[color:var(--assembl-cloud)]"
          style={{ background: preset.palette.ground }}
        />
        {!canvasReady && (
          <div className="absolute inset-0 flex items-center justify-center font-mono text-[10.5px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">
            assembling…
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          {preset.blurb}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reseed}
            className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
          >
            new seed
          </button>
          <button
            type="button"
            onClick={copyShareUrl}
            className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
          >
            {copied === 'link' ? 'copied' : 'copy link'}
          </button>
          <button
            type="button"
            onClick={downloadPng}
            className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
          >
            png
          </button>
          <button
            type="button"
            onClick={downloadSvg}
            className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
          >
            svg
          </button>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid gap-4 rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-4 sm:grid-cols-2">
        <SliderRow
          label="shells"
          value={params.shells}
          min={5}
          max={40}
          step={1}
          display={String(params.shells)}
          onChange={(v) => patch({ shells: v })}
        />
        <SliderRow
          label="warp"
          value={params.warp}
          min={0}
          max={1}
          step={0.01}
          display={params.warp.toFixed(2)}
          onChange={(v) => patch({ warp: v })}
        />
        <SliderRow
          label="alpha"
          value={params.alpha}
          min={0.03}
          max={0.20}
          step={0.005}
          display={params.alpha.toFixed(3)}
          onChange={(v) => patch({ alpha: v })}
        />
        <SliderRow
          label="stroke"
          value={params.stroke}
          min={0.5}
          max={2.5}
          step={0.05}
          display={`${params.stroke.toFixed(2)}px`}
          onChange={(v) => patch({ stroke: v })}
        />
        <SliderRow
          label="noise"
          value={params.noise}
          min={0.5}
          max={3}
          step={0.05}
          display={params.noise.toFixed(2)}
          onChange={(v) => patch({ noise: v })}
        />
        <SliderRow
          label="seed"
          value={params.seed}
          min={0}
          max={99999}
          step={1}
          display={String(params.seed)}
          onChange={(v) => patch({ seed: Math.round(v) })}
        />
      </div>

      <style jsx global>{`
        input.ga-slider {
          border-radius: 999px;
        }
        input.ga-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 999px;
          background: var(--text-primary);
          cursor: pointer;
          border: 2px solid var(--assembl-paper);
          box-shadow: 0 0 0 1px var(--text-primary);
        }
        input.ga-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 999px;
          background: var(--text-primary);
          cursor: pointer;
          border: 2px solid var(--assembl-paper);
          box-shadow: 0 0 0 1px var(--text-primary);
        }
      `}</style>
    </div>
  );
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
