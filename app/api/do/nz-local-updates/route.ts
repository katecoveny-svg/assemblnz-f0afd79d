import { admitDoRequest } from '@/apps/do/shared/http';
import { findNzWeatherPlace } from '@/apps/do/personal/local-updates';
import { chatClientIp } from '@/lib/agents/chat-rate-limit';
import { nzLocalUpdates } from '@/lib/do/nz-local-updates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 25;

/** Public source reads only: no account, address, private notes or credentials. */
export async function GET(request: Request) {
  const headers = new Headers({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  const params = new URL(request.url).searchParams;
  const source = params.get('source');
  const place = params.get('place');
  const valid = [...params.keys()].every(key => key === 'source' || key === 'place') &&
    params.getAll('source').length === 1 && params.getAll('place').length <= 1 &&
    ((source === 'weather' && place !== null && !!findNzWeatherPlace(place)) || (source === 'geonet-news' && !params.has('place')));
  if (!valid) return Response.json({ error: 'invalid_request', message: 'Choose a supported public source and city. Private context is not accepted.' }, { status: 400, headers });
  if (!admitDoRequest(`nz-local-updates:${chatClientIp(request.headers)}`)) {
    headers.set('Retry-After', '60');
    return Response.json({ error: 'rate_limited', message: 'Wait a minute before checking again.' }, { status: 429, headers });
  }
  const snapshot = source === 'weather' ? await nzLocalUpdates.weather(place!) : await nzLocalUpdates.news();
  return Response.json(snapshot, { status: snapshot.status === 'available' ? 200 : 503, headers });
}
