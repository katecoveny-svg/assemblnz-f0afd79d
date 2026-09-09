'use client';

import { useEffect, useState } from 'react';
import { ENSEMBLE_PACKAGE_STAGES } from '@/lib/ensemble/demo-package';
import { ENSEMBLE_PREVIEW } from '@/lib/ensemble/preview-copy';

/** Brief desk → assembled package. Assembly motion; reduced-motion gets full set. */
export function EnsembleBriefDesk() {
  const [visible, setVisible] = useState(ENSEMBLE_PACKAGE_STAGES.length);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setVisible(ENSEMBLE_PACKAGE_STAGES.length);
      return;
    }
    setVisible(0);
    const timers = ENSEMBLE_PACKAGE_STAGES.map((_, i) =>
      window.setTimeout(() => setVisible(i + 1), 280 + i * 420),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  return (
    <div className="ens-package" id="ensemble-assemble">
      <aside className="ens-brief-card">
        <p className="ens-eyebrow ens-mono">{ENSEMBLE_PREVIEW.assembleEyebrow}</p>
        <h3>Harbour winter brief · DEMO</h3>
        <p>
          Client: sample café · Wellington. Goal: winter single-origin launch.
          Deliverables: headlines, editorial still, 15s film, 40s voice. Nothing
          publishes without a human yes.
        </p>
        <p
          className="ens-mono"
          style={{
            marginTop: '0.85rem',
            fontSize: '0.68rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--ens-rose)',
          }}
        >
          draft-only · DEMO · sample business
        </p>
      </aside>

      <div className="ens-stages" aria-live="polite">
        {ENSEMBLE_PACKAGE_STAGES.map((stage, i) => (
          <article
            key={stage.id}
            className={`ens-stage${i < visible ? ' is-visible' : ''}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="ens-stage-top">
              <strong>{stage.label}</strong>
              <span className="ens-mono">{stage.agent}</span>
            </div>
            <p>{stage.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
