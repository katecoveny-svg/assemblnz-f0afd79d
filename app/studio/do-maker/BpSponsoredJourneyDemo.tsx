'use client';

import { useState } from 'react';
import {
  BP_SPONSORED_SCENARIO,
  BP_SPONSORED_STEPS,
  buildBpSponsoredReceipt,
  type SponsoredJourneyStepId,
} from '@/lib/studio/bp-sponsored-journey';
import styles from './do-maker.module.css';

/**
 * Interactive sponsored-agent walkthrough for bp Road-Ready inside Task DO Maker.
 * DEMO honesty throughout — no live bp / CRM / rewards calls.
 */
export function BpSponsoredJourneyDemo({ compact = false }: { compact?: boolean }) {
  const [stepId, setStepId] = useState<SponsoredJourneyStepId>('moment');
  const [permitIssued, setPermitIssued] = useState(false);
  const [receipt, setReceipt] = useState(() => buildBpSponsoredReceipt());

  const index = BP_SPONSORED_STEPS.findIndex((step) => step.id === stepId);
  const step = BP_SPONSORED_STEPS[index] ?? BP_SPONSORED_STEPS[0];
  const progress = `${String(index + 1).padStart(2, '0')} / ${String(BP_SPONSORED_STEPS.length).padStart(2, '0')}`;

  const advance = () => {
    if (step.requiresPermit && !permitIssued) {
      setPermitIssued(true);
      return;
    }
    if (step.id === 'receipt') {
      setStepId('moment');
      setPermitIssued(false);
      setReceipt(buildBpSponsoredReceipt());
      return;
    }
    const next = BP_SPONSORED_STEPS[index + 1];
    if (next) setStepId(next.id);
  };

  const skipOffer = () => {
    // Unpaid path: jump to permit with no loyalty redeem — still DEMO.
    setStepId('permit');
    setPermitIssued(false);
  };

  const primaryLabel =
    step.requiresPermit && !permitIssued
      ? 'Approve · issue DEMO Permit'
      : step.requiresPermit && permitIssued
        ? 'Continue to DEMO action'
        : step.cta;

  return (
    <div
      className={`${styles.journey} ${compact ? styles.journeyCompact : ''}`}
      data-step={step.id}
      aria-label="bp Road-Ready sponsored agent DEMO"
    >
      <div className={styles.journeyRail}>
        <span>Sponsored · DEMO</span>
        <em>{progress}</em>
      </div>

      <div className={styles.journeySheet}>
        <header className={styles.journeyHead}>
          <div className={styles.journeyMark} aria-hidden>
            bp
          </div>
          <div>
            <strong>bp Road-Ready</strong>
            <span>
              {BP_SPONSORED_SCENARIO.persona} · {BP_SPONSORED_SCENARIO.location}
            </span>
          </div>
          <span className={styles.journeyDemoPill}>DEMO</span>
        </header>

        <div className={styles.journeyBody}>
          <p className={styles.journeyPhase}>{step.phase}</p>
          <h2>{step.title}</h2>
          <p>{step.body}</p>
          <p className={styles.journeyEvidence}>{step.evidence}</p>

          {step.id === 'offer' ? (
            <button type="button" className={styles.journeyGhost} onClick={skipOffer}>
              Skip offer · unpaid path
            </button>
          ) : null}

          {step.id === 'permit' ? (
            <dl className={styles.journeyPermit}>
              <div>
                <dt>Action</dt>
                <dd>apply coffee-points offer · DEMO fill</dd>
              </div>
              <div>
                <dt>Bounds</dt>
                <dd>TTL 15m · max 1 · no payment · no CRM write</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{permitIssued ? 'Permit issued · ready to execute' : 'Awaiting your yes'}</dd>
              </div>
            </dl>
          ) : null}

          {step.id === 'receipt' ? (
            <dl className={styles.journeyReceipt}>
              <div>
                <dt>Receipt</dt>
                <dd>{receipt.receiptId}</dd>
              </div>
              <div>
                <dt>Permit</dt>
                <dd>{receipt.permitId}</dd>
              </div>
              <div>
                <dt>Offer</dt>
                <dd>{receipt.offer}</dd>
              </div>
              <div>
                <dt>Handoff</dt>
                <dd>{receipt.handoff}</dd>
              </div>
              <div>
                <dt>Honesty</dt>
                <dd>{receipt.honesty}</dd>
              </div>
            </dl>
          ) : null}

          {step.note ? <p className={styles.journeyNote}>{step.note}</p> : null}
        </div>

        <footer className={styles.journeyFoot}>
          <p className={styles.journeyDiff}>{BP_SPONSORED_SCENARIO.differentiator}</p>
          <div className={styles.journeyActions}>
            {index > 0 && step.id !== 'receipt' ? (
              <button
                type="button"
                className={styles.journeyGhost}
                onClick={() => {
                  const prev = BP_SPONSORED_STEPS[index - 1];
                  if (prev) {
                    setStepId(prev.id);
                    if (prev.id !== 'permit') setPermitIssued(false);
                  }
                }}
              >
                Back
              </button>
            ) : null}
            <button type="button" className={styles.journeyPrimary} onClick={advance}>
              {primaryLabel}
            </button>
          </div>
          <p className={styles.journeyPowered}>powered by assembl DO · drafts + permit + receipt</p>
        </footer>
      </div>
    </div>
  );
}
