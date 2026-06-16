'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { IPP3A_CONSENT_LINE } from '@/lib/gating/config';

/**
 * Email-capture modal shown when an anonymous visitor hits a usage limit.
 * Collects an email + IPP 3A consent, posts to /api/gating/capture, and calls
 * onUnlocked() so the host surface can let the visitor continue immediately.
 */
export function CaptureModal({
  open,
  surface,
  onClose,
  onUnlocked,
}: {
  open: boolean;
  surface: string; // e.g. 'chat:waihanga'
  onClose: () => void;
  onUnlocked: () => void;
}) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    if (!consent) {
      setError('Please tick the consent box to continue.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/gating/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), surface, consent }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      onUnlocked();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(35,33,31,0.45)] px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="capture-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-[20px] border border-[rgba(157,140,125,0.22)] bg-[color:var(--assembl-paper)] p-7 shadow-[0_30px_80px_rgba(35,33,31,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--text-secondary)] hover:bg-white/60 hover:text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)]"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
          Keep going — free
        </p>
        <h2 id="capture-title" className="mt-3 font-display text-display-md font-light">
          Add your email to continue.
        </h2>
        <p className="mt-3 text-body-sm text-[color:var(--text-body)]">
          You’ve used your free go. Drop your email and your limit lifts straight away — no card, no
          sign-up.
        </p>
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="capture-email" className="sr-only">
              Email address
            </label>
            <input
              id="capture-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.co.nz"
              className="w-full rounded-md border border-[rgba(35,33,31,0.18)] bg-white px-3 py-2.5 text-base text-[color:var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--assembl-pounamu)]"
            />
          </div>
          <label className="flex items-start gap-2.5 text-body-sm text-[color:var(--text-body)]">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 h-4 w-4 flex-none accent-[color:var(--assembl-pounamu)]"
            />
            <span>{IPP3A_CONSENT_LINE}</span>
          </label>
          {error ? (
            <p role="alert" className="text-body-sm text-[#9A3412]">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="cta-primary inline-flex h-12 w-full items-center justify-center px-6 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Lifting your limit…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
