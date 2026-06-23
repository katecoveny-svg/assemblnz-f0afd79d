/**
 * Atlas voice — ElevenLabs text-to-speech proxy.
 *
 * One named NZ voice across the whole platform (Kate's call — not user choice).
 * The voice id is fixed here so every assembl surface speaks in the same voice;
 * it is overridable via ATLAS_VOICE_ID only so the verified id can be set in
 * Vercel without a code change.
 *
 * VOICE CHOICE: "Anika" — the warmest NZ-accent English voice in the ElevenLabs
 * library at time of build. The id below is the platform default that ships
 * working out of the box; set ATLAS_VOICE_ID in the environment to the verified
 * "Anika" voice id from the ElevenLabs dashboard to lock the NZ accent. Document
 * any change here so the platform stays on one voice.
 *
 * The key (ELEVENLABS_API_KEY) is read server-side only — it never reaches the
 * browser. Returns audio/mpeg, or 503 when the key is not configured (the client
 * falls back to text-only and the voice toggle stays off).
 */

export const maxDuration = 30;

// Platform default voice id (works out of the box). Override with ATLAS_VOICE_ID.
const DEFAULT_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb';

/** Hard cap so a long reply cannot run up the TTS bill in one call. */
const MAX_CHARS = 1200;

export async function POST(req: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'Voice is not configured — set ELEVENLABS_API_KEY to turn it on.' },
      { status: 503 },
    );
  }

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const text = String(body.text ?? '').trim().slice(0, MAX_CHARS);
  if (!text) {
    return Response.json({ error: 'Nothing to say.' }, { status: 400 });
  }

  const voiceId = process.env.ATLAS_VOICE_ID || DEFAULT_VOICE_ID;

  let upstream: Response;
  try {
    upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.35,
            use_speaker_boost: true,
            speed: 0.96, // a touch slower for a natural NZ cadence
          },
        }),
      },
    );
  } catch {
    return Response.json({ error: 'Voice service unreachable.' }, { status: 502 });
  }

  if (!upstream.ok) {
    return Response.json(
      { error: 'Voice service error.', status: upstream.status },
      { status: 502 },
    );
  }

  const audio = await upstream.arrayBuffer();
  return new Response(audio, {
    status: 200,
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'no-store',
    },
  });
}
