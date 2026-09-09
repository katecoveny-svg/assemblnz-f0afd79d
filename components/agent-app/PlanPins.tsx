'use client';

import { useState, type ReactNode } from 'react';
import { TitleBlock } from '@/components/agent-app/TitleBlock';
import type { PlanPin, TitleBlockField } from '@/lib/agent-app/types';

export type PlanPinsProps = {
  id?: string;
  pins: PlanPin[];
  titleBlock: TitleBlockField[];
  /** Plan underlay drawn behind the pins (SVG content inside viewBox). */
  underlay: ReactNode;
  caption: string;
  hint?: string;
  demoBadge?: string;
  evidenceLabel?: string;
  ariaLabel: string;
  viewBox?: string;
  gridPatternId?: string;
  emptyPrompt?: string;
  listLabel?: string;
};

/**
 * Clickable DEMO pins on an NZ plan sheet — paper field, plum accent pins.
 * Underlay swaps per vertical; pin data is passed in.
 * Factory lock: never dark-plum canvas; see craft-canon.ts.
 */
export function PlanPins({
  id = 'aa-model',
  pins,
  titleBlock,
  underlay,
  caption,
  hint = 'Click a pin on the sheet',
  demoBadge = 'DEMO',
  evidenceLabel = 'Evidence receipt',
  ariaLabel,
  viewBox = '0 0 640 420',
  gridPatternId = 'aa-eng-grid-pins',
  emptyPrompt = 'Select a DEMO pin on the plan sheet.',
  listLabel = 'DEMO pins',
}: PlanPinsProps) {
  const [active, setActive] = useState<PlanPin | null>(pins[0] ?? null);

  return (
    <div className="aa-model-shell">
      <div className="aa-plan-sheet aa-plan-interactive" id={id}>
        <TitleBlock fields={titleBlock} />

        <div className="aa-plan-pinboard">
          <svg className="aa-plan-svg" viewBox={viewBox} role="img" aria-label={ariaLabel}>
            <defs>
              <pattern id={gridPatternId} width="20" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#240B21"
                  strokeWidth="0.35"
                  opacity="0.08"
                />
              </pattern>
            </defs>
            <rect width="640" height="420" fill="#FFFDFB" />
            <rect width="640" height="420" fill={`url(#${gridPatternId})`} />
            {underlay}
          </svg>

          {pins.map((v) => (
            <button
              key={v.id}
              type="button"
              className="aa-pin"
              style={{ left: `${v.position.x}%`, top: `${v.position.y}%` }}
              data-active={active?.id === v.id ? 'true' : 'false'}
              aria-label={`${demoBadge} ${v.code}: ${v.title}`}
              aria-pressed={active?.id === v.id}
              onClick={() => setActive(v)}
            >
              <span className="aa-pin-core" />
              <span className="aa-pin-label aa-mono">{v.code}</span>
            </button>
          ))}
        </div>

        <p className="aa-canvas-hint aa-mono">{hint}</p>
        <p className="aa-sheet-caption aa-mono">{caption}</p>
      </div>

      <aside
        className="aa-violation-card"
        data-empty={active ? 'false' : 'true'}
        aria-live="polite"
      >
        {active ? (
          <>
            <span className="aa-demo-pill aa-mono">{demoBadge}</span>
            <p className="aa-violation-code aa-mono">{active.code}</p>
            <h3>{active.title}</h3>
            <p>{active.summary}</p>
            <p className="aa-mono aa-evidence-meta">
              {evidenceLabel} · staged · not lodged
            </p>
          </>
        ) : (
          <p>{emptyPrompt}</p>
        )}

        <div className="aa-pin-list">
          <p className="aa-mono aa-pin-list-label">{listLabel}</p>
          {pins.map((v) => (
            <button
              key={v.id}
              type="button"
              className="aa-pin-list-item"
              data-active={active?.id === v.id ? 'true' : 'false'}
              onClick={() => setActive(v)}
              aria-pressed={active?.id === v.id}
            >
              <span className="aa-mono">{v.code}</span>
              {v.title}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
