'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AR_OPTIONS,
  KETE_OPTIONS,
  LIGHTING_OPTIONS,
  MOTION_OPTIONS,
  REF_MAX_BYTES,
  getKete,
  reduxAspectFor,
} from '@/lib/vessel-studio/keteOptions';
import { composeForFal, composeFull } from '@/lib/vessel-studio/composePrompt';
import { generateImages, hasEdgeFunctionConfig } from '@/lib/vessel-studio/generate';
import { loadImageFromUrl } from '@/lib/vessel-studio/cropToFocal';
import type {
  AspectRatio,
  LightingToken,
  MotionToken,
  ReferenceImage,
  SizeExportRecord,
  VesselGeneration,
  VesselStudioState,
} from '@/lib/vessel-studio/types';
import {
  saveGenerationAction,
  deleteGenerationAction,
  recordSizeExportAction,
} from '@/app/dashboard/vessel-studio/actions';

import { PresetPicker } from './PresetPicker';
import { ChipRow } from './ChipRow';
import { ReferenceUpload } from './ReferenceUpload';
import { PromptOutput } from './PromptOutput';
import { GenerateButton } from './GenerateButton';
import { GenerationGallery } from './GenerationGallery';
import { MultiSizeExport } from './MultiSizeExport';
import { NegativeAnchorChips } from './NegativeAnchorChips';

const LS_HISTORY = 'assembl_vessel_history';
const LS_FAL_KEY = 'assembl_fal_key';
const HIST_MAX = 12;

const DEFAULT_STATE: VesselStudioState = {
  kete: 'waihanga',
  ar: '4:5',
  motion: 'slow gentle rotation',
  lighting: LIGHTING_OPTIONS[0],
  sref: '',
  variants: 1,
  customMaterial: '',
  customForm: '',
  customPalette: '',
  reference: null,
  imagePromptStrength: 0.35,
};

interface VesselStudioProps {
  initialGenerations: VesselGeneration[];
  persistenceConfigured: boolean;
}

