'use client';

/**
 * Real-device loyalty phone — Assembl homepage wait→earn narrative.
 * Paper/chalk canvas, plum bezel, heather accent. No One NZ packaging.
 * Scroll/beat-driven; not a FAQ chat.
 */

import type { CSSProperties } from 'react';
import { ASSEMBL_CANON } from '@/lib/loyalty/one-nz';

export type LoyaltyBeat = 'wait' | 'earn' | 'evidence';

const STEPS: { id: LoyaltyBeat; n: string; label: string }[] = [
  { id: 'wait', n: '01', label: 'wait' },
  { id: 'earn', n: '02', label: 'earn' },
  { id: 'evidence', n: '03', label: 'evidence' },
];

type Props = {
  beat: LoyaltyBeat;
  /** 0–1 scroll progress — drives earn counter. */
  progress?: number;
  reduced?: boolean;
};

function creditForProgress(p: number): string {
  const amount = Math.min(2.75, Math.max(0, p * 2.75 * 1.15));
  return amount.toLocaleString('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
  });
}

export function LoyaltyWaitPhone({ beat, progress = 0, reduced = false }: Props) {
  const earned = reduced || beat !== 'wait' ? '$2.75' : creditForProgress(progress);
  const stamped = beat === 'evidence' || (reduced && beat !== 'wait');

  return (
    <div
      className="lwp"
      data-beat={beat}
      style={
        {
          '--lwp-plum': ASSEMBL_CANON.plum,
          '--lwp-mulberry': ASSEMBL_CANON.mulberry,
          '--lwp-heather': ASSEMBL_CANON.heather,
          '--lwp-chalk': ASSEMBL_CANON.chalk,
          '--lwp-paper': ASSEMBL_CANON.paper,
        } as CSSProperties
      }
    >
      <div className="lwp-bezel" aria-hidden="true">
        <i className="lwp-island" />
        <span className="lwp-status">
          <em>9:41</em>
          <b />
        </span>
      </div>

      <div className="lwp-screen">
        <header className="lwp-appbar">
          <strong>assembl</strong>
          <span>loyalty wait</span>
        </header>

        <ol className="lwp-stepper" aria-label="Wait to evidence">
          {STEPS.map((s) => (
            <li key={s.id} data-on={beat === s.id || undefined}>
              <span className="lwp-step-n">{s.n}</span>
              <span className="lwp-step-label">{s.label}</span>
            </li>
          ))}
        </ol>

        <div className="lwp-body" key={beat}>
          {beat === 'wait' && (
            <>
              <p className="lwp-kicker">real wait detected</p>
              <h3>Hold / activation in progress</h3>
              <div className="lwp-pulse" aria-hidden="true">
                <i />
              </div>
              <p className="lwp-spine">detect · activate · credit</p>
              <p className="lwp-note">The wait is the earn event — credit starts now.</p>
            </>
          )}

          {beat === 'earn' && (
            <>
              <p className="lwp-kicker">credit landing</p>
              <h3>Earned while you wait</h3>
              <dl className="lwp-kv">
                <div>
                  <dt>this wait</dt>
                  <dd>{earned}</dd>
                </div>
                <div>
                  <dt>stamp</dt>
                  <dd className={stamped ? 'is-lit' : undefined}>+$0.45 → wallet</dd>
                </div>
                <div>
                  <dt>spine</dt>
                  <dd>wait → earn → evidence</dd>
                </div>
              </dl>
              <p className="lwp-note">Permissioned. Reversible. Named human reviews.</p>
            </>
          )}

          {beat === 'evidence' && (
            <>
              <p className="lwp-kicker">mana receipt</p>
              <h3>Proof you can keep</h3>
              <article className="lwp-receipt" aria-label="Mana Receipt">
                <header>
                  <span>assembl</span>
                  <strong>Mana Receipt</strong>
                </header>
                <dl>
                  <div>
                    <dt>moment</dt>
                    <dd>1 Sep 2026, 8:14pm</dd>
                  </div>
                  <div>
                    <dt>earned</dt>
                    <dd>+$0.45 credit</dd>
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
              </article>
              <p className="lwp-note">your wait, recorded properly.</p>
            </>
          )}
        </div>

        <div className="lwp-homebar" aria-hidden="true" />
      </div>
    </div>
  );
}
