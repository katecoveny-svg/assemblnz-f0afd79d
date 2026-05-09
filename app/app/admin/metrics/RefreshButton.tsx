'use client';

import { useState, useTransition } from 'react';
import { refreshKpiAction } from './actions';

export function RefreshButton() {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ ok: boolean; reason?: string } | null>(null);

  const handle = () => {
    setFeedback(null);
    startTransition(async () => {
      const r = await refreshKpiAction();
      setFeedback(r);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handle}
        disabled={isPending}
        className="inline-flex h-10 items-center rounded-[2px] border border-[color:var(--assembl-cloud)] bg-white px-5 font-mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--text-primary)] hover:bg-[color:var(--assembl-paper)] disabled:opacity-50"
      >
        {isPending ? 'refreshing…' : 'refresh'}
      </button>
      {feedback?.ok ? (
        <span className="font-mono text-[11px] tracking-[0.04em] text-[color:#2a7a3e]">
          ✓ refreshed
        </span>
      ) : null}
      {feedback && !feedback.ok ? (
        <span className="font-mono text-[11px] tracking-[0.04em] text-[color:#b3261e]">
          · {feedback.reason ?? 'refresh failed'}
        </span>
      ) : null}
    </div>
  );
}
