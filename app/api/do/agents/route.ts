import { NextResponse } from 'next/server';
import { listAgents, agentsByStatus } from '@/apps/do/shared/store';
import { filterAgentsForPack } from '@/apps/do/shared/public-agents';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pack = url.searchParams.get('pack') === 'mitre10' ? 'mitre10' : 'public';
  const grouped = url.searchParams.get('grouped') === '1';
  if (grouped) {
    const groups = await agentsByStatus();
    return NextResponse.json({
      groups: {
        needs_you: filterAgentsForPack(groups.needs_you, pack),
        working: filterAgentsForPack(groups.working, pack),
        done: filterAgentsForPack(groups.done, pack),
      },
    });
  }
  return NextResponse.json({ agents: filterAgentsForPack(await listAgents(), pack) });
}
