/**
 * Kete + agent registry for the /app/chat surface.
 *
 * Chat now derives from the canonical fleet registry in `lib/agents.ts`.
 * Only live agents can be selected. Draft agents stay visible in the broader
 * fleet registry, but are not exposed in chat until their system prompts are
 * written and reviewed.
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
  /** Highest-level practice area claimed by this agent */
  expertise: string;
  /** Who this agent should pull in when the work crosses disciplines */
  collaboratesWith: string[];
  /** Durable context this agent is allowed and expected to remember */
  memoryScope: string;
  /** Standing ambient-thinking brief for morning/daily runs */
  ambientBrief: string;
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
  agents: agentsForKete(kete.slug)
    .filter((agent) => agent.status === 'live')
    .map((agent) => ({
      agentId: agentChatId(agent),
      slug: agent.slug,
      name: agent.name,
      role: agent.role,
      blurb: agent.oneLiner,
      expertise: agent.expertise ?? `${agent.role} specialist with NZ-context evidence discipline.`,
      collaboratesWith: agent.collaboratesWith ?? ['iho', 'signal'],
      memoryScope: agent.memoryScope ?? 'Tenant profile, prior decisions, workflow state, reviewer preferences, and evidence history.',
      ambientBrief: agent.ambientBrief ?? 'Watch for the next useful draft, risk, or handoff for the operator inbox.',
    })),
}));

export type ChatAgentRef = {
  kete: ChatKete;
  agent: ChatAgent;
};

export function findAgent(keteSlug: string, agentId: string): ChatAgentRef | null {
  const kete = CHAT_KETES.find((k) => k.slug === keteSlug);
  if (!kete) return null;
  const normalised = agentId.toLowerCase();
  const agent = kete.agents.find(
    (a) => a.agentId.toLowerCase() === normalised || a.slug.toLowerCase() === normalised,
  );
  if (!agent) return null;
  return { kete, agent };
}

export function findAgentBySlug(slug: string, keteSlug?: string): ChatAgentRef | null {
  const normalised = slug.toLowerCase();
  const canonical = agentBySlug(normalised);
  if (!canonical) return null;

  const preferredKetes = keteSlug
    ? [keteSlug, ...CHAT_KETES.map((kete) => kete.slug)]
    : [canonical.kete, ...CHAT_KETES.map((kete) => kete.slug)];

  for (const candidate of preferredKetes) {
    const found = findAgent(candidate, normalised);
    if (found) return found;
  }

  return null;
}

export const DEFAULT_AGENT_REF: ChatAgentRef = {
  kete: CHAT_KETES[0],
  agent: CHAT_KETES[0].agents[0],
};
