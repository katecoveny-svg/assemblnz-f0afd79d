/**
 * POST /api/blueprint/recheck — read the site again and say what changed.
 *
 * Body: { slug }
 * Returns: { fixed[], stillOpen[], newGaps[], answered, previousAnswered, total }
 *
 * Honesty note: websites change for all sorts of reasons that have nothing to do
 * with us. This reports the difference between two readings and says nothing
 * about cause — "these four are no longer unanswered", never "you fixed these
 * because of us".
 *
 * Rate-limit: 10 rechecks per IP per hour.
 */

import { NextRequest } from 'next/server';

import { clientIpFromHeaders } from '@/lib/lead-capture';
import { getServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HITS = new Map<string, number[]>();
const WINDOW_MS = 60 * 60_000;
const MAX_HITS = 10;

/** Rejected requests are not counted — see the note in /api/agent-brief. */
function rateLimited(ip: string | null): boolean {
  if (!ip) return false;
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    HITS.set(ip, recent);
    return true;
  }
  recent.push(now);
  HITS.set(ip, recent);
  return false;
}

/** Loose match — a site rarely rewords a gap identically, so compare on shape. */
function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function overlaps(a: string, b: string): boolean {
  const A = new Set(normalise(a).split(' ').filter((w) => w.length > 3));
  const B = new Set(normalise(b).split(' ').filter((w) => w.length > 3));
  if (!A.size || !B.size) return false;
  let shared = 0;
  for (const w of A) if (B.has(w)) shared += 1;
  return shared / Math.min(A.size, B.size) >= 0.5;
}

export async function POST(req: NextRequest) {
  let body: { slug?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'bad request' }, { status: 400 });
  }

  const ip = clientIpFromHeaders(req.headers);
  if (rateLimited(ip)) {
    return Response.json({ error: 'Give it a little while before checking again.' }, { status: 429 });
  }

  const slug = String(body.slug ?? '');
  if (!/^[a-z0-9-]{4,40}$/.test(slug)) {
    return Response.json({ error: 'unknown blueprint' }, { status: 400 });
  }

  const db = getServiceClient();
  const { data: kept, error } = await db
    .from('blueprint_shares')
    .select('slug, domain, brief, expires_at')
    .eq('slug', slug)
    .maybeSingle();
  if (error || !kept) return Response.json({ error: 'unknown blueprint' }, { status: 404 });
  if (new Date(kept.expires_at as string).getTime() < Date.now()) {
    return Response.json({ error: 'That blueprint has expired.' }, { status: 410 });
  }

  // Re-read through the same extraction the tool uses, so the two readings are
  // directly comparable.
  const origin = new URL(req.url).origin;
  let fresh: Record<string, unknown>;
  try {
    const res = await fetch(`${origin}/api/agent-brief`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ url: kept.domain }),
    });
    if (!res.ok) return Response.json({ error: 'Could not read the site just now.' }, { status: 502 });
    fresh = await res.json();
  } catch {
    return Response.json({ error: 'Could not read the site just now.' }, { status: 502 });
  }

  const before = (kept.brief as Record<string, unknown>) ?? {};
  const oldGaps = Array.isArray(before.blindSpots) ? (before.blindSpots as string[]) : [];
  const newGapsAll = Array.isArray(fresh.blindSpots) ? (fresh.blindSpots as string[]) : [];

  const fixed = oldGaps.filter((g) => !newGapsAll.some((n) => overlaps(g, n)));
  const stillOpen = oldGaps.filter((g) => newGapsAll.some((n) => overlaps(g, n)));
  const newGaps = newGapsAll.filter((n) => !oldGaps.some((g) => overlaps(g, n)));

  const answered = typeof fresh.answered === 'number' ? fresh.answered : null;
  const previousAnswered = typeof before.answered === 'number' ? before.answered : null;
  const total = Array.isArray(fresh.questions) ? (fresh.questions as string[]).length : 0;

  try {
    await db.from('blueprint_runs').insert({
      slug,
      brief: fresh,
      answered,
      blind_spot_count: newGapsAll.length,
    });
    await db
      .from('blueprint_shares')
      .update({ brief: fresh, last_checked_at: new Date().toISOString() })
      .eq('slug', slug);
  } catch (err) {
    console.error('[blueprint/recheck] could not record run:', err);
    // The comparison is still worth returning even if the write failed.
  }

  return Response.json(
    { fixed, stillOpen, newGaps, answered, previousAnswered, total },
    { headers: { 'cache-control': 'no-store' } },
  );
}
