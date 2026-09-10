'use client';

/**
 * One NZ Phase 0 Wait→Earn journey — cinematic scroll demo.
 * Plum stage + #007C92 client accent only on this route.
 * Never life-admin labels. Never affiliation claims.
 */

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { showPreviewDeployLabel } from '@/lib/deploy-env';
import {
  ASSEMBL_CANON,
  DEMO_EARN,
  DEMO_RECEIPT_AT,
  DIGITAL_TURQUOISE,
  EVIDENCE_SPLIT,
  INDEPENDENT_CONCEPT_DISCLAIMER,
  MASTHEAD,
  MODE_A,
  nzd,
  PHASE_0,
  TWELVE_WORD_ENERGY,
  WAIT_TRIGGERS,
} from '@/lib/loyalty/one-nz';
import { OneNzPhone, type OnzBeat, type OnzTriggerId } from './OneNzPhone';
import './one-nz-journey.css';

const OneNzAtmosphere = dynamic(
  () => import('./OneNzAtmosphere').then((m) => m.OneNzAtmosphere),
  { ssr: false },
);

const THEME = {
  '--onz-plum': ASSEMBL_CANON.plum,
  '--onz-plum-deep': ASSEMBL_CANON.plumDeep,
  '--onz-mulberry': ASSEMBL_CANON.mulberry,
  '--onz-heather': ASSEMBL_CANON.heather,
  '--onz-chalk': ASSEMBL_CANON.chalk,
  '--onz-paper': ASSEMBL_CANON.paper,
  '--onz-accent': DIGITAL_TURQUOISE,
  '--onz-accent-depth': '#00B0CA',
} as CSSProperties;

