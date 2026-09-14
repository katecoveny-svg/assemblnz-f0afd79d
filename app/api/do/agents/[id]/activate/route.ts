import { NextResponse } from 'next/server';
import { activateAgent } from '@/apps/do/shared/store';
import type { ConnectorChoice } from '@/apps/do/shared/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  let connector: ConnectorChoice | undefined;
  try {
    const body = (await req.json()) as { connector?: ConnectorChoice };
    connector = body?.connector;
  } catch {
    /* empty body is fine */
  }
  const agent = await activateAgent(id, { connector });
  if (!agent) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ agent });
}
