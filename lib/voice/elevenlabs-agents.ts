/**
 * Voice registry — Helm flagship deep-port.
 *
 * Ported from `assemblnz-latest/src/data/elevenLabsAgents.ts`: the
 * ElevenLabs Conversational-AI agent ids, the NZ TTS voice ids, the Gemini Live
 * voice personas, and the per-agent voice-style map. This is the data layer the
 * voice surface (voice→chat handoff in the old `HelmSection.tsx`) reads from.
 *
 * The new marketplace uses different slugs than the legacy fleet, so a thin
 * {@link voiceStyleForCategory} bridge maps the marketplace categories onto the
 * three NZ voice styles. Wiring the live ElevenLabs/Gemini session UI is a
 * follow-up; this lands the registry so that work is data-ready.
 */

export type KiwiVoiceStyle = 'professional-nz' | 'warm-kiwi' | 'casual-kiwi';

/**
 * Legacy ElevenLabs Conversational-AI agent ids (slug → agent_…). Kept verbatim
 * for reference and reuse — the marketplace `helm` agent maps to the old
 * "operations" voice (TŌROA persona).
 */
export const ELEVENLABS_AGENT_IDS: Record<string, string> = {
  echo: 'agent_9201kmej873zerqt2bme09chmnt5',
  hospitality: 'agent_8901kme9bffcezybjwnbscc36bw6', // AURA
  marketing: 'agent_3401kmefawt3fex8qdtgq19jg2wg', // PRISM
  sales: 'agent_9901kmedvk7wfmyrkk1wr3ddqmts', // FLUX
  automotive: 'agent_9801kmedekfdfq29kcz3hgzk3ewx', // FORGE
  customs: 'agent_1801kmek0yy6f9a8y8dvht8cq5kb', // NEXUS
  operations: 'agent_4301kmegw0b3fy49dt2cpf0qx6tw', // TŌROA / Helm
  sports: 'agent_7601kmkv45zqe1rtffqnmt2jdfgh', // TURF
};

/** ElevenLabs TTS voice ids mapped to NZ personas. */
export const KIWI_TTS_VOICES = [
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'Rangi', style: 'professional-nz' as const, desc: 'Professional NZ advisor' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Aroha', style: 'warm-kiwi' as const, desc: 'Warm Kiwi colleague' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Tama', style: 'casual-kiwi' as const, desc: 'Your Kiwi mate' },
] as const;

/** Gemini Live voice ids mapped to NZ personas. */
export const GEMINI_KIWI_VOICES = [
  { id: 'Kore', label: 'Aroha', style: 'warm-kiwi' as const, desc: 'Warm & empathetic — like a trusted NZ colleague' },
  { id: 'Puck', label: 'Tama', style: 'casual-kiwi' as const, desc: 'Energetic & upbeat — classic Kiwi enthusiasm' },
  { id: 'Charon', label: 'Rangi', style: 'professional-nz' as const, desc: 'Deep & authoritative — NZ boardroom voice' },
  { id: 'Leda', label: 'Mere', style: 'professional-nz' as const, desc: 'Professional & measured — NZ business advisor' },
  { id: 'Aoede', label: 'Hine', style: 'warm-kiwi' as const, desc: 'Bright & clear — friendly NZ customer voice' },
  { id: 'Zephyr', label: 'Kai', style: 'casual-kiwi' as const, desc: 'Casual & relaxed — your Kiwi mate' },
] as const;

/** Marketplace category → NZ voice style. The new bridge over the legacy map. */
const CATEGORY_VOICE_STYLE: Record<string, KiwiVoiceStyle> = {
  family: 'warm-kiwi',
  business: 'professional-nz',
  trades: 'professional-nz',
  creative: 'warm-kiwi',
  healthcare: 'warm-kiwi',
  maritime: 'professional-nz',
  education: 'warm-kiwi',
  compliance: 'professional-nz',
  legal: 'professional-nz',
  financial: 'professional-nz',
};

export function voiceStyleForCategory(category: string): KiwiVoiceStyle {
  return CATEGORY_VOICE_STYLE[category] ?? 'professional-nz';
}

/** Best default ElevenLabs TTS voice id for a marketplace category. */
export function defaultTtsVoiceId(category: string): string {
  const style = voiceStyleForCategory(category);
  return KIWI_TTS_VOICES.find((v) => v.style === style)?.id ?? KIWI_TTS_VOICES[0].id;
}

/** Best default Gemini Live voice id for a marketplace category. */
export function defaultGeminiVoiceId(category: string): string {
  const style = voiceStyleForCategory(category);
  return GEMINI_KIWI_VOICES.find((v) => v.style === style)?.id ?? 'Kore';
}

/** Legacy ElevenLabs agent id for a legacy slug, if one is wired. */
export function elevenLabsAgentId(legacySlug: string): string | undefined {
  return ELEVENLABS_AGENT_IDS[legacySlug];
}
