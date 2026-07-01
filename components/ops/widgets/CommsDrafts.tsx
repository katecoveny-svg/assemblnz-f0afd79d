'use client';

import { FadeIn, TickerNumber } from '@/lib/motion';
import type { CommsDraft } from './types';

export function CommsDrafts({ drafts }: { drafts: CommsDraft[] }) {
  return (
    <FadeIn className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-[color:var(--brand-ink)]">
          Comms drafts
        </h3>
        <span className="text-sm text-[color:var(--brand-muted)]">
          <TickerNumber value={drafts.length} /> queued
        </span>
      </div>
      {drafts.length === 0 ? (
        <p className="rounded-lg bg-black/5 p-4 text-sm text-[color:var(--brand-muted)]">
          No drafts. Ask an agent to draft something.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {drafts.map((d) => (
            <li
              key={d.id}
              className="rounded-xl border border-black/5 bg-[color:var(--brand-bg)]/40 p-3"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-full bg-[color:var(--brand-accent)]/15 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-[color:var(--brand-ink)]">
                  {d.channel}
                </span>
                <span className="text-xs text-[color:var(--brand-muted)]">
                  to {d.audience}
                </span>
                <span className="ml-auto text-xs text-[color:var(--brand-muted)]">
                  tone · {d.tone}
                </span>
              </div>
              <p className="text-sm text-[color:var(--brand-ink)]">{d.preview}</p>
            </li>
          ))}
        </ul>
      )}
    </FadeIn>
  );
}
