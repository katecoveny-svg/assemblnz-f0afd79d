'use client';

/**
 * The trip journey demo — the "aha" surface.
 *
 * Kate (demo persona) walks six wait states, booking → baggage. Each stage:
 *  1. shows the wait-state trigger,
 *  2. runs a loader (koru / plane / progress / oscar),
 *  3. reveals the sponsored earn moment (A$ credited),
 *  4. adds to a running Airpoints Dollars tally.
 * At the end, a Mana Receipt itemises every sponsor.
 *
 * CONCEPT / DEMO ONLY — no real Airpoints minted; the tally is a demo figure.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from '@/app/customers/air-nz/dash/airnz.module.css';
import { JOURNEY_STAGES, DEMO_PERSONA, apd } from '@/lib/customers/air-nz/data';
import { EarnPill } from './chrome';
import { Loader } from './Loader';

type Phase = 'intro' | 'waiting' | 'earned' | 'receipt';

export function JourneyDemo() {
  const [i, setI] = useState(0); // current stage index
  const [phase, setPhase] = useState<Phase>('intro');
  const [earned, setEarned] = useState<number[]>([]); // per-stage earn, accumulates
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const stage = JOURNEY_STAGES[i];
  const tally = earned.reduce((s, x) => s + x, 0);
  const done = earned.length;

  const startWait = useCallback(() => {
    setPhase('waiting');
    // Short, demo-friendly loader beat (not the real dwell seconds).
    timer.current = setTimeout(() => {
      setEarned((e) => {
        // guard against double-fire
        if (e.length > i) return e;
        return [...e, JOURNEY_STAGES[i].earn];
      });
      setPhase('earned');
    }, 1600);
  }, [i]);

  const next = useCallback(() => {
    if (i < JOURNEY_STAGES.length - 1) {
      setI(i + 1);
      setPhase('intro');
    } else {
      setPhase('receipt');
    }
  }, [i]);

  const restart = useCallback(() => {
    setI(0);
    setEarned([]);
    setPhase('intro');
  }, []);

  if (phase === 'receipt') {
    return <Receipt />;
  }

  return (
    <>
      {/* Running tally + progress */}
      <div className={styles.tally}>
        <div>
          <div className={styles.statLabel}>Earned in the wait</div>
          <div className={styles.tallyNum}>{apd(tally)}</div>
        </div>
        <div className={styles.progressDots}>
          {JOURNEY_STAGES.map((s, idx) => (
            <span
              key={s.key}
              className={`${styles.dot} ${idx < done ? styles.on : ''}`}
            />
          ))}
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.statLabel} style={{ paddingTop: 4 }}>
          Stage {i + 1} of {JOURNEY_STAGES.length} · {stage.screen}
        </div>
        <h2 className={styles.screenTitle} style={{ padding: '8px 0 4px' }}>
          {stage.headline}
        </h2>

        {phase === 'intro' && (
          <>
            <div className={`${styles.card} ${styles.nested}`}>
              <div className={styles.statLabel}>The wait</div>
              <p className={styles.earnLine} style={{ marginTop: 6 }}>
                {stage.trigger}
              </p>
              <div className={styles.tagRow}>
                <span className={styles.tag}>Dwell ≈ {stage.waitSeconds}s+</span>
                <span className={styles.tag}>CPM NZ${stage.cpm}</span>
                <span className={styles.tag}>{stage.sponsorCategory}</span>
              </div>
            </div>
            <button className={`${styles.btn} ${styles.btnTeal}`} onClick={startWait}>
              Enter the wait →
            </button>
          </>
        )}

        {phase === 'waiting' && (
          <div className={styles.card} style={{ paddingTop: 26, paddingBottom: 26 }}>
            <Loader kind={stage.loader} />
            <p
              className={styles.earnLine}
              style={{ textAlign: 'center', marginTop: 18 }}
            >
              {stage.earnCopy}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}>
              <EarnPill />
            </div>
          </div>
        )}

        {phase === 'earned' && (
          <>
            <div className={styles.earnPanel}>
              <div className={styles.earnPanelTop}>
                <div>
                  <div className={styles.statLabel}>You earned</div>
                  <div className={styles.earnAmount}>+{apd(stage.earn)}</div>
                </div>
                <EarnPill />
              </div>
              <p className={styles.earnLine}>
                Credited to your Airpoints™ wallet in the moment.
              </p>
              <p className={styles.earnSponsor}>
                Sponsored by {stage.sponsor} · {stage.sponsorCategory} · the
                advertiser paid the treasury, the treasury paid you.
              </p>
              <div className={styles.poweredBy}>
                Powered by <span className={styles.a}>assembl</span> × Koru
              </div>
            </div>
            <button className={`${styles.btn} ${styles.btnTeal}`} onClick={next}>
              {i < JOURNEY_STAGES.length - 1
                ? 'Next wait state →'
                : 'See your Mana Receipt →'}
            </button>
            {i === 0 && (
              <button className={styles.linkTeal} style={{ marginTop: 14 }} onClick={restart}>
                Restart the journey
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}

function Receipt() {
  const total = JOURNEY_STAGES.reduce((s, x) => s + x.earn, 0);
  return (
    <div className={styles.body}>
      <div className={styles.statLabel} style={{ paddingTop: 8 }}>
        Post-flight · Mana Receipt
      </div>
      <h2 className={styles.screenTitle} style={{ padding: '8px 0 12px' }}>
        Earned in the wait
      </h2>

      <div className={styles.receipt}>
        <div className={styles.receiptHead}>
          <div className={styles.statLabel} style={{ color: '#9fd9dc' }}>
            {DEMO_PERSONA.name} · {DEMO_PERSONA.tier}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, marginTop: 4 }}>
            {DEMO_PERSONA.route} · {DEMO_PERSONA.flight}
          </div>
        </div>
        {JOURNEY_STAGES.map((s) => (
          <div key={s.key} className={styles.receiptRow}>
            <span>
              {s.label} · <span style={{ color: '#6b6e71' }}>{s.sponsor}</span>
            </span>
            <span style={{ color: '#00b0b9', fontWeight: 600 }}>+{apd(s.earn)}</span>
          </div>
        ))}
        <div className={styles.receiptTotal}>
          <span>Total earned today</span>
          <span>{apd(total)}</span>
        </div>
        <div className={styles.receiptFoot}>
          <span>
            Six sponsors funded this journey.
            <br />
            Nobody sold your attention twice.
          </span>
          <span className={styles.assembl}>assembl</span>
        </div>
      </div>

      <p className={styles.cardMeta} style={{ marginTop: 16, lineHeight: 1.6 }}>
        A returning passenger sees this in their annual statement as “Earned in
        the wait — {apd(total)}.” Not a rebate. Real currency, in the wallet, in
        the moment.
      </p>

      <div style={{ marginTop: 16 }}>
        <Link
          href="/customers/air-nz/dash/economics"
          className={`${styles.btn} ${styles.btnGhost}`}
        >
          See the economics behind it →
        </Link>
      </div>
    </div>
  );
}
