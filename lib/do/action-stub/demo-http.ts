import { createHash } from 'node:crypto';
import { chatClientIp } from '@/lib/agents/chat-rate-limit';
import { allowedDoOrigin, admitDoRequest, doHeaders, readDoJson } from '@/apps/do/shared/http';

/** Demo prototype APIs allow denser step clicks than browser-seat capture. */
const demoHits = new Map<string, number[]>();

export function admitDoDemoRequest(ip: string, now = Date.now(), limit = 60): boolean {
  const key = createHash('sha256').update(`do-demo:${ip}`).digest('hex');
  for (const [id, requests] of demoHits) {
    if (!requests.some((time) => time > now - 60_000)) demoHits.delete(id);
  }
  const recent = (demoHits.get(key) || []).filter((time) => time > now - 60_000);
  if (recent.length >= limit) return false;
  recent.push(now);
  demoHits.set(key, recent);
  return true;
}

export function doDemoClientIp(request: Request): string {
  return chatClientIp(request.headers);
}

export { allowedDoOrigin, admitDoRequest, doHeaders, readDoJson };
