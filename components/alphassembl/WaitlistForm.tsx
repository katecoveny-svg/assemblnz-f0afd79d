'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'submitting' | 'ok' | 'already' | 'error';

export function WaitlistForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setError('');
    const form = e.currentTarget;
    const data = new FormData(form);
    const body = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      suburb: String(data.get('suburb') ?? '').trim(),
    };
    try {
      const res = await fetch('/api/alphassembl/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error ?? 'Something went wrong — please try again.');
        setStatus('error');
        return;
      }
      setStatus(json.alreadyOnList ? 'already' : 'ok');
      form.reset();
    } catch {
      setError('Network error — please try again.');
      setStatus('error');
    }
  }

  if (status === 'ok' || status === 'already') {
    return (
      <div
        className="rounded-2xl border p-8 text-center"
        style={{ borderColor: '#e5e7eb', background: 'var(--a-grey)' }}
      >
        <div
          className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full text-white"
          style={{ background: 'var(--a-success)' }}
          aria-hidden
        >
          ✓
        </div>
        <p className="text-lg font-semibold" style={{ fontFamily: 'var(--font-alpha-display)', color: 'var(--a-navy)' }}>
          {status === 'already' ? 'You’re already on the list' : 'You’re on the waitlist'}
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--a-muted)' }}>
          We’ll be in touch as we open the beta to more New Zealand dog owners.
        </p>
      </div>
    );
  }

  const inputStyle = {
    background: 'var(--a-paper)',
    borderColor: '#d5dae2',
    color: 'var(--a-ink)',
  } as const;

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--a-muted)' }}>Your name</span>
          <input
            name="name"
            required
            autoComplete="name"
            placeholder="Kate"
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
            style={inputStyle}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--a-muted)' }}>Suburb (optional)</span>
          <input
            name="suburb"
            autoComplete="address-level2"
            placeholder="Kohimarama"
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
            style={inputStyle}
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium" style={{ color: 'var(--a-muted)' }}>Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.co.nz"
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2"
          style={inputStyle}
        />
      </label>

      {status === 'error' && (
        <p className="text-sm" style={{ color: '#ef4444' }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition disabled:opacity-60"
        style={{ background: 'var(--a-navy)', fontFamily: 'var(--font-alpha-display)' }}
      >
        {status === 'submitting' ? 'Joining…' : 'Join the waitlist'}
      </button>
      <p className="text-center text-xs" style={{ color: 'var(--a-muted)' }}>
        No spam. We’ll only email you about the Alphassembl beta.
      </p>
    </form>
  );
}
