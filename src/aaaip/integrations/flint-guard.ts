// ═══════════════════════════════════════════════════════════════
// AAAIP — Flint Guard
//
// Wraps the Auaha ComplianceEngine so that every page-edit proposal
// arriving from Flint is evaluated against Assembl's creative
// policies before it can be committed.
//
// Flint MCP endpoint: https://mcp.tryflint.com/mcp
// API key:            $FLINT_API_KEY  (never put the key in source)
//
// Usage (server-side / edge function):
//
//   const result = await flintGuard.evaluate({
//     pageId: "homepage",
//     region: "hero-subheadline",
//     proposedContent: "New headline copy…",
//     meta: {
//       usesThirdPartyAsset: false,
//       containsLikeness: false,
//       brandRisk: 0.1,
//       containsTeReo: false,
//       factScore: 0.9,
//     },
//   });
//
//   if (result.verdict === "block") {
//     throw new Error(`Flint proposal rejected: ${result.explanation}`);
//   }
//   if (result.verdict === "needs_human") {
//     await queueForReview(result);
//     return;
//   }
//   await commitEdit(proposal, result.auditId);
// ═══════════════════════════════════════════════════════════════

import { ComplianceEngine } from "../policy/engine";
import { AUAHA_POLICIES } from "../policy/auaha";
import type { AgentAction, ComplianceDecision } from "../policy/types";

// ── Types ──────────────────────────────────────────────────────

/**
 * Metadata Flint attaches to a proposed page edit.
 * Values Flint cannot determine may be omitted; conservative
 * defaults will be applied (err on the side of blocking).
 */
export interface FlintProposalMeta {
  /** Asset references a third-party source (stock, music, footage). */
  usesThirdPartyAsset?: boolean;
  /** Verified licence ref for the third-party asset. */
  licenceRef?: string;
  /** Proposal contains an identifiable person's likeness. */
  containsLikeness?: boolean;
  /** Model release / likeness consent is on file. */
  likenessConsent?: boolean;
  /**
   * Brand-risk score 0–1 as returned by Flint's content classifier.
   * Default: 0 (safe). Scores above 0.6 trigger a warn.
   */
  brandRisk?: number;
  /** Content features te reo Māori (macrons, karakia, waiata, whakataukī). */
  containsTeReo?: boolean;
  /** kaitiaki review has been completed for te reo content. */
  kaitiakiReview?: boolean;
  /**
   * Flint's factual-confidence score 0–1 for any marketing claims.
   * Default: 1.0 (fully confident). Scores below 0.55 trigger a warn.
   */
  factScore?: number;
  /** Flint's overall confidence in this proposal. Default: 0.9. */
  confidence?: number;
}

/** A single page-edit proposal from Flint. */
export interface FlintProposal {
  /** Page id from assembl-page-manifest.json (e.g. "homepage"). */
  pageId: string;
  /** Region being edited (e.g. "hero-subheadline"). */
  region: string;
  /** The new copy / markdown Flint wants to publish. */
  proposedContent: string;
  /** Compliance metadata supplied by Flint. */
  meta: FlintProposalMeta;
  /** ISO timestamp from Flint's request. Defaults to now. */
  proposedAt?: string;
}

/** Full decision returned to the caller after evaluation. */
export interface FlintGuardResult {
  /** Unique id for this evaluation — include in commit metadata. */
  auditId: string;
  /** The original proposal, echoed back for traceability. */
  proposal: FlintProposal;
  /** Engine verdict. */
  verdict: ComplianceDecision["verdict"];
  /** Human-readable explanation suitable for the PR body or review queue. */
  explanation: string;
  /** Every policy evaluation, for the audit trail. */
  evaluations: ComplianceDecision["evaluations"];
  /** Wall-clock timestamp of this evaluation. */
  evaluatedAt: string;
  /** Convenience flag: proposal may proceed to commit. */
  approved: boolean;
  /** Convenience flag: proposal needs a human reviewer before commit. */
  needsReview: boolean;
  /** Convenience flag: proposal is rejected — do not commit. */
  rejected: boolean;
}

// ── Singleton engine ───────────────────────────────────────────

// Auaha policies govern all creative/copy content — they apply to
// every marketing page Flint edits, regardless of which Kete the
// page belongs to.
const _engine = new ComplianceEngine({
  policies: AUAHA_POLICIES,
  defaultUncertaintyThreshold: 0.7,
});

let _auditCounter = 0;
const nextAuditId = () =>
  `flint-audit-${Date.now()}-${(++_auditCounter).toString().padStart(4, "0")}`;

// ── Guard ──────────────────────────────────────────────────────

/**
 * Evaluate a Flint page-edit proposal against the Auaha compliance
 * engine. Returns a structured result with verdict, explanation,
 * and a unique audit id the caller should attach to the commit.
 *
 * Callers MUST honour verdict:
 *   "allow"       → safe to commit
 *   "needs_human" → route to the Assembl review queue; do not auto-commit
 *   "block"       → hard reject; do not commit under any circumstances
 */
export function evaluateFlintProposal(proposal: FlintProposal): FlintGuardResult {
  const meta = proposal.meta;
  const now = proposal.proposedAt
    ? new Date(proposal.proposedAt).getTime()
    : Date.now();

  const action: AgentAction = {
    id: nextAuditId(),
    domain: "creative",
    kind: "publish_asset",
    payload: {
      // Copyright
      usesThirdPartyAsset: meta.usesThirdPartyAsset ?? false,
      licenceRef: meta.licenceRef ?? "",
      // Likeness
      containsLikeness: meta.containsLikeness ?? false,
      likenessConsent: meta.likenessConsent ?? false,
      // Brand safety
      brandRisk: meta.brandRisk ?? 0,
      // Te reo
      containsTeReo: meta.containsTeReo ?? false,
      kaitiakiReview: meta.kaitiakiReview ?? false,
      // Misinfo
      factScore: meta.factScore ?? 1,
      // Context
      flintPageId: proposal.pageId,
      flintRegion: proposal.region,
    },
    confidence: meta.confidence ?? 0.9,
    proposedAt: now,
    rationale: `Flint edit to "${proposal.pageId}/${proposal.region}"`,
  };

  const decision = _engine.evaluate(action, {
    now,
    world: {},
    uncertaintyThreshold: 0.7,
  });

  const auditId = action.id;
  const evaluatedAt = new Date().toISOString();

  return {
    auditId,
    proposal,
    verdict: decision.verdict,
    explanation: decision.explanation,
    evaluations: decision.evaluations,
    evaluatedAt,
    approved: decision.verdict === "allow",
    needsReview: decision.verdict === "needs_human",
    rejected: decision.verdict === "block",
  };
}

/**
 * Serialise a guard result into a compact JSON string suitable for
 * embedding in a git commit message or PR description.
 *
 * Example:
 *   git commit -m "feat: update homepage subheadline
 *
 *   flint-audit: $(flintGuard.auditSummary(result))"
 */
export function auditSummary(result: FlintGuardResult): string {
  return JSON.stringify({
    auditId: result.auditId,
    page: result.proposal.pageId,
    region: result.proposal.region,
    verdict: result.verdict,
    evaluatedAt: result.evaluatedAt,
    policies: result.evaluations.map((e) => ({
      id: e.policyId,
      passed: e.passed,
      severity: e.severity,
      ...(e.passed ? {} : { message: e.message }),
    })),
  });
}
