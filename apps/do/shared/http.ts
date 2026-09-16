import 'server-only';
import { createHash } from 'node:crypto';
const MAX_BODY_BYTES = 64_000;
const hits = new Map<string, number[]>();
export function allowedDoOrigin(request: Request): string | null {
  const origin = request.headers.get('origin');
  if (!origin) return null;
  if (/^chrome-extension:\/\/[a-p]{32}$/.test(origin)) return origin;
  try {
    const supplied = new URL(origin);
    const target = new URL(request.url);
    if (supplied.origin !== origin || !['http:', 'https:'].includes(supplied.protocol)) return null;
    // Next's local request URL can use localhost while the browser and Host
    // use 127.0.0.1. Compare the actual HTTP host as well as the normal URL.
    if (origin === target.origin || (supplied.host === request.headers.get('host') && supplied.protocol === target.protocol)) return origin;
  } catch { return null; }
  return null;
}
export function doHeaders(request: Request): Headers {
  const headers = new Headers({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', Vary: 'Origin' });
  const origin = allowedDoOrigin(request);
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
  }
  return headers;
}
export async function readDoJson(request: Request, maxBytes = MAX_BODY_BYTES): Promise<unknown> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new Error('json_required');
  if (Number(request.headers.get('content-length') || 0) > maxBytes) throw new Error('too_large');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('invalid_json');
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new Error('too_large'); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
  } finally { reader.releaseLock(); }
}
/** Per-process backstop in addition to assembl's existing database rate checks. */
export function admitDoRequest(ip: string, now = Date.now()): boolean {
  const key = createHash('sha256').update(`do:${ip}`).digest('hex');
  for (const [id, requests] of hits) if (!requests.some(time => time > now - 60_000)) hits.delete(id);
  const recent = (hits.get(key) || []).filter(time => time > now - 60_000);
  if (recent.length >= 6 || (!hits.has(key) && hits.size >= 2_000)) return false;
  recent.push(now); hits.set(key, recent); return true;
}
export function retiredDoResponse() {
  return Response.json({ error: 'preview_retired', message: 'This preview action has been retired. Open /do to prepare and review a draft in your own workspace.' }, { status: 410, headers: { 'Cache-Control': 'no-store' } });
}
