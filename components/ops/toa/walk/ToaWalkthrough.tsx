'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { PHASES, type Phase, type PoiId } from './geometry';
import { POI_LIST, getPoi } from './poi-content';
import { PoiCard } from './PoiCard';
import { IsometricFallback } from './IsometricFallback';

/**
 * ToaWalkthrough — walk 16A while ARC hovers over it.
 *
 * The pattern is the Iris Ceramica gallery, re-cut for a NZ residential infill:
 * a "floor selector" that is really a 4D construction-phase selector (consent →
 * concept → under construction → complete), a walkable space, and seven eye-POIs
 * that reveal ARC's professional insight at the spatial moment it belongs to.
 *
 * Desktop: orbit by default, optional first-person (pointer-lock + WASD).
 * Touch: orbit + tap. Reduced-motion / no-WebGL: a static isometric, POIs intact.
 *
 * Honest: the model is the real proposed 16C unit — assembl-built in Blender
 * from the draft RC (villa-16a.glb), not a stand-in typology.
 */
const WalkCanvas = dynamic(() => import('./WalkCanvas').then((m) => m.WalkCanvas), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center" style={{ background: '#efeee7' }}>
      <span className="text-[12px] uppercase tracking-[0.3em]" style={{ color: '#8a744f' }}>
        building 16A…
      </span>
    </div>
  ),
});

const CHAMPAGNE = '#bfa37a';
const INK = '#161516';

