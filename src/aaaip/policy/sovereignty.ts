// ═══════════════════════════════════════════════════════════════
// AAAIP — Māori Data Sovereignty Policies
// Enforceable runtime controls aligned with Te Mana Raraunga,
// IPP 3A (effective 1 May 2026), and MBIE Responsible AI Guidance.
// ═══════════════════════════════════════════════════════════════

import type { RegisteredPolicy } from "./library";
import type { Policy, PolicyEvaluation, PolicyPredicate } from "./types";

const pass = (id: string, severity: Policy["severity"]): PolicyEvaluation => ({
  policyId: id, passed: true, severity, message: "ok",
});
const fail = (id: string, severity: Policy["severity"], message: string): PolicyEvaluation => ({
  policyId: id, passed: false, severity, message,
});

// ── 1. Purpose Binding ────────────────────────────────────────

const PURPOSE_BINDING: Policy = {
  id: "sovereignty.purpose_binding",
  domain: "community_portal",
  name: "Purpose binding for Māori data",
  rationale:
    "Every agent action touching Māori-tagged data must declare a purpose that matches the dataset's permitted purposes. Prevents purpose creep.",
  source: "Te Mana Raraunga — Authority & Obligations; NZ Privacy Act 2020 IPP 10",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["sovereignty", "purpose", "te-mana-raraunga"],
};

const purposeBindingPredicate: PolicyPredicate = (action, ctx) => {
  const isMaoriData = ctx.world.isMaoriData as boolean | undefined;
  if (!isMaoriData) return pass(PURPOSE_BINDING.id, "block");

  const declaredPurpose = action.payload.purpose as string | undefined;
  const permittedPurposes = (ctx.world.permittedPurposes as string[]) ?? [];

  if (!declaredPurpose) {
    return fail(PURPOSE_BINDING.id, "block",
      "No purpose declared for action touching Māori data. All access must declare an approved purpose.");
  }
  if (permittedPurposes.length > 0 && !permittedPurposes.includes(declaredPurpose)) {
    return fail(PURPOSE_BINDING.id, "block",
      `Purpose "${declaredPurpose}" is not in the permitted purposes list for this Māori dataset. Approved: ${permittedPurposes.join(", ")}`);
  }
  return pass(PURPOSE_BINDING.id, "block");
};

// ── 2. Locality Control ──────────────────────────────────────

const LOCALITY_CONTROL: Policy = {
  id: "sovereignty.locality",
  domain: "community_portal",
  name: "NZ locality for Māori data",
  rationale:
    "Māori data must remain in Aotearoa NZ for processing and storage unless explicitly approved by kaitiaki governance.",
  source: "Te Mana Raraunga — Kaitiakitanga; Privacy Act 2020 IPP 12",
  severity: "block",
  oversight: "never_allow",
  tags: ["sovereignty", "locality", "data-residency"],
};

const localityPredicate: PolicyPredicate = (action, ctx) => {
  const isMaoriData = ctx.world.isMaoriData as boolean | undefined;
  if (!isMaoriData) return pass(LOCALITY_CONTROL.id, "block");

  const locality = (ctx.world.localityRestriction as string) ?? "nz_only";
  const processingRegion = (action.payload.region as string) ?? "nz";

  if (locality === "nz_only" && processingRegion !== "nz") {
    return fail(LOCALITY_CONTROL.id, "block",
      `Māori data is restricted to NZ-only processing. Action targets region "${processingRegion}".`);
  }
  if (locality === "au_nz" && !["nz", "au"].includes(processingRegion)) {
    return fail(LOCALITY_CONTROL.id, "block",
      `Māori data is restricted to AU/NZ processing. Action targets region "${processingRegion}".`);
  }
  return pass(LOCALITY_CONTROL.id, "block");
};

// ── 3. No Public GenAI ───────────────────────────────────────

const NO_PUBLIC_GENAI: Policy = {
  id: "sovereignty.no_public_genai",
  domain: "community_portal",
  name: "No public GenAI for Māori data",
  rationale:
    "Māori-tagged datasets must not be sent to public GenAI endpoints unless kaitiaki governance has explicitly approved. Prevents uncontrolled data exposure.",
  source: "Te Mana Raraunga — Rangatiratanga; MBIE Responsible AI Guidance 2025",
  severity: "block",
  oversight: "never_allow",
  tags: ["sovereignty", "genai", "data-protection"],
};

const noPublicGenaiPredicate: PolicyPredicate = (action, ctx) => {
  const isMaoriData = ctx.world.isMaoriData as boolean | undefined;
  if (!isMaoriData) return pass(NO_PUBLIC_GENAI.id, "block");

  const isPublicEndpoint = action.payload.isPublicGenAI as boolean | undefined;
  const governanceApproved = ctx.world.genaiGovernanceApproved as boolean | undefined;

  if (isPublicEndpoint && !governanceApproved) {
    return fail(NO_PUBLIC_GENAI.id, "block",
      "Cannot send Māori-tagged data to a public GenAI endpoint without kaitiaki governance approval.");
  }
  return pass(NO_PUBLIC_GENAI.id, "block");
};

