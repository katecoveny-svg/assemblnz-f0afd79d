'use client';

import { FadeIn } from '@/lib/motion';
import type { CRMCustomer } from './types';

const stageStyle: Record<CRMCustomer['stage'], string> = {
  lead: 'bg-[color:var(--brand-canary)]/40 text-[color:var(--brand-ink)]',
  active: 'bg-[color:var(--brand-accent)]/20 text-[color:var(--brand-ink)]',
  lapsed: 'bg-black/10 text-[color:var(--brand-muted)]',
  vip: 'bg-[color:var(--brand-accent)] text-[color:var(--brand-surface)]',
};

export function CustomerCRM({ customers }: { customers: CRMCustomer[] }) {
  return (
    <FadeIn className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
      <h3 className="mb-3 text-lg font-semibold text-[color:var(--brand-ink)]">Customers</h3>
      {customers.length === 0 ? (
        <p className="rounded-lg bg-black/5 p-4 text-sm text-[color:var(--brand-muted)]">
          No customers loaded — connect a source or add demo data.
        </p>
      ) : (
        <ul className="divide-y divide-black/5">
          {customers.map((c) => (
            <li key={c.id} className="flex items-center justify-between py-2.5">
              <div>
                <div className="text-sm font-medium text-[color:var(--brand-ink)]">
                  {c.name}
                </div>
                <div className="text-xs text-[color:var(--brand-muted)]">
                  Last seen {new Date(c.lastSeen).toLocaleDateString()}
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${stageStyle[c.stage]}`}
              >
                {c.stage}
              </span>
            </li>
          ))}
        </ul>
      )}
    </FadeIn>
  );
}
