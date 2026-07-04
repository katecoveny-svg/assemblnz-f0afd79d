'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { setPasswordAction } from './actions';

const labelClass =
  'font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]';
const inputClass =
  'mt-2 w-full rounded-card border border-[rgba(58,56,50,0.18)] bg-white px-4 py-3 text-sm text-[color:var(--text-primary)] outline-none focus:border-[color:var(--assembl-gold,#BFA37A)] focus:ring-2 focus:ring-[rgba(191,163,122,0.45)]';

export function SetPasswordForm({ hasPassword }: { hasPassword: boolean }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    fd.set('password', password);
    fd.set('confirm', confirm);

    startTransition(async () => {
      const result = await setPasswordAction(null, fd);
      if (result.ok) {
        setDone(true);
        setPassword('');
        setConfirm('');
      } else {
        setError(result.error);
      }
    });
  }

  if (done) {
    return (
      <div className="rounded-card border border-[rgba(58,56,50,0.18)] bg-white/60 p-6">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--assembl-gold,#BFA37A)]">
          <Check className="h-4 w-4" aria-hidden /> Password saved
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
          Next time, sign in at <span className="font-mono text-[color:var(--text-primary)]">/login</span> with
          your email and password — one click, no email to wait for.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
        >
          Change it again
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-card border border-[rgba(58,56,50,0.10)] bg-white/55 p-6"
      noValidate
    >
      <label className="block">
        <span className={labelClass}>{hasPassword ? 'New password' : 'Password'}</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          autoFocus
          className={inputClass}
          placeholder="At least 8 characters"
        />
      </label>

      <label className="mt-4 block">
        <span className={labelClass}>Confirm password</span>
        <input
          type="password"
          name="confirm"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          className={inputClass}
          placeholder="Type it again"
        />
      </label>

      {error && (
        <p className="mt-4 rounded-card border border-[rgba(180,40,40,0.25)] bg-[rgba(180,40,40,0.06)] p-3 font-mono text-xs text-[#7A1F1F]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || password.length === 0 || confirm.length === 0}
        className="cta-primary mt-6 inline-flex h-12 w-full items-center justify-center px-7 text-sm md:text-base disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Saving…' : hasPassword ? 'Update password' : 'Set password'}
      </button>
    </form>
  );
}
