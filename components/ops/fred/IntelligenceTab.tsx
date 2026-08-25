import type { IntelligenceView } from '@/lib/os/intelligence';

/**
 * Intelligence — signals from what actually happened and what deserves
 * attention next. Every number is computed from real rows; every
 * recommendation names its action. Calm canon: one card of signals, one
 * short list of next moves.
 */
export function IntelligenceTab({ intel }: { intel: IntelligenceView }) {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl border border-[#1B2A4A]/12 bg-[color:var(--brand-surface)]/90 p-5 shadow-[0_20px_50px_rgba(27,42,74,0.08)] backdrop-blur-xl">
        <p className="mb-3 text-[12px] uppercase" style={{ letterSpacing: '0.16em', color: 'var(--brand-muted)' }}>
          signals · from real activity
        </p>
        {intel.signals.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--brand-muted)' }}>
            Signals appear once the business data connection is live.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {intel.signals.map((s) => (
              <div key={s.label} className="rounded-2xl border border-[#1B2A4A]/10 p-4">
                <p className="text-2xl font-semibold">{s.value}</p>
                <p className="mt-1 text-[12px] uppercase" style={{ letterSpacing: '0.1em', color: 'var(--brand-muted)' }}>
                  {s.label}
                </p>
                <p className="mt-1 text-xs" style={{ color: 'var(--brand-muted)' }}>{s.hint}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-[#1B2A4A]/12 bg-[color:var(--brand-surface)]/90 p-5 shadow-[0_20px_50px_rgba(27,42,74,0.08)] backdrop-blur-xl">
        <p className="mb-3 text-[12px] uppercase" style={{ letterSpacing: '0.16em', color: 'var(--brand-muted)' }}>
          what deserves attention
        </p>
        <ul className="flex flex-col divide-y divide-[#1B2A4A]/8">
          {intel.recommendations.map((r) => (
            <li key={r.text} className="py-3">
              <a href={r.href} className="group flex items-baseline gap-3 text-sm no-underline" style={{ color: 'inherit' }}>
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full"
                  style={{ background: r.impact === 'high' ? '#8a6d1f' : '#8a9499' }}
                />
                <span className="group-hover:underline">{r.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
