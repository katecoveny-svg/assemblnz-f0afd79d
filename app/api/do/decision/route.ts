import { doOwner, sameDoOrigin, privateDoHeaders } from '@/apps/do/services/owner';
import { readDoJson, admitDoRequest } from '@/apps/do/shared/http';
import { parseInput, PilotError } from '@/lib/typesafe/core';
import { pilotStatus, requirePilot, runPilot } from '@/lib/typesafe/pilot';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 25;
const headers = { ...privateDoHeaders, Vary: 'Cookie, Origin' };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers });
export async function GET() {
  const owner = await doOwner();
  if (!owner) return json({ signedIn: false, ready: false }, 401);
  return json(pilotStatus(owner.id));
}
export async function POST(request: Request) {
  if (!sameDoOrigin(request)) return json({ error: 'origin_not_allowed', message: 'Open this pilot from Assembl.' }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: 'sign_in_required', message: 'Sign in before making a live TypeSafe request.' }, 401);
  try {
    requirePilot(owner.id);
    if (!admitDoRequest(`typesafe:${owner.id}`)) return json({ error: 'rate_limited', message: 'Please pause before making another request.' }, 429);
    let raw: unknown;
    try { raw = await readDoJson(request, 64_000); }
    catch { return json({ error: 'invalid_json', message: 'Provide a JSON body smaller than 64 KB.' }, 400); }
    const input = parseInput(raw);
    return json(await runPilot(input, owner.id));
  } catch (error) {
    if (error instanceof PilotError) return json({ error: error.code, message: error.message }, error.status);
    // Never return provider response bodies, source text, environment values or error stacks.
    return json({ error: 'pilot_failed', message: 'The pilot could not complete this request. No external action was taken.' }, 500);
  }
}
