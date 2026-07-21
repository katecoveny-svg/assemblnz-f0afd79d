'use client';

import { useEffect, useRef, useState } from 'react';
import type { WaitStateModule } from '@/lib/journey/types';
import { getJourneyAgentRole } from '@/lib/journey/agents';
import styles from './journey.module.css';

/**
 * The signature wait-state module. Not a spinner: it progressively reveals the
 * real work being done while the basket assembles, and keeps the customer in
 * control (they can review the plan, or skip ahead). Respects reduced motion —
 * everything resolves at once with no animation.
 */
export function WaitState({
  module,
  onComplete,
  onReview,
}: {
  module: WaitStateModule;
  onComplete: () => void;
  onReview?: () => void;
}) {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const [active, setActive] = useState(prefersReduced ? module.steps.length : 0);
  const done = useRef(false);

  useEffect(() => {
    if (prefersReduced) {
      if (!done.current) {
        done.current = true;
        onComplete();
      }
      return;
    }
    if (active >= module.steps.length) {
      if (!done.current) {
        done.current = true;
        const t = setTimeout(onComplete, 500);
        return () => clearTimeout(t);
      }
      return;
    }
    const t = setTimeout(() => setActive((n) => n + 1), 900);
    return () => clearTimeout(t);
  }, [active, module.steps.length, onComplete, prefersReduced]);

  return (
    <div className={styles.panel} role="status" aria-live="polite">
      <p className={styles.eyebrow}>Assembling</p>
      <h2 className={styles.headline}>Putting your shop together</h2>
      <p className={styles.lede}>
        Useful work, not a loading bar. You can review the plan while this runs — nothing is
        ordered.
      </p>

      <div className={styles.waitSteps}>
        {module.steps.map((step, i) => {
          const state = i < active ? 'done' : i === active ? 'active' : 'idle';
          const role = getJourneyAgentRole(step.agentRoleId);
          return (
            <div
              key={step.id}
              className={`${styles.waitStep} ${state === 'active' ? styles.waitStepActive : ''} ${state === 'done' ? styles.waitStepDone : ''}`}
            >
              <span
                className={`${styles.waitTick} ${state === 'active' ? styles.waitTickActive : ''} ${state === 'done' ? styles.waitTickDone : ''}`}
                aria-hidden
              >
                {state === 'active' && !prefersReduced && <span className={styles.waitSpin} />}
              </span>
              <div>
                <p className={styles.waitLabel}>{step.label}</p>
                <p className={styles.waitDetail}>{step.detail}</p>
              </div>
              <span className={styles.waitRole}>{role?.name ?? step.agentRoleId}</span>
            </div>
          );
        })}
      </div>

      <div className={styles.actionsRow}>
        <button className={styles.ghost} type="button" onClick={onComplete}>
          Skip ahead
        </button>
        {onReview && (
          <button className={styles.ghost} type="button" onClick={onReview}>
            Review the plan while I wait
          </button>
        )}
      </div>
    </div>
  );
}
