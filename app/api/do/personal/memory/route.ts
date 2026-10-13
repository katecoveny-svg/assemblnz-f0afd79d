import { doOwner, privateDoHeaders, sameDoOrigin } from '@/apps/do/services/owner';
import { readDoJson } from '@/apps/do/shared/http';
import { PERSONAL_MEMORY_NOTICE, personalMemoryMutationSchema } from '@/apps/do/personal/memory';
import { loadPersonalMemory, mutatePersonalMemory, MemoryConflict } from '@/apps/do/personal/memory-service';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: privateDoHeaders });
export async function GET() {
  const owner = await doOwner();
  if (!owner) return json({ records: [], storage: 'none', saved: false, workspaceKey: 'guest', notice: PERSONAL_MEMORY_NOTICE, family: 'fictional_preview_only' });
  try { return json({ records: await loadPersonalMemory(owner.id), storage: 'account', saved: true, workspaceKey: owner.id, notice: PERSONAL_MEMORY_NOTICE }); }
  catch { return json({ error: 'Optional account memory is unavailable.', storage: 'unavailable', saved: false, workspaceKey: owner.id }, 503); }
}
export async function POST(request: Request) {
  if (!sameDoOrigin(request)) return json({ error: 'Open memory on assembl.' }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: 'Sign in to save optional account memory.' }, 401);
  // A note reviewed under one signed-in owner is never saved under another after a session switch in another tab.
  if (request.headers.get('x-do-workspace') !== owner.id) return json({ error: 'Your signed-in account changed. Reload before saving this note.', workspaceChanged: true }, 409);
  let raw: unknown;
  try { raw = await readDoJson(request); } catch { return json({ error: 'Use a bounded valid request.' }, 400); }
  const parsed = personalMemoryMutationSchema.safeParse(raw);
  if (!parsed.success) return json({ error: 'Confirm self-only context, consent, provenance and retention.' }, 400);
  try { return json({ record: await mutatePersonalMemory(owner.id, parsed.data), saved: true }); }
  catch (error) {
    return error instanceof MemoryConflict ? json({ error: 'This record changed. Reload before editing.' }, 409)
      : json({ error: 'Memory storage unavailable. No change was confirmed.' }, 503);
  }
}
