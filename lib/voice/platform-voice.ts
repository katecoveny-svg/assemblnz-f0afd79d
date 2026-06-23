/**
 * assembl platform voice — the one named NZ voice used across the platform
 * (Pilot, Atlas, and any future spoken surface).
 *
 * Coordination note: there is ONE platform voice id, held in ELEVENLABS_VOICE_ID
 * (the same env the Manaaki voice agent locks). Whichever surface wires voice
 * first picks it; everyone else reuses this helper rather than choosing their
 * own. Pilot wired it first (2026-06-24); Atlas reuses synthesizeSpeech().
 *
 * This is a thin text-to-speech wrapper over the ElevenLabs TTS REST endpoint
 * (distinct from the Conversational-AI Agents client in clients/elevenlabs.ts,
 * which is for the phone agent). It returns MP3 bytes for the browser to play.
 *
 * FAIL-OPEN: callers must treat speech as an enhancement. If the key or voice
 * id is missing, isVoiceConfigured() is false and the UI falls back to text.
 *
 * Server-only.
 */
import 'server-only';

const BASE = 'https://api.elevenlabs.io/v1';

/** A calm, multilingual model that handles NZ-English well. */
const MODEL_ID = 'eleven_turbo_v2_5';

// The one named platform voice. Atlas (PR #527) wired voice first and locked a
// working ElevenLabs default, overridable via ATLAS_VOICE_ID — we reuse exactly
// that so Pilot and Atlas speak in the same voice. ELEVENLABS_VOICE_ID (the
// Manaaki phone-agent voice) takes precedence if explicitly set.
const DEFAULT_VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb';

export function platformVoiceId(): string {
  return process.env.ELEVENLABS_VOICE_ID || process.env.ATLAS_VOICE_ID || DEFAULT_VOICE_ID;
}

export function isVoiceConfigured(): boolean {
  // A working default voice ships out of the box; only the API key is required.
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

/**
 * Synthesize speech for a short piece of text. Returns MP3 bytes, or null when
 * voice is not configured or the call fails (caller falls back to text).
 */
export async function synthesizeSpeech(
  text: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Uint8Array | null> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = platformVoiceId();
  if (!apiKey || !voiceId) return null;

  // Keep requests bounded — long replies are spoken in the UI a chunk at a time.
  const clean = text.replace(/\s+/g, ' ').trim().slice(0, 2500);
  if (!clean) return null;

  try {
    const res = await fetchImpl(`${BASE}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: clean,
        model_id: MODEL_ID,
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
      }),
    });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
  } catch {
    return null;
  }
}
