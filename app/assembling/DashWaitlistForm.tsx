'use client';

import { useState } from 'react';

/**
 * assembling waitlist capture (pre-launch). Single email field → POST /api/dash-waitlist
 * with role 'earner' (the general "tell me when assembling is live" bucket). That route
 * notifies assembl@assembl.co.nz, persists to public.dash_waitlist, and adds the
 * contact to the Brevo mailing list tagged source:'dash-waitlist'.
 *
 * assembling is pre-launch — this is the only actionable thing on the page. Type stays
 * on the assembling faces (Lato + Space Mono); no Cormorant on assembling surfaces.
 *
 * Privacy Act 2020: clear single-purpose consent under the field, no marketing
 * auto-opt-in — we email once, at launch.
 */

type State = 'idle' | 'submitting' | 'done' | 'error';

export function DashWaitlistForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'submitting') return;
    setState('submitting');
    setError(null);
    try {
      const res = await fetch('/api/dash-waitlist', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ role: 'earner', email: email.trim() }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (!res.ok) {
        setError(data?.error ?? "We couldn't add you just now. Please try again.");
        setState('error');
        return;
      }
      setState('done');
    } catch {
      setError("We couldn't reach the server. Please try again.");
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <div
        id="waitlist"
        role="status"
        style={{
          maxWidth: 460,
          padding: '20px 24px',
          borderRadius: 18,
          background: '#FFF7EC',
          border: '1px solid #EFEADC',
          color: '#3a3832',
          fontWeight: 600,
        }}
      >
        We&rsquo;ll be in touch — your email is on the list.
      </div>
    );
  }

  return (
    <form id="waitlist" onSubmit={onSubmit} style={{ maxWidth: 460 }}>
      <div className="bd-mono" style={{ fontSize: 11.5, letterSpacing: '.14em', textTransform: 'uppercase', color: '#C79B1F', marginBottom: 10 }}>
        Join the waitlist
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.co.nz"
          aria-label="Email address"
          autoComplete="email"
          style={{
            flex: '1 1 220px',
            minWidth: 0,
            padding: '14px 18px',
            borderRadius: 99,
            border: '1px solid #EFEADC',
            background: '#FFFFFF',
            color: '#3a3832',
            fontSize: 16,
          }}
        />
        <button
          type="submit"
          disabled={state === 'submitting'}
          style={{
            flex: 'none',
            background: '#BFA37A',
            color: '#3a3832',
            padding: '14px 26px',
            borderRadius: 99,
            fontWeight: 700,
            fontSize: 15,
            border: 'none',
            cursor: state === 'submitting' ? 'wait' : 'pointer',
            boxShadow: '0 6px 20px rgba(255,212,42,.5)',
            opacity: state === 'submitting' ? 0.7 : 1,
          }}
        >
          {state === 'submitting' ? 'Adding…' : 'Join the waitlist'}
        </button>
      </div>
      {state === 'error' && error ? (
        <p role="alert" style={{ marginTop: 10, fontSize: 13, color: '#a3341f' }}>
          {error}
        </p>
      ) : null}
      <p style={{ marginTop: 12, fontSize: 12.5, lineHeight: 1.5, color: '#8a8678' }}>
        assembling is pre-launch. We&rsquo;ll email you once — when it&rsquo;s live. No marketing, no spam.
        NZ-only. You can ask us to remove your details any time.
      </p>
    </form>
  );
}
