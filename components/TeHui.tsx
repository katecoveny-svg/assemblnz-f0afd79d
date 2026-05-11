'use client';

/**
 * Te Hui — the gathering.
 *
 * A live 2D visualisation of the 46 specialist agents arranged as pou
 * whenua / standing-stones in a circle, with Iho (the governed router)
 * at the centre. Lines of soft-gold light flow between the centre and
 * the outer ring as work is handed off — the visual equivalent of
 * "Kahu → Iho → Tā → Mana".
 *
 * Spec: voyage-evidence-craft.md follow-up / future-of-meaningful-work
 * thread.
 *
 * Implementation:
 *   - 100% SVG + framer-motion (no react-three-fiber dependency).
 *   - Deterministic placement: each agent gets a fixed angle on the ring
 *     so the visualisation reads the same way across reloads.
 *   - Activity is procedurally generated for the marketing surface; a
 *     production drop-in would source it from the reasoning_traces feed.
 */

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AGENTS } from '@/lib/agents';
import { KETES } from '@/lib/kete';

interface TeHuiProps {
  /** Diameter in px. Component is square; mobile shrinks via container. */
  size?: number;
  /** Show the kete-coloured backing wedges. Default true. */
  showWedges?: boolean;
  /** Show the inner labels under each pou. Default true. */
  showLabels?: boolean;
  /** Show the procedurally-animated handoff lines. Default true. */
  showHandoffs?: boolean;
}

interface RingPoint {
  agent: (typeof AGENTS)[number];
  angle: number;
  x: number;
  y: number;
  keteIndex: number;
  accent: string;
}

const PALETTE = {
  paper: '#FAF7F2',
  ink: '#23211F',
  inkSecondary: '#5C5852',
  inkTertiary: '#8E8A82',
  pounamu: '#2B6B57',
  softGold: '#D9BC7A',
};

export function TeHui({
  size = 720,
  showWedges = true,
  showLabels = true,
  showHandoffs = true,
}: TeHuiProps) {
  const ring = useMemo(() => layoutRing(size), [size]);
  const keteAccents = useMemo(() => {
    const m: Record<string, string> = {};
    for (const k of KETES) m[k.slug] = k.accent ?? PALETTE.pounamu;
    return m;
  }, []);

  const cx = size / 2;
  const cy = size / 2;
  const ringR = size * 0.42;
  const innerR = size * 0.10;

  // Compute the wedge spans per kete (grouped by adjacency in AGENTS order).
  const wedges = useMemo(() => groupWedges(ring), [ring]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      height="100%"
      role="img"
      aria-label="Te Hui — the gathering. The 46 Assembl agents arranged around Iho, the governed router."
      style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
    >
      <defs>
        <radialGradient id="te-hui-paper" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#FFFEFB" />
          <stop offset="85%" stopColor="#FAF7F2" />
          <stop offset="100%" stopColor="#ECE6DC" />
        </radialGradient>
        <radialGradient id="te-hui-iho" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D9BC7A" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#D9BC7A" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#D9BC7A" stopOpacity="0" />
        </radialGradient>
        <filter id="te-hui-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      {/* Paper backing */}
      <rect width={size} height={size} fill="url(#te-hui-paper)" />

      {/* Kete-coloured wedges */}
      {showWedges &&
        wedges.map((w, i) => (
          <path
            key={`wedge-${i}`}
            d={describeWedge(cx, cy, ringR + size * 0.04, w.startAngle, w.endAngle)}
            fill={keteAccents[w.kete] ?? PALETTE.pounamu}
            opacity={0.06}
          />
        ))}

      {/* Subtle guide ring */}
      <circle
        cx={cx}
        cy={cy}
        r={ringR}
        fill="none"
        stroke={PALETTE.inkTertiary}
        strokeOpacity={0.18}
        strokeWidth={0.5}
        strokeDasharray="2 4"
      />

      {/* Handoff lines — animated procedurally */}
      {showHandoffs && (
        <g style={{ mixBlendMode: 'normal' }}>
          {ring.slice(0, 8).map((p, i) => (
            <Handoff
              key={`handoff-${i}`}
              cx={cx}
              cy={cy}
              tx={p.x}
              ty={p.y}
              delay={i * 0.6}
            />
          ))}
        </g>
      )}

      {/* Iho — centre seal */}
      <circle cx={cx} cy={cy} r={innerR * 1.8} fill="url(#te-hui-iho)" />
      <circle
        cx={cx}
        cy={cy}
        r={innerR}
        fill={PALETTE.paper}
        stroke={PALETTE.pounamu}
        strokeWidth={1.2}
        strokeOpacity={0.65}
      />
      <SparkleMark cx={cx} cy={cy} r={innerR * 0.6} />
      <text
        x={cx}
        y={cy + innerR + 22}
        textAnchor="middle"
        fontFamily="'Cormorant Garamond', Georgia, serif"
        fontSize={size * 0.022}
        fontStyle="italic"
        fill={PALETTE.ink}
      >
        Iho
      </text>
      <text
        x={cx}
        y={cy + innerR + 36}
        textAnchor="middle"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize={size * 0.013}
        letterSpacing={2.4}
        textTransform="uppercase"
        fill={PALETTE.inkTertiary}
      >
        The governed router
      </text>

      {/* Outer pou ring */}
      {ring.map((p, i) => (
        <Pou
          key={p.agent.slug}
          point={p}
          size={size}
          accent={keteAccents[p.agent.kete] ?? PALETTE.pounamu}
          delay={i * 0.04}
          showLabel={showLabels}
        />
      ))}
    </svg>
  );
}

