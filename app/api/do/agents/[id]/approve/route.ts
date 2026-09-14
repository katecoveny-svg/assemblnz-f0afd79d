import { NextResponse } from 'next/server';
import { approvePending } from '@/apps/do/shared/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  let body: { approvalId?: string; decision?: 'approve' | 'reject' };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }
  if (!body.approvalId || !body.decision) {
    return NextResponse.json({ error: 'approvalId and decision required' }, { status: 400 });
  }
  const agent = await approvePending(id, body.approvalId, body.decision);
  if (!agent) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json({ agent });
}
