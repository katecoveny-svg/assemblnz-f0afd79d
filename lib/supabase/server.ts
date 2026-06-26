/**
 * Server-side Supabase client for Server Components, Route Handlers, and
 * Server Actions. Cookies are read/written through next/headers so the user
 * session lives across requests.
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { REMEMBER_COOKIE, isRemembered, tuneAuthCookieOptions } from './session-policy';

export async function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anon) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Set both in Vercel project env (and .env.local for local dev) — see .env.local.example.',
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          // "Stay signed in on this device" — stamp the chosen lifetime onto
          // the Supabase session cookies as they roll forward.
          const remember = isRemembered(cookieStore.get(REMEMBER_COOKIE)?.value);
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, tuneAuthCookieOptions(name, options ?? {}, remember));
          });
        } catch {
          // Called from a Server Component — cookies cannot be mutated here.
          // The middleware refreshes session cookies, so this is safe to ignore.
        }
      },
    },
  });
}
