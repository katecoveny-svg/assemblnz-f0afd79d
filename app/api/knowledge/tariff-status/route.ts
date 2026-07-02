import { NextResponse } from 'next/server';
import { getTariffSourceStatus } from '@/lib/customs/tariff-live';

/**
 * Freshness of the nz-customs-tariff Tier A source, for the ops-dashboard
 * "customs codes · last updated" pill. Read-only; exposes sync metadata only
 * (never chunk content, never keys).
 */
export const revalidate = 300;

export async function GET() {
  const status = await getTariffSourceStatus();
  if (!status) {
    return NextResponse.json(
      { configured: false, lastSyncedAt: null, hoursSinceSync: null, stale: true },
      { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } },
    );
  }
  return NextResponse.json(
    {
      configured: true,
      lastSyncedAt: status.lastSyncedAt,
      hoursSinceSync: status.hoursSinceSync,
      stale: status.stale,
      tier: 'A',
    },
    { headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' } },
  );
}
