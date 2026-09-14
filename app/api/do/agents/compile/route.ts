import { NextResponse } from 'next/server';
import { compileAgent } from '@/apps/do/shared/compile';
import { saveAgent } from '@/apps/do/shared/store';
import type { CompileRequest } from '@/apps/do/shared/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: CompileRequest;
  try {
    body = (await req.json()) as CompileRequest;
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  if (!body?.brief?.trim() && !body?.templateId) {
    return NextResponse.json({ error: 'brief or templateId required' }, { status: 400 });
  }

  try {
    const result = compileAgent(body);
    const saved = await saveAgent(result.spec);
    return NextResponse.json({ ...result, spec: saved });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'compile failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
