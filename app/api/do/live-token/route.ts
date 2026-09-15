import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type LiveMode = 'standard' | 'extended';

const MODELS: Record<LiveMode, string> = {
  standard: 'gemini-3.8-live',
  extended: 'gemini-3.8-live-extended-thinking',
};

export async function POST(request: Request) {
  if (process.env.DO_GEMINI_LIVE_ENABLED !== 'true') {
    return NextResponse.json({ error: 'DO Gemini Live is disabled.' }, { status: 503 });
  }

  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Gemini Live is not configured.' }, { status: 503 });
  }

  let body: { mode?: LiveMode; voiceName?: string } = {};
  try {
    body = await request.json();
  } catch {
    // Defaults are safe.
  }

  const mode: LiveMode = body.mode === 'standard' ? 'standard' : 'extended';
  const model = MODELS[mode];
  const voiceName = typeof body.voiceName === 'string' && body.voiceName.trim()
    ? body.voiceName.trim().slice(0, 40)
    : 'Kore';

  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateEphemeralToken?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
        },
      }),
      signal: AbortSignal.timeout(10_000),
    },
  );

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => '');
    console.error('[DO Gemini Live] token issue failed', upstream.status, detail.slice(0, 300));
    return NextResponse.json({ error: 'Could not start Gemini Live.' }, { status: 502 });
  }

  const tokenData = (await upstream.json()) as { token?: string; uri?: string; name?: string };
  const token = tokenData.token ?? tokenData.name;
  const uri = tokenData.uri ?? (token
    ? `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(token)}`
    : undefined);

  if (!uri) {
    return NextResponse.json({ error: 'Gemini Live token response was incomplete.' }, { status: 502 });
  }

  return NextResponse.json({
    uri,
    model,
    mode,
    voiceName,
    approvalPolicy: 'prepare-only',
  });
}
