'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Family, FamilyId, FamilyPreset } from '@/lib/generative-art/families';
import { LINE_FAMILY } from '@/lib/generative-art/families/line';
import { LIQUID_FAMILY } from '@/lib/generative-art/families/liquid';
import { CHROME_FAMILY } from '@/lib/generative-art/families/chrome';
import { FAMILY_RENDERERS } from './family-renderers';

const FAMILIES: Family[] = [LINE_FAMILY, LIQUID_FAMILY, CHROME_FAMILY];
const FAMILY_MAP: Record<FamilyId, Family> = {
  line: LINE_FAMILY,
  liquid: LIQUID_FAMILY,
  chrome: CHROME_FAMILY,
};

interface StudioState {
  family: FamilyId;
  presetId: string;
  values: Record<string, number>;
  seed: number;
}

function pickFamily(id: string | null): Family {
  if (id && id in FAMILY_MAP) return FAMILY_MAP[id as FamilyId];
  return LINE_FAMILY;
}

function pickPreset(family: Family, id: string | null): FamilyPreset {
  return family.presets.find((p) => p.id === id) ?? family.presets[0];
}

function stateFromSearch(sp: URLSearchParams | null): StudioState {
  const family = pickFamily(sp?.get('family') ?? null);
  const preset = pickPreset(family, sp?.get('preset') ?? null);
  const values = { ...preset.defaults };
  for (const slider of preset.sliders) {
    const raw = sp?.get(slider.key);
    if (raw != null) {
      const v = Number(raw);
      if (Number.isFinite(v)) values[slider.key] = v;
    }
  }
  const seedRaw = sp?.get('seed');
  const seed = seedRaw != null && Number.isFinite(Number(seedRaw)) ? Math.round(Number(seedRaw)) : 8471;
  return { family: family.id, presetId: preset.id, values, seed };
}

