'use client';

import { useMemo, useState } from 'react';
import { bills, CATEGORY_ORDER, type Category } from '@/lib/bills/data';
import { CategoryTag, SourceBadge, TrendChip, money } from './kit';

const dueFmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' });

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  'Due soon': { bg: 'var(--b-coral-soft)', fg: 'var(--b-coral-deep)' },
  Upcoming: { bg: 'var(--b-surface-alt)', fg: 'var(--b-muted)' },
  Paid: { bg: 'var(--b-teal-soft)', fg: 'var(--b-teal-deep)' },
};

export function BillsTable() {
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const present = useMemo(
    () => ['All', ...CATEGORY_ORDER.filter((c) => bills.some((b) => b.category === c))] as (Category | 'All')[],
    [],
  );
  const rows = filter === 'All' ? bills : bills.filter((b) => b.category === filter);

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {present.map((c) => {
          const active = filter === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              className="rounded-full px-3 py-1.5 text-xs font-semibold transition"
              style={{
                background: active ? 'var(--b-teal)' : 'var(--b-surface)',
                color: active ? '#fff' : 'var(--b-muted)',
                border: `1px solid ${active ? 'var(--b-teal)' : 'var(--b-line)'}`,
                fontFamily: "var(--font-bills-display), 'Cormorant Garamond', Georgia, serif",
              }}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="space-y-2.5">
        {rows.map((b) => {
          const st = STATUS_STYLE[b.status] ?? STATUS_STYLE.Upcoming;
          return (
            <div
              key={b.id}
              className="flex flex-col gap-3 rounded-2xl px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
              style={{ background: 'var(--b-surface)', border: '1px solid var(--b-line)' }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold" style={{ color: 'var(--b-ink)', fontFamily: "var(--font-bills-display), 'Cormorant Garamond', Georgia, serif" }}>
                    {b.provider}
                  </span>
                  <CategoryTag category={b.category} />
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--b-muted)' }}>
                  <span>{b.plan}</span>
                  <span aria-hidden>·</span>
                  <SourceBadge source={b.source} />
                  {b.trend && <TrendChip trend={b.trend} note={b.trendNote} />}
                </div>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-right">
                  <div className="font-bold" style={{ color: 'var(--b-ink)' }}>
                    {money(b.amount)}
                    <span className="text-xs font-normal" style={{ color: 'var(--b-faint)' }}>
                      /{b.cycle === 'monthly' ? 'mo' : b.cycle === 'quarterly' ? 'qtr' : 'yr'}
                    </span>
                  </div>
                  <div className="text-[12px]" style={{ color: 'var(--b-faint)' }}>
                    due {dueFmt(b.due)}
                  </div>
                </div>
                <span className="rounded-full px-2.5 py-1 text-[12px] font-semibold" style={{ background: st.bg, color: st.fg }}>
                  {b.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
