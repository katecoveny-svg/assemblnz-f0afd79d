import { createHash } from 'node:crypto';
import { prospectBrief, researchProspects } from '@/lib/specialists/prospecting';
import { consume } from '@/lib/creative/ratelimit';
import { clientIpFromHeaders } from '@/lib/lead-capture';

export const runtime = 'nodejs';
export const maxDuration = 60;
export async function POST(req: Request) {
  const headers = { 'Cache-Control': 'no-store' };
  if (req.headers.get('origin') !== new URL(req.url).origin) return Response.json({ error: 'Open Flux to research.' }, { status: 403, headers });
  const raw = await req.text(); if (raw.length > 3000) return Response.json({ error: 'Please shorten the brief.' }, { status: 413, headers });
  let body: unknown; try { body = JSON.parse(raw); } catch { body = null; }
  const parsed = prospectBrief.safeParse(body); if (!parsed.success) return Response.json({ error: 'Add the market, business type and observable signals.' }, { status: 400, headers });
  const key = createHash('sha256').update(`flux-research:${clientIpFromHeaders(req.headers) ?? 'unknown'}`).digest('hex');
  const rate = await consume(key, 'copy'); if (!rate.ok) return Response.json({ error: 'The research limit has been reached. Try again later.' }, { status: 429, headers });
  const result = await researchProspects(parsed.data, AbortSignal.any([req.signal, AbortSignal.timeout(50000)]));
  return Response.json(result, { status: result.status === 'unavailable' ? 503 : 200, headers });
}
