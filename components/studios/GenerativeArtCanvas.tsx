'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Family, FamilyId, FamilyPreset } from '@/lib/generative-art/families';
import { LINE_FAMILY } from '@/lib/generative-art/families/line';
import { CHROME_FAMILY } from '@/lib/generative-art/families/chrome';
import { FLOW_FAMILY } from '@/lib/generative-art/families/flow';
import { CONSTELLATION_FAMILY } from '@/lib/generative-art/families/constellation';
import { GRID_FAMILY } from '@/lib/generative-art/families/grid';
import { ORBIT_FAMILY } from '@/lib/generative-art/families/orbit';
import { WAVES_FAMILY } from '@/lib/generative-art/families/waves';
import { REACTION_FAMILY } from '@/lib/generative-art/families/reaction';
import { BOIDS_FAMILY } from '@/lib/generative-art/families/boids';
import { ATTRACTORS_FAMILY } from '@/lib/generative-art/families/attractors';
import { GROWTH_FAMILY } from '@/lib/generative-art/families/growth';
import { CHLADNI_FAMILY } from '@/lib/generative-art/families/chladni';
import { VERLET_FAMILY } from '@/lib/generative-art/families/verlet';
import { MARBLE_FAMILY } from '@/lib/generative-art/families/marble';
import { TERRAIN_FAMILY } from '@/lib/generative-art/families/terrain';
import { SANDPILE_FAMILY } from '@/lib/generative-art/families/sandpile';
import { RIPPLES_FAMILY } from '@/lib/generative-art/families/ripples';
import { DLA_FAMILY } from '@/lib/generative-art/families/dla';
import { deleteSavedPreset, listSavedPresets, savePreset, type SavedPreset } from '@/lib/generative-art/my-presets';
import { FAMILY_RENDERERS } from './family-renderers';
import { buildCodeSnippet } from '@/lib/generative-art/code-export';
import { shareCopyFor, shareIntents, tryNativeShare } from '@/lib/generative-art/share';
import { ASSET_GROUPS, ASSET_SIZES, type AssetGroup, type AssetSize } from '@/lib/generative-art/asset-sizes';
import { BACKGROUNDS, type BackgroundId } from '@/lib/generative-art/backgrounds';

type AspectId = 'classic' | 'square' | 'hero' | 'portrait';
interface AspectSpec { id: AspectId; label: string; ratio: string; maxWidth: string; hint: string; }
const ASPECTS: AspectSpec[] = [
  { id: 'classic',  label: 'Classic',  ratio: '0.92 / 1', maxWidth: '720px',  hint: '0.92 : 1' },
  { id: 'square',   label: 'Square',   ratio: '1 / 1',    maxWidth: '720px',  hint: '1 : 1' },
  { id: 'hero',     label: 'Hero',     ratio: '21 / 9',   maxWidth: '1200px', hint: '21 : 9' },
  { id: 'portrait', label: 'Portrait', ratio: '9 / 16',   maxWidth: '480px',  hint: '9 : 16' },
];

// --- Text overlay (assembl fonts) ------------------------------------------
type OverlayFont = 'cormorant' | 'jost' | 'mono';
type OverlayColor = 'ink' | 'navy' | 'paper' | 'champagne' | 'brass' | 'gold';
interface TextOverlay {
  on: boolean;
  text: string;
  font: OverlayFont;
  weight: number;
  size: number;              // px at live canvas scale
  color: OverlayColor;
  align: 'left' | 'center' | 'right';
  x: number;                 // 0..1 fraction of canvas width
  y: number;                 // 0..1 fraction of canvas height
}
const OVERLAY_FONTS: Record<OverlayFont, { label: string; css: string; weights: number[] }> = {
  cormorant: { label: 'Cormorant', css: "'Cormorant Garamond', Georgia, serif", weights: [300, 400, 500, 600, 700] },
  jost:      { label: 'Jost',      css: "'Jost', system-ui, sans-serif",        weights: [200, 300, 400, 500, 700] },
  mono:      { label: 'Space Mono',css: "'Space Mono', ui-monospace, monospace", weights: [400, 700] },
};
/** BRAND-CANON.md §5 — the only colours type may be set in. */
const OVERLAY_COLORS: Record<OverlayColor, string> = {
  ink: '#1C1B18',
  navy: '#050F1C',
  paper: '#FAFAF7',
  champagne: '#BFA37A',
  brass: '#B8964F',
  gold: '#D4A843',
};
const DEFAULT_OVERLAY: TextOverlay = {
  on: false, text: '', font: 'jost', weight: 500, size: 48,
  color: 'ink', align: 'center', x: 0.5, y: 0.5,
};

