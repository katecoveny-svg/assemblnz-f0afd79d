import type { MondayQueueItem } from '@/lib/customers/toa-architects/demo-data';

/**
 * MondayStrip — "typical Monday morning" queue. ARC worked the weekend;
 * everything below is a draft waiting for a human yes. Counts and minutes are
 * derived from the demo data, never hardcoded.
 */
const KIND_LABEL: Record<MondayQueueItem['kind'], string> = {
  'client update': 'client updates',
  'RFI response': 'RFI responses',
  'fee proposal': 'fee proposal',
  'consultant chase': 'consultant chases',
};

export function MondayStrip({ queue }: { queue: MondayQueueItem[] }) {
  const kinds = Object.keys(KIND_LABEL) as MondayQueueItem['kind'][];
  const counts = kinds
    .map((k) => ({ kind: k, n: queue.filter((q) => q.kind === k).length }))
    .filter((c) => c.n > 0);
  const reviewMinutes = queue.reduce((m, q) => m + q.minutesToReview, 0);

  return (
    <section className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-[family-name:var(--font-brand-display)] text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-ink)]">
          Drafted overnight
        </h2>
        <span className="text-xs text-[color:var(--brand-muted)]">
          ~{reviewMinutes} min to review · ~4 hrs if you wrote them · demo
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {counts.map(({ kind, n }) => (
          <div
            key={kind}
            className="rounded-xl border border-black/5 bg-[color:var(--brand-bg)] px-4 py-3"
          >
            <div className="font-[family-name:var(--font-brand-display)] text-2xl font-semibold text-[color:var(--brand-ink)]">
              {n}
            </div>
            <div className="text-xs text-[color:var(--brand-muted)]">
              {KIND_LABEL[kind]}
            </div>
          </div>
        ))}
      </div>

      <ul className="mt-4 divide-y divide-black/5 border-t border-black/5 text-sm">
        {queue.map((q) => (
          <li key={q.id} className="flex items-center justify-between gap-3 py-2">
            <span className="min-w-0 truncate text-[color:var(--brand-ink)]">
              {q.label}
            </span>
            <span className="flex shrink-0 items-center gap-3">
              <span className="text-[12px] text-[color:var(--brand-muted)]">
                {q.minutesToReview} min
              </span>
              <span
                className="rounded-full border px-2.5 py-0.5 text-[12px] uppercase tracking-wide"
                style={{ borderColor: 'var(--brand-canary)', color: 'var(--brand-canary)' }}
              >
                awaiting your yes
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
