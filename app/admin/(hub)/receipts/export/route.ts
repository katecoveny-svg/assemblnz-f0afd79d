import { NextRequest, NextResponse } from 'next/server';
import { ensureAdmin } from '@/lib/admin/ensureAdmin';
import { receiptsToCsv, searchReceipts } from '@/lib/admin/v2-data';

/**
 * GET /admin/receipts/export — CSV export of the Mana Receipts audit log.
 *
 * Honours the same filters as the receipts page (?q= free text across
 * agent/domain/issuer, ?agent= exact agent) and streams up to 2000 rows.
 * Gated by ensureAdmin() — an unauthenticated hit redirects to /admin/login,
 * a non-operator is bounced, exactly like the pages.
 */

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  await ensureAdmin('/admin/receipts');

  const q = request.nextUrl.searchParams.get('q') ?? undefined;
  const agent = request.nextUrl.searchParams.get('agent') ?? undefined;

  const { rows, available } = await searchReceipts({ q, agent, limit: 2000 });
  if (!available) {
    return NextResponse.json(
      { error: 'mana_receipts is not available in this environment.' },
      { status: 404 },
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(receiptsToCsv(rows), {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="mana-receipts-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