/** Social export sizes — exact pixels each platform actually wants. */
const SOCIAL_SIZES: { id: string; label: string; w: number; h: number }[] = [
  { id: 'native',    label: 'Native',              w: 0,    h: 0 },
  { id: 'ig-square', label: 'Instagram square',    w: 1080, h: 1080 },
  { id: 'ig-story',  label: 'Instagram story',     w: 1080, h: 1920 },
  { id: 'ig-port',   label: 'Instagram portrait',  w: 1080, h: 1350 },
  { id: 'li-post',   label: 'LinkedIn post',       w: 1200, h: 1200 },
  { id: 'li-banner', label: 'LinkedIn banner',     w: 1584, h: 396 },
  { id: 'fb-post',   label: 'Facebook post',       w: 1200, h: 630 },
  { id: 'tiktok',    label: 'TikTok',              w: 1080, h: 1920 },
  { id: 'x-post',    label: 'X post',              w: 1600, h: 900 },
  { id: 'og',        label: 'OG / share card',     w: 1200, h: 630 },
];

/**
 * The assembl wordmark, composited onto EVERY export — Kate's rule, 29 July
 * 2026: "I need the assembl wordmark on ALL generations."
 *
 * Drawn at a size proportional to the canvas so it reads on a story and on a
 * banner alike, and auto-toned: light mark on dark art, ink mark on light art,
 * decided by sampling the corner it sits in.
 */
function drawWordmark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const pad = Math.round(Math.min(w, h) * 0.045);
  const size = Math.max(13, Math.round(Math.min(w, h) * 0.028));

  // sample the corner to decide the mark's tone
  let light = false;
  try {
    const box = ctx.getImageData(Math.max(0, w - pad * 7), Math.max(0, h - pad * 3), Math.min(pad * 6, w), Math.min(pad * 2, h));
    let sum = 0;
    for (let i = 0; i < box.data.length; i += 4) {
      sum += 0.299 * box.data[i] + 0.587 * box.data[i + 1] + 0.114 * box.data[i + 2];
    }
    light = sum / (box.data.length / 4) > 128;
  } catch { /* tainted or empty — fall back to the light mark */ }

  const ink = light ? 'rgba(28,27,24,0.92)' : 'rgba(250,250,247,0.92)';
  ctx.save();
  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `500 ${size}px 'Cormorant Garamond', Georgia, serif`;
  ctx.fillStyle = ink;
  ctx.fillText('assembl', w - pad, h - pad);
  // the champagne dot — the mark's tell
  const tw = ctx.measureText('assembl').width;
  ctx.beginPath();
  ctx.arc(w - pad - tw - size * 0.45, h - pad - size * 0.28, size * 0.13, 0, Math.PI * 2);
  ctx.fillStyle = '#BFA37A';
  ctx.fill();
  ctx.restore();
}

/**
 * Finish an exported PNG: resize to the chosen social size (cover-cropped so
 * nothing squashes), composite the text overlay, then stamp the wordmark.
 * Runs on EVERY png export — there is no path that skips the wordmark.
 */
