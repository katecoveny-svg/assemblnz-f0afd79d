'use client';

import { useState } from 'react';
import { ASSEMBL_WARM_GREY } from '@/components/assembl/chrome';
import {
  integrationInnerRing,
  integrationOuterRing,
  integrationRollout,
  integrationRolloutNote,
  type IntegrationNode,
} from '@/lib/customers/aironaut/money-data';

/**
 * Integration map — two concentric rings around the AIRONAUT mark. Inner
 * ring: the tools the OS reads and writes every day (Outlook, Xero, bank
 * feed, WhatsApp/SMS, CusMod/CargoWise + EDI, Dropbox/SharePoint). Outer
 * ring: read-only signal sources (Working Tariff, credit bureaux, shipping
 * lines, air cargo, MPI, NZTA, GWL, IRD). Hover or tap a node for a
 * plain-English "reads · writes" summary.
 *
 * The champagne-gold ring is the assembl OS layer (per-integration
 * reads/writes descriptions carried over from the legacy IntegrationHub).
 * Pure SVG — no WebGL.
 */

const W = 1000;
const H = 660;
const CX = W / 2;
const CY = 316;

type Placed = IntegrationNode & { x: number; y: number; ring: 'inner' | 'outer' };

const place = (
  nodes: IntegrationNode[],
  rx: number,
  ry: number,
  startDeg: number,
  ring: 'inner' | 'outer',
): Placed[] =>
  nodes.map((n, i) => {
    const a = ((startDeg + (360 / nodes.length) * i) * Math.PI) / 180;
    return { ...n, x: CX + rx * Math.cos(a), y: CY + ry * Math.sin(a), ring };
  });

const inner = place(integrationInnerRing, 235, 150, -90, 'inner');
const outer = place(integrationOuterRing, 372, 245, -67.5, 'outer');
const ALL = [...inner, ...outer];

/** Split a label into at most two SVG lines. */
const labelLines = (label: string): string[] => {
  if (label.length <= 16) return [label];
  const words = label.split(' ');
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
};

