import { doOwner, privateDoHeaders, sameDoOrigin } from '@/apps/do/services/owner';
import { readDoJson } from '@/apps/do/shared/http';
import { enquiryMutation } from '@/apps/do/enquiries/contract';
import { EnquiryError, requireEnquiryOwner, enquiryState, receiveEnquiry, transitionEnquiry, approveEnquiry, rotateEnquiryConnection, revokeEnquiryConnection, prepareEnquiryFollowups, enquiryPluginAccess } from '@/apps/do/enquiries/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: privateDoHeaders });
const failure = (error: unknown) => json({ error: error instanceof EnquiryError ? error.message : 'The request could not be completed. Refresh to check its status.' }, error instanceof EnquiryError ? error.status : 503);
export async function GET() {
  const owner = await doOwner();
  if (!owner) return json({ error: 'Sign in to open DO Enquiries.' }, 401);
  try { await requireEnquiryOwner(owner.id); return json({ ...await enquiryState(owner.id), workspaceKey: owner.id }); }
  catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  if (!sameDoOrigin(request)) return json({ error: 'Open DO Enquiries on assembl.' }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: 'Sign in to continue.' }, 401);
  // The page binds every mutation to the account whose data it displayed.
  if (request.headers.get('x-do-workspace') !== owner.id) return json({ error: 'Your account changed. Refresh before continuing.' }, 409);
  try {
    await requireEnquiryOwner(owner.id);
    let raw: unknown;
    try { raw = await readDoJson(request, 20_000); } catch { return json({ error: 'Use a valid, shorter request.' }, 400); }
    const parsed = enquiryMutation.safeParse(raw);
    if (!parsed.success) return json({ error: 'Check the fields and review the current draft.' }, 400);
    const p = parsed.data;
    if (p.action === 'receive') return json({ job: await receiveEnquiry(owner.id, { requestId: p.requestId, name: p.name, email: p.email, message: p.message }, 'owner') });
    if (p.action === 'connect') return json({ token: await rotateEnquiryConnection(owner.id) });
    if (p.action === 'disconnect') { await revokeEnquiryConnection(owner.id); return json({ ok: true }); }
    if (p.action === 'check_followups') return json({ prepared: await prepareEnquiryFollowups(owner.id) });
    if (p.action === 'enable_plugin' || p.action === 'disable_plugin') { await enquiryPluginAccess(owner.id, p.action === 'enable_plugin'); return json({ ok: true }); }
    if (p.action === 'approve') return json({ job: await approveEnquiry(owner.id, p.id, p.revision) });
    if ('id' in p) return json({ job: await transitionEnquiry(owner.id, p.id, p.action, { ...p, source: 'owner_recorded' }) });
    return json({ error: 'invalid_action' }, 400);
  } catch (error) { return failure(error); }
}
