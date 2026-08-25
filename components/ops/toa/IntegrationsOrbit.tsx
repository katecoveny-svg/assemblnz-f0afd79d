'use client';

import { useState } from 'react';
import type { OrbitTool } from '@/lib/customers/toa-architects/demo-data';
import { toaTriangleField } from '@/components/ops/toa/ArcHeroBand';

/**
 * IntegrationsOrbit — the hero-level "operating system" picture.
 *
 * TOA sits in the middle; ARC is the champagne ring around it; every tool the
 * practice already uses floats on one of two orbits:
 *   tier 1 (inner, solid champagne pulse)  — ARC reads AND writes daily
 *   tier 2 (outer, dashed sage, read-only) — signal sources: portals,
 *                                            registers, the Code itself
 *
 * Hover a node for the plain-English "reads / writes" summary. Pulses respect
 * prefers-reduced-motion. Node marks are our own monograms — no third-party
 * logo assets shipped.
 */
const CHAMPAGNE = '#bfa37a';
// Tier-2 lines/chips: warm neutral grey — deliberately NOT green (green
// belongs to Kate's BIM-viewer palette only, per 2026-07-04 direction).
const NEUTRAL = '#a09c92';

const VB_W = 1000;
const VB_H = 640;
const CX = VB_W / 2;
const CY = VB_H / 2;
const RING_R = 88;

type Placed = OrbitTool & { x: number; y: number; delay: number };

function place(tools: OrbitTool[]): Placed[] {
  const t1 = tools.filter((t) => t.tier === 1);
  const t2 = tools.filter((t) => t.tier === 2);
  const pos = (list: OrbitTool[], rx: number, ry: number, startDeg: number) =>
    list.map((tool, i) => {
      const a = ((startDeg + (360 / list.length) * i) * Math.PI) / 180;
      return {
        ...tool,
        x: CX + rx * Math.cos(a),
        y: CY + ry * Math.sin(a),
        delay: i * 0.45,
      };
    });
  // Inner orbit starts at the top; outer offset so nodes interleave.
  return [...pos(t1, 295, 148, -90), ...pos(t2, 425, 245, -77)];
}

