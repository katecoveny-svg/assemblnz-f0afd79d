/**
 * Marketplace agent → voice configuration (Helm / Voice CS flagship deep-port).
 *
 * Bridges the locked-canon marketplace slugs to the legacy voice registry in
 * `lib/voice/elevenlabs-agents.ts` (ported from `src/data/elevenLabsAgents.ts`).
 * The old `HelmSection.tsx` did a voice→chat handoff (sessionStorage transcript +
 * redirect); this lands the data layer that surface reads from, plus a
 * receptionist behaviour block for the after-hours Voice CS agent.
 *
 * Wiring the live ElevenLabs / Gemini Live session UI is a follow-up; this makes
 * the agents voice-ready (a default TTS + Gemini voice id each) so that work is
 * data-driven, not a rebuild.
 */

import {
  defaultGeminiVoiceId,
  defaultTtsVoiceId,
  elevenLabsAgentId,
  voiceStyleForCategory,
  type KiwiVoiceStyle,
} from './elevenlabs-agents';
import { marketplaceAgentBySlug } from '@/lib/marketplace/agents';

export type AgentVoiceConfig = {
  slug: string;
  style: KiwiVoiceStyle;
  /** ElevenLabs TTS voice id (NZ persona) for one-shot speech. */
  ttsVoiceId: string;
  /** Gemini Live voice id for a live conversational session. */
  geminiVoiceId: string;
  /** Legacy ElevenLabs Conversational-AI agent id, if the slug maps to one. */
  elevenLabsAgentId?: string;
};

/**
 * Marketplace slug → legacy ElevenLabs Conversational-AI agent. Voice CS is the
 * after-hours receptionist (the old "operations" / TŌROA-Helm voice); Customs
 * Entry maps to the legacy customs voice. Others derive a voice from category.
 */
const SLUG_TO_LEGACY_VOICE: Record<string, string> = {
  'voice-cs': 'operations',
  'customs-entry': 'customs',
};

/** Resolve the voice config for a marketplace agent (null if the slug is unknown). */
export function voiceConfigForAgent(slug: string): AgentVoiceConfig | null {
  const agent = marketplaceAgentBySlug(slug);
  if (!agent) return null;
  const legacy = SLUG_TO_LEGACY_VOICE[slug];
  return {
    slug,
    style: voiceStyleForCategory(agent.category),
    ttsVoiceId: defaultTtsVoiceId(agent.category),
    geminiVoiceId: defaultGeminiVoiceId(agent.category),
    elevenLabsAgentId: legacy ? elevenLabsAgentId(legacy) : undefined,
  };
}

/** Slugs that run as a voice surface (after-hours / phone reception). */
export const VOICE_AGENT_SLUGS = ['voice-cs'] as const;

export function isVoiceAgent(slug: string): boolean {
  return (VOICE_AGENT_SLUGS as readonly string[]).includes(slug);
}

/**
 * Behaviour block for the after-hours voice receptionist (Voice CS). Appended to
 * its system prompt so the spoken channel collects the right things and routes by
 * urgency. Distilled from the legacy Helm SMS/voice behaviour.
 */
export const VOICE_RECEPTIONIST_KNOWLEDGE = `# After-hours voice receptionist

You answer the phones when the office is closed. Speak warmly and briefly — this
is a spoken channel, so keep each turn short and confirm what you heard.

## Every call, capture
- Caller name and a contact number (read it back to confirm).
- Reason for the call, in their words.
- Urgency: emergency / today / this week / whenever.
- The time of the call.

## How to handle it
- Open with a brief Privacy Act 2020 collection notice when you start taking
  details, and collect only what is needed.
- Take a message and route it — never make commitments, quotes or decisions for
  the business.
- Follow the configured transfer and escalation rules; do not improvise contacts.
- For an emergency, tell the caller to ring 111 now, then follow the escalation
  rule.

## Leave behind
A clear message per call — caller, contact, reason, urgency, time — with anything
urgent flagged at the top for the team in the morning.`;
