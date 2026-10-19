'use client';

/**
 * assembl / living — Space Studio
 * -------------------------------
 * show us your space → three ways to improve it → assemble your design →
 * made for your space. Every stage is deterministic and labelled honestly:
 * proposals are proposed, the photo is shown back but never read, fit is
 * only confirmed on measurements the customer typed, and purchasing is not
 * enabled until a manufacturer accepts the files.
 */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  AESTHETICS,
  AESTHETIC_PRESETS,
  CAD_PACK,
  COLOURWAYS,
  COLOURWAY_SWATCHES,
  INTERFACE_ID,
  INTERFACE_SPEC,
  SPACE_ENTRIES,
  SpaceDesignSchema,
  billOfMaterials,
  bundledPriceBand,
  fitCheck,
  gridAccessories,
  kitById,
  partById,
  partsForSpace,
  recommend,
  requireSpace,
  savedConfiguration,
  spaceAssembledJourney,
  understand,
  validatePlacements,
  type Aesthetic,
  type Kit,
  type MeasurementMethod,
  type SpaceDesign,
  type SpaceId,
  type Surface,
} from '@/lib/living';
import { GridComposer } from './GridComposer';
import { STUDIO_STEPS, initialStudioState, studioReducer, type StudioStep } from './studio-state';

const Preview3D = dynamic(() => import('./Preview3D'), { ssr: false, loading: () => <div className="lv-preview3d" /> });

const STORAGE_KEY = 'assembl.living.design.v1';

const SURFACE_LABELS: Record<Surface, string> = {
  wall: 'a wall',
  desk: 'a desk',
  drawer: 'a drawer',
  wardrobe: 'a wardrobe',
  vanity: 'a vanity',
  floor: 'the floor',
};

const METHOD_LABELS: Record<MeasurementMethod, string> = {
  unconfirmed: 'not yet',
  'tape-measure': 'tape measure',
  'a4-reference': 'A4 sheet in the photo',
  'phone-depth-scan': 'phone depth scan',
};

function nzd(n: number) {
  return `NZ$${n.toLocaleString('en-NZ')}`;
}

type Props = { space: SpaceId; surface: Surface; aesthetic: Aesthetic; kit: Kit | null };

