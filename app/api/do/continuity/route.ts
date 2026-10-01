import { doOwner, privateDoHeaders, sameDoOrigin } from '@/apps/do/services/owner';
import { readDoJson } from '@/apps/do/shared/http';
import { CONTINUITY_DURABLE_ACTIVE } from '@/apps/do/continuity/activation';
import { ContinuityError, mutationSchema, scopeSchema } from '@/apps/do/continuity/contract';
import { DurableRepository } from '@/apps/do/continuity/durable';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: privateDoHeaders });
const unavailable = { error: 'storage_unavailable', durable: false,
  message: 'Cross-device storage is awaiting review. Nothing has been saved online.' };
const messages = {
  conflict: 'This task changed. Reopen it before trying again.', not_found: 'That task is not available in this scope.',
  stopped: 'This task is stopped. Create a new request to continue.', permission_expired: 'Permission expired. Review a new request to continue.',
  id_reused: 'This save has already been used. Reopen the task.', storage_unavailable: 'Save or reload could not be confirmed. Reopen or retry with the same task ID.',
  quota_exhausted: 'Task storage is full. No new work saved. Reopen an existing task.',
};
function failure(error: unknown) {
  const code = error instanceof ContinuityError ? error.code : 'storage_unavailable';
  return json({ error: code, message: messages[code], durable: false }, code === 'not_found' ? 404 : code === 'storage_unavailable' ? 503 : 409);
}
export async function GET(request: Request) {
  if (request.headers.get('origin') && !sameDoOrigin(request)) return json({ error: 'origin_not_allowed' }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: 'auth_required', workspaceKey: 'guest', durable: false }, 401);
  const url = new URL(request.url);
  const scope = scopeSchema.safeParse(url.searchParams.get('scope') || 'personal');
  if (!scope.success) return json({ error: 'invalid_input' }, 400);
  if (!CONTINUITY_DURABLE_ACTIVE) return json({ ...unavailable, workspaceKey: owner.id }, 503);
  try {
    const repo = new DurableRepository(await createClient(), owner.id);
    const id = url.searchParams.get('id');
    if (id && !mutationSchema.options[0].shape.id.safeParse(id).success) return json({ error: 'invalid_input' }, 400);
    const tasks = id ? [await repo.get(owner.id, scope.data, id, new Date().toISOString())].filter(Boolean)
      : await repo.list(owner.id, scope.data, new Date().toISOString());
    return json({ tasks, durable: true, storage: 'database', workspaceKey: owner.id });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  if (!sameDoOrigin(request)) return json({ error: 'origin_not_allowed' }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: 'auth_required', durable: false }, 401);
  // A form reviewed under owner A must never be saved under owner B after a
  // cookie/session switch. The header is an expectation, not owner authority.
  if (request.headers.get('x-do-workspace') !== owner.id)
    return json({ error: 'workspace_changed', message: 'Your signed-in workspace changed. Reopen it before saving.', durable: false }, 409);
  let raw: unknown;
  try { raw = await readDoJson(request, 65536); } catch { return json({ error: 'invalid_input' }, 400); }
  const input = mutationSchema.safeParse(raw);
  if (!input.success) return json({ error: 'invalid_input' }, 400);
  if (!CONTINUITY_DURABLE_ACTIVE) return json(unavailable, 503);
  try {
    const repo = new DurableRepository(await createClient(), owner.id);
    const task = input.data.action === 'save' ? await repo.save(owner.id, input.data, new Date().toISOString())
      : await repo.change(owner.id, input.data, new Date().toISOString());
    return json({ task, durable: true, storage: 'database', workspaceKey: owner.id });
  } catch (error) { return failure(error); }
}
