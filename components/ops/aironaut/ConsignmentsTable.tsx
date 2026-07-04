'use client';

import { FadeIn } from '@/lib/motion';
import type { AironautConsignment } from '@/lib/customers/aironaut/demo-data';

/**
 * AIRONAUT consignments table — repurpose of the roster shape for freight
 * refs / mode / status. Rows are sample records (demo-flagged in the data);
 * nothing in this widget can send or lodge anything.
 */
export function ConsignmentsTable({
  title,
  rows,
}: {
  title?: string;
  rows: AironautConsignment[];
}) {
  return (
    <FadeIn className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-[color:var(--brand-ink)]">
          {title ?? 'Consignments'}
        </h3>
        <span className="text-[11px] text-[color:var(--brand-muted)]">
          sample data
        </span>
      </div>
      <div className="overflow-hidden rounded-xl border border-black/5">
        <table className="w-full text-sm">
          <thead className="bg-[color:var(--brand-bg)] text-[color:var(--brand-muted)]">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Ref</th>
              <th className="px-3 py-2 text-left font-medium">Mode</th>
              <th className="px-3 py-2 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-t border-black/5 text-[color:var(--brand-ink)]"
              >
                <td className="px-3 py-2">
                  <div className="font-medium">{r.id}</div>
                  <div className="text-xs text-[color:var(--brand-muted)]">
                    {r.ref}
                  </div>
                </td>
                <td className="px-3 py-2 text-[color:var(--brand-muted)]">
                  {r.mode}
                </td>
                <td className="px-3 py-2 text-[color:var(--brand-muted)]">
                  {r.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </FadeIn>
  );
}
