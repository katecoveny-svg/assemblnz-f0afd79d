import type { WorkView } from '@/lib/os/work-view';

/**
 * Work & Proof — every piece of work the OS is carrying, its state in human
 * words, and the evidence that proves what happened. Calm canon: one list,
 * no charts, the newest few tasks expandable to their full story.
 */

const STATUS_TONE: Record<string, string> = {
  awaiting_approval: '#8a6d1f',
  blocked: '#8a3b2f',
  failed: '#8a3b2f',
  requires_review: '#8a6d1f',
  completed: '#3f7355',
};

function StatusChip({ status, label }: { status: string; label: string }) {
  const tone = STATUS_TONE[status] ?? '#5c6a70';
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] uppercase"
      style={{ letterSpacing: '0.12em', color: tone, borderColor: `${tone}33` }}
    >
      <i aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
      {label}
    </span>
  );
}

export function WorkProofTab({ work }: { work: WorkView }) {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl border border-[#1B2A4A]/12 bg-[color:var(--brand-surface)]/90 p-5 shadow-[0_20px_50px_rgba(27,42,74,0.08)] backdrop-blur-xl">
        <p className="mb-1 text-[12px] uppercase" style={{ letterSpacing: '0.16em', color: 'var(--brand-muted)' }}>
          work · what the system is carrying
        </p>
        {work.tasks.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--brand-muted)' }}>
            Nothing on the desk yet. Send yourself a test enquiry from the website — it will
            arrive here as a task with its reply already drafted, waiting for your yes.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-[#1B2A4A]/8">
            {work.tasks.map((t) => (
              <li key={t.id} className="py-3">
                <details>
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold">{t.title}</span>
                    <StatusChip status={t.status} label={t.statusLabel} />
                    <span className="ml-auto text-xs" style={{ color: 'var(--brand-muted)' }}>
                      {t.when}
                    </span>
                  </summary>
                  <div className="mt-3 flex flex-col gap-3 pl-1">
                    {t.description ? (
                      <p className="text-xs" style={{ color: 'var(--brand-muted)' }}>{t.description}</p>
                    ) : null}
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12px]" style={{ color: 'var(--brand-muted)' }}>
                      {t.agent ? <span>looked after by the {t.agent} agent</span> : null}
                      {t.risk ? <span>risk: {t.risk} — {t.risk === 'high' ? 'never sends without you' : 'handled carefully'}</span> : null}
                    </div>
                    {t.events.length > 0 ? (
                      <ol className="flex flex-col gap-1">
                        {t.events.map((e, i) => (
                          <li key={i} className="flex items-baseline gap-2 text-xs">
                            <span className="w-24 shrink-0" style={{ color: 'var(--brand-muted)' }}>{e.when}</span>
                            <span>{e.summary}</span>
                          </li>
                        ))}
                      </ol>
                    ) : null}
                    {t.evidence.length > 0 ? (
                      <div className="rounded-2xl border border-[#1B2A4A]/10 p-3">
                        <p className="mb-2 text-[12px] uppercase" style={{ letterSpacing: '0.14em', color: 'var(--brand-muted)' }}>
                          the proof
                        </p>
                        <ul className="flex flex-col gap-2">
                          {t.evidence.map((e, i) => (
                            <li key={i} className="text-xs">
                              <span className="font-semibold">{e.kind.replace('_', ' ')}</span>
                              {e.approvedBy ? <span style={{ color: 'var(--brand-muted)' }}> · {e.approvedBy}</span> : null}
                              <span style={{ color: 'var(--brand-muted)' }}> · {e.when}</span>
                              <p className="mt-0.5 whitespace-pre-wrap" style={{ color: 'var(--brand-muted)' }}>{e.summary}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {t.outcome ? <p className="text-xs font-semibold">{t.outcome}</p> : null}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-3xl border border-[#1B2A4A]/12 bg-[color:var(--brand-surface)]/90 p-5 shadow-[0_20px_50px_rgba(27,42,74,0.08)] backdrop-blur-xl">
        <p className="mb-1 text-[12px] uppercase" style={{ letterSpacing: '0.16em', color: 'var(--brand-muted)' }}>
          proof · the ledger of what actually happened
        </p>
        {work.proof.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--brand-muted)' }}>
            Every completed piece of work leaves evidence here — what happened, who said yes,
            and when.
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-[#1B2A4A]/8">
            {work.proof.map((e, i) => (
              <li key={i} className="flex items-baseline gap-3 py-2 text-xs">
                <span className="w-24 shrink-0" style={{ color: 'var(--brand-muted)' }}>{e.when}</span>
                <span className="shrink-0 font-semibold">{e.kind.replace('_', ' ')}</span>
                <span className="min-w-0 truncate" style={{ color: 'var(--brand-muted)' }}>{e.summary}</span>
                {e.approvedBy ? <span className="ml-auto shrink-0" style={{ color: 'var(--brand-muted)' }}>{e.approvedBy}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
