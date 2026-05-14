import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/**
 * Magic-link / OTP confirmation. Uses `verifyOtp` against a `token_hash` so the
 * flow works across browsers and devices (e.g. submit on desktop, click the
 * link on phone) — unlike PKCE/`exchangeCodeForSession`, which requires the
 * verifier cookie to live on the same browser that initiated sign-in.
 *
 * Pairs with a Supabase email template of the form:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=magiclink&next={{ .RedirectTo }}
 * Configured in Supabase Dashboard → Auth → Email Templates.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const nextParam = url.searchParams.get('next');
  const next = nextParam && nextParam.startsWith('/') ? nextParam : '/app';

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(new URL(next, url.origin));
    }
    const loginUrl = new URL('/login', url.origin);
    loginUrl.searchParams.set('error', error.message);
    return NextResponse.redirect(loginUrl);
  }

  const loginUrl = new URL('/login', url.origin);
  loginUrl.searchParams.set('error', 'Missing or invalid confirmation parameters.');
  return NextResponse.redirect(loginUrl);
}
