'use client';

/**
 * Assembl loyalty homepage — scroll-pinned cinematic hero.
 * Assembl brand only (plum/heather). No One NZ packaging.
 * Real phone UI · dynamic system note · wait → earn → evidence.
 */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ASSEMBL_CANON, DEMO_RECEIPT_AT, MASTHEAD } from '@/lib/loyalty/one-nz';
import './earn-event-home.css';

const FacetedField = dynamic(
  () => import('./FacetedField').then((m) => m.FacetedField),
  { ssr: false },
);

type Beat = 'wait' | 'earn' | 'evidence';

const STEPS: { id: Beat; label: string }[] = [
  { id: 'wait', label: 'wait' },
  { id: 'earn', label: 'earn' },
  { id: 'evidence', label: 'evidence' },
];

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

/** Living in-phone notes — timed / scroll-tied, not static kv boards. */
const LIVE_NOTES: Record<Beat, string[]> = {
  wait: [
    'hold detected · 0:12',
    'you\'re in a wait moment',
    'earning started · quietly',
  ],
  earn: [
    'credit stamped · +$0.45',
    'wallet updated · this line',
    'still waiting · still earning',
  ],
  evidence: [
    'Mana Receipt drafting…',
    `locked · ${DEMO_RECEIPT_AT}`,
    'named human · Alex R.',
    'your wait, recorded properly',
  ],
};

const THEME = {
  '--eeh-plum': ASSEMBL_CANON.plum,
  '--eeh-mulberry': ASSEMBL_CANON.mulberry,
  '--eeh-heather': ASSEMBL_CANON.heather,
  '--eeh-chalk': ASSEMBL_CANON.chalk,
  '--eeh-paper': ASSEMBL_CANON.paper,
  '--eeh-accent': ASSEMBL_CANON.heather,
} as CSSProperties;

function useClock(reduced: boolean) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, [reduced]);
  return now.toLocaleTimeString('en-NZ', { hour: 'numeric', minute: '2-digit', hour12: false });
}

function useLiveNote(lines: string[], active: boolean, reduced: boolean, beatProgress: number) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState(reduced ? lines[0]! : '');
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');

  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setIdx(lines.length - 1);
      setText(lines[lines.length - 1]!);
      setPhase('hold');
      return;
    }

    // Scroll-tied index within the beat, plus a gentle auto-advance floor.
    const fromScroll = Math.min(lines.length - 1, Math.floor(beatProgress * lines.length));
    setIdx(fromScroll);
  }, [active, reduced, lines, beatProgress]);

  useEffect(() => {
    if (!active || reduced) return;
    const full = lines[idx] ?? '';
    setPhase('in');
    setText('');
    let i = 0;
    const typeId = window.setInterval(() => {
      i += 1;
      setText(full.slice(0, i));
      if (i >= full.length) {
        window.clearInterval(typeId);
        setPhase('hold');
      }
    }, 22);

    const advanceId = window.setTimeout(() => {
      setPhase('out');
      window.setTimeout(() => {
        setIdx((n) => (n + 1) % lines.length);
      }, 320);
    }, Math.max(2200, full.length * 28 + 1400));

    return () => {
      window.clearInterval(typeId);
      window.clearTimeout(advanceId);
    };
  }, [idx, active, reduced, lines]);

  return { text, phase, idx };
}

function beatFromProgress(p: number): Beat {
  if (p < 0.34) return 'wait';
  if (p < 0.67) return 'earn';
  return 'evidence';
}

function beatLocalProgress(p: number): number {
  if (p < 0.34) return p / 0.34;
  if (p < 0.67) return (p - 0.34) / 0.33;
  return (p - 0.67) / 0.33;
}

