'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { WAIT_STATE_DEMOS, nzd, type WaitStateDemoDef } from '@/lib/customers/contact-energy/data';
import styles from '@/app/customers/contact-energy/contact.module.css';
import { MatarikiLoader } from './MatarikiLoader';
import { useCredits } from './CreditsProvider';

/**
 * The money shot: a mock Contact-app loading moment. Press the action, the
 * matariki loader runs for the real dwell time, an Assembling partner offer
 * slides in, and when the wait ends the offer dissolves into a gold particle
 * burst while the credit tally ticks up. Demo mechanics only — the "credits"
 * are fictional and clearly labelled.
 */

type Phase = 'idle' | 'running' | 'burst' | 'done';

// Pre-computed particle vectors — deterministic so SSR/client markup match.
const PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  const dist = 46 + (i % 3) * 22;
  return {
    dx: Math.round(Math.cos(angle) * dist),
    dy: Math.round(Math.sin(angle) * dist * 0.72),
    scale: 0.5 + (i % 4) * 0.22,
    delay: (i % 5) * 28,
  };
});

function DemoCard({ demo }: { demo: WaitStateDemoDef }) {
  const { addCredits } = useCredits();
  const [phase, setPhase] = useState<Phase>('idle');
  const [offerIn, setOfferIn] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const credited = useRef(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const start = useCallback(() => {
    if (phase === 'running' || phase === 'burst') return;
    clearTimers();
    credited.current = false;
    setPhase('running');
    setOfferIn(false);
    // The offer slides in once the loader has settled — the wait is real
    // first, the offer arrives second. That ordering is the whole pitch.
    timers.current.push(setTimeout(() => setOfferIn(true), 700));
    timers.current.push(
      setTimeout(() => {
        setPhase('burst');
        if (!credited.current) {
          credited.current = true;
          addCredits(demo.earn);
        }
        timers.current.push(setTimeout(() => setPhase('done'), 650));
      }, demo.durationMs),
    );
  }, [phase, clearTimers, addCredits, demo]);

  const reset = useCallback(() => {
    clearTimers();
    setPhase('idle');
    setOfferIn(false);
  }, [clearTimers]);

  return (
    <div className={styles.waitCard}>
      <div className={styles.waitCardHead}>
        <span className={styles.waitCardTitle}>{demo.trigger}</span>
        <span className={styles.waitCardMeta}>
          {demo.durationMs / 1000}s wait · earns {nzd(demo.earn)}
        </span>
      </div>

      {phase === 'idle' && (
        <div className={styles.waitStage}>
          <p className={styles.waitIdleCopy}>
            A real loading moment in Contact&rsquo;s app — press it and watch the wait pay the bill down.
          </p>
          <button type="button" className={styles.contactCta} onClick={start}>
            {demo.trigger}
          </button>
        </div>
      )}

      {(phase === 'running' || phase === 'burst') && (
        <div className={styles.waitStage} aria-live="polite">
          <div className={styles.waitProcess}>
            <MatarikiLoader size={52} />
            <span className={styles.waitProcessLabel}>{demo.processLabel}</span>
            <span
              className={styles.waitProgress}
              style={{ ['--wait-ms' as string]: `${demo.durationMs}ms` }}
              aria-hidden
            >
              <span className={styles.waitProgressFill} />
            </span>
          </div>

          {phase === 'running' && (
            <div className={`${styles.offerCard} ${offerIn ? styles.offerCardIn : ''}`}>
              <div className={styles.offerPartner}>{demo.partner}</div>
              <div className={styles.offerHeadline}>{demo.offer}</div>
              <div className={styles.offerDetail}>{demo.offerDetail}</div>
              <div className={styles.offerFoot}>
                <span className={styles.offerMatch}>{demo.match}</span>
                <span className={styles.earnBadge}>you&rsquo;ll earn {nzd(demo.earn)}</span>
              </div>
              <div className={styles.offerFine}>illustrative partner offer · opt-out anytime</div>
            </div>
          )}

          {phase === 'burst' && (
            <div className={styles.burstWrap} aria-hidden>
              {PARTICLES.map((p, i) => (
                <span
                  key={i}
                  className={styles.burstParticle}
                  style={{
                    ['--dx' as string]: `${p.dx}px`,
                    ['--dy' as string]: `${p.dy}px`,
                    ['--sc' as string]: `${p.scale}`,
                    animationDelay: `${p.delay}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className={styles.waitStage}>
          <div className={styles.waitDone}>
            <span className={styles.waitDoneTick} aria-hidden>
              ✓
            </span>
            <div>
              <div className={styles.waitDoneHead}>Done — and the wait paid you</div>
              <div className={styles.waitDoneSub}>
                {nzd(demo.earn)} credited toward your next bill (demo — not a real credit)
              </div>
            </div>
          </div>
          <button type="button" className={styles.ghostBtn} onClick={reset}>
            Run it again
          </button>
        </div>
      )}
    </div>
  );
}

export function WaitStateDemos() {
  return (
    <div className={styles.waitGrid}>
      {WAIT_STATE_DEMOS.map((d) => (
        <DemoCard key={d.key} demo={d} />
      ))}
    </div>
  );
}
