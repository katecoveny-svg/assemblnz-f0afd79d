import { ASSEMBL_WARM_GREY } from '@/components/assembl/chrome';
import {
  integrationInnerRing,
  integrationOuterRing,
  integrationRollout,
  integrationRolloutNote,
  type IntegrationNode,
} from '@/lib/customers/aironaut/money-data';

/**
 * Integration map — redesigned 2026-07-04 after Kate's "confusing and not in
 * line" feedback on the concentric-ring version.
 *
 * Shape: the official AIRONAUT mark big and centred, "customs broker." under
 * it in Cormorant lowercase, then two gently-arced horizontal rows — the six
 * daily read/write tools ABOVE, the seven read-only signal sources BELOW.
 * Thin navy lines (30% opacity, one slow uniform pulse) tie every node back
 * to the mark. No hover popovers: each node carries a permanent one-line
 * caption. Node icons are uniform 32px navy squares — no per-brand tints.
 * Labels are Space Mono 10px uppercase, the canonical assembl micro-label.
 * Pure SVG, no client state.
 */

const W = 1200;
const H = 720;
const CX = W / 2;
const CY = 356;
const NODE = 16; // half-size of the 32px node square

/** Display overrides: tight uppercase labels + short permanent captions. */
const DISPLAY: Record<string, { label: string; caption: string[] }> = {
  outlook: { label: 'OUTLOOK', caption: ['reads: inbound email', 'writes: draft replies'] },
  xero: { label: 'XERO', caption: ['reads: invoices + ledger', 'writes: draft invoices'] },
  bank: { label: 'BANK FEED', caption: ['reads: payments landing', 'read only'] },
  whatsapp: { label: 'WHATSAPP', caption: ['reads: customer messages', 'writes: draft chases'] },
  cusmod: { label: 'CUSMOD + EDI', caption: ['reads: entry status', 'writes: draft entries'] },
  docs: { label: 'DROPBOX', caption: ['reads: shipping docs', 'writes: filed paperwork'] },
  tariff: { label: 'NZ CUSTOMS TARIFF', caption: ['codes + duty rates, daily'] },
  companies: { label: 'COMPANIES OFFICE', caption: ['directors + credit scores'] },
  shipping: { label: 'MAERSK · MSC', caption: ['container tracking'] },
  aircargo: { label: 'CATHAY CARGO', caption: ['air waybill tracking'] },
  mpi: { label: 'MPI', caption: ['biosecurity directions'] },
  nzta: { label: 'NZTA', caption: ['vehicle import rules'] },
  ird: { label: 'IRD', caption: ['public red flags'] },
};

type Placed = IntegrationNode & {
  x: number;
  y: number;
  row: 'tools' | 'signals';
  label: string;
  caption: string[];
};

/** Evenly space a row with a gentle arc bowing away from the centre mark. */
const placeRow = (
  nodes: IntegrationNode[],
  baseY: number,
  bow: number,
  row: 'tools' | 'signals',
): Placed[] => {
  const margin = 110;
  const span = W - margin * 2;
  const mid = (nodes.length - 1) / 2;
  return nodes.map((n, i) => {
    const t = mid === 0 ? 0 : (i - mid) / mid; // -1 … 1 across the row
    const d = DISPLAY[n.id] ?? { label: n.label.toUpperCase(), caption: [n.reads] };
    return {
      ...n,
      ...d,
      x: margin + (nodes.length === 1 ? span / 2 : (span / (nodes.length - 1)) * i),
      y: baseY + bow * (1 - t * t),
      row,
    };
  });
};

// GWL rides along inside the wine service line — Kate's list for this diagram
// is the seven public signal sources.
const signalsSource = integrationOuterRing.filter((n) => n.id !== 'gwl');

const tools = placeRow(integrationInnerRing, 132, -26, 'tools');
const signals = placeRow(signalsSource, 596, 26, 'signals');
const ALL = [...tools, ...signals];

const MONO = "var(--font-mono), 'Space Mono', ui-monospace, monospace";
const SERIF = "var(--font-display), 'Cormorant Garamond', Georgia, serif";
const NAVY = '#0B1F3A';
const STEEL = '#6E8FB3';

