'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MicroLabel } from '@assembl/canvas';
import { palette } from '@assembl/canvas/tokens';
import {
  sendMagicLinkAction,
  passwordSignInAction,
  sendPasswordResetAction,
  type SendMagicLinkResult,
  type PasswordSignInResult,
  type SendPasswordResetResult,
} from '@/app/login/actions';

/**
 * Operator sign-in form — canvas styling (paper white, lowercase Cormorant
 * heading, tracked micro-labels, gold accent dot).
 *
 * Reuses the proven server actions from /login (server-side PKCE — see
 * app/login/actions.ts), so the magic-link round-trip and the 90-day
 * "stay signed in" cookie policy behave identically. Only the destination
 * differs: everything lands back on /admin.
 *
 * Password is the obvious fallback when magic-link email does not arrive
 * (SMTP / rate limits are outside code). Magic stays available.
 */

const DISPLAY = "var(--font-display, 'Cormorant Garamond'), Georgia, serif";
const MONO = 'var(--font-mono), "Space Mono", ui-monospace, monospace';

type Mode = 'password' | 'magic' | 'reset';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  fontSize: 15,
  fontFamily: 'inherit',
  color: palette.ink,
  background: '#FFFFFF',
  border: `1px solid ${palette.hairline}`,
  borderRadius: 10,
  outline: 'none',
  boxSizing: 'border-box',
};

