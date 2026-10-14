import { doOwner, sameDoOrigin, privateDoHeaders } from '@/apps/do/services/owner';
import { readDoJson } from '@/apps/do/shared/http';
import { closedPairingAdapter, commandSchema, DURABLE_COORDINATION_NOTICE } from '@/apps/do/coordination/durable/contract';
import { coordinationCommand, coordinationSnapshot } from '@/apps/do/coordination/durable/service';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { ...privateDoHeaders, Vary: 'Cookie, Origin, X-DO-Workspace' } });
async function access(request: Request) {
  if (process.env.DO_EA_COORDINATION_PILOT !== 'true') return json({ error: 'coordination_inactive', notice: DURABLE_COORDINATION_NOTICE }, 503);
  const owner = await doOwner();
  if (!owner) return json({ error: 'sign_in_required' }, 401);
  if (request.headers.get('x-do-workspace') !== owner.id) return json({ error: 'account_changed' }, 409);
  if (!await closedPairingAdapter.allowsOwner(owner.id)) return json({ error: 'verified_pairing_unavailable' }, 403);
  return null;
}
export async function GET(request: Request) {
  const denied = await access(request); if (denied) return denied;
  try { return json({ mode: 'inactive_foundation', state: await coordinationSnapshot() }); }
  catch { return json({ error: 'storage_unavailable', saved: false }, 503); }
}
export async function POST(request: Request) {
  if (!sameDoOrigin(request)) return json({ error: 'origin_denied' }, 403);
  const denied = await access(request); if (denied) return denied;
  let input: unknown;
  try { input = await readDoJson(request, 16_384); } catch { return json({ error: 'invalid_command' }, 400); }
  const parsed = commandSchema.safeParse(input);
  if (!parsed.success) return json({ error: 'invalid_command' }, 400);
  try {
    const result = await coordinationCommand(parsed.data);
    const code = (result as { error?: string }).error;
    const status = code === 'scope_denied' ? 403 : code === 'quota_exceeded' ? 429 : code === 'invalid_command' ? 400 : code === 'expired' || code === 'closed' ? 410 : code ? 409 : 200;
    return json({ mode: 'inactive_foundation', ...result }, status);
  } catch { return json({ error: 'storage_unavailable', saved: false }, 503); }
}
