import { doOwner, privateDoHeaders as headers } from '@/apps/do/services/owner';
import { admitDoRequest } from '@/apps/do/shared/http';
import { persistenceReadiness } from '@/apps/do/personal/readiness';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => Response.json(body, { status, headers });

export async function GET(req: Request) {
  const owner = await doOwner();
  if (!owner) return json({ error: 'sign_in_required' }, 401);
  // No caller-selectable owner, table, query or administrative operation.
  if (new URL(req.url).search) return json({ error: 'invalid_query' }, 400);
  if (!admitDoRequest(`persistence-readiness:${owner.id}`)) return json({ error: 'rate_limited' }, 429);
  try {
    const signal = AbortSignal.any([req.signal, AbortSignal.timeout(10_000)]);
    const result = await persistenceReadiness(owner, signal);
    const current = await doOwner();
    signal.throwIfAborted();
    if (current?.id !== owner.id || current.externalId !== owner.externalId) return json({ error: 'owner_changed' }, 409);
    return json(result);
  } catch { return json({ error: 'readiness_unavailable' }, 503); }
}
