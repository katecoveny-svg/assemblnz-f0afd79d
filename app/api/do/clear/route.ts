import { NextResponse } from 'next/server';
import { runtimeClearRewrite } from '@/apps/do/shared/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { text?: string };
  try {
    body = (await req.json()) as { text?: string };
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  const text = (body.text || '').trim();
  if (!text) {
    return NextResponse.json({ error: 'text required' }, { status: 400 });
  }

  try {
    const result = await runtimeClearRewrite(text);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'clear failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
