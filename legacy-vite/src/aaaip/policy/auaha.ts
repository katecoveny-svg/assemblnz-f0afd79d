// ═══════════════════════════════════════════════════════════════
// AAAIP — Auaha (Creative) Policies
// Brand-safety, copyright and cultural-integrity policies for a
// creative agent generating copy, imagery, video and campaigns.
// ═══════════════════════════════════════════════════════════════

import type { RegisteredPolicy } from "./library";
import type { Policy, PolicyEvaluation, PolicyPredicate } from "./types";

const pass = (id: string, severity: Policy["severity"]): PolicyEvaluation => ({
  policyId: id, passed: true, severity, message: "ok",
});
const fail = (id: string, severity: Policy["severity"], message: string): PolicyEvaluation => ({
  policyId: id, passed: false, severity, message,
});

const COPYRIGHT: Policy = {
  id: "auaha.copyright",
  domain: "creative",
  name: "Copyrighted material must be licensed",
  rationale:
    "Assets referencing a third-party source (stock image, music, footage) must carry a verified licence reference before publishing.",
  source: "NZ Copyright Act 1994 + Creative Commons attribution",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["legal", "ip"],
};
const copyrightPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "publish_asset") return pass(COPYRIGHT.id, "block");
  const thirdParty = action.payload.usesThirdPartyAsset as boolean | undefined;
  const licence = action.payload.licenceRef as string | undefined;
  if (thirdParty && (!licence || licence.length === 0)) {
    return fail(COPYRIGHT.id, "block", "Asset uses third-party material without a licence ref.");
  }
  return pass(COPYRIGHT.id, "block");
};

const LIKENESS_CONSENT: Policy = {
  id: "auaha.likeness_consent",
  domain: "creative",
  name: "Likeness consent required",
  rationale:
    "Imagery or video depicting an identifiable person must have a recorded model release / likeness consent.",
  source: "NZ Privacy Act 2020 + Advertising Standards Authority Code",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["privacy", "consent"],
};
const likenessPredicate: PolicyPredicate = (action) => {
  if (action.kind !== "publish_asset") return pass(LIKENESS_CONSENT.id, "block");
  const hasLikeness = action.payload.containsLikeness as boolean | undefined;
  const consent = action.payload.likenessConsent as boolean | undefined;
  if (hasLikeness && consent !== true) {
    return fail(LIKENESS_CONSENT.id, "block", "Asset contains an identifiable likeness without consent.");
  }
  return pass(LIKENESS_CONSENT.id, "block");
};

const BRAND_SAFETY: Policy = {
  id: "auaha.brand_safety",
  domain: "creative",
  name: "Brand safety filter",
  rationale:
    "Assets scoring above the brand-risk threshold (profanity, unverified claims, sensitive topics) must be reviewed before publishing.",
  source: "Internal brand SOP + IAB brand safety framework",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["brand", "moderation"],
};
const brandSafetyPredicate: PolicyPredicate = (action) => {
  const risk = (action.payload.brandRisk as number | undefined) ?? 0;
  if (risk > 0.6) {
    return fail(BRAND_SAFETY.id, "warn",
      `Brand risk ${risk.toFixed(2)} > 0.60 — request brand-manager review.`);
  }
  return pass(BRAND_SAFETY.id, "warn");
};

const TE_REO_INTEGRITY: Policy = {
  id: "auaha.te_reo_integrity",
  domain: "creative",
  name: "Te reo integrity check",
  rationale:
    "Assets featuring te reo Māori (macrons, karakia, waiata, whakataukī) must pass kaitiaki review before publishing.",
  source: "Te Mana Raraunga + Te Taura Whiri i te Reo Māori guidance",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["te-reo", "cultural-safety"],
};
const teReoPredicate: PolicyPredicate = (action) => {
  const teReo = action.payload.containsTeReo as boolean | undefined;
  const kaitiakiReview = action.payload.kaitiakiReview as boolean | undefined;
  if (teReo && kaitiakiReview !== true) {
    return fail(TE_REO_INTEGRITY.id, "warn",
      "Asset contains te reo but has not been reviewed by a kaitiaki.");
  }
  return pass(TE_REO_INTEGRITY.id, "warn");
};

const MISINFO: Policy = {
  id: "auaha.misinfo_check",
  domain: "creative",
  name: "Misinformation check",
  rationale:
    "Marketing claims below the factual-confidence threshold must be reviewed before publishing (or labelled as editorial).",
  source: "Advertising Standards Authority Code + IFCN",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["epistemic", "human-in-the-loop"],
};
const misinfoPredicate: PolicyPredicate = (action) => {
  const factScore = (action.payload.factScore as number | undefined) ?? 1;
  if (factScore < 0.55) {
    return fail(MISINFO.id, "warn",
      `Fact confidence ${factScore.toFixed(2)} < 0.55 — request review.`);
  }
  return pass(MISINFO.id, "warn");
};

const UNCERTAINTY: Policy = {
  id: "auaha.uncertainty_handoff",
  domain: "creative",
  name: "Defer to humans when uncertain",
  rationale: "Escalate low-confidence creative decisions to the brand manager.",
  source: "AAAIP safe-operation principle",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["oversight"],
};
const uncertaintyPredicate: PolicyPredicate = (action, ctx) => {
  if (action.confidence < ctx.uncertaintyThreshold) {
    return fail(UNCERTAINTY.id, "warn",
      `Confidence ${action.confidence.toFixed(2)} < ${ctx.uncertaintyThreshold.toFixed(2)}.`);
  }
  return pass(UNCERTAINTY.id, "warn");
};

export const AUAHA_POLICIES: RegisteredPolicy[] = [
  { policy: COPYRIGHT, predicate: copyrightPredicate },
  { policy: LIKENESS_CONSENT, predicate: likenessPredicate },
  { policy: BRAND_SAFETY, predicate: brandSafetyPredicate },
  { policy: TE_REO_INTEGRITY, predicate: teReoPredicate },
  { policy: MISINFO, predicate: misinfoPredicate },
  { policy: UNCERTAINTY, predicate: uncertaintyPredicate },
];
export const AUAHA_POLICY_METADATA: Policy[] = AUAHA_POLICIES.map((p) => p.policy);