export function EarnEventHome() {
  const pinRef = useRef<HTMLDivElement>(null);
  const [beat, setBeat] = useState<Beat>('wait');
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);
  const clock = useClock(reduced);
  const local = beatLocalProgress(progress);
  const note = useLiveNote(LIVE_NOTES[beat], true, reduced, local);

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
        setBeat('wait');
        return;
      }
      const p = Math.min(1, Math.max(0, -rect.top / total));
      setProgress(p);
      setBeat(beatFromProgress(p));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced]);

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
          <Link href="/journeys/one-nz">the demo</Link>
          <Link href="/contact">book</Link>
          <a href="mailto:assembl@assembl.co.nz?subject=Agentic%20loyalty%20working%20session">
            contact
          </a>
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
                <Link className="eeh-cta-primary" href="/journeys/one-nz">
                  show me a client demo
                </Link>
                <Link className="eeh-cta-ghost" href="/contact">
                  book a working session
                </Link>
              </div>

              <div className="eeh-scroll-meter" aria-hidden="true">
                <i style={{ transform: `scaleX(${progress})` }} />
              </div>
              <p className="eeh-scroll-hint">scroll to advance the wait</p>
            </div>

            <aside className="eeh-stage" aria-label="Loyalty journey on the phone">
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

              <div className="eeh-device" data-beat={beat}>
                <div className="eeh-device-side eeh-device-side-l" aria-hidden="true" />
                <div className="eeh-device-side eeh-device-side-r" aria-hidden="true" />
                <div className="eeh-device-bezel">
                  <div className="eeh-island" aria-hidden="true" />
                  <div className="eeh-screen">
                    <div className="eeh-statusbar">
                      <span className="eeh-time">{clock}</span>
                      <span className="eeh-status-icons" aria-hidden="true">
                        <i className="eeh-sig" />
                        <i className="eeh-wifi" />
                        <i className="eeh-batt" />
                      </span>
                    </div>

                    <div className="eeh-appbar">
                      <span className="eeh-app-mark">assembl</span>
                      <span className="eeh-app-sub">loyalty</span>
                    </div>

                    <div className="eeh-seg" role="tablist" aria-label="Loyalty process">
                      {STEPS.map((s) => (
                        <span
                          key={s.id}
                          role="tab"
                          aria-selected={beat === s.id}
                          data-on={beat === s.id || undefined}
                        >
                          {s.label}
                        </span>
                      ))}
                    </div>

                    <div className="eeh-screen-body">
                      {beat === 'wait' && (
                        <div className="eeh-phone-beat" key="wait">
                          <article className="eeh-push" data-enter>
                            <header>
                              <span className="eeh-push-app">assembl</span>
                              <span className="eeh-push-when">now</span>
                            </header>
                            <h3>Wait detected</h3>
                            <p>Activation hold · you’re earning while it finishes.</p>
                          </article>

                          <div className="eeh-status-card">
                            <div className="eeh-pulse" aria-hidden="true">
                              <i />
                            </div>
                            <div>
                              <strong>in progress</strong>
                              <span>detect · activate · credit</span>
                            </div>
                          </div>

                          <div className={`eeh-live-note eeh-live-note--${note.phase}`} aria-live="polite">
                            <span className="eeh-live-kicker">system note</span>
                            <p>
                              {note.text}
                              <i className="eeh-caret" aria-hidden="true" />
                            </p>
                          </div>
                        </div>
                      )}

                      {beat === 'earn' && (
                        <div className="eeh-phone-beat" key="earn">
                          <article className="eeh-push eeh-push-earn" data-enter>
                            <header>
                              <span className="eeh-push-app">assembl</span>
                              <span className="eeh-push-when">just now</span>
                            </header>
                            <h3>Credit landed</h3>
                            <p>+$0.45 while you waited · this line</p>
                          </article>

                          <div className="eeh-balance-card" data-enter>
                            <span>this wait</span>
                            <strong>+$0.45</strong>
                            <em>still open · still earning</em>
                          </div>

                          <div className={`eeh-live-note eeh-live-note--${note.phase}`} aria-live="polite">
                            <span className="eeh-live-kicker">system note</span>
                            <p>
                              {note.text}
                              <i className="eeh-caret" aria-hidden="true" />
                            </p>
                          </div>
                        </div>
                      )}

                      {beat === 'evidence' && (
                        <div className="eeh-phone-beat" key="evidence">
                          <div className="eeh-sheet" data-enter>
                            <header className="eeh-sheet-head">
                              <span>Mana Receipt</span>
                              <em>locked</em>
                            </header>
                            <p className="eeh-sheet-when">{DEMO_RECEIPT_AT}</p>
                            <ul className="eeh-sheet-rows">
                              <li>
                                <span>earned</span>
                                <strong>+$0.45</strong>
                              </li>
                              <li>
                                <span>permission</span>
                                <strong>opted in</strong>
                              </li>
                              <li>
                                <span>named human</span>
                                <strong>Alex R.</strong>
                              </li>
                            </ul>
                          </div>

                          <div className={`eeh-live-note eeh-live-note--${note.phase}`} aria-live="polite">
                            <span className="eeh-live-kicker">system note</span>
                            <p>
                              {note.text}
                              <i className="eeh-caret" aria-hidden="true" />
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="eeh-home-indicator" aria-hidden="true" />
                  </div>
                </div>
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
