'use client';

import { FORGE_PREVIEW } from '@/lib/forge/preview-copy';

/** DEMO outcome pillars — Impel-class clarity, Assembl-owned wording. */
export function ForgeOutcomes() {
  return (
    <div className="frg-pillars" id="forge-outcomes">
      {FORGE_PREVIEW.pillars.map((pillar) => (
        <article key={pillar.id} className="frg-pillar">
          <h3>{pillar.title}</h3>
          <p>{pillar.body}</p>
        </article>
      ))}
    </div>
  );
}