function stateToSearch(state: StudioState): URLSearchParams {
  const family = FAMILY_MAP[state.family];
  const preset = pickPreset(family, state.presetId);
  const s = new URLSearchParams();
  s.set('family', state.family);
  s.set('preset', state.presetId);
  s.set('seed', String(state.seed));
  for (const slider of preset.sliders) {
    const v = state.values[slider.key];
    if (v != null) s.set(slider.key, slider.step >= 1 ? String(Math.round(v)) : v.toFixed(3));
  }
  return s;
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

interface AiResult {
  imageUrl: string;
  prompt: string;
  cost: number | null;
}
type AiState =
  | { kind: 'idle' }
  | { kind: 'rendering' }
  | { kind: 'error'; message: string; hint?: string; prompt?: string }
  | { kind: 'done'; result: AiResult };

export function GenerativeArtCanvas() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initial = useMemo(() => stateFromSearch(searchParams), []);
  const [state, setState] = useState<StudioState>(initial);
  const [copied, setCopied] = useState<string | null>(null);
  const [ai, setAi] = useState<AiState>({ kind: 'idle' });

  const family = FAMILY_MAP[state.family];
  const preset = pickPreset(family, state.presetId);

  const exportersRef = useRef<{
    png?: () => Promise<Blob | null> | Blob | null;
    svg?: () => string | null;
  }>({});
  const onExportersReady = useCallback((exp: typeof exportersRef.current) => {
    exportersRef.current = exp;
  }, []);

  // Sync URL params (debounced).
  useEffect(() => {
    const t = window.setTimeout(() => {
      const s = stateToSearch(state);
      router.replace(`?${s.toString()}`, { scroll: false });
    }, 400);
    return () => window.clearTimeout(t);
  }, [state, router]);

  const selectFamily = useCallback((id: FamilyId) => {
    const fam = FAMILY_MAP[id];
    const preset = fam.presets[0];
    setState((prev) => ({
      family: id,
      presetId: preset.id,
      values: { ...preset.defaults },
      seed: prev.seed,
    }));
    setAi({ kind: 'idle' });
  }, []);

  const selectPreset = useCallback((id: string) => {
    setState((prev) => {
      const fam = FAMILY_MAP[prev.family];
      const preset = pickPreset(fam, id);
      return {
        family: prev.family,
        presetId: id,
        values: { ...preset.defaults },
        seed: prev.seed,
      };
    });
    setAi({ kind: 'idle' });
  }, []);

  const patchValue = useCallback((key: string, v: number) => {
    setState((prev) => ({ ...prev, values: { ...prev.values, [key]: v } }));
  }, []);

  const reseed = useCallback(() => {
    setState((prev) => ({ ...prev, seed: Math.floor(Math.random() * 100000) }));
  }, []);

  const downloadPng = useCallback(async () => {
    const png = exportersRef.current.png;
    if (!png) return;
    const blob = await png();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assembl-${state.family}-${state.presetId}-${state.seed}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [state.family, state.presetId, state.seed]);

  const downloadSvg = useCallback(() => {
    const svg = exportersRef.current.svg?.();
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assembl-${state.family}-${state.presetId}-${state.seed}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [state.family, state.presetId, state.seed]);

  const copyShareUrl = useCallback(() => {
    const s = stateToSearch(state);
    const url = `${window.location.origin}${window.location.pathname}?${s.toString()}`;
    navigator.clipboard.writeText(url);
    setCopied('link');
    window.setTimeout(() => setCopied(null), 1600);
  }, [state]);

  const renderAtFirefly = useCallback(async () => {
    setAi({ kind: 'rendering' });
    try {
      const res = await fetch('/api/creative-playground/render', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          family: state.family,
          presetId: state.presetId,
          values: state.values,
          seed: state.seed,
        }),
      });
      const body = await res.json();
      if (body?.ok) {
        setAi({
          kind: 'done',
          result: { imageUrl: body.imageUrl, prompt: body.prompt, cost: body.cost_usd },
        });
      } else {
        setAi({
          kind: 'error',
          message: body?.error ?? 'render failed',
          hint: body?.hint,
          prompt: body?.prompt,
        });
      }
    } catch (err) {
      setAi({ kind: 'error', message: err instanceof Error ? err.message : 'render failed' });
    }
  }, [state]);

  const Renderer = FAMILY_RENDERERS[family.id];

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Family tabs */}
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="family">
        {FAMILIES.map((f) => {
          const active = state.family === f.id;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectFamily(f.id)}
              className={[
                'group flex flex-col items-start rounded-[3px] border px-3.5 py-2 text-left transition',
                active
                  ? 'border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
                  : 'border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] text-[color:var(--text-primary)] hover:border-[color:var(--text-primary)]',
              ].join(' ')}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.24em]">{f.label}</span>
              <span
                className={[
                  'mt-0.5 font-mono text-[9.5px] tracking-[0.06em]',
                  active ? 'text-[color:var(--assembl-paper)]/70' : 'text-[color:var(--text-secondary)]',
                ].join(' ')}
              >
                {f.blurb}
              </span>
            </button>
          );
        })}
      </div>

      {/* Preset chips */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="preset">
        {family.presets.map((p) => {
          const active = state.presetId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectPreset(p.id)}
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

      {/* Renderer */}
      <Renderer
        presetId={state.presetId}
        values={state.values}
        seed={state.seed}
        ground={family.ground}
        onExportersReady={onExportersReady}
      />

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
          {family.supportsPngDownload && (
            <button
              type="button"
              onClick={downloadPng}
              className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
            >
              png
            </button>
          )}
          {family.supportsSvgDownload && (
            <button
              type="button"
              onClick={downloadSvg}
              className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
            >
              svg
            </button>
          )}
        </div>
      </div>

      {/* Sliders */}
      {preset.sliders.length > 0 && (
        <div className="grid gap-4 rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-4 sm:grid-cols-2">
          {preset.sliders.map((slider) => {
            const value = state.values[slider.key] ?? preset.defaults[slider.key] ?? slider.min;
            const display = slider.format ? slider.format(value) : String(value);
            return (
              <SliderRow
                key={slider.key}
                label={slider.label}
                value={value}
                min={slider.min}
                max={slider.max}
                step={slider.step}
                display={display}
                onChange={(v) => patchValue(slider.key, v)}
              />
            );
          })}
          <SliderRow
            label="seed"
            value={state.seed}
            min={0}
            max={99999}
            step={1}
            display={String(state.seed)}
            onChange={(v) => setState((prev) => ({ ...prev, seed: Math.round(v) }))}
          />
        </div>
      )}

      {/* Cross-family AI "Render at Firefly quality" — hide on Liquid (that family
          IS the AI call — no need for a second one). */}
      {!family.isAiFirst && (
        <div className="flex flex-col gap-3 rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">
                render at firefly quality
              </div>
              <div className="mt-1 font-mono text-[10.5px] tracking-[0.05em] text-[color:var(--text-secondary)]">
                {family.id === 'line'
                  ? 'send this sketch to fal flux 1.1 pro — painterly, editorial'
                  : 'send this scene to fal flux 1.1 pro — richer, cinematic 3d'}
              </div>
            </div>
            <button
              type="button"
              onClick={renderAtFirefly}
              disabled={ai.kind === 'rendering'}
              className="rounded-[2px] border border-[color:var(--text-primary)] bg-[color:var(--text-primary)] px-3.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--assembl-paper)] disabled:opacity-60"
            >
              {ai.kind === 'rendering' ? 'assembling…' : 'render'}
            </button>
          </div>
          {ai.kind === 'done' && (
            <div className="mt-1 overflow-hidden rounded-[2px] border border-[color:var(--assembl-cloud)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ai.result.imageUrl} alt="firefly render" className="block h-auto w-full" />
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
                <span>fal flux 1.1 pro · seed {state.seed}</span>
                {ai.result.cost != null && <span>~${ai.result.cost.toFixed(2)} usd</span>}
              </div>
            </div>
          )}
          {ai.kind === 'error' && (
            <div className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-2 font-mono text-[10.5px] leading-[1.55] text-[color:var(--text-primary)]">
              {ai.message}
              {ai.hint && (
                <div className="mt-1 text-[color:var(--text-secondary)]">{ai.hint}</div>
              )}
            </div>
          )}
        </div>
      )}

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
