import { doOwner, privateDoHeaders, sameDoOrigin } from '@/apps/do/services/owner';
import { readDoJson } from '@/apps/do/shared/http';
import { checklistCloudSaveSchema } from '@/apps/do/personal/life-admin/cloud';
import { ChecklistConflict, loadCloudChecklists, saveCloudChecklists } from '@/apps/do/personal/life-admin/cloud-service';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { ...privateDoHeaders, Vary: 'Cookie, Origin, X-DO-Workspace' } });
export async function GET(request: Request) {
  const owner = await doOwner();
  if (!owner) return json({ error: 'Sign in to open saved checklists.' }, 401);
  if (request.headers.get('x-do-workspace') !== owner.id) return json({ error: 'Your account changed. Refresh DO before opening saved work.' }, 409);
  try { return json(await loadCloudChecklists(owner.id)); }
  catch { return json({ error: 'Your saved checklists could not load. Nothing has changed.' }, 503); }
}
export async function POST(request: Request) {
  if (!sameDoOrigin(request)) return json({ error: 'Open Personal DO on Assembl.' }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: 'Sign in to save checklists.' }, 401);
  if (request.headers.get('x-do-workspace') !== owner.id) return json({ error: 'Your account changed. Refresh DO before saving.' }, 409);
  let raw: unknown;
  try { raw = await readDoJson(request, 600_000); }
  catch { return json({ error: 'Use a smaller, valid checklist collection.' }, 400); }
  const parsed = checklistCloudSaveSchema.safeParse(raw);
  if (!parsed.success) return json({ error: parsed.error.issues[0]?.message ?? 'Check the collection.' }, 400);
  try { return json(await saveCloudChecklists(owner.id, parsed.data)); }
  catch (error) {
    if (error instanceof ChecklistConflict) return json({ error: 'Your saved collection changed on another device. Open the latest saved copy before saving again.' }, 409);
    return json({ error: 'Saving could not be confirmed. Keep this page open and download a copy before leaving.' }, 503);
  }
}
