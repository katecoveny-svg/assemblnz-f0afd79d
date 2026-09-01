'use client';

/**
 * Immersive loyalty homepage — craft bar from Kate's Claude Design artifact.
 * Atmospheric plum + faceted depth · split editorial/phone · loyalty spine only.
 * Phone stepper: 01 WAIT → 02 EARN → 03 EVIDENCE (never life-admin labels).
 */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import {
  ASSEMBL_CANON,
  DEMO_EARN,
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

const THEME = {
  '--eeh-plum': ASSEMBL_CANON.plum,
  '--eeh-mulberry': ASSEMBL_CANON.mulberry,
  '--eeh-heather': ASSEMBL_CANON.heather,
  '--eeh-chalk': ASSEMBL_CANON.chalk,
  '--eeh-paper': ASSEMBL_CANON.paper,
  '--eeh-accent': DIGITAL_TURQUOISE,
} as CSSProperties;

export function EarnEventHome() {
  const [beat, setBeat] = useState<Beat>('wait');
  const [reduced, setReduced] = useState(false);

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
      return;
    }
    const order: Beat[] = ['wait', 'earn', 'evidence'];
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % order.length;
      setBeat(order[i]!);
    }, 3200);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <div className="eeh" style={THEME}>
      <div className="eeh-atmosphere" aria-hidden="true">
        <FacetedField className="eeh-field" />
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
        <section className="eeh-hero" aria-labelledby="eeh-masthead">
          <div className="eeh-copy">
            <p className="eeh-brand-line">assembl.</p>
            <h1 id="eeh-masthead">{MASTHEAD}</h1>
            <p className="eeh-lede">
              Agentic loyalty that turns everyday waits into Phone Dollars.
              <span> Real value. Real time.</span>
            </p>
            <p className="eeh-mono-line">{TWELVE_WORD_ENERGY}</p>

            <ul className="eeh-chips" aria-label="Positioning">
              <li>mode · agentic loyalty</li>
              <li>first fit · one nz</li>
              <li>independent concept</li>
            </ul>

            <div className="eeh-ctas">
              <Link className="eeh-cta-primary" href="/journeys/one-nz">
                show me the demo
              </Link>
              <Link className="eeh-cta-ghost" href="/contact">
                book a working session
              </Link>
            </div>
          </div>

          <aside className="eeh-stage" aria-label="Loyalty journey on the phone">
            <div className="eeh-phone" data-beat={beat}>
              <div className="eeh-phone-chrome">
                <span className="eeh-one-mark">one.nz</span>
                <span className="eeh-how">how it works</span>
              </div>

              <ol className="eeh-stepper" aria-label="Loyalty process">
                {STEPS.map((s) => (
                  <li key={s.id} data-on={beat === s.id || undefined}>
                    <em>{s.n}</em>
                    <span>{s.label}</span>
                  </li>
                ))}
              </ol>

              <div className="eeh-phone-body">
                {beat === 'wait' && (
                  <>
                    <p className="eeh-raw">eSIM activation in progress · you&rsquo;re in a wait moment</p>
                    <div className="eeh-wait-dot" aria-hidden="true">
                      <i />
                    </div>
                    <p className="eeh-accent-line">detect · activate · credit</p>
                    <p className="eeh-quiet">Earning Phone Dollars while One NZ finishes the work.</p>
                  </>
                )}

                {beat === 'earn' && (
                  <>
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
                  </>
                )}

                {beat === 'evidence' && (
                  <>
                    <p className="eeh-transform">↓ mana receipt</p>
                    <dl className="eeh-evidence eeh-evidence-lock">
                      <div>
                        <dt>moment</dt>
                        <dd>2 May 2025, 9:41pm</dd>
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
                  </>
                )}
              </div>
            </div>

            <div className="eeh-plinth" aria-hidden="true" />
          </aside>
        </section>

        <section className="eeh-modes" aria-labelledby="eeh-modes-title">
          <p className="eeh-section-kicker">two ways to run it</p>
          <h2 id="eeh-modes-title">Mode A · Mode B</h2>
          <div className="eeh-modes-grid">
            <article>
              <span>Mode A · preferred</span>
              <h3>assembl brings the agentic layer</h3>
              <p>
                One NZ keeps Phone Dollars and One Wallet. assembl recognises wait moments, stamps
                credit in real time, and issues Mana Receipts with a named person responsible.
              </p>
            </article>
            <article>
              <span>Mode B · optional</span>
              <h3>loyalty runs inside your stack</h3>
              <p>
                Same wait → earn → evidence pattern, wired to systems you already operate. The
                customer still earns currency they already value.
              </p>
            </article>
          </div>
        </section>
      </main>

      <footer className="eeh-footer">
        <div>
          <strong>assembl</strong>
          <span>experience design · loyalty strategy · product design</span>
        </div>
        <span className="eeh-footer-place">Aotearoa New Zealand</span>
      </footer>
    </div>
  );
}
