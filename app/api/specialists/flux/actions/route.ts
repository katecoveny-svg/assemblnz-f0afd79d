import { createClient } from '@/lib/supabase/server';
import { createActionRequest } from '@/lib/agents/action-requests';
import { accountOwner, listConnectedAccounts, pipedreamConfigured } from '@/lib/connectors/pipedream';
import { connectorDraft, mappedDraft } from '@/lib/specialists/connector-drafts';

export async function POST(req: Request) {
  const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };
  const reply = (data: unknown, status = 200) => Response.json(data, { status, headers });
  if (req.headers.get('origin') !== new URL(req.url).origin) return reply({ error: 'Open Flux to review a business action.' }, 403);
  let userId: string | undefined;
  try { const db = await createClient(); const { data, error } = await db.auth.getUser(); if (!error && !data.user?.is_anonymous) userId = data.user?.id; } catch { /* Sign-in required. */ }
  if (!userId) return reply({ error: 'Sign in before requesting a business action.' }, 401);
  const raw = await req.text(); if (raw.length > 8000) return reply({ error: 'Please shorten the draft.' }, 413);
  let body: unknown; try { body = JSON.parse(raw); } catch { body = null; }
  const parsed = connectorDraft.safeParse(body); if (!parsed.success) return reply({ error: 'Complete and review the required fields and contact permission.' }, 400);
  if (!pipedreamConfigured()) return reply({ error: 'Business connector setup is needed. Download the reviewed draft for now.' }, 503);
  const externalUserId = `tenant:flux-${userId}`; const mapped = mappedDraft(parsed.data);
  try {
    const accounts = await listConnectedAccounts(externalUserId);
    if (!accounts.some(a => accountOwner(a) === externalUserId && a.app?.name_slug === mapped.app && a.healthy === true)) return reply({ error: 'Connect and verify the matching business account first.' }, 409);
    const request = await createActionRequest({ agentSlug: 'flux', requestedBy: userId, kind: 'connector_action', payload: { ...mapped, externalUserId, reason: 'User reviewed the exact field values in Flux. An assembl operator must review before dispatch. Outlook drafts must remain unsent.' } });
    if (!request) return reply({ error: 'The review request could not be confirmed. Keep this draft and check with your operator before retrying.' }, 503);
    return reply({ id: request.id, status: 'pending', message: 'Queued for operator review. No external record has changed.' });
  } catch { return reply({ error: 'The request could not be confirmed. Keep this draft and check with your operator before retrying.' }, 503); }
}
