/**
 * POST /api/blueprint — keep a Business Blueprint so it can be shared.
 *
 * Body: { brief, email }
 * Returns: { slug, url }
 *
 * This is the ONLY place a blueprint is persisted. Everywhere else in the tool
 * is read-and-forget, and the page says so — so saving happens only when the
 * visitor explicitly asks to keep one, and the email they give is the consent
 * moment for that storage, not a lead grab bolted onto it.
 *
 * Retention is 90 days, stated to the visitor and enforced on read.
 *
 * Rate-limit: 6 saves per IP per hour.
 */

import { NextRequest } from 'next/server';
import { randomBytes } from 'node:crypto';

import { clientIpFromHeaders } from '@/lib/lead-capture';
import { getServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HITS = new Map<string, number[]>();
const WINDOW_MS = 60 * 60_000;
const MAX_HITS = 6;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  HITS.set(ip, recent);
  return recent.length > MAX_HITS;
}

/** Unguessable, but short enough to paste into a message. */
function makeSlug(domain: string): string {
  const stem = domain
    .replace(/^www\./, '')
    .split('.')[0]
    .replace(/[^a-z0-9]+/gi, '')
    .slice(0, 18)
    .toLowerCase();
  return `${stem || 'blueprint'}-${randomBytes(5).toString('hex')}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: NextRequest) {
  let body: { brief?: unknown; email?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'bad request' }, { status: 400 });
  }

  const ip = clientIpFromHeaders(req.headers) ?? 'anon';
  if (rateLimited(ip)) {
    return Response.json({ error: 'That is a lot of blueprints. Try again a bit later.' }, { status: 429 });
  }

  const email = String(body.email ?? '').trim().slice(0, 200);
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: 'That email address does not look right.' }, { status: 400 });
  }

  const brief = body.brief as Record<string, unknown> | undefined;
  const domain = typeof brief?.source === 'string' ? brief.source : '';
  if (!brief || !domain || typeof brief.business !== 'string') {
    return Response.json({ error: 'There is no blueprint to keep yet.' }, { status: 400 });
  }

  const slug = makeSlug(domain);

  try {
    const { error } = await getServiceClient()
      .from('blueprint_shares')
      .insert({ slug, domain, brief, email });
    if (error) {
      console.error('[blueprint] insert failed:', error.message);
      return Response.json({ error: 'Could not keep that blueprint right now.' }, { status: 503 });
    }
  } catch (err) {
    console.error('[blueprint] storage unavailable:', err);
    return Response.json({ error: 'Could not keep that blueprint right now.' }, { status: 503 });
  }

  return Response.json(
    { slug, url: `https://www.assembl.co.nz/blueprint/${slug}` },
    { headers: { 'cache-control': 'no-store' } },
  );
}
