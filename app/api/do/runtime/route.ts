import { NextResponse } from 'next/server';
import { getDoRuntimeStatus } from '@/apps/do/shared/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ runtime: getDoRuntimeStatus() });
}
