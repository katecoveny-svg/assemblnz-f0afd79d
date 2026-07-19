'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Family, FamilyId, FamilyPreset } from '@/lib/generative-art/families';
import { LINE_FAMILY } from '@/lib/generative-art/families/line';
import { CHROME_FAMILY } from '@/lib/generative-art/families/chrome';
import { FLOW_FAMILY } from '@/lib/generative-art/families/flow';
import { CONSTELLATION_FAMILY } from '@/lib/generative-art/families/constellation';
import { GRID_FAMILY } from '@/lib/generative-art/families/grid';
import { WAVES_FAMILY } from '@/lib/generative-art/families/waves';
import { REACTION_FAMILY } from '@/lib/generative-art/families/reaction';
import { BOIDS_FAMILY } from '@/lib/generative-art/families/boids';
import { ATTRACTORS_FAMILY } from '@/lib/generative-art/families/attractors';
import { GROWTH_FAMILY } from '@/lib/generative-art/families/growth';
import { CHLADNI_FAMILY } from '@/lib/generative-art/families/chladni';
import { VERLET_FAMILY } from '@/lib/generative-art/families/verlet';
import { MARBLE_FAMILY } from '@/lib/generative-art/families/marble';
import { deleteSavedPreset, listSavedPresets, savePreset, type SavedPreset } from '@/lib/generative-art/my-presets';
import { FAMILY_RENDERERS } from './family-renderers';
import { buildCodeSnippet } from '@/lib/generative-art/code-export';
import { shareCopyFor, shareIntents, tryNativeShare } from '@/lib/generative-art/share';
import { ASSET_GROUPS, ASSET_SIZES, type AssetGroup, type AssetSize } from '@/lib/generative-art/asset-sizes';
import { BACKGROUNDS, type BackgroundId } from '@/lib/generative-art/backgrounds';

const FAMILIES: Family[] = [
  LINE_FAMILY,
  CONSTELLATION_FAMILY,
  GRID_FAMILY,
  GROWTH_FAMILY,
  BOIDS_FAMILY,
  ATTRACTORS_FAMILY,
  CHROME_FAMILY,
  WAVES_FAMILY,
  REACTION_FAMILY,
  CHLADNI_FAMILY,
  VERLET_FAMILY,
  MARBLE_FAMILY,
  FLOW_FAMILY,
];
const FAMILY_MAP: Record<FamilyId, Family> = {
  line: LINE_FAMILY,
  chrome: CHROME_FAMILY,
  flow: FLOW_FAMILY,
  constellation: CONSTELLATION_FAMILY,
  grid: GRID_FAMILY,
  waves: WAVES_FAMILY,
  reaction: REACTION_FAMILY,
  boids: BOIDS_FAMILY,
  attractors: ATTRACTORS_FAMILY,
  growth: GROWTH_FAMILY,
  chladni: CHLADNI_FAMILY,
  verlet: VERLET_FAMILY,
  marble: MARBLE_FAMILY,
};

interface StudioState {
  family: FamilyId;
  presetId: string;
  values: Record<string, number>;
  seed: number;
  background: BackgroundId | null;
  text: string;
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
  const bgRaw = sp?.get('bg') as BackgroundId | null;
  const background = bgRaw && BACKGROUNDS.some((b) => b.id === bgRaw) ? bgRaw : null;
  const text = sp?.get('text') ?? '';
  return { family: family.id, presetId: preset.id, values, seed, background, text };
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
  if (state.background) s.set('bg', state.background);
  if (state.text.trim()) s.set('text', state.text);
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

export function GenerativeArtCanvas() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initial = useMemo(() => stateFromSearch(searchParams), []);
  const [state, setState] = useState<StudioState>(initial);
  const [copied, setCopied] = useState<string | null>(null);

