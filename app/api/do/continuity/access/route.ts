import { z } from 'zod';
import { doOwner, privateDoHeaders, sameDoOrigin } from '@/apps/do/services/owner';
import { readDoJson } from '@/apps/do/shared/http';
import { continuityDurableActive } from '@/apps/do/continuity/activation';
import { scopeSchema } from '@/apps/do/continuity/contract';
import { DurableRepository } from '@/apps/do/continuity/durable';
import { createClient } from '@/lib/supabase/server';
import { continuityFailure } from '../route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: privateDoHeaders });
// Enabling is a fresh, explicit choice each time; the literal consent cannot be defaulted.
const inputSchema = z.discriminatedUnion('enable', [
  z.object({ scope: scopeSchema, enable: z.literal(true), consent: z.literal(true) }).strict(),
  z.object({ scope: scopeSchema, enable: z.literal(false) }).strict(),
]);

/** The owner's own cross-device switch. Off stops every read and write at once. */
export async function POST(request: Request) {
  if (!sameDoOrigin(request)) return json({ error: 'origin_not_allowed' }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: 'auth_required', durable: false }, 401);
  if (request.headers.get('x-do-workspace') !== owner.id)
    return json({ error: 'workspace_changed', message: 'Your signed-in workspace changed. Reopen it before changing sync.', durable: false }, 409);
  let raw: unknown;
  try { raw = await readDoJson(request, 1024); } catch { return json({ error: 'invalid_input' }, 400); }
  const input = inputSchema.safeParse(raw);
  if (!input.success) return json({ error: 'invalid_input' }, 400);
  if (!continuityDurableActive()) return json({ error: 'storage_unavailable', durable: false, message: 'Cross-device storage is not switched on for this deployment.' }, 503);
  try {
    const repo = new DurableRepository(await createClient(), owner.id);
    const access = await repo.access(owner.id, input.data.scope, input.data.enable);
    return json({ access, durable: true, storage: 'database', workspaceKey: owner.id });
  } catch (error) { return continuityFailure(error); }
}
