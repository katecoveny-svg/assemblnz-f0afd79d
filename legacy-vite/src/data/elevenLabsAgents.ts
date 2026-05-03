/**
 * Mapping of Assembl agent IDs to their ElevenLabs Conversational AI agent IDs.
 * Add new entries as ElevenLabs agents are created for each Assembl agent.
 *
 * Agents without a dedicated ElevenLabs agent will fall back to
 * VoiceAgentModal's fallback mode (Web Speech API → agent-router → ElevenLabs TTS).
 */
export const ELEVENLABS_AGENT_IDS: Record<string, string> = {
  // ── Shared / Core ──
  echo: "agent_9201kmej873zerqt2bme09chmnt5",

  // ── Manaaki (Hospitality) ──
  hospitality: "agent_8901kme9bffcezybjwnbscc36bw6", // AURA

  // ── Auaha (Creative) ──
  marketing: "agent_3401kmefawt3fex8qdtgq19jg2wg", // PRISM
  sales: "agent_9901kmedvk7wfmyrkk1wr3ddqmts",     // FLUX

  // ── Hangarau (Technology) ──
  automotive: "agent_9801kmedekfdfq29kcz3hgzk3ewx",  // FORGE
  customs: "agent_1801kmek0yy6f9a8y8dvht8cq5kb",     // NEXUS

  // ── Toro (Family) ──
  operations: "agent_4301kmegw0b3fy49dt2cpf0qx6tw",  // TORO

  // ── Hauora (Health/Sport) ──
  sports: "agent_7601kmkv45zqe1rtffqnmt2jdfgh",      // TURF
};

/**
 * Look up the ElevenLabs agent ID for a given Assembl agent slug.
 * Returns undefined if no dedicated voice agent is configured — callers
 * should fall back to the TTS pipeline (Web Speech → agent-router → ElevenLabs TTS).
 */
export function getElevenLabsAgentId(agentId: string): string | undefined {
  return ELEVENLABS_AGENT_IDS[agentId];
}

/**
 * NZ Kiwi voice style defaults for every known agent.
 * Used by VoiceAgentModal and VoiceAgentLive for TTS fallback voice selection.
 */
export type KiwiVoiceStyle = "professional-nz" | "warm-kiwi" | "casual-kiwi";

export const AGENT_VOICE_STYLES: Record<string, KiwiVoiceStyle> = {
  // ── Shared Core ──
  charter: "professional-nz",
  arbiter: "professional-nz",
  shield: "professional-nz",
  anchor: "professional-nz",
  aroha: "warm-kiwi",
  pulse: "casual-kiwi",
  scholar: "warm-kiwi",
  nova: "warm-kiwi",
  echo: "casual-kiwi",

  // ── Manaaki (Hospitality) ──
  hospitality: "warm-kiwi",       // AURA
  saffron: "warm-kiwi",
  cellar: "warm-kiwi",
  luxe: "professional-nz",
  moana: "casual-kiwi",
  coast: "casual-kiwi",
  kura: "warm-kiwi",
  pau: "casual-kiwi",
  summit: "professional-nz",

  // ── Hanga (Construction) ──
  construction: "professional-nz", // ATA
  arai: "professional-nz",        // ĀRAI
  kaupapa: "professional-nz",
  rawa: "professional-nz",
  whakaaee: "professional-nz",
  pai: "warm-kiwi",
  arc: "professional-nz",
  terra: "casual-kiwi",
  pinnacle: "professional-nz",

  // ── Auaha (Creative) ──
  marketing: "warm-kiwi",         // PRISM
  muse: "warm-kiwi",
  pixel: "casual-kiwi",
  verse: "warm-kiwi",
  sales: "casual-kiwi",           // FLUX
  chromatic: "warm-kiwi",
  rhythm: "casual-kiwi",
  market: "professional-nz",

  // ── Pakihi (Business) ──
  accounting: "professional-nz",   // LEDGER
  finance: "professional-nz",      // VAULT
  catalyst: "casual-kiwi",
  immigration: "professional-nz",  // COMPASS
  property: "professional-nz",     // HAVEN
  counter: "professional-nz",
  gateway: "professional-nz",
  harvest: "warm-kiwi",
  grove: "warm-kiwi",
  sage: "professional-nz",
  ascend: "professional-nz",

  // ── Waka (Transport) ──
  motor: "casual-kiwi",
  transit: "casual-kiwi",
  maritime: "casual-kiwi",        // MARINER

  // ── Hangarau (Technology) ──
  automotive: "professional-nz",   // FORGE
  sentinel: "professional-nz",
  customs: "professional-nz",      // NEXUS
  cipher: "professional-nz",
  relay: "casual-kiwi",
  matrix: "professional-nz",
  spark: "casual-kiwi",
  oracle: "professional-nz",
  ember: "warm-kiwi",
  reef: "casual-kiwi",
  patent: "professional-nz",
  foundry: "professional-nz",

  // ── Te Kāhui Reo (Māori) ──
  whanau: "warm-kiwi",
  rohe: "warm-kiwi",
  "kaupapa-m": "warm-kiwi",
  mana: "professional-nz",
  kaitiaki: "warm-kiwi",
  taura: "warm-kiwi",
  whakaaro: "warm-kiwi",
  hiringa: "warm-kiwi",

  // ── Toro (Family) ──
  operations: "casual-kiwi",       // TORO
  family: "casual-kiwi",

  // ── Hauora (Health/Sport) ──
  sports: "casual-kiwi",           // TURF
  league: "casual-kiwi",
  vitals: "professional-nz",
  remedy: "warm-kiwi",
  vitae: "warm-kiwi",
  radiance: "warm-kiwi",
  palette: "warm-kiwi",
  odyssey: "casual-kiwi",

  // ── HR / Legal ──
  hr: "warm-kiwi",
  insurance: "professional-nz",
  education: "warm-kiwi",
  nonprofit: "warm-kiwi",
  retail: "warm-kiwi",
  treaty: "warm-kiwi",
};

