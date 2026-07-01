'use client';

import { useRouter } from 'next/navigation';
import type { BrandConfig } from '@/lib/brand/brand-config';

/**
 * Tenant switch — swaps the customer slug in the URL. Deliberately a plain
 * `<select>` to keep this template dependency-free; upgrade to Radix or shadcn
 * `Select` in a customer instance if you need styling parity.
 */
export function TenantSwitch({
  current,
  slugs,
}: {
  current: BrandConfig['slug'];
  slugs: string[];
}) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-xs text-[color:var(--brand-muted)]">
      <span className="sr-only">Switch tenant</span>
      <select
        value={current}
        onChange={(e) => router.push(`/customers/${e.target.value}/ops`)}
        className="rounded-md border border-black/10 bg-[color:var(--brand-surface)] px-2 py-1 text-xs text-[color:var(--brand-ink)]"
      >
        {slugs.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </label>
  );
}
