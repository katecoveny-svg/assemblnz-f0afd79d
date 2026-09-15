import { admitDoRequest, allowedDoOrigin, doHeaders, readDoJson } from '@/apps/do/shared/http';
import { chatClientIp, checkChatRateLimit } from '@/lib/agents/chat-rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type LiveMode = 'standard' | 'extended';

const MODELS: Record<LiveMode, string> = {
  standard: 'gemini-3.8-live',
  extended: 'gemini-3.8-live-extended-thinking',
};

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
    return json({ error: 'DO Gemini Live is disabled.' }, 503);
  }
  if (!allowedDoOrigin(request)) {
    return json({ error: 'origin_not_allowed', message: 'Open DO from its website or installed extension.' }, 403);
  }

  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return json({ error: 'Gemini Live is not configured.' }, 503);
  }

  let raw: unknown = {};
  try {
    raw = await readDoJson(request);
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === 'too_large';
    return json({ error: tooLarge ? 'too_large' : 'invalid_request' }, tooLarge ? 413 : 400);
  }
  const body = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
  const mode: LiveMode = body.mode === 'standard' ? 'standard' : 'extended';
  const model = MODELS[mode];
  const voiceName = typeof body.voiceName === 'string' && body.voiceName.trim()
    ? body.voiceName.trim().slice(0, 40)
    : 'Kore';

  const ip = chatClientIp(request.headers);
  if (!admitDoRequest(ip)) {
    headers.set('Retry-After', '60');
    return json({ error: 'rate_limited', message: 'Please wait before starting another Live session.' }, 429);
  }
  const rate = await checkChatRateLimit(ip, 'do-gemini-live-token');
  if (!rate.allowed) {
    headers.set('Retry-After', '600');
    return json({ error: 'rate_limited', message: 'You have reached the Live session limit for now.' }, 429);
  }

  // Google recommends one-use ephemeral tokens for browser/mobile Live clients.
  // Keep both the token and the window for opening a new session short-lived.
  const expireTime = new Date(Date.now() + 20 * 60_000).toISOString();
  const newSessionExpireTime = new Date(Date.now() + 60_000).toISOString();

  const upstream = await fetch('https://generativelanguage.googleapis.com/v1beta/auth_tokens', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      uses: 1,
      expireTime,
      newSessionExpireTime,
      liveConnectConstraints: {
        model: `models/${model}`,
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
        },
      },
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '');
    console.error('[DO Gemini Live] token issue failed', upstream.status, detail.slice(0, 300));
    return json({ error: 'Could not start Gemini Live.' }, 502);
  }

  const tokenData = (await upstream.json()) as { name?: string };
  const token = tokenData.name;
  if (!token) {
    return json({ error: 'Gemini Live token response was incomplete.' }, 502);
  }

  return json({
    uri: `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(token)}`,
    model,
    mode,
    voiceName,
    approvalPolicy: 'prepare-only',
    expiresAt: expireTime,
  }, 200);
}
