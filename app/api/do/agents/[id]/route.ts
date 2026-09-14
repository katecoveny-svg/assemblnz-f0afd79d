import { NextResponse } from 'next/server';
import { deleteAgent, getAgent } from '@/apps/do/shared/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const agent = await getAgent(id);
  if (!agent) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ agent });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const ok = await deleteAgent(id);
  if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
