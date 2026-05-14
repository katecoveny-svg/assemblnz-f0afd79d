'use server';

import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/**
 * Server-action variant of the magic-link send.
 *
 * Why server-side: when signInWithOtp runs in the browser, the PKCE code
 * verifier is written via document.cookie — not HttpOnly, and on mobile
 * (especially when email links open in a different webview than the form
 * was submitted in) the cookie was being lost, producing the
 * "PKCE code verifier not found in storage" error on /auth/callback.
 *
 * Running here writes the verifier through next/headers cookies(), which
 * sets it HttpOnly + Secure + SameSite=Lax with the cookie attributes
 * Next.js negotiates for the response — far more reliable across the
 * email round-trip on mobile browsers.
 */
export type SendMagicLinkResult = { ok: true } | { ok: false; error: string };

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
  const callback = `${origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: callback },
  });

  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
