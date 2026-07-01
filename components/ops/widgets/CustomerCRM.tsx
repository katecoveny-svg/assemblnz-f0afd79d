'use client';

import Image from 'next/image';
import { FadeIn } from '@/lib/motion';
import type { CRMCustomer } from './types';

const stageStyle: Record<CRMCustomer['stage'], string> = {
  lead: 'bg-[color:var(--brand-canary)]/40 text-[color:var(--brand-ink)]',
  active: 'bg-[color:var(--brand-accent)]/20 text-[color:var(--brand-ink)]',
  lapsed: 'bg-black/10 text-[color:var(--brand-muted)]',
  vip: 'bg-[color:var(--brand-accent)] text-[color:var(--brand-surface)]',
};

/**
 * CustomerCRM — customer list widget. Accepts an optional `avatars` array; when
 * provided, each row picks `avatars[index % avatars.length]` as its visual
 * placeholder. When absent, we fall back to a neutral initials chip so other
 * brands are unaffected.
 */
export function CustomerCRM({
  customers,
  avatars,
}: {
  customers: CRMCustomer[];
  avatars?: string[];
}) {
  return (
    <FadeIn className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
      <h3 className="mb-3 text-lg font-semibold text-[color:var(--brand-ink)]">Customers</h3>
      {customers.length === 0 ? (
        <p className="rounded-lg bg-black/5 p-4 text-sm text-[color:var(--brand-muted)]">
          No customers loaded — connect a source or add demo data.
        </p>
      ) : (
        <ul className="divide-y divide-black/5">
          {customers.map((c, i) => {
            const avatar =
              avatars && avatars.length > 0
                ? avatars[i % avatars.length]
                : undefined;
            return (
              <li key={c.id} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  {avatar ? (
                    <span
                      className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-black/5"
                      style={{ backgroundColor: 'var(--brand-bg)' }}
                    >
                      <Image
                        src={avatar}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 object-cover"
                        aria-hidden
                      />
                    </span>
                  ) : (
                    <span
                      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5 text-xs font-semibold text-[color:var(--brand-muted)]"
                      aria-hidden
                    >
                      {c.name.slice(0, 1)}
                    </span>
                  )}
                  <div>
                    <div className="text-sm font-medium text-[color:var(--brand-ink)]">
                      {c.name}
                    </div>
                    <div className="text-xs text-[color:var(--brand-muted)]">
                      Last seen {new Date(c.lastSeen).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${stageStyle[c.stage]}`}
                >
                  {c.stage}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </FadeIn>
  );
}