/**
 * Phone spec (Kate, 2026-07-04): mark 80px centred, then two stacked card
 * lists. Tool name in Cormorant 18px lowercase; plain-English sub-line in
 * Space Mono 10px uppercase tracked, champagne gold. Icons (24px navy chips)
 * on the daily-tools cards only, per the sketch. No rings, no hover, no
 * letter-only nodes.
 */
const MOBILE_TOOLS: { glyph: string; name: string; sub: string }[] = [
  { glyph: 'O', name: 'outlook', sub: 'reads: emails · writes: drafts' },
  { glyph: 'X', name: 'xero', sub: 'reads: bills · writes: invoices' },
  { glyph: '$', name: 'bank feed', sub: 'reads: payments · writes: nothing' },
  { glyph: 'W', name: 'whatsapp + sms', sub: 'reads: replies · writes: drafts' },
  { glyph: 'C', name: 'cusmod + edi', sub: 'reads: shipment data · writes: drafts' },
  { glyph: 'D', name: 'dropbox / sharepoint', sub: 'reads: docs · writes: nothing' },
];

const MOBILE_SIGNALS: { name: string; sub: string }[] = [
  { name: 'nz customs working tariff', sub: 'live daily ingest' },
  { name: 'companies office + illion', sub: 'credit checks' },
  { name: 'maersk · msc · cma cgm', sub: 'container tracking' },
  { name: 'cathay + emirates skycargo', sub: 'air freight' },
  { name: 'mpi biosecurity', sub: 'perishables' },
  { name: 'nzta', sub: 'vehicle imports' },
  { name: 'global wine logistics', sub: 'wine partner' },
  { name: 'ird tax-debt register', sub: 'red flags' },
];

