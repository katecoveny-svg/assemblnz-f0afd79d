'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ASSEMBL_WARM_GREY } from '@/components/assembl/chrome';
import {
  cashflowHeadline,
  cashflowSqueeze,
  cashflowWeeks,
} from '@/lib/customers/aironaut/money-data';

const STATUS_COLOURS = {
  positive: '#2E6B34',
  tight: '#C8622A',
  exposed: '#8F2D2D',
} as const;

/**
 * Cashflow exposure — week-by-week net position against the Customs
 * deferred account (per-week drivers carried over from the legacy
 * CashFlowTimeline). Click a bar to see what's driving it. Sample
 * numbers, shaped like a real brokerage month.
 */
export function CashflowExposure({ accent }: { accent: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const maxAbs = Math.max(...cashflowWeeks.map((w) => Math.abs(w.netK)));

  return (
    <div className="rounded-2xl border border-black/10 bg-white/85 p-6 backdrop-blur-sm">
      {/* Squeeze warning */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-4"
        style={{ borderLeft: '4px solid #8F2D2D' }}
      >
        <p className="text-sm" style={{ color: '#3E3C36' }}>
          {cashflowSqueeze.line}
        </p>
        <Link
          href={cashflowSqueeze.href}
          className="rounded-full px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white transition hover:opacity-90"
          style={{ backgroundColor: accent }}
        >
          {cashflowSqueeze.cta}
        </Link>
      </div>

      {/* Week-by-week bars */}
      <div className="mt-6">
        <div className="grid grid-cols-6 items-end gap-2" style={{ height: 200 }}>
          {cashflowWeeks.map((w, i) => {
            const h = Math.max(14, (Math.abs(w.netK) / maxAbs) * 165);
            const isSel = selected === i;
            return (
              <button
                key={w.label}
                type="button"
                onClick={() => setSelected(isSel ? null : i)}
                className="group flex h-full flex-col items-center justify-end gap-1"
                aria-pressed={isSel}
                aria-label={`${w.label}: ${w.netK >= 0 ? 'plus' : 'minus'} $${Math.abs(w.netK)}k`}
              >
                <span className="text-[12px] font-semibold" style={{ color: STATUS_COLOURS[w.status] }}>
                  {w.netK >= 0 ? '+' : '−'}${Math.abs(w.netK)}k
                </span>
                <span
                  className="w-full rounded-t-md transition-all group-hover:opacity-90"
                  style={{
                    height: h,
                    backgroundColor: STATUS_COLOURS[w.status],
                    outline: isSel ? '2px solid #1A1918' : 'none',
                    outlineOffset: 2,
                  }}
                />
              </button>
            );
          })}
        </div>
        <div className="mt-1.5 grid grid-cols-6 gap-2">
          {cashflowWeeks.map((w) => (
            <span key={w.label} className="text-center text-[12px]" style={{ color: ASSEMBL_WARM_GREY }}>
              {w.label}
            </span>
          ))}
        </div>
        <p className="mt-2 text-center text-[12px]" style={{ color: ASSEMBL_WARM_GREY }}>
          click a bar to see what’s driving it
        </p>
      </div>

      {selected !== null ? (
        <div className="mt-3 animate-[assembl-rise-in_0.35s_ease-out] rounded-xl border border-black/10 bg-white p-4">
          <p className="text-sm font-semibold">{cashflowWeeks[selected].label} — what’s driving it</p>
          <ul className="mt-2 space-y-1">
            {cashflowWeeks[selected].drivers.map((d) => (
              <li key={d} className="flex gap-2 text-sm leading-relaxed" style={{ color: '#3E3C36' }}>
                <span aria-hidden style={{ color: ASSEMBL_WARM_GREY }}>·</span>
                {d}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[12px]" style={{ color: ASSEMBL_WARM_GREY }}>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: STATUS_COLOURS.positive }} />
          ahead
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: STATUS_COLOURS.tight }} />
          tight
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: STATUS_COLOURS.exposed }} />
          exposed
        </span>
      </div>
      <p className="mt-3 text-[12px]" style={{ color: ASSEMBL_WARM_GREY }}>
        {cashflowHeadline.out} · {cashflowHeadline.back} · sample month
      </p>
    </div>
  );
}
