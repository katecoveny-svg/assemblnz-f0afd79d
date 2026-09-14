import { NextResponse } from 'next/server';
import { getSurface } from '@/apps/do/shared/surfaces';
import { compileAgent } from '@/apps/do/shared/compile';
import { saveAgent } from '@/apps/do/shared/store';
import { SHARE_FIXTURE } from '@/apps/do/shared/share-fixtures';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Web Share Target intake (application/x-www-form-urlencoded or multipart).
 * Also accepts JSON for DEMO paste flows.
 * Navigates back to /do with the compiled agent when possible.
 */
export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') || '';
  let title = '';
  let text = '';
  let url = '';
  let templateId: string | undefined;

  try {
    if (contentType.includes('application/json')) {
      const body = (await req.json()) as Record<string, string>;
      title = body.title || '';
      text = body.text || body.brief || '';
      url = body.url || '';
      templateId = body.templateId;
    } else if (
      contentType.includes('multipart/form-data') ||
      contentType.includes('application/x-www-form-urlencoded')
    ) {
      const form = await req.formData();
      title = String(form.get('title') || '');
      text = String(form.get('text') || form.get('brief') || '');
      url = String(form.get('url') || '');
      templateId = form.get('templateId') ? String(form.get('templateId')) : undefined;
    } else {
      // Empty / unknown — DEMO fixture
      title = SHARE_FIXTURE.title;
      text = SHARE_FIXTURE.text;
      url = SHARE_FIXTURE.url;
    }
  } catch {
    title = SHARE_FIXTURE.title;
    text = SHARE_FIXTURE.text;
    url = SHARE_FIXTURE.url;
  }

  const adapter = getSurface('share');
  if (!adapter) {
    return NextResponse.json({ error: 'share surface missing' }, { status: 500 });
  }

  const ingested = adapter.ingest({ title, text, url, templateId });
  if ('stub' in ingested) {
    return NextResponse.json({ stub: true, honesty: ingested.honesty }, { status: 501 });
  }

  try {
    const result = compileAgent({
      brief: ingested.intent.brief,
      templateId: ingested.intent.templateId,
      page: ingested.context.page,
      surface: 'share',
    });
    const saved = await saveAgent(result.spec);
    const accept = req.headers.get('accept') || '';
    if (accept.includes('text/html') || contentType.includes('multipart')) {
      const dest = new URL('/do', req.url);
      dest.searchParams.set('shared', '1');
      dest.searchParams.set('agent', saved.id);
      return NextResponse.redirect(dest, 303);
    }
    return NextResponse.json({ ...result, spec: saved, surface: 'share' });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'share ingest failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  const dest = new URL('/do/share', req.url);
  const src = new URL(req.url);
  src.searchParams.forEach((v, k) => dest.searchParams.set(k, v));
  return NextResponse.redirect(dest, 307);
}
