'use client';

import { useState } from 'react';
import { FORGE_DEMO_FLAGS } from '@/lib/forge/demo-flags';
import { FORGE_PREVIEW } from '@/lib/forge/preview-copy';

/** Readable DEMO bay flags — automotive desk, not a floor-plate pin sheet. */
export function ForgeBayFlags() {
  const [activeId, setActiveId] = useState(FORGE_DEMO_FLAGS[0]?.id ?? '');
  const active = FORGE_DEMO_FLAGS.find((f) => f.id === activeId) ?? FORGE_DEMO_FLAGS[0];

  if (!active) return null;

  return (
    <div className="frg-bays" id="forge-bay">
      <aside className="frg-bay-card" aria-live="polite">
        <span className="frg-demo-pill frg-mono">{FORGE_PREVIEW.demoBadge}</span>
        <p className="frg-bay-code frg-mono">{active.code}</p>
        <h3>{active.title}</h3>
        <p>{active.summary}</p>
        <p className="frg-mono frg-bay-meta">{active.bay}</p>
        <p className="frg-mono frg-bay-stamp">
          {FORGE_PREVIEW.evidenceLabel} · staged · not lodged
        </p>
      </aside>

      <div className="frg-bay-list" role="list" aria-label="DEMO bay flags">
        <p className="frg-mono frg-bay-list-label">DEMO flags · service bay</p>
        {FORGE_DEMO_FLAGS.map((flag) => (
          <button
            key={flag.id}
            type="button"
            role="listitem"
            className="frg-bay-list-item"
            data-active={flag.id === active.id ? 'true' : 'false'}
            aria-pressed={flag.id === active.id}
            onClick={() => setActiveId(flag.id)}
          >
            <span className="frg-mono">{flag.code}</span>
            <strong>{flag.title}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}
