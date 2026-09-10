'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MicroLabel } from '@assembl/canvas';
import { palette } from '@assembl/canvas/tokens';
import {
  setPasswordAction,
  type SetPasswordResult,
} from '@/app/account/security/actions';

/**
 * Operator password set / reset — reached after a recovery magic link lands
 * on /auth/confirm?next=/admin/reset-password. Reuses the account security
 * action (session-gated updateUser). No passwords are hardcoded.
 */

const DISPLAY = "var(--font-display, 'Cormorant Garamond'), Georgia, serif";

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

export function AdminResetPasswordForm({ hasSession }: { hasSession: boolean }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<SetPasswordResult | null, FormData>(
    setPasswordAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) router.replace('/admin');
  }, [state, router]);

  if (!hasSession) {
    return (
      <div style={{ width: '100%', maxWidth: 420 }}>
        <MicroLabel as="p" style={{ marginBottom: 10 }}>
          operator hub
        </MicroLabel>
        <h1
          style={{
            fontFamily: DISPLAY,
            fontWeight: 500,
            fontSize: 36,
            lineHeight: 1.05,
            textTransform: 'lowercase',
            color: palette.ink,
            margin: '0 0 12px',
          }}
        >
          reset link required.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.55, color: palette.bodyGrey }}>
          Open the reset link from your email on this device, or go back to{' '}
          <a href="/admin/login" style={{ color: palette.ink }}>
            operator sign-in
          </a>{' '}
          and request a new one.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <MicroLabel as="p" style={{ marginBottom: 10 }}>
        operator hub
      </MicroLabel>
      <h1
        style={{
          fontFamily: DISPLAY,
          fontWeight: 500,
          fontSize: 36,
          lineHeight: 1.05,
          textTransform: 'lowercase',
          color: palette.ink,
          margin: '0 0 12px',
        }}
      >
        set a password.
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.55, color: palette.bodyGrey, margin: '0 0 24px' }}>
        Choose a password for this operator mailbox. You can use it next time if a magic link does
        not arrive.
      </p>
      <form action={action}>
        <label htmlFor="admin-new-password" style={{ display: 'block', marginBottom: 6 }}>
          <MicroLabel>new password</MicroLabel>
        </label>
        <input
          id="admin-new-password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          style={inputStyle}
        />
        <label htmlFor="admin-confirm-password" style={{ display: 'block', margin: '14px 0 6px' }}>
          <MicroLabel>confirm password</MicroLabel>
        </label>
        <input
          id="admin-confirm-password"
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          style={inputStyle}
        />
        {state && !state.ok && (
          <p style={{ color: '#B5533A', fontSize: 13.5, margin: '10px 0 0' }}>{state.error}</p>
        )}
        {state?.ok && (
          <p style={{ color: palette.bodyGrey, fontSize: 13.5, margin: '10px 0 0' }}>
            Password saved. Taking you to the hub…
          </p>
        )}
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
          {pending ? 'saving…' : 'save password'}
        </button>
      </form>
    </div>
  );
}
