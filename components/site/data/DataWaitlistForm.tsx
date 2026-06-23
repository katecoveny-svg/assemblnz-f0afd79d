'use client';

/**
 * DataWaitlistForm — the lead-capture surface for the /data page.
 *
 * One form, two intents (segmented toggle):
 *   - 'api-key'      → request a free Pulse-tier key (Phase 1 is a waitlist)
 *   - 'talk-to-kate' → a Pilot-Sprint-style consult about higher tiers
 *
 * Both submit to POST /api/data-waitlist, which routes through the shared
 * recordLead() pipeline (emails Kate + writes a durable lead_inquiries row).
 * Fail-soft: the endpoint 200s on a captured lead, so we show a warm
 * confirmation and never leave the visitor guessing.
 */

import { useId, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

type Intent = 'api-key' | 'talk-to-kate';
type Status = 'idle' | 'submitting' | 'done' | 'error';

const COPY: Record<
  Intent,
  { heading: string; sub: string; cta: string; useCaseLabel: string; useCasePlaceholder: string }
> = {
  'api-key': {
    heading: 'Get a free API key',
    sub: 'Join the Pulse waitlist. We send your key by email when the endpoint opens — no card, no commitment.',
    cta: 'Request a free key',
    useCaseLabel: 'What would you watch? (optional)',
    useCasePlaceholder: 'e.g. Commerce Commission decisions for our compliance dashboard',
  },
  'talk-to-kate': {
    heading: 'Talk to Kate',
    sub: 'Tell us what you need — all sources, a custom feed, an SLA. Kate replies herself, usually within a working day.',
    cta: 'Send it to Kate',
    useCaseLabel: 'What are you building? (optional)',
    useCasePlaceholder: 'e.g. a sanctions-screening step inside our onboarding flow',
  },
};

export function DataWaitlistForm() {
  const [intent, setIntent] = useState<Intent>('api-key');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const emailId = useId();
  const orgId = useId();
  const useCaseId = useId();

  const copy = COPY[intent];

  function switchIntent(next: Intent) {
    if (next === intent) return;
    setIntent(next);
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
      const res = await fetch('/api/data-waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          intent,
          email: String(data.get('email') ?? '').trim(),
          name: String(data.get('name') ?? '').trim() || undefined,
          organisation: String(data.get('organisation') ?? '').trim() || undefined,
          useCase: String(data.get('useCase') ?? '').trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? 'Something went wrong. Please try again.');
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
      id="get-access"
      className="rounded-[10px] border border-[rgba(35,33,31,0.12)] bg-white/60 p-6 md:p-8"
    >
      {/* Intent toggle */}
      <div
        role="tablist"
        aria-label="Choose how to get started"
        className="inline-flex rounded-full border border-[rgba(35,33,31,0.14)] bg-[#FFF7EC] p-1"
      >
        {(['api-key', 'talk-to-kate'] as const).map((value) => {
          const active = intent === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => switchIntent(value)}
              className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                active
                  ? 'bg-[color:var(--assembl-pounamu)] text-white'
                  : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
              }`}
            >
              {value === 'api-key' ? 'Free API key' : 'Talk to Kate'}
            </button>
          );
        })}
      </div>

      <h3 className="mt-6 font-display text-[clamp(1.6rem,3vw,2.2rem)] font-light leading-tight text-[color:var(--text-primary)]">
        {copy.heading}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[color:var(--text-body)]">
        {copy.sub}
      </p>

      {status === 'done' ? (
        <div className="mt-6 flex items-start gap-3 rounded-[8px] border border-[rgba(58,56,50,0.3)] bg-[color:var(--assembl-pounamu-paper)] p-5">
          <Check className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--assembl-pounamu)]" aria-hidden />
          <div>
            <p className="text-sm font-medium text-[color:var(--text-primary)]">
              {intent === 'api-key' ? "You're on the list." : 'Sent to Kate.'}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[color:var(--text-body)]">
              {intent === 'api-key'
                ? 'We email your Pulse key the moment the endpoint opens. Watch your inbox.'
                : 'Kate has it and will reply herself, usually within a working day.'}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <Field id={emailId} name="email" type="email" label="Work email" required placeholder="you@firm.co.nz" autoComplete="email" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id={`${emailId}-name`} name="name" label="Your name (optional)" placeholder="First Last" autoComplete="name" />
            <Field id={orgId} name="organisation" label="Organisation (optional)" placeholder="Firm or company" autoComplete="organization" />
          </div>
          <div>
            <label htmlFor={useCaseId} className="block font-mono text-[11px] uppercase tracking-[0.14em] text-[color:var(--text-secondary)]">
              {copy.useCaseLabel}
            </label>
            <textarea
              id={useCaseId}
              name="useCase"
              rows={2}
              placeholder={copy.useCasePlaceholder}
              className="mt-2 w-full rounded-[8px] border border-[rgba(35,33,31,0.16)] bg-[#FFF7EC] px-4 py-3 text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)]/70 focus:border-[color:var(--assembl-pounamu)] focus:outline-none focus:ring-2 focus:ring-[color:var(--assembl-pounamu)]/30"
            />
          </div>

          {status === 'error' && error ? (
            <p role="alert" className="text-sm text-[#9B2C2C]">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--assembl-pounamu)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[color:var(--assembl-pounamu-deep)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)] focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {status === 'submitting' ? 'Sending…' : copy.cta}
            {status !== 'submitting' ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
          </button>

          <p className="text-xs leading-relaxed text-[color:var(--text-secondary)]">
            Your details reach a named human in Aotearoa. No spam, no resale — just your key and the occasional product note.
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
  placeholder,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
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
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-2 w-full rounded-[8px] border border-[rgba(35,33,31,0.16)] bg-[#FFF7EC] px-4 py-3 text-sm text-[color:var(--text-primary)] placeholder:text-[color:var(--text-secondary)]/70 focus:border-[color:var(--assembl-pounamu)] focus:outline-none focus:ring-2 focus:ring-[color:var(--assembl-pounamu)]/30"
      />
    </div>
  );
}
