'use client';

/**
 * BeatLeadForm — the real "I'm a publisher" / "I want to advertise" capture on
 * the /beat (Beat by assembl) microsite. One form, two roles via a segmented
 * toggle, posting to POST /api/beat/lead (recordLead → email + lead_inquiries +
 * Brevo). Fail-soft. Styled with the microsite's own beat.module.css so it sits
 * inside the ported share design rather than the global site system.
 */

import { useState } from 'react';
import styles from '@/app/beat/beat.module.css';

type Role = 'publisher' | 'advertiser';
type Status = 'idle' | 'submitting' | 'done' | 'error';

const COPY: Record<
  Role,
  { orgLabel: string; msgLabel: string; msgPlaceholder: string; cta: string }
> = {
  publisher: {
    orgLabel: 'Your product or company',
    msgLabel: 'Where would Beat run? (optional)',
    msgPlaceholder: 'e.g. the report-generation spinner in our accounting app',
    cta: 'Talk to us about publishing',
  },
  advertiser: {
    orgLabel: 'Your brand or agency',
    msgLabel: 'What would you want to reach? (optional)',
    msgPlaceholder: 'e.g. NZ finance decision-makers, a Q3 brand campaign',
    cta: 'Talk to us about advertising',
  },
};

export function BeatLeadForm() {
  const [role, setRole] = useState<Role>('publisher');
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

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
      const res = await fetch('/api/beat/lead', {
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

  if (status === 'done') {
    return (
      <div className={styles.form}>
        <div className={styles.formDone}>
          <span className={styles.tick} aria-hidden>
            ✓
          </span>
          <p>Got it. Kate Hudson will reply within 24 hours.</p>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.roleToggle} role="tablist" aria-label="Choose how to get started">
        {(['publisher', 'advertiser'] as const).map((value) => {
          const active = role === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => switchRole(value)}
              className={`${styles.roleBtn} ${active ? styles.active : ''}`}
            >
              {value === 'publisher' ? "I'm a publisher" : 'I want to advertise'}
            </button>
          );
        })}
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="beat-name">
            Your name (optional)
          </label>
          <input
            id="beat-name"
            name="name"
            type="text"
            autoComplete="name"
            className={styles.input}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="beat-email">
            Email
          </label>
          <input
            id="beat-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="beat-org">
          {copy.orgLabel}
        </label>
        <input id="beat-org" name="organisation" type="text" className={styles.input} />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="beat-message">
          {copy.msgLabel}
        </label>
        <textarea
          id="beat-message"
          name="message"
          rows={3}
          placeholder={copy.msgPlaceholder}
          className={styles.textarea}
        />
      </div>

      {error && <p className={styles.formError}>{error}</p>}

      <button type="submit" disabled={status === 'submitting'} className={styles.submit}>
        {status === 'submitting' ? 'Sending…' : copy.cta}
        <span aria-hidden>→</span>
      </button>
      <p className={styles.formFine}>
        A named human in Aotearoa reads every message. No spam, no list-selling.
      </p>
    </form>
  );
}
