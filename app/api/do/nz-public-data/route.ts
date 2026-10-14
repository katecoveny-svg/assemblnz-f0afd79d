import { admitDoRequest } from '@/apps/do/shared/http';
import { chatClientIp } from '@/lib/agents/chat-rate-limit';
import { fetchNztaTraffic } from '@/lib/do/nz-public-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/** Deliberately public and free: no account, paywall, notes or account context. */
export async function GET(request: Request) {
  const headers = new Headers({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  const params = new URL(request.url).searchParams;
  if ([...params.keys()].some(key => key !== 'source') || params.getAll('source').length > 1 ||
    (params.has('source') && params.get('source') !== 'nzta-traffic')) {
    return Response.json({ error: 'invalid_source', message: 'Choose the nzta-traffic public source. Private context is not accepted.' }, { status: 400, headers });
  }
  // Reuse DO's bounded, hashed per-process backstop in a separate namespace.
  // Deployment-level flood controls are still needed across server instances.
  if (!admitDoRequest(`nz-public-data:${chatClientIp(request.headers)}`)) {
    headers.set('Retry-After', '60');
    return Response.json({ error: 'rate_limited', message: 'Wait a minute before refreshing traffic information.' }, { status: 429, headers });
  }
  const snapshot = await fetchNztaTraffic({ signal: request.signal });
  return Response.json(snapshot, { status: snapshot.status === 'available' ? 200 : 503, headers });
}