  const family = FAMILY_MAP[state.family];
  const preset = pickPreset(family, state.presetId);
  const [shareOpen, setShareOpen] = useState(false);
  const [sharing, setSharing] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?${stateToSearch(state).toString()}`;
  }, [state]);
  const copy = useMemo(() => shareCopyFor(state.family, preset.label), [state.family, preset.label]);

  const exportersRef = useRef<{
    png?: () => Promise<Blob | null> | Blob | null;
    svg?: () => string | null;
    code?: () => string | null;
    renderAtSize?: (w: number, h: number) => Promise<Blob | null>;
  }>({});
  const onExportersReady = useCallback((exp: typeof exportersRef.current) => {
    exportersRef.current = exp;
  }, []);

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
      background: fam.supportsBackground ? prev.background : null,
      text: fam.supportsText ? prev.text : '',
    }));
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
        background: prev.background,
        text: prev.text,
      };
    });
  }, []);

  const setBackground = useCallback((id: BackgroundId | null) => {
    setState((prev) => ({ ...prev, background: id }));
  }, []);
  const setText = useCallback((t: string) => {
    setState((prev) => ({ ...prev, text: t }));
  }, []);

  const patchValue = useCallback((key: string, v: number) => {
    setState((prev) => ({ ...prev, values: { ...prev.values, [key]: v } }));
  }, []);

  const reseed = useCallback(() => {
    setState((prev) => ({ ...prev, seed: Math.floor(Math.random() * 100000) }));
  }, []);

  const download = useCallback((blob: Blob | null, ext: string) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assembl-${state.family}-${state.presetId}-${state.seed}.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [state.family, state.presetId, state.seed]);

  const downloadPng = useCallback(async () => {
    const png = exportersRef.current.png;
    if (!png) return;
    download(await png(), 'png');
  }, [download]);

  const downloadSvg = useCallback(() => {
    const svg = exportersRef.current.svg?.();
    if (!svg) return;
    download(new Blob([svg], { type: 'image/svg+xml' }), 'svg');
  }, [download]);

  const downloadCode = useCallback(() => {
    // Prefer a family-supplied exporter (in case a family wants to bundle its
    // own runtime state), otherwise fall back to the shared builder.
    const src = exportersRef.current.code?.() ?? buildCodeSnippet({
      family: state.family,
      presetId: state.presetId,
      values: state.values,
      seed: state.seed,
      shareUrl,
    });
    download(new Blob([src], { type: 'text/html' }), 'html');
  }, [download, shareUrl, state]);

  const copyShareUrl = useCallback(() => {
    navigator.clipboard.writeText(shareUrl);
    setCopied('link');
    window.setTimeout(() => setCopied(null), 1600);
  }, [shareUrl]);

  const openShare = useCallback(async () => {
    // On mobile / iOS Safari with the Web Share API, offer the native sheet
    // (with the rendered PNG attached when the browser supports files).
    setSharing(true);
    try {
      const pngExporter = exportersRef.current.png;
      const png = pngExporter ? await pngExporter() : null;
      const shared = await tryNativeShare({
        url: shareUrl,
        title: copy.title,
        text: copy.text,
        pngBlob: png,
        filename: `assembl-${state.family}-${state.presetId}-${state.seed}.png`,
      });
      if (!shared) setShareOpen((v) => !v);
    } finally {
      setSharing(false);
    }
  }, [copy.text, copy.title, shareUrl, state.family, state.presetId, state.seed]);

  const intents = useMemo(() => shareIntents(shareUrl, copy.text), [shareUrl, copy.text]);

  const [exportOpen, setExportOpen] = useState(false);
  const [exportGroup, setExportGroup] = useState<AssetGroup>('social');
  const [exportingSize, setExportingSize] = useState<string | null>(null);

  const downloadAtSize = useCallback(
    async (size: AssetSize) => {
      const renderer = exportersRef.current.renderAtSize;
      if (!renderer) return;
      setExportingSize(size.id);
      try {
        const blob = await renderer(size.width, size.height);
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assembl-${state.family}-${state.presetId}-${size.id}-${state.seed}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } finally {
        setExportingSize(null);
      }
    },
    [state.family, state.presetId, state.seed],
  );

  const exportSizesForGroup = useMemo(
    () => ASSET_SIZES.filter((s) => s.group === exportGroup),
    [exportGroup],
  );

  // My presets — localStorage-backed named saves per family.
  const [myPresets, setMyPresets] = useState<SavedPreset[]>([]);
  const refreshMyPresets = useCallback(() => {
    setMyPresets(listSavedPresets(state.family));
  }, [state.family]);
  useEffect(() => { refreshMyPresets(); }, [refreshMyPresets]);

  const saveCurrent = useCallback(() => {
    const label = window.prompt('Name this preset', preset.label);
    if (!label?.trim()) return;
    savePreset({
      family: state.family,
      parentPresetId: state.presetId,
      label: label.trim(),
      values: state.values,
      seed: state.seed,
      background: state.background,
      text: state.text,
    });
    refreshMyPresets();
  }, [preset.label, refreshMyPresets, state.background, state.family, state.presetId, state.seed, state.text, state.values]);

  const applyMyPreset = useCallback((sp: SavedPreset) => {
    setState({
      family: sp.family,
      presetId: sp.parentPresetId,
      values: { ...sp.values },
      seed: sp.seed,
      background: sp.background,
      text: sp.text,
    });
  }, []);

  const removeMyPreset = useCallback((id: string) => {
    deleteSavedPreset(id);
    refreshMyPresets();
  }, [refreshMyPresets]);

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

      {/* My presets — shown when the current family has any saved. Sits
          above the built-in chips so Kate's own looks are one tap away. */}
      {myPresets.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
            my presets · saved to this browser
          </div>
          <div className="flex flex-wrap gap-2">
            {myPresets.map((sp) => (
              <div key={sp.id} className="group flex items-stretch overflow-hidden rounded-[2px] border border-[color:var(--assembl-cloud)]">
                <button
                  type="button"
                  onClick={() => applyMyPreset(sp)}
                  className="px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--text-primary)] hover:bg-[color:var(--assembl-cloud)]/60"
                  title={`seeded from ${sp.parentPresetId}`}
                >
                  {sp.label}
                </button>
                <button
                  type="button"
                  onClick={() => removeMyPreset(sp.id)}
                  aria-label="remove"
                  className="border-l border-[color:var(--assembl-cloud)] px-2 font-mono text-[10.5px] text-[color:var(--text-secondary)] hover:bg-[color:var(--assembl-cloud)]/60 hover:text-[color:var(--text-primary)]"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
        background={state.background}
        text={state.text || null}
        onExportersReady={onExportersReady}
      />

      {/* Background chips + text input — only shown for families that
          declare support for them. */}
      {(family.supportsBackground || family.supportsText) && (
        <div className="flex flex-col gap-3 rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-4">
          {family.supportsBackground && (
            <div className="flex flex-col gap-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                background
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setBackground(null)}
                  className={[
                    'rounded-[2px] border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition',
                    state.background === null
                      ? 'border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
                      : 'border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] text-[color:var(--text-secondary)] hover:border-[color:var(--text-primary)] hover:text-[color:var(--text-primary)]',
                  ].join(' ')}
                >
                  preset
                </button>
                {BACKGROUNDS.map((b) => {
                  const active = state.background === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBackground(b.id)}
                      className={[
                        'rounded-[2px] border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition',
                        active
                          ? 'border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
                          : 'border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] text-[color:var(--text-secondary)] hover:border-[color:var(--text-primary)] hover:text-[color:var(--text-primary)]',
                      ].join(' ')}
                    >
                      {b.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {family.supportsText && (
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                <span>text</span>
                <span className="text-[9.5px] tracking-[0.06em]">cormorant garamond · woven into the piece</span>
              </div>
              <input
                type="text"
                value={state.text}
                onChange={(e) => setText(e.target.value)}
                placeholder="assembl."
                className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-2 font-display text-[16px] italic text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)]/60 focus:border-[color:var(--text-primary)] focus:outline-none"
                spellCheck={false}
                autoComplete="off"
              />
            </div>
          )}
        </div>
      )}

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
            onClick={saveCurrent}
            className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
            title="save this exact state to your browser"
          >
            save
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
          {family.supportsCodeDownload && (
            <button
              type="button"
              onClick={downloadCode}
              className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
              title="download a self-contained html file that reproduces this piece offline"
            >
              code
            </button>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen((v) => !v)}
              className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
              title="download at a preset social / print / wallpaper size"
            >
              export ▾
            </button>
            {exportOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-2 flex min-w-[280px] flex-col overflow-hidden rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] shadow-[0_10px_30px_rgba(35,33,31,0.12)]"
              >
                <div className="flex gap-0 border-b border-[color:var(--assembl-cloud)]">
                  {ASSET_GROUPS.map((g) => {
                    const active = exportGroup === g.id;
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setExportGroup(g.id)}
                        className={[
                          'flex-1 px-2 py-2 font-mono text-[9.5px] uppercase tracking-[0.16em]',
                          active
                            ? 'bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
                            : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]',
                        ].join(' ')}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex max-h-[52vh] flex-col overflow-y-auto">
                  {exportSizesForGroup.map((size) => {
                    const busy = exportingSize === size.id;
                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => downloadAtSize(size)}
                        disabled={busy}
                        className="flex items-baseline justify-between gap-3 px-3 py-2 text-left hover:bg-[color:var(--assembl-cloud)]/60 disabled:opacity-60"
                      >
                        <div>
                          <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-primary)]">
                            {size.label}
                          </div>
                          <div className="font-mono text-[9.5px] tracking-[0.06em] text-[color:var(--text-secondary)]">
                            {size.hint}
                          </div>
                        </div>
                        {busy && (
                          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
                            rendering…
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={openShare}
              disabled={sharing}
              className="rounded-[2px] border border-[color:var(--text-primary)] bg-[color:var(--text-primary)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--assembl-paper)] disabled:opacity-60"
            >
              {sharing ? 'sharing…' : 'share'}
            </button>
            {shareOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-20 mt-2 flex min-w-[180px] flex-col overflow-hidden rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] shadow-[0_10px_30px_rgba(35,33,31,0.12)]"
                onMouseLeave={() => setShareOpen(false)}
              >
                {intents.map((intent) => (
                  <a
                    key={intent.key}
                    href={intent.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShareOpen(false)}
                    className="px-3 py-2 text-left font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--text-primary)] hover:bg-[color:var(--assembl-cloud)]/60"
                  >
                    {intent.label}
                  </a>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    copyShareUrl();
                    setShareOpen(false);
                  }}
                  className="border-t border-[color:var(--assembl-cloud)] px-3 py-2 text-left font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--text-primary)] hover:bg-[color:var(--assembl-cloud)]/60"
                >
                  {copied === 'link' ? 'copied' : 'copy link'}
                </button>
              </div>
            )}
          </div>
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
