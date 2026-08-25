'use client';

import { useState } from 'react';
import { ArrowRight, Check, Loader2, ShieldCheck } from 'lucide-react';

type Kind = 'switch' | 'cancel' | 'refund' | 'dispute' | 'apply';

/**
 * The only "action" surface in assembl bills. Nothing is ever dispatched:
 * ACTION_DISPATCH_ENABLED is OFF. A click drops a DRAFT into the approval
 * queue (content_approvals → /admin/approvals) for a human yes, then shows a
 * calm "queued" state. This is the SPARK rule made literal — assembl bills
 * recommends and prepares; the household approves and switches.
 */
export function ActionButton({
  kind,
  label,
  target,
  detail,
  amount,
  tone = 'teal',
}: {
  kind: Kind;
  label: string;
  target: string;
  detail: string;
  amount?: string;
  tone?: 'teal' | 'coral' | 'ghost';
}) {
  const [state, setState] = useState<'idle' | 'sending' | 'queued' | 'error'>('idle');

  async function queue() {
    if (state === 'sending' || state === 'queued') return;
    setState('sending');
    try {
      const res = await fetch('/api/bills/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, label, target, detail, amount }),
      });
      if (!res.ok) throw new Error('bad status');
      setState('queued');
    } catch {
      setState('error');
    }
  }

  if (state === 'queued') {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold"
        style={{ background: 'var(--b-teal-soft)', color: 'var(--b-teal-deep)' }}
      >
        <Check size={14} /> Draft queued for your approval
      </span>
    );
  }

  const styles =
    tone === 'coral'
      ? { background: 'var(--b-coral)', color: '#fff' }
      : tone === 'ghost'
        ? { background: 'transparent', color: 'var(--b-teal-deep)', border: '1px solid var(--b-teal-line)' }
        : { background: 'var(--b-teal)', color: '#fff' };

  return (
    <button
      type="button"
      onClick={queue}
      disabled={state === 'sending'}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition hover:opacity-90 disabled:opacity-60"
      style={{ ...styles, fontFamily: "var(--font-bills-display), system-ui, sans-serif" }}
      title="Prepares a draft for your approval — nothing is switched automatically"
    >
      {state === 'sending' ? <Loader2 size={14} className="animate-spin" /> : state === 'error' ? <ShieldCheck size={14} /> : null}
      {state === 'error' ? 'Try again' : label}
      {state === 'idle' && <ArrowRight size={13} />}
    </button>
  );
}
