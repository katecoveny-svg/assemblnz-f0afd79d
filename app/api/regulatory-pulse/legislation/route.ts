import { NextResponse } from 'next/server';
import { getParliamentBillWatch } from '@/lib/parliament-bills';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const watch = await getParliamentBillWatch();

  return NextResponse.json(watch, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
