/**
 * GET /api/pulse/click?i=<impressionId> — record a click and redirect to the
 * advertiser's destination.
 *
 * The SDK navigates the browser here; we mark the impression clicked and 302 to
 * the campaign's cta_url. Open-redirect guard: only http(s) destinations are
 * followed. Unknown / malformed impressions bounce to the Pulse landing page
 * rather than erroring in the user's face.
 */
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function safeHttpUrl(raw: string | null | undefined, base: string): string {
  if (!raw) return new URL('/pulse', base).toString();
  try {
    const u = new URL(raw);
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.toString();
  } catch {
    /* fall through */
  }
  return new URL('/pulse', base).toString();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const impressionId = url.searchParams.get('i')?.trim();
  const fallback = new URL('/pulse', url.origin).toString();

  if (!impressionId) return NextResponse.redirect(fallback, { status: 302 });

  let service: ReturnType<typeof getServiceClient>;
  try {
    service = getServiceClient();
  } catch {
    return NextResponse.redirect(fallback, { status: 302 });
  }

  // Resolve the destination from the impression's campaign, and mark clicked.
  const { data: impression } = await service
    .from('pulse_impressions')
    .select('id, clicked, pulse_campaigns ( cta_url )')
    .eq('id', impressionId)
    .maybeSingle();

  if (!impression) return NextResponse.redirect(fallback, { status: 302 });

  // Supabase types the embedded relation as object-or-array; normalise.
  const rel = (impression as { pulse_campaigns?: { cta_url?: string } | { cta_url?: string }[] })
    .pulse_campaigns;
  const ctaUrl = Array.isArray(rel) ? rel[0]?.cta_url : rel?.cta_url;
  const dest = safeHttpUrl(ctaUrl, url.origin);

  // Idempotent: only stamp the first click.
  if (!impression.clicked) {
    await service
      .from('pulse_impressions')
      .update({ clicked: true, clicked_at: new Date().toISOString() })
      .eq('id', impressionId);
  }

  return NextResponse.redirect(dest, { status: 302 });
}
