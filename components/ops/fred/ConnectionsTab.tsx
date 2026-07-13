import type { ConnectionsView } from '@/lib/os/connections';

/**
 * Connections — connected systems and what agents may ask of them, honestly.
 * Green means live; amber means it works but every action waits for a yes;
 * quiet grey means declared, not connected — nothing pretends.
 */

const STATE_META: Record<string, { label: string; tone: string }> = {
  connected: { label: 'connected', tone: '#3f7355' },
  approval_gated: { label: 'waits for your yes', tone: '#8a6d1f' },
  not_connected: { label: 'not connected yet', tone: '#8a9499' },
};

function StateChip({ state }: { state: string }) {
  const meta = STATE_META[state] ?? STATE_META.not_connected;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] uppercase"
      style={{ letterSpacing: '0.12em', color: meta.tone, borderColor: `${meta.tone}33` }}
    >
      <i aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: meta.tone }} />
      {meta.label}
    </span>
  );
}

export function ConnectionsTab({ connections }: { connections: ConnectionsView }) {
  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-3xl border border-[#1B2A4A]/12 bg-[color:var(--brand-surface)]/90 p-5 shadow-[0_20px_50px_rgba(27,42,74,0.08)] backdrop-blur-xl">
        <p className="mb-3 text-[10px] uppercase" style={{ letterSpacing: '0.16em', color: 'var(--brand-muted)' }}>
          connected systems
        </p>
        <ul className="flex flex-col divide-y divide-[#1B2A4A]/8">
          {connections.systems.map((s) => (
            <li key={s.name} className="flex flex-wrap items-baseline gap-3 py-3">
              <span className="text-sm font-semibold">{s.name}</span>
              <StateChip state={s.state} />
              <span className="basis-full text-xs" style={{ color: 'var(--brand-muted)' }}>
                {s.role} — {s.note}
              </span>
              {s.actions && s.actions.length > 0 ? (
                <span className="basis-full">
                  {s.actions.map((a) => (
                    <a
                      key={a.href}
                      href={a.href}
                      className="mr-3 text-xs underline underline-offset-2"
                      style={{ color: '#3f7373' }}
                    >
                      {a.label}
                    </a>
                  ))}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-3xl border border-[#1B2A4A]/12 bg-[color:var(--brand-surface)]/90 p-5 shadow-[0_20px_50px_rgba(27,42,74,0.08)] backdrop-blur-xl">
        <p className="mb-3 text-[10px] uppercase" style={{ letterSpacing: '0.16em', color: 'var(--brand-muted)' }}>
          what agents may ask for
        </p>
        <ul className="flex flex-col divide-y divide-[#1B2A4A]/8">
          {connections.capabilities.map((c) => (
            <li key={c.key} className="flex flex-wrap items-baseline gap-3 py-2.5">
              <span className="text-xs font-semibold">{c.key.replace(/_/g, ' ')}</span>
              <StateChip state={c.state} />
              <span className="basis-full text-xs" style={{ color: 'var(--brand-muted)' }}>
                {c.description}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
