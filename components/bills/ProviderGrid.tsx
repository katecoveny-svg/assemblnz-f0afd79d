'use client';

import { useMemo, useState } from 'react';
import { ExternalLink, Check, ShieldCheck } from 'lucide-react';
import { CategoryTag } from './kit';
import { CATEGORY_LABEL, orderCategories, type LivePlan } from '@/lib/bills/provider-types';

const money = (n: number | null) => (n == null ? '—' : `$${n.toLocaleString('en-NZ')}`);
const verifiedFmt = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
};

export function ProviderGrid({ plans }: { plans: LivePlan[] }) {
  const cats = useMemo(() => orderCategories(plans.map((p) => p.category)), [plans]);
  const [filter, setFilter] = useState<string>('All');
  const rows = filter === 'All' ? plans : plans.filter((p) => p.category === filter);

  const tabs = ['All', ...cats];

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {tabs.map((c) => {
          const active = filter === c;
          const count = c === 'All' ? plans.length : plans.filter((p) => p.category === c).length;
          const label = c === 'All' ? 'All' : (CATEGORY_LABEL[c] ?? c);
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
              {label} <span style={{ opacity: 0.7 }}>· {count}</span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map((p) => (
          <div key={p.id} className="flex flex-col rounded-2xl p-4" style={{ background: 'var(--b-surface)', border: '1px solid var(--b-line)' }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold" style={{ fontFamily: "var(--font-bills-display), 'Cormorant Garamond', Georgia, serif", color: 'var(--b-ink)' }}>{p.provider}</span>
                  <CategoryTag category={CATEGORY_LABEL[p.category] ?? p.category} />
                </div>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--b-muted)' }}>{p.planName}</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold" style={{ color: 'var(--b-teal-deep)' }}>{money(p.monthlyCost)}</div>
                <div className="text-[12px]" style={{ color: 'var(--b-faint)' }}>/mo indicative</div>
              </div>
            </div>

            {p.features.length > 0 && (
              <ul className="mt-3 space-y-1">
                {p.features.slice(0, 3).map((f) => (
                  <li key={f} className="flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--b-muted)' }}>
                    <Check size={12} style={{ color: 'var(--b-teal)' }} /> {f}
                  </li>
                ))}
              </ul>
            )}

            {/* Provenance — the trust line */}
            <div className="mt-3 flex items-center justify-between border-t pt-2.5" style={{ borderColor: 'var(--b-line)' }}>
              <div className="min-w-0">
                <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 truncate text-[12px] font-medium" style={{ color: 'var(--b-teal-deep)' }}>
                  {p.sourceHost} <ExternalLink size={10} />
                </a>
                <p className="text-[12px]" style={{ color: 'var(--b-faint)' }}>
                  verified {verifiedFmt(p.lastVerified)}
                </p>
              </div>
              <span className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[12px] font-bold" style={{ background: 'var(--b-teal-soft)', color: 'var(--b-teal-deep)' }} title="Source trust tier">
                <ShieldCheck size={10} /> {p.trustTier}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
