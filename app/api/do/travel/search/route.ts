import { doOwner, privateDoHeaders, sameDoOrigin } from '@/apps/do/services/owner';
import { createClient } from '@/lib/supabase/server';
import { TRAVEL_CONTRACT } from '@/lib/do/travel/provider-contract';
export const dynamic = 'force-dynamic';
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: privateDoHeaders });
export async function GET() {
  if (!await doOwner()) return reply({ state: 'auth_required', authenticated: false, configured: null, verified: false }, 401);
  try {
    const client = await createClient();
    // GET checks the adapter contract only. It cannot perform a provider search.
    const { data, error } = await client.functions.invoke('live-travel', { method: 'GET' });
    if (error || data?.contract !== TRAVEL_CONTRACT) return reply({ state: 'unavailable', authenticated: true, configured: null, verified: false, reason: 'compatible_adapter_unavailable' });
    return reply({ contract: TRAVEL_CONTRACT, state: 'unavailable', authenticated: true, configured: typeof data.configured === 'boolean' ? data.configured : null, entitlement: 'unverified', verified: false, canSearch: false, reason: 'owner_search_authority_unverified' });
  } catch { return reply({ state: 'error', authenticated: true, configured: null, verified: false, reason: 'readiness_check_failed' }, 502); }
}
export async function POST(req: Request) {
  if (!sameDoOrigin(req)) return reply({ state: 'error', reason: 'origin_required' }, 403);
  if (!await doOwner()) return reply({ state: 'auth_required' }, 401);
  // No owner-specific atomic entitlement/rate/spend authority exists yet.
  // Do not forward a paid request just because an Edge deployment reports ready.
  return reply({ state: 'unavailable', reason: 'owner_search_authority_unverified', verified: false }, 403);
}
