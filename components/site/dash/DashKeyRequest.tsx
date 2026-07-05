'use client';

/**
 * DashKeyRequest — early-access "request a key" capture for the /dash/sdk page.
 *
 * The SDK isn't published yet: `npm install @assembl/dash` and the CDN script
 * tag both 404, so we never show a copy-paste install that fails at step one.
 * Instead we capture an email and POST it to the proven /api/dash-waitlist path
 * (role: publisher, tagged as an SDK key request), with the same mailto
 * fallback the landing-page waitlist uses. Swap this back for the real install
 * snippet once the package ships.
 *
 * Styled in the locked Birdie palette (white + champagne #BFA37A + charcoal
 * #3a3832) so it sits inside the SDK doc.
 */

import { useId, useState } from 'react';

type Status = 'idle' | 'submitting' | 'done' | 'error';

export function DashKeyRequest() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const emailId = useId();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'submitting') return;
    const form = e.currentTarget;
    const email = String(new FormData(form).get('email') ?? '').trim();

    setStatus('submitting');
    setError(null);
    try {
      const res = await fetch('/api/dash-waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          role: 'publisher',
          email,
          message: 'SDK early-access key request (from /dash/sdk)',
        }),
      });
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        setError(b.error ?? 'Something went wrong. Please email assembl@assembl.co.nz.');
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
      style={{
        background: '#FFF7EC',
        border: '1px solid #F0E4C4',
        borderRadius: 16,
        padding: '22px 22px 18px',
      }}
    >
      {status === 'done' ? (
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#3a3832' }}>
          Got it — thank you. We&apos;ll be in touch with your key as we open early access, usually
          within a working day.
        </p>
      ) : (
        <form onSubmit={onSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <label htmlFor={emailId} className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
            Your email
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            required
            placeholder="you@company.co.nz"
            autoComplete="email"
            style={{
              flex: '1 1 220px',
              minWidth: 0,
              padding: '14px 16px',
              borderRadius: 99,
              border: '1.5px solid #E7E1D2',
              background: '#fff',
              fontSize: 15,
              color: '#3a3832',
            }}
          />
          <button
            type="submit"
            disabled={status === 'submitting'}
            style={{
              flex: 'none',
              background: '#BFA37A',
              color: '#3a3832',
              padding: '14px 26px',
              borderRadius: 99,
              fontWeight: 700,
              fontSize: 15,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(191,163,122,.5)',
            }}
          >
            {status === 'submitting' ? 'Sending…' : 'Request a key'}
          </button>
        </form>
      )}

      {error && (
        <p style={{ margin: '12px 0 0', fontSize: 14, color: '#9A3412', fontWeight: 600 }}>{error}</p>
      )}

      <p style={{ margin: '14px 0 0', fontSize: 13.5, color: '#8a887e' }}>
        Or email{' '}
        <a
          href="mailto:assembl@assembl.co.nz?subject=Dash%20SDK%20early%20access"
          style={{ color: '#46443c', textDecoration: 'underline' }}
        >
          assembl@assembl.co.nz
        </a>
        . No spam — a named human in Aotearoa reads every request.
      </p>
    </div>
  );
}
