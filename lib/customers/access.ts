import { cookies } from 'next/headers';

/**
 * Access gate for the hosted customer pilot workspaces (`/customers/*`).
 *
 * These are pre-partnership pitch surfaces shared privately with a named
 * customer (e.g. Everyday Rewards / Woolworths NZ). They must not be publicly
 * crawlable, so the whole `/customers` subtree sits behind a lightweight
 * passphrase gate — the same shape as the founder gate, but its own cookie.
 *
 * The passphrase comes from `CUSTOMER_PILOT_ACCESS_CODE`. If that env var is
 * unset (e.g. a fresh Vercel preview), it falls back to a shareable default so
 * the demo works out of the box — Kate shares the URL + this word.
 */

export const PILOT_COOKIE = 'assembl_pilot_access';
export const PILOT_COOKIE_VALUE = '1';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** Shareable default so the pitch link works even before the env var is set. */
export const PILOT_DEFAULT_CODE = 'everyday-rewards-2026';

export async function isPilotAuthed(): Promise<boolean> {
  const c = await cookies();
  return c.get(PILOT_COOKIE)?.value === PILOT_COOKIE_VALUE;
}

export function getPilotSecret(): string {
  const v = process.env.CUSTOMER_PILOT_ACCESS_CODE;
  return v && v.trim().length > 0 ? v.trim() : PILOT_DEFAULT_CODE;
}

export function buildPilotCookieAttributes(): {
  name: string;
  value: string;
  maxAge: number;
  httpOnly: boolean;
  sameSite: 'lax';
  path: string;
  secure: boolean;
} {
  return {
    name: PILOT_COOKIE,
    value: PILOT_COOKIE_VALUE,
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  };
}
