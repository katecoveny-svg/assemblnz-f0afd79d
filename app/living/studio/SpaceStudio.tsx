'use client';

/**
 * assembl / living — Space Studio
 * -------------------------------
 * show us your space → three ways to improve it → assemble your design →
 * made for your space. Every stage is deterministic and labelled honestly:
 * proposals are proposed, the photo is shown back but never read, fit is
 * confirmed only on measurements the customer typed, and purchasing is not
 * enabled until the test-print kit has run with the print partner.
 */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  AESTHETICS,
  BOARD_MM,
  AESTHETIC_PRESETS,
  CAD_PACK,
  COLOURWAYS,
  INTERFACE_ID,
  INTERFACE_SPEC,
  SPACE_ENTRIES,
  SpaceDesignSchema,
  TEST_KIT,
  alongsideProducts,
  billOfMaterials,
  colourHex,
  colourName,
  fitCheck,
  gridAccessories,
  hangsOnDoor,
  kitById,
  printFile,
  productByHandle,
  recommend,
  requireSpace,
  savedConfiguration,
  spaceAssembledJourney,
  understand,
  validatePlacements,
  type Aesthetic,
  type Field,
  type Kit,
  type MeasurementMethod,
  type SpaceDesign,
  type SpaceId,
  type Surface,
} from '@/lib/living';
import { GridComposer } from './GridComposer';
import { FIELD_OPTIONS, STUDIO_STEPS, fieldId, initialStudioState, studioReducer, type StudioAction, type StudioStep } from './studio-state';

const Preview3D = dynamic(() => import('./Preview3D'), { ssr: false, loading: () => <div className="lv-preview3d" /> });

const STORAGE_KEY = 'assembl.living.design.v2';

const SURFACE_LABELS: Record<Surface, string> = { wall: 'a wall', door: 'the back of a door', wardrobe: 'inside a wardrobe', desk: 'a desk', drawer: 'a drawer', vanity: 'a vanity' };

const METHOD_LABELS: Record<MeasurementMethod, string> = {
  unconfirmed: 'not yet',
  'tape-measure': 'tape measure',
  'a4-reference': 'A4 sheet in the photo',
  'phone-depth-scan': 'phone depth scan',
  'door-gap-gauge': 'door-gap gauge from the test kit',
};

function fieldMm(field: Field): string {
  const w = field.columns.reduce((a, c) => a + c, 0) * INTERFACE_SPEC.pitch_mm;
  const h = field.rows * BOARD_MM;
  return `${w} × ${h} mm`;
}

function nzd(n: number) {
  return `NZ$${n.toLocaleString('en-NZ', { maximumFractionDigits: 0 })}`;
}

type Dispatch = React.Dispatch<StudioAction>;
type Props = { space: SpaceId; surface: Surface; aesthetic: Aesthetic; kit: Kit | null };

