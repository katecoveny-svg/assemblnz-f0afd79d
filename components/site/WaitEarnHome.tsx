'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const PlumFieldCanvas = dynamic(
  () => import('./wait-earn-field/PlumField').then((m) => m.PlumFieldCanvas),
  { ssr: false },
);

type Mode = 'a' | 'b';

function useReducedMotion(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      mq.addEventListener('change', cb);
      return () => mq.removeEventListener('change', cb);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  );
}

function useWebgl(): boolean | null {
  return useSyncExternalStore(
    () => () => {},
    () => {
      try {
        const c = document.createElement('canvas');
        return !!(c.getContext('webgl2') || c.getContext('webgl'));
      } catch {
        return false;
      }
    },
    () => null,
  );
}

/**
 * Immersive homepage field — plum ground, masthead, Mode A|B, demo CTA.
 * Replaces the flat Lovable-style scroll marketing home for preview.
 */
export function WaitEarnHome() {
  const [mode, setMode] = useState<Mode>('a');
  const [mounted, setMounted] = useState(false);
  const reducedMotion = useReducedMotion();
  const webgl = useWebgl();

  useEffect(() => setMounted(true), []);

  return (
    <div className="we-home">
      <div className="we-field" aria-hidden>
        {mounted && webgl ? (
          <PlumFieldCanvas reducedMotion={reducedMotion} />
        ) : (
          <div className="we-field-fallback" />
        )}
        <div className="we-field-veil" />
      </div>

      <header className="we-header">
        <Link href="/" className="we-wordmark" aria-label="assembl home">
          assembl
        </Link>
        <p className="we-tag">MAHI THAT EARNS ITS PROOF.</p>
        <nav className="we-nav" aria-label="Primary">
          <a href="mailto:assembl@assembl.co.nz?subject=One%20useful%20customer%20wait">
            Discuss one wait <i>↗</i>
          </a>
        </nav>
      </header>

      <main className="we-stage">
        <p className="we-kicker">NZ-FIRST · AGENTIC WAIT STATES</p>
        <h1 className="we-masthead">the wait is the earn event</h1>
        <p className="we-lede">
          {mode === 'a'
            ? 'While a real process runs, the customer earns value for one useful action — loyalty that pays in the moment, not after the fact.'
            : 'Operator view: stage, permission, earn ledger and Mana Receipt assemble beside the wait. Proof locks last.'}
        </p>

        <div
          className="we-modes"
          role="tablist"
          aria-label="Experience mode"
        >
          <button
            type="button"
            role="tab"
            id="we-mode-a"
            aria-selected={mode === 'a'}
            aria-controls="we-mode-panel"
            className={mode === 'a' ? 'is-on' : undefined}
            onClick={() => setMode('a')}
          >
            Mode A
          </button>
          <button
            type="button"
            role="tab"
            id="we-mode-b"
            aria-selected={mode === 'b'}
            aria-controls="we-mode-panel"
            className={mode === 'b' ? 'is-on' : undefined}
            onClick={() => setMode('b')}
          >
            Mode B
          </button>
        </div>

        <div
          className="we-panel"
          id="we-mode-panel"
          role="tabpanel"
          aria-labelledby={mode === 'a' ? 'we-mode-a' : 'we-mode-b'}
        >
          {mode === 'a' ? (
            <ul className="we-beats">
              <li>
                <span>WAIT</span>
                <p>A plan change, claim, or order is already in motion.</p>
              </li>
              <li>
                <span>EARN</span>
                <p>One permissioned micro-action funds the moment.</p>
              </li>
              <li>
                <span>PROOF</span>
                <p>Phone Dollars settle. A Mana Receipt holds the record.</p>
              </li>
            </ul>
          ) : (
            <ul className="we-beats we-beats-ops">
              <li>
                <span>STAGE</span>
                <p>Wait · Earn · Phone Dollars · Mana Receipt</p>
              </li>
              <li>
                <span>PERMISSION</span>
                <p>Customer yes required before any earn or handoff.</p>
              </li>
              <li>
                <span>EVIDENCE</span>
                <p>Named reviewer · hashed receipt · draft until sealed.</p>
              </li>
            </ul>
          )}
        </div>

        <div className="we-cta-row">
          <Link href="/journeys/one-nz" className="we-cta">
            show me the demo
          </Link>
          <p className="we-cta-note">Primary demo · One NZ concept journey</p>
        </div>
      </main>

      <footer className="we-footer">
        <span>assembl · preview</span>
        <span>Wait states as monetised, rewarded moments</span>
      </footer>
    </div>
  );
}
