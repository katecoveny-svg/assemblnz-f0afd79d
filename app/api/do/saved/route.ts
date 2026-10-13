import { z } from 'zod';
import { doOwner, privateDoHeaders, sameDoOrigin } from '@/apps/do/services/owner';
import { readDoJson } from '@/apps/do/shared/http';
import { createClient } from '@/lib/supabase/server';
import { savedDurableActive } from '@/lib/do/saved/activation';
import { SavedError, SavedRepository } from '@/lib/do/saved/durable';
import { PostgresSavedStore } from '@/lib/do/saved/storage';
import { saveIntentSchema } from '@/lib/do/saved/save-intent';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { ...privateDoHeaders, Vary: 'Cookie, Origin, X-DO-Workspace' } });
const closed = () => json({ error: 'unavailable', durable: false, message: 'Account saving is unavailable. Nothing was saved online.' }, 503);
const idSchema = z.string().uuid();
const command = z.discriminatedUnion('action', [
  z.object({ action: z.literal('save'), id: idSchema, expectedRevision: z.number().int().nonnegative(),
    content: saveIntentSchema, consent: z.literal(true), consentVersion: z.literal('do-saved-v1') }).strict(),
  z.object({ action: z.literal('remove'), id: idSchema, expectedRevision: z.number().int().positive() }).strict(),
]);
type Reconciliation = { workspaceKey: string; id: string; expectedRevision: number; action: 'save' | 'remove' };
function failure(error: unknown, reconciliation?: Reconciliation) {
  if (!(error instanceof SavedError) || error.code === 'unavailable') return json({
    error: 'unavailable', durable: false,
    ...(reconciliation ? { outcome: 'unknown', reconciliation } : {}),
    message: reconciliation
      ? 'The change could not be confirmed. It may already have been applied online. Read this same item with the same account and compare its revision and content before deciding what to do next. Do not create a new item to retry.'
      : 'Saved items could not be loaded. Try reading them again with the same account.',
  }, 503);
  return json({ error: error.code, durable: false, message: 'The saved item changed or is unavailable. Reload before reviewing a new save.' }, error.code === 'not_found' ? 404 : error.code === 'quota' ? 429 : 409);
}
async function access(request: Request) {
  // Closed path does not touch auth, DB or user content. No env/config change activates this.
  if (!savedDurableActive()) return closed();
  if ((request.method !== 'GET' || request.headers.has('origin')) && !sameDoOrigin(request)) return json({ error: 'origin_not_allowed', durable: false }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: 'auth_required', durable: false }, 401);
  if (request.headers.get('x-do-workspace') !== owner.id) return json({ error: 'owner_changed', durable: false }, 409);
  return owner;
}
export async function GET(request: Request) {
  const owner = await access(request); if (owner instanceof Response) return owner;
  const params = new URL(request.url).searchParams;
  const id = params.get('id');
  if ([...params.keys()].some(key => key !== 'id') || params.getAll('id').length > 1 || (id !== null && !idSchema.safeParse(id).success)) return json({ error: 'invalid_input', durable: false }, 400);
  try {
    const repo = new SavedRepository(new PostgresSavedStore(await createClient()), owner.id);
    const items = id ? [await repo.get(owner.id, id)].filter(Boolean) : await repo.list(owner.id);
    return json({ items, workspaceKey: owner.id, durable: true });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  const owner = await access(request); if (owner instanceof Response) return owner;
  let raw: unknown;
  try { raw = await readDoJson(request, 40_000); } catch { return json({ error: 'invalid_input', durable: false }, 400); }
  const parsed = command.safeParse(raw);
  if (!parsed.success || (parsed.data.action === 'save' && parsed.data.content.kind === 'image')) return json({ error: 'invalid_input', durable: false }, 400);
  try {
    const repo = new SavedRepository(new PostgresSavedStore(await createClient()), owner.id), input = parsed.data;
    const item = input.action === 'save'
      ? await repo.save(owner.id, input.id, input.expectedRevision, input.content, new Date().toISOString())
      : await repo.remove(owner.id, input.id, input.expectedRevision, new Date().toISOString());
    return json({ item, workspaceKey: owner.id, durable: true });
  } catch (error) { return failure(error, { workspaceKey: owner.id, id: parsed.data.id, expectedRevision: parsed.data.expectedRevision, action: parsed.data.action }); }
}
