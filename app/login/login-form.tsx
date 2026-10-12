'use client';

import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import { passwordSignInAction, sendMagicLinkAction, socialSignInAction } from './actions';

import type { ProviderStatus, SocialProvider } from '@/lib/auth/providers';

const REMEMBER_STORAGE_KEY = 'assembl-remember-device';

const labelClass =
  'font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--text-secondary)]';
const inputClass =
  'mt-2 w-full rounded-card border border-[rgba(58,56,50,0.18)] bg-white px-4 py-3 text-sm text-[color:var(--text-primary)] outline-none focus:border-[color:var(--assembl-gold,#BFA37A)] focus:ring-2 focus:ring-[rgba(191,163,122,0.35)]';
const quietLinkClass =
  'mt-5 block w-full text-center text-sm lowercase text-[color:var(--text-secondary)] underline-offset-4 hover:text-[color:var(--text-primary)] hover:underline';

type Mode = 'magic' | 'password';

export function LoginForm({
  redirectTo,
  providers = { google: false, apple: false },
  sent: initialSent,
  errorMsg: initialError,
}: {
  redirectTo: string;
  providers?: ProviderStatus;
  sent: boolean;
  errorMsg: string | null;
}) {
  const nativeReturn = new URLSearchParams(redirectTo.split('?')[1] || '').get('nativeReview') === '1';
  const [mode, setMode] = useState<Mode>('magic');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Stay signed in defaults ON for first-time visitors; the choice persists in
  // localStorage so it sticks on this device across visits.
  const [remember, setRemember] = useState(true);
  const [sent, setSent] = useState(initialSent);
  const [error, setError] = useState<string | null>(initialError);
  const [pending, startTransition] = useTransition();
  const inFlight = useRef(false);
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(REMEMBER_STORAGE_KEY);
      const frame = requestAnimationFrame(() => { if (stored === '0') setRemember(false); else if (stored === '1') setRemember(true); });
      return () => cancelAnimationFrame(frame);
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
    if (inFlight.current) return;
    setError(null);

    const fd = new FormData();
    fd.set('email', email);
    fd.set('redirectTo', redirectTo);
    fd.set('remember', remember ? '1' : '0');

    if (cooldown > 0) return;
    inFlight.current = true;
    startTransition(async () => {
      try {
        const result = await sendMagicLinkAction(null, fd);
        if (result.ok) { setSent(true); setCooldown(60); }
        else { setError(result.error); if (result.retryAfter) setCooldown(result.retryAfter); }
      } catch {
        setError('The request was interrupted. Delivery could not be confirmed. Wait before trying again.');
        setCooldown(60);
      } finally { inFlight.current = false; }
    });
  }

  function handlePasswordSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlight.current) return;
    setError(null);

    const fd = new FormData();
    fd.set('email', email);
    fd.set('password', password);
    fd.set('remember', remember ? '1' : '0');

    inFlight.current = true;
    startTransition(async () => {
      try {
        const result = await passwordSignInAction(null, fd);
        if (result.ok) {
          // Full navigation so the middleware sees the fresh session cookie.
          window.location.href = redirectTo;
        } else {
          setError(result.error);
        }
      } catch {
        setError('Sign-in was interrupted. Try again.');
      } finally {
        inFlight.current = false;
      }
    });
  }

  if (sent) {
    return (
      <div className="rounded-card border border-[rgba(58,56,50,0.18)] bg-white/60 p-6 text-center">
        <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[color:var(--assembl-gold,#BFA37A)]">
          Check your inbox
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[color:var(--text-body)]">
          A sign-in link was requested for{' '}
          <span className="font-mono text-[color:var(--text-primary)]">{email || 'your email'}</span>.
          Check your inbox and spam folder. Use the latest link. Delivery may take a few minutes. {nativeReturn && 'An email link opens your browser, whose sign-in is separate from this app. Use your existing password here to sign in inside the app.'}
        </p>
        {error && <p role="alert" className="mt-3 text-sm">{error}</p>}
        <button type="button" disabled={pending || cooldown > 0} onClick={() => { setSent(false); }} className={quietLinkClass}>
          {cooldown > 0 ? `Try again in ${cooldown}s` : 'Request another link'}
        </button>
        <button type="button" disabled={pending} onClick={() => { setSent(false); setMode('password'); }} className={quietLinkClass}>Use password instead</button>
        <button type="button" disabled={pending} onClick={() => setSent(false)} className={quietLinkClass}>
          use a different email
        </button>
      </div>
    );
  }

  function handleSocial(provider: SocialProvider) {
    if (inFlight.current) return;
    inFlight.current = true;
    setError(null);
    const fd = new FormData();
    fd.set('provider', provider);
    fd.set('redirectTo', redirectTo);
    fd.set('remember', remember ? '1' : '0');
    startTransition(async () => {
      try {
        const result = await socialSignInAction(fd);
        if (result.ok) window.location.assign(result.url);
        else setError(result.error);
      } catch { setError('Sign-in was interrupted. Try again.'); }
      finally { inFlight.current = false; }
    });
  }
  const socialChoices = !nativeReturn && (providers.google || providers.apple) && (
    <div className="mt-5 space-y-2">
      {(['google', 'apple'] as const).filter(provider => providers[provider]).map(provider => (
        <button key={provider} type="button" disabled={pending} onClick={() => handleSocial(provider)}
          className="w-full rounded-card border border-[rgba(58,56,50,0.18)] bg-white px-4 py-3 text-sm disabled:opacity-60">
          Continue with {provider === 'google' ? 'Google' : 'Apple'}
        </button>
      ))}
      <p className="text-xs">For your existing work, use the same account email. Apple Hide My Email may create a separate account. Sign in to your existing account first before connecting a different identity.</p>
    </div>
  );

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
    <p role="alert" className="mt-4 rounded-card border border-[rgba(180,40,40,0.25)] bg-[rgba(180,40,40,0.06)] p-3 font-mono text-xs text-[#7A1F1F]">
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

        <div className="mt-4 block">
          <label htmlFor="assembl-login-password" className={labelClass}>Password</label>
          <p id="assembl-password-guidance" className="mt-2 text-xs">Use a password you previously set for your assembl account. Signing in by email link does not create a password.</p>
          <input
            type="password"
            id="assembl-login-password"
            aria-describedby="assembl-password-guidance"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className={inputClass}
            placeholder="your password"
          />
        </div>

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
        {socialChoices}

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
        disabled={pending || cooldown > 0 || email.trim().length === 0}
        className="cta-primary mt-6 inline-flex h-12 w-full items-center justify-center px-7 text-sm lowercase md:text-base disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'sending…' : cooldown > 0 ? `try again in ${cooldown}s` : 'email me a link'}
        {!pending && <ArrowRight className="ml-2 h-4 w-4" aria-hidden />}
      </button>

      {rememberToggle}
      {socialChoices}

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
