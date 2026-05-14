import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/**
 * Supabase auth callback. Accepts two flows:
 *
 *   1. `code` — PKCE / OAuth. The browser that submitted sign-in stored a
 *      code verifier cookie; `exchangeCodeForSession` reads it and trades the
 *      code + verifier for a session. Same-browser only.
 *
 *   2. `token_hash` + `type` — magic-link / email OTP via `verifyOtp`. No
 *      verifier needed; survives cross-browser and cross-device clicks (Gmail
 *      in-app webview, Apple Mail handoff, desktop→mobile, etc.).
 *
 * The canonical magic-link route is `/auth/confirm` — this handler accepts
 * `token_hash` as a fallback so any in-flight links still resolve.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const redirectParam = url.searchParams.get('redirect') ?? url.searchParams.get('next');
  const next = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/app';

  const supabase = await createClient();

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
    const loginUrl = new URL('/login', url.origin);
    loginUrl.searchParams.set('error', error.message);
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
    const loginUrl = new URL('/login', url.origin);
    loginUrl.searchParams.set('error', error.message);
    return NextResponse.redirect(loginUrl);
  }

  const loginUrl = new URL('/login', url.origin);
  loginUrl.searchParams.set('error', 'Missing auth code in callback.');
  return NextResponse.redirect(loginUrl);
}