export function AdminLoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  // Password first — magic-link email delivery is outside our control.
  const [mode, setMode] = useState<Mode>('password');
  const [remember, setRemember] = useState(true);

  const [magicState, magicAction, magicPending] = useActionState<SendMagicLinkResult | null, FormData>(
    sendMagicLinkAction,
    null,
  );
  const [pwState, pwAction, pwPending] = useActionState<PasswordSignInResult | null, FormData>(
    passwordSignInAction,
    null,
  );
  const [resetState, resetAction, resetPending] = useActionState<
    SendPasswordResetResult | null,
    FormData
  >(sendPasswordResetAction, null);

  // Password sign-in succeeded — the session cookies are set; go to the hub.
  useEffect(() => {
    if (pwState?.ok) router.replace(redirectTo);
  }, [pwState, router, redirectTo]);

  const magicSent = magicState?.ok === true;
  const resetSent = resetState?.ok === true;

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: 34 }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: 30, lineHeight: 1, color: palette.ink }}>
          assembl
        </span>
        <span aria-hidden style={{ width: 8, height: 8, borderRadius: 999, background: palette.accentGold, marginBottom: 3 }} />
      </div>

      <MicroLabel as="p" style={{ marginBottom: 10 }}>
        operator hub
      </MicroLabel>
      <h1
        style={{
          fontFamily: DISPLAY,
          fontWeight: 500,
          fontSize: 42,
          lineHeight: 1.05,
          letterSpacing: '0.01em',
          textTransform: 'lowercase',
          color: palette.ink,
          margin: '0 0 10px',
        }}
      >
        sign in.
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.55, color: palette.bodyGrey, margin: '0 0 12px' }}>
        {mode === 'password' && 'Sign in with your email and password.'}
        {mode === 'magic' && 'Enter your operator email and we’ll send a one-time sign-in link.'}
        {mode === 'reset' && 'We’ll email a password reset link for this operator mailbox.'}
      </p>
      {mode !== 'reset' && (
        <p
          style={{
            fontSize: 13.5,
            lineHeight: 1.5,
            color: palette.bodyGrey,
            margin: '0 0 24px',
            padding: '12px 14px',
            background: palette.paperDeep,
            border: `1px solid ${palette.hairline}`,
            borderRadius: 10,
          }}
        >
          If a magic link doesn&rsquo;t arrive, use password. Magic link still works when email delivery is healthy.
        </p>
      )}

      {magicSent ? (
        <div
          style={{
            background: palette.paperDeep,
            border: `1px solid ${palette.hairline}`,
            borderRadius: 14,
            padding: '22px 20px',
            fontSize: 14.5,
            lineHeight: 1.6,
            color: palette.bodyGrey,
          }}
        >
          <MicroLabel as="p" style={{ marginBottom: 8, color: palette.ink }}>
            check your email
          </MicroLabel>
          A sign-in link is on its way. Open it on this device and you&rsquo;ll land straight in the
          operator hub. The link is single-use and expires shortly.
          <button
            type="button"
            onClick={() => setMode('password')}
            style={{
              display: 'block',
              marginTop: 16,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: '0.08em',
              color: palette.ink,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Link not arriving? Sign in with password
          </button>
        </div>
      ) : resetSent ? (
        <div
          style={{
            background: palette.paperDeep,
            border: `1px solid ${palette.hairline}`,
            borderRadius: 14,
            padding: '22px 20px',
            fontSize: 14.5,
            lineHeight: 1.6,
            color: palette.bodyGrey,
          }}
        >
          <MicroLabel as="p" style={{ marginBottom: 8, color: palette.ink }}>
            check your email
          </MicroLabel>
          If an account exists for that address, a reset link is on its way. It opens on
          demo.assembl.co.nz so the operator session lands in the right place.
          <button
            type="button"
            onClick={() => setMode('password')}
            style={{
              display: 'block',
              marginTop: 16,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: '0.08em',
              color: palette.ink,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Back to password sign-in
          </button>
        </div>
      ) : mode === 'magic' ? (
        <form action={magicAction}>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <input type="hidden" name="remember" value={remember ? '1' : '0'} />
          <label htmlFor="admin-email" style={{ display: 'block', marginBottom: 6 }}>
            <MicroLabel>email</MicroLabel>
          </label>
          <input
            id="admin-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="assembl@assembl.co.nz"
            style={inputStyle}
          />
          {magicState && !magicState.ok && (
            <p style={{ color: '#B5533A', fontSize: 13.5, margin: '10px 0 0' }}>{magicState.error}</p>
          )}
          <RememberToggle remember={remember} onChange={setRemember} />
          <SubmitButton pending={magicPending}>
            {magicPending ? 'sending…' : 'email me a sign-in link'}
          </SubmitButton>
        </form>
      ) : mode === 'reset' ? (
        <form action={resetAction}>
          <label htmlFor="admin-email-reset" style={{ display: 'block', marginBottom: 6 }}>
            <MicroLabel>email</MicroLabel>
          </label>
          <input
            id="admin-email-reset"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="assembl@assembl.co.nz"
            style={inputStyle}
          />
          {resetState && !resetState.ok && (
            <p style={{ color: '#B5533A', fontSize: 13.5, margin: '10px 0 0' }}>{resetState.error}</p>
          )}
          <SubmitButton pending={resetPending}>
            {resetPending ? 'sending…' : 'email me a reset link'}
          </SubmitButton>
        </form>
      ) : (
        <form action={pwAction}>
          <input type="hidden" name="remember" value={remember ? '1' : '0'} />
          <label htmlFor="admin-email-pw" style={{ display: 'block', marginBottom: 6 }}>
            <MicroLabel>email</MicroLabel>
          </label>
          <input
            id="admin-email-pw"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="assembl@assembl.co.nz"
            style={inputStyle}
          />
          <label htmlFor="admin-password" style={{ display: 'block', margin: '14px 0 6px' }}>
            <MicroLabel>password</MicroLabel>
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            style={inputStyle}
          />
          {pwState && !pwState.ok && (
            <p style={{ color: '#B5533A', fontSize: 13.5, margin: '10px 0 0' }}>{pwState.error}</p>
          )}
          <RememberToggle remember={remember} onChange={setRemember} />
          <SubmitButton pending={pwPending}>{pwPending ? 'signing in…' : 'sign in with password'}</SubmitButton>
        </form>
      )}

      {!magicSent && !resetSent && (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mode === 'password' && (
            <>
              <ModeLink onClick={() => setMode('magic')}>Prefer a magic link instead</ModeLink>
              <ModeLink onClick={() => setMode('reset')}>Forgot password? Email a reset link</ModeLink>
            </>
          )}
          {mode === 'magic' && (
            <>
              <ModeLink onClick={() => setMode('password')}>
                Magic link not arriving? Use password
              </ModeLink>
              <ModeLink onClick={() => setMode('reset')}>Forgot password? Email a reset link</ModeLink>
            </>
          )}
          {mode === 'reset' && (
            <ModeLink onClick={() => setMode('password')}>Back to password sign-in</ModeLink>
          )}
        </div>
      )}

      <p style={{ marginTop: 40, marginBottom: 0 }}>
        <MicroLabel style={{ color: palette.silverDeep }}>
          adaptive. connected. purpose-built.
        </MicroLabel>
      </p>
    </div>
  );
}

function ModeLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        fontFamily: MONO,
        fontSize: 12,
        letterSpacing: '0.08em',
        color: palette.bodyGrey,
        textDecoration: 'underline',
        textUnderlineOffset: 3,
        textAlign: 'left',
      }}
    >
      {children}
    </button>
  );
}

function RememberToggle({ remember, onChange }: { remember: boolean; onChange: (v: boolean) => void }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        margin: '16px 0 0',
        cursor: 'pointer',
        fontSize: 13.5,
        color: palette.bodyGrey,
      }}
    >
      <input
        type="checkbox"
        checked={remember}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: palette.accentGold, width: 15, height: 15 }}
      />
      Stay signed in on this device (90 days)
    </label>
  );
}

function SubmitButton({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        width: '100%',
        marginTop: 18,
        padding: '12px 18px',
        fontFamily: 'inherit',
        fontSize: 15,
        fontWeight: 700,
        color: palette.ink,
        background: palette.accentGold,
        border: 'none',
        borderRadius: 999,
        cursor: pending ? 'default' : 'pointer',
        opacity: pending ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  );
}
