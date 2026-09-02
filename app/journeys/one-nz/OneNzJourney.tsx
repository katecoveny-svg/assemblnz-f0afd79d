'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  DEMO_PERSONA,
  ONE_NZ_DISCLAIMER,
  ONE_NZ_STAGES,
  pd,
  type OneNzPhase,
} from '@/lib/journeys/one-nz';
import styles from './one-nz.module.css';

type Phase = 'intro' | OneNzPhase;

/**
 * One NZ concept journey — Wait → Earn → Phone Dollars → Mana Receipt.
 * Accent locked to `#00A45F`. Independent concept; not an official One NZ product.
 */
export function OneNzJourney() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [stageIndex, setStageIndex] = useState(0);
  const [earned, setEarned] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const stage = ONE_NZ_STAGES[stageIndex];

  const enterStage = useCallback((index: number) => {
    setStageIndex(index);
    setPhase(ONE_NZ_STAGES[index].key);
    setWaiting(false);
  }, []);

  const startJourney = useCallback(() => {
    setEarned(0);
    enterStage(0);
  }, [enterStage]);

  const advanceFromWait = useCallback(() => {
    setWaiting(true);
    timer.current = setTimeout(() => {
      setWaiting(false);
      enterStage(1);
    }, 1800);
  }, [enterStage]);

  const completeEarn = useCallback(
    (withCredit: boolean) => {
      setEarned(withCredit ? (ONE_NZ_STAGES[1].earn ?? 0) : 0);
      enterStage(2);
    },
    [enterStage],
  );

  const openReceipt = useCallback(() => {
    enterStage(3);
  }, [enterStage]);

  const restart = useCallback(() => {
    setPhase('intro');
    setStageIndex(0);
    setEarned(0);
    setWaiting(false);
  }, []);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link href="/" className={styles.wordmark}>
          assembl
        </Link>
        <p className={styles.headerMeta}>ONE NZ · CONCEPT JOURNEY</p>
        <Link href="/" className={styles.back}>
          ← Field
        </Link>
      </header>

      <aside className={styles.disclaimer} role="note">
        <span>INDEPENDENT CONCEPT</span>
        <p>{ONE_NZ_DISCLAIMER}</p>
      </aside>

      <div className={styles.shell}>
        <nav className={styles.arc} aria-label="Journey arc">
          {ONE_NZ_STAGES.map((s, i) => {
            const active = phase !== 'intro' && stageIndex === i;
            const done = phase !== 'intro' && stageIndex > i;
            return (
              <div
                key={s.key}
                className={`${styles.arcStep} ${active ? styles.arcOn : ''} ${done ? styles.arcDone : ''}`}
                aria-current={active ? 'step' : undefined}
              >
                <i aria-hidden />
                <span>{s.label}</span>
              </div>
            );
          })}
        </nav>

        {phase === 'intro' && (
          <section className={styles.hero}>
            <p className={styles.eyebrow}>WAIT → EARN → PHONE DOLLARS → MANA RECEIPT</p>
            <h1 className={styles.title}>
              The wait becomes
              <br />
              Phone Dollars.
            </h1>
            <p className={styles.lede}>
              A One NZ plan-change wait — turned into a permissioned earn moment.
              Loyalty that settles while the process runs, then locks as a Mana Receipt.
            </p>
            <button type="button" className={styles.cta} onClick={startJourney}>
              Enter the wait
            </button>
            <p className={styles.persona}>
              Demo persona · {DEMO_PERSONA.name} · {DEMO_PERSONA.plan}
            </p>
          </section>
        )}

        {phase === 'wait' && (
          <section className={styles.card} aria-live="polite">
            <p className={styles.eyebrow}>{stage.eyebrow}</p>
            <h2 className={styles.stageTitle}>{stage.headline}</h2>
            <p className={styles.body}>{stage.body}</p>
            <p className={styles.evidence}>{stage.evidence}</p>
            {waiting ? (
              <div className={styles.waitPulse} role="status">
                <span className={styles.pulseDot} />
                <p>Confirming your plan change…</p>
              </div>
            ) : (
              <button type="button" className={styles.cta} onClick={advanceFromWait}>
                Hold the wait
              </button>
            )}
          </section>
        )}

        {phase === 'earn' && (
          <section className={styles.card} aria-live="polite">
            <p className={styles.eyebrow}>{stage.eyebrow}</p>
            <h2 className={styles.stageTitle}>{stage.headline}</h2>
            <p className={styles.body}>{stage.body}</p>
            <div className={styles.choice}>
              <p className={styles.choiceLabel}>Optional · earns {pd(stage.earn ?? 0)}</p>
              <button type="button" className={styles.cta} onClick={() => completeEarn(true)}>
                Confirm household lines still in use
              </button>
              <button type="button" className={styles.ghost} onClick={() => completeEarn(false)}>
                Skip for now — continue without earn
              </button>
            </div>
            <p className={styles.evidence}>{stage.evidence}</p>
          </section>
        )}

        {phase === 'phone-dollars' && (
          <section className={styles.card} aria-live="polite">
            <p className={styles.eyebrow}>{stage.eyebrow}</p>
            <h2 className={styles.stageTitle}>{stage.headline}</h2>
            <p className={styles.body}>{stage.body}</p>
            <div className={styles.wallet}>
              <span>PHONE DOLLARS</span>
              <strong>{pd(earned)}</strong>
              <small>Settled to wallet · demo figure</small>
            </div>
            <p className={styles.evidence}>{stage.evidence}</p>
            <button type="button" className={styles.cta} onClick={openReceipt}>
              Open Mana Receipt
            </button>
          </section>
        )}

        {phase === 'mana-receipt' && (
          <section className={styles.card} aria-live="polite">
            <p className={styles.eyebrow}>{stage.eyebrow}</p>
            <h2 className={styles.stageTitle}>{stage.headline}</h2>
            <p className={styles.body}>{stage.body}</p>

            <article className={styles.receipt} aria-label="Mana Receipt">
              <header>
                <span>MANA RECEIPT · ONZ-DEMO-001</span>
                <p>
                  {DEMO_PERSONA.name} · {DEMO_PERSONA.route}
                </p>
              </header>
              <ul>
                <li>
                  <span>Wait</span>
                  <span>Plan change processing</span>
                </li>
                <li>
                  <span>Earn action</span>
                  <span>
                    {earned > 0 ? 'Household lines confirmed' : 'Skipped · no earn'}
                  </span>
                </li>
                <li>
                  <span>Phone Dollars</span>
                  <span className={styles.receiptEarn}>{pd(earned)}</span>
                </li>
                <li>
                  <span>Permission</span>
                  <span>{earned > 0 ? 'Customer yes · optional' : 'Declined earn · continued'}</span>
                </li>
                <li>
                  <span>Responsible</span>
                  <span>Named reviewer · draft sealed</span>
                </li>
              </ul>
              <footer>
                <span>assembl · proof locked</span>
                <span>Hash · demo only</span>
              </footer>
            </article>

            <div className={styles.receiptActions}>
              <button type="button" className={styles.ghost} onClick={restart}>
                Restart journey
              </button>
              <Link href="/" className={styles.ctaLink}>
                Back to field
              </Link>
            </div>
            <p className={styles.evidence}>{stage.evidence}</p>
          </section>
        )}
      </div>
    </div>
  );
}
