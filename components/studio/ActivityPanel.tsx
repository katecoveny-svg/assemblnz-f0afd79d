'use client';

import { useStudioStore } from '@/lib/studio/store';
import { REFUND_DRAFT, REFUND_MESSAGE, REFUND_SOURCE, TEST_STAGES, stageIndex, type TestStageId } from '@/lib/studio/simulate';

/**
 * The lower activity + test panel. Collapsible. Runs the refund
 * demonstration end-to-end. All state lives in the store.
 */
export function ActivityPanel() {
  const test = useStudioStore((s) => s.test);
  const open = useStudioStore((s) => s.panels.activity);
  const togglePanel = useStudioStore((s) => s.togglePanel);
  const runTest = useStudioStore((s) => s.runTest);
  const approve = useStudioStore((s) => s.approveSend);
  const reject = useStudioStore((s) => s.rejectSend);
  const reset = useStudioStore((s) => s.resetDemo);

  const currentIdx = stageIndex(test.stage);
  const showApprovalUI = test.stage === 'awaiting-approval' && test.approved === null;

  return (
    <div className={[
      'flex flex-col border-t border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] transition-all',
      open ? 'h-[46vh]' : 'h-11',
    ].join(' ')}>
      <button
        type="button"
        onClick={() => togglePanel('activity')}
        className="flex items-center justify-between border-b border-[color:var(--assembl-cloud)] px-4 py-2.5 text-left"
        aria-expanded={open}
      >
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">activity + test</span>
          <span className="rounded-[2px] bg-[color:var(--assembl-gold-thread)]/20 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[color:var(--text-primary)]">demonstration</span>
          <span className="font-mono text-[11px] text-[color:var(--text-primary)]">
            {test.stage === 'idle' ? 'idle · not running' : TEST_STAGES.find((s) => s.id === test.stage)?.label}
          </span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
          {open ? 'collapse ▾' : 'expand ▴'}
        </span>
      </button>

      {open && (
        <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 md:grid-cols-[1.05fr_1fr_0.9fr]">
          {/* Column 1 — customer message + draft */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">customer message · simulated</div>
              <pre className="whitespace-pre-wrap rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-3 font-mono text-[11px] leading-[1.55] text-[color:var(--text-primary)]">{REFUND_MESSAGE}</pre>
            </div>
            {currentIdx >= stageIndex('drafting') && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
                  <span>draft response</span>
                  <span>confidence · {(test.confidence * 100).toFixed(0)}%</span>
                </div>
                <pre className="whitespace-pre-wrap rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-3 font-mono text-[11.5px] leading-[1.6] text-[color:var(--text-primary)]">{REFUND_DRAFT}</pre>
              </div>
            )}
            {currentIdx >= stageIndex('source-found') && (
              <div className="flex flex-col gap-1.5">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">supporting knowledge</div>
                <div className="rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-3">
                  <div className="font-mono text-[11px] text-[color:var(--text-primary)]">{REFUND_SOURCE.title}</div>
                  <div className="font-mono text-[10px] text-[color:var(--text-secondary)]">{REFUND_SOURCE.citation}</div>
                  <p className="mt-2 text-[11.5px] leading-[1.55] text-[color:var(--text-primary)]">{REFUND_SOURCE.snippet}</p>
                </div>
              </div>
            )}
          </div>

          {/* Column 2 — stages + approval */}
          <div className="flex flex-col gap-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">stages</div>
            <ol className="flex flex-col gap-1.5">
              {TEST_STAGES.map((s) => {
                const idx = stageIndex(s.id);
                const state: 'done' | 'current' | 'pending' =
                  idx < currentIdx ? 'done' : idx === currentIdx ? 'current' : 'pending';
                return (
                  <li key={s.id} className="flex items-baseline gap-2">
                    <span className={[
                      'h-2 w-2 shrink-0 rounded-full',
                      state === 'done' ? 'bg-[color:var(--assembl-pounamu)]'
                        : state === 'current' ? 'bg-[color:var(--assembl-gold-thread)] animate-pulse'
                        : 'bg-[color:var(--assembl-cloud)]',
                    ].join(' ')} aria-hidden />
                    <div>
                      <div className={[
                        'font-mono text-[11px]',
                        state === 'pending' ? 'text-[color:var(--text-secondary)]' : 'text-[color:var(--text-primary)]',
                      ].join(' ')}>
                        {s.label}
                      </div>
                      {state === 'current' && (
                        <div className="font-mono text-[10px] text-[color:var(--text-secondary)]">{s.hint}</div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {showApprovalUI && (
              <div className="mt-2 flex flex-col gap-2 rounded-[3px] border border-[color:var(--assembl-gold-thread)] bg-[color:var(--assembl-gold-thread)]/10 p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-primary)]">approval required</div>
                <p className="text-[11.5px] leading-[1.55] text-[color:var(--text-primary)]">
                  koro won&rsquo;t send the reply until you say yes. Read the draft on the left, then choose.
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={approve}
                    className="rounded-[2px] border border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--assembl-paper)]">
                    Approve &amp; send
                  </button>
                  <button type="button" onClick={reject}
                    className="rounded-[2px] border border-red-400 bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-red-600">
                    Reject
                  </button>
                </div>
              </div>
            )}
            {test.approved === false && (
              <div className="rounded-[3px] border border-red-300 bg-red-50 p-3 text-[11.5px] text-red-700">
                Draft rejected. Nothing was sent.
              </div>
            )}
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={runTest}
                className="rounded-[2px] border border-[color:var(--text-primary)] bg-[color:var(--text-primary)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--assembl-paper)]">
                Run demo
              </button>
              <button type="button" onClick={reset}
                className="rounded-[2px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] hover:border-[color:var(--text-primary)]">
                Reset
              </button>
            </div>
          </div>

          {/* Column 3 — trace + stats */}
          <div className="flex flex-col gap-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">activity trace</div>
            <div className="flex-1 overflow-y-auto rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)]">
              {test.activity.length === 0 ? (
                <p className="p-3 font-mono text-[11px] text-[color:var(--text-secondary)]">No activity yet. Press Run demo.</p>
              ) : (
                <ul className="divide-y divide-[color:var(--assembl-cloud)]">
                  {test.activity.map((e, i) => (
                    <li key={i} className="flex items-baseline gap-3 px-3 py-2 font-mono text-[10.5px]">
                      <span className="w-10 shrink-0 text-right text-[color:var(--text-secondary)]">{(e.at / 1000).toFixed(1)}s</span>
                      <div>
                        <div className="text-[color:var(--text-primary)]">{e.label}</div>
                        <div className="text-[color:var(--text-secondary)]">{e.detail}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[10.5px]">
              <Stat label="duration" value={`${(test.durationMs / 1000).toFixed(1)}s`} />
              <Stat label="est. cost" value={`$${test.costEstimateUsd.toFixed(3)}`} />
              <Stat label="confidence" value={`${(test.confidence * 100).toFixed(0)}%`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[3px] border border-[color:var(--assembl-cloud)] bg-[color:var(--assembl-paper)] p-2">
      <div className="text-[9.5px] uppercase tracking-[0.18em] text-[color:var(--text-secondary)]">{label}</div>
      <div className="mt-1 text-[color:var(--text-primary)]">{value}</div>
    </div>
  );
}
