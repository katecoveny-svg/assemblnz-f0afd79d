'use client';

/**
 * DashLeadForm — the "Become a publisher" / "Become an advertiser" capture for
 * the /dash landing page (the #waitlist section). One form, two roles (segmented
 * toggle), posting to POST /api/dash-waitlist (dash_waitlist row + email +
 * Brevo). Fail-soft. Styled with the dash-kit classes (.card / .field / .btn /
 * .pill) so it sits inside the new cream·forest·sage design system.
 */

import { useId, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

type Role = 'publisher' | 'advertiser';
type Status = 'idle' | 'submitting' | 'done' | 'error';

const COPY: Record<
  Role,
  { heading: string; sub: string; cta: string; orgLabel: string; msgLabel: string; msgPlaceholder: string }
> = {
  publisher: {
    heading: 'Become a publisher',
    sub: 'Your spinner is inventory. Keep 55% of every line it earns. Two lines of code to start.',
    cta: 'Talk to us about publishing',
    orgLabel: 'Your product or company',
    msgLabel: 'Where would dash. run? (optional)',
    msgPlaceholder: 'e.g. the report-generation spinner in our accounting app',
  },
  advertiser: {
    heading: 'Become an advertiser',
    sub: 'Reach NZ professionals in the one second they’re waiting on their tool. One line of text. NZ-only.',
    cta: 'Talk to us about advertising',
    orgLabel: 'Your brand or agency',
    msgLabel: 'What would you want to reach? (optional)',
    msgPlaceholder: 'e.g. NZ finance teams, a Q3 brand campaign',
  },
};

export function DashLeadForm() {
  const [role, setRole] = useState<Role>('publisher');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [messageLength, setMessageLength] = useState(0);
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
    setMessageLength(0);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'submitting') return;
    const form = e.currentTarget;
    const data = new FormData(form);

    setStatus('submitting');
    setError(null);

    try {
      const res = await fetch('/api/dash-waitlist', {
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
      setMessageLength(0);
      setStatus('done');
    } catch {
      setError('Network hiccup. Please try again, or email assembl@assembl.co.nz.');
      setStatus('error');
    }
  }

  return (
    <div className="card" style={{ padding: 28 }}>
      <div
        role="tablist"
        aria-label="Choose how to get started"
        style={{
          display: 'inline-flex',
          gap: 6,
          padding: 5,
          borderRadius: 'var(--r-pill)',
          background: 'var(--surface-2)',
          border: '1px solid var(--line)',
        }}
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
              className={active ? 'btn btn--primary btn--sm' : 'btn btn--sm dash-tab'}
            >
              {value === 'publisher' ? "I'm a publisher" : "I'm an advertiser"}
            </button>
          );
        })}
      </div>

      <h3 className="serif" style={{ fontSize: 26, fontWeight: 600, marginTop: 22, color: 'var(--fg)' }}>
        {copy.heading}
      </h3>
      <p className="body" style={{ marginTop: 8, fontSize: 15 }}>
        {copy.sub}
      </p>

      {status === 'done' ? (
        <div
          style={{
            marginTop: 22,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            padding: 16,
            borderRadius: 'var(--r-md)',
            border: '1.5px solid var(--accent)',
            background: 'var(--sage-pale)',
          }}
        >
          <Check size={20} color="var(--accent)" style={{ flex: 'none', marginTop: 1 }} aria-hidden />
          <p className="body" style={{ fontSize: 15, color: 'var(--fg)' }}>
            Got it — thank you. We read every one of these ourselves and will be in touch, usually
            within a working day.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} style={{ marginTop: 22, display: 'grid', gap: 16 }}>
          <Field id={nameId} name="name" label="Your name (optional)" autoComplete="name" />
          <Field id={emailId} name="email" label="Email" type="email" required autoComplete="email" />
          <Field id={orgId} name="organisation" label={copy.orgLabel} />
          <div className="field-group">
            <label htmlFor={msgId} className="field-label">
              {copy.msgLabel}
            </label>
            <textarea
              id={msgId}
              name="message"
              rows={3}
              maxLength={1000}
              placeholder={copy.msgPlaceholder}
              className="field"
              style={{ resize: 'vertical', minHeight: 92 }}
              onChange={(e) => setMessageLength(e.target.value.length)}
              aria-describedby="dash-msg-counter"
            />
            <div style={{ marginTop: 4, display: 'flex', justifyContent: 'end' }}>
              <span
                id="dash-msg-counter"
                style={{
                  fontFamily: 'var(--ff-mono)',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: messageLength > 900 ? '#9A3412' : 'var(--muted)',
                  fontWeight: messageLength > 900 ? 600 : 'normal',
                }}
                aria-hidden="true"
              >
                {messageLength} / 1000 characters
              </span>
              <span className="sr-only" aria-live="polite">
                {messageLength > 900 ? `${messageLength} / 1000 characters` : ''}
              </span>
            </div>
          </div>

          {error && (
            <p style={{ fontSize: 14, color: '#9A3412', fontWeight: 600 }}>{error}</p>
          )}

          <button type="submit" disabled={status === 'submitting'} className="btn btn--primary" style={{ alignSelf: 'start' }}>
            {status === 'submitting' ? 'Sending…' : copy.cta}
            <ArrowRight aria-hidden />
          </button>
          <p className="field-hint">
            A named human in Aotearoa reads every message. No spam, no list-selling.
          </p>
        </form>
      )}

      <p style={{ marginTop: 16, fontFamily: 'var(--ff-sans)', fontSize: 14, color: 'var(--muted)' }}>
        Or email{' '}
        <a
          href={`mailto:assembl@assembl.co.nz?subject=${encodeURIComponent(`Dash waitlist — ${role}`)}`}
          style={{ color: 'inherit', textDecoration: 'underline' }}
        >
          assembl@assembl.co.nz
        </a>
      </p>
      <style>{`
        .dash-tab {
          background: transparent !important;
          color: var(--muted) !important;
          border: 1.5px solid transparent !important;
          transition: background 0.18s ease, color 0.18s ease;
        }
        .dash-tab:hover {
          background: rgba(58, 56, 50, 0.05) !important;
          color: var(--fg) !important;
        }
        .dash-tab:focus-visible {
          outline: none !important;
          box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px rgba(212, 168, 67, 0.85) !important;
        }
      `}</style>
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
    <div className="field-group">
      <label htmlFor={id} className="field-label">
        {label}
        {required && (
          <span style={{ marginLeft: 4, color: 'var(--gold-text)' }} aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        aria-required={required ? "true" : undefined}
        autoComplete={autoComplete}
        className="field"
      />
    </div>
  );
}
