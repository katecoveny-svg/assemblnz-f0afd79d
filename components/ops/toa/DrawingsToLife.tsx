'use client';

import { useEffect, useRef, useState } from 'react';
import { Cormorant_Garamond } from 'next/font/google';

/**
 * DrawingsToLife — "drawings rise. sun turns. rooms come to life."
 *
 * Nick's connection is to the drawing. So the drawing stays central: it starts
 * as a scanned 2D plan and, on scroll, lifts and recedes while the 3D model
 * rises in front of it — the drawing standing up, not replaced. The model is a
 * warm, furnished interior-design-style dollhouse of the 16C two-bed unit
 * (bim-viewer-interior.html): the rooms laid out and lived-in (Move 3), with a
 * real Auckland sun slider — dawn to golden hour (Move 2). We frame; we don't
 * re-port the model.
 *
 * Honest: the plan is a stand-in of the 16C typology, not Nick's sheets.
 */
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const VIEWER = '/brand/toa-architects/16a-hubert-henderson/bim-viewer-interior.html';
const CHAMPAGNE = '#bfa37a';

/** Scanned-look 2D floor plan of the 16C two-bed unit — inline, self-contained. */
function ScannedPlan() {
  return (
    <svg
      viewBox="0 0 520 380"
      role="img"
      aria-label="Scanned floor plan — 16C two-bed unit, stand-in"
      className="h-full w-full"
      style={{ filter: 'saturate(0.9)' }}
    >
      <defs>
        <filter id="paper-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" />
        </filter>
      </defs>

      {/* paper */}
      <rect x="0" y="0" width="520" height="380" fill="#f4f1e8" />
      {/* faint blue construction grid */}
      <g stroke="#7c9bc4" strokeWidth="0.5" opacity="0.28">
        {Array.from({ length: 13 }, (_, i) => (
          <line key={`v${i}`} x1={40 * i} y1="0" x2={40 * i} y2="380" />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={40 * i} x2="520" y2={40 * i} />
        ))}
      </g>

      {/* ink — walls in architect's weight */}
      <g stroke="#1a1918" fill="none" strokeLinejoin="miter">
        {/* outer envelope */}
        <rect x="70" y="60" width="380" height="250" strokeWidth="5" />
        {/* internal partitions */}
        <line x1="270" y1="60" x2="270" y2="200" strokeWidth="3" />
        <line x1="70" y1="200" x2="270" y2="200" strokeWidth="3" />
        <line x1="360" y1="200" x2="360" y2="310" strokeWidth="3" />
        <line x1="270" y1="200" x2="450" y2="200" strokeWidth="3" />
        {/* bathroom box */}
        <rect x="360" y="200" width="90" height="60" strokeWidth="3" />
        {/* door swings */}
        <path d="M180 200 A26 26 0 0 1 206 226" strokeWidth="1.5" opacity="0.7" />
        <path d="M270 130 A24 24 0 0 1 294 154" strokeWidth="1.5" opacity="0.7" />
        {/* deck (dashed) */}
        <rect x="70" y="310" width="200" height="44" strokeWidth="2" strokeDasharray="7 5" opacity="0.85" />
      </g>

      {/* room labels — hand-lettered feel */}
      <g fill="#3a352c" fontFamily="'Courier New', monospace" fontSize="12" letterSpacing="0.5">
        <text x="150" y="135">BED 1</text>
        <text x="150" y="260">LIVING / KITCHEN</text>
        <text x="315" y="135">BED 2</text>
        <text x="378" y="235">BATH</text>
        <text x="130" y="337" fill="#7c9bc4">DECK</text>
      </g>

      {/* dimension line */}
      <g stroke="#1a1918" strokeWidth="0.75" fill="#1a1918" fontFamily="'Courier New', monospace" fontSize="10">
        <line x1="70" y1="44" x2="450" y2="44" />
        <line x1="70" y1="40" x2="70" y2="48" />
        <line x1="450" y1="40" x2="450" y2="48" />
        <text x="238" y="40" textAnchor="middle">9 500</text>
      </g>

      {/* north arrow + title block */}
      <g stroke="#1a1918" strokeWidth="1" fill="#1a1918" fontFamily="'Courier New', monospace">
        <line x1="486" y1="52" x2="486" y2="24" />
        <path d="M486 24 l-4 8 h8 z" />
        <text x="481" y="66" fontSize="9">N</text>
      </g>
      <g fontFamily="'Courier New', monospace" fill="#3a352c">
        <text x="70" y="372" fontSize="11" letterSpacing="1">16C · TWO-BED · 65 m² · GA PLAN · stand-in</text>
      </g>

      {/* grain overlay */}
      <rect x="0" y="0" width="520" height="380" filter="url(#paper-grain)" />
    </svg>
  );
}

