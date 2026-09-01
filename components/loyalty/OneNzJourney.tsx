'use client';

/**
 * One NZ agentic loyalty journey — wait → earn → evidence.
 * Client accent locked to #007C92. Independent concept disclaimer mandatory.
 */

import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import {
  ASSEMBL_CANON,
  DEMO_EARN,
  DIGITAL_TURQUOISE,
  INDEPENDENT_CONCEPT_DISCLAIMER,
  MASTHEAD,
  nzd,
  TWELVE_WORD_ENERGY,
  WAIT_TRIGGERS,
} from '@/lib/loyalty/one-nz';
import './one-nz-journey.css';

type TriggerId = (typeof WAIT_TRIGGERS)[number]['id'];

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
      return;
    }

    setEarned(0);
    setStamped(false);
    let current = 0;
    const target = DEMO_EARN.thisWait;
    const step = target / 18;
    const id = window.setInterval(() => {
      current = Math.min(target, current + step);
      setEarned(Number(current.toFixed(2)));
      if (current >= target) {
        window.clearInterval(id);
        window.setTimeout(() => setStamped(true), 400);
      }
    }, 160);
    return () => window.clearInterval(id);
  }, [trigger, reduced]);

  const active = WAIT_TRIGGERS.find((t) => t.id === trigger)!;
  const balance = DEMO_EARN.balance;
  const receiptEarn = stamped ? DEMO_EARN.stamp : earned > 0 ? Math.min(DEMO_EARN.stamp, earned) : 0;

  return (
    <div className="onz" style={THEME}>
      <a className="onz-skip" href="#onz-wait">
        Skip to journey
      </a>

      <header className="onz-header">
        <Link href="/" className="onz-wordmark">
          assembl
        </Link>
        <p>agentic loyalty · one nz</p>
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

      <main>
        <section className="onz-hero" aria-labelledby="onz-title">
          <p className="onz-kicker">/journeys/one-nz</p>
          <h1 id="onz-title">{MASTHEAD}</h1>
          <p className="onz-lede">{TWELVE_WORD_ENERGY}</p>
          <ul className="onz-chips" aria-label="Concept markers">
            <li>mode a · agentic layer</li>
            <li>phone dollars · one wallet</li>
            <li>mana receipts</li>
            <li>independent concept</li>
          </ul>
        </section>

        {/* ── 1. WAIT ─────────────────────────────────────────────── */}
        <section className="onz-beat" id="onz-wait" aria-labelledby="onz-wait-title">
          <div className="onz-beat-copy">
            <span className="onz-num">01</span>
            <h2 id="onz-wait-title">Wait</h2>
            <p>
              A real process is running — eSIM activation, a plan change, an IVR hold. The customer
              is already waiting. That moment becomes the earn event.
            </p>
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
          </div>

          <div className="onz-phone" aria-live="polite">
            <div className="onz-phone-top">
              <span>one.nz</span>
              <span className="onz-pill">Good evening</span>
            </div>
            <div className="onz-phone-body">
              <h3>You&rsquo;re in a wait moment</h3>
              <p>
                {active.label} in progress. We&rsquo;ll let you know when it&rsquo;s your turn.
              </p>
              <div className="onz-wait-dot" aria-hidden="true">
                <i />
              </div>
              <p className="onz-status">Earning Phone Dollars… Thanks for waiting with One NZ</p>
              <article className="onz-mini-card">
                <span>This wait</span>
                <strong>{nzd(earned)}</strong>
              </article>
            </div>
          </div>
        </section>

        {/* ── 2. EARN ─────────────────────────────────────────────── */}
        <section className="onz-beat onz-beat-invert" id="onz-earn" aria-labelledby="onz-earn-title">
          <div className="onz-beat-copy">
            <span className="onz-num">02</span>
            <h2 id="onz-earn-title">Earn</h2>
            <p>
              Phone Dollars accrue in real time and stamp into One Wallet — currency the customer
              already understands. No new points scheme to learn.
            </p>
          </div>

          <div className="onz-earn-stage">
            <div className={`onz-stamp ${stamped ? 'is-in' : ''}`} aria-hidden={!stamped}>
              <span>+{nzd(DEMO_EARN.stamp)}</span>
              <em>Phone Dollars</em>
            </div>
            <div className="onz-wallet">
              <span>One Wallet</span>
              <strong>{nzd(balance)}</strong>
              <p>Phone Dollars available</p>
              <button type="button" className="onz-wallet-btn">
                View wallet
              </button>
            </div>
            <p className="onz-earn-note">
              {stamped
                ? `${nzd(DEMO_EARN.stamp)} stamped from this ${active.label.toLowerCase()}.`
                : 'Credit assembling while the wait runs…'}
            </p>
          </div>
        </section>

        {/* ── 3. HOUSEHOLD (optional) ─────────────────────────────── */}
        <section className="onz-beat" id="onz-household" aria-labelledby="onz-hh-title">
          <div className="onz-beat-copy">
            <span className="onz-num">03</span>
            <h2 id="onz-hh-title">Household rebalance</h2>
            <p>
              Optional. Share a slice of this wait&rsquo;s earn across the household plan — still
              permissioned, still visible, still reversible.
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

        {/* ── 4. EVIDENCE ─────────────────────────────────────────── */}
        <section className="onz-beat onz-beat-evidence" id="onz-evidence" aria-labelledby="onz-ev-title">
          <div className="onz-beat-copy">
            <span className="onz-num">04</span>
            <h2 id="onz-ev-title">Evidence</h2>
            <p>
              A Mana Receipt shows what happened: the wait, the earn, the permission posture, and
              the named person responsible. Proof the customer can keep.
            </p>
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
                <dd>+{nzd(receiptEarn || DEMO_EARN.stamp)}</dd>
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

        {/* ── CTAs ────────────────────────────────────────────────── */}
        <section className="onz-cta-band" id="onz-pilot" aria-labelledby="onz-cta-title">
          <h2 id="onz-cta-title">Ready to test it on one real wait?</h2>
          <p>
            Mode A puts the agentic layer beside Phone Dollars and One Wallet. We start with one
            wait trigger, one earn rule, and Mana Receipts from day one.
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
        <span>Aotearoa New Zealand</span>
      </footer>
    </div>
  );
}