async function compositeOverlay(
  blob: Blob,
  overlay: TextOverlay,
  scale = 1,
  sizeId = 'native',
): Promise<Blob> {
  const img = new Image();
  const url = URL.createObjectURL(blob);
  await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('decode')); img.src = url; });
  URL.revokeObjectURL(url);

  const target = SOCIAL_SIZES.find((z) => z.id === sizeId);
  const outW = target && target.w ? target.w : img.width;
  const outH = target && target.h ? target.h : img.height;

  const out = document.createElement('canvas');
  out.width = outW;
  out.height = outH;
  const ctx = out.getContext('2d');
  if (!ctx) return blob;

  // cover-crop the art into the target frame
  const s2 = Math.max(outW / img.width, outH / img.height);
  const dw = img.width * s2, dh = img.height * s2;
  ctx.drawImage(img, (outW - dw) / 2, (outH - dh) / 2, dw, dh);
  scale = scale * (outW / Math.max(1, img.width));
  if (overlay.on && overlay.text.trim()) {
    const spec = OVERLAY_FONTS[overlay.font];
    // Scale the on-screen px size to the export's pixel width (the live
    // canvas is ~720 CSS px wide at classic aspect).
    const fontPx = Math.max(8, Math.round(overlay.size * (img.width / 720) * scale));
    try { await document.fonts.load(`${overlay.weight} ${fontPx}px ${spec.css.split(',')[0]}`); } catch { /* fallback stack */ }
    ctx.font = `${overlay.weight} ${fontPx}px ${spec.css}`;
    ctx.fillStyle = OVERLAY_COLORS[overlay.color];
    ctx.textAlign = overlay.align;
    ctx.textBaseline = 'middle';
    // wrap on newlines so a headline can breathe
    const lines = overlay.text.split('\n');
    const lh = fontPx * 1.18;
    lines.forEach((ln, i) => {
      ctx.fillText(ln, overlay.x * out.width, overlay.y * out.height + (i - (lines.length - 1) / 2) * lh);
    });
  }
  drawWordmark(ctx, outW, outH);
  return await new Promise<Blob>((resolve) => out.toBlob((b) => resolve(b ?? blob), 'image/png'));
}

const FAMILIES: Family[] = [
  ORBIT_FAMILY,
  LINE_FAMILY,
  CONSTELLATION_FAMILY,
  GRID_FAMILY,
  GROWTH_FAMILY,
  DLA_FAMILY,
  BOIDS_FAMILY,
  ATTRACTORS_FAMILY,
  SANDPILE_FAMILY,
  CHROME_FAMILY,
  WAVES_FAMILY,
  TERRAIN_FAMILY,
  RIPPLES_FAMILY,
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
  orbit: ORBIT_FAMILY,
  grid: GRID_FAMILY,
  waves: WAVES_FAMILY,
  reaction: REACTION_FAMILY,
  boids: BOIDS_FAMILY,
  attractors: ATTRACTORS_FAMILY,
  growth: GROWTH_FAMILY,
  chladni: CHLADNI_FAMILY,
  verlet: VERLET_FAMILY,
  marble: MARBLE_FAMILY,
  terrain: TERRAIN_FAMILY,
  sandpile: SANDPILE_FAMILY,
  ripples: RIPPLES_FAMILY,
  dla: DLA_FAMILY,
};

