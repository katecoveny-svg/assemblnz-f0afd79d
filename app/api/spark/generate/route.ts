/**
 * POST /api/spark/generate — the live SPARK build endpoint.
 *
 * Body: { description: string, email?: string }
 *
 * 1. Real generation runs on the model ladder. On success the tool is stored as a
 *    DRAFT in spark_tools and the caller gets a shareable slug + the tool HTML.
 * 2. If no model is configured (or generation fails), we do NOT fake a tool. We file
 *    an honest request into hapai_workflow_requests and return { drafting: true } so
 *    the UI can show "SPARK is drafting… we'll email you."
 *
 * Draft-mode holds throughout: a generated tool is never auto-published, and this
 * route dispatches nothing externally.
 */
import { NextResponse } from 'next/server';
import { generateSparkTool } from '@/lib/spark/generate';
import { createSparkTool } from '@/lib/spark/store';
import { getServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';
export const maxDuration = 60;

type Body = { description?: unknown; email?: unknown };

const clean = (v: unknown, limit: number) => (typeof v === 'string' ? v.trim().slice(0, limit) : '');

async function fileDraftingRequest(description: string, email: string, req: Request) {
  try {
    const sb = getServiceClient();
    await sb.from('hapai_workflow_requests').insert({
      name: null,
      email: email || null,
      organisation: null,
      workflow: `SPARK tool request: ${description}`,
      context: null,
      source_path: '/spark',
      metadata: { channel: 'spark-builder', userAgent: req.headers.get('user-agent') },
    });
  } catch {
    // Fail soft — the UI still tells the user honestly that it's drafting.
  }
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Send a valid request.' }, { status: 400 });
  }

  const description = clean(body.description, 1200);
  const email = clean(body.email, 180);
  if (description.length < 12) {
    return NextResponse.json(
      { error: 'Tell SPARK a bit more about the tool you want — a sentence or two.' },
      { status: 400 },
    );
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please use a valid email address.' }, { status: 400 });
  }

  const gen = await generateSparkTool(description);

  if (gen.ok) {
    const saved = await createSparkTool({
      title: gen.title,
      summary: gen.summary,
      prompt: description,
      html: gen.html,
      requestedBy: email || null,
    });
    return NextResponse.json({
      ok: true,
      drafting: false,
      title: gen.title,
      summary: gen.summary,
      html: gen.html,
      slug: saved?.slug ?? null,
      // Honest posture, surfaced in the UI:
      notice: 'Draft preview — this tool is yours to check and run. It stays in review until you approve it.',
    });
  }

  // Honest fallback — never fake a tool.
  await fileDraftingRequest(description, email, req);
  return NextResponse.json({
    ok: true,
    drafting: true,
    message: email
      ? "SPARK is drafting your tool. We'll email you when it's ready to preview."
      : "SPARK is drafting your tool. Add your email and we'll send it when it's ready.",
  });
}
