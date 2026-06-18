/**
 * GET /api/dash/sponsor?mode={consumer|publisher}&publisherId={?}
 *
 * Phase 0 STUB: returns a mocked NZ-brand ad fill, rotating through three fake
 * advertisers so the loader visibly cycles. Reads NOTHING about the page — only
 * the mode + (optional) publisherId in the query string. Real geo-confirmation
 * uses the request IP server-side only.
 *
 * TODO(assembl-fill): replace the mock rotation with a real auction against the
 * NZ ad network, geo-gated to Aotearoa traffic, honouring publisher floors.
 */
import { NextResponse } from 'next/server';
import { MOCK_SPONSORS, pickSponsor } from '@/components/dash/logic';

export const dynamic = 'force-dynamic';

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode');
  if (mode !== 'consumer' && mode !== 'publisher') {
    return NextResponse.json(
      { error: "mode must be 'consumer' or 'publisher'" },
      { status: 400 },
    );
  }
  // Rotate deterministically by the minute so successive waits see fresh fill
  // without per-request randomness (keeps the stub reproducible).
  const rotation = Math.floor(Date.now() / 60_000) % MOCK_SPONSORS.length;
  const sponsor = pickSponsor(rotation);
  return NextResponse.json(sponsor, {
    headers: { 'cache-control': 'no-store' },
  });
}
