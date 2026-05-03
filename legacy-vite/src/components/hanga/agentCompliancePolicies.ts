// ═══════════════════════════════════════════════════════════════
// Agent → compliance policy-set mapping
//
// Single source of truth for which agents/packs require a
// pre-flight compliance gate, and which fields that gate must
// collect. Adding a new construction-style agent now means adding
// one entry below — no changes to chat panel logic required.
// ═══════════════════════════════════════════════════════════════

export type CompliancePolicyId =
  | "ppe"
  | "worker_consent"
  | "tender_signoff"
  | "zone"
  | "headcount_cap";

export interface CompliancePolicySet {
  /** Stable id for this policy set (e.g. "construction_site"). */
  id: string;
  /** Friendly label shown on the gate header. */
  label: string;
  /** Plain-English description of what this set governs. */
  description: string;
  /** Audit-log kete bucket. */
  auditKete: string;
  /** Which fields the pre-flight gate must collect. */
  policies: CompliancePolicyId[];
  /** Send `complianceContext` payload on every request. */
  sendContextWithRequests: boolean;
}

/** All construction-related agents share the full site-safety policy set. */
const CONSTRUCTION_SITE_POLICIES: CompliancePolicySet = {
  id: "construction_site",
  label: "Construction site compliance",
  description:
    "Site-safety, worker consent, and human sign-off must be confirmed before the agent can respond.",
  auditKete: "WAIHANGA",
  policies: ["ppe", "worker_consent", "tender_signoff", "zone", "headcount_cap"],
  sendContextWithRequests: true,
};

/**
 * Pack-level (kete) → policy-set mapping. Falls back to per-agent
 * mapping below if a pack isn't listed here.
 */
const PACK_POLICY_SETS: Record<string, CompliancePolicySet> = {
  waihanga: CONSTRUCTION_SITE_POLICIES,
  hanga: CONSTRUCTION_SITE_POLICIES, // legacy alias
};

/**
 * Per-agent overrides. Use this when a specific agent inside a
 * non-construction pack still needs the construction gate
 * (e.g. a fleet agent that does lift-truck operations on site).
 *
 * Keys are agent slugs as they appear in the chat router.
 */
const AGENT_POLICY_SETS: Record<string, CompliancePolicySet> = {
  // HANGA / Construction kete specialists
  arai: CONSTRUCTION_SITE_POLICIES,
  kaupapa: CONSTRUCTION_SITE_POLICIES,
  ata: CONSTRUCTION_SITE_POLICIES,
  rawa: CONSTRUCTION_SITE_POLICIES,
  whakaae: CONSTRUCTION_SITE_POLICIES,
  pai: CONSTRUCTION_SITE_POLICIES,
  arc: CONSTRUCTION_SITE_POLICIES,
  terra: CONSTRUCTION_SITE_POLICIES,
  pinnacle: CONSTRUCTION_SITE_POLICIES,
};

/**
 * Resolve the policy set governing the current chat session.
 * Pack-level mapping wins; per-agent override applies if no pack
 * mapping exists. Returns `null` for ungoverned chats (free pass).
 */
export function resolveCompliancePolicySet(
  packId: string | undefined,
  agentId?: string | null,
): CompliancePolicySet | null {
  if (packId && PACK_POLICY_SETS[packId]) return PACK_POLICY_SETS[packId];
  if (agentId && AGENT_POLICY_SETS[agentId]) return AGENT_POLICY_SETS[agentId];
  return null;
}

export function policySetIncludes(
  set: CompliancePolicySet | null,
  policy: CompliancePolicyId,
): boolean {
  return !!set && set.policies.includes(policy);
}
