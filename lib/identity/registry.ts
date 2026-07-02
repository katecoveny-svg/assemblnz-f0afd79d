/**
 * Bundle identity registry — the CODE mirror of public.bundle_identity.
 *
 * Kate's six marketing identities (Communication / Trust / Workflow / Insights
 * / Operations / Knowledge — English capability-first names, per
 * project_v2_platform_2026-07-01) each front the nearest live V4 bundle:
 *
 *   Communication → ensemble   (creative)      lead: creative-director*
 *   Trust         → counsel    (legal)         lead: solicitor*
 *   Workflow      → assembler  (construction)  lead: foreman*
 *   Insights      → practice   (health)        lead: duty-doctor*
 *   Operations    → forge      (automotive)    lead: arataki
 *   Knowledge     → kaitiaki   (animal)        lead: keeper
 *
 *   * = provisional lead slug not yet registered as a MarketplaceAgent
 *       (bundles.ts marks these as thin routing agents to be built in a
 *       follow-up phase). Until they exist, inbound messages route to the
 *       `routingAgentSlug` below — the nearest REGISTERED agent in that
 *       bundle's family — so the webhook always has a real system prompt.
 *
 * The DB row (public.bundle_identity) is the runtime source of truth for
 * phone / email / live — Kate edits those in /admin. This mirror carries the
 * routing knowledge (which agent answers) which lives in CODE, like all agent
 * prompts (reference_agent_prompts_live_in_code).
 */

import { bundleBySlug } from '@/lib/marketplace/bundles';
import { marketplaceAgentBySlug, type MarketplaceAgent } from '@/lib/marketplace/agents';

export type BundleIdentityMeta = {
  /** marketing identity slug — pk of public.bundle_identity */
  bundleSlug: string;
  /** marketing display name */
  displayName: string;
  /** seeded email address (DB row may be edited in /admin) */
  email: string;
  /** the marketplace bundle this identity fronts */
  chatSlug: string;
  /**
   * REGISTERED agent that answers inbound messages while the bundle's
   * provisional lead agent is still being built. When the lead slug from
   * lib/marketplace/bundles.ts IS registered, it wins (see resolveRoutingAgent).
   */
  routingAgentSlug: string;
};

export const BUNDLE_IDENTITIES: Record<string, BundleIdentityMeta> = {
  communication: {
    bundleSlug: 'communication',
    displayName: 'Communication',
    email: 'communication@assembl.co.nz',
    chatSlug: 'ensemble',
    routingAgentSlug: 'auaha', // creative studio lead until creative-director ships
  },
  trust: {
    bundleSlug: 'trust',
    displayName: 'Trust',
    email: 'trust@assembl.co.nz',
    chatSlug: 'counsel',
    routingAgentSlug: 'hoko-cga', // nearest registered legal agent until solicitor ships
  },
  workflow: {
    bundleSlug: 'workflow',
    displayName: 'Workflow',
    email: 'workflow@assembl.co.nz',
    chatSlug: 'assembler',
    routingAgentSlug: 'kaupapa', // project-management agent until foreman ships
  },
  insights: {
    bundleSlug: 'insights',
    displayName: 'Insights',
    email: 'insights@assembl.co.nz',
    chatSlug: 'practice',
    routingAgentSlug: 'quill', // clinical documentation until duty-doctor ships
  },
  operations: {
    bundleSlug: 'operations',
    displayName: 'Operations',
    email: 'operations@assembl.co.nz',
    chatSlug: 'forge',
    routingAgentSlug: 'arataki', // the real Forge lead — already registered
  },
  knowledge: {
    bundleSlug: 'knowledge',
    displayName: 'Knowledge',
    email: 'knowledge@assembl.co.nz',
    chatSlug: 'kaitiaki',
    routingAgentSlug: 'keeper', // the real Kaitiaki lead — already registered
  },
  // Hearth and Visa route straight to their bundles (no marketing-identity
  // front). They exist for the shared-number keyword channels (HELM / VISA,
  // 20260705090000) — no email alias yet, so email is empty.
  hearth: {
    bundleSlug: 'hearth',
    displayName: 'Hearth',
    email: '',
    chatSlug: 'hearth',
    routingAgentSlug: 'toro', // the real Hearth lead — already registered
  },
  visa: {
    bundleSlug: 'visa',
    displayName: 'Visa',
    email: '',
    chatSlug: 'visa',
    routingAgentSlug: 'hoko-cga', // nearest registered legal agent until a visa agent ships
  },
};

export function identityMetaBySlug(bundleSlug: string): BundleIdentityMeta | undefined {
  return BUNDLE_IDENTITIES[bundleSlug];
}

/**
 * The agent that answers for a bundle identity: the bundle's lead agent when
 * it is registered in the marketplace, otherwise the identity's designated
 * registered routing agent. Returns null only if the registry is misconfigured.
 */
export function resolveRoutingAgent(meta: BundleIdentityMeta): MarketplaceAgent | null {
  const leadSlug = bundleBySlug(meta.chatSlug)?.leadSlug;
  if (leadSlug) {
    const lead = marketplaceAgentBySlug(leadSlug);
    if (lead) return lead;
  }
  return marketplaceAgentBySlug(meta.routingAgentSlug) ?? null;
}

/**
 * Normalise a phone number to a bare comparable form: digits only, NZ
 * leading-zero converted to 64 (e.g. '021 234 5678' and '+64212345678' both
 * become '64212345678').
 */
export function normalizePhone(input: string): string {
  const digits = input.replace(/[^\d]/g, '');
  if (digits.startsWith('0')) return `64${digits.slice(1)}`;
  return digits;
}

/** Case-insensitive email compare that ignores display-name wrapping. */
export function normalizeEmail(input: string): string {
  const angled = input.match(/<([^>]+)>/);
  const addr = (angled ? angled[1] : input).trim().toLowerCase();
  return addr;
}
