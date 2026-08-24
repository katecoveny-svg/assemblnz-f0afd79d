import { NextRequest, NextResponse } from 'next/server';
import { getRegulatoryHorizon } from '@/lib/regulatory-horizon';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q') ?? undefined;
  const horizon = await getRegulatoryHorizon(query);

  return NextResponse.json(horizon, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
