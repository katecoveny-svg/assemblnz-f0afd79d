import { doOwner, sameDoOrigin, privateDoHeaders } from '@/apps/do/services/owner';
import { readDoJson, admitDoRequest } from '@/apps/do/shared/http';
import { reserveDoTrial } from '@/apps/do/shared/trial';
import { prepareDoDraft } from '@/apps/do/shared/preparation-server';
import { chatClientIp, checkChatRateLimit } from '@/lib/agents/chat-rate-limit';
import { parseInput, PilotError } from '@/lib/typesafe/core';
import { requirePilot, runPilot } from '@/lib/typesafe/pilot';
import { DoWorkflowConsentError, requireDoWorkflowConsent, runDoWorkflow } from '@/lib/typesafe/workflow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 90;
const headers = { ...privateDoHeaders, Vary: 'Cookie, Origin' };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers });

/** Opt-in bridge into the existing DO preparation service; NOT a send/publish or record-write API. */
export async function POST(request: Request) {
  if (!sameDoOrigin(request)) return json({ error: 'origin_not_allowed', message: 'Open this workflow from Assembl.' }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: 'sign_in_required', message: 'Sign in before running the DO workflow.' }, 401);
  try {
    requirePilot(owner.id);
    let raw: unknown;
    try { raw = await readDoJson(request, 64_000); }
    catch { return json({ error: 'invalid_json', message: 'Provide a JSON body smaller than 64 KB.' }, 400); }
    requireDoWorkflowConsent(raw);
    const input = parseInput(raw);
    // Share the original pilot's owner backstop rather than creating a second allowance.
    if (!admitDoRequest(`typesafe:${owner.id}`)) return json({ error: 'rate_limited', message: 'Please pause before making another request.' }, 429);
    const ip = chatClientIp(request.headers);
    const rate = await checkChatRateLimit(ip, 'do-preparation');
    if (!rate.allowed) return json({ error: 'rate_limited', message: 'The DO preparation limit has been reached. Try again later.' }, 429);
    if (request.signal.aborted) return json({ error: 'cancelled', message: 'The request was cancelled.' }, 409);
    // Ignore any decision, draft, user ID, provider or permission posted by the client.
    const pilot = await runPilot(input, owner.id);
    const workflow = await runDoWorkflow(input, pilot, {
      reserve: () => reserveDoTrial(ip, { signedInOwnerId: owner.id }),
      prepare: prepareDoDraft,
    }, request.signal);
    return json({ ...pilot, workflow });
  } catch (error) {
    if (error instanceof DoWorkflowConsentError) return json({ error: 'do_consent_required', message: error.message }, 400);
    if (error instanceof PilotError) return json({ error: error.code, message: error.message }, error.status);
    return json({ error: 'workflow_failed', message: 'The workflow could not complete. No record save, send or publication is claimed.' }, 500);
  }
}
