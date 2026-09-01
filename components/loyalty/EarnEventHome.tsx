'use client';

/**
 * Immersive loyalty homepage — scroll-pinned cinematic hero.
 * Scroll advances in-phone wait → earn → evidence. Loyalty spine only.
 */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  ASSEMBL_CANON,
  DEMO_EARN,
  DEMO_RECEIPT_AT,
  DIGITAL_TURQUOISE,
  MASTHEAD,
  nzd,
  TWELVE_WORD_ENERGY,
} from '@/lib/loyalty/one-nz';
import './earn-event-home.css';

const FacetedField = dynamic(
  () => import('./FacetedField').then((m) => m.FacetedField),
  { ssr: false },
);

type Beat = 'wait' | 'earn' | 'evidence';

const STEPS: { id: Beat; n: string; label: string }[] = [
  { id: 'wait', n: '01', label: 'wait' },
  { id: 'earn', n: '02', label: 'earn' },
  { id: 'evidence', n: '03', label: 'evidence' },
];

const WAIT_LINE = "eSIM activation in progress · you're in a wait moment";

const BEAT_COPY: Record<Beat, { kicker: string; line: string }> = {
  wait: {
    kicker: '01 · wait',
    line: 'We detect a real wait and start earning for you.',
  },
  earn: {
    kicker: '02 · earn',
    line: 'Phone Dollars stamp into One Wallet in real time.',
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
  '--eeh-accent': DIGITAL_TURQUOISE,
  '--po-client-color': DIGITAL_TURQUOISE,
  '--one-nz-accent': DIGITAL_TURQUOISE,
} as CSSProperties;

function useTypedLine(full: string, active: boolean, reduced: boolean) {
  const [text, setText] = useState(reduced || !active ? full : '');
  useEffect(() => {
    if (!active) return;
    if (reduced) {
      setText(full);
      return;
    }
    setText('');
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setText(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 28);
    return () => window.clearInterval(id);
  }, [full, active, reduced]);
  return text;
}

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
  const typed = useTypedLine(WAIT_LINE, beat === 'wait', reduced);

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
        <FacetedField className="eeh-field" accent />
        <span className="eeh-aotearoa eeh-aotearoa-a">Aotearoa</span>
        <span className="eeh-aotearoa eeh-aotearoa-b">Aotearoa</span>
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
              <p className="eeh-mono-line">{TWELVE_WORD_ENERGY}</p>
              <p className="eeh-mode-strip">
                <span>mode a · phone dollars</span>
                <span>detect · activate · credit</span>
                <span>mode b · optional</span>
              </p>

              <div className="eeh-beat-note" aria-live="polite" key={beat}>
                <span>{beatMeta.kicker}</span>
                <p>{beatMeta.line}</p>
              </div>

              <div className="eeh-ctas">
                <Link className="eeh-cta-primary" href="/journeys/one-nz">
                  show me the demo
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
              {/* HTML FG pods — Three.js field sits behind the phone; these cross in front. */}
              <svg className="eeh-fg-pod eeh-fg-pod-a" viewBox="0 0 80 80" aria-hidden="true">
                <polygon points="40,4 72,40 40,76 8,40" />
              </svg>
              <svg className="eeh-fg-pod eeh-fg-pod-b" viewBox="0 0 80 80" aria-hidden="true">
                <polygon points="40,6 70,40 40,74 10,40" />
              </svg>
              <svg className="eeh-fg-pod eeh-fg-pod-c" viewBox="0 0 80 80" aria-hidden="true">
                <polygon points="40,8 68,40 40,72 12,40" />
              </svg>
              <div
                className="eeh-phone"
                data-beat={beat}
                style={{ ['--po-client-color' as string]: DIGITAL_TURQUOISE }}
              >
                <div className="eeh-phone-chrome">
                  <span className="eeh-one-mark">one.nz</span>
                  <span className="eeh-how">how it works</span>
                </div>

                <ol className="eeh-stepper" aria-label="Loyalty process">
                  {STEPS.map((s) => (
                    <li key={s.id} data-on={beat === s.id || undefined}>
                      <span className="eeh-step-n">{s.n}</span>
                      <span className="eeh-step-label">{s.label}</span>
                    </li>
                  ))}
                </ol>

                <div className="eeh-phone-body">
                  {beat === 'wait' && (
                    <div className="eeh-phone-beat" key="wait">
                      <p className="eeh-raw">
                        {typed}
                        <i className="eeh-caret" aria-hidden="true" />
                      </p>
                      <div className="eeh-wait-dot" aria-hidden="true">
                        <i />
                      </div>
                      <p className="eeh-accent-line">detect · activate · credit</p>
                      <p className="eeh-quiet">Earning Phone Dollars while One NZ finishes the work.</p>
                    </div>
                  )}

                  {beat === 'earn' && (
                    <div className="eeh-phone-beat" key="earn">
                      <p className="eeh-transform">↓ becomes phone dollars</p>
                      <dl className="eeh-evidence">
                        <div>
                          <dt>wait</dt>
                          <dd>eSIM activation · ~90s</dd>
                        </div>
                        <div>
                          <dt>credit</dt>
                          <dd>+{nzd(DEMO_EARN.stamp)} Phone Dollars</dd>
                        </div>
                        <div>
                          <dt>wallet</dt>
                          <dd>One Wallet · this line</dd>
                        </div>
                        <div>
                          <dt>this wait</dt>
                          <dd>{nzd(DEMO_EARN.thisWait)} earned</dd>
                        </div>
                      </dl>
                      <p className="eeh-quiet">Currency the customer already values.</p>
                    </div>
                  )}

                  {beat === 'evidence' && (
                    <div className="eeh-phone-beat" key="evidence">
                      <p className="eeh-transform">↓ mana receipt</p>
                      <dl className="eeh-evidence eeh-evidence-lock">
                        <div>
                          <dt>moment</dt>
                          <dd>{DEMO_RECEIPT_AT}</dd>
                        </div>
                        <div>
                          <dt>earned</dt>
                          <dd>+{nzd(DEMO_EARN.stamp)} Phone Dollars</dd>
                        </div>
                        <div>
                          <dt>permission</dt>
                          <dd>opted in · reversible</dd>
                        </div>
                        <div>
                          <dt>named human</dt>
                          <dd>Alex R. · loyalty ops</dd>
                        </div>
                      </dl>
                      <p className="eeh-quiet">your wait, recorded properly. nothing invented.</p>
                    </div>
                  )}
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
        <span className="eeh-footer-place">Made in Aotearoa</span>
      </footer>
    </div>
  );
}
