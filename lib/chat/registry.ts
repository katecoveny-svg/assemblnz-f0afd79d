/**
 * Kete + agent registry for the /app/chat surface.
 *
 * Chat now derives from the canonical fleet registry in `lib/agents.ts`.
 * Draft agents can be selected, but their cards elsewhere mark them as
 * coming soon until Stage 2 prompt content lands.
 */

import { agentBySlug, agentChatId, agentsForKete } from '@/lib/agents';
import { KETES } from '@/lib/kete';

export type ChatAgent = {
  /** stable ID used as `agentId` in the iho-router request */
  agentId: string;
  /** canonical slug, useful for path redirects */
  slug: string;
  /** display name */
  name: string;
  /** one-line role for the picker subtitle */
  role: string;
  /** ISO short blurb for the chat header */
  blurb?: string;
};

export type ChatKete = {
  /** matches `packId` in iho-router */
  slug: string;
  name: string;
  industry: string;
  accent: string;
  agents: ChatAgent[];
};

export const CHAT_KETES: ChatKete[] = KETES.map((kete) => ({
  slug: kete.slug,
  name: kete.name,
  industry: kete.industry,
  accent: kete.accent,
  agents: agentsForKete(kete.slug).map((agent) => ({
    agentId: agentChatId(agent),
    slug: agent.slug,
    name: agent.name,
    role: agent.role,
    blurb: agent.oneLiner,
  })),
}));

export type ChatAgentRef = {
  kete: ChatKete;
  agent: ChatAgent;
};

export function findAgent(keteSlug: string, agentId: string): ChatAgentRef | null {
  const kete = CHAT_KETES.find((k) => k.slug === keteSlug);
  if (!kete) return null;
  const agent = kete.agents.find((a) => a.agentId === agentId || a.slug === agentId);
  if (!agent) return null;
  return { kete, agent };
}

export function findAgentBySlug(slug: string, keteSlug?: string): ChatAgentRef | null {
  const canonical = agentBySlug(slug);
  if (!canonical) return null;

  const preferredKetes = keteSlug
    ? [keteSlug, ...CHAT_KETES.map((kete) => kete.slug)]
    : [canonical.kete, ...CHAT_KETES.map((kete) => kete.slug)];

  for (const candidate of preferredKetes) {
    const found = findAgent(candidate, canonical.slug);
    if (found) return found;
  }

  return null;
}

export const DEFAULT_AGENT_REF: ChatAgentRef = {
  kete: CHAT_KETES[0],
  agent: CHAT_KETES[0].agents[0],
};
