import { compileAgent } from '@/apps/do/shared/compile';
import type { CompileRequest, PageContext } from '@/apps/do/shared/types';
import { admitDoRequest, allowedDoOrigin, doHeaders, readDoJson } from '@/apps/do/shared/http';
import { chatClientIp, checkChatRateLimit } from '@/lib/agents/chat-rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function OPTIONS(request: Request) {
  return new Response(null, {
    status: allowedDoOrigin(request) ? 204 : 403,
    headers: doHeaders(request),
  });
}

export async function POST(request: Request) {
  const headers = doHeaders(request);
  const json = (body: unknown, status: number) => Response.json(body, { status, headers });

  if (process.env.DO_GEMINI_LIVE_ENABLED !== 'true') {
    return json({ error: 'live_disabled', message: 'DO Live is disabled.' }, 503);
  }
  if (!allowedDoOrigin(request)) {
    return json({ error: 'origin_not_allowed', message: 'Open DO from its website or installed extension.' }, 403);
  }

  let raw: unknown;
  try {
    raw = await readDoJson(request);
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === 'too_large';
    return json(
      {
        error: tooLarge ? 'too_large' : 'invalid_request',
        message: tooLarge ? 'Live DO context is too large.' : 'Send a valid JSON compile request.',
      },
      tooLarge ? 413 : 400,
    );
  }

  const input = normaliseCompileRequest(raw);
  if (!input) {
    return json({ error: 'invalid_input', message: 'A short DO brief is required.' }, 400);
  }

  const ip = chatClientIp(request.headers);
  if (!admitDoRequest(ip)) {
    headers.set('Retry-After', '60');
    return json({ error: 'rate_limited', message: 'Please wait a minute before preparing another DO.' }, 429);
  }
  const rate = await checkChatRateLimit(ip, 'do-live-compile');
  if (!rate.allowed) {
    headers.set('Retry-After', '600');
    return json({ error: 'rate_limited', message: 'You have reached the live preparation limit for now.' }, 429);
  }

  try {
    const result = compileAgent(input);
    return json(
      {
        ...result,
        approvalPolicy: 'prepare-only',
        active: false,
      },
      200,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'compile failed';
    return json({ error: 'compile_failed', message }, 400);
  }
}

function normaliseCompileRequest(raw: unknown): CompileRequest | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  const brief = typeof record.brief === 'string' ? record.brief.trim().slice(0, 2_000) : '';
  if (!brief) return null;

  const page = normalisePageContext(record.page);
  const connector = typeof record.connector === 'string' ? record.connector.slice(0, 80) : 'hook-later';

  return {
    brief,
    page,
    surface: 'web-widget',
    connector,
  };
}

function normalisePageContext(value: unknown): PageContext | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;
  const url = typeof record.url === 'string' ? record.url.slice(0, 2_000) : '';
  const title = typeof record.title === 'string' ? record.title.slice(0, 500) : '';
  const selectedText = typeof record.selectedText === 'string'
    ? record.selectedText.trim().slice(0, 2_000)
    : undefined;
  const pageText = typeof record.pageText === 'string'
    ? record.pageText.trim().slice(0, 4_000)
    : undefined;

  if (!url && !title && !selectedText && !pageText) return undefined;
  return { url, title, selectedText, pageText };
}