export function DrawingsToLife() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0); // scroll progress 0..1 through the tall stage
  const [reduced, setReduced] = useState(false);
  const [mount, setMount] = useState(false); // lazy-load the heavy viewer

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onMq = () => setReduced(mq.matches);
    mq.addEventListener('change', onMq);
    return () => mq.removeEventListener('change', onMq);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1));
      setP(total > 0 ? scrolled / total : 0);
      if (!mount && rect.top < window.innerHeight * 1.5) setMount(true);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [mount]);

  // Motion mapping. First ~55% of the stage lifts the plan and rises the model.
  const t = reduced ? 1 : Math.min(p / 0.55, 1);
  const ease = t * t * (3 - 2 * t); // smoothstep
  const planOpacity = reduced ? 0.14 : 1 - ease * 0.86;
  const planTilt = reduced ? 60 : ease * 60; // deg rotateX — the sheet lies back
  const planLift = reduced ? -40 : -ease * 90; // translateY up
  const modelOpacity = reduced ? 1 : ease;
  const modelScale = reduced ? 1 : 0.9 + ease * 0.1;
  const modelRise = reduced ? 0 : (1 - ease) * 60;

  return (
    <section aria-label="Drawings, coming to life" className="flex flex-col gap-6">
      <div className="max-w-3xl">
        <h2
          className={`${cormorant.className} lowercase text-3xl leading-tight md:text-4xl`}
          style={{ color: '#161516' }}
        >
          drawings rise. sun turns. rooms come to life.
        </h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: '#363a35' }}>
          the drawing stays central. the model rises off it — same 16A, now
          standing, furnished, and lit. scroll.
        </p>
      </div>

      {/* Tall stage — the sticky viewport inside animates on scroll. */}
      <div ref={wrapRef} className="relative h-[220vh] md:h-[200vh]">
        <div className="sticky top-[8vh] flex h-[84vh] items-center justify-center [perspective:1400px]">
          <div className="relative h-full w-full overflow-hidden rounded-2xl border border-black/10 bg-[#161516]">
            {/* the 3D model — Kate's verbatim viewer, rising in front */}
            <div
              className="absolute inset-0"
              style={{
                opacity: modelOpacity,
                transform: `translateY(${modelRise}px) scale(${modelScale})`,
                transformOrigin: 'center 60%',
                pointerEvents: t > 0.85 ? 'auto' : 'none',
              }}
            >
              {mount ? (
                <iframe
                  src={VIEWER}
                  title="16A Hubert Henderson Place — furnished two-bed unit, interior model with sun study"
                  className="block h-full w-full border-0"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[12px] uppercase tracking-[0.3em]" style={{ color: `${CHAMPAGNE}aa` }}>
                  loading the 16A model
                </div>
              )}
            </div>

            {/* the scanned plan — lifts and lies back as you scroll */}
            <div
              aria-hidden={t > 0.9}
              className="pointer-events-none absolute inset-0 flex items-center justify-center p-6 md:p-10"
              style={{
                opacity: planOpacity,
                transform: `translateY(${planLift}px) rotateX(${planTilt}deg)`,
                transformOrigin: 'center bottom',
              }}
            >
              <div className="w-full max-w-2xl rounded-lg bg-[#f4f1e8] shadow-2xl ring-1 ring-black/10">
                <ScannedPlan />
              </div>
            </div>

            {/* caption — the drawing standing */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent p-4 md:p-5">
              <p className={`${cormorant.className} text-lg italic md:text-xl`} style={{ color: 'white' }}>
                {t < 0.85 ? 'the drawing you drew —' : 'the drawing you drew — now standing.'}
              </p>
              <a
                href={VIEWER}
                target="_blank"
                rel="noreferrer"
                className="pointer-events-auto shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition hover:opacity-90"
                style={{ backgroundColor: CHAMPAGNE, color: '#1a1918' }}
              >
                open the model →
              </a>
            </div>
          </div>
        </div>
      </div>

      <p className="-mt-2 text-[12px]" style={{ color: '#6f6f64' }}>
        stand-in model — 16A-style typology, not Nick&apos;s actual drawings.
      </p>

      {/* the three moves, named — the interactivity lives in the model above */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {[
          {
            k: 'the drawing, standing',
            cap: 'the drawing you drew — now standing.',
            sub: 'plan to model, in one scroll.',
          },
          {
            k: 'the sun, crossing',
            cap: 'dawn. midday. golden hour. one real Auckland day.',
            sub: 'drag the light slider in the model.',
          },
          {
            k: 'the rooms, furnished',
            cap: 'beds, kitchen, living, deck — every space laid out.',
            sub: 'toggle furnished or bare shell in the model.',
          },
        ].map((m) => (
          <div key={m.k} className="flex flex-col gap-2 rounded-xl border border-black/5 bg-white p-4">
            <span
              className="font-[family-name:var(--font-brand-mono)] text-[12px] uppercase tracking-[0.2em]"
              style={{ color: '#8a744f' }}
            >
              {m.k}
            </span>
            <p className={`${cormorant.className} text-lg italic leading-snug`} style={{ color: '#161516' }}>
              {m.cap}
            </p>
            <p className="text-[12px]" style={{ color: '#6f6f64' }}>
              {m.sub}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
