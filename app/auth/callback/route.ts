import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Supabase magic-link callback. Supabase Auth posts the user back here with
 * a `code` param after they click the link in their inbox. We exchange the
 * code for a session (cookies are written via the server client) and then
 * redirect to the originally requested page.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const redirectParam = url.searchParams.get('redirect');
  const next = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/app';

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
  loginUrl.searchParams.set('error', 'Missing auth code in callback.');
  return NextResponse.redirect(loginUrl);
}