export function IntegrationMap() {
  const [active, setActive] = useState<Placed | null>(null);

  return (
    <div className="rounded-2xl border border-black/10 bg-white/85 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-[10px] uppercase" style={{ letterSpacing: '0.16em', color: ASSEMBL_WARM_GREY }}>
          the wiring — what it reads, what it writes
        </p>
        <span className="text-[11px]" style={{ color: ASSEMBL_WARM_GREY }}>
          hover a tool for the detail
        </span>
      </div>

      <div className="relative mt-2 overflow-x-auto">
        <div className="relative mx-auto min-w-[720px] max-w-[1000px]">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label="Integration map: the AIRONAUT operating system connected to daily tools on an inner ring and read-only signal sources on an outer ring"
          >
            <style>{`
              @keyframes airoDashFlow { to { stroke-dashoffset: -24; } }
              .airo-pulse { animation: airoDashFlow 2.8s linear infinite; }
              .airo-pulse-slow { animation: airoDashFlow 5.5s linear infinite; }
              @media (prefers-reduced-motion: reduce) {
                .airo-pulse, .airo-pulse-slow { animation: none; }
              }
            `}</style>

            {/* Orbit guides */}
            <ellipse cx={CX} cy={CY} rx={235} ry={150} fill="none" stroke="#0B1F3A" strokeOpacity="0.12" strokeDasharray="2 6" />
            <ellipse cx={CX} cy={CY} rx={372} ry={245} fill="none" stroke="#0B1F3A" strokeOpacity="0.08" strokeDasharray="2 6" />

            {/* Inner ring — pulsing gold, reads + writes */}
            {inner.map((n) => (
              <line
                key={`l-${n.id}`}
                x1={CX}
                y1={CY}
                x2={n.x}
                y2={n.y}
                stroke="#BFA37A"
                strokeWidth={active?.id === n.id ? 2.2 : 1.4}
                strokeOpacity={active && active.id !== n.id ? 0.25 : 0.75}
                strokeDasharray="5 7"
                className="airo-pulse"
              />
            ))}
            {/* Outer ring — read-only, slower and fainter */}
            {outer.map((n) => (
              <line
                key={`l-${n.id}`}
                x1={CX}
                y1={CY}
                x2={n.x}
                y2={n.y}
                stroke="#6E8FB3"
                strokeWidth={active?.id === n.id ? 1.8 : 1}
                strokeOpacity={active && active.id !== n.id ? 0.18 : 0.45}
                strokeDasharray="3 9"
                className="airo-pulse-slow"
              />
            ))}

            {/* The assembl OS ring — champagne gold */}
            <circle cx={CX} cy={CY} r={104} fill="#FCFBF8" fillOpacity="0.92" stroke="#BFA37A" strokeWidth="3" />
            <circle cx={CX} cy={CY} r={92} fill="none" stroke="#BFA37A" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="1 5" />

            {/* AIRONAUT mark at the centre — on white, per the brand rule */}
            <circle cx={CX} cy={CY} r={62} fill="#fff" stroke="rgba(0,0,0,0.06)" />
            <image
              href="/brand/aironaut/logo-circular-mark.png"
              x={CX - 46}
              y={CY - 46}
              width="92"
              height="92"
              aria-label="AIRONAUT"
            />
            <text
              x={CX}
              y={CY + 132}
              textAnchor="middle"
              fontSize="13"
              fontWeight="600"
              fill="#8A7350"
              letterSpacing="2"
            >
              CUSTOMS BROKER
            </text>

            {/* Nodes */}
            {ALL.map((n) => {
              const lines = labelLines(n.label);
              const r = n.ring === 'inner' ? 24 : 20;
              return (
                <g
                  key={n.id}
                  onMouseEnter={() => setActive(n)}
                  onMouseLeave={() => setActive(null)}
                  onClick={() => setActive(active?.id === n.id ? null : n)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={r}
                    fill="#fff"
                    stroke={n.tint}
                    strokeWidth={active?.id === n.id ? 3 : 2}
                  />
                  <text
                    x={n.x}
                    y={n.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={n.ring === 'inner' ? 15 : 12}
                    fontWeight="700"
                    fill={n.tint}
                  >
                    {n.glyph}
                  </text>
                  {lines.map((line, i) => (
                    <text
                      key={i}
                      x={n.x}
                      y={n.y + r + 15 + i * 13}
                      textAnchor="middle"
                      fontSize="11.5"
                      fontWeight={n.ring === 'inner' ? 600 : 400}
                      fill="#1A1918"
                      fillOpacity={n.ring === 'inner' ? 0.9 : 0.7}
                    >
                      {line}
                    </text>
                  ))}
                </g>
              );
            })}
          </svg>

          {/* Popover — plain-English reads/writes for the active node */}
          {active ? (
            <div
              className="pointer-events-none absolute z-10 w-56 rounded-xl border border-black/10 bg-white p-3 shadow-lg"
              style={{
                left: `${(active.x / W) * 100}%`,
                top: `${((active.y - 30) / H) * 100}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              <p className="text-xs font-semibold">{active.label}</p>
              <p className="mt-1 text-[11px] leading-snug" style={{ color: '#3E3C36' }}>
                <span className="font-medium">reads:</span> {active.reads}
              </p>
              <p className="mt-0.5 text-[11px] leading-snug" style={{ color: '#3E3C36' }}>
                <span className="font-medium">writes:</span> {active.writes}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-[11px]" style={{ color: ASSEMBL_WARM_GREY }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-6" style={{ backgroundColor: '#BFA37A' }} />
          inner ring — reads and writes daily
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-6" style={{ backgroundColor: '#6E8FB3' }} />
          outer ring — signal sources, read only
        </span>
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
        <p className="mt-1.5 text-[11px]" style={{ color: ASSEMBL_WARM_GREY }}>
          {integrationRolloutNote}
        </p>
      </div>
    </div>
  );
}
