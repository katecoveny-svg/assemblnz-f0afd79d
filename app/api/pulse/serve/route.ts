/**
 * POST /api/pulse/serve — the assembl Pulse ad server.
 *
 * Runs a second-price auction (lib/pulse/auction) over active campaigns for the
 * requesting publisher + surface, logs an auditable impression, and returns the
 * winning ad — or 204 when the auction is empty so the SDK fails open to the
 * publisher's own fallback line.
 *
 * Request body (the ENTIRE trust envelope — nothing else is accepted):
 *   { publisherId: string, surface: string, context?: object }
 *
 * Writes go through the service-role client (bypasses RLS). The raw IP is never
 * stored — only a salted one-way hash (lib/pulse/ip).
 */
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import {
  nzTodayString,
  runAuction,
  spentToday,
  type PulseCampaign,
} from '@/lib/pulse/auction';
import { clientIp, hashIp } from '@/lib/pulse/ip';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Per-publisher hourly impression cap. Override via env; defaults to 1000. */
const HOURLY_CAP = Number(process.env.PULSE_HOURLY_CAP ?? 1000);

const NO_FILL = new NextResponse(null, { status: 204 });

/** Keep context coarse: shallow, primitives only, bounded. Never user content. */
function sanitizeContext(input: unknown): Record<string, string | number | boolean> {
  if (!input || typeof input !== 'object') return {};
  const out: Record<string, string | number | boolean> = {};
  let n = 0;
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (n >= 12) break;
    if (typeof v === 'string') out[k] = v.slice(0, 120);
    else if (typeof v === 'number' || typeof v === 'boolean') out[k] = v;
    else continue;
    n++;
  }
  return out;
}

export async function POST(req: Request) {
  let body: { publisherId?: unknown; surface?: unknown; context?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const publisherId = typeof body.publisherId === 'string' ? body.publisherId.trim() : '';
  const surface = typeof body.surface === 'string' ? body.surface.trim() : '';
  if (!publisherId || !surface) {
    return NextResponse.json({ error: 'publisherId and surface are required' }, { status: 400 });
  }
  const context = sanitizeContext(body.context);

  let service: ReturnType<typeof getServiceClient>;
  try {
    service = getServiceClient();
  } catch (err) {
    console.error('[pulse/serve] service client unavailable:', err);
    return NO_FILL; // fail open — never break the publisher's wait state
  }

  // 1. Publisher must exist and be active.
  const { data: publisher } = await service
    .from('pulse_publishers')
    .select('id, active, brand_safety_blocklist')
    .eq('id', publisherId)
    .maybeSingle();
  if (!publisher || !publisher.active) return NO_FILL;

  // 2. Per-publisher hourly cap (fraud / spend guard).
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await service
    .from('pulse_impressions')
    .select('id', { count: 'exact', head: true })
    .eq('publisher_id', publisherId)
    .gte('served_at', hourAgo);
  if (typeof count === 'number' && count >= HOURLY_CAP) return NO_FILL;

  // 3. Load active campaigns and run the auction in-process.
  const { data: campaigns } = await service
    .from('pulse_campaigns')
    .select(
      'id, ad_text, cta_url, bid_cpm_nzd_cents, daily_budget_nzd_cents, spent_today, spent_today_date, publisher_allowlist, surface_targeting, category, status',
    )
    .eq('status', 'active');

  const nzToday = nzTodayString();
  const result = runAuction((campaigns ?? []) as PulseCampaign[], {
    publisherId,
    surface,
    blocklist: (publisher.brand_safety_blocklist as string[]) ?? [],
    nzToday,
  });

  // Salted hash only — never the raw IP — logged on fills AND no-fills so the
  // fraud signal and the fill rate both see every genuine serve attempt.
  const ipHash = hashIp(clientIp(req.headers));

  // 4a. No fill: log the attempt (campaign_id NULL) so the dashboard fill rate
  //     is honest, then fail open. The SDK shows the publisher's fallback line.
  if (!result) {
    await service.from('pulse_impressions').insert({
      campaign_id: null,
      publisher_id: publisherId,
      surface,
      context,
      ip_hash: ipHash,
      charged_nzd_cents: 0,
    });
    return NO_FILL;
  }

  const { winner, chargedCents } = result;

  // 4b. Filled: log the auditable served impression.
  const { data: impression, error: impErr } = await service
    .from('pulse_impressions')
    .insert({
      campaign_id: winner.id,
      publisher_id: publisherId,
      surface,
      context,
      ip_hash: ipHash,
      charged_nzd_cents: chargedCents,
    })
    .select('id')
    .single();

  if (impErr || !impression) {
    console.error('[pulse/serve] impression insert failed:', impErr?.message);
    return NO_FILL;
  }

  // 5. Charge the winner's daily budget (rollover-aware). Fail-soft: the ad is
  //    already served, so a spend-update hiccup must not drop the response.
  const priorSpent = spentToday(winner, nzToday);
  await service
    .from('pulse_campaigns')
    .update({
      spent_today: priorSpent + chargedCents,
      spent_today_date: nzToday,
      updated_at: new Date().toISOString(),
    })
    .eq('id', winner.id);

  return NextResponse.json({
    id: winner.id,
    text: winner.ad_text,
    ctaUrl: winner.cta_url,
    impressionId: impression.id,
  });
}
