import { NextResponse } from 'next/server';
import { getRegulatoryPulse } from '@/lib/regulatory-pulse';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const stats = await getRegulatoryPulse();
  return NextResponse.json(stats, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
