'use client';

/**
 * One NZ agentic loyalty journey — craft-matched to the atmospheric homepage.
 * Spine: wait → earn → evidence. Accent locked #007C92.
 * Never life-admin labels (SAY IT / THE ASK / ASSEMBL'D).
 */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import {
  ASSEMBL_CANON,
  DEMO_EARN,
  DIGITAL_TURQUOISE,
  EVIDENCE_SPLIT,
  INDEPENDENT_CONCEPT_DISCLAIMER,
  MASTHEAD,
  nzd,
  TWELVE_WORD_ENERGY,
  WAIT_TRIGGERS,
} from '@/lib/loyalty/one-nz';
import './one-nz-journey.css';

const FacetedField = dynamic(
  () => import('./FacetedField').then((m) => m.FacetedField),
  { ssr: false },
);

type TriggerId = (typeof WAIT_TRIGGERS)[number]['id'];
type Beat = 'wait' | 'earn' | 'evidence';

const STEPS: { id: Beat; n: string; label: string }[] = [
  { id: 'wait', n: '01', label: 'wait' },
  { id: 'earn', n: '02', label: 'earn' },
  { id: 'evidence', n: '03', label: 'evidence' },
];

const THEME = {
  '--onz-plum': ASSEMBL_CANON.plum,
  '--onz-mulberry': ASSEMBL_CANON.mulberry,
  '--onz-heather': ASSEMBL_CANON.heather,
  '--onz-chalk': ASSEMBL_CANON.chalk,
  '--onz-paper': ASSEMBL_CANON.paper,
  '--onz-accent': DIGITAL_TURQUOISE,
} as CSSProperties;

