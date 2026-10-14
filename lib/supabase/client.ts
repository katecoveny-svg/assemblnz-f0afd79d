/**
 * Browser-side Supabase client for Client Components.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY at runtime.
 * These env vars must point at the canonical assembl-prod Supabase project
 * (project ref `wurwcrgxjjwqdaxqceey`, Sydney region — the "Lovable"-lineage
 * project that IS live assembl-prod, confirmed by Kate 2026-05-09).
 */
import { createBrowserClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr';
import { BROWSER_REMEMBER_COOKIE, isRemembered, tuneAuthCookieOptions } from './session-policy';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anon) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Set both in Vercel project env (and .env.local for local dev) — see .env.local.example.',
    );
  }

  return createBrowserClient(url, anon, {
    cookies: {
      getAll() {
        return typeof document === 'undefined' ? [] : parseCookieHeader(document.cookie)
          .map(({ name, value }) => ({ name, value: value ?? '' }));
      },
      setAll(cookiesToSet) {
        if (typeof document === 'undefined') return;
        // Read the server-issued preference on every refresh, not once at creation.
        // Missing/expired mirror defaults to 24h rather than SSR's 400-day default.
        const remember = isRemembered(parseCookieHeader(document.cookie)
          .find(({ name }) => name === BROWSER_REMEMBER_COOKIE)?.value);
        cookiesToSet.forEach(({ name, value, options }) => {
          document.cookie = serializeCookieHeader(name, value,
            tuneAuthCookieOptions(name, options ?? {}, remember));
        });
      },
    },
  });
}
