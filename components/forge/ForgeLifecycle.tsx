'use client';

import { useState } from 'react';
import { FORGE_LIFECYCLE } from '@/lib/forge/lifecycle';
import { FORGE_PREVIEW } from '@/lib/forge/preview-copy';

/** Interactive DEMO journey rail — research → sale → service → loyalty. */
export function ForgeLifecycle() {
  const [activeId, setActiveId] = useState(FORGE_LIFECYCLE[0]?.id ?? '');
  const active = FORGE_LIFECYCLE.find((s) => s.id === activeId) ?? FORGE_LIFECYCLE[0];

  if (!active) return null;

  return (
    <div className="frg-life" id="forge-lifecycle">
      <div className="frg-life-rail" role="tablist" aria-label="DEMO dealership journey stages">
        {FORGE_LIFECYCLE.map((stage, index) => (
          <button
            key={stage.id}
            type="button"
            role="tab"
            id={`forge-life-tab-${stage.id}`}
            aria-selected={stage.id === active.id}
            aria-controls="forge-life-panel"
            className="frg-life-node"
            data-active={stage.id === active.id ? 'true' : 'false'}
            onClick={() => setActiveId(stage.id)}
          >
            <span className="frg-mono frg-life-step">{stage.step}</span>
            <strong>{stage.short}</strong>
            {index < FORGE_LIFECYCLE.length - 1 ? (
              <span className="frg-life-connector" aria-hidden />
            ) : null}
          </button>
        ))}
      </div>

      <div
        className="frg-life-panel"
        id="forge-life-panel"
        role="tabpanel"
        aria-labelledby={`forge-life-tab-${active.id}`}
        aria-live="polite"
      >
        <div className="frg-life-copy">
          <p className="frg-mono frg-life-hint">{FORGE_PREVIEW.lifecycleHint}</p>
          <h3>{active.title}</h3>
          <p>{active.summary}</p>
          {active.id === 'service' ? (
            <a className="frg-cta frg-cta-ghost frg-life-bay-link" href="#forge-bay">
              {FORGE_PREVIEW.ctaBay}
            </a>
          ) : null}
        </div>

        <aside className="frg-life-pin">
          <span className="frg-demo-pill frg-mono">{FORGE_PREVIEW.demoBadge}</span>
          <p className="frg-mono frg-life-pin-code">{active.pinCode}</p>
          <h4>{active.pinTitle}</h4>
          <p>{active.pinBody}</p>
          <p className="frg-mono frg-life-pin-desk">{active.desk}</p>
          <p className="frg-mono frg-life-pin-stamp">
            {FORGE_PREVIEW.evidenceLabel} · staged · not lodged
          </p>
        </aside>
      </div>
    </div>
  );
}