const PHASE_META: Record<Phase, { label: string; tag: string; n: string }> = {
  consent: { label: 'Consent', tag: 'the plan, on the ground', n: '01' },
  concept: { label: 'Concept', tag: 'massing, no cladding', n: '02' },
  construction: { label: 'Under construction', tag: 'framed, roof open', n: '03' },
  complete: { label: 'Complete', tag: 'clad, glazed, lived-in', n: '04' },
};

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function ToaWalkthrough({ fullBleed = false }: { fullBleed?: boolean }) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const [touch, setTouch] = useState(false);

  const [phase, setPhase] = useState<Phase>('complete');
  const [activePoi, setActivePoi] = useState<PoiId | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [introGone, setIntroGone] = useState(false);

  useEffect(() => {
    setMounted(true);
    setWebgl(hasWebGL());
    setTouch(window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768);
  }, []);

  const use3D = mounted && webgl && !reduce;
  // cinematic intro title dissolves shortly after the model lands
  useEffect(() => {
    if (!use3D) return;
    const t = window.setTimeout(() => setIntroGone(true), 2600);
    return () => window.clearTimeout(t);
  }, [use3D]);

  function changePhase(next: Phase) {
    if (next === phase || transitioning) return;
    setActivePoi(null);
    if (!use3D) {
      setPhase(next);
      return;
    }
    // "change floor" as a gentle dissolve — matched to the film's single
    // continuous take: warm cream wash in, swap under it, ease back out
    setTransitioning(true);
    window.setTimeout(() => setPhase(next), 420);
    window.setTimeout(() => setTransitioning(false), 940);
  }

  const stageHeight = fullBleed
    ? 'h-[78vh] min-h-[560px]'
    : 'h-[70vh] min-h-[520px] md:h-[74vh]';

  const activePoiObj = useMemo(() => (activePoi ? getPoi(activePoi) : null), [activePoi]);

  return (
    <section aria-label="Walk 16A with ARC" className="flex flex-col gap-5">
      {/* keyframes for the POI pulse (scoped, defined once per mount) */}
      <style>{`@keyframes poiPulse{0%{transform:scale(1);opacity:.65}70%{transform:scale(2);opacity:0}100%{opacity:0}}@keyframes poiEnter{0%{opacity:0;transform:scale(.5)}60%{opacity:1}100%{opacity:1;transform:scale(1)}}`}</style>

      {/* header */}
      <div className="flex flex-col gap-2">
        <p className="text-[12px] uppercase tracking-[0.28em]" style={{ color: '#6f6f64' }}>
          walk-through · 16A hubert henderson place
        </p>
        <h2
          className="text-3xl lowercase leading-tight md:text-4xl"
          style={{ color: INK, fontFamily: 'var(--font-brand-display, Cormorant Garamond), Georgia, serif' }}
        >
          walk 16A while ARC hovers over it.
        </h2>
        <p className="max-w-2xl text-[13.5px] leading-relaxed" style={{ color: '#363a35' }}>
          The building you drew, in four states. Move through it, and click the champagne eyes —
          each one is what ARC would have handled while you drew: the zone rule, the energy clause,
          the consent memo, the site notes turned into RFIs.
        </p>
      </div>

      {/* 4D phase selector — the "change floor" control */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          {PHASES.map((p) => {
            const active = p === phase;
            const m = PHASE_META[p];
            return (
              <button
                key={p}
                type="button"
                onClick={() => changePhase(p)}
                aria-pressed={active}
                className="group flex items-center gap-2 rounded-full px-3.5 py-2 text-left transition"
                style={{
                  background: active ? INK : 'transparent',
                  border: `1px solid ${active ? INK : 'rgba(0,0,0,0.14)'}`,
                }}
              >
                <span
                  className="text-[12px] font-semibold tracking-wider"
                  style={{ color: active ? CHAMPAGNE : '#8a744f', fontFamily: 'var(--font-brand-mono, monospace)' }}
                >
                  {m.n}
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="text-[12.5px] font-semibold" style={{ color: active ? '#fff' : INK }}>
                    {m.label}
                  </span>
                  <span className="hidden text-[12px] sm:block" style={{ color: active ? 'rgba(255,255,255,0.7)' : '#6f6f64' }}>
                    {m.tag}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* the stage */}
      <div
        className={`relative w-full overflow-hidden rounded-2xl ${stageHeight}`}
        style={{ background: 'linear-gradient(180deg,#efe9dc 0%,#ece6d8 55%,#e6dccb 100%)', border: '1px solid rgba(0,0,0,0.08)' }}
      >
        {!mounted ? (
          <div className="grid h-full w-full place-items-center">
            <span className="text-[12px] uppercase tracking-[0.3em]" style={{ color: '#8a744f' }}>
              building 16A…
            </span>
          </div>
        ) : use3D ? (
          <WalkCanvas
            phase={phase}
            cinematic={use3D}
            pois={POI_LIST}
            activePoi={activePoi}
            onOpenPoi={(id) => setActivePoi(id)}
          />
        ) : (
          <IsometricFallback phase={phase} onOpenPoi={(id) => setActivePoi(id)} />
        )}

        {/* phase label — top-left */}
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-[12px] font-semibold uppercase tracking-[0.16em]"
            style={{ background: 'rgba(22,21,22,0.85)', color: CHAMPAGNE, fontFamily: 'var(--font-brand-mono, monospace)' }}
          >
            {PHASE_META[phase].n} · {PHASE_META[phase].label}
          </span>
        </div>

        {/* controls hint — bottom-left */}
        <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
          <span
            className="rounded-full px-2.5 py-1 text-[12px]"
            style={{ background: 'rgba(255,255,255,0.82)', color: '#363a35', backdropFilter: 'blur(4px)' }}
          >
            {!use3D
              ? 'tap an eye to reveal an ARC insight'
              : touch
                ? 'drag to orbit · pinch to zoom · tap an eye'
                : 'drag to look · scroll to zoom · click an eye'}
          </span>
        </div>

        {/* honest attribution — bottom-right, quiet */}
        <span
          className="pointer-events-none absolute bottom-4 right-4 max-w-[46%] text-right text-[12px] leading-tight"
          style={{ color: '#8a8578' }}
        >
          the proposed 16C unit · assembl-built 3D model (Blender) from the draft RC
        </span>

        {/* cinematic intro — dissolves as the camera pushes into the model */}
        {use3D && !introGone ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 grid place-items-center px-6 text-center transition-opacity duration-[900ms] ease-in-out"
            style={{
              background: 'radial-gradient(120% 90% at 50% 45%, rgba(242,235,221,0.9) 0%, rgba(242,235,221,0.55) 45%, rgba(242,235,221,0) 78%)',
              opacity: introGone ? 0 : 1,
            }}
          >
            <span
              className="text-2xl lowercase leading-tight md:text-4xl"
              style={{
                color: INK,
                fontFamily: 'var(--font-brand-display, Cormorant Garamond), Georgia, serif',
                animation: 'poiEnter 1.1s cubic-bezier(0.22,1,0.36,1) both',
              }}
            >
              tēnā koe, Nick — remember 16A?
            </span>
          </div>
        ) : null}

        {/* "change floor" transition wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out"
          style={{ background: '#f2ebdd', opacity: transitioning ? 1 : 0 }}
        />

        {/* POI reveal */}
        {activePoiObj ? <PoiCard poi={activePoiObj} onClose={() => setActivePoi(null)} /> : null}
      </div>

      {/* POI index — the seven insights, also clickable */}
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-7">
        {POI_LIST.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActivePoi(p.id)}
            className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left transition hover:bg-black/[0.03]"
            style={{ borderColor: 'rgba(0,0,0,0.1)' }}
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full" style={{ background: INK, border: `1px solid ${CHAMPAGNE}` }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" stroke="#f2ead9" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="2.6" fill={CHAMPAGNE} />
              </svg>
            </span>
            <span className="text-[12px] font-medium leading-tight" style={{ color: INK }}>
              {p.label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