/**
 * Get the NZ voice style for an agent, defaulting to professional-nz.
 */
export function getKiwiVoiceStyle(agentId: string): KiwiVoiceStyle {
  return AGENT_VOICE_STYLES[agentId] || "professional-nz";
}

/**
 * ElevenLabs TTS voice IDs mapped to NZ personas.
 * Used by VoiceAgentLive and VoiceAgentModal fallback TTS.
 */
export const KIWI_TTS_VOICES = [
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "Rangi", style: "professional-nz" as const, desc: "Professional NZ advisor" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Aroha", style: "warm-kiwi" as const, desc: "Warm Kiwi colleague" },
  { id: "N2lVS1w4EtoT3dr4eOWO", name: "Tama", style: "casual-kiwi" as const, desc: "Your Kiwi mate" },
] as const;

/**
 * Gemini Live voice IDs mapped to NZ personas.
 * Used by GeminiLiveVoice component.
 */
export const GEMINI_KIWI_VOICES = [
  { id: "Kore", label: "Aroha", style: "warm-kiwi" as const, desc: "Warm & empathetic — like a trusted NZ colleague" },
  { id: "Puck", label: "Tama", style: "casual-kiwi" as const, desc: "Energetic & upbeat — classic Kiwi enthusiasm" },
  { id: "Charon", label: "Rangi", style: "professional-nz" as const, desc: "Deep & authoritative — NZ boardroom voice" },
  { id: "Leda", label: "Mere", style: "professional-nz" as const, desc: "Professional & measured — NZ business advisor" },
  { id: "Aoede", label: "Hine", style: "warm-kiwi" as const, desc: "Bright & clear — friendly NZ customer voice" },
  { id: "Zephyr", label: "Kai", style: "casual-kiwi" as const, desc: "Casual & relaxed — your Kiwi mate" },
] as const;

/**
 * Get the best default Gemini Live voice for a given agent.
 */
export function getDefaultGeminiVoice(agentId: string): string {
  const style = getKiwiVoiceStyle(agentId);
  const match = GEMINI_KIWI_VOICES.find(v => v.style === style);
  return match?.id || "Kore";
}

/**
 * Get the best default ElevenLabs TTS voice ID for a given agent.
 */
export function getDefaultTtsVoiceId(agentId: string): string {
  const style = getKiwiVoiceStyle(agentId);
  const match = KIWI_TTS_VOICES.find(v => v.style === style);
  return match?.id || "JBFqnCBsd6RMkjVDRZzb";
}
