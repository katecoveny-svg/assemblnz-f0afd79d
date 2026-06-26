/**
 * Middleware-side Supabase session refresh.
 *
 * Runs before every request. Refreshes the auth session cookie and, when the
 * route is gated, redirects unauthenticated users to /login.
 *
 * Uses the request/response cookie shape because middleware runs in the Edge
 * runtime and cannot use next/headers cookies().
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { REMEMBER_COOKIE, isRemembered, tuneAuthCookieOptions } from './session-policy';

const PROTECTED_PREFIXES = ['/app', '/account', '/dashboard', '/internal'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anon) {
    // Fail open — without env vars there is no session to refresh. The
    // /login page itself will render the missing-env error.
    return response;
  }

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // "Stay signed in on this device" — keep the refreshed session cookies
        // on the same lifetime the visitor chose at sign-in.
        const remember = isRemembered(request.cookies.get(REMEMBER_COOKIE)?.value);
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, tuneAuthCookieOptions(name, options ?? {}, remember)),
        );
      },
    },
  });

  // Refreshes the session if it has expired. Must be called on every request
  // for the auth cookies to roll forward.
  const { data } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some((p) => request.nextUrl.pathname.startsWith(p));
  if (isProtected && !data.user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}