export function OneNzJourney() {
  const [trigger, setTrigger] = useState<TriggerId>('esim');
  const [beat, setBeat] = useState<Beat>('wait');
  const [earned, setEarned] = useState(0);
  const [stamped, setStamped] = useState(false);
  const [household, setHousehold] = useState(false);
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
      setEarned(DEMO_EARN.thisWait);
      setStamped(true);
      setBeat('evidence');
      return;
    }

    setBeat('wait');
    setEarned(0);
    setStamped(false);
    let current = 0;
    const target = DEMO_EARN.thisWait;
    const step = target / 16;

    const earnTimer = window.setTimeout(() => setBeat('earn'), 1400);
    const id = window.setInterval(() => {
      current = Math.min(target, current + step);
      setEarned(Number(current.toFixed(2)));
      if (current >= target) {
        window.clearInterval(id);
        window.setTimeout(() => {
          setStamped(true);
          setBeat('evidence');
        }, 500);
      }
    }, 140);

    return () => {
      window.clearInterval(id);
      window.clearTimeout(earnTimer);
    };
  }, [trigger, reduced]);

  const active = WAIT_TRIGGERS.find((t) => t.id === trigger)!;

  return (
    <div className="onz" style={THEME}>
      <div className="onz-atmosphere" aria-hidden="true">
        <FacetedField className="onz-field" accent />
        <span className="onz-aotearoa">Aotearoa</span>
      </div>

      <a className="onz-skip" href="#onz-live">
        Skip to journey
      </a>

      <header className="onz-header">
        <Link href="/" className="onz-wordmark">
          assembl.
        </Link>
        <nav aria-label="Journey actions">
          <a href="#onz-pilot">show me the pilot</a>
          <a href="mailto:assembl@assembl.co.nz?subject=One%20NZ%20loyalty%20working%20session">
            book working session
          </a>
        </nav>
      </header>

      <div className="onz-disclaimer" role="note">
        <p>{INDEPENDENT_CONCEPT_DISCLAIMER}</p>
      </div>

      <main className="onz-main">
        <section className="onz-hero" aria-labelledby="onz-title">
          <div className="onz-hero-copy">
            <p className="onz-brand">assembl.</p>
            <h1 id="onz-title">{MASTHEAD}</h1>
            <p className="onz-lede">{TWELVE_WORD_ENERGY}</p>
            <ul className="onz-chips">
              <li>detect · activate · credit</li>
              <li>phone dollars · one wallet</li>
              <li>mana receipts</li>
            </ul>
          </div>

          <aside className="onz-live" id="onz-live" aria-label="Live loyalty phone">
            <div className="onz-phone" data-beat={beat}>
              <div className="onz-phone-chrome">
                <span>one.nz</span>
                <span className="onz-how">how it works</span>
              </div>

              <ol className="onz-stepper" aria-label="Loyalty process">
                {STEPS.map((s) => (
                  <li key={s.id} data-on={beat === s.id || undefined}>
                    <em>{s.n}</em>
                    <span>{s.label}</span>
                  </li>
                ))}
              </ol>

              <div className="onz-phone-body">
                {beat === 'wait' && (
                  <>
                    <p className="onz-raw">{active.label} in progress — you&rsquo;re in a wait moment</p>
                    <div className="onz-wait-dot" aria-hidden="true">
                      <i />
                    </div>
                    <p className="onz-accent-line">detect · activate · credit</p>
                    <p className="onz-quiet">Earning Phone Dollars… Thanks for waiting with One NZ</p>
                  </>
                )}

                {beat === 'earn' && (
                  <>
                    <p className="onz-transform">↓ becomes phone dollars</p>
                    <dl className="onz-kv">
                      <div>
                        <dt>wait</dt>
                        <dd>
                          {active.label} · {active.dwell}
                        </dd>
                      </div>
                      <div>
                        <dt>this wait</dt>
                        <dd>{nzd(earned)}</dd>
                      </div>
                      <div>
                        <dt>stamp</dt>
                        <dd className={stamped ? 'is-lit' : undefined}>
                          +{nzd(DEMO_EARN.stamp)} → One Wallet
                        </dd>
                      </div>
                      <div>
                        <dt>balance</dt>
                        <dd>{nzd(DEMO_EARN.balance)}</dd>
                      </div>
                    </dl>
                    <p className="onz-quiet">Currency the customer already values.</p>
                  </>
                )}

                {beat === 'evidence' && (
                  <>
                    <p className="onz-transform">↓ mana receipt</p>
                    <dl className="onz-kv onz-kv-lock">
                      <div>
                        <dt>moment</dt>
                        <dd>
                          {active.label} · 2 May 2025, 9:41pm
                        </dd>
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
                        <dd>Alex R. · loyalty operations</dd>
                      </div>
                    </dl>
                    <p className="onz-quiet">your wait, recorded properly. nothing invented.</p>
                  </>
                )}
              </div>
            </div>
            <div className="onz-plinth" aria-hidden="true" />
          </aside>
        </section>

        <section className="onz-triggers-band" aria-labelledby="onz-trig-title">
          <div>
            <p className="onz-kicker">01 · wait triggers</p>
            <h2 id="onz-trig-title">Pick a real wait</h2>
            <p>eSIM, plan change, IVR hold — the earn starts when the wait does.</p>
          </div>
          <div className="onz-triggers" role="tablist" aria-label="Wait triggers">
            {WAIT_TRIGGERS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={trigger === t.id}
                className={trigger === t.id ? 'is-on' : undefined}
                onClick={() => setTrigger(t.id)}
              >
                {t.label}
                <em>{t.dwell}</em>
              </button>
            ))}
          </div>
        </section>

        <section className="onz-split" aria-labelledby="onz-hh-title">
          <div>
            <p className="onz-kicker">02 · earn · optional share</p>
            <h2 id="onz-hh-title">Household rebalance</h2>
            <p>
              Share a slice of this wait&rsquo;s earn across the household plan — permissioned,
              visible, reversible.
            </p>
            <button
              type="button"
              className={`onz-toggle ${household ? 'is-on' : ''}`}
              aria-pressed={household}
              onClick={() => setHousehold((v) => !v)}
            >
              {household ? 'Sharing with household' : 'Keep earn on this line'}
            </button>
          </div>
          <div className="onz-household" data-active={household || undefined}>
            <div>
              <span>This line</span>
              <strong>
                {nzd(household ? DEMO_EARN.stamp - DEMO_EARN.householdShare : DEMO_EARN.stamp)}
              </strong>
            </div>
            <div className={household ? 'is-on' : undefined}>
              <span>Household share</span>
              <strong>{nzd(household ? DEMO_EARN.householdShare : 0)}</strong>
            </div>
          </div>
        </section>

        <section className="onz-receipt-band" aria-labelledby="onz-ev-title">
          <div>
            <p className="onz-kicker">03 · evidence</p>
            <h2 id="onz-ev-title">Mana Receipt</h2>
            <p>
              The wait, the earn, the permission posture, and the named person responsible — proof
              the customer can keep.
            </p>
            <ol className="onz-split-bar" aria-label="Evidence composition 55 / 30 / 15">
              {EVIDENCE_SPLIT.map((row) => (
                <li key={row.id} style={{ flex: row.pct }}>
                  <strong>{row.pct}%</strong>
                  <span>{row.label}</span>
                  <em>{row.note}</em>
                </li>
              ))}
            </ol>
          </div>
          <article className="onz-receipt" aria-label="Mana Receipt sample">
            <header>
              <span>one.nz</span>
              <strong>Mana Receipt</strong>
            </header>
            <dl>
              <div>
                <dt>Wait moment</dt>
                <dd>
                  {active.label} · 2 May 2025, 9:41pm
                </dd>
              </div>
              <div>
                <dt>Phone Dollars earned</dt>
                <dd>+{nzd(DEMO_EARN.stamp)}</dd>
              </div>
              <div>
                <dt>Destination</dt>
                <dd>One Wallet{household ? ' · household share applied' : ''}</dd>
              </div>
              <div>
                <dt>Permission</dt>
                <dd>Customer opted in · reversible</dd>
              </div>
              <div>
                <dt>Named human</dt>
                <dd>Alex R. · loyalty operations</dd>
              </div>
            </dl>
            <footer>
              <p>Thank you for being part of One NZ</p>
              <span>powered by agentic loyalty · assembl</span>
            </footer>
          </article>
        </section>

        <section className="onz-cta-band" id="onz-pilot" aria-labelledby="onz-cta-title">
          <h2 id="onz-cta-title">Ready to test it on one real wait?</h2>
          <p>
            Mode A puts the agentic layer beside Phone Dollars and One Wallet. One wait trigger,
            one earn rule, Mana Receipts from day one.
          </p>
          <div className="onz-ctas">
            <a
              className="onz-cta-primary"
              href="mailto:assembl@assembl.co.nz?subject=One%20NZ%20loyalty%20pilot"
            >
              show me the pilot
            </a>
            <Link className="onz-cta-secondary" href="/contact">
              book working session
            </Link>
          </div>
          <p className="onz-fine">{INDEPENDENT_CONCEPT_DISCLAIMER}</p>
        </section>
      </main>

      <footer className="onz-footer">
        <Link href="/">← assembl</Link>
        <span>preview · not production</span>
        <span>Made in Aotearoa</span>
      </footer>
    </div>
  );
}
