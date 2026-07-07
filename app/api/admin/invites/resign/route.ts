import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import { buildInviteSlug, getInviteSecret, inviteToken, sha256Hex } from '@/lib/demo-invites/crypto';

/**
 * Re-sign demo invite slugs against the LIVE runtime secret.
 *
 * Why this exists: the invite token is `HMAC(invite:<prefix>, DEMO_INVITE_SECRET)`,
 * and that HMAC is only valid if it was computed with the exact plaintext secret
 * the edge runtime holds. A mint job that reads DEMO_INVITE_SECRET from the Vercel
 * API gets the *encrypted envelope* back (not the plaintext the runtime decrypts),
 * so its tokens verify against the envelope but 401 against the live runtime — the
 * link looks minted but dies at /for/[slug]. (This is exactly what happened to the
 * four family-* invites in #777.) The same failure mode occurs on any future
 * DEMO_INVITE_SECRET rotation without a re-mint.
 *
 * This endpoint runs INSIDE the runtime, so getInviteSecret() returns the real
 * plaintext. It recomputes each active invite's slug from its own prefix and
 * repairs (slug + token_hash) any row whose stored slug doesn't match. Idempotent:
 * already-correct rows are reported unchanged, so it is safe to re-run and safe to
 * wire into a rotation flow.
 *
 * Auth: server-to-server only. Requires `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`,
 * compared constant-time. No browser session, so it can be driven by an operator
 * script or a rotation hook. The route is under /api/* which is exempt from the
 * demo basic-auth gate, so this bearer check is the only thing guarding it.
 *
 * Body (optional): `{ "demo": "family" }` to scope to one pilot; omit to sweep all
 * active invites.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const encoder = new TextEncoder();

function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = encoder.encode(a);
  const bb = encoder.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

type ResignResult =
  | { slug: string; changed: false }
  | { old: string; new: string; demo: string; changed: boolean; error?: string };

export async function POST(request: Request) {
  const expected = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const header = request.headers.get('authorization') ?? '';
  const presented = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!expected || !presented || !timingSafeEqualStr(presented, expected)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const secret = getInviteSecret();
  if (!secret) {
    return NextResponse.json(
      { error: 'DEMO_INVITE_SECRET is not configured at runtime' },
      { status: 500 },
    );
  }

  let demoFilter: string | null = null;
  try {
    const body = (await request.json()) as { demo?: unknown };
    if (body && typeof body.demo === 'string' && body.demo.trim()) {
      demoFilter = body.demo.trim();
    }
  } catch {
    // no body — sweep all active invites
  }

  const sb = getServiceClient();
  let query = sb
    .from('demo_invites')
    .select('id, slug, demo, revoked_at')
    .is('revoked_at', null);
  if (demoFilter) query = query.eq('demo', demoFilter);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: `read failed: ${error.message}` }, { status: 500 });
  }

  const results: ResignResult[] = [];
  for (const row of data ?? []) {
    const slug = row.slug as string;
    const cut = slug.lastIndexOf('-');
    if (cut <= 0) continue; // malformed — leave it alone

    const prefix = slug.slice(0, cut);
    const correctSlug = await buildInviteSlug(prefix, secret);
    if (correctSlug === slug) {
      results.push({ slug, changed: false });
      continue;
    }

    const token = await inviteToken(prefix, secret);
    const { error: upErr } = await sb
      .from('demo_invites')
      .update({ slug: correctSlug, token_hash: await sha256Hex(token) })
      .eq('id', row.id);

    results.push({
      old: slug,
      new: correctSlug,
      demo: row.demo as string,
      changed: !upErr,
      ...(upErr ? { error: upErr.message } : {}),
    });
  }

  const repaired = results.filter((r) => 'new' in r && r.changed);
  return NextResponse.json({
    ok: true,
    scanned: results.length,
    repaired: repaired.length,
    results,
  });
}
