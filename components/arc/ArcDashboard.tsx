'use client';

import { useState } from 'react';
import { ARC_DEMO_VIOLATIONS } from '@/lib/arc/demo-violations';
import { ARC_PREVIEW } from '@/lib/arc/preview-copy';

type FlagStatus = 'flagged' | 'draft' | 'awaiting';

const STATUS_LABEL: Record<FlagStatus, string> = {
  flagged: 'Flagged',
  draft: 'Draft ready',
  awaiting: 'Awaiting approval',
};

/**
 * Arc Dashboard sketch — flags + approvals.
 * Premium dark UI panel on the plum field. No payments, no live sync.
 */
export function ArcDashboard() {
  const [selected, setSelected] = useState(0);
  const flags = ARC_DEMO_VIOLATIONS.map((v, i) => ({
    ...v,
    status: (i === 0 ? 'awaiting' : i === 1 ? 'draft' : 'flagged') as FlagStatus,
  }));
  const active = flags[selected] ?? flags[0];

  return (
    <div className="arc-dash bp-frame bp-frame-premium" id="arc-dashboard">
      <div className="arc-dash-head">
        <div>
          <p className="bp-micro">{ARC_PREVIEW.dashboardEyebrow}</p>
          <h3>{ARC_PREVIEW.dashboardTitle}</h3>
        </div>
        <p className="bp-micro">{ARC_PREVIEW.demoBadge} · {flags.length} flags</p>
      </div>

      <div className="arc-dash-body">
        <ul className="arc-dash-list" role="list">
          {flags.map((f, i) => (
            <li key={f.id}>
              <button
                type="button"
                data-active={selected === i ? 'true' : 'false'}
                onClick={() => setSelected(i)}
              >
                <span className="arc-mono arc-dash-code">{f.code}</span>
                <span className="arc-dash-title">{f.title}</span>
                <span className="bp-micro arc-dash-status" data-status={f.status}>
                  {STATUS_LABEL[f.status]}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <aside className="arc-dash-detail" aria-live="polite">
          <span className="arc-demo-pill arc-mono">{ARC_PREVIEW.demoBadge}</span>
          <p className="arc-violation-code arc-mono">{active.code}</p>
          <h4>{active.title}</h4>
          <p>{active.summary}</p>
          <dl className="arc-dash-meta">
            <div>
              <dt className="bp-micro">State</dt>
              <dd>{STATUS_LABEL[active.status]}</dd>
            </div>
            <div>
              <dt className="bp-micro">{ARC_PREVIEW.evidenceLabel}</dt>
              <dd>Staged · not lodged</dd>
            </div>
            <div>
              <dt className="bp-micro">Action</dt>
              <dd>Hold for human yes</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
