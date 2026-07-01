'use client';

import { FadeIn, TickerNumber } from '@/lib/motion';

export type FinanceSummary = {
  revenue: number;
  expenses: number;
  // margin is derived — pass a pre-computed value if you want a specific rounding.
  margin?: number;
};

export function FinancePanel({ summary }: { summary: FinanceSummary }) {
  const margin =
    summary.margin ??
    (summary.revenue > 0
      ? Math.round(((summary.revenue - summary.expenses) / summary.revenue) * 1000) / 10
      : 0);

  return (
    <FadeIn className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
      <h3 className="mb-3 text-lg font-semibold text-[color:var(--brand-ink)]">Finance</h3>
      <div className="grid grid-cols-3 gap-3">
        <Tile label="Revenue" value={summary.revenue} prefix="$" />
        <Tile label="Expenses" value={summary.expenses} prefix="$" />
        <Tile label="Margin" value={margin} suffix="%" decimals={1} />
      </div>
    </FadeIn>
  );
}

function Tile({
  label,
  value,
  prefix,
  suffix,
  decimals = 0,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <div className="rounded-xl bg-[color:var(--brand-bg)]/50 p-3">
      <div className="text-xs uppercase tracking-wide text-[color:var(--brand-muted)]">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-[color:var(--brand-ink)]">
        <TickerNumber value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </div>
    </div>
  );
}
