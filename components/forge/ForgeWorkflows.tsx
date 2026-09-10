'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FORGE_PREVIEW } from '@/lib/forge/preview-copy';

/** Named desk workflows with concrete DEMO outputs and states. */
export function ForgeWorkflows() {
  const workflows = FORGE_PREVIEW.workflows;
  const [activeId, setActiveId] = useState(workflows[0]?.id ?? '');
  const active = workflows.find((w) => w.id === activeId) ?? workflows[0];

  if (!active) return null;

  return (
    <div className="frg-flows" id="forge-workflows">
      <div className="frg-flow-list" role="list" aria-label="DEMO desk workflows">
        {workflows.map((flow) => (
          <button
            key={flow.id}
            type="button"
            role="listitem"
            className="frg-flow-item"
            data-active={flow.id === active.id ? 'true' : 'false'}
            aria-pressed={flow.id === active.id}
            onClick={() => setActiveId(flow.id)}
          >
            <span className="frg-mono">{flow.role}</span>
            <strong>{flow.title}</strong>
          </button>
        ))}
      </div>

      <aside className="frg-flow-card" aria-live="polite">
        <span className="frg-demo-pill frg-mono">{FORGE_PREVIEW.demoBadge}</span>
        <p className="frg-mono frg-flow-role">{active.role}</p>
        <h3>{active.title}</h3>
        <p className="frg-flow-job">{active.job}</p>

        <dl className="frg-flow-meta">
          <div>
            <dt className="frg-mono">Output</dt>
            <dd>{active.output}</dd>
          </div>
          <div>
            <dt className="frg-mono">State</dt>
            <dd>{active.state}</dd>
          </div>
        </dl>

        <p>{active.detail}</p>

        {active.id === 'chat' ? (
          <Link className="frg-cta frg-cta-primary frg-flow-cta" href={FORGE_PREVIEW.aratakiHref}>
            {FORGE_PREVIEW.ctaChat}
          </Link>
        ) : null}
        {active.id === 'service' ? (
          <a className="frg-cta frg-cta-ghost frg-flow-cta" href="#forge-bay">
            {FORGE_PREVIEW.ctaBay}
          </a>
        ) : null}
      </aside>
    </div>
  );
}
