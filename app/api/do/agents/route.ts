import { NextResponse } from 'next/server';
import { listAgents, agentsByStatus } from '@/apps/do/shared/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const grouped = url.searchParams.get('grouped') === '1';
  if (grouped) {
    return NextResponse.json({ groups: await agentsByStatus() });
  }
  return NextResponse.json({ agents: await listAgents() });
}
