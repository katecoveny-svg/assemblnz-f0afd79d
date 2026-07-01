'use client';

import { FadeIn } from '@/lib/motion';
import type { ComplianceItem } from './types';

const severityColour: Record<ComplianceItem['severity'], string> = {
  info: 'bg-[color:var(--brand-muted)]/30',
  warn: 'bg-[color:var(--brand-canary)]',
  critical: 'bg-[color:var(--brand-accent)]',
};

export function ComplianceCalendar({
  items,
  monthLabel,
}: {
  items: ComplianceItem[];
  monthLabel: string;
}) {
  const byDay = new Map<number, ComplianceItem[]>();
  items.forEach((it) => {
    const d = new Date(it.date).getUTCDate();
    const list = byDay.get(d) ?? [];
    list.push(it);
    byDay.set(d, list);
  });

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <FadeIn className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-[color:var(--brand-ink)]">
          Compliance calendar
        </h3>
        <span className="text-xs text-[color:var(--brand-muted)]">{monthLabel}</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const hits = byDay.get(d);
          const dot = hits?.[0];
          return (
            <div
              key={d}
              className="relative flex h-10 items-start justify-start rounded-md bg-[color:var(--brand-bg)]/60 p-1.5 text-[10px] text-[color:var(--brand-muted)]"
              title={hits?.map((h) => h.label).join(', ') ?? undefined}
            >
              {d}
              {dot ? (
                <span
                  className={`absolute right-1 top-1 h-2 w-2 rounded-full ${severityColour[dot.severity]}`}
                  aria-label={dot.label}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </FadeIn>
  );
}
