'use client';

import { useStudioStore } from '@/lib/studio/store';

/**
 * The activity view — full-page trace of the test run. Same store as the
 * bottom activity panel; this is just a larger read-only presentation for
 * the "activity" top-bar mode.
 */
export function ActivityView() {
  const test = useStudioStore((s) => s.test);
  const runTest = useStudioStore((s) => s.runTest);
  const reset = useStudioStore((s) => s.resetDemo);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[color:var(--assembl-paper)] p-6 md:p-10">
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-6">
        <header>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[color:var(--text-secondary)]">activity trace</p>
          <h2 className="mt-2 font-display text-[38px] font-light lowercase leading-[1.05] text-[color:var(--text-primary)]">
            what actually happened.
          </h2>
          <p className="mt-2 max-w-[640px] text-[14px] leading-[1.55] text-[color:var(--text-secondary)]">
            One line per stage. Timestamps are relative to the test start. Everything here is <strong>simulated</strong> — this is a demonstration.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={runTest}
            className="rounded-[2px] border border-[color:var(--text-primary)] bg-[color:var(--text-primary)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--assembl-paper)]">
            Run demo
          </button>
          <button type="button" onClick={reset}
            className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]">
            Reset
          </button>
          <span className="ml-auto grid grid-cols-3 gap-2 font-mono text-[10.5px]">
            <Metric label="duration" value={`${(test.durationMs / 1000).toFixed(1)}s`} />
            <Metric label="est. cost" value={`$${test.costEstimateUsd.toFixed(3)}`} />
            <Metric label="confidence" value={`${(test.confidence * 100).toFixed(0)}%`} />
          </span>
        </div>

        {test.activity.length === 0 ? (
          <p className="rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-4 font-mono text-[11.5px] text-[color:var(--text-secondary)]">
            No activity yet. Press Run demo above.
          </p>
        ) : (
          <ol className="flex flex-col gap-1.5">
            {test.activity.map((e, i) => (
              <li key={i} className="rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-3 font-mono text-[11.5px]">
                <div className="flex items-baseline gap-3">
                  <span className="w-12 shrink-0 text-right text-[color:var(--text-secondary)]">{(e.at / 1000).toFixed(1)}s</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--text-secondary)]">{e.stage}</span>
                  <span className="text-[color:var(--text-primary)]">{e.label}</span>
                </div>
                <div className="mt-1 pl-16 text-[color:var(--text-secondary)]">{e.detail}</div>
                {e.active.length > 0 && (
                  <div className="mt-1 pl-16 text-[10px] text-[color:var(--text-secondary)]">
                    active: {e.active.join(', ')}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-2 py-1">
      <div className="text-[9.5px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">{label}</div>
      <div className="mt-0.5 text-[color:var(--text-primary)]">{value}</div>
    </div>
  );
}
