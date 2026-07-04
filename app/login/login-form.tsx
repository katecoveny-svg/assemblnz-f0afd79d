'use client';

import { useEffect, useState, useTransition, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { passwordSignInAction, sendMagicLinkAction } from './actions';

const REMEMBER_STORAGE_KEY = 'assembl-remember-device';

const labelClass =
  'font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]';
const inputClass =
  'mt-2 w-full rounded-card border border-[rgba(58,56,50,0.18)] bg-white px-4 py-3 text-sm text-[color:var(--text-primary)] outline-none focus:border-[color:var(--assembl-gold,#BFA37A)] focus:ring-2 focus:ring-[rgba(191,163,122,0.35)]';
const quietLinkClass =
  'mt-5 block w-full text-center text-sm lowercase text-[color:var(--text-secondary)] underline-offset-4 hover:text-[color:var(--text-primary)] hover:underline';

type Mode = 'magic' | 'password';

export function LoginForm({
  redirectTo,
  sent: initialSent,
  errorMsg: initialError,
}: {
  redirectTo: string;
  sent: boolean;
  errorMsg: string | null;
}) {
  const [mode, setMode] = useState<Mode>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Stay signed in defaults ON for first-time visitors; the choice persists in
  // localStorage so it sticks on this device across visits.
  const [remember, setRemember] = useState(true);
  const [sent, setSent] = useState(initialSent);
  const [error, setError] = useState<string | null>(initialError);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(REMEMBER_STORAGE_KEY);
      if (stored === '0') setRemember(false);
      else if (stored === '1') setRemember(true);
    } catch {
      // localStorage unavailable (private mode) — keep the default.
    }
  }, []);

  function persistRemember(next: boolean) {
    setRemember(next);
    try {
      window.localStorage.setItem(REMEMBER_STORAGE_KEY, next ? '1' : '0');
    } catch {
      // ignore — the cookie set server-side still governs the session.
    }
  }

  function handleMagicSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    fd.set('email', email);
    fd.set('redirectTo', redirectTo);
    fd.set('remember', remember ? '1' : '0');

    startTransition(async () => {
      const result = await sendMagicLinkAction(null, fd);
      if (result.ok) setSent(true);
      else setError(result.error);
    });
  }

  function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const fd = new FormData();
    fd.set('email', email);
    fd.set('password', password);
    fd.set('remember', remember ? '1' : '0');

    startTransition(async () => {
      const result = await passwordSignInAction(null, fd);
      if (result.ok) {
        // Full navigation so the middleware sees the fresh session cookie.
        window.location.href = redirectTo;
      } else {
        setError(result.error);
      }
    });
  }

  if (sent) {
    return (
      <div className="rounded-card border border-[rgba(58,56,50,0.18)] bg-white/60 p-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--assembl-gold,#BFA37A)]">
          Check your inbox
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
          We&apos;ve sent a link to{' '}
          <span className="font-mono text-[color:var(--text-primary)]">{email || 'your email'}</span>.
          Open it on this device — it expires in an hour.
        </p>
        <button type="button" onClick={() => setSent(false)} className={quietLinkClass}>
          use a different email
        </button>
      </div>
    );
  }

  // Stay-signed-in is genuinely load-bearing (90-day vs 24-hour session), so
  // it stays — tucked under the button, small.
  const rememberToggle = (
    <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 text-xs lowercase text-[color:var(--text-secondary)]">
      <input
        type="checkbox"
        checked={remember}
        onChange={(e) => persistRemember(e.target.checked)}
        className="h-3.5 w-3.5 rounded border-[rgba(58,56,50,0.35)] accent-[#BFA37A] focus:ring-2 focus:ring-[rgba(191,163,122,0.35)]"
      />
      stay signed in on this device
    </label>
  );

  const errorBlock = error && (
    <p className="mt-4 rounded-card border border-[rgba(180,40,40,0.25)] bg-[rgba(180,40,40,0.06)] p-3 font-mono text-xs text-[#7A1F1F]">
      {error}
    </p>
  );

  if (mode === 'password') {
    return (
      <form
        onSubmit={handlePasswordSubmit}
        className="rounded-card border border-[rgba(58,56,50,0.10)] bg-white/55 p-6"
        noValidate
      >
        <label className="block">
          <span className={labelClass}>Email</span>
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            autoFocus
            className={inputClass}
            placeholder="you@assembl.co.nz"
          />
        </label>

        <label className="mt-4 block">
          <span className={labelClass}>Password</span>
          <input
            type="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className={inputClass}
            placeholder="your password"
          />
        </label>

        {errorBlock}

        <button
          type="submit"
          disabled={pending || email.trim().length === 0 || password.length === 0}
          className="cta-primary mt-6 inline-flex h-12 w-full items-center justify-center px-7 text-sm lowercase md:text-base disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'signing in…' : 'sign in'}
          {!pending && <ArrowRight className="ml-2 h-4 w-4" aria-hidden />}
        </button>

        {rememberToggle}

        <button
          type="button"
          onClick={() => {
            setMode('magic');
            setError(null);
          }}
          className={quietLinkClass}
        >
          use a magic link instead
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleMagicSubmit}
      className="rounded-card border border-[rgba(58,56,50,0.10)] bg-white/55 p-6"
      noValidate
    >
      <p className="mb-4 text-center text-sm lowercase text-[color:var(--text-body)]">
        we&apos;ll send you a link
      </p>
      <label className="block">
        <span className={labelClass}>Email</span>
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          autoFocus
          className={inputClass}
          placeholder="you@assembl.co.nz"
        />
      </label>

      {errorBlock}

      <button
        type="submit"
        disabled={pending || email.trim().length === 0}
        className="cta-primary mt-6 inline-flex h-12 w-full items-center justify-center px-7 text-sm lowercase md:text-base disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'sending…' : 'email me a link'}
        {!pending && <ArrowRight className="ml-2 h-4 w-4" aria-hidden />}
      </button>

      {rememberToggle}

      <button
        type="button"
        onClick={() => {
          setMode('password');
          setError(null);
        }}
        className={quietLinkClass}
      >
        use password instead
      </button>
    </form>
  );
}
