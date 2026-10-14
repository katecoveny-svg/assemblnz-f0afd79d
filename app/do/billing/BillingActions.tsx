'use client';
import { useState } from 'react';
export function BillingActions({ subscribed }: { subscribed: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function open() {
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/do/billing/${subscribed ? 'portal' : 'checkout'}`, { method: 'POST', cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || typeof data.url !== 'string') throw new Error(data.message || 'Billing is temporarily unavailable.');
      const url = new URL(data.url);
      if (url.protocol !== 'https:' || !['checkout.stripe.com','billing.stripe.com'].includes(url.hostname)) throw new Error('The billing link could not be verified.');
      window.location.assign(url.href);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Billing is temporarily unavailable.'); setBusy(false); }
  }
  return <><button className="btn-primary" disabled={busy} onClick={open}>{busy ? 'Opening secure billing…' : subscribed ? 'Manage or cancel subscription' : 'Continue to secure checkout'}</button>{error && <p role="alert">{error}</p>}</>;
}