export function SpaceStudio(props: Props) {
  const [state, dispatch] = useReducer(studioReducer, props, initialStudioState);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const { design, step } = state;
  const entry = requireSpace(design.space);

  // Resume a saved design when the studio was opened without a kit or space in the URL.
  useEffect(() => {
    if (props.kit) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = SpaceDesignSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) return;
      const t = window.setTimeout(() => {
        dispatch({ type: 'restore', design: parsed.data });
        setRestored(true);
      }, 0);
      return () => window.clearTimeout(t);
    } catch {
      /* storage unavailable — start fresh */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.kit) dispatch({ type: 'step', step: 'assemble' });
  }, [props.kit]);

  const goto = (s: StudioStep) => {
    dispatch({ type: 'step', step: s });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(design));
      setRestored(true);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="lv-studio lv-wrap">
      <header className="lv-hero" style={{ paddingBottom: 0 }}>
        <span className="lv-eyebrow">assembl / space studio</span>
        <h1>show us your space.</h1>
        <p className="lv-lede">We&rsquo;ll help make it work beautifully. One modular system, made to your room, your drawer, your desk.</p>
        <nav className="lv-steps" aria-label="Studio steps">
          {STUDIO_STEPS.map((s, i) => {
            const idx = STUDIO_STEPS.findIndex((x) => x.id === step);
            const stateOf = i === idx ? 'current' : i < idx ? 'done' : 'todo';
            return (
              <button
                key={s.id}
                type="button"
                className="lv-step"
                data-state={stateOf}
                onClick={() => i <= idx && goto(s.id)}
                disabled={i > idx}
                style={{ background: 'none', border: 0, padding: 0, cursor: i <= idx ? 'pointer' : 'default' }}
              >
                <i>{i < idx ? '✓' : i + 1}</i>
                {s.label.slice(5)}
              </button>
            );
          })}
        </nav>
        {restored && step === 'space' && (
          <div className="lv-actions">
            <span className="lv-status" data-tone="ok">saved design on this device</span>
            <button type="button" className="lv-btn" data-variant="ghost" onClick={() => goto('assemble')}>
              continue that design
            </button>
          </div>
        )}
      </header>

      {step === 'space' && (
        <StepSpace
          design={design}
          photoUrl={photoUrl}
          onPhoto={(file) => {
            if (photoUrl) URL.revokeObjectURL(photoUrl);
            setPhotoUrl(file ? URL.createObjectURL(file) : null);
            dispatch({ type: 'photo', name: file ? file.name : null });
          }}
          dispatch={dispatch}
          onNext={() => goto('ways')}
        />
      )}

      {step === 'ways' && (
        <StepWays
          design={design}
          kits={entry.kits.map((id) => kitById(id)).filter((k): k is Kit => Boolean(k))}
          onAdopt={(d) => {
            dispatch({ type: 'adopt', design: d });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onKit={(k) => {
            dispatch({ type: 'kit', kit: k });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onBack={() => goto('space')}
        />
      )}

      {step === 'assemble' && (
        <StepAssemble state={state} dispatch={dispatch} onNext={() => goto('fit')} onBack={() => goto('ways')} />
      )}

      {step === 'fit' && <StepFit design={design} dispatch={dispatch} onBack={() => goto('assemble')} onSave={save} />}
    </div>
  );
}

/* ────────────────────────────────────────────── 01 · show us your space */

function StepSpace({
  design,
  photoUrl,
  onPhoto,
  dispatch,
  onNext,
}: {
  design: SpaceDesign;
  photoUrl: string | null;
  onPhoto: (file: File | null) => void;
  dispatch: React.Dispatch<Parameters<typeof studioReducer>[1]>;
  onNext: () => void;
}) {
  const entry = requireSpace(design.space);
  const [keepText, setKeepText] = useState(design.keep.join(', '));
  return (
    <section className="lv-panel" aria-labelledby="lv-step-space">
      <div className="lv-section-head" style={{ marginBottom: 0 }}>
        <span className="lv-eyebrow">01 · show us your space</span>
        <h2 id="lv-step-space">Where are we making space?</h2>
      </div>

      <div className="lv-chips" role="group" aria-label="Space">
        {SPACE_ENTRIES.map((s) => (
          <button
            key={s.id}
            type="button"
            className="lv-chip"
            aria-pressed={design.space === s.id}
            onClick={() => dispatch({ type: 'space', space: s.id, surface: s.surfaces[0] })}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="lv-field">
        <span className="lv-label">Which surface?</span>
        <div className="lv-chips" role="group" aria-label="Surface">
          {(['wall', 'desk', 'drawer', 'wardrobe', 'vanity', 'floor'] as Surface[]).map((s) => (
            <button key={s} type="button" className="lv-chip" data-kind={entry.surfaces.includes(s) ? undefined : 'quiet'} aria-pressed={design.surface === s} onClick={() => dispatch({ type: 'surface', surface: s })}>
              {SURFACE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="lv-two">
        <div className="lv-field">
          <label className="lv-label" htmlFor="lv-need">What would make it better?</label>
          <textarea id="lv-need" className="lv-textarea" value={design.need} placeholder={entry.examples[0]} onChange={(e) => dispatch({ type: 'need', need: e.target.value })} />
          <div className="lv-chips">
            {entry.examples.map((ex) => (
              <button key={ex} type="button" className="lv-chip" data-kind="quiet" onClick={() => dispatch({ type: 'need', need: ex })}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        <div className="lv-photo lv-field">
          <label className="lv-label" htmlFor="lv-photo">A photo, if you have one</label>
          <input id="lv-photo" type="file" accept="image/*" onChange={(e) => onPhoto(e.target.files?.[0] ?? null)} />
          {/* eslint-disable-next-line @next/next/no-img-element -- local blob: URL shown back to the customer, never uploaded */}
          {photoUrl && <img src={photoUrl} alt="The space you photographed, shown back to you" />}
          <div className="lv-note">
            <span className="lv-status" data-tone="quiet">photo understanding · not available</span>
            <span>The photo stays on your device and is shown back to you. Nothing is read from it yet. Measurements that decide fit are always confirmed by you in step four.</span>
          </div>
        </div>
      </div>

      <div className="lv-two">
        <div className="lv-field">
          <span className="lv-label">Choose a starting aesthetic</span>
          <div className="lv-grid lv-grid-2">
            {AESTHETICS.map((a) => {
              const p = AESTHETIC_PRESETS[a];
              return (
                <button key={a} type="button" className="lv-card" data-tone={design.aesthetic === a ? 'chalk' : undefined} aria-pressed={design.aesthetic === a} onClick={() => dispatch({ type: 'aesthetic', aesthetic: a })} style={{ textAlign: 'left', cursor: 'pointer', borderColor: design.aesthetic === a ? 'var(--lv-plum)' : undefined }}>
                  <div className="lv-swatches">
                    <span className="lv-swatch" style={{ background: COLOURWAY_SWATCHES[p.panel].hex }} aria-hidden />
                    <span className="lv-swatch" style={{ background: COLOURWAY_SWATCHES[p.accent].hex }} aria-hidden />
                  </div>
                  <h3>{p.label}</h3>
                  <p className="lv-small">{p.line}</p>
                </button>
              );
            })}
          </div>
        </div>
        <div className="lv-field">
          <label className="lv-label" htmlFor="lv-keep">Anything you want to keep, display or fit?</label>
          <input
            id="lv-keep"
            className="lv-input"
            value={keepText}
            placeholder="a small speaker, two plants, the headset"
            onChange={(e) => {
              setKeepText(e.target.value);
              dispatch({ type: 'keep', keep: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) });
            }}
          />
          <p className="lv-small">We design around what you own rather than replacing it.</p>
        </div>
      </div>

      <div className="lv-actions">
        <button type="button" className="lv-btn" onClick={onNext}>
          see three ways to improve it →
        </button>
        <span className="lv-small">Takes a moment. No account, nothing sent anywhere.</span>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────── 02 · three ways */

function StepWays({ design, kits, onAdopt, onKit, onBack }: { design: SpaceDesign; kits: Kit[]; onAdopt: (d: SpaceDesign) => void; onKit: (k: Kit) => void; onBack: () => void }) {
  const understanding = useMemo(() => understand({ space: design.space, surface: design.surface, need: design.need, keep: design.keep }), [design.space, design.surface, design.need, design.keep]);
  const proposals = useMemo(
    () => recommend({ space: design.space, surface: design.surface, need: design.need, keep: design.keep, aesthetic: design.aesthetic, now: design.createdAt }),
    [design.space, design.surface, design.need, design.keep, design.aesthetic, design.createdAt],
  );
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 300 + understanding.needs.length * 380);
    return () => window.clearTimeout(t);
  }, [understanding.needs.length]);

  return (
    <>
      <section className="lv-panel" data-tone="chalk" aria-labelledby="lv-step-understand">
        <div className="lv-section-head" style={{ marginBottom: 0 }}>
          <span className="lv-eyebrow">02 · assembl understands the space</span>
          <h2 id="lv-step-understand">What we took from what you said</h2>
        </div>
        <ul className="lv-assembling">
          {understanding.needs.map((n, i) => (
            <li key={n} style={{ animationDelay: `${i * 380}ms` }}>
              <i>✓</i>
              <div>
                <b>{n}</b>
              </div>
            </li>
          ))}
          <li style={{ animationDelay: `${understanding.needs.length * 380}ms` }}>
            <i>✓</i>
            <div>
              <b>Surface: {SURFACE_LABELS[design.surface]}{design.keep.length > 0 ? ` · keeping ${design.keep.join(', ')}` : ''}</b>
              <span>Parts that matched your words: {understanding.matchedParts.length > 0 ? understanding.matchedParts.map((p) => p.name).join(', ') : 'none yet — we start from the usual kit for this space'}.</span>
            </div>
          </li>
        </ul>
        <div className="lv-strip">
          <span className="lv-status">proposed</span>
          <span className="lv-status" data-tone="quiet">photo not read</span>
          <span className="lv-status" data-tone="quiet">deterministic · no model</span>
        </div>
      </section>

      <section aria-labelledby="lv-step-ways" style={{ opacity: ready ? 1 : 0.35, transition: 'opacity 500ms ease' }}>
        <div className="lv-section-head">
          <span className="lv-eyebrow">three ways to improve it</span>
          <h2 id="lv-step-ways">Pick a starting point. You can change everything.</h2>
        </div>
        <div className="lv-grid lv-grid-3">
          {proposals.map((p) => {
            const bom = billOfMaterials(p.design);
            const band = bundledPriceBand(bom);
            const hasPanel = p.design.placements.length > 0;
            return (
              <article key={p.id} className="lv-card">
                <span className="lv-eyebrow">{p.title}</span>
                {hasPanel ? (
                  <GridComposer design={p.design} className="lv-mini" title={`${p.title} layout`} />
                ) : (
                  <div className="lv-mini" style={{ padding: '1rem' }}>
                    <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                      {p.design.extras.map((e) => (
                        <li key={e.partId}>{e.qty} × {partById(e.partId)?.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p>{p.summary}</p>
                <ul>
                  {p.why.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
                <div className="lv-total">
                  <span className="lv-small">{bom.lines.reduce((s, l) => s + l.qty, 0)} parts · indicative</span>
                  <b>{nzd(band.lowNzd)}–{nzd(band.highNzd)}</b>
                </div>
                <button type="button" className="lv-btn" disabled={!ready} onClick={() => onAdopt(p.design)}>
                  assemble this →
                </button>
              </article>
            );
          })}
        </div>
      </section>

      {kits.length > 0 && (
        <section className="lv-panel">
          <div className="lv-section-head" style={{ marginBottom: 0 }}>
            <span className="lv-eyebrow">or start from a curated kit</span>
            <h3>Same parts, arranged for a job.</h3>
          </div>
          <div className="lv-grid lv-grid-3">
            {kits.map((k) => (
              <button key={k.id} type="button" className="lv-card" onClick={() => onKit(k)} style={{ textAlign: 'left', cursor: 'pointer' }}>
                <h3>{k.name}</h3>
                <p className="lv-small">{k.tagline}</p>
                <span className="lv-status" data-tone="quiet">indicative · not yet quoted</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="lv-actions">
        <button type="button" className="lv-btn" data-variant="ghost" onClick={onBack}>← change what I said</button>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────── 03 · assemble */

function StepAssemble({ state, dispatch, onNext, onBack }: { state: ReturnType<typeof initialStudioState>; dispatch: React.Dispatch<Parameters<typeof studioReducer>[1]>; onNext: () => void; onBack: () => void }) {
  const { design, tool, selected, show3d } = state;
  const accessories = gridAccessories();
  const extrasParts = partsForSpace(design.space).filter((p) => !p.footprint && p.kind !== 'panel');
  const hasRail = design.extras.some((e) => e.partId === 'rail-bar-192' && e.qty > 0);
  const railExtras = hasRail ? gridAccessories().filter((p) => p.mountsOn.includes('rail')) : [];
  const issues = validatePlacements(design);
  const bom = billOfMaterials(design);
  const band = bundledPriceBand(bom);
  const selectedPlacement = design.placements.find((p) => p.id === selected);
  const composerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selected) return;
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); dispatch({ type: 'remove', placementId: selected }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); dispatch({ type: 'nudge', dc: -1, dr: 0 }); }
      if (e.key === 'ArrowRight') { e.preventDefault(); dispatch({ type: 'nudge', dc: 1, dr: 0 }); }
      if (e.key === 'ArrowUp') { e.preventDefault(); dispatch({ type: 'nudge', dc: 0, dr: -1 }); }
      if (e.key === 'ArrowDown') { e.preventDefault(); dispatch({ type: 'nudge', dc: 0, dr: 1 }); }
    };
    const el = composerRef.current;
    el?.addEventListener('keydown', onKey);
    return () => el?.removeEventListener('keydown', onKey);
  }, [selected, dispatch]);

  return (
    <>
      <section className="lv-panel" aria-labelledby="lv-step-assemble">
        <div className="lv-section-head" style={{ marginBottom: 0 }}>
          <span className="lv-eyebrow">03 · assemble your design</span>
          <h2 id="lv-step-assemble">Add, move and recolour. The preview is the real geometry.</h2>
        </div>

        <div className="lv-two">
          <div style={{ display: 'grid', gap: '0.9rem' }} ref={composerRef} tabIndex={-1}>
            <div className="lv-actions" style={{ justifyContent: 'space-between' }}>
              <div className="lv-chips" role="group" aria-label="Panel field">
                {([[1, 1], [2, 1], [1, 2], [2, 2]] as const).map(([c, r]) => (
                  <button key={`${c}x${r}`} type="button" className="lv-chip" aria-pressed={design.panels.cols === c && design.panels.rows === r} onClick={() => dispatch({ type: 'panels', cols: c, rows: r })}>
                    {c} × {r} panel{c * r > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
              <button type="button" className="lv-chip" aria-pressed={show3d} onClick={() => dispatch({ type: 'show3d', on: !show3d })}>
                {show3d ? 'flat view' : '3D view'}
              </button>
            </div>

            {show3d ? (
              <Preview3D design={design} />
            ) : (
              <GridComposer
                design={design}
                interactive
                tool={tool}
                selected={selected}
                onCell={(col, row) => dispatch({ type: 'place', col, row })}
                onSelect={(id) => dispatch({ type: 'select', placementId: id })}
                title="Your panel layout"
              />
            )}

            <div className="lv-actions">
              {tool ? (
                <span className="lv-small">Click a cell to place <b>{partById(tool)?.name}</b>, or <button type="button" className="lv-chip" data-kind="quiet" onClick={() => dispatch({ type: 'auto', partId: tool })}>place it for me</button></span>
              ) : selectedPlacement ? (
                <>
                  <span className="lv-small"><b>{partById(selectedPlacement.partId)?.name}</b> selected · arrow keys move it</span>
                  <button type="button" className="lv-chip" onClick={() => dispatch({ type: 'nudge', dc: -1, dr: 0 })} aria-label="Move left">←</button>
                  <button type="button" className="lv-chip" onClick={() => dispatch({ type: 'nudge', dc: 1, dr: 0 })} aria-label="Move right">→</button>
                  <button type="button" className="lv-chip" onClick={() => dispatch({ type: 'nudge', dc: 0, dr: -1 })} aria-label="Move up">↑</button>
                  <button type="button" className="lv-chip" onClick={() => dispatch({ type: 'nudge', dc: 0, dr: 1 })} aria-label="Move down">↓</button>
                  <button type="button" className="lv-chip" onClick={() => dispatch({ type: 'remove', placementId: selectedPlacement.id })}>remove</button>
                </>
              ) : (
                <span className="lv-small">Choose an accessory from the list, then click a cell. Click a placed part to move or remove it.</span>
              )}
            </div>

            <div className="lv-two" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="lv-field">
                <span className="lv-label">Panel colour</span>
                <div className="lv-swatches">
                  {COLOURWAYS.map((c) => (
                    <button key={c} type="button" className="lv-swatch" style={{ background: COLOURWAY_SWATCHES[c].hex }} aria-pressed={design.panelColour === c} aria-label={COLOURWAY_SWATCHES[c].label} title={COLOURWAY_SWATCHES[c].label} onClick={() => dispatch({ type: 'colour', which: 'panel', colour: c })} />
                  ))}
                </div>
              </div>
              <div className="lv-field">
                <span className="lv-label">Accessory colour</span>
                <div className="lv-swatches">
                  {COLOURWAYS.map((c) => (
                    <button key={c} type="button" className="lv-swatch" style={{ background: COLOURWAY_SWATCHES[c].hex }} aria-pressed={design.accentColour === c} aria-label={COLOURWAY_SWATCHES[c].label} title={COLOURWAY_SWATCHES[c].label} onClick={() => dispatch({ type: 'colour', which: 'accent', colour: c })} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside style={{ display: 'grid', gap: '1.2rem' }}>
            <div className="lv-field">
              <span className="lv-label">On the panel</span>
              <div className="lv-palette">
                {accessories.map((p) => (
                  <button key={p.id} type="button" aria-pressed={tool === p.id} onClick={() => dispatch({ type: 'tool', partId: tool === p.id ? null : p.id })}>
                    <span className="lv-glyph" aria-hidden>
                      <svg viewBox="0 0 44 36" width="44" height="36">
                        {p.kind === 'hook' && <><rect x="17" y="4" width="10" height="24" rx="2" fill={COLOURWAY_SWATCHES[design.accentColour].hex} stroke="rgba(36,11,33,.3)" /><rect x="20" y="22" width="4" height="8" fill="rgba(36,11,33,.5)" /></>}
                        {p.kind === 'ledge' && <><rect x="4" y="8" width="36" height="12" rx="2" fill={COLOURWAY_SWATCHES[design.accentColour].hex} opacity=".7" stroke="rgba(36,11,33,.3)" /><rect x="4" y="21" width="36" height="7" rx="1.5" fill={COLOURWAY_SWATCHES[design.accentColour].hex} stroke="rgba(36,11,33,.3)" /></>}
                        {p.kind === 'cup' && <><rect x="13" y="4" width="18" height="28" rx="5" fill={COLOURWAY_SWATCHES[design.accentColour].hex} stroke="rgba(36,11,33,.3)" /><ellipse cx="22" cy="7" rx="7" ry="2" fill="rgba(36,11,33,.35)" /></>}
                      </svg>
                    </span>
                    <span>
                      <b>{p.name}</b>
                      <small>{p.footprint!.cols * INTERFACE_SPEC.pitch_mm} × {p.footprint!.rows * INTERFACE_SPEC.pitch_mm} mm · {nzd(p.priceBand.lowNzd)}–{nzd(p.priceBand.highNzd)}</small>
                    </span>
                    <small>{design.placements.filter((x) => x.partId === p.id).length}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="lv-field">
              <span className="lv-label">Alongside</span>
              <div className="lv-palette">
                {[...extrasParts, ...railExtras].map((p) => {
                  const qty = design.extras.find((e) => e.partId === p.id)?.qty ?? 0;
                  const forRail = railExtras.includes(p);
                  return (
                    <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.8rem', alignItems: 'center', border: '1px solid var(--lv-line)', borderRadius: 14, padding: '0.6rem 0.8rem' }}>
                      <span>
                        <b style={{ fontWeight: 500, color: 'var(--lv-plum)', display: 'block', fontSize: '0.95rem' }}>{p.name}{forRail ? ' · for the rail' : ''}</b>
                        <small style={{ color: 'var(--lv-muted)', fontSize: '0.8rem' }}>{p.cad.dims_mm.x} × {p.cad.dims_mm.y} × {p.cad.dims_mm.z} mm · {nzd(p.priceBand.lowNzd)}–{nzd(p.priceBand.highNzd)}{p.minQty > 1 ? ` · min ${p.minQty}` : ''}</small>
                      </span>
                      <span className="lv-stepper">
                        <button type="button" aria-label={`Fewer ${p.name}`} onClick={() => dispatch({ type: 'extra', partId: p.id, qty: Math.max(0, qty - 1) })}>−</button>
                        <span>{qty}</span>
                        <button type="button" aria-label={`More ${p.name}`} onClick={() => dispatch({ type: 'extra', partId: p.id, qty: qty + 1 })}>+</button>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="lv-panel" data-tone="chalk" aria-labelledby="lv-parts">
        <div className="lv-two">
          <div>
            <span className="lv-eyebrow">parts in this design</span>
            <table className="lv-bom">
              <thead>
                <tr><th>part</th><th>qty</th><th>indicative</th></tr>
              </thead>
              <tbody>
                {bom.lines.map((l) => (
                  <tr key={l.partId}>
                    <td>{l.name}<br /><small className="lv-small">{l.foundation}</small></td>
                    <td>{l.qty}</td>
                    <td>{nzd(l.priceBand.lowNzd)}–{nzd(l.priceBand.highNzd)}</td>
                  </tr>
                ))}
                {bom.lines.length === 0 && (
                  <tr><td colSpan={3} className="lv-small">Nothing yet. Add an accessory or something alongside.</td></tr>
                )}
              </tbody>
            </table>
            <div className="lv-total">
              <span className="lv-small">bundled as one print-and-ship order · {bom.totalMassG} g of material</span>
              <b>{nzd(band.lowNzd)}–{nzd(band.highNzd)}</b>
            </div>
            <p className="lv-small">Bands are indicative and subject to manufacturing quotes. Nothing here is for sale yet.</p>
          </div>
          <div style={{ display: 'grid', gap: '0.8rem', alignContent: 'start' }}>
            {issues.length > 0 ? (
              <div className="lv-note"><span className="lv-status">layout needs attention</span><span>{issues.length} placement issue{issues.length > 1 ? 's' : ''}. Move or remove the highlighted parts.</span></div>
            ) : (
              <div className="lv-note"><span className="lv-status" data-tone="ok">layout buildable</span><span>Every part sits inside the panel field on the {INTERFACE_SPEC.pitch_mm} mm interface with no overlaps.</span></div>
            )}
            <div className="lv-actions">
              <button type="button" className="lv-btn" disabled={issues.length > 0 || bom.lines.length === 0} onClick={onNext}>confirm fit →</button>
              <button type="button" className="lv-btn" data-variant="ghost" onClick={onBack}>← three ways</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ────────────────────────────────────────────── 04 · made for your space */

function StepFit({ design, dispatch, onBack, onSave }: { design: SpaceDesign; dispatch: React.Dispatch<Parameters<typeof studioReducer>[1]>; onBack: () => void; onSave: () => void }) {
  const needsWall = design.placements.length > 0;
  const m = design.measurements;
  const [width, setWidth] = useState(m.widthMm ? String(m.widthMm) : '');
  const [height, setHeight] = useState(m.heightMm ? String(m.heightMm) : '');
  const fit = fitCheck(design);
  const config = useMemo(() => savedConfiguration(design), [design]);
  const bom = billOfMaterials(design);
  const steps = spaceAssembledJourney.waitStateModules[0]?.steps ?? [];
  const [assembledFor, setAssembledFor] = useState<string | null>(null);
  const fitKey = fit.status === 'fits' ? `${design.id}:${design.placements.length}:${design.extras.length}:${m.widthMm ?? 0}x${m.heightMm ?? 0}` : null;
  useEffect(() => {
    if (!fitKey) return;
    const t = window.setTimeout(() => setAssembledFor(fitKey), 400 + steps.length * 420);
    return () => window.clearTimeout(t);
  }, [fitKey, steps.length]);
  const assembled = fitKey !== null && assembledFor === fitKey;

  const update = (method: MeasurementMethod, w: string, h: string, confirmed: boolean) => {
    const wn = Number(w);
    const hn = Number(h);
    dispatch({ type: 'measure', method, widthMm: wn > 0 ? wn : undefined, heightMm: hn > 0 ? hn : undefined, confirmed: confirmed && wn > 0 && hn > 0 });
  };

  const download = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assembl-living-${design.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {needsWall && (
        <section className="lv-panel" aria-labelledby="lv-step-fit">
          <div className="lv-section-head" style={{ marginBottom: 0 }}>
            <span className="lv-eyebrow">04 · made for your space</span>
            <h2 id="lv-step-fit">Confirm the two numbers that decide fit.</h2>
            <p className="lv-small">A photograph can suggest a layout. It cannot measure a wall. Your layout needs {fit.requiredWidthMm} × {fit.requiredHeightMm} mm and stands {fit.standoffMm} mm off the wall.</p>
          </div>
          <div className="lv-field">
            <span className="lv-label">How did you measure?</span>
            <div className="lv-chips" role="group" aria-label="Measurement method">
              {(['tape-measure', 'a4-reference', 'phone-depth-scan'] as MeasurementMethod[]).map((mm) => (
                <button key={mm} type="button" className="lv-chip" aria-pressed={m.method === mm} onClick={() => update(mm, width, height, m.confirmed)}>{METHOD_LABELS[mm]}</button>
              ))}
            </div>
            {m.method === 'a4-reference' && <p className="lv-small">Hold an A4 sheet (210 × 297 mm) flat against the surface in the photo, then measure with that as your ruler. Round down.</p>}
            {m.method === 'phone-depth-scan' && <p className="lv-small">Use your phone&rsquo;s measuring app and read the numbers off it. Round down; walls are rarely square.</p>}
          </div>
          <div className="lv-measure">
            <div className="lv-field">
              <label className="lv-label" htmlFor="lv-w">Width available, mm</label>
              <input id="lv-w" className="lv-input" inputMode="numeric" value={width} onChange={(e) => { setWidth(e.target.value); update(m.method === 'unconfirmed' ? 'tape-measure' : m.method, e.target.value, height, false); }} />
            </div>
            <div className="lv-field">
              <label className="lv-label" htmlFor="lv-h">Height available, mm</label>
              <input id="lv-h" className="lv-input" inputMode="numeric" value={height} onChange={(e) => { setHeight(e.target.value); update(m.method === 'unconfirmed' ? 'tape-measure' : m.method, width, e.target.value, false); }} />
            </div>
          </div>
          <label className="lv-check">
            <input type="checkbox" checked={m.confirmed} onChange={(e) => update(m.method === 'unconfirmed' ? 'tape-measure' : m.method, width, height, e.target.checked)} />
            <span>I measured this space myself and these numbers are right.</span>
          </label>
          <div className="lv-fit" data-status={fit.status}>
            <span className="lv-status" data-tone={fit.status === 'fits' ? 'ok' : fit.status === 'unconfirmed' ? 'quiet' : undefined}>
              {fit.status === 'fits' ? 'fits' : fit.status === 'unconfirmed' ? 'fit unconfirmed' : fit.status === 'too_wide' ? 'too wide' : 'too tall'}
            </span>
            <ul>{fit.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            {(fit.status === 'too_wide' || fit.status === 'too_tall') && (
              <div className="lv-actions">
                <button type="button" className="lv-btn" data-variant="small" onClick={() => dispatch({ type: 'panels', cols: fit.status === 'too_wide' ? 1 : (design.panels.cols as 1 | 2), rows: fit.status === 'too_tall' ? 1 : (design.panels.rows as 1 | 2) })}>drop a {fit.status === 'too_wide' ? 'column' : 'row'} of panels</button>
                <button type="button" className="lv-btn" data-variant="ghost" onClick={onBack}>← rework the layout</button>
              </div>
            )}
          </div>
        </section>
      )}

      {!needsWall && (
        <section className="lv-panel">
          <span className="lv-eyebrow">04 · made for your space</span>
          <h2>Nothing on the wall, so nothing to drill.</h2>
          <p className="lv-small">Trays, risers and rails only need the surface they sit on. Check your drawer or desk is at least {Math.max(0, ...bom.lines.map((l) => partById(l.partId)?.cad.dims_mm.x ?? 0))} mm across for the largest part.</p>
        </section>
      )}

      {fit.status === 'fits' && (
        <section className="lv-panel" data-tone="chalk" aria-labelledby="lv-assembling-kit">
          <span className="lv-eyebrow">assembling the kit</span>
          <h3 id="lv-assembling-kit">{assembled ? 'Your configuration is ready to quote.' : 'Checking every part against your space…'}</h3>
          <ul className="lv-assembling">
            {steps.map((s, i) => (
              <li key={s.id} style={{ animationDelay: `${i * 420}ms` }}>
                <i>✓</i>
                <div><b>{s.label}</b><span>{s.detail}</span></div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {fit.status === 'fits' && assembled && (
        <section className="lv-panel" aria-labelledby="lv-config">
          <div className="lv-section-head" style={{ marginBottom: 0 }}>
            <span className="lv-eyebrow">saved configuration</span>
            <h2 id="lv-config">Every part, its CAD revision and how it prints.</h2>
          </div>
          <div className="lv-strip">
            <span className="lv-status">proposed</span>
            <span className="lv-status" data-tone="quiet">purchasing not enabled</span>
            <span className="lv-status" data-tone="quiet">{INTERFACE_ID} · pack {CAD_PACK}</span>
          </div>
          <table className="lv-bom">
            <thead><tr><th>part</th><th>print plan</th><th>revision</th></tr></thead>
            <tbody>
              {config.parts.map((p) => {
                const part = partById(p.partId)!;
                return (
                  <tr key={p.partId}>
                    <td><b style={{ fontWeight: 500, color: 'var(--lv-plum)' }}>{p.qty} × {part.name}</b><br /><small className="lv-small">{part.cad.dims_mm.x} × {part.cad.dims_mm.y} × {part.cad.dims_mm.z} mm · {part.cad.mass_g_pla} g · {part.cad.load.note}</small></td>
                    <td className="lv-small">{part.cad.print.material} · {part.cad.print.orientation} · supports: {part.cad.print.supports} · {part.cad.print.infill}</td>
                    <td>{p.cadRevision}<br /><a href={part.cad.files.stl?.path} className="lv-small" download>STL</a> · <a href={part.cad.files.step?.path} className="lv-small" download>STEP</a></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <dl className="lv-kv">
            <dt>fit</dt><dd>{config.fit.status}{needsWall ? ` · needs ${config.fit.requiredWidthMm} × ${config.fit.requiredHeightMm} mm` : ''}</dd>
            <dt>price</dt><dd>{nzd(config.price.lowNzd)}–{nzd(config.price.highNzd)} · {config.price.basis}</dd>
            <dt>measured by</dt><dd>{METHOD_LABELS[design.measurements.method]}</dd>
            <dt>purchasing</dt><dd>{config.purchasing.reason}</dd>
          </dl>
          <div className="lv-actions">
            <button type="button" className="lv-btn" onClick={download}>download configuration (JSON)</button>
            <button type="button" className="lv-btn" data-variant="ghost" onClick={onSave}>save on this device</button>
            <Link href="/living" className="lv-btn" data-variant="ghost">back to assembl / living</Link>
          </div>
          <p className="lv-small">What happens next, honestly: this file is what a manufacturer quotes from. When a manufacturer has accepted the files, pricing and fulfilment for pack {CAD_PACK}, purchasing opens here with the same configuration.</p>
        </section>
      )}

      <div className="lv-actions">
        <button type="button" className="lv-btn" data-variant="ghost" onClick={onBack}>← assemble</button>
      </div>
    </>
  );
}