export function IntegrationsOrbit({ tools }: { tools: OrbitTool[] }) {
  const [active, setActive] = useState<Placed | null>(null);
  const placed = place(tools);

  return (
    <section
      aria-label="What ARC connects to"
      className="relative overflow-hidden rounded-2xl"
      style={{ backgroundColor: '#161516', ...toaTriangleField }}
    >
      <style>{`
        @keyframes orbit-pulse { to { stroke-dashoffset: -26; } }
        .orbit-line { animation: orbit-pulse 1.6s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .orbit-line { animation: none; } }
      `}</style>

      <div className="flex flex-wrap items-baseline justify-between gap-2 px-6 pt-6 md:px-8">
        <h2 className="font-[family-name:var(--font-brand-display)] text-sm font-semibold uppercase tracking-[0.18em] text-white">
          One brain, plugged into the tools you already use
        </h2>
        <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
          hover any tool · concept — nothing is connected in this demo
        </span>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="block w-full"
          role="img"
          aria-label="Map of the tools ARC reads and writes for TOA"
        >
          {/* connection lines — under everything */}
          {placed.map((t) => (
            <line
              key={`l-${t.id}`}
              className="orbit-line"
              x1={CX}
              y1={CY}
              x2={t.x}
              y2={t.y}
              stroke={t.tier === 1 ? CHAMPAGNE : NEUTRAL}
              strokeOpacity={active && active.id !== t.id ? 0.12 : t.tier === 1 ? 0.55 : 0.3}
              strokeWidth={t.tier === 1 ? 1.6 : 1}
              strokeDasharray={t.tier === 1 ? '7 6' : '2 6'}
              style={{ animationDelay: `${t.delay}s` }}
            />
          ))}

          {/* ARC ring */}
          <circle
            cx={CX}
            cy={CY}
            r={RING_R}
            fill="#161516"
            stroke={CHAMPAGNE}
            strokeWidth="1.6"
            strokeDasharray="3 5"
          />
          <text
            x={CX}
            y={CY + RING_R + 22}
            textAnchor="middle"
            fill={CHAMPAGNE}
            style={{ fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase' }}
          >
            ARC · reads · drafts · chases · files
          </text>

          {/* TOA centre */}
          <rect x={CX - 66} y={CY - 40} width={132} height={80} rx={10} fill="#0b1f3a" stroke={`${CHAMPAGNE}80`} />
          <text x={CX} y={CY - 6} textAnchor="middle" fill="#fff" style={{ fontSize: 26, letterSpacing: '0.28em', fontFamily: 'var(--font-brand-display)' }}>
            TOA
          </text>
          <text x={CX} y={CY + 16} textAnchor="middle" fill="rgba(255,255,255,0.7)" style={{ fontSize: 12, letterSpacing: '0.34em' }}>
            ARCHITECTS
          </text>

          {/* tool nodes */}
          {placed.map((t) => {
            const w = t.tier === 1 ? 168 : 158;
            const h = t.tier === 1 ? 42 : 36;
            const dim = active !== null && active.id !== t.id;
            return (
              <g
                key={t.id}
                transform={`translate(${t.x - w / 2}, ${t.y - h / 2})`}
                onMouseEnter={() => setActive(t)}
                onMouseLeave={() => setActive(null)}
                style={{ cursor: 'default', opacity: dim ? 0.35 : 1, transition: 'opacity 160ms' }}
              >
                <rect
                  width={w}
                  height={h}
                  rx={h / 2}
                  fill={t.tier === 1 ? 'rgba(191,163,122,0.13)' : 'rgba(255,255,255,0.05)'}
                  stroke={t.tier === 1 ? `${CHAMPAGNE}88` : 'rgba(255,255,255,0.18)'}
                  strokeDasharray={t.tier === 1 ? undefined : '3 3'}
                />
                <rect x={7} y={(h - 24) / 2} width={24} height={24} rx={6} fill="#0b1f3a" stroke={`${CHAMPAGNE}55`} />
                <text x={19} y={h / 2 + 3.5} textAnchor="middle" fill={CHAMPAGNE} style={{ fontSize: 12, fontWeight: 700 }}>
                  {t.mark}
                </text>
                <text x={38} y={h / 2 + 4} fill="#fff" style={{ fontSize: t.tier === 1 ? 12.5 : 11.5 }}>
                  {t.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* hover summary */}
        {active ? (
          <div
            className="pointer-events-none absolute z-10 w-60 rounded-xl border px-4 py-3 text-[12px] leading-relaxed"
            style={{
              left: `calc(${(active.x / VB_W) * 100}% - 120px)`,
              top: `calc(${(active.y / VB_H) * 100}% + 26px)`,
              backgroundColor: '#1f1e1f',
              borderColor: `${CHAMPAGNE}55`,
              color: '#fff',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          >
            <p className="mb-1 font-semibold">{active.name}</p>
            <p>
              <span style={{ color: CHAMPAGNE }}>reads:</span> {active.reads}
            </p>
            {active.writes ? (
              <p>
                <span style={{ color: CHAMPAGNE }}>writes:</span> {active.writes}
              </p>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.55)' }}>signal source — read-only</p>
            )}
          </div>
        ) : null}
      </div>

      {/* legend */}
      <div className="flex flex-wrap items-center gap-5 px-6 pb-5 md:px-8 text-[12px]">
        <span className="inline-flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
          <span aria-hidden className="inline-block h-0 w-7 border-t-2" style={{ borderColor: CHAMPAGNE, borderStyle: 'dashed' }} />
          reads + writes daily — drafts always wait for your yes
        </span>
        <span className="inline-flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
          <span aria-hidden className="inline-block h-0 w-7 border-t" style={{ borderColor: NEUTRAL, borderStyle: 'dotted' }} />
          signal sources — read-only
        </span>
      </div>
    </section>
  );
}
