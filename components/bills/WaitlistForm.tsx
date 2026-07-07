'use client';

import { useState, type FormEvent } from 'react';
import { Check, Lock } from 'lucide-react';

type Status = 'idle' | 'submitting' | 'ok' | 'already' | 'error';

const REGIONS = ['Auckland', 'Wellington', 'Christchurch', 'Other'];
const PAINS = [
  'Power bill',
  'Insurance',
  'Broadband / mobile',
  'Council rates',
  'Subscriptions creeping up',
  'Mortgage refix',
  'Business overheads',
];

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
      region: String(data.get('region') ?? '').trim(),
      biggestBillPain: String(data.get('biggestBillPain') ?? '').trim(),
    };
    try {
      const res = await fetch('/api/bills/waitlist', {
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
      <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--b-teal-soft)', border: '1px solid var(--b-teal-line)' }}>
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full text-white" style={{ background: 'var(--b-teal)' }} aria-hidden>
          <Check size={20} />
        </div>
        <p className="text-lg font-semibold" style={{ fontFamily: 'var(--font-bills-display)', color: 'var(--b-ink)' }}>
          {status === 'already' ? 'You’re already on the list' : 'You’re on the waitlist'}
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--b-muted)' }}>
          We’ll be in touch as we open the beta, region by region.
        </p>
      </div>
    );
  }

  const inputStyle = { background: 'var(--b-surface)', borderColor: 'var(--b-line)', color: 'var(--b-ink)' } as const;
  const labelStyle = { color: 'var(--b-muted)' } as const;

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium" style={labelStyle}>Your name</span>
          <input name="name" required autoComplete="name" placeholder="Kate" className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2" style={inputStyle} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium" style={labelStyle}>Email</span>
          <input name="email" type="email" required autoComplete="email" placeholder="you@example.co.nz" className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2" style={inputStyle} />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium" style={labelStyle}>Region</span>
          <select name="region" required defaultValue="" className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2" style={inputStyle}>
            <option value="" disabled>Choose…</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium" style={labelStyle}>Biggest bill pain</span>
          <select name="biggestBillPain" defaultValue="" className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2" style={inputStyle}>
            <option value="">Optional…</option>
            {PAINS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>

      {status === 'error' && <p className="text-sm" style={{ color: 'var(--b-coral-deep)' }}>{error}</p>}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition disabled:opacity-60"
        style={{ background: 'var(--b-teal)', fontFamily: 'var(--font-bills-display)' }}
      >
        {status === 'submitting' ? 'Joining…' : 'Join the waitlist'}
      </button>

      {/* Privacy Act 2020 collection notice (IPP 3 / 3A). */}
      <p className="flex items-start gap-2 text-[11px] leading-relaxed" style={{ color: 'var(--b-faint)' }}>
        <Lock size={13} className="mt-0.5 shrink-0" />
        <span>
          <strong style={{ color: 'var(--b-muted)' }}>Privacy (NZ Privacy Act 2020).</strong>{' '}
          We collect your name, email and region only to run the waitlist and tell you when Assembl Bills opens in your area. We don’t sell your data, and you can ask us to correct or delete it any time at assembl@assembl.co.nz.
        </span>
      </p>
    </form>
  );
}
