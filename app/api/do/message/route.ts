import { NextResponse } from 'next/server';
import { getSurface } from '@/apps/do/shared/surfaces';
import { compileAgent } from '@/apps/do/shared/compile';
import { saveAgent } from '@/apps/do/shared/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Common-message ingress for launch surfaces.
 * Chrome / web / share / keyboard / WhatsApp DEMO compile here; pure stubs return honesty.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });
  }

  const surfaceName = String(body.surface || 'web');
  const adapter = getSurface(surfaceName);
  if (!adapter) {
    return NextResponse.json({ error: `unknown surface: ${surfaceName}` }, { status: 400 });
  }

  const ingested = adapter.ingest(body);

  if ('stub' in ingested) {
    return NextResponse.json({ stub: true, honesty: ingested.honesty, surface: surfaceName }, { status: 501 });
  }

  try {
    const result = compileAgent({
      brief: ingested.intent.brief,
      templateId: ingested.intent.templateId,
      page: ingested.context.page,
      surface: ingested.surface,
    });
    const saved = await saveAgent(result.spec);
    return NextResponse.json({
      ...result,
      spec: saved,
      surface: ingested.surface,
      honesty: result.honesty,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'compile failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
