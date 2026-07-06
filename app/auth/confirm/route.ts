import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { REMEMBER_COOKIE, rememberCookieOptions } from '@/lib/supabase/session-policy';

/**
 * Honour an explicit "stay signed in" choice carried on the magic-link URL.
 * Covers the cross-device case (submit on desktop, click on phone) where the
 * `assembl-remember` cookie set at sign-in does not reach this request. Must
 * run before verifyOtp so the session cookies pick up the chosen lifetime.
 */
async function applyRememberParam(url: URL) {
  const remember = url.searchParams.get('remember');
  if (remember !== '1' && remember !== '0') return;
  const cookieStore = await cookies();
  cookieStore.set(REMEMBER_COOKIE, remember, rememberCookieOptions(remember === '1'));
}

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
/**
 * Resolve the post-confirm destination. Normally `next` is a relative path.
 * Magic-link emails sent before 2026-07-05 carry an ABSOLUTE URL instead: the
 * old template pointed the link at SiteURL with the real confirm URL (which
 * held the true destination in its own `next`) nested inside. Unwrap that so
 * rescued old links still land where the visitor was headed, not on /app.
 */
function resolveNext(raw: string | null): string {
  if (!raw) return '/app';
  if (raw.startsWith('/')) return raw;
  try {
    const nested = new URL(raw);
    const host = nested.hostname;
    if (host === 'assembl.co.nz' || host.endsWith('.assembl.co.nz')) {
      const inner = nested.searchParams.get('next');
      if (inner && inner.startsWith('/')) return inner;
      if (!nested.pathname.startsWith('/auth')) return `${nested.pathname}${nested.search}`;
    }
  } catch {
    // not a URL — fall through to the default
  }
  return '/app';
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const next = resolveNext(url.searchParams.get('next'));

  await applyRememberParam(url);

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

  // Fallback: if the Supabase email template emits a default PKCE `?code=`
  // link instead of a `token_hash`, exchange it here so same-browser sign-in
  // still completes rather than bouncing to /login with an error.
  const code = url.searchParams.get('code');
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
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
