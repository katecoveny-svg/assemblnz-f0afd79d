'use client';

import { useState, type FormEvent } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';

/**
 * "Notify me when X is live" — the honest coming-next affordance. Files a
 * notify/partner DRAFT into content_approvals (/admin/approvals) for Kate to
 * action. Nothing is sent automatically. Used for Akahu + Gmail/Outlook, which
 * aren't wired yet, so the UI never pretends they work.
 */
export function NotifyInline({
  kind = 'notify',
  target,
  label,
  placeholder = 'you@example.co.nz',
}: {
  kind?: 'notify' | 'partner';
  target: string;
  label: string;
  placeholder?: string;
}) {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === 'sending' || state === 'done') return;
    const email = String(new FormData(e.currentTarget).get('email') ?? '').trim();
    setState('sending');
    try {
      const res = await fetch('/api/bills/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, target, label, email }),
      });
      setState(res.ok ? 'done' : 'error');
    } catch {
      setState('error');
    }
  }

  if (state === 'done') {
    return (
      <p className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--b-teal-deep)' }}>
        <Check size={14} /> We’ll let you know when it’s live.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <input
        name="email"
        type="email"
        required
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-xs outline-none"
        style={{ background: 'var(--b-surface)', borderColor: 'var(--b-line)', color: 'var(--b-ink)' }}
      />
      <button
        type="submit"
        disabled={state === 'sending'}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold disabled:opacity-60"
        style={{ background: 'var(--b-ochre-soft)', color: 'var(--b-ochre)', border: '1px solid #E7D9BC' }}
      >
        {state === 'sending' ? <Loader2 size={12} className="animate-spin" /> : <Bell size={12} />}
        {state === 'error' ? 'Try again' : 'Notify me'}
      </button>
    </form>
  );
}
