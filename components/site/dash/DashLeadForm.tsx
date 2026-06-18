'use client';

/**
 * DashLeadForm — the "Become a publisher" / "Become an advertiser" capture for
 * the /dash landing page. One form, two roles (segmented toggle), posting to
 * POST /api/dash/lead (recordLead → email + lead_inquiries). Fail-soft.
 */

import { useId, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

type Role = 'publisher' | 'advertiser';
type Status = 'idle' | 'submitting' | 'done' | 'error';

const COPY: Record<Role, { heading: string; sub: string; cta: string; orgLabel: string; msgLabel: string; msgPlaceholder: string }> = {
  publisher: {
    heading: 'Become a publisher',
    sub: 'Turn your "thinking…" moment into revenue. Earn 55% of every ad served in your tool. Two lines of code to install.',
    cta: 'Talk to us about publishing',
    orgLabel: 'Your product or company',
    msgLabel: 'Where would Dash run? (optional)',
    msgPlaceholder: 'e.g. the report-generation spinner in our accounting app',
  },
  advertiser: {
    heading: 'Become an advertiser',
    sub: 'Reach verified NZ B2B attention in the exact moment people wait inside the tools they work in. Calm, brand-safe, NZ-only.',
    cta: 'Talk to us about advertising',
    orgLabel: 'Your brand or agency',
    msgLabel: 'What would you want to reach? (optional)',
    msgPlaceholder: 'e.g. NZ finance decision-makers, a Q3 brand campaign',
  },
};

export function DashLeadForm() {
  const [role, setRole] = useState<Role>('publisher');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const emailId = useId();
  const nameId = useId();
  const orgId = useId();
  const msgId = useId();

  const copy = COPY[role];

  function switchRole(next: Role) {
    if (next === role) return;
    setRole(next);
    setStatus('idle');
    setError(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'submitting') return;
    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus('submitting');
    setError(null);

    try {
      const res = await fetch('/api/dash/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          role,
          email: String(data.get('email') ?? '').trim(),
          name: String(data.get('name') ?? '').trim() || undefined,
          organisation: String(data.get('organisation') ?? '').trim() || undefined,
          message: String(data.get('message') ?? '').trim() || undefined,
        }),
      });

      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        setError(b.error ?? 'Something went wrong. Please try again.');
        setStatus('error');
        return;
      }
      form.reset();
      setStatus('done');
    } catch {
      setError('Network hiccup. Please try again, or email assembl@assembl.co.nz.');
      setStatus('error');
    }
  }

  return (
    <div
      id="get-started"
      className="rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-white/60 p-6 md:p-8"
    >
      <div
        role="tablist"
        aria-label="Choose how to get started"
        className="inline-flex rounded-full border border-[rgba(35,33,31,0.14)] bg-[#FAF7F2] p-1"
      >
        {(['publisher', 'advertiser'] as const).map((value) => {
          const active = role === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => switchRole(value)}
              className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                active
                  ? 'bg-[color:var(--assembl-pounamu)] text-white'
                  : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
              }`}
            >
              {value === 'publisher' ? "I'm a publisher" : "I'm an advertiser"}
            </button>
          );
        })}
      </div>

      <h3 className="mt-6 font-display text-2xl font-normal text-[color:var(--text-primary)]">
        {copy.heading}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--text-body)]">{copy.sub}</p>

      {status === 'done' ? (
        <div className="mt-6 flex items-start gap-3 rounded-[8px] border border-[color:var(--assembl-pounamu)] bg-[color:var(--assembl-pounamu-paper)] p-4">
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--assembl-pounamu)]" aria-hidden />
          <p className="text-sm leading-relaxed text-[color:var(--text-body)]">
            Got it — thank you. Kate reads these herself and will be in touch, usually within a
            working day.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Field id={nameId} name="name" label="Your name (optional)" autoComplete="name" />
          <Field id={emailId} name="email" label="Email" type="email" required autoComplete="email" />
          <Field id={orgId} name="organisation" label={copy.orgLabel} />
          <div>
            <label htmlFor={msgId} className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
              {copy.msgLabel}
            </label>
            <textarea
              id={msgId}
              name="message"
              rows={3}
              placeholder={copy.msgPlaceholder}
              className="mt-2 w-full rounded-[8px] border border-[rgba(35,33,31,0.16)] bg-white px-3.5 py-2.5 text-sm text-[color:var(--text-primary)] outline-none transition-colors placeholder:text-[color:var(--text-secondary)]/70 focus:border-[color:var(--assembl-pounamu)]"
            />
          </div>

          {error && <p className="text-sm text-[#9A3412]">{error}</p>}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--assembl-pounamu)] px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[color:var(--assembl-pounamu-deep)] disabled:opacity-60"
          >
            {status === 'submitting' ? 'Sending…' : copy.cta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
          <p className="text-xs leading-relaxed text-[color:var(--text-secondary)]">
            A named human in Aotearoa reads every message. No spam, no list-selling.
          </p>
        </form>
      )}
    </div>
  );
}

function Field({
  id,
  name,
  label,
  type = 'text',
  required = false,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-[8px] border border-[rgba(35,33,31,0.16)] bg-white px-3.5 py-2.5 text-sm text-[color:var(--text-primary)] outline-none transition-colors placeholder:text-[color:var(--text-secondary)]/70 focus:border-[color:var(--assembl-pounamu)]"
      />
    </div>
  );
}
