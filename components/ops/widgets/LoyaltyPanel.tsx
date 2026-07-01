'use client';

import { FadeIn, TickerNumber } from '@/lib/motion';
import type { LoyaltyState } from './types';

export function LoyaltyPanel({ state }: { state: LoyaltyState }) {
  const pct = Math.min(100, Math.round((state.points / Math.max(1, state.nextTierAt)) * 100));
  return (
    <FadeIn className="rounded-2xl border border-black/5 bg-[color:var(--brand-surface)] p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold text-[color:var(--brand-ink)]">Loyalty</h3>
        <span className="rounded-full bg-[color:var(--brand-accent)] px-2.5 py-0.5 text-xs font-medium text-[color:var(--brand-surface)]">
          {state.tier}
        </span>
      </div>
      <div className="text-3xl font-semibold tabular-nums text-[color:var(--brand-ink)]">
        <TickerNumber value={state.points} /> pts
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full rounded-full bg-[color:var(--brand-accent)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-xs text-[color:var(--brand-muted)]">
        {state.nextTierAt - state.points > 0
          ? `${state.nextTierAt - state.points} pts to next tier`
          : 'top tier reached'}
      </div>
    </FadeIn>
  );
}