function MobileCardList({
  cards,
}: {
  cards: { glyph?: string; name: string; sub: string }[];
}) {
  return (
    <div className="divide-y divide-black/10 rounded-xl border border-black/10 bg-white/90">
      {cards.map((c) => (
        <div key={c.name} className="flex items-center gap-3 px-4 py-3">
          {c.glyph ? (
            <span
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[12px] font-bold text-white"
              style={{ fontFamily: MONO, backgroundColor: NAVY }}
            >
              {c.glyph}
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="text-[18px] leading-snug" style={{ fontFamily: SERIF, color: '#1F1D1A' }}>
              {c.name}
            </p>
            <p
              className="text-[12px] uppercase leading-[1.4]"
              style={{ fontFamily: MONO, letterSpacing: '0.16em', color: '#BFA37A' }}
            >
              {c.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function IntegrationMap() {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/85 p-5 backdrop-blur-sm">
      <p className="text-[12px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>
        the wiring — what it reads, what it writes
      </p>

      {/* Phone layout — stacked card lists, no ring (Kate, 2026-07-04). */}
      <div className="mt-4 md:hidden">
        <div className="flex flex-col items-center">
          <span
            className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-white"
            style={{ border: '2px solid #BFA37A' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/aironaut/logo-mark-official.png" alt="AIRONAUT" className="h-16 w-16 rounded-full object-contain" />
          </span>
          <p className="mt-2 text-xl" style={{ fontFamily: SERIF, color: '#1F1D1A' }}>
            customs broker<span style={{ color: '#BFA37A' }}>.</span>
          </p>
        </div>

        <p
          className="mt-5 text-[12px] font-bold uppercase"
          style={{ fontFamily: MONO, letterSpacing: '0.2em', color: NAVY }}
        >
          READS + WRITES DAILY
        </p>
        <div className="mt-2">
          <MobileCardList cards={MOBILE_TOOLS} />
        </div>

        <p
          className="mt-6 text-[12px] font-bold uppercase"
          style={{ fontFamily: MONO, letterSpacing: '0.2em', color: STEEL }}
        >
          SIGNAL SOURCES · READ ONLY
        </p>
        <div className="mt-2">
          <MobileCardList cards={MOBILE_SIGNALS} />
        </div>
      </div>

      <div className="relative mt-2 hidden overflow-x-auto md:block">
        <div className="relative mx-auto min-w-[760px] max-w-[1200px]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label="Integration map: the AIRONAUT customs-broker agent connected to six daily tools above and seven read-only signal sources below"
          >
            <style>{`
              @keyframes airoMapFlow { to { stroke-dashoffset: -14; } }
              .airo-map-line { animation: airoMapFlow 6s linear infinite; }
              @media (prefers-reduced-motion: reduce) {
                .airo-map-line { animation: none; }
              }
            `}</style>

            {/* Connection lines — thin navy, uniform slow pulse, behind everything */}
            {ALL.map((n) => {
              const dx = n.x - CX;
              const dy = n.y - CY;
              const len = Math.hypot(dx, dy);
              const sx = CX + (dx / len) * 92;
              const sy = CY + (dy / len) * 92;
              const ex = n.x - (dx / len) * (NODE + 10);
              const ey = n.y - (dy / len) * (NODE + 10);
              return (
                <line
                  key={`line-${n.id}`}
                  x1={sx}
                  y1={sy}
                  x2={ex}
                  y2={ey}
                  stroke={NAVY}
                  strokeOpacity={0.3}
                  strokeWidth={1}
                  strokeDasharray="2 5"
                  className="airo-map-line"
                />
              );
            })}

            {/* Row section labels */}
            <text x={CX} y={44} textAnchor="middle" fontSize="11" letterSpacing="3" fill={NAVY} fillOpacity={0.75} style={{ fontFamily: MONO }}>
              READS + WRITES DAILY
            </text>
            <text x={CX} y={H - 14} textAnchor="middle" fontSize="11" letterSpacing="3" fill={STEEL} style={{ fontFamily: MONO }}>
              SIGNAL SOURCES · READ ONLY
            </text>

            {/* The centre — official mark on the champagne assembl ring. The
                mark PNG has a square white ground; clip it circular so it
                melts into the ring fill. */}
            <circle cx={CX} cy={CY} r={86} fill="#FFFFFF" stroke="#BFA37A" strokeWidth="2.5" />
            <clipPath id="airo-mark-clip">
              <circle cx={CX} cy={CY} r={84} />
            </clipPath>
            <image
              href="/brand/aironaut/logo-mark-official.png"
              x={CX - 60}
              y={CY - 60}
              width="120"
              height="120"
              clipPath="url(#airo-mark-clip)"
              aria-label="AIRONAUT"
            />
            <text x={CX} y={CY + 118} textAnchor="middle" fontSize="26" fill="#1F1D1A" style={{ fontFamily: SERIF }}>
              customs broker<tspan fill="#BFA37A">.</tspan>
            </text>

            {/* Nodes — uniform 32px navy squares, label + permanent caption */}
            {ALL.map((n) => {
              const isTools = n.row === 'tools';
              const labelY = n.y + NODE + 18;
              const captionStartY = labelY + 14;
              return (
                <g key={n.id}>
                  <rect
                    x={n.x - NODE}
                    y={n.y - NODE}
                    width={NODE * 2}
                    height={NODE * 2}
                    rx="7"
                    fill={isTools ? NAVY : '#FFFFFF'}
                    stroke={NAVY}
                    strokeOpacity={isTools ? 1 : 0.55}
                    strokeWidth="1.5"
                  />
                  <text
                    x={n.x}
                    y={n.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="13"
                    fontWeight="700"
                    fill={isTools ? '#FFFFFF' : NAVY}
                    style={{ fontFamily: MONO }}
                  >
                    {n.glyph}
                  </text>
                  <text
                    x={n.x}
                    y={labelY}
                    textAnchor="middle"
                    fontSize="10"
                    letterSpacing="1.5"
                    fontWeight="700"
                    fill="#1A1918"
                    style={{ fontFamily: MONO }}
                  >
                    {n.label}
                  </text>
                  {n.caption.map((line, i) => (
                    <text
                      key={i}
                      x={n.x}
                      y={captionStartY + i * 12}
                      textAnchor="middle"
                      fontSize="9.5"
                      fill="#6B6459"
                      style={{ fontFamily: MONO }}
                    >
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Rollout stagger */}
      <div className="mt-4 rounded-xl border border-black/10 bg-white p-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[12px]" style={{ color: '#3E3C36' }}>
          {integrationRollout.map((r, i) => (
            <span key={r.week} className="flex items-center gap-2">
              {i > 0 ? <span style={{ color: ASSEMBL_WARM_GREY }}>·</span> : null}
              <span>
                <span className="font-semibold">{r.week}:</span> {r.items}
              </span>
            </span>
          ))}
        </div>
        <p className="mt-1.5 text-[12px]" style={{ color: ASSEMBL_WARM_GREY }}>
          {integrationRolloutNote}
        </p>
      </div>
    </div>
  );
}
