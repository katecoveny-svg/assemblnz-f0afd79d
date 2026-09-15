'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';

/**
 * Hero stage kinship with DO Spatial Widget C —
 * floating paper cards + volumetric ✦. Not Arc BlueprintScene.
 * Reduced-motion: fully assembled end state.
 */
export function AerialAssembly() {
  const cards = [
    { id: 'find', label: 'FIND', body: 'Pursuit turns signals into opportunity', rot: '-3.5deg', x: '4%', y: '8%', delay: '0s' },
    { id: 'do', label: 'DO', body: 'Execute the outcome — agents prepare, you yes', rot: '2deg', x: '38%', y: '28%', delay: '0.15s', hero: true },
    { id: 'show', label: 'SHOW', body: 'Studio makes the work undeniable', rot: '-1.5deg', x: '62%', y: '6%', delay: '0.28s' },
  ] as const;

  return (
    <figure className="atw-stage" aria-label="Signals assemble through FIND, DO and SHOW into one output">
      <div className="atw-stage-glow" aria-hidden="true" />

      <div className="atw-orb" data-motion aria-hidden="true">
        <span className="atw-orb-halo" />
        <span className="atw-orb-core">
          <span className="atw-orb-star">✦</span>
        </span>
        <span className="atw-orb-label">assemble</span>
      </div>

      {cards.map((card, i) => (
        <article
          key={card.id}
          className={`atw-float-card${'hero' in card && card.hero ? ' is-hero' : ''}`}
          data-motion
          style={
            {
              ['--atw-rot' as string]: card.rot,
              ['--atw-x' as string]: card.x,
              ['--atw-y' as string]: card.y,
              ['--atw-i' as string]: String(i),
              animationDelay: card.delay,
            } as CSSProperties
          }
        >
          <p className="atw-float-kicker">{card.label}</p>
          <p className="atw-float-body">{card.body}</p>
        </article>
      ))}

      <div className="atw-output-lock" data-motion aria-hidden="true">
        <span>OUTPUT</span>
        <strong>one assembl loop</strong>
      </div>

      <figcaption className="atw-stage-caption">
        aerial assembly · DEMO · signals → work
      </figcaption>

      <p className="atw-stage-cta-hint">
        <Link href="/do">open DO →</Link>
      </p>
    </figure>
  );
}
