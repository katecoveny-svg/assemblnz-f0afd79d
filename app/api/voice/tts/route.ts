/**
 * Platform text-to-speech — the one named assembl NZ voice.
 *
 * POST { text } → audio/mpeg (the spoken line), or 204 when voice is not
 * configured so the client cleanly falls back to text. Shared by Pilot and
 * Atlas via lib/voice/platform-voice.ts.
 */
import { synthesizeSpeech, isVoiceConfigured } from '@/lib/voice/platform-voice';

export const maxDuration = 30;

export async function GET(): Promise<Response> {
  // Lets the client probe whether the voice button should appear at all.
  return Response.json({ configured: isVoiceConfigured() });
}

export async function POST(req: Request): Promise<Response> {
  let text = '';
  try {
    const body = (await req.json()) as { text?: string };
    text = (body.text ?? '').toString();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!text.trim()) return Response.json({ error: 'No text to speak.' }, { status: 400 });

  const audio = await synthesizeSpeech(text);
  if (!audio) {
    // Voice not configured or upstream failed — tell the client to stay on text.
    return new Response(null, { status: 204 });
  }

  return new Response(audio as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  });
}