export function SpaceStudio(props: Props) {
  const [state, dispatch] = useReducer(studioReducer, props, initialStudioState);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [restored, setRestored] = useState(false);
  const { design, step } = state;
  const entry = requireSpace(design.space);

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
        <p className="lv-lede">We&rsquo;ll help make it work beautifully. One board, one key, every accessory. Made to your room, your door, your drawer.</p>
        <nav className="lv-steps" aria-label="Studio steps">
          {STUDIO_STEPS.map((s, i) => {
            const idx = STUDIO_STEPS.findIndex((x) => x.id === step);
            const stateOf = i === idx ? 'current' : i < idx ? 'done' : 'todo';
            return (
              <button key={s.id} type="button" className="lv-step" data-state={stateOf} onClick={() => i <= idx && goto(s.id)} disabled={i > idx} style={{ background: 'none', border: 0, padding: 0, cursor: i <= idx ? 'pointer' : 'default' }}>
                <i>{i < idx ? '✓' : i + 1}</i>
                {s.label.slice(5)}
              </button>
            );
          })}
        </nav>
        {restored && step === 'space' && (
          <div className="lv-actions">
            <span className="lv-status" data-tone="ok">saved design on this device</span>
            <button type="button" className="lv-btn" data-variant="ghost" onClick={() => goto('assemble')}>continue that design</button>
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
          onAdopt={(d) => { dispatch({ type: 'adopt', design: d }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          onKit={(k) => { dispatch({ type: 'kit', kit: k }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          onBack={() => goto('space')}
        />
      )}
      {step === 'assemble' && <StepAssemble state={state} dispatch={dispatch} onNext={() => goto('fit')} onBack={() => goto('ways')} />}
      {step === 'fit' && <StepFit design={design} dispatch={dispatch} onBack={() => goto('assemble')} onSave={save} />}
    </div>
  );
}

/* ────────────────────────────────────────────── 01 · show us your space */

function StepSpace({ design, photoUrl, onPhoto, dispatch, onNext }: { design: SpaceDesign; photoUrl: string | null; onPhoto: (file: File | null) => void; dispatch: Dispatch; onNext: () => void }) {
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
          <button key={s.id} type="button" className="lv-chip" aria-pressed={design.space === s.id} onClick={() => dispatch({ type: 'space', space: s.id, surface: s.surfaces[0] })}>{s.name}</button>
        ))}
      </div>
      <div className="lv-field">
        <span className="lv-label">Which surface?</span>
        <div className="lv-chips" role="group" aria-label="Surface">
          {(['wall', 'door', 'wardrobe', 'desk', 'drawer', 'vanity'] as Surface[]).map((s) => (
            <button key={s} type="button" className="lv-chip" data-kind={entry.surfaces.includes(s) ? undefined : 'quiet'} aria-pressed={design.surface === s} onClick={() => dispatch({ type: 'surface', surface: s })}>{SURFACE_LABELS[s]}</button>
          ))}
        </div>
        {(design.surface === 'door' || design.surface === 'wardrobe') && <p className="lv-small">Nothing to drill: the board hangs on two hangers in its top row. Light things only, and the door still has to close.</p>}
      </div>
      <div className="lv-two">
        <div className="lv-field">
          <label className="lv-label" htmlFor="lv-need">What would make it better?</label>
          <textarea id="lv-need" className="lv-textarea" value={design.need} placeholder={entry.examples[0]} onChange={(e) => dispatch({ type: 'need', need: e.target.value })} />
          <div className="lv-chips">
            {entry.examples.map((ex) => (
              <button key={ex} type="button" className="lv-chip" data-kind="quiet" onClick={() => dispatch({ type: 'need', need: ex })}>{ex}</button>
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
                    <span className="lv-swatch" style={{ background: colourHex(p.board) }} aria-hidden />
                    <span className="lv-swatch" style={{ background: colourHex(p.accessory) }} aria-hidden />
                  </div>
                  <h3>{p.label}</h3>
                  <p className="lv-small">{p.line}</p>
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ display: 'grid', gap: '1.2rem', alignContent: 'start' }}>
          <div className="lv-field">
            <label className="lv-label" htmlFor="lv-keep">Anything you want to keep, display or fit?</label>
            <input id="lv-keep" className="lv-input" value={keepText} placeholder="a small speaker, two plants, the headset" onChange={(e) => { setKeepText(e.target.value); dispatch({ type: 'keep', keep: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }); }} />
            <p className="lv-small">We design around what you own rather than replacing it.</p>
          </div>
          <div className="lv-field">
            <label className="lv-label" htmlFor="lv-name">A name for the plate, if you want one</label>
            <input id="lv-name" className="lv-input" value={design.name ?? ''} maxLength={12} placeholder="MILA" onChange={(e) => dispatch({ type: 'name', name: e.target.value })} />
            <p className="lv-small">Raised in a second colour, in the same typeface as this page. Up to 12 letters.</p>
          </div>
        </div>
      </div>
      <div className="lv-actions">
        <button type="button" className="lv-btn" onClick={onNext}>see three ways to improve it →</button>
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
            <li key={n} style={{ animationDelay: `${i * 380}ms` }}><i>✓</i><div><b>{n}</b></div></li>
          ))}
          <li style={{ animationDelay: `${understanding.needs.length * 380}ms` }}>
            <i>✓</i>
            <div>
              <b>Surface: {SURFACE_LABELS[design.surface]}{design.keep.length > 0 ? ` · keeping ${design.keep.join(', ')}` : ''}{design.name ? ` · name plate: ${design.name}` : ''}</b>
              <span>Parts that matched your words: {understanding.matchedProducts.length > 0 ? understanding.matchedProducts.map((p) => p.title.toLowerCase()).join(', ') : 'none yet — we start from the usual kit for this space'}.</span>
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
            const hasBoard = p.design.placements.length > 0;
            return (
              <article key={p.id} className="lv-card">
                <span className="lv-eyebrow">{p.title}</span>
                {hasBoard ? (
                  <GridComposer design={{ ...p.design, name: design.name }} className="lv-mini" title={`${p.title} layout`} />
                ) : (
                  <div className="lv-mini" style={{ padding: '1rem' }}>
                    <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                      {p.design.extras.map((e) => <li key={e.handle}>{e.qty} × {productByHandle(e.handle)?.title}</li>)}
                    </ul>
                  </div>
                )}
                <p>{p.summary}</p>
                <ul>{p.why.map((w) => <li key={w}>{w}</li>)}</ul>
                <div className="lv-total">
                  <span className="lv-small">{bom.lines.reduce((s, l) => s + l.qty, 0)} items · proposed{bom.quotedLines > 0 ? ` + ${bom.quotedLines} quoted` : ''}</span>
                  <b>{nzd(bom.priceNzd)}</b>
                </div>
                <button type="button" className="lv-btn" disabled={!ready} onClick={() => onAdopt(p.design)}>assemble this →</button>
              </article>
            );
          })}
        </div>
      </section>

      {kits.length > 0 && (
        <section className="lv-panel">
          <div className="lv-section-head" style={{ marginBottom: 0 }}>
            <span className="lv-eyebrow">or start from a room kit</span>
            <h3>Same parts, arranged for a job.</h3>
          </div>
          <div className="lv-grid lv-grid-3">
            {kits.map((k) => (
              <button key={k.id} type="button" className="lv-card" onClick={() => onKit(k)} style={{ textAlign: 'left', cursor: 'pointer' }}>
                <h3>{k.name}</h3>
                <p className="lv-small">{k.note}</p>
                <div className="lv-total"><span className="lv-status" data-tone="quiet">proposed · pre-quote</span><b>{nzd(k.priceNzd)}</b></div>
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

function PaletteGlyph({ kind, colour }: { kind: string; colour: string }) {
  const stroke = 'rgba(36,11,33,.3)';
  return (
    <svg viewBox="0 0 44 36" width="44" height="36" aria-hidden>
      {kind === 'hook' && <><rect x="17" y="3" width="10" height="28" rx="3" fill={colour} stroke={stroke} /><rect x="20" y="22" width="4" height="7" fill="rgba(36,11,33,.5)" /></>}
      {kind === 'cradle' && <><rect x="17" y="3" width="10" height="28" rx="3" fill={colour} stroke={stroke} /><circle cx="22" cy="24" r="4" fill="none" stroke="rgba(36,11,33,.5)" strokeWidth="2" /></>}
      {kind === 'shelf' && <><rect x="4" y="7" width="36" height="12" rx="2" fill={colour} opacity=".7" stroke={stroke} /><rect x="4" y="21" width="36" height="7" rx="1.5" fill={colour} stroke={stroke} /></>}
      {kind === 'bin' && <><rect x="6" y="5" width="32" height="27" rx="5" fill={colour} stroke={stroke} /><rect x="10" y="9" width="24" height="5" rx="2" fill="rgba(36,11,33,.3)" /></>}
      {kind === 'cup' && <><rect x="15" y="3" width="14" height="30" rx="5" fill={colour} stroke={stroke} /><ellipse cx="22" cy="12" rx="5" ry="2" fill="rgba(36,11,33,.35)" /></>}
      {kind === 'garage' && <><rect x="4" y="5" width="36" height="27" rx="4" fill={colour} stroke={stroke} />{[10, 16, 22, 28, 34].map((x) => <line key={x} x1={x} y1="13" x2={x} y2="29" stroke="rgba(36,11,33,.4)" />)}</>}
      {kind === 'plate' && <><rect x="3" y="12" width="38" height="12" rx="4" fill={colour} stroke={stroke} /><text x="22" y="21" textAnchor="middle" fontSize="7" fontWeight="600" fill="rgba(36,11,33,.7)">NAME</text></>}
    </svg>
  );
}

function StepAssemble({ state, dispatch, onNext, onBack }: { state: ReturnType<typeof initialStudioState>; dispatch: Dispatch; onNext: () => void; onBack: () => void }) {
  const { design, tool, selected, show3d } = state;
  const accessories = gridAccessories();
  const alongside = alongsideProducts().filter((p) => p.spaces.includes(design.space) || design.extras.some((e) => e.handle === p.handle));
  const issues = validatePlacements(design);
  const bom = billOfMaterials(design);
  const selectedPlacement = design.placements.find((p) => p.id === selected);
  const composerRef = useRef<HTMLDivElement>(null);
  const accent = colourHex(design.accessoryColour);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selected) return;
      const map: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); dispatch({ type: 'remove', placementId: selected }); }
      if (map[e.key]) { e.preventDefault(); dispatch({ type: 'nudge', dc: map[e.key][0], dr: map[e.key][1] }); }
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
          <h2 id="lv-step-assemble">Put it on the wall. Every part is its print file.</h2>
          <p className="lv-small">Every keyway is {INTERFACE_SPEC.pitch_mm} mm from the next. Push an accessory&rsquo;s key in upright and quarter-turn it to lock. Boards butt edge to edge, so the grid runs on across them.</p>
        </div>
        <div className="lv-stage-wrap" ref={composerRef} tabIndex={-1}>
          <div className="lv-stage-bar">
            <div className="lv-chips" role="group" aria-label="Board field">
              {FIELD_OPTIONS.map((o) => (
                <button key={o.id} type="button" className="lv-chip" aria-pressed={fieldId(design.field) === o.id} onClick={() => dispatch({ type: 'field', field: o.field })}>{o.label}</button>
              ))}
            </div>
            <div className="lv-chips" role="group" aria-label="View">
              <button type="button" className="lv-chip" aria-pressed={show3d} onClick={() => dispatch({ type: 'show3d', on: true })}>on the wall</button>
              <button type="button" className="lv-chip" aria-pressed={!show3d} onClick={() => dispatch({ type: 'show3d', on: false })}>plan</button>
            </div>
          </div>
          <div className="lv-stage" data-view={show3d ? '3d' : 'plan'}>
            {show3d ? (
              <Preview3D design={design} interactive tool={tool} selected={selected} onCell={(col, row) => dispatch({ type: 'place', col, row })} onSelect={(id) => dispatch({ type: 'select', placementId: id })} />
            ) : (
              <GridComposer design={design} interactive tool={tool} selected={selected} onCell={(col, row) => dispatch({ type: 'place', col, row })} onSelect={(id) => dispatch({ type: 'select', placementId: id })} title="Your board layout" />
            )}
            <div className="lv-stage-note">
              <span className="lv-mono">{fieldMm(design.field)} · {INTERFACE_SPEC.pitch_mm} mm pitch · {SURFACE_LABELS[design.surface]}</span>
              <span className="lv-mono">{show3d ? 'print files · drag to look around' : 'plan · real installed sizes'}</span>
            </div>
          </div>
          <div className="lv-two">
            <div style={{ display: 'grid', gap: '0.9rem' }}>
            <div className="lv-actions">
              {tool ? (
                <span className="lv-small">Click a keyway to place <b>{productByHandle(tool)?.title.toLowerCase()}</b>, or <button type="button" className="lv-chip" data-kind="quiet" onClick={() => dispatch({ type: 'auto', handle: tool })}>place it for me</button></span>
              ) : selectedPlacement ? (
                <>
                  <span className="lv-small"><b>{productByHandle(selectedPlacement.handle)?.title}</b> selected · arrow keys move it</span>
                  <button type="button" className="lv-chip" onClick={() => dispatch({ type: 'nudge', dc: -1, dr: 0 })} aria-label="Move left">←</button>
                  <button type="button" className="lv-chip" onClick={() => dispatch({ type: 'nudge', dc: 1, dr: 0 })} aria-label="Move right">→</button>
                  <button type="button" className="lv-chip" onClick={() => dispatch({ type: 'nudge', dc: 0, dr: -1 })} aria-label="Move up">↑</button>
                  <button type="button" className="lv-chip" onClick={() => dispatch({ type: 'nudge', dc: 0, dr: 1 })} aria-label="Move down">↓</button>
                  <button type="button" className="lv-chip" onClick={() => dispatch({ type: 'remove', placementId: selectedPlacement.id })}>remove</button>
                </>
              ) : (
                <span className="lv-small">Choose an accessory below, then click a keyway on the board. Click a placed part to move or remove it.</span>
              )}
            </div>
            <div className="lv-two" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {(['board', 'accessory'] as const).map((which) => (
                <div key={which} className="lv-field">
                  <span className="lv-label">{which === 'board' ? 'Board colour' : 'Accessory colour'} · {colourName(which === 'board' ? design.boardColour : design.accessoryColour)}</span>
                  <div className="lv-swatches">
                    {COLOURWAYS.map((c) => (
                      <button key={c} type="button" className="lv-swatch" style={{ background: colourHex(c) }} aria-pressed={(which === 'board' ? design.boardColour : design.accessoryColour) === c} aria-label={colourName(c)} title={colourName(c)} onClick={() => dispatch({ type: 'colour', which, colour: c })} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside style={{ display: 'grid', gap: '1.2rem' }}>
            <div className="lv-field">
              <span className="lv-label">On the board</span>
              <div className="lv-palette">
                {accessories.map((p) => (
                  <button key={p.handle} type="button" aria-pressed={tool === p.handle} onClick={() => dispatch({ type: 'tool', handle: tool === p.handle ? null : p.handle })}>
                    <span className="lv-glyph"><PaletteGlyph kind={p.kind} colour={accent} /></span>
                    <span>
                      <b>{p.title}{p.perUnit > 1 ? ` (sold as ${p.perUnit})` : ''}</b>
                      <small>{p.size} · {nzd(p.priceNzd ?? 0)}{p.personalised ? ' · personalised' : ''}</small>
                    </span>
                    <small>{design.placements.filter((x) => x.handle === p.handle).length}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="lv-field">
              <span className="lv-label">Alongside</span>
              <div className="lv-palette">
                {alongside.map((p) => {
                  const qty = design.extras.find((e) => e.handle === p.handle)?.qty ?? 0;
                  return (
                    <div key={p.handle} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.8rem', alignItems: 'center', border: '1px solid var(--lv-line)', borderRadius: 14, padding: '0.6rem 0.8rem' }}>
                      <span>
                        <b style={{ fontWeight: 500, color: 'var(--lv-plum)', display: 'block', fontSize: '0.95rem' }}>{p.title}</b>
                        <small style={{ color: 'var(--lv-muted)', fontSize: '0.8rem' }}>{p.size} · {p.priceNzd === null ? 'quoted per order' : nzd(p.priceNzd)}</small>
                      </span>
                      <span className="lv-stepper">
                        <button type="button" aria-label={`Fewer ${p.title}`} onClick={() => dispatch({ type: 'extra', handle: p.handle, qty: Math.max(0, qty - 1) })}>−</button>
                        <span>{qty}</span>
                        <button type="button" aria-label={`More ${p.title}`} onClick={() => dispatch({ type: 'extra', handle: p.handle, qty: qty + 1 })}>+</button>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
          </div>
        </div>
      </section>

      <section className="lv-panel" data-tone="chalk" aria-labelledby="lv-parts">
        <div className="lv-two">
          <div>
            <span className="lv-eyebrow">parts in this design</span>
            <table className="lv-bom">
              <thead><tr><th>part</th><th>qty</th><th>proposed</th></tr></thead>
              <tbody>
                {bom.lines.map((l) => (
                  <tr key={l.handle}>
                    <td>{l.title}<br /><small className="lv-small">{l.foundation} · {colourName(l.colour)}{l.sku ? ` · ${l.sku}` : ''}</small></td>
                    <td>{l.qty}</td>
                    <td>{l.priceNzd === null ? 'quoted' : nzd(l.priceNzd)}</td>
                  </tr>
                ))}
                {bom.lines.length === 0 && <tr><td colSpan={3} className="lv-small">Nothing yet. Add an accessory or something alongside.</td></tr>}
              </tbody>
            </table>
            <div className="lv-total">
              <span className="lv-small">one print-and-post order · about {Math.round(bom.totalShipG)} g packed</span>
              <b>{nzd(bom.priceNzd)}{bom.quotedLines > 0 ? ' + quote' : ''}</b>
            </div>
            <p className="lv-small">Prices are proposed and include GST. Nothing has been quoted by a print partner or printed yet. Nothing here is for sale.</p>
          </div>
          <div style={{ display: 'grid', gap: '0.8rem', alignContent: 'start' }}>
            {issues.length > 0 ? (
              <div className="lv-note"><span className="lv-status">layout needs attention</span><span>{issues.length} placement issue{issues.length > 1 ? 's' : ''}. Move or remove the highlighted parts.</span></div>
            ) : (
              <div className="lv-note"><span className="lv-status" data-tone="ok">layout buildable</span><span>Every part sits on a keyway inside the board field with no overlaps.</span></div>
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

function StepFit({ design, dispatch, onBack, onSave }: { design: SpaceDesign; dispatch: Dispatch; onBack: () => void; onSave: () => void }) {
  const needsWall = design.placements.length > 0;
  const door = hangsOnDoor(design);
  const m = design.measurements;
  const [width, setWidth] = useState(m.widthMm ? String(m.widthMm) : '');
  const [height, setHeight] = useState(m.heightMm ? String(m.heightMm) : '');
  const [doorMm, setDoorMm] = useState(m.doorMm ? String(m.doorMm) : '');
  const fit = fitCheck(design);
  const config = useMemo(() => savedConfiguration(design), [design]);
  const bom = billOfMaterials(design);
  const steps = spaceAssembledJourney.waitStateModules[0]?.steps ?? [];
  const [assembledFor, setAssembledFor] = useState<string | null>(null);
  const fitKey = fit.status === 'fits' ? `${design.id}:${design.placements.length}:${design.extras.length}:${m.widthMm ?? 0}x${m.heightMm ?? 0}:${m.doorMm ?? 0}` : null;
  useEffect(() => {
    if (!fitKey) return;
    const t = window.setTimeout(() => setAssembledFor(fitKey), 400 + steps.length * 420);
    return () => window.clearTimeout(t);
  }, [fitKey, steps.length]);
  const assembled = fitKey !== null && assembledFor === fitKey;

  const update = (patch: Partial<{ method: MeasurementMethod; w: string; h: string; d: string; gap: boolean | undefined; confirmed: boolean }>) => {
    const method = patch.method ?? (m.method === 'unconfirmed' ? 'tape-measure' : m.method);
    const wn = Number(patch.w ?? width);
    const hn = Number(patch.h ?? height);
    const dn = Number(patch.d ?? doorMm);
    const confirmed = patch.confirmed ?? m.confirmed;
    dispatch({ type: 'measure', method, widthMm: wn > 0 ? wn : undefined, heightMm: hn > 0 ? hn : undefined, doorMm: dn > 0 ? dn : undefined, doorGapOk: 'gap' in patch ? patch.gap : m.doorGapOk, confirmed: confirmed && wn > 0 && hn > 0 });
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
      {needsWall ? (
        <section className="lv-panel" aria-labelledby="lv-step-fit">
          <div className="lv-section-head" style={{ marginBottom: 0 }}>
            <span className="lv-eyebrow">04 · made for your space</span>
            <h2 id="lv-step-fit">Confirm the numbers that decide fit.</h2>
            <p className="lv-small">A photograph can suggest a layout. It cannot measure a wall. Your layout needs {fit.requiredWidthMm} × {fit.requiredHeightMm} mm and the boards are {fit.standoffMm} mm thick.</p>
          </div>
          <div className="lv-field">
            <span className="lv-label">How did you measure?</span>
            <div className="lv-chips" role="group" aria-label="Measurement method">
              {(['tape-measure', 'a4-reference', 'phone-depth-scan'] as MeasurementMethod[]).map((mm) => (
                <button key={mm} type="button" className="lv-chip" aria-pressed={m.method === mm} onClick={() => update({ method: mm })}>{METHOD_LABELS[mm]}</button>
              ))}
            </div>
            {m.method === 'a4-reference' && <p className="lv-small">Hold an A4 sheet (210 × 297 mm) flat against the surface in the photo, then measure with that as your ruler. Round down.</p>}
            {m.method === 'phone-depth-scan' && <p className="lv-small">Use your phone&rsquo;s measuring app and read the numbers off it. Round down; walls are rarely square.</p>}
          </div>
          <div className="lv-measure">
            <div className="lv-field">
              <label className="lv-label" htmlFor="lv-w">Width available, mm</label>
              <input id="lv-w" className="lv-input" inputMode="numeric" value={width} onChange={(e) => { setWidth(e.target.value); update({ w: e.target.value, confirmed: false }); }} />
            </div>
            <div className="lv-field">
              <label className="lv-label" htmlFor="lv-h">Height available, mm</label>
              <input id="lv-h" className="lv-input" inputMode="numeric" value={height} onChange={(e) => { setHeight(e.target.value); update({ h: e.target.value, confirmed: false }); }} />
            </div>
          </div>
          {door && (
            <div className="lv-measure">
              <div className="lv-field">
                <label className="lv-label" htmlFor="lv-door">Door thickness, mm (up to 35)</label>
                <input id="lv-door" className="lv-input" inputMode="numeric" value={doorMm} onChange={(e) => { setDoorMm(e.target.value); update({ d: e.target.value, confirmed: false }); }} />
              </div>
              <div className="lv-field">
                <span className="lv-label">Gap above the closed door</span>
                <div className="lv-chips">
                  <button type="button" className="lv-chip" aria-pressed={m.doorGapOk === true} onClick={() => update({ gap: true, method: 'door-gap-gauge' })}>the 4 mm gauge step fits</button>
                  <button type="button" className="lv-chip" aria-pressed={m.doorGapOk === false} onClick={() => update({ gap: false })}>it does not fit</button>
                </div>
                <p className="lv-small">The door-gap gauge is in the test-print kit. Without it, a 4 mm stack of card gives a fair answer.</p>
              </div>
            </div>
          )}
          <label className="lv-check">
            <input type="checkbox" checked={m.confirmed} onChange={(e) => update({ confirmed: e.target.checked })} />
            <span>I measured this space myself and these numbers are right.</span>
          </label>
          <div className="lv-fit" data-status={fit.status}>
            <span className="lv-status" data-tone={fit.status === 'fits' ? 'ok' : fit.status === 'unconfirmed' ? 'quiet' : undefined}>{fit.status.replace(/_/g, ' ')}</span>
            <ul>{fit.notes.map((n) => <li key={n}>{n}</li>)}</ul>
            {(fit.status === 'too_wide' || fit.status === 'too_tall') && (
              <div className="lv-actions">
                <button type="button" className="lv-btn" data-variant="small" onClick={() => dispatch({ type: 'field', field: fit.status === 'too_wide' ? { columns: design.field.columns.slice(0, -1).length ? (design.field.columns.slice(0, -1) as (2 | 4)[]) : [4], rows: design.field.rows } : { columns: design.field.columns, rows: 1 } })}>drop a board {fit.status === 'too_wide' ? 'column' : 'row'}</button>
                <button type="button" className="lv-btn" data-variant="ghost" onClick={onBack}>← rework the layout</button>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="lv-panel">
          <span className="lv-eyebrow">04 · made for your space</span>
          <h2>Nothing on a board, so nothing to drill.</h2>
          <p className="lv-small">Trays, dowel joints and the shade only need the surface or fitting they go on. Made-to-measure trays are sized from your drawer&rsquo;s inside width, depth and height, which we confirm with you before printing.</p>
        </section>
      )}

      {fit.status === 'fits' && (
        <section className="lv-panel" data-tone="chalk" aria-labelledby="lv-assembling-kit">
          <span className="lv-eyebrow">assembling the kit</span>
          <h3 id="lv-assembling-kit">{assembled ? 'Your configuration is ready to quote.' : 'Checking every part against your space…'}</h3>
          <ul className="lv-assembling">
            {steps.map((s, i) => (
              <li key={s.id} style={{ animationDelay: `${i * 420}ms` }}><i>✓</i><div><b>{s.label}</b><span>{s.detail}</span></div></li>
            ))}
          </ul>
        </section>
      )}

      {fit.status === 'fits' && assembled && (
        <section className="lv-panel" aria-labelledby="lv-config">
          <div className="lv-section-head" style={{ marginBottom: 0 }}>
            <span className="lv-eyebrow">saved configuration</span>
            <h2 id="lv-config">Every part, its reorder code and how it prints.</h2>
          </div>
          <div className="lv-strip">
            <span className="lv-status">proposed</span>
            <span className="lv-status" data-tone="quiet">purchasing not enabled</span>
            <span className="lv-status" data-tone="quiet">{INTERFACE_ID} · pack {CAD_PACK}</span>
          </div>
          <table className="lv-bom">
            <thead><tr><th>part</th><th>print files</th><th>code</th></tr></thead>
            <tbody>
              {config.lines.map((l) => {
                const product = productByHandle(l.handle)!;
                return (
                  <tr key={l.handle}>
                    <td><b style={{ fontWeight: 500, color: 'var(--lv-plum)' }}>{l.qty} × {product.title}</b><br /><small className="lv-small">{product.size} · {product.material}{product.personalised && design.name ? ` · ${design.name}` : ''}</small></td>
                    <td className="lv-small">
                      {l.printFiles.map((f) => {
                        const pf = printFile(f.id);
                        return (
                          <span key={f.id} style={{ display: 'block' }}>
                            {f.qty} × {pf.file ? <a href={pf.file.path} download>{f.id}.stl</a> : f.id} · {pf.mass_g_pla} g · {pf.print_orientation.replace('_', ' ')}{pf.supports !== 'none' ? ` · ${pf.supports}` : ''}
                          </span>
                        );
                      })}
                    </td>
                    <td>{l.sku ?? 'quoted'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <dl className="lv-kv">
            <dt>fit</dt><dd>{config.fit.status.replace(/_/g, ' ')}{needsWall ? ` · needs ${config.fit.requiredWidthMm} × ${config.fit.requiredHeightMm} mm` : ''}</dd>
            <dt>price</dt><dd>{nzd(config.price.nzd)}{config.price.quotedLines > 0 ? ` + ${config.price.quotedLines} line${config.price.quotedLines > 1 ? 's' : ''} quoted per order` : ''} · {config.price.basis}</dd>
            <dt>measured by</dt><dd>{METHOD_LABELS[design.measurements.method]}</dd>
            <dt>purchasing</dt><dd>{config.purchasing.reason}</dd>
          </dl>
          <div className="lv-actions">
            <button type="button" className="lv-btn" onClick={download}>download configuration (JSON)</button>
            <button type="button" className="lv-btn" data-variant="ghost" onClick={onSave}>save on this device</button>
            <Link href="/living" className="lv-btn" data-variant="ghost">back to assembl / living</Link>
          </div>
          <p className="lv-small">What happens next, honestly: the {TEST_KIT.files.length}-file test-print kit (about {TEST_KIT.total_g} g) goes to the print partner first, to tune the key clamp, the pocket clearance and the door gap. This file is what they quote from once that has run. {bom.quotedLines > 0 ? 'Made-to-measure trays are quoted from your drawer dimensions.' : ''}</p>
        </section>
      )}
      <div className="lv-actions">
        <button type="button" className="lv-btn" data-variant="ghost" onClick={onBack}>← assemble</button>
      </div>
    </>
  );
}
