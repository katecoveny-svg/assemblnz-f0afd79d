import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import { runBusinessPulse } from '@/lib/business-pulse/run';

export const dynamic = 'force-dynamic';

function localNzParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    weekday: 'short',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  return {
    weekday: parts.find((part) => part.type === 'weekday')?.value,
    hour: Number(parts.find((part) => part.type === 'hour')?.value ?? '0'),
  };
}

function authorised(req: Request): boolean {
  const auth = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  const cronHeader = req.headers.get('x-vercel-cron');
  const token = process.env.CRON_SECRET || process.env.BUSINESS_PULSE_RUN_TOKEN;
  return Boolean(cronHeader || (token && auth === token));
}

export async function GET(req: Request) {
  if (!authorised(req)) {
    return NextResponse.json({ error: 'Cron authorisation required' }, { status: 401 });
  }

  const url = new URL(req.url);
  const force = url.searchParams.get('force') === '1';
  const now = new Date();
  const local = localNzParts(now);
  if (!force && !(local.weekday === 'Mon' && local.hour === 7)) {
    return NextResponse.json({ skipped: true, reason: 'outside Monday 07:00 Pacific/Auckland gate', local });
  }

  const service = getServiceClient();
  const { data: tenants, error } = await service
    .from('tenants')
    .select('id,slug,name,metadata,status,is_active')
    .or('is_active.is.null,is_active.eq.true')
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const enabled = (tenants ?? []).filter((tenant) => {
    const row = tenant as { metadata?: Record<string, unknown> | null; status?: string | null };
    if (row.status && !['active', 'provisioned', 'trial'].includes(row.status)) return false;
    return row.metadata?.business_pulse_enabled === true;
  });

  const results = [];
  for (const tenant of enabled) {
    try {
      const brief = await runBusinessPulse({ supabase: service, tenantId: (tenant as { id: string }).id, asOf: now });
      results.push({ tenantId: brief.orgId, slug: brief.orgSlug, briefId: brief.id, ok: true });
    } catch (error) {
      results.push({
        tenantId: (tenant as { id: string }).id,
        slug: (tenant as { slug?: string }).slug,
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return NextResponse.json({ skipped: false, local, count: results.length, results });
}