// ── 4. Tapu Access Control ───────────────────────────────────

const TAPU_ACCESS: Policy = {
  id: "sovereignty.tapu_access",
  domain: "community_portal",
  name: "Tapu data requires human approval",
  rationale:
    "Data classified as tapu carries higher cultural sensitivity. Access requires explicit approval from a named kaitiaki.",
  source: "Te Mana Raraunga — Māori authority over tapu/noa classification",
  severity: "warn",
  oversight: "always_human",
  tags: ["sovereignty", "tapu", "human-in-the-loop"],
};

const tapuAccessPredicate: PolicyPredicate = (action, ctx) => {
  const classification = ctx.world.tapuNoaClassification as string | undefined;
  if (classification !== "tapu") return pass(TAPU_ACCESS.id, "warn");

  const kaitiakiApproved = ctx.world.kaitiakiApproved as boolean | undefined;
  if (!kaitiakiApproved) {
    return fail(TAPU_ACCESS.id, "warn",
      "This data is classified as tapu. Kaitiaki approval is required before access.");
  }
  return pass(TAPU_ACCESS.id, "warn");
};

// ── 5. Consent Validity ─────────────────────────────────────

const CONSENT_VALID: Policy = {
  id: "sovereignty.consent_valid",
  domain: "community_portal",
  name: "Governance approval not expired",
  rationale:
    "Māori data governance approvals have expiry dates. Expired approvals must be renewed before data can be accessed.",
  source: "Te Mana Raraunga — Governance gates; IPP 3A consent obligations",
  severity: "block",
  oversight: "ask_each_time",
  tags: ["sovereignty", "consent", "governance"],
};

const consentValidPredicate: PolicyPredicate = (action, ctx) => {
  const isMaoriData = ctx.world.isMaoriData as boolean | undefined;
  if (!isMaoriData) return pass(CONSENT_VALID.id, "block");

  const approvalExpiry = ctx.world.approvalExpiry as number | undefined;
  const governanceStatus = ctx.world.governanceStatus as string | undefined;

  if (governanceStatus === "declined") {
    return fail(CONSENT_VALID.id, "block",
      "Governance approval for this Māori dataset has been declined. Access is blocked.");
  }
  if (governanceStatus === "expired" || (approvalExpiry && ctx.now > approvalExpiry)) {
    return fail(CONSENT_VALID.id, "block",
      "Governance approval has expired. Renewal is required before accessing this Māori dataset.");
  }
  if (governanceStatus === "pending") {
    return fail(CONSENT_VALID.id, "block",
      "Governance approval is still pending. Cannot access Māori data until approved.");
  }
  return pass(CONSENT_VALID.id, "block");
};

// ── 6. Provenance Required ───────────────────────────────────

const PROVENANCE_REQUIRED: Policy = {
  id: "sovereignty.provenance",
  domain: "community_portal",
  name: "Data whakapapa must be recorded",
  rationale:
    "Every action on Māori data must produce an audit entry with full provenance chain (inputs → transformations → outputs).",
  source: "Te Mana Raraunga — Whakapapa principle; Public Service AI Framework traceability",
  severity: "warn",
  oversight: "auto_approve",
  tags: ["sovereignty", "provenance", "audit"],
};

const provenancePredicate: PolicyPredicate = (action) => {
  const hasProvenance = action.payload.provenanceChain as unknown[] | undefined;
  if (!hasProvenance || (Array.isArray(hasProvenance) && hasProvenance.length === 0)) {
    return fail(PROVENANCE_REQUIRED.id, "warn",
      "No provenance chain attached. Actions on Māori data should carry full data whakapapa.");
  }
  return pass(PROVENANCE_REQUIRED.id, "warn");
};

// ── Public registry ─────────────────────────────────────────

export const SOVEREIGNTY_POLICIES: RegisteredPolicy[] = [
  { policy: PURPOSE_BINDING,    predicate: purposeBindingPredicate },
  { policy: LOCALITY_CONTROL,   predicate: localityPredicate },
  { policy: NO_PUBLIC_GENAI,    predicate: noPublicGenaiPredicate },
  { policy: TAPU_ACCESS,        predicate: tapuAccessPredicate },
  { policy: CONSENT_VALID,      predicate: consentValidPredicate },
  { policy: PROVENANCE_REQUIRED, predicate: provenancePredicate },
];

export const SOVEREIGNTY_POLICY_METADATA = SOVEREIGNTY_POLICIES.map(p => p.policy);
