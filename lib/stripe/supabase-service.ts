/**
 * Service-role Supabase client used by the Stripe webhook + Stripe lib
 * helpers that write to RLS-protected tables (toro_stripe_customers,
 * toro_payment_intents, assembl_audit_log).
 *
 * Why a separate client: the user-context client (lib/supabase/server.ts)
 * reads cookies from next/headers and assumes a Supabase Auth session.
 * Stripe webhooks are unauthenticated (Stripe POSTs from its own IPs);
 * billing server actions run under the user but write to service-only
 * RLS policies. Both call paths need the SERVICE_ROLE key.
 *
 * Server-only; never bundled to the client.
 */
import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

export function createServiceClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for the Stripe service client. Set both in Vercel env.',
    );
  }

  _client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

export function _resetServiceClientForTests(): void {
  _client = null;
}