interface StudioState {
  family: FamilyId;
  presetId: string;
  values: Record<string, number>;
  seed: number;
  background: BackgroundId | null;
  text: string;
  aspect: AspectId;
  overlay: TextOverlay;
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
  const arRaw = sp?.get('ar') as AspectId | null;
  const aspect: AspectId = arRaw && ASPECTS.some((a) => a.id === arRaw) ? arRaw : 'classic';
  const overlay: TextOverlay = { ...DEFAULT_OVERLAY };
  const ot = sp?.get('t');
  if (ot) {
    overlay.on = true;
    overlay.text = ot;
    const f = sp?.get('tf') as OverlayFont | null;
    if (f && f in OVERLAY_FONTS) overlay.font = f;
    const num = (k: string, fb: number) => { const v = Number(sp?.get(k)); return Number.isFinite(v) ? v : fb; };
    overlay.weight = num('twt', overlay.weight);
    overlay.size = num('tsz', overlay.size);
    overlay.x = num('tx', overlay.x);
    overlay.y = num('ty', overlay.y);
    const c = sp?.get('tc');
    if (c === 'champagne') overlay.color = 'champagne';
    const a = sp?.get('ta');
    if (a === 'left' || a === 'right') overlay.align = a;
  }
  return { family: family.id, presetId: preset.id, values, seed, background, text, aspect, overlay };
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
  if (state.aspect !== 'classic') s.set('ar', state.aspect);
  if (state.overlay.on && state.overlay.text.trim()) {
    s.set('t', state.overlay.text);
    s.set('tf', state.overlay.font);
    s.set('twt', String(state.overlay.weight));
    s.set('tsz', String(Math.round(state.overlay.size)));
    s.set('tx', state.overlay.x.toFixed(3));
    s.set('ty', state.overlay.y.toFixed(3));
    if (state.overlay.color !== 'ink') s.set('tc', state.overlay.color);
    if (state.overlay.align !== 'center') s.set('ta', state.overlay.align);
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
      <div className="flex items-baseline justify-between font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
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
  /** Exact platform pixel sizes — Kate, 29 Jul: 'preset size export for all social media'. */
  const [socialSize, setSocialSize] = useState<string>('native');

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
      aspect: prev.aspect,
      overlay: prev.overlay,
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
        aspect: prev.aspect,
        overlay: prev.overlay,
      };
    });
  }, []);

  const setAspect = useCallback((id: AspectId) => {
    setState((prev) => ({ ...prev, aspect: id }));
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
    const blob = await png();
    if (!blob) return;
    download(await compositeOverlay(blob, state.overlay, 1, socialSize), 'png');
  }, [download, state.overlay, socialSize]);

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
        const raw = await renderer(size.width, size.height);
        if (!raw) return;
        const blob = await compositeOverlay(raw, state.overlay);
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
    [state.family, state.presetId, state.seed, state.overlay],
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
    setState((prev) => ({
      family: sp.family,
      presetId: sp.parentPresetId,
      values: { ...sp.values },
      seed: sp.seed,
      background: sp.background,
      text: sp.text,
      aspect: prev.aspect,
      overlay: prev.overlay,
    }));
  }, []);

  const removeMyPreset = useCallback((id: string) => {
    deleteSavedPreset(id);
    refreshMyPresets();
  }, [refreshMyPresets]);

  const Renderer = FAMILY_RENDERERS[family.id];
  const currentAspect = ASPECTS.find((a) => a.id === state.aspect) ?? ASPECTS[0];

  return (
    <div
      className="flex w-full flex-col gap-6"
      style={{
        // Renderers pick up these CSS vars via .ga-canvas
        '--ga-aspect': currentAspect.ratio,
        '--ga-max': currentAspect.maxWidth,
      } as React.CSSProperties}
    >
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
              <span className="font-mono text-[12px] uppercase tracking-[0.24em]">{f.label}</span>
              <span
                className={[
                  'mt-0.5 font-mono text-[12px] tracking-[0.06em]',
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
          <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
            my presets · saved to this browser
          </div>
          <div className="flex flex-wrap gap-2">
            {myPresets.map((sp) => (
              <div key={sp.id} className="group flex items-stretch overflow-hidden rounded-[2px] border border-[color:var(--assembl-cloud)]">
                <button
                  type="button"
                  onClick={() => applyMyPreset(sp)}
                  className="px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--text-primary)] hover:bg-[color:var(--assembl-cloud)]/60"
                  title={`seeded from ${sp.parentPresetId}`}
                >
                  {sp.label}
                </button>
                <button
                  type="button"
                  onClick={() => removeMyPreset(sp.id)}
                  aria-label="remove"
                  className="border-l border-[color:var(--assembl-cloud)] px-2 font-mono text-[12px] text-[color:var(--text-secondary)] hover:bg-[color:var(--assembl-cloud)]/60 hover:text-[color:var(--text-primary)]"
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
                'rounded-[2px] border px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.16em] transition',
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

      {/* Drag hint — every family responds to pointer drag (Chrome uses
          orbit instead; Line adds shift+drag move via its own chip). */}
      {family.id !== 'chrome' && family.id !== 'line' && (
        <div className="text-center font-mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--text-secondary)]">
          drag the canvas to shape it · sliders follow
        </div>
      )}

      {/* Aspect chips — universal control for the live canvas shape */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
          canvas
        </span>
        {ASPECTS.map((a) => {
          const active = state.aspect === a.id;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setAspect(a.id)}
              className={[
                'rounded-[2px] border px-2.5 py-1 font-mono text-[12px] uppercase tracking-[0.14em] transition',
                active
                  ? 'border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
                  : 'border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] text-[color:var(--text-secondary)] hover:border-[color:var(--text-primary)] hover:text-[color:var(--text-primary)]',
              ].join(' ')}
              title={a.hint}
            >
              {a.label}
            </button>
          );
        })}
      </div>

      {/* Renderer — keyed by aspect so changing the canvas shape remounts
          the renderer at the new container size. p5 only listens to window
          resize and the raw-WebGL families size once on mount, so without
          this the art stayed at its original size inside a resized frame. */}
      <div className="relative">
        <Renderer
          key={`${state.family}-${state.aspect}`}
          presetId={state.presetId}
          values={state.values}
          seed={state.seed}
          ground={family.ground}
          background={state.background}
          text={state.text || null}
          onAdjust={(patch) => setState((prev) => ({ ...prev, values: { ...prev.values, ...patch } }))}
          onExportersReady={onExportersReady}
        />
        {state.overlay.on && state.overlay.text.trim() && (
          <div
            role="button"
            tabIndex={0}
            aria-label="drag to position the text"
            onPointerDown={(e) => {
              e.stopPropagation();
              const host = (e.currentTarget.parentElement?.querySelector('.ga-canvas') ?? e.currentTarget.parentElement) as HTMLElement;
              const rect = host.getBoundingClientRect();
              const move = (ev: PointerEvent) => {
                setState((prev) => ({
                  ...prev,
                  overlay: {
                    ...prev.overlay,
                    x: Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width)),
                    y: Math.max(0, Math.min(1, (ev.clientY - rect.top) / rect.height)),
                  },
                }));
              };
              const up = () => {
                window.removeEventListener('pointermove', move);
                window.removeEventListener('pointerup', up);
              };
              window.addEventListener('pointermove', move);
              window.addEventListener('pointerup', up);
            }}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-move select-none whitespace-pre"
            style={{
              left: `${state.overlay.x * 100}%`,
              top: `${state.overlay.y * 100}%`,
              fontFamily: OVERLAY_FONTS[state.overlay.font].css,
              fontWeight: state.overlay.weight,
              fontSize: state.overlay.size,
              color: OVERLAY_COLORS[state.overlay.color],
              textAlign: state.overlay.align,
            }}
          >
            {state.overlay.text}
          </div>
        )}
      </div>

      {/* Background chips + text input — only shown for families that
          declare support for them. */}
      {(family.supportsBackground || family.supportsText) && (
        <div className="flex flex-col gap-3 rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-4">
          {family.supportsBackground && (
            <div className="flex flex-col gap-2">
              <div className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                background
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setBackground(null)}
                  className={[
                    'rounded-[2px] border px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.14em] transition',
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
                        'rounded-[2px] border px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.14em] transition',
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
              <div className="flex items-baseline justify-between font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                <span>text</span>
                <span className="text-[12px] tracking-[0.06em]">cormorant garamond · woven into the piece</span>
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
        <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
          {preset.blurb}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reseed}
            className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
          >
            new seed
          </button>
          <button
            type="button"
            onClick={saveCurrent}
            className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
            title="save this exact state to your browser"
          >
            save
          </button>
          <button
            type="button"
            onClick={copyShareUrl}
            className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
          >
            {copied === 'link' ? 'copied' : 'copy link'}
          </button>
          {family.supportsPngDownload && (
            <>
              <select
                value={socialSize}
                onChange={(e) => setSocialSize(e.target.value)}
                aria-label="Export size"
                className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-2 py-1.5 font-mono text-[12px] uppercase tracking-[0.14em]"
              >
                {SOCIAL_SIZES.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.w ? `${z.label} · ${z.w}×${z.h}` : z.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={downloadPng}
                className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
              >
                png
              </button>
            </>
          )}
          {family.supportsSvgDownload && (
            <button
              type="button"
              onClick={downloadSvg}
              className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
            >
              svg
            </button>
          )}
          {family.supportsCodeDownload && (
            <button
              type="button"
              onClick={downloadCode}
              className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
              title="download a self-contained html file that reproduces this piece offline"
            >
              code
            </button>
          )}
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen((v) => !v)}
              className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]"
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
                          'flex-1 px-2 py-2 font-mono text-[12px] uppercase tracking-[0.16em]',
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
                          <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--text-primary)]">
                            {size.label}
                          </div>
                          <div className="font-mono text-[12px] tracking-[0.06em] text-[color:var(--text-secondary)]">
                            {size.hint}
                          </div>
                        </div>
                        {busy && (
                          <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
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
              className="rounded-[2px] border border-[color:var(--text-primary)] bg-[color:var(--text-primary)] px-3 py-1.5 font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--assembl-paper)] disabled:opacity-60"
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
                    className="px-3 py-2 text-left font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--text-primary)] hover:bg-[color:var(--assembl-cloud)]/60"
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
                  className="border-t border-[color:var(--assembl-cloud)] px-3 py-2 text-left font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--text-primary)] hover:bg-[color:var(--assembl-cloud)]/60"
                >
                  {copied === 'link' ? 'copied' : 'copy link'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Text overlay controls */}
      <div className="flex flex-col gap-3 rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">text</span>
          <button
            type="button"
            aria-pressed={state.overlay.on}
            onClick={() => setState((prev) => ({ ...prev, overlay: { ...prev.overlay, on: !prev.overlay.on } }))}
            className={[
              'rounded-[2px] border px-2.5 py-1 font-mono text-[12px] uppercase tracking-[0.16em] transition',
              state.overlay.on
                ? 'border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
                : 'border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] text-[color:var(--text-secondary)] hover:border-[color:var(--text-primary)]',
            ].join(' ')}
          >
            {state.overlay.on ? 'on' : 'off'}
          </button>
        </div>
        {state.overlay.on && (
          <>
            <input
              type="text"
              value={state.overlay.text}
              onChange={(e) => setState((prev) => ({ ...prev, overlay: { ...prev.overlay, text: e.target.value } }))}
              placeholder="assembl."
              className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-2 text-[16px] text-[color:var(--text-primary)] focus:border-[color:var(--text-primary)] focus:outline-none"
              style={{ fontFamily: OVERLAY_FONTS[state.overlay.font].css, fontWeight: state.overlay.weight }}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
                font
                <select
                  value={state.overlay.font}
                  onChange={(e) => {
                    const font = e.target.value as OverlayFont;
                    setState((prev) => ({
                      ...prev,
                      overlay: {
                        ...prev.overlay,
                        font,
                        weight: OVERLAY_FONTS[font].weights.includes(prev.overlay.weight)
                          ? prev.overlay.weight
                          : OVERLAY_FONTS[font].weights[Math.floor(OVERLAY_FONTS[font].weights.length / 2)],
                      },
                    }));
                  }}
                  className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-2 py-1.5 font-mono text-[12px] normal-case text-[color:var(--text-primary)]"
                >
                  {(Object.keys(OVERLAY_FONTS) as OverlayFont[]).map((f) => (
                    <option key={f} value={f}>{OVERLAY_FONTS[f].label}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
                weight
                <select
                  value={state.overlay.weight}
                  onChange={(e) => setState((prev) => ({ ...prev, overlay: { ...prev.overlay, weight: Number(e.target.value) } }))}
                  className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-2 py-1.5 font-mono text-[12px] text-[color:var(--text-primary)]"
                >
                  {OVERLAY_FONTS[state.overlay.font].weights.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 font-mono text-[12px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">
                size · {Math.round(state.overlay.size)}px
                <input
                  type="range" min={12} max={200} step={1}
                  value={state.overlay.size}
                  onChange={(e) => setState((prev) => ({ ...prev, overlay: { ...prev.overlay, size: Number(e.target.value) } }))}
                />
              </label>
              <div className="flex items-end gap-2">
                {(['ink', 'champagne'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setState((prev) => ({ ...prev, overlay: { ...prev.overlay, color: c } }))}
                    aria-pressed={state.overlay.color === c}
                    className={[
                      'rounded-[2px] border px-2.5 py-1.5 font-mono text-[12px] uppercase tracking-[0.14em]',
                      state.overlay.color === c
                        ? 'border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
                        : 'border-[color:var(--assembl-cloud)] text-[color:var(--text-secondary)] hover:border-[color:var(--text-primary)]',
                    ].join(' ')}
                  >
                    {c}
                  </button>
                ))}
                {(['left', 'center', 'right'] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setState((prev) => ({ ...prev, overlay: { ...prev.overlay, align: a } }))}
                    aria-pressed={state.overlay.align === a}
                    className={[
                      'rounded-[2px] border px-2 py-1.5 font-mono text-[12px] uppercase tracking-[0.14em]',
                      state.overlay.align === a
                        ? 'border-[color:var(--text-primary)] bg-[color:var(--text-primary)] text-[color:var(--assembl-paper)]'
                        : 'border-[color:var(--assembl-cloud)] text-[color:var(--text-secondary)] hover:border-[color:var(--text-primary)]',
                    ].join(' ')}
                  >
                    {a[0]}
                  </button>
                ))}
              </div>
            </div>
            <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">
              drag the text on the canvas to position it · baked into png exports
            </p>
          </>
        )}
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
