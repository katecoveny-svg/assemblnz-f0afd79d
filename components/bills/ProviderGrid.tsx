'use client';

import { useState } from 'react';
import { ExternalLink, Check } from 'lucide-react';
import { providerPlans, type Category } from '@/lib/bills/data';
import { CategoryTag } from './kit';

const CATS: (Category | 'All')[] = ['All', 'Electricity', 'Broadband', 'Insurance'];

export function ProviderGrid() {
  const [filter, setFilter] = useState<Category | 'All'>('All');
  const rows = filter === 'All' ? providerPlans : providerPlans.filter((p) => p.category === filter);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {CATS.map((c) => {
          const active = filter === c;
          const count = c === 'All' ? providerPlans.length : providerPlans.filter((p) => p.category === c).length;
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
                fontFamily: 'var(--font-bills-display)',
              }}
            >
              {c} <span style={{ opacity: 0.7 }}>· {count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((p) => {
          const current = p.planName.includes('current');
          return (
            <div
              key={p.id}
              className="rounded-2xl p-4"
              style={{ background: 'var(--b-surface)', border: `1px solid ${current ? 'var(--b-teal-line)' : 'var(--b-line)'}` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold" style={{ fontFamily: 'var(--font-bills-display)', color: 'var(--b-ink)' }}>{p.provider}</span>
                    <CategoryTag category={p.category} />
                  </div>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--b-muted)' }}>{p.planName.replace(' (current)', '')}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: 'var(--b-teal-deep)' }}>{p.indicativeMonthly}</div>
                  <div className="text-[10px]" style={{ color: 'var(--b-faint)' }}>/mo indicative</div>
                </div>
              </div>
              <ul className="mt-3 space-y-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--b-muted)' }}>
                    <Check size={12} style={{ color: 'var(--b-teal)' }} /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex items-center justify-between">
                {current ? (
                  <span className="rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ background: 'var(--b-teal-soft)', color: 'var(--b-teal-deep)' }}>Your current plan</span>
                ) : (
                  <span />
                )}
                <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--b-teal-deep)' }}>
                  {p.linkLabel} <ExternalLink size={11} />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
