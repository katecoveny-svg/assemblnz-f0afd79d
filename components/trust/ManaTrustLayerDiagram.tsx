/**
 * Mana Trust Layer — the five-stage governance pipeline rendered as inline SVG.
 *
 * Kahu → Iho → Tā → Mahara → Mana. Decorative reinforcement only: the
 * authoritative, screen-reader-friendly description lives in the stage cards
 * rendered as real HTML next to it on the page. The SVG carries a title + desc
 * so it is announced correctly and never blocks an accessibility pass.
 */

const STAGES = [
  { id: "kahu", label: "Kahu", sub: "Intent capture" },
  { id: "iho", label: "Iho", sub: "Routing" },
  { id: "ta", label: "Tā", sub: "Execution" },
  { id: "mahara", label: "Mahara", sub: "Review" },
  { id: "mana", label: "Mana", sub: "Sign-off" },
] as const;

export function ManaTrustLayerDiagram() {
  const nodeWidth = 150;
  const nodeHeight = 76;
  const gap = 52;
  const startX = 24;
  const nodeY = 96;
  const totalWidth = startX * 2 + STAGES.length * nodeWidth + (STAGES.length - 1) * gap;

  return (
    <svg
      viewBox={`0 0 ${totalWidth} 240`}
      width="100%"
      role="img"
      aria-labelledby="mtl-title mtl-desc"
      className="h-auto w-full"
    >
      <title id="mtl-title">Mana Trust Layer pipeline</title>
      <desc id="mtl-desc">
        Five stages flow left to right: Kahu (intent capture, where personal
        information is masked), Iho (routing), Tā (execution), Mahara (human
        review), and Mana (sign-off and signed evidence pack).
      </desc>

      <defs>
        <marker
          id="mtl-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="var(--assembl-gold-thread)" />
        </marker>
      </defs>

      {STAGES.map((stage, i) => {
        const x = startX + i * (nodeWidth + gap);
        const isFirst = i === 0;
        const isLast = i === STAGES.length - 1;
        return (
          <g key={stage.id}>
            {/* connector to next node */}
            {!isLast ? (
              <line
                x1={x + nodeWidth}
                y1={nodeY + nodeHeight / 2}
                x2={x + nodeWidth + gap}
                y2={nodeY + nodeHeight / 2}
                stroke="var(--assembl-gold-thread)"
                strokeWidth="2"
                markerEnd="url(#mtl-arrow)"
              />
            ) : null}

            <rect
              x={x}
              y={nodeY}
              width={nodeWidth}
              height={nodeHeight}
              rx="14"
              fill={isLast ? "var(--assembl-pounamu)" : "var(--assembl-pounamu-paper)"}
              stroke="var(--assembl-pounamu)"
              strokeWidth={isLast ? "0" : "1.5"}
            />
            <text
              x={x + nodeWidth / 2}
              y={nodeY + 32}
              textAnchor="middle"
              fontSize="20"
              fontWeight="600"
              fill={isLast ? "#FFF7EC" : "var(--assembl-pounamu-deep)"}
            >
              {stage.label}
            </text>
            <text
              x={x + nodeWidth / 2}
              y={nodeY + 54}
              textAnchor="middle"
              fontSize="12.5"
              fill={isLast ? "#E8EFE9" : "var(--text-secondary)"}
            >
              {stage.sub}
            </text>

            {/* callout badge under Kahu (masking) and Mana (signed receipt) */}
            {isFirst ? (
              <text
                x={x + nodeWidth / 2}
                y={nodeY + nodeHeight + 28}
                textAnchor="middle"
                fontSize="11.5"
                fontWeight="600"
                fill="var(--assembl-pounamu-deep)"
              >
                PII masked here ↑
              </text>
            ) : null}
            {isLast ? (
              <text
                x={x + nodeWidth / 2}
                y={nodeY + nodeHeight + 28}
                textAnchor="middle"
                fontSize="11.5"
                fontWeight="600"
                fill="var(--assembl-pounamu-deep)"
              >
                Signed receipt ↑
              </text>
            ) : null}
          </g>
        );
      })}

      <text
        x={startX}
        y={48}
        fontSize="13"
        fontWeight="600"
        fill="var(--text-secondary)"
        letterSpacing="0.12em"
      >
        THE MANA TRUST LAYER
      </text>
    </svg>
  );
}
