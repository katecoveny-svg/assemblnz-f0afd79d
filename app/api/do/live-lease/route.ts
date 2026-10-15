import { doOwner, sameDoOrigin, privateDoHeaders as headers } from '@/apps/do/services/owner';
import { admitDoRequest, readDoJson } from '@/apps/do/shared/http';
import { chatClientIp, checkChatRateLimit } from '@/lib/agents/chat-rate-limit';
import { voiceLeaseRequest } from '@/apps/do/shared/voice-lease';
import { voiceLeaseRuntime, revokeVoiceLease } from '@/apps/do/services/voice-lease/runtime';
import { LeaseError } from '@/apps/do/services/voice-lease/service';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const json = (body: unknown, status = 200) => Response.json(body, { status, headers });
  if (!sameDoOrigin(request)) return json({ error: 'origin_required' }, 403);
  const owner = await doOwner();
  if (!owner) return json({ error: 'sign_in_required' }, 401);
  const input = voiceLeaseRequest.safeParse(await readDoJson(request).catch(() => null));
  if (!input.success) return json({ error: 'review_required' }, 400);
  // Explicit revoke must remain possible even when request quota is exhausted.
  if (input.data.action !== 'revoke') {
    const ip = chatClientIp(request.headers);
    if (!admitDoRequest(ip) || !(await checkChatRateLimit(ip, 'do-voice-lease')).allowed) return json({ error: 'wait_before_retry' }, 429);
  }
  if (request.signal.aborted) return json({ error: 'cancelled' }, 499);
  try {
    if (input.data.action === 'revoke') return json(await revokeVoiceLease(owner.id, input.data.leaseId));
    return json(await voiceLeaseRuntime().handle(owner.id, input.data, request.signal)); }
  catch (error) { return json({ error: error instanceof LeaseError ? error.code : 'lease_unavailable' }, error instanceof LeaseError ? error.status : 503); }
}
