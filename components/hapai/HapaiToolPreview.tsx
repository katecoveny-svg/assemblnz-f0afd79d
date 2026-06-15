import type { HapaiTool } from '@/lib/hapai/shareable-tools';

/**
 * HapaiToolPreview — the single, templated cover used on every HAPAI tool card.
 *
 * One sharp, vector "vessel mark" (the flat echo of the home hero sculpture)
 * on a bone field, tinted by the tool's category accent. Keeping one cover for
 * every tool — instead of 18 bespoke mock-ups — is what makes the library read
 * as one consistent, considered set.
 */

type HapaiToolPreviewProps = {
  tool: Pick<HapaiTool, 'category' | 'name'>;
};

// One accent per category, drawn from the brand palette. The cover is otherwise
// identical for every tool, so the colour is the only thing that varies.
const CATEGORY_ACCENT: Record<HapaiTool['category'], string> = {
  adoption: '#C9A24B', // gold
  operations: '#2B6B57', // pounamu
  marketing: '#AC5838', // kōkōwai / clay
  record: '#5B4FA0', // kahurangi
  lifestyle: '#D4842A', // karaka
  education: '#3B7CB5', // kikorangi
};

// Stacked discs (cream + accent), echoing the hero vessel as a flat mark.
const DISCS = [
  { cy: 158, rx: 60, ry: 15, tone: 'cream' },
  { cy: 137, rx: 52, ry: 12, tone: 'accent', alpha: 0.92 },
  { cy: 118, rx: 58, ry: 12, tone: 'accent', alpha: 0.5 },
  { cy: 101, rx: 45, ry: 11, tone: 'cream' },
  { cy: 86, rx: 51, ry: 11, tone: 'accent', alpha: 0.74 },
] as const;

const CREAM = '#EFE3CE';
const GOLD = '#C9A24B';

export function HapaiToolPreview({ tool }: HapaiToolPreviewProps) {
  const accent = CATEGORY_ACCENT[tool.category] ?? CATEGORY_ACCENT.operations;

  return (
    <div className="relative h-full min-h-[190px] overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at 80% 12%, ${accent}22 0%, transparent 46%), linear-gradient(135deg, #FAF7F2 0%, #F1EBDF 60%, #E9E2D4 100%)`,
        }}
      />

      {/* The vessel mark — crisp vector, centred. */}
      <svg
        viewBox="0 0 360 200"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {/* gold easel frame */}
        <g fill="none" stroke={GOLD} strokeWidth={1.4} strokeLinecap="round" opacity={0.85}>
          <rect x={122} y={44} width={116} height={130} rx={11} />
          <path d="M134 44 L180 32 L226 44" />
        </g>

        {/* contact shadow */}
        <ellipse cx={180} cy={176} rx={62} ry={9} fill="#3A2E18" opacity={0.12} />

        {/* stacked discs */}
        {DISCS.map((d, i) => (
          <g key={i}>
            <ellipse
              cx={180}
              cy={d.cy}
              rx={d.rx}
              ry={d.ry}
              fill={d.tone === 'cream' ? CREAM : accent}
              opacity={d.tone === 'cream' ? 1 : (d.alpha ?? 1)}
            />
            {/* thin gloss highlight along the top edge */}
            <path
              d={`M ${180 - d.rx * 0.7} ${d.cy - d.ry * 0.45} Q 180 ${d.cy - d.ry} ${180 + d.rx * 0.7} ${d.cy - d.ry * 0.45}`}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={1}
              opacity={0.4}
            />
          </g>
        ))}

        {/* shell dome + finial on top */}
        <path d="M 150 74 Q 180 50 210 74 Z" fill={CREAM} />
        <circle cx={180} cy={58} r={7.5} fill={accent} />
      </svg>

      {/* brand mark — consistent on every cover */}
      <span
        className="absolute bottom-3 left-4 font-display text-[15px] lowercase tracking-[-0.02em] text-[#23211F]/35"
        style={{ fontWeight: 300 }}
      >
        assembl
      </span>
    </div>
  );
}
