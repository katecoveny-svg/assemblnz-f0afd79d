'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { sendMagicLinkAction } from './actions';

export function LoginForm({
  redirectTo,
  sent: initialSent,
  errorMsg: initialError,
}: {
  redirectTo: string;
  sent: boolean;
  errorMsg: string | null;
}) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(initialSent);
  const [error, setError] = useState<string | null>(initialError);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    fd.set('email', email);
    fd.set('redirectTo', redirectTo);

    startTransition(async () => {
      const result = await sendMagicLinkAction(null, fd);
      if (result.ok) {
        setSent(true);
      } else {
        setError(result.error);
      }
    });
  }

  if (sent) {
    return (
      <div className="rounded-card border border-[rgba(43,107,87,0.25)] bg-white/55 p-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--assembl-pounamu)]">
          Check your inbox
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
          We&apos;ve sent a magic link to{' '}
          <span className="font-mono text-[color:var(--text-primary)]">
            {email || 'your email'}
          </span>
          . Click it on this device to finish signing in. The link expires in one hour.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-card border border-[rgba(35,33,31,0.10)] bg-white/55 p-6"
      noValidate
    >
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]">
          Email
        </span>
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          autoFocus
          className="mt-2 w-full rounded-card border border-[rgba(35,33,31,0.18)] bg-white px-4 py-3 font-mono text-sm text-[color:var(--text-primary)] outline-none focus:border-[color:var(--assembl-pounamu)] focus:ring-2 focus:ring-[rgba(43,107,87,0.25)]"
          placeholder="you@assembl.co.nz"
        />
      </label>

      {error && (
        <p className="mt-4 rounded-card border border-[rgba(180,40,40,0.25)] bg-[rgba(180,40,40,0.06)] p-3 font-mono text-xs text-[#7A1F1F]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || email.trim().length === 0}
        className="cta-primary mt-6 inline-flex h-12 w-full items-center justify-center px-7 text-sm md:text-base disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Sending magic link…' : 'Send magic link'}
        {!pending && <ArrowRight className="ml-2 h-4 w-4" aria-hidden />}
      </button>
    </form>
  );
}
