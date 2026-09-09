'use client';

import { useState } from 'react';
import { ARC_DEMO_VIOLATIONS, type ArcViolation } from '@/lib/arc/demo-violations';
import { ARC_PREVIEW } from '@/lib/arc/preview-copy';

function PlanWithPins({
  activeId,
  onSelect,
}: {
  activeId: string | null;
  onSelect: (v: ArcViolation) => void;
}) {
  return (
    <div className="arc-plan-sheet arc-plan-interactive" id="arc-model">
      <div className="arc-title-block arc-mono" aria-hidden>
        <div className="arc-title-block-row">
          <span>SHEET</span>
          <strong>Issues overlay · DEMO</strong>
        </div>
        <div className="arc-title-block-row">
          <span>CODES</span>
          <strong>NZBC / AUP-class</strong>
        </div>
        <div className="arc-title-block-row">
          <span>STATUS</span>
          <strong>staged · not lodged</strong>
        </div>
      </div>

      <div className="arc-plan-pinboard">
        <svg
          className="arc-plan-svg"
          viewBox="0 0 640 420"
          role="img"
          aria-label="DEMO terrace plan with clickable NZ code pins"
        >
          <defs>
            <pattern id="arc-eng-grid-pins" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#240B21" strokeWidth="0.35" opacity="0.08" />
            </pattern>
          </defs>
          <rect width="640" height="420" fill="#FFFDFB" />
          <rect width="640" height="420" fill="url(#arc-eng-grid-pins)" />

          <g stroke="#240B21" fill="none" strokeLinejoin="miter">
            <rect x="90" y="70" width="420" height="250" strokeWidth="3.2" />
            <line x1="270" y1="70" x2="270" y2="210" strokeWidth="2" />
            <line x1="90" y1="210" x2="270" y2="210" strokeWidth="2" />
            <line x1="360" y1="210" x2="510" y2="210" strokeWidth="2" />
            <line x1="360" y1="210" x2="360" y2="320" strokeWidth="2" />
            <rect x="430" y="230" width="80" height="90" strokeWidth="2" />
            {[0, 1, 2, 3, 4].map((i) => (
              <line
                key={i}
                x1="430"
                y1={248 + i * 14}
                x2="510"
                y2={248 + i * 14}
                strokeWidth="1"
                opacity="0.75"
              />
            ))}
            <rect x="360" y="210" width="70" height="55" strokeWidth="2" />
            <circle cx="395" cy="238" r="14" strokeWidth="1.2" strokeDasharray="3 2" opacity="0.7" />
            <rect
              x="90"
              y="320"
              width="220"
              height="48"
              strokeWidth="1.6"
              strokeDasharray="6 4"
              opacity="0.9"
            />
            <path d="M190 210 A22 22 0 0 1 212 232" strokeWidth="1.2" stroke="#654A4E" />
            <path d="M270 130 A20 20 0 0 1 290 150" strokeWidth="1.2" stroke="#654A4E" />
          </g>

          <g
            fill="#654A4E"
            fontFamily="IBM Plex Mono, ui-monospace, monospace"
            fontSize="10"
            letterSpacing="0.8"
          >
            <text x="140" y="145">BED 1</text>
            <text x="140" y="265">LIVING / KITCHEN</text>
            <text x="310" y="145">BED 2</text>
            <text x="372" y="242">WC</text>
            <text x="448" y="280">STAIR</text>
            <text x="155" y="348" fill="#916A70">
              DECK
            </text>
          </g>

          <g stroke="#240B21" fill="#240B21">
            <line x1="90" y1="52" x2="510" y2="52" strokeWidth="0.8" />
            <line x1="90" y1="48" x2="90" y2="56" strokeWidth="0.8" />
            <line x1="510" y1="48" x2="510" y2="56" strokeWidth="0.8" />
            <text
              x="300"
              y="46"
              textAnchor="middle"
              fontFamily="IBM Plex Mono, ui-monospace, monospace"
              fontSize="9"
              fill="#654A4E"
            >
              12 400
            </text>
            <line x1="580" y1="90" x2="580" y2="58" strokeWidth="1" />
            <path d="M580 58 l-4 8 h8 z" />
            <text
              x="575"
              y="108"
              fontFamily="IBM Plex Mono, ui-monospace, monospace"
              fontSize="9"
              fill="#654A4E"
            >
              N
            </text>
          </g>
        </svg>

        {ARC_DEMO_VIOLATIONS.map((v) => (
          <button
            key={v.id}
            type="button"
            className="arc-pin"
            style={{ left: `${v.position.x}%`, top: `${v.position.y}%` }}
            data-active={activeId === v.id ? 'true' : 'false'}
            aria-label={`${ARC_PREVIEW.demoBadge} ${v.code}: ${v.title}`}
            aria-pressed={activeId === v.id}
            onClick={() => onSelect(v)}
          >
            <span className="arc-pin-core" />
            <span className="arc-pin-label arc-mono">{v.code}</span>
          </button>
        ))}
      </div>

      <p className="arc-canvas-hint arc-mono">Click a pin on the sheet</p>
      <p className="arc-sheet-caption arc-mono">
        harbour terrace GA · DEMO pins · NZBC / AUP-class citations
      </p>
    </div>
  );
}

export function ArcModelDemo() {
  const [active, setActive] = useState<ArcViolation | null>(ARC_DEMO_VIOLATIONS[0] ?? null);

  return (
    <div className="arc-model-shell">
      <PlanWithPins activeId={active?.id ?? null} onSelect={setActive} />

      <aside className="arc-violation-card" data-empty={active ? 'false' : 'true'} aria-live="polite">
        {active ? (
          <>
            <span className="arc-demo-pill arc-mono">{ARC_PREVIEW.demoBadge}</span>
            <p className="arc-violation-code arc-mono">{active.code}</p>
            <h3>{active.title}</h3>
            <p>{active.summary}</p>
            <p className="arc-mono arc-evidence-meta">
              {ARC_PREVIEW.evidenceLabel} · staged · not lodged
            </p>
          </>
        ) : (
          <p>Select a DEMO pin on the plan sheet.</p>
        )}

        <div className="arc-pin-list">
          <p className="arc-mono arc-pin-list-label">DEMO pins</p>
          {ARC_DEMO_VIOLATIONS.map((v) => (
            <button
              key={v.id}
              type="button"
              className="arc-pin-list-item"
              data-active={active?.id === v.id ? 'true' : 'false'}
              onClick={() => setActive(v)}
              aria-pressed={active?.id === v.id}
            >
              <span className="arc-mono">{v.code}</span>
              {v.title}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
