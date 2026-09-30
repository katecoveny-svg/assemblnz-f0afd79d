import { doOwner, privateDoHeaders, sameDoOrigin } from '@/apps/do/services/owner';
import { admitDoRequest, readDoJson } from '@/apps/do/shared/http';
import { chatClientIp, checkChatRateLimit } from '@/lib/agents/chat-rate-limit';
import { PilotError } from '@/lib/typesafe/core';
import { personalAssistantInputSchema } from '@/apps/do/personal/assistant';
import { personalAssistantAvailability, runPersonalAssistant } from '@/apps/do/personal/assistant-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;
const headers = { ...privateDoHeaders, Vary: 'Cookie, Origin' };
const json = (body: unknown, status = 200, extra: Record<string, string> = {}) => Response.json(body, { status, headers: { ...headers, ...extra } });

export async function GET() {
  const owner = await doOwner();
  return json(personalAssistantAvailability(owner?.id ?? null), owner ? 200 : 401);
}

export async function POST(request: Request) {
  if (!sameDoOrigin(request)) return json({ error: 'origin_not_allowed', message: 'Open Personal DO on Assembl.' }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: 'sign_in_required', message: 'Sign in before asking your Personal DO.' }, 401);
  let raw: unknown;
  try { raw = await readDoJson(request, 64_000); }
  catch { return json({ error: 'invalid_request', message: 'Use a shorter, valid request.' }, 400); }
  const parsed = personalAssistantInputSchema.safeParse(raw);
  if (!parsed.success) return json({ error: 'invalid_input', message: parsed.error.issues[0]?.message ?? 'Check your request.' }, 400);
  const availability = personalAssistantAvailability(owner.id);
  if (!availability.ready) return json({ error: availability.reason, message: availability.message }, availability.reason === 'pilot_access_required' ? 403 : 503);
  const ip = chatClientIp(request.headers);
  if (!admitDoRequest(`personal-assistant:${owner.id}`) || !admitDoRequest(`personal-assistant-ip:${ip}`)) return json({ error: 'rate_limited', message: 'Please wait a minute before asking again.' }, 429, { 'Retry-After': '60' });
  const rate = await checkChatRateLimit(ip, 'do-personal-assistant');
  if (!rate.allowed) return json({ error: 'rate_limited', message: 'You have reached the request limit for now. Please try again in ten minutes.' }, 429, { 'Retry-After': '600' });
  try { return json({ result: await runPersonalAssistant(parsed.data, owner.id, request.signal) }); }
  catch (error) {
    if (error instanceof PilotError) return json({ error: error.code, message: error.message }, error.status);
    return json({ error: 'assistant_failed', message: 'Your Personal DO could not finish this request. Your note is still in the editor.' }, 503);
  }
}
