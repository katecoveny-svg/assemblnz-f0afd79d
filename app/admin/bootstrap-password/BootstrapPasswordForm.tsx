'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { MicroLabel } from '@assembl/canvas';
import { palette } from '@assembl/canvas/tokens';
import type { BootstrapPasswordResult } from '@/lib/admin/bootstrap-password-types';
import {
  bootstrapFounderPasswordAction,
} from './actions';

/**
 * Founder-only password set — gated by OPERATOR_BOOTSTRAP_SECRET in env.
 * No passwords live in the repo. Prefer Supabase Studio when the secret is unset.
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

export function BootstrapPasswordForm({
  secretConfigured,
  founderEmails,
}: {
  secretConfigured: boolean;
  founderEmails: readonly string[];
}) {
  const [state, action, pending] = useActionState<BootstrapPasswordResult | null, FormData>(
    bootstrapFounderPasswordAction,
    null,
  );

  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      <MicroLabel as="p" style={{ marginBottom: 10 }}>
        operator hub · founder bootstrap
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
      <p style={{ fontSize: 15, lineHeight: 1.55, color: palette.bodyGrey, margin: '0 0 16px' }}>
        For founder mailboxes only ({founderEmails.join(', ')}). Uses the service role after the
        bootstrap secret matches — nothing is committed to git.
      </p>

      <div
        style={{
          fontSize: 13.5,
          lineHeight: 1.55,
          color: palette.bodyGrey,
          margin: '0 0 22px',
          padding: '12px 14px',
          background: palette.paperDeep,
          border: `1px solid ${palette.hairline}`,
          borderRadius: 10,
        }}
      >
        <strong style={{ color: palette.ink }}>Preferred when email is broken:</strong> Supabase
        Studio → Authentication → Users → open{' '}
        <span style={{ fontFamily: MONO, fontSize: 12 }}>assembl@assembl.co.nz</span> → set
        password. Then sign in at{' '}
        <Link href="/admin/login" style={{ color: palette.ink }}>
          /admin/login
        </Link>
        .
        {!secretConfigured && (
          <>
            {' '}
            This page needs <code style={{ fontFamily: MONO, fontSize: 12 }}>OPERATOR_BOOTSTRAP_SECRET</code>{' '}
            on the demo host before the form below will work.
          </>
        )}
      </div>

      {state?.ok ? (
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
            password ready
          </MicroLabel>
          {state.created
            ? 'Founder account created and password set.'
            : 'Password updated for that founder mailbox.'}{' '}
          Go to{' '}
          <Link href="/admin/login" style={{ color: palette.ink }}>
            operator sign-in
          </Link>{' '}
          and use email + password. Then open Agents and Connectors in the hub nav.
        </div>
      ) : (
        <form action={action}>
          <label htmlFor="bootstrap-secret" style={{ display: 'block', marginBottom: 6 }}>
            <MicroLabel>bootstrap secret</MicroLabel>
          </label>
          <input
            id="bootstrap-secret"
            name="secret"
            type="password"
            required
            autoComplete="off"
            disabled={!secretConfigured}
            placeholder={secretConfigured ? 'OPERATOR_BOOTSTRAP_SECRET value' : 'not configured on server'}
            style={inputStyle}
          />

          <label htmlFor="bootstrap-email" style={{ display: 'block', margin: '14px 0 6px' }}>
            <MicroLabel>founder email</MicroLabel>
          </label>
          <input
            id="bootstrap-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue="assembl@assembl.co.nz"
            disabled={!secretConfigured}
            style={inputStyle}
          />

          <label htmlFor="bootstrap-password" style={{ display: 'block', margin: '14px 0 6px' }}>
            <MicroLabel>new password</MicroLabel>
          </label>
          <input
            id="bootstrap-password"
            name="password"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            disabled={!secretConfigured}
            style={inputStyle}
          />

          <label htmlFor="bootstrap-confirm" style={{ display: 'block', margin: '14px 0 6px' }}>
            <MicroLabel>confirm password</MicroLabel>
          </label>
          <input
            id="bootstrap-confirm"
            name="confirm"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            disabled={!secretConfigured}
            style={inputStyle}
          />

          {state && !state.ok && (
            <p style={{ color: '#B5533A', fontSize: 13.5, margin: '10px 0 0' }}>{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending || !secretConfigured}
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
              cursor: pending || !secretConfigured ? 'default' : 'pointer',
              opacity: pending || !secretConfigured ? 0.7 : 1,
            }}
          >
            {pending ? 'saving…' : 'set founder password'}
          </button>
        </form>
      )}

      <p style={{ marginTop: 24 }}>
        <Link
          href="/admin/login"
          style={{
            fontFamily: MONO,
            fontSize: 12,
            letterSpacing: '0.08em',
            color: palette.bodyGrey,
          }}
        >
          ← back to password sign-in
        </Link>
      </p>
    </div>
  );
}
