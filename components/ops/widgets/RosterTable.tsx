'use client';

import { FadeIn, TickerNumber } from '@/lib/motion';
import type { RosterRow } from './types';

/**
 * Roster table — staff shifts + hours + cost. Colours pulled from the brand's
 * CSS variables set by <BrandThemeProvider>.
 */
export function RosterTable({ rows }: { rows: RosterRow[] }) {
  const totalHours = rows.reduce((acc, r) => acc + r.hours, 0);
  const totalCost = rows.reduce((acc, r) => acc + r.cost, 0);

  return (
    <FadeIn className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-[color:var(--brand-ink)]">Roster</h3>
        <span className="text-xs text-[color:var(--brand-muted)]">
          {rows.length} on shift
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-lg bg-black/5 p-4 text-sm text-[color:var(--brand-muted)]">
          No one rostered — add shifts to see them here.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-black/5">
          <table className="w-full text-sm">
            <thead className="bg-[color:var(--brand-bg)] text-[color:var(--brand-muted)]">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Name</th>
                <th className="px-3 py-2 text-left font-medium">Role</th>
                <th className="px-3 py-2 text-left font-medium">Shift</th>
                <th className="px-3 py-2 text-right font-medium">Hrs</th>
                <th className="px-3 py-2 text-right font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-black/5 text-[color:var(--brand-ink)]"
                >
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2 text-[color:var(--brand-muted)]">{r.role}</td>
                  <td className="px-3 py-2 text-[color:var(--brand-muted)]">{r.shift}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{r.hours.toFixed(1)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    ${r.cost.toFixed(0)}
                  </td>
                </tr>
              ))}
              <tr className="bg-[color:var(--brand-bg)]/60 font-medium text-[color:var(--brand-ink)]">
                <td className="px-3 py-2" colSpan={3}>
                  Total
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  <TickerNumber value={totalHours} decimals={1} />
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  <TickerNumber value={totalCost} decimals={0} prefix="$" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </FadeIn>
  );
}
