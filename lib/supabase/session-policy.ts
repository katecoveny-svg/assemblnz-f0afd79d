/**
 * Session-lifetime policy — the "stay signed in on this device" lever.
 *
 * Auth cookies use the existing retention windows on every server and browser
 * write: 90 days when remembered, 24 hours otherwise. Refresh rolls these
 * browser retention windows forward; they are not server session guarantees.
 * Server expiry, revocation and MFA remain authoritative.
 *
 * The canonical preference is an HttpOnly assembl-remember cookie. A separate
 * non-secret readable mirror lets the browser refresh adapter use that same
 * policy. Missing or expired mirrors fail short at 24 hours, never the SSR
 * library's default 400-day retention. Auth cookies remain browser-readable
 * for the supported SSR client and use Secure in production.
 */

export const REMEMBER_COOKIE = 'assembl-remember';
// Non-secret mirror for browser refresh. The canonical preference remains HttpOnly.
export const BROWSER_REMEMBER_COOKIE = 'assembl-session-retention';

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

/** Readable retention preference only; never a credential or authorisation flag. */
export function browserRememberCookieOptions(remember: boolean) {
  return { ...rememberCookieOptions(remember), httpOnly: false };
}

/**
 * Stamp the chosen lifetime onto a Supabase auth cookie as it is written.
 *
 * Only the long-lived session cookies (`sb-…-auth-token`, including the
 * chunked `.0`/`.1` variants) are tuned. The short-lived PKCE code-verifier
 * cookie retains its library lifetime; it also gets production Secure.
 */
export function tuneAuthCookieOptions<T extends { maxAge?: number; secure?: boolean }>(
  name: string,
  options: T,
  remember: boolean,
): T {
  const isSupabaseAuthCookie =
    name.startsWith('sb-') &&
    name.includes('-auth-token') &&
    !name.includes('code-verifier');

  if (!name.startsWith('sb-') || !name.includes('-auth-token')) return options;
  // Tokens and verifier writes/deletions all need production transport protection.
  const secured = { ...options, secure: process.env.NODE_ENV === 'production' || options.secure === true };
  // Preserve deletion, including obsolete chunks; do not extend verifier lifetime.
  if (!isSupabaseAuthCookie || (options.maxAge !== undefined && options.maxAge <= 0)) return secured;

  return {
    ...secured,
    maxAge: remember ? REMEMBER_MAX_AGE : SESSION_MAX_AGE,
  };
}
