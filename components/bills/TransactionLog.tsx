'use client';

import { useMemo, useState } from 'react';
import { transactions, CATEGORY_ORDER, type Category } from '@/lib/bills/data';
import { CategoryTag, money } from './kit';

const dateFmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short' });

export function TransactionLog() {
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const present = useMemo(
    () => ['All', ...CATEGORY_ORDER.filter((c) => transactions.some((t) => t.category === c))] as (Category | 'All')[],
    [],
  );
  const rows = filter === 'All' ? transactions : transactions.filter((t) => t.category === filter);

  return (
    <div>
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
                fontFamily: "var(--font-bills-display), system-ui, sans-serif",
              }}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl" style={{ border: '1px solid var(--b-line)' }}>
        {rows.map((t, i) => (
          <div
            key={`${t.date}-${t.merchant}`}
            className="flex items-center justify-between gap-4 px-4 py-3"
            style={{ background: i % 2 ? 'var(--b-surface-alt)' : 'var(--b-surface)' }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="w-12 shrink-0 text-xs" style={{ color: 'var(--b-faint)' }}>
                {dateFmt(t.date)}
              </span>
              <span className="truncate text-sm font-medium" style={{ color: 'var(--b-ink)' }}>
                {t.merchant}
              </span>
              <CategoryTag category={t.category} />
            </div>
            <span className="shrink-0 text-sm font-semibold" style={{ color: 'var(--b-ink)' }}>
              {money(t.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
