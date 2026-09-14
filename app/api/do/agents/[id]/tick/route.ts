import { NextResponse } from 'next/server';
import { tickWatch } from '@/apps/do/shared/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

/** Tick a Watch agent — optional { simulateChange: true } for DEMO fixture flip. */
export async function POST(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  let simulateChange = false;
  try {
    const body = (await req.json()) as { simulateChange?: boolean };
    simulateChange = Boolean(body?.simulateChange);
  } catch {
    /* empty body ok */
  }
  const agent = await tickWatch(id, { simulateChange });
  if (!agent) return NextResponse.json({ error: 'not found or not a watch agent' }, { status: 404 });
  return NextResponse.json({ agent });
}
