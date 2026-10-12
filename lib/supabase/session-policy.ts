/**
 * Session-lifetime policy — the "stay signed in on this device" lever.
 *
 * Supabase keeps a session alive by silently swapping an expiring access token
 * for a new one using the refresh token. That only works while the refresh
 * cookie still lives in the browser, so the cookie's `maxAge` is the real lever
 * on how long someone stays signed in.
 *
 *   • Stay signed in (default)  → 90-day persistent cookies. The session is
 *     refreshed silently on every visit, so most people sign in once and come
 *     back signed in for up to three months.
 *   • Not on this device        → 24-hour cookies. The session lapses the next
 *     day, which is the right call on a shared or public machine.
 *
 * The choice rides along in a small `assembl-remember` cookie. Both the server
 * client (Server Actions / Route Handlers) and the edge middleware read it and
 * stamp the matching `maxAge` onto the Supabase auth cookies as they roll
 * forward, so the lifetime sticks across the whole session, not just at login.
 *
 * Cookie persistence does not override server-side session expiry or revocation.
 */

export const REMEMBER_COOKIE = 'assembl-remember';

const DAY = 60 * 60 * 24;
export const REMEMBER_MAX_AGE = DAY * 90; // 90 days — "stay signed in"
export const SESSION_MAX_AGE = DAY; // 24 hours — single-day session

/** True when the visitor opted to stay signed in on this device. */
export function isRemembered(value: string | undefined | null): boolean {
  return value === '1';
}

/** Cookie options for writing the `assembl-remember` flag itself. */
export function rememberCookieOptions(remember: boolean) {
  return {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    // The flag must outlive the session it governs.
    maxAge: remember ? REMEMBER_MAX_AGE : SESSION_MAX_AGE,
  };
}

/**
 * Stamp the chosen lifetime onto a Supabase auth cookie as it is written.
 *
 * Only the long-lived session cookies (`sb-…-auth-token`, including the
 * chunked `.0`/`.1` variants) are tuned. The short-lived PKCE code-verifier
 * cookie is left untouched so the magic-link round-trip is unaffected.
 */
export function tuneAuthCookieOptions<T extends { maxAge?: number }>(
  name: string,
  options: T,
  remember: boolean,
): T {
  const isSupabaseAuthCookie =
    name.startsWith('sb-') &&
    name.includes('-auth-token') &&
    !name.includes('code-verifier');

  // Sign-out/rotation removes chunks with maxAge=0. Never resurrect a deletion.
  if (!isSupabaseAuthCookie || options.maxAge === 0) return options;

  return {
    ...options,
    maxAge: remember ? REMEMBER_MAX_AGE : SESSION_MAX_AGE,
  };
}
