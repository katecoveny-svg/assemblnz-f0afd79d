/**
 * Thin ElevenLabs Agents (Conversational AI) client.
 *
 * Used by the deploy script to push the declarative agent config and upload
 * knowledge-base docs, and by the post-call webhook to decode the audio
 * payload. Network calls go through fetch + the xi-api-key header so the
 * client is mockable. We deliberately keep the surface tiny — the full agent
 * config lives in agent.config.yaml and is POSTed as-is.
 *
 * Phase-1 note: te reo Māori is NOT in the ElevenLabs Agents language set
 * (verified 2026-06-17), so `language` is fixed to NZ-English. Embedded kupu
 * (kia ora, ka pai) ride inside the English voice; a true reo voice is a
 * phase-2 item routed to a kaitiakitanga-licensed provider, not ElevenLabs.
 */

type FetchImpl = typeof fetch;

const BASE = 'https://api.elevenlabs.io/v1';

export function elevenLabsKeyFromEnv(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error('ELEVENLABS_API_KEY must be set');
  return key;
}

interface AgentConfigBody {
  name: string;
  conversation_config: Record<string, unknown>;
  [key: string]: unknown;
}

/** Create (or, with agentId, update) an agent from a declarative config. */
export async function upsertAgent(
  apiKey: string,
  body: AgentConfigBody,
  agentId?: string,
  fetchImpl: FetchImpl = fetch,
): Promise<{ agent_id: string }> {
  const url = agentId ? `${BASE}/convai/agents/${agentId}` : `${BASE}/convai/agents/create`;
  const res = await fetchImpl(url, {
    method: agentId ? 'PATCH' : 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`ElevenLabs upsertAgent failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { agent_id?: string };
  return { agent_id: json.agent_id ?? agentId ?? '' };
}

/** Upload a knowledge-base document (markdown) for RAG. */
export async function uploadKnowledge(
  apiKey: string,
  name: string,
  text: string,
  fetchImpl: FetchImpl = fetch,
): Promise<{ id: string }> {
  const res = await fetchImpl(`${BASE}/convai/knowledge-base/text`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, text }),
  });
  if (!res.ok) throw new Error(`ElevenLabs uploadKnowledge failed: ${res.status}`);
  return { id: ((await res.json()) as { id: string }).id };
}

/**
 * Decode a post_call_audio webhook payload. ElevenLabs delivers the recording
 * as base64-encoded MP3 in `full_audio` (NOT a hosted URL), so callers decode
 * and store it themselves (Supabase Storage) under the right retention class.
 */
export function decodeCallAudio(fullAudioB64: string): Buffer {
  return Buffer.from(fullAudioB64, 'base64');
}
