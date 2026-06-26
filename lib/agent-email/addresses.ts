/**
 * Per-agent email addresses — single source of truth.
 *
 * Premium agents (plus Atlas) each get a public address at
 * <local-part>@assembl.co.nz. Inbound mail to that address lands in the agent's
 * email thread; outbound replies go FROM the same address via Brevo.
 *
 * The local-parts are the "pretty" public addresses — `customs@`, not the
 * roster slug `customs-entry`. The DB mirrors this map in
 * agents.email_slug (migration 20260626160000) and the two edge functions
 * (agent-email-inbound / agent-email-outbound) carry the same table for the
 * Deno runtime, which can't import this module.
 *
 * To add an agent inbox: add a line here, add the matching UPDATE in the
 * migration, and add it to the EMAIL_SLUG_BY_AGENT_SLUG const in both edge
 * functions. The inbound resolver also falls back to the raw slug, so a missing
 * entry degrades to <slug>@assembl.co.nz rather than bouncing.
 */

export const AGENT_EMAIL_DOMAIN = 'assembl.co.nz';

/** Agent roster slug → public email local-part. */
export const AGENT_EMAIL_LOCAL_PART: Record<string, string> = {
  atlas: 'atlas',
  'tax-tidy': 'tax-tidy',
  'customs-entry': 'customs',
  'care-scribe': 'care-scribe',
  'voice-cs': 'voice-cs',
  'food-temp-logs': 'food-temp',
  'stock-count': 'stock-count',
  'compliance-check': 'compliance',
  'maritime-brief': 'maritime',
  arataki: 'arataki',
};

/** The local-part for an agent, or null if the agent has no inbox. */
export function emailLocalPartForAgent(slug: string): string | null {
  return AGENT_EMAIL_LOCAL_PART[slug] ?? null;
}

/** The full address for an agent, or null if the agent has no inbox. */
export function agentEmailAddress(slug: string): string | null {
  const local = emailLocalPartForAgent(slug);
  return local ? `${local}@${AGENT_EMAIL_DOMAIN}` : null;
}

/** True if the agent has a public email inbox. */
export function agentHasEmail(slug: string): boolean {
  return slug in AGENT_EMAIL_LOCAL_PART;
}

/**
 * Resolve an inbound `to:` address back to an agent slug. Matches the
 * local-part against the pretty map first, then treats it as a raw slug so a
 * not-yet-mapped <slug>@assembl.co.nz still routes. Returns null for an
 * unknown local-part (e.g. assembl@, noreply@ — handled elsewhere).
 */
export function agentSlugForLocalPart(localPart: string): string | null {
  const lower = localPart.trim().toLowerCase();
  for (const [slug, local] of Object.entries(AGENT_EMAIL_LOCAL_PART)) {
    if (local === lower) return slug;
  }
  return null;
}
