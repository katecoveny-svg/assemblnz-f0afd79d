'use client';

/**
 * NZ villa / terrace plan — linework that assembles by step.
 * DEMO drawing only. Parts: envelope, rooms, stair, deck, openings.
 * Reusable craft: pass `activeStep` 0..n; other verticals swap the SVG later.
 */

const PARTS_BY_STEP = [
  ['envelope', 'grid'],
  ['envelope', 'grid', 'rooms', 'openings'],
  ['envelope', 'grid', 'rooms', 'openings', 'stair', 'deck', 'dims'],
] as const;

export function PlanAssembling({
  activeStep = 0,
  className = '',
}: {
  activeStep?: number;
  className?: string;
}) {
  const step = Math.max(0, Math.min(activeStep, PARTS_BY_STEP.length - 1));
  const active = new Set<string>(PARTS_BY_STEP[step]);

  const partClass = (id: string) =>
    `bp-part ${active.has(id) ? 'bp-part-active' : 'bp-part-dim'}`;

  return (
    <div className={`bp-frame bp-frame-premium ${className}`.trim()} aria-hidden>
      <p className="bp-micro" style={{ padding: '0.75rem 1rem 0' }}>
        DEMO · NZ terrace infill · AUP H4 sketch
      </p>
      <svg
        className="bp-plan"
        viewBox="0 0 480 340"
        role="img"
        aria-label="DEMO New Zealand terrace plan assembling"
      >
        {/* survey grid */}
        <g className={partClass('grid')}>
          {Array.from({ length: 12 }, (_, i) => (
            <line
              key={`vx-${i}`}
              className="bp-hatch"
              x1={40 + i * 36}
              y1={36}
              x2={40 + i * 36}
              y2={300}
            />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <line
              key={`hz-${i}`}
              className="bp-hatch"
              x1={40}
              y1={36 + i * 33}
              x2={440}
              y2={36 + i * 33}
            />
          ))}
        </g>

        {/* building envelope — simple NZ terrace footprint */}
        <g className={partClass('envelope')}>
          <rect x="88" y="64" width="240" height="176" />
          <rect x="328" y="112" width="72" height="88" />
        </g>

        {/* rooms */}
        <g className={partClass('rooms')}>
          <line x1="88" y1="152" x2="328" y2="152" />
          <line x1="208" y1="64" x2="208" y2="240" />
          <line x1="268" y1="152" x2="268" y2="240" />
          <text className="bp-dim" x="118" y="118">
            LIVING
          </text>
          <text className="bp-dim" x="228" y="118">
            KITCHEN
          </text>
          <text className="bp-dim" x="118" y="204">
            BED 1
          </text>
          <text className="bp-dim" x="228" y="204">
            BED 2
          </text>
          <text className="bp-dim" x="340" y="162">
            WC
          </text>
        </g>

        {/* openings */}
        <g className={partClass('openings')}>
          <line x1="140" y1="64" x2="180" y2="64" strokeWidth="3" />
          <line x1="240" y1="64" x2="290" y2="64" strokeWidth="3" />
          <line x1="328" y1="148" x2="328" y2="168" strokeWidth="3" />
          <path d="M 188 240 L 188 252 L 208 252 L 208 240" />
        </g>

        {/* stair — open flight (DEMO pin target language) */}
        <g className={partClass('stair')}>
          <path d="M 280 240 L 318 240 L 318 280 L 280 280 Z" />
          <line x1="280" y1="250" x2="318" y2="250" />
          <line x1="280" y1="260" x2="318" y2="260" />
          <line x1="280" y1="270" x2="318" y2="270" />
          <text className="bp-dim" x="284" y="296">
            STAIR
          </text>
        </g>

        {/* north deck */}
        <g className={partClass('deck')}>
          <rect x="88" y="40" width="140" height="24" />
          <text className="bp-dim" x="128" y="56">
            DECK
          </text>
        </g>

        {/* dimension strings */}
        <g className={partClass('dims')}>
          <line x1="88" y1="300" x2="328" y2="300" />
          <line x1="88" y1="294" x2="88" y2="306" />
          <line x1="328" y1="294" x2="328" y2="306" />
          <text className="bp-dim" x="180" y="318">
            9.600
          </text>
          <circle cx="300" cy="255" r="5" fill="#916A70" stroke="none" />
          <circle cx="150" cy="52" r="5" fill="#916A70" stroke="none" />
          <circle cx="360" cy="160" r="5" fill="#916A70" stroke="none" />
        </g>
      </svg>
    </div>
  );
}
