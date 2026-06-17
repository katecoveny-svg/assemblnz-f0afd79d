/**
 * POST /api/beat/dismiss — record that a user dismissed an ad.
 *
 * Called via navigator.sendBeacon (body may arrive as text/plain) or fetch
 * keepalive. Always 204s; dismissal is best-effort telemetry, never blocking.
 *
 * Body: { impressionId: string }
 */
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_CONTENT = new NextResponse(null, { status: 204 });

export async function POST(req: Request) {
  let impressionId = '';
  try {
    const text = await req.text();
    if (text) impressionId = String(JSON.parse(text)?.impressionId ?? '').trim();
  } catch {
    return NO_CONTENT; // malformed beacon — nothing to do
  }
  if (!impressionId) return NO_CONTENT;

  try {
    const service = getServiceClient();
    await service
      .from('beat_impressions')
      .update({ dismissed: true, dismissed_at: new Date().toISOString() })
      .eq('id', impressionId)
      .eq('dismissed', false); // idempotent: only the first dismissal stamps
  } catch (err) {
    console.error('[beat/dismiss] update failed:', err);
  }

  return NO_CONTENT;
}
