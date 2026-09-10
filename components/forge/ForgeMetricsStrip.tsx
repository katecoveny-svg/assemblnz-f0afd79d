'use client';

import { FORGE_PREVIEW } from '@/lib/forge/preview-copy';

/** Directional DEMO metrics strip — hours back / approval honesty, not fake live %. */
export function ForgeMetricsStrip() {
  return (
    <div className="frg-metrics" id="forge-metrics" aria-label="DEMO directional outcomes">
      {FORGE_PREVIEW.metrics.map((m) => (
        <article key={m.label} className="frg-metric">
          <p className="frg-mono frg-metric-value">{m.value}</p>
          <h3>{m.label}</h3>
          <p>{m.note}</p>
        </article>
      ))}
    </div>
  );
}
