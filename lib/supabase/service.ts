/**
 * Service-role Supabase client for Next.js server-side admin reads.
 *
 * Use ONLY behind a tight allowlist (e.g. /app/admin pages gated by email).
 * Bypasses RLS, so the caller is responsible for proving authorisation
 * before the client is requested.
 *
 * Mirrors the Stripe service client pattern in lib/stripe/supabase-service.ts
 * but lives under lib/supabase/ so non-Stripe admin code has a canonical home.
 *
 * Server-only; never bundled to the client.
 */
import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to use the service-role client.',
    );
  }

  _client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}
