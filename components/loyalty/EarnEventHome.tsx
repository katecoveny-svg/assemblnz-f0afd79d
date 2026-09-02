'use client';

/**
 * Assembl loyalty homepage — atmospheric plum craft + wait→earn phone.
 * Assembl brand only. No One NZ packaging. No Aotearoa watermarks.
 * Phone = loyalty/wait narrative (scroll-tied), not FAQ chat.
 */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { LoyaltyWaitPhone, type LoyaltyBeat } from '@/components/loyalty/LoyaltyWaitPhone';
import { ASSEMBL_CANON, MASTHEAD } from '@/lib/loyalty/one-nz';
import './loyalty-wait-phone.css';
import './earn-event-home.css';

const FacetedField = dynamic(
  () => import('./FacetedField').then((m) => m.FacetedField),
  { ssr: false },
);

type Beat = LoyaltyBeat;

/** Assembl-general spine — no client packaging. */
const SPINE_LINE =
  'assembling turns activation and hold-time waits into earned credit — with proof you can keep.';

const BEAT_COPY: Record<Beat, { kicker: string; line: string }> = {
  wait: {
    kicker: '01 · wait',
    line: 'We detect a real wait and start earning for you.',
  },
  earn: {
    kicker: '02 · earn',
    line: 'Credit lands while the wait is still happening.',
  },
  evidence: {
    kicker: '03 · evidence',
    line: 'Mana Receipt locks the record with a named human.',
  },
};

const THEME = {
  '--eeh-plum': ASSEMBL_CANON.plum,
  '--eeh-mulberry': ASSEMBL_CANON.mulberry,
  '--eeh-heather': ASSEMBL_CANON.heather,
  '--eeh-chalk': ASSEMBL_CANON.chalk,
  '--eeh-paper': ASSEMBL_CANON.paper,
  '--eeh-accent': ASSEMBL_CANON.heather,
} as CSSProperties;

function beatFromProgress(p: number): Beat {
  if (p < 0.34) return 'wait';
  if (p < 0.67) return 'earn';
  return 'evidence';
}

export function EarnEventHome() {
  const pinRef = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState<Beat>('wait');
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const holdBeatUntil = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reduced) {
      setBeat('evidence');
      setProgress(1);
      return;
    }

    const onScroll = () => {
      const el = pinRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) {
        setProgress(0);
        if (Date.now() > holdBeatUntil.current) setBeat('wait');
        return;
      }
      const p = Math.min(1, Math.max(0, -rect.top / total));
      setProgress(p);
      if (Date.now() > holdBeatUntil.current) setBeat(beatFromProgress(p));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced]);

  const requestBeat = (next: Beat) => {
    holdBeatUntil.current = Date.now() + 4200;
    setBeat(next);
    if (next === 'wait') setProgress(0.12);
    if (next === 'earn') setProgress(0.5);
    if (next === 'evidence') setProgress(0.9);
  };

  const beatMeta = BEAT_COPY[beat];

  return (
    <div className="eeh" style={THEME}>
      <div className="eeh-atmosphere" aria-hidden="true">
        <FacetedField className="eeh-field" accent={false} />
      </div>

      <header className="eeh-header">
        <Link href="/" className="eeh-wordmark" aria-label="assembl home">
          assembl.
        </Link>
        <nav aria-label="Primary">
          <Link href="/generative-studio">Generative studio</Link>
          <Link href="/journeys/one-nz">client demo</Link>
          <Link href="/contact">book</Link>
          <a href="mailto:assembl@assembl.co.nz?subject=Agentic%20loyalty%20working%20session">
            contact
          </a>
          <Link className="eeh-operator" href="/admin/login" rel="nofollow">
            Operator
          </Link>
        </nav>
      </header>

      <main className="eeh-main">
        <div className="eeh-pin" ref={pinRef}>
          <section
            className="eeh-hero"
            aria-labelledby="eeh-masthead"
            data-beat={beat}
            style={{ ['--eeh-progress' as string]: String(progress) }}
          >
            <div className="eeh-copy">
              <p className="eeh-brand-line">assembl.</p>
              <h1 id="eeh-masthead">{MASTHEAD}</h1>
              <p className="eeh-mono-line">{SPINE_LINE}</p>
              <p className="eeh-mode-strip">
                <span>detect · activate · credit</span>
                <span>wait → earn → evidence</span>
                <span>mana receipt</span>
              </p>

              <div className="eeh-beat-note" aria-live="polite" key={beat}>
                <span>{beatMeta.kicker}</span>
                <p>{beatMeta.line}</p>
              </div>

              <div className="eeh-ctas">
                <a className="eeh-cta-primary" href="#loyalty-phone">
                  watch the wait earn
                </a>
                <Link className="eeh-cta-ghost" href="/journeys/one-nz">
                  see a client demo
                </Link>
              </div>

              <div className="eeh-scroll-meter" aria-hidden="true">
                <i style={{ transform: `scaleX(${progress})` }} />
              </div>
              <p className="eeh-scroll-hint">scroll to advance wait → earn → evidence</p>
            </div>

            <aside className="eeh-stage" id="loyalty-phone" aria-label="Loyalty wait phone">
              <div className="eeh-fg-blur" aria-hidden="true" />
              <svg className="eeh-fg-pod eeh-fg-pod-a" viewBox="0 0 80 80" aria-hidden="true">
                <polygon points="40,4 72,40 40,76 8,40" />
              </svg>
              <svg className="eeh-fg-pod eeh-fg-pod-b" viewBox="0 0 80 80" aria-hidden="true">
                <polygon points="40,6 70,40 40,74 10,40" />
              </svg>
              <svg className="eeh-fg-pod eeh-fg-pod-c" viewBox="0 0 80 80" aria-hidden="true">
                <polygon points="40,8 68,40 40,72 12,40" />
              </svg>

              <div className="eeh-phone-host" data-beat={beat}>
                <LoyaltyWaitPhone
                  beat={beat}
                  progress={progress}
                  reduced={reduced}
                  onBeatRequest={requestBeat}
                />
              </div>
              <div className="eeh-plinth" aria-hidden="true" />
            </aside>
          </section>
        </div>
      </main>

      <footer className="eeh-footer">
        <div>
          <strong>assembl</strong>
          <span>experience design · loyalty strategy · product design</span>
        </div>
        <span className="eeh-footer-place">preview · not production</span>
      </footer>
    </div>
  );
}
