'use client';

import { useState } from 'react';
import { ENSEMBLE_CLAIM_PINS } from '@/lib/ensemble/demo-package';
import { ENSEMBLE_PREVIEW } from '@/lib/ensemble/preview-copy';

/**
 * DEMO claim pins on the campaign artefact — readable stacked cards.
 * Not an architecture floor-plate pin sheet.
 */
export function EnsembleClaimPins() {
  const [activeId, setActiveId] = useState(ENSEMBLE_CLAIM_PINS[0]?.id ?? '');
  const active = ENSEMBLE_CLAIM_PINS.find((p) => p.id === activeId) ?? ENSEMBLE_CLAIM_PINS[0];

  if (!active) return null;

  return (
    <div className="ens-claims" id="ensemble-claims">
      <aside className="ens-claim-card" aria-live="polite">
        <span className="ens-demo-pill ens-mono">{ENSEMBLE_PREVIEW.demoBadge}</span>
        <p className="ens-claim-code ens-mono">{active.code}</p>
        <h3>{active.title}</h3>
        <p>{active.summary}</p>
        <p className="ens-mono ens-claim-artefact">{active.artefact}</p>
        <p className="ens-mono ens-claim-meta">
          {ENSEMBLE_PREVIEW.evidenceLabel} · staged · not published
        </p>
      </aside>

      <div className="ens-claim-list" role="list" aria-label="DEMO claim pins">
        <p className="ens-mono ens-claim-list-label">DEMO pins · on the artefact</p>
        {ENSEMBLE_CLAIM_PINS.map((pin) => (
          <button
            key={pin.id}
            type="button"
            role="listitem"
            className="ens-claim-list-item"
            data-active={pin.id === active.id ? 'true' : 'false'}
            aria-pressed={pin.id === active.id}
            onClick={() => setActiveId(pin.id)}
          >
            <span className="ens-mono">{pin.code}</span>
            <strong>{pin.title}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}
