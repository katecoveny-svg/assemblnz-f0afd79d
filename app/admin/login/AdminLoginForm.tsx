'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MicroLabel } from '@assembl/canvas';
import { palette } from '@assembl/canvas/tokens';
import {
  sendMagicLinkAction,
  passwordSignInAction,
  type SendMagicLinkResult,
  type PasswordSignInResult,
} from '@/app/login/actions';

/**
 * Operator sign-in form — canvas styling (paper white, lowercase Cormorant
 * heading, tracked micro-labels, canary accent dot).
 *
 * Reuses the proven server actions from /login (server-side PKCE — see
 * app/login/actions.ts), so the magic-link round-trip and the 90-day
 * "stay signed in" cookie policy behave identically. Only the destination
 * differs: everything lands back on /admin.
 */

const DISPLAY = "var(--font-display, 'Cormorant Garamond'), Georgia, serif";
const MONO = 'var(--font-mono), "Space Mono", ui-monospace, monospace';

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
  const [mode, setMode] = useState<'magic' | 'password'>('magic');
  const [remember, setRemember] = useState(true);

  const [magicState, magicAction, magicPending] = useActionState<SendMagicLinkResult | null, FormData>(
    sendMagicLinkAction,
    null,
  );
  const [pwState, pwAction, pwPending] = useActionState<PasswordSignInResult | null, FormData>(
    passwordSignInAction,
    null,
  );

  // Password sign-in succeeded — the session cookies are set; go to the hub.
  useEffect(() => {
    if (pwState?.ok) router.replace(redirectTo);
  }, [pwState, router, redirectTo]);

  const magicSent = magicState?.ok === true;

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
      <p style={{ fontSize: 15, lineHeight: 1.55, color: palette.bodyGrey, margin: '0 0 28px' }}>
        {mode === 'magic'
          ? 'Enter your operator email and we’ll send a one-time sign-in link.'
          : 'Sign in with your email and password.'}
      </p>

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
          <SubmitButton pending={pwPending}>{pwPending ? 'signing in…' : 'sign in'}</SubmitButton>
        </form>
      )}

      {!magicSent && (
        <button
          type="button"
          onClick={() => setMode(mode === 'magic' ? 'password' : 'magic')}
          style={{
            marginTop: 20,
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: MONO,
            fontSize: 11.5,
            letterSpacing: '0.08em',
            color: palette.bodyGrey,
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          {mode === 'magic' ? 'use a password instead' : 'use a magic link instead'}
        </button>
      )}

      <p style={{ marginTop: 40, marginBottom: 0 }}>
        <MicroLabel style={{ color: palette.silverDeep }}>
          adaptive. connected. purpose-built.
        </MicroLabel>
      </p>
    </div>
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