// ─── Pou (standing stone) for each agent ─────────────────────────────────

function Pou({
  point,
  size,
  accent,
  delay,
  showLabel,
}: {
  point: RingPoint;
  size: number;
  accent: string;
  delay: number;
  showLabel: boolean;
}) {
  const r = size * 0.014;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.circle
        cx={point.x}
        cy={point.y}
        r={r}
        fill={PALETTE.paper}
        stroke={accent}
        strokeWidth={1.5}
        animate={{ r: [r, r * 1.15, r], opacity: [0.95, 1, 0.95] }}
        transition={{
          duration: 4 + (point.angle % 1.2),
          repeat: Infinity,
          ease: 'easeInOut',
          delay: (point.angle * 5) % 3,
        }}
      />
      {showLabel && (
        <text
          x={point.x}
          y={point.y + r * 2.8}
          textAnchor={labelAnchor(point.angle)}
          fontFamily="'IBM Plex Mono', monospace"
          fontSize={size * 0.011}
          letterSpacing={1.2}
          fill={PALETTE.inkSecondary}
          opacity={0.78}
          style={{ textTransform: 'lowercase' }}
        >
          {point.agent.slug}
        </text>
      )}
    </motion.g>
  );
}

// ─── Handoff — soft-gold pulse from centre to one pou ────────────────────

function Handoff({
  cx,
  cy,
  tx,
  ty,
  delay,
}: {
  cx: number;
  cy: number;
  tx: number;
  ty: number;
  delay: number;
}) {
  return (
    <motion.line
      x1={cx}
      y1={cy}
      x2={tx}
      y2={ty}
      stroke={PALETTE.softGold}
      strokeWidth={0.8}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: [0, 1, 1], opacity: [0, 0.55, 0] }}
      transition={{
        duration: 3.2,
        delay,
        repeat: Infinity,
        repeatDelay: 1.8,
        ease: 'easeInOut',
      }}
    />
  );
}

// ─── Sparkle mark — the soft-gold four-pointed star ──────────────────────

function SparkleMark({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g transform={`translate(${cx - r} ${cy - r}) scale(${(r * 2) / 48})`}>
      <path
        d="M24 2 L26.5 21.5 L46 24 L26.5 26.5 L24 46 L21.5 26.5 L2 24 L21.5 21.5 Z"
        fill={PALETTE.softGold}
      />
      <circle cx="24" cy="24" r="1.6" fill={PALETTE.paper} />
    </g>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────

function layoutRing(size: number): RingPoint[] {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  const n = AGENTS.length;

  // Group agents by kete so adjacent agents share a wedge.
  const byKete = AGENTS.slice().sort((a, b) =>
    a.kete === b.kete ? a.slug.localeCompare(b.slug) : a.kete.localeCompare(b.kete),
  );

  return byKete.map((agent, i) => {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    return {
      agent,
      angle,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      keteIndex: KETES.findIndex((k) => k.slug === agent.kete),
      accent: '',
    };
  });
}

function groupWedges(ring: RingPoint[]): Array<{
  kete: string;
  startAngle: number;
  endAngle: number;
}> {
  if (ring.length === 0) return [];
  const out: Array<{ kete: string; startAngle: number; endAngle: number }> = [];
  let cur = { kete: ring[0].agent.kete, startAngle: ring[0].angle, endAngle: ring[0].angle };
  for (let i = 1; i < ring.length; i++) {
    if (ring[i].agent.kete === cur.kete) {
      cur.endAngle = ring[i].angle;
    } else {
      out.push(cur);
      cur = { kete: ring[i].agent.kete, startAngle: ring[i].angle, endAngle: ring[i].angle };
    }
  }
  out.push(cur);
  // Pad each wedge by half a slot for a visible band.
  const step = (Math.PI * 2) / ring.length;
  return out.map((w) => ({
    kete: w.kete,
    startAngle: w.startAngle - step / 2,
    endAngle: w.endAngle + step / 2,
  }));
}

function describeWedge(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const large = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

function labelAnchor(angle: number): 'start' | 'middle' | 'end' {
  // Bottom half → middle. Right side → start. Left side → end.
  const deg = ((angle * 180) / Math.PI + 360) % 360;
  if (deg > 60 && deg < 120) return 'middle';
  if (deg > 240 && deg < 300) return 'middle';
  if (deg >= 120 && deg <= 240) return 'end';
  return 'start';
}
