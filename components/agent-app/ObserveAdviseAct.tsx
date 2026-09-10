'use client';

import { useState } from 'react';
import type { ObserveAdviseActStep } from '@/lib/agent-app/types';

export type ObserveAdviseActProps = {
  eyebrow: string;
  title: string;
  steps: readonly ObserveAdviseActStep[];
  approveLabel?: string;
  approvedLabel?: string;
  actLabel?: string;
  actDisabledHint?: string;
  actEnabledHint?: string;
  demoBadge?: string;
  /** Override the observe-phase status line (defaults to floor-plate wording for Arc/Forge). */
  observeStatus?: string;
};

/**
 * Three-step Observe → Advise → Act machine.
 * Act stays disabled until the human approves the draft.
 */
export function ObserveAdviseAct({
  eyebrow,
  title,
  steps,
  approveLabel = 'Approve draft',
  approvedLabel = 'Draft approved',
  actLabel = 'Act',
  actDisabledHint = 'Act stays locked until you approve.',
  actEnabledHint = 'Approved — Act can run the staged draft.',
  demoBadge = 'DEMO',
  observeStatus = 'Observing floor plate · draft not ready',
}: ObserveAdviseActProps) {
  const [phase, setPhase] = useState<'observe' | 'advise' | 'approved'>('observe');
  const [acted, setActed] = useState(false);

  const actEnabled = phase === 'approved';

  const goAdvise = () => setPhase('advise');
  const approve = () => {
    setPhase('approved');
    setActed(false);
  };
  const act = () => {
    if (!actEnabled) return;
    setActed(true);
  };

  return (
    <section className="aa-section" aria-labelledby="aa-oaa-title">
      <div className="aa-section-head">
        <p className="aa-eyebrow aa-mono">{eyebrow}</p>
        <h2 id="aa-oaa-title">{title}</h2>
      </div>

      <div className="aa-oaa" data-phase={phase} data-acted={acted ? 'true' : 'false'}>
        <ol className="aa-oaa-steps">
          {steps.map((step) => {
            const isActive =
              (step.id === 'observe' && phase === 'observe') ||
              (step.id === 'advise' && (phase === 'advise' || phase === 'approved')) ||
              (step.id === 'act' && phase === 'approved');
            const isDone =
              (step.id === 'observe' && phase !== 'observe') ||
              (step.id === 'advise' && phase === 'approved') ||
              (step.id === 'act' && acted);

            return (
              <li
                key={step.id}
                className="aa-oaa-step"
                data-active={isActive ? 'true' : 'false'}
                data-done={isDone ? 'true' : 'false'}
                data-locked={step.id === 'act' && !actEnabled ? 'true' : 'false'}
              >
                <p className="aa-eyebrow aa-mono">
                  {step.label} · {step.title}
                </p>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            );
          })}
        </ol>

        <div className="aa-oaa-controls">
          <span className="aa-demo-pill aa-mono">{demoBadge}</span>
          <p className="aa-mono aa-oaa-status">
            {phase === 'observe' && observeStatus}
            {phase === 'advise' && 'Advice staged · awaiting human approval'}
            {phase === 'approved' && !acted && actEnabledHint}
            {acted && 'Acted on approval · DEMO only · nothing sent'}
          </p>

          <div className="aa-oaa-actions">
            {phase === 'observe' ? (
              <button type="button" className="aa-cta aa-cta-primary" onClick={goAdvise}>
                Continue to Advise
              </button>
            ) : null}

            {phase === 'advise' ? (
              <button type="button" className="aa-cta aa-cta-primary" onClick={approve}>
                {approveLabel}
              </button>
            ) : null}

            {phase === 'approved' ? (
              <button
                type="button"
                className="aa-cta aa-cta-ghost"
                disabled
                aria-disabled="true"
              >
                {approvedLabel}
              </button>
            ) : null}

            <button
              type="button"
              className="aa-cta aa-cta-primary"
              onClick={act}
              disabled={!actEnabled || acted}
              aria-disabled={!actEnabled || acted}
              title={!actEnabled ? actDisabledHint : undefined}
            >
              {actLabel}
            </button>
          </div>

          {!actEnabled ? (
            <p className="aa-mono aa-oaa-hint">{actDisabledHint}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
