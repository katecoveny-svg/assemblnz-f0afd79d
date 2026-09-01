'use client';

/**
 * Immersive loyalty homepage — plum field, Mode A positioning,
 * One NZ first-fit tease. Primary CTA → /journeys/one-nz.
 */

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

type MotionBeat = 'wait' | 'earn' | 'evidence';

const CHIPS = [
  'mode · agentic loyalty',
  'first fit · one nz',
  'independent concept',
] as const;

const THEME = {
  '--eeh-plum': ASSEMBL_CANON.plum,
  '--eeh-mulberry': ASSEMBL_CANON.mulberry,
  '--eeh-heather': ASSEMBL_CANON.heather,
  '--eeh-chalk': ASSEMBL_CANON.chalk,
  '--eeh-paper': ASSEMBL_CANON.paper,
  '--eeh-accent': DIGITAL_TURQUOISE,
} as CSSProperties;

export function EarnEventHome() {
  const [beat, setBeat] = useState<MotionBeat>('wait');
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
    const order: MotionBeat[] = ['wait', 'earn', 'evidence'];
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % order.length;
      setBeat(order[i]!);
    }, 2800);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <div className="eeh" style={THEME}>
      <header className="eeh-header">
        <Link href="/" className="eeh-wordmark" aria-label="assembl home">
          assembl
        </Link>
        <p className="eeh-tag">agentic loyalty design</p>
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
            <p className="eeh-kicker">assembl.co.nz</p>
            <h1 id="eeh-masthead">{MASTHEAD}</h1>
            <p className="eeh-lede">
              Agentic loyalty that turns everyday waits into Phone Dollars. Real value. Real time.
            </p>
            <p className="eeh-energy">{TWELVE_WORD_ENERGY}</p>

            <ul className="eeh-chips" aria-label="Positioning">
              {CHIPS.map((chip) => (
                <li key={chip}>{chip}</li>
              ))}
            </ul>

            <div className="eeh-ctas">
              <Link className="eeh-cta-primary" href="/journeys/one-nz">
                show me the demo
              </Link>
              <Link className="eeh-cta-secondary" href="/contact">
                book a working session
              </Link>
            </div>
          </div>

          <aside className="eeh-stage" aria-label="One NZ wait-to-earn tease">
            <div className="eeh-phone" data-beat={beat}>
              <div className="eeh-phone-top">
                <span className="eeh-one-mark">one.nz</span>
                <span className="eeh-greeting">Good evening</span>
              </div>

              <div className="eeh-phone-body">
                <h2>You&rsquo;re in a wait moment</h2>
                <p>We&rsquo;ll let you know when it&rsquo;s your turn.</p>

                <div className="eeh-wait-dot" aria-hidden="true">
                  <i />
                </div>

                <p className="eeh-earn-line">
                  {beat === 'wait' && 'Earning Phone Dollars… Thanks for waiting with One NZ'}
                  {beat === 'earn' && `+${nzd(DEMO_EARN.stamp)} stamped into One Wallet`}
                  {beat === 'evidence' && 'Mana Receipt ready · named human in control'}
                </p>

                <div className="eeh-cards">
                  <article className={`eeh-card ${beat !== 'wait' ? 'is-lit' : ''}`}>
                    <span>Phone Dollars</span>
                    <strong>{nzd(DEMO_EARN.thisWait)} earned in this wait</strong>
                  </article>
                  <article className={`eeh-card ${beat === 'evidence' ? 'is-lit' : ''}`}>
                    <span>Balance</span>
                    <strong>{nzd(DEMO_EARN.balance)} Phone Dollars</strong>
                    <em>View wallet</em>
                  </article>
                </div>
              </div>

              <nav className="eeh-tabbar" aria-hidden="true">
                <span className="is-on">For you</span>
                <span>Billing</span>
                <span>Wallet</span>
                <span>Support</span>
                <span>More</span>
              </nav>
            </div>

            <ol className="eeh-motion" aria-label="Motion story">
              <li data-on={beat === 'wait' || undefined}>
                <span>01 · wait</span>
                <p>Detect the wait. Start the earn.</p>
              </li>
              <li data-on={beat === 'earn' || undefined}>
                <span>02 · earn</span>
                <p>Phone Dollars stamp into One Wallet.</p>
              </li>
              <li data-on={beat === 'evidence' || undefined}>
                <span>03 · evidence</span>
                <p>Mana Receipt locks the record.</p>
              </li>
            </ol>
          </aside>
        </section>

        <section className="eeh-modes" aria-labelledby="eeh-modes-title">
          <div className="eeh-modes-head">
            <p className="eeh-kicker">two ways to run it</p>
            <h2 id="eeh-modes-title">Mode A · Mode B</h2>
          </div>
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
                customer still earns currency they already value — nothing new to explain.
              </p>
            </article>
          </div>
        </section>

        <section className="eeh-close" aria-labelledby="eeh-close-title">
          <h2 id="eeh-close-title">First fit · One NZ</h2>
          <p>
            A concrete wait. A currency people already understand. Evidence they can keep. That is
            the agentic loyalty brief — start with the demo, then book a working session.
          </p>
          <div className="eeh-ctas">
            <Link className="eeh-cta-primary" href="/journeys/one-nz">
              show me the demo
            </Link>
            <a
              className="eeh-cta-secondary"
              href="mailto:assembl@assembl.co.nz?subject=One%20NZ%20loyalty%20pilot"
            >
              talk to Kate
            </a>
          </div>
          <p className="eeh-fine">
            Independent concept by assembl · preview only · not a current One NZ offer
          </p>
        </section>
      </main>

      <footer className="eeh-footer">
        <span>assembl</span>
        <span>experience design · loyalty strategy · product design</span>
        <span>Aotearoa New Zealand</span>
      </footer>
    </div>
  );
}
