/**
 * Browser-side Supabase client for Client Components.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY at runtime.
 * These env vars must point at the canonical assembl-prod Supabase project
 * (project ref `wurwcrgxjjwqdaxqceey`, Sydney region — the "Lovable"-lineage
 * project that IS live assembl-prod, confirmed by Kate 2026-05-09).
 */
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set both in Vercel project env (and .env.local for local dev) — see .env.local.example.',
    );
  }

  return createBrowserClient(url, anon);
}