export function VesselStudio({
  initialGenerations,
  persistenceConfigured,
}: VesselStudioProps) {
  const [state, setState] = useState<VesselStudioState>(DEFAULT_STATE);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generations, setGenerations] = useState<VesselGeneration[]>(initialGenerations);
  const [sessionGenerations, setSessionGenerations] = useState(0);
  const [sessionCost, setSessionCost] = useState(0);
  const [exportImage, setExportImage] = useState<HTMLImageElement | null>(null);
  const [exportSourceLabel, setExportSourceLabel] = useState('');
  const [exportGenId, setExportGenId] = useState<string | null>(null);
  const [falKey, setFalKey] = useState('');
  const [showFalKey, setShowFalKey] = useState(false);
  const [keyPanelOpen, setKeyPanelOpen] = useState(false);
  const sizePrepInputRef = useRef<HTMLInputElement>(null);
  const useEdge = useMemo(() => hasEdgeFunctionConfig(), []);

  // Restore Fal key + local-only history if persistence is off.
  useEffect(() => {
    try {
      const k = localStorage.getItem(LS_FAL_KEY) ?? '';
      setFalKey(k);
      if (!useEdge && !k) setKeyPanelOpen(true);
    } catch {
      // ignore
    }
    if (!persistenceConfigured) {
      try {
        const raw = localStorage.getItem(LS_HISTORY);
        if (raw) {
          const arr = JSON.parse(raw) as VesselGeneration[];
          if (Array.isArray(arr)) setGenerations(arr.slice(0, HIST_MAX));
        }
      } catch {
        // ignore
      }
    }
  }, [persistenceConfigured, useEdge]);

  // Persist local-only history when it changes.
  useEffect(() => {
    if (persistenceConfigured) return;
    try {
      localStorage.setItem(
        LS_HISTORY,
        JSON.stringify(generations.slice(0, HIST_MAX))
      );
    } catch {
      // ignore quota
    }
  }, [generations, persistenceConfigured]);

  const promptFull = useMemo(() => composeFull(state), [state]);
  const promptForProvider = useMemo(() => composeForFal(state), [state]);

  const updateState = useCallback(
    (patch: Partial<VesselStudioState>) =>
      setState((prev) => ({ ...prev, ...patch })),
    []
  );

  const handleSelectKete = useCallback(
    (id: string) => {
      const k = getKete(id);
      const patch: Partial<VesselStudioState> = { kete: id };
      if (k.defaultAspectRatio && AR_OPTIONS.includes(k.defaultAspectRatio)) {
        patch.ar = k.defaultAspectRatio;
      }
      if (k.defaultMotion && MOTION_OPTIONS.includes(k.defaultMotion)) {
        patch.motion = k.defaultMotion;
      }
      updateState(patch);
    },
    [updateState]
  );

  const handleReset = useCallback(() => {
    setState({ ...DEFAULT_STATE });
    setError(null);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (generating) return;
    setError(null);
    if (!useEdge && !falKey.trim()) {
      setKeyPanelOpen(true);
      setError('paste a fal.ai key first');
      return;
    }
    setGenerating(true);
    const k = getKete(state.kete);
    try {
      const result = await generateImages(
        {
          state,
          promptForProvider,
          model: 'flux',
        },
        useEdge ? null : falKey
      );

      const localGen: VesselGeneration = {
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        studio: 'vessel',
        preset_key: k.id,
        preset_label: k.label,
        prompt_full: promptFull,
        prompt_to_provider: promptForProvider,
        aspect_ratio: state.ar,
        variants: state.variants,
        model: 'flux',
        reference_image_url: state.reference?.dataUrl ?? null,
        anchor_strength: state.reference ? state.imagePromptStrength : null,
        image_urls: result.images.map((i) => i.url),
        size_exports: [],
        cost_usd: result.cost_usd,
        generated_at: result.generated_at,
      };

      let saved: VesselGeneration = localGen;
      if (persistenceConfigured) {
        const persisted = await saveGenerationAction({
          studio: 'vessel',
          preset_key: k.id,
          preset_label: k.label,
          prompt_full: promptFull,
          prompt_to_provider: promptForProvider,
          aspect_ratio: state.ar,
          variants: state.variants,
          model: 'flux',
          reference_image_url: state.reference?.dataUrl ?? null,
          anchor_strength: state.reference ? state.imagePromptStrength : null,
          image_urls: result.images.map((i) => i.url),
          cost_usd: result.cost_usd,
          generated_at: result.generated_at,
        });
        if (persisted.ok && persisted.generation) saved = persisted.generation;
      }

      setGenerations((prev) => [saved, ...prev].slice(0, HIST_MAX));
      setSessionGenerations((n) => n + result.images.length);
      setSessionCost((c) => c + result.cost_usd);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown error';
      setError(msg);
    } finally {
      setGenerating(false);
    }
  }, [
    falKey,
    generating,
    persistenceConfigured,
    promptForProvider,
    promptFull,
    state,
    useEdge,
  ]);

  const handleUseSref = useCallback(
    (url: string) => {
      updateState({ sref: url });
    },
    [updateState]
  );

  const handleUseReference = useCallback(
    async (gen: VesselGeneration, imageUrl: string) => {
      try {
        const r = await fetch(imageUrl);
        if (!r.ok) throw new Error(`fetch failed (${r.status})`);
        const blob = await r.blob();
        if (blob.size > REF_MAX_BYTES) {
          throw new Error(`image too large (${(blob.size / 1024 / 1024).toFixed(2)} MB)`);
        }
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader();
          fr.onload = () => resolve(fr.result as string);
          fr.onerror = () => reject(new Error('could not read blob'));
          fr.readAsDataURL(blob);
        });
        const ts = Date.parse(gen.generated_at) || Date.now();
        const ref: ReferenceImage = {
          dataUrl,
          filename: `gallery-${gen.preset_key}-${ts}.jpg`,
          sizeBytes: blob.size,
        };
        updateState({ reference: ref, imagePromptStrength: 0.35 });
        setError(null);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown error';
        setError(`couldn't use gallery image as reference: ${msg}`);
      }
    },
    [updateState]
  );

  const handleExportSizes = useCallback(
    async (gen: VesselGeneration, imageUrl: string) => {
      try {
        const img = await loadImageFromUrl(imageUrl);
        setExportImage(img);
        setExportSourceLabel(`from gallery · ${gen.preset_label} · ${gen.aspect_ratio}`);
        setExportGenId(gen.id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown error';
        setError(`couldn't open size export: ${msg}`);
      }
    },
    []
  );

  const handleDelete = useCallback(
    async (gen: VesselGeneration) => {
      setGenerations((prev) => prev.filter((g) => g.id !== gen.id));
      if (persistenceConfigured && !gen.id.startsWith('local-')) {
        await deleteGenerationAction(gen.id);
      }
    },
    [persistenceConfigured]
  );

  const handleSizeExport = useCallback(
    async (record: SizeExportRecord) => {
      if (!exportGenId || exportGenId.startsWith('local-')) return;
      if (!persistenceConfigured) return;
      await recordSizeExportAction(exportGenId, record);
    },
    [exportGenId, persistenceConfigured]
  );

  const handleSizePrepClick = useCallback(() => {
    sizePrepInputRef.current?.click();
  }, []);

  const handleSizePrepFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('size-prep upload must be an image');
      return;
    }
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = () => reject(new Error('file read failed'));
        fr.readAsDataURL(file);
      });
      const img = new Image();
      img.onload = () => {
        setExportImage(img);
        setExportSourceLabel(`uploaded · ${file.name}`);
        setExportGenId(null);
      };
      img.onerror = () => setError('image decode failed');
      img.src = dataUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'unknown error';
      setError(`size-prep failed: ${msg}`);
    }
  }, []);

  const closeExport = useCallback(() => {
    setExportImage(null);
    setExportSourceLabel('');
    setExportGenId(null);
  }, []);

  const k = getKete(state.kete);
  const reduxMappedAr = reduxAspectFor(state.ar);
  void reduxMappedAr; // referenced via PromptOutput
  const usingRedux = !!state.reference?.dataUrl;
  const costPreview = state.variants * (usingRedux ? 0.05 : 0.04);

  return (
    <div className="bg-[color:var(--assembl-paper)]">
      <div className="mx-auto grid max-w-[1280px] gap-7 px-6 py-8 md:px-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        {/* LEFT — prompt builder */}
        <section className="flex flex-col gap-5" aria-label="prompt builder">
          <div className="flex flex-col gap-5 rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-4.5">
            {/* Kete picker */}
            <div className="flex flex-col gap-2">
              <div className="font-mono text-[12px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                kete{' '}
                <span className="ml-2 tracking-[0.12em] text-[color:var(--text-secondary)]/80">
                  vessel form for the pillar
                </span>
              </div>
              <p className="font-mono text-[12px] font-light tracking-[0.04em] text-[color:var(--text-secondary)]">
                {k.portrait
                  ? 'founder portrait — warm cream interior, soft natural light, calm editorial portrait, dachshund optional'
                  : 'each kete is a stacked still-life — cream stoneware top + base, kete-coloured translucent glass plates between them, on a small brass wire display stand. cream paper backdrop only.'}
              </p>
              <p className="font-mono text-[12px] tracking-[0.04em] leading-[1.5] text-[color:var(--text-secondary)]">
                canonical reference renders are saved at{' '}
                <code className="rounded-[1px] bg-[color:var(--assembl-cloud)]/40 px-1 py-px text-[color:var(--text-secondary)]">
                  outputs/locked-vessels/canonical/&lt;kete&gt;.png
                </code>
              </p>
              <PresetPicker selectedId={state.kete} onSelect={handleSelectKete} />

              {k.id === 'custom' ? (
                <div className="mt-2 flex flex-col gap-2.5 rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-cloud)]/40 p-3.5">
                  {(
                    [
                      [
                        'customMaterial',
                        'material',
                        'e.g. translucent jade mineral, silk organza, glass-organza membrane…',
                      ],
                      [
                        'customForm',
                        'form',
                        'e.g. monolithic organic form, blooming layered petals, archive-bloom folds…',
                      ],
                      [
                        'customPalette',
                        'palette',
                        'e.g. soft gold light points scattered through the material, warm amber glow…',
                      ],
                    ] as const
                  ).map(([key, label, ph]) => (
                    <div key={key} className="flex flex-col gap-1">
                      <div className="font-mono text-[12px] tracking-[0.2em] text-[color:var(--text-secondary)]">
                        {label}
                      </div>
                      <textarea
                        value={state[key]}
                        rows={2}
                        spellCheck={false}
                        placeholder={ph}
                        onChange={(e) => updateState({ [key]: e.target.value })}
                        className="min-h-[44px] resize-y rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-2.5 font-mono text-[12px] font-light leading-[1.55] text-[color:var(--text-primary)] focus:border-[color:var(--text-primary)] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-2 rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-cloud)]/40 p-3">
                  <div className="mb-1.5 font-mono text-[12px] tracking-[0.2em] text-[color:var(--text-secondary)]">
                    material grammar · locked
                  </div>
                  <p className="font-mono text-[12px] leading-[1.6] tracking-[0.02em] text-[color:var(--text-secondary)]">
                    {k.grammar}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-mono text-[12px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                aspect ratio
              </div>
              <ChipRow
                options={AR_OPTIONS}
                selected={state.ar}
                onChange={(v) => updateState({ ar: v as AspectRatio })}
                ariaLabel="aspect ratio"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-mono text-[12px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                motion
              </div>
              <ChipRow
                options={MOTION_OPTIONS}
                selected={state.motion}
                onChange={(v) => updateState({ motion: v as MotionToken })}
                ariaLabel="motion"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-mono text-[12px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                style reference (sref){' '}
                <span className="ml-2 tracking-[0.12em] text-[color:var(--text-secondary)]/80">
                  optional url · midjourney only
                </span>
              </div>
              <input
                type="text"
                value={state.sref}
                onChange={(e) => updateState({ sref: e.target.value })}
                placeholder="https://…"
                autoComplete="off"
                spellCheck={false}
                className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-2.5 font-mono text-[12.5px] font-light tracking-[0.04em] text-[color:var(--text-primary)] focus:border-[color:var(--text-primary)] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-mono text-[12px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                reference image{' '}
                <span className="ml-2 tracking-[0.12em] text-[color:var(--text-secondary)]/80">
                  visual anchor for fal redux
                </span>
              </div>
              <ReferenceUpload
                reference={state.reference}
                strength={state.imagePromptStrength}
                onLoad={(ref) =>
                  updateState({ reference: ref, imagePromptStrength: 0.35 })
                }
                onClear={() => updateState({ reference: null, imagePromptStrength: 0.35 })}
                onStrengthChange={(n) => updateState({ imagePromptStrength: n })}
                onError={setError}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-mono text-[12px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                lighting
              </div>
              <select
                value={state.lighting}
                onChange={(e) =>
                  updateState({ lighting: e.target.value as LightingToken })
                }
                className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-2.5 font-light text-sm text-[color:var(--text-primary)] focus:border-[color:var(--text-primary)] focus:outline-none"
              >
                {LIGHTING_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <div className="font-mono text-[12px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                variants
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => updateState({ variants: Math.max(1, state.variants - 1) })}
                  aria-label="fewer variants"
                  className="h-7 w-7 rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] font-mono text-sm hover:bg-[color:var(--assembl-cloud)]"
                >
                  −
                </button>
                <span className="min-w-[22px] text-center font-mono text-sm text-[color:var(--text-primary)]">
                  {state.variants}
                </span>
                <button
                  type="button"
                  onClick={() => updateState({ variants: Math.min(4, state.variants + 1) })}
                  aria-label="more variants"
                  className="h-7 w-7 rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] font-mono text-sm hover:bg-[color:var(--assembl-cloud)]"
                >
                  +
                </button>
                <span className="ml-2 font-mono text-[12px] tracking-[0.12em] text-[color:var(--text-secondary)]">
                  images per run · 1–4
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* RIGHT — prompt + generate + gallery */}
        <section className="flex flex-col gap-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:self-start lg:overflow-y-auto lg:pr-1" aria-label="generation">
          {/* Edge / fallback notice */}
          {!useEdge && (
            <div className="overflow-hidden rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-cloud)]/40">
              <button
                type="button"
                onClick={() => setKeyPanelOpen((o) => !o)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
                aria-expanded={keyPanelOpen}
              >
                <span className="font-mono text-[12px] lowercase tracking-[0.18em] text-[color:var(--text-secondary)]">
                  fal.ai api key
                </span>
                <span
                  className={[
                    'font-mono text-[12px] tracking-[0.12em]',
                    falKey ? 'text-[color:var(--assembl-gold-thread)]' : 'text-[color:var(--text-secondary)]',
                  ].join(' ')}
                >
                  {falKey ? 'saved · in this browser' : 'not set'}
                </span>
              </button>
              {keyPanelOpen && (
                <div className="px-4 pb-4">
                  <div className="flex gap-2">
                    <input
                      type={showFalKey ? 'text' : 'password'}
                      value={falKey}
                      onChange={(e) => setFalKey(e.target.value)}
                      placeholder="paste fal.ai key…"
                      autoComplete="off"
                      spellCheck={false}
                      className="flex-1 rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-2.5 font-mono text-[12.5px] tracking-[0.04em] text-[color:var(--text-primary)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFalKey((s) => !s)}
                      className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3.5 font-mono text-[12px] lowercase tracking-[0.1em] hover:bg-[color:var(--assembl-cloud)]"
                    >
                      {showFalKey ? 'hide' : 'show'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          if (falKey.trim()) localStorage.setItem(LS_FAL_KEY, falKey.trim());
                          else localStorage.removeItem(LS_FAL_KEY);
                        } catch {
                          // ignore
                        }
                      }}
                      className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3.5 font-mono text-[12px] lowercase tracking-[0.1em] hover:bg-[color:var(--assembl-cloud)]"
                    >
                      save
                    </button>
                  </div>
                  <p className="mt-2.5 font-mono text-[12px] leading-[1.6] tracking-[0.04em] text-[color:var(--text-secondary)]">
                    edge function not configured (set{' '}
                    <code>NEXT_PUBLIC_VESSEL_STUDIO_SHARED_SECRET</code>) — falling back to
                    direct fal.ai. your key stays in this browser. get a key at{' '}
                    <a
                      href="https://fal.ai/dashboard/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[color:var(--text-primary)] underline"
                    >
                      fal.ai/dashboard/keys
                    </a>
                    .
                  </p>
                </div>
              )}
            </div>
          )}

          <PromptOutput
            state={state}
            promptFull={promptFull}
            onCopy={() => undefined}
            onReset={handleReset}
          />

          <NegativeAnchorChips keteId={state.kete} />

          <GenerateButton
            generating={generating}
            hasReference={usingRedux}
            onClick={handleGenerate}
            errorMessage={error}
            costPreviewUsd={costPreview}
          />

          <GenerationGallery
            generations={generations}
            onUseSref={handleUseSref}
            onUseReference={handleUseReference}
            onExportSizes={handleExportSizes}
            onDelete={handleDelete}
            onSizePrep={handleSizePrepClick}
          />

          <input
            ref={sizePrepInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleSizePrepFile(f);
              e.target.value = '';
            }}
          />

          <div className="text-right font-mono text-[12px] tracking-[0.1em] text-[color:var(--text-secondary)]">
            this session: {sessionGenerations} generation
            {sessionGenerations === 1 ? '' : 's'} · ~${sessionCost.toFixed(2)} usd at flux pro pricing
          </div>
        </section>
      </div>

      <MultiSizeExport
        open={!!exportImage}
        image={exportImage}
        sourceLabel={exportSourceLabel}
        onClose={closeExport}
        onSizeExport={handleSizeExport}
      />
    </div>
  );
}
