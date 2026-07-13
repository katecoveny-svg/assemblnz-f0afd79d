'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';

export function PilotSprintCheckout({ configured }: { configured: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/pilot-sprint/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          business: data.get('business'),
          email: data.get('email'),
          workflow: data.get('workflow'),
          accepted: data.get('accepted') === 'on',
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.url) throw new Error(result.error ?? 'Could not start checkout.');
      window.location.assign(result.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not start checkout.');
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <div className="rounded-[18px] border border-[rgba(35,33,31,0.12)] bg-white/70 p-6">
        <p className="font-mono text-eyebrow uppercase text-[color:var(--assembl-pounamu)]">secure checkout</p>
        <p className="mt-3 text-sm leading-6 text-[color:var(--text-body)]">
          Stripe is not configured in this environment yet. The fit-check route is live; add the production Stripe secret to activate one-click payment.
        </p>
        <a href="mailto:assembl@assembl.co.nz?subject=Pilot%20Sprint%20payment" className="mt-5 inline-flex font-semibold text-[color:var(--assembl-pounamu)] underline">
          arrange payment with assembl
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[18px] border border-[rgba(35,33,31,0.12)] bg-white/75 p-6 shadow-[0_18px_55px_rgba(35,33,31,0.07)]">
      <div>
        <p className="font-mono text-eyebrow uppercase text-[color:var(--assembl-pounamu)]">approved founding pilot · secure checkout</p>
        <h3 className="mt-2 font-display text-3xl font-light">NZ$1,725 including GST</h3>
        <p className="mt-2 text-sm leading-6 text-[color:var(--text-body)]">For customers who have already agreed the workflow and start date. New here? Book the fit check first.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-xs font-semibold">Your name<input name="name" required maxLength={120} autoComplete="name" className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm font-normal" /></label>
        <label className="grid gap-1 text-xs font-semibold">Business<input name="business" required maxLength={180} autoComplete="organization" className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm font-normal" /></label>
      </div>
      <label className="grid gap-1 text-xs font-semibold">Invoice email<input name="email" type="email" required maxLength={200} autoComplete="email" className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm font-normal" /></label>
      <label className="grid gap-1 text-xs font-semibold">Agreed workflow<textarea name="workflow" required maxLength={500} rows={4} className="rounded-xl border border-black/15 bg-white px-3 py-3 text-sm font-normal" placeholder="The one workflow agreed with assembl…" /></label>
      <label className="flex items-start gap-3 text-xs leading-5 text-[color:var(--text-body)]">
        <input name="accepted" type="checkbox" required className="mt-1" />
        <span>
          I confirm this workflow and price have already been agreed, and I have reviewed the{' '}
          <Link href="/legal/terms" className="underline">terms</Link> and{' '}
          <Link href="/legal/privacy" className="underline">privacy notice</Link>.
        </span>
      </label>
      {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
      <button type="submit" disabled={busy} className="cta-primary inline-flex min-h-12 items-center justify-center px-7 disabled:opacity-60">{busy ? 'opening secure checkout…' : 'Pay NZ$1,725 securely'}</button>
      <p className="text-xs leading-5 text-[color:var(--text-body)]">Founding price: NZ$1,500 + NZ$225 GST. Stripe collects payment and billing details; assembl never receives card numbers.</p>
    </form>
  );
}
