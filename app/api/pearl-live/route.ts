/**
 * GET /api/pearl-live
 * Returns the current Pearl Live snapshot. Used by the homepage client
 * component for the 30-second refresh tick.
 *
 * No auth required — this is brand storytelling, no tenant data.
 */

import { NextResponse } from 'next/server';
import { getPearlLiveStats } from '@/lib/pearl-live';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const stats = await getPearlLiveStats();
  return NextResponse.json(stats, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
