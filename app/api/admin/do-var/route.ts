/**
 * GET /api/admin/do-var — Verified Action Rate (operator debug).
 *
 * Gate: ensureAdmin (same as other admin APIs). Phase 1 reads the in-process
 * Action Cloud memory store — not a claim of live production VAR.
 */
import { NextResponse } from 'next/server';
import { ensureAdmin } from '@/lib/admin/ensureAdmin';
import { computeTenantVar } from '@/lib/do/action-cloud/var-service';
import type { VarWindow } from '@/lib/do/action-contract';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  await ensureAdmin();

  const url = new URL(request.url);
  const tenantId = url.searchParams.get('tenant_id');
  const windowRaw = url.searchParams.get('window_days');
  let windowDays: VarWindow | 'all' = 7;
  if (windowRaw === '30') windowDays = 30;
  if (windowRaw === 'all') windowDays = 'all';

  const result = await computeTenantVar({
    tenantId: tenantId || null,
    windowDays,
  });

  return NextResponse.json(
    {
      ok: true,
      metric: 'verified_action_rate',
      live_production: false,
      ...result,
      definition:
        'VAR = (verify passed AND receipt issued) / (actions that reached execute)',
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
