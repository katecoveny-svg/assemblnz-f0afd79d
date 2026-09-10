import { isSpecialist } from '@/lib/specialists/sources';
import { retrieveSpecialistSources } from '@/lib/specialists/live-sources';
import { createHash } from 'node:crypto';
import { consume } from '@/lib/creative/ratelimit';
import { clientIpFromHeaders } from '@/lib/lead-capture';

export const runtime = 'nodejs';
export const maxDuration = 20;
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  if (!isSpecialist(slug)) return Response.json({ error: 'Unknown specialist.' }, { status: 404 });
  const key = createHash('sha256').update(`official-sources:${clientIpFromHeaders(req.headers) ?? 'unknown'}`).digest('hex');
  const rate = await consume(key, 'copy');
  if (!rate.ok) return Response.json({ error: 'The source check limit has been reached. You can still open the official links.' }, { status: 429, headers: { 'Cache-Control': 'no-store' } });
  const query = (new URL(req.url).searchParams.get('topic') ?? '').slice(0, 300);
  const checks = await retrieveSpecialistSources(slug, query, req.signal);
  return Response.json({ checks: checks.map(s => s.status === 'retrieved' ? { ...s, excerpt: s.excerpt.slice(0, 600) } : s) }, { headers: { 'Cache-Control': 'no-store' } });
}