export function OneNzJourney() {
  const [trigger, setTrigger] = useState<OnzTriggerId>('esim');
  const [beat, setBeat] = useState<OnzBeat>('wait');
  const [earned, setEarned] = useState(0);
  const [stamped, setStamped] = useState(false);
  const [household, setHousehold] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [scrollDriven, setScrollDriven] = useState(false);

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
    if (scrollDriven) return;

    setBeat('wait');
    setEarned(0);
    setStamped(false);
    let current = 0;
    const target = DEMO_EARN.thisWait;
    const step = target / 16;
    let cancelled = false;
    let evidenceTimer: number | undefined;

    const earnTimer = window.setTimeout(() => {
      if (!cancelled) setBeat('earn');
    }, 1600);
    const id = window.setInterval(() => {
      if (cancelled) return;
      current = Math.min(target, current + step);
      setEarned(Number(current.toFixed(2)));
      if (current >= target) {
        window.clearInterval(id);
        evidenceTimer = window.setTimeout(() => {
          if (cancelled) return;
          setStamped(true);
          setBeat('evidence');
        }, 600);
      }
    }, 140);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.clearTimeout(earnTimer);
      if (evidenceTimer !== undefined) window.clearTimeout(evidenceTimer);
    };
  }, [trigger, reduced, scrollDriven]);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-onz-beat]'));
    if (!nodes.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting && e.intersectionRatio > 0.4)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const next = visible.target.getAttribute('data-onz-beat') as OnzBeat | null;
        if (!next) return;
        setScrollDriven(true);
        setBeat(next);
        if (next === 'wait') {
          setEarned(0);
          setStamped(false);
        } else {
          setEarned(DEMO_EARN.thisWait);
          setStamped(next === 'evidence');
        }
      },
      { threshold: [0.4, 0.55, 0.7], rootMargin: '-12% 0px -22% 0px' },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const onBeatRequest = useCallback((next: OnzBeat) => {
    setScrollDriven(true);
    setBeat(next);
    if (next !== 'wait') {
      setEarned(DEMO_EARN.thisWait);
      setStamped(next === 'evidence');
    }
  }, []);

  const active = WAIT_TRIGGERS.find((t) => t.id === trigger)!;

  return (
    <div className="onz" style={THEME}>
      <div className="onz-atmosphere" aria-hidden="true">
        <OneNzAtmosphere className="onz-field" />
        <div className="onz-haze onz-haze-a" />
        <div className="onz-haze onz-haze-b" />
        <div className="onz-haze onz-haze-c" />
      </div>

      <a className="onz-skip" href="#onz-live">
        Skip to journey
      </a>

      <header className="onz-header">
        <Link href="/" className="onz-wordmark">
          assembl<span>·</span>
        </Link>
        <p className="onz-header-tag">Phase 0 · Wait→Earn</p>
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
        <div className="onz-rail">
          <div className="onz-rail-copy">
            <section
              className="onz-hero"
              data-onz-beat="wait"
              aria-labelledby="onz-title"
            >
              <p className="onz-kicker">one nz · independent concept</p>
              <p className="onz-brand">
                assembl<span>·</span>
              </p>
              <h1 id="onz-title">{MASTHEAD}</h1>
              <p className="onz-lede">{TWELVE_WORD_ENERGY}</p>
              <ul className="onz-chips">
                <li>detect · activate · credit</li>
                <li>phone dollars · one wallet</li>
                <li>evidence receipts</li>
              </ul>
            </section>

            <section
              className="onz-chapter"
              data-onz-beat="wait"
              aria-labelledby="onz-trig-title"
            >
              <p className="onz-kicker">01 · wait triggers</p>
              <h2 id="onz-trig-title">Pick a real wait</h2>
              <p>
                Phase 0 highlights eSIM or plan change as the primary earn moment. IVR hold stays
                available as a demo beat.
              </p>
              <div className="onz-triggers" role="tablist" aria-label="Wait triggers">
                {WAIT_TRIGGERS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={trigger === t.id}
                    className={trigger === t.id ? 'is-on' : undefined}
                    data-primary={t.primary || undefined}
                    onClick={() => {
                      setScrollDriven(false);
                      setBeat('wait');
                      setTrigger(t.id);
                    }}
                  >
                    <span>
                      {t.label}
                      {t.primary ? <i>primary</i> : null}
                    </span>
                    <em>{t.dwell}</em>
                  </button>
                ))}
              </div>
            </section>

            <section
              className="onz-chapter"
              data-onz-beat="earn"
              aria-labelledby="onz-hh-title"
            >
              <p className="onz-kicker">02 · earn · optional share</p>
              <h2 id="onz-hh-title">Phone Dollars, then REBALANCE</h2>
              <p>
                Earn stamps into One Wallet while the wait is still happening. Optional household
                REBALANCE shares a slice. Opt-in, visible, reversible.
              </p>
              <button
                type="button"
                className={`onz-toggle ${household ? 'is-on' : ''}`}
                aria-pressed={household}
                onClick={() => setHousehold((v) => !v)}
              >
                {household ? 'Sharing with household' : 'Keep earn on this line'}
              </button>
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

            <section
              className="onz-chapter"
              data-onz-beat="evidence"
              aria-labelledby="onz-ev-title"
            >
              <p className="onz-kicker">03 · evidence</p>
              <h2 id="onz-ev-title">Evidence receipt</h2>
              <p>
                Records the wait, the earn, the opt-in (reversible), and the named person
                responsible. Proof the customer can keep.
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
              <article className="onz-receipt" aria-label="Evidence receipt sample">
                <header>
                  <span>one.nz</span>
                  <strong>Evidence receipt</strong>
                </header>
                <dl>
                  <div>
                    <dt>Wait moment</dt>
                    <dd>
                      {active.label} · {DEMO_RECEIPT_AT}
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
                  <span>
                    powered by agentic loyalty · <b className="onz-wordmark-keep">assembl</b>
                  </span>
                </footer>
              </article>
            </section>
          </div>

          <aside className="onz-rail-phone" id="onz-live" aria-label="One NZ loyalty phone">
            <div className="onz-rail-phone-sticky">
              <OneNzPhone
                beat={beat}
                trigger={trigger}
                household={household}
                earned={earned}
                stamped={stamped}
                reduced={reduced}
                onBeatRequest={onBeatRequest}
                onHouseholdToggle={() => setHousehold((v) => !v)}
              />
              <div className="onz-plinth" aria-hidden="true" />
            </div>
          </aside>
        </div>

        <section className="onz-ownership" aria-labelledby="onz-own-title">
          <p className="onz-kicker">{MODE_A.label} · who owns what</p>
          <h2 id="onz-own-title">
            assembl runs the wait→earn layer. One NZ keeps Phone Dollars, One Wallet, and the
            programme.
          </h2>
          <div className="onz-own-grid">
            <article>
              <h3>{MODE_A.oneNz.title}</h3>
              <ul>
                {MODE_A.oneNz.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
            <article>
              <h3>{MODE_A.assembl.title}</h3>
              <ul>
                {MODE_A.assembl.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        <section className="onz-cta-band" id="onz-pilot" aria-labelledby="onz-cta-title">
          <p className="onz-kicker">{PHASE_0.title}</p>
          <h2 id="onz-cta-title">Ready to test it on one real wait?</h2>
          <p>{PHASE_0.lede}</p>
          <dl className="onz-pilot-facts">
            {PHASE_0.facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="onz-ctas">
            <a
              className="onz-cta-primary"
              href="mailto:assembl@assembl.co.nz?subject=One%20NZ%20loyalty%20pilot"
            >
              show me the pilot
            </a>
            <Link className="onz-cta-secondary" href="/contact">
              ask assembl
            </Link>
          </div>
          <p className="onz-fine">{INDEPENDENT_CONCEPT_DISCLAIMER}</p>
        </section>
      </main>

      <footer className="onz-footer">
        <Link href="/" className="onz-wordmark-keep">
          ← assembl
        </Link>
        {showPreviewDeployLabel() ? <span>preview · not production</span> : null}
        <span>Independent concept · /journeys/one-nz</span>
      </footer>
    </div>
  );
}
