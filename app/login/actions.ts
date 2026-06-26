'use server';

import { cookies, headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { REMEMBER_COOKIE, rememberCookieOptions } from '@/lib/supabase/session-policy';

/**
 * Sign-in server actions.
 *
 * Two ways in, sharing one "stay signed in on this device" preference:
 *   • Magic link (default for new accounts — nothing to remember at signup)
 *   • Email + password (instant, one click — no waiting for an email)
 *
 * Why server-side: when the Supabase calls run in the browser the PKCE code
 * verifier is written via document.cookie — not HttpOnly, and on mobile
 * (especially when an email link opens in a different webview than the form
 * was submitted in) the cookie was being lost, producing the "PKCE code
 * verifier not found in storage" error on /auth/callback. Running here writes
 * the verifier (and the session cookies) through next/headers cookies(), which
 * sets them HttpOnly + Secure + SameSite=Lax — far more reliable.
 */

type Result = { ok: true } | { ok: false; error: string };
export type SendMagicLinkResult = Result;
export type PasswordSignInResult = Result;

/**
 * Records the "stay signed in on this device" choice as a cookie. The Supabase
 * server client and the edge middleware read it to set the session-cookie
 * lifetime (90 days when remembered, 24 hours otherwise). Must be written
 * before the Supabase call that issues the session cookies so they pick up the
 * right lifetime in the same response.
 */
async function writeRememberPreference(remember: boolean) {
  const cookieStore = await cookies();
  cookieStore.set(REMEMBER_COOKIE, remember ? '1' : '0', rememberCookieOptions(remember));
}

function readRemember(formData: FormData): boolean {
  // Default ON: a missing field (older client) keeps the friendlier long
  // session; only an explicit "0" opts out.
  return formData.get('remember') !== '0';
}

export async function sendMagicLinkAction(
  _prev: SendMagicLinkResult | null,
  formData: FormData,
): Promise<SendMagicLinkResult> {
  const emailRaw = formData.get('email');
  const redirectToRaw = formData.get('redirectTo');

  if (typeof emailRaw !== 'string' || emailRaw.trim().length === 0) {
    return { ok: false, error: 'Email is required.' };
  }

  const email = emailRaw.trim().toLowerCase();
  const remember = readRemember(formData);
  const redirectTo =
    typeof redirectToRaw === 'string' && redirectToRaw.startsWith('/')
      ? redirectToRaw
      : '/app';

  const h = await headers();
  const forwardedHost = h.get('x-forwarded-host');
  const host = forwardedHost ?? h.get('host');
  const forwardedProto = h.get('x-forwarded-proto') ?? 'https';
  if (!host) {
    return { ok: false, error: 'Could not determine request origin.' };
  }
  const origin = `${forwardedProto}://${host}`;
  // /auth/confirm uses verifyOtp + token_hash, so the round-trip survives a
  // magic-link click in a different browser/webview than the one that
  // submitted (Gmail in-app, Apple Mail handoff, desktop→mobile). The
  // `remember` flag rides along so the session cookies written when the link
  // is confirmed get the lifetime the visitor chose here.
  const confirmUrl = `${origin}/auth/confirm?next=${encodeURIComponent(redirectTo)}&remember=${
    remember ? '1' : '0'
  }`;

  // Record the choice now too, so the same-browser /auth/callback path (which
  // does not carry the query flag) also honours it.
  await writeRememberPreference(remember);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: confirmUrl },
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

/**
 * Email + password sign-in. Writes the session cookies server-side and returns
 * — the client redirects on success. One click, no email round-trip.
 */
export async function passwordSignInAction(
  _prev: PasswordSignInResult | null,
  formData: FormData,
): Promise<PasswordSignInResult> {
  const emailRaw = formData.get('email');
  const passwordRaw = formData.get('password');

  if (typeof emailRaw !== 'string' || emailRaw.trim().length === 0) {
    return { ok: false, error: 'Email is required.' };
  }
  if (typeof passwordRaw !== 'string' || passwordRaw.length === 0) {
    return { ok: false, error: 'Password is required.' };
  }

  const email = emailRaw.trim().toLowerCase();
  const remember = readRemember(formData);

  // Set the lifetime preference before the session cookies are issued.
  await writeRememberPreference(remember);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: passwordRaw,
  });

  if (error) {
    // Keep the message generic — don't reveal whether the email exists.
    return {
      ok: false,
      error: 'That email and password did not match. Try again, or use a magic link.',
    };
  }
  return { ok: true };
}
