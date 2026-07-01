'use client';

import { FadeIn, TickerNumber } from '@/lib/motion';
import type { UpcomingEvent } from './types';

export function EventsPlanner({ events }: { events: UpcomingEvent[] }) {
  return (
    <FadeIn className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
      <h3 className="mb-3 text-lg font-semibold text-[color:var(--brand-ink)]">
        Upcoming events
      </h3>
      {events.length === 0 ? (
        <p className="rounded-lg bg-black/5 p-4 text-sm text-[color:var(--brand-muted)]">
          Nothing on the calendar.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {events.map((e) => {
            const pct = Math.min(100, Math.round((e.reserved / Math.max(1, e.capacity)) * 100));
            return (
              <li
                key={e.id}
                className="rounded-xl border border-black/5 bg-[color:var(--brand-bg)]/40 p-3"
              >
                <div className="flex items-baseline justify-between">
                  <div className="text-sm font-medium text-[color:var(--brand-ink)]">
                    {e.name}
                  </div>
                  <div className="text-xs text-[color:var(--brand-muted)]">
                    {new Date(e.when).toLocaleString()}
                  </div>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/5">
                    <div
                      className="h-full rounded-full bg-[color:var(--brand-accent)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-[color:var(--brand-muted)]">
                    <TickerNumber value={e.reserved} /> / {e.capacity}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </FadeIn>
  );
}
