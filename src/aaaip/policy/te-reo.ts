// ═══════════════════════════════════════════════════════════════
// AAAIP — Te Reo Tikanga Advisory policy library
//
// Governs the cultural intelligence layer for te reo Māori
// language support, tikanga protocols, and indigenous governance.
//
// Legal basis:
// - Te Ture mō Te Reo Māori 2016
// - Te Tiriti o Waitangi (Article 2 — taonga protection)
// - Ellis v R [2022] NZSC 114 (tikanga as law)
// - Te Mana Raraunga — Māori Data Sovereignty principles
// - NZ Privacy Act 2020 (IPP 3A)
// - MBIE Responsible AI Guidance (Feb 2025)
// ═══════════════════════════════════════════════════════════════

import type { RegisteredPolicy } from "./library";
import type { Policy, PolicyEvaluation, PolicyPredicate } from "./types";

const pass = (id: string, severity: Policy["severity"]): PolicyEvaluation => ({
  policyId: id, passed: true, severity, message: "ok",
});
const fail = (id: string, severity: Policy["severity"], message: string): PolicyEvaluation => ({
  policyId: id, passed: false, severity, message,
});

/* ── 1. Te Reo accuracy — macrons & grammar ─────────────────── */
const TE_REO_ACCURACY: Policy = {
  id: "tereo.accuracy",
  domain: "language",
  name: "Te reo accuracy check",
  rationale:
    "Macrons change meaning (e.g. ata vs āta). All te reo output must " +
    "have correct macrons and carry the AI-generated disclaimer.",
  source: "Te Taura Whiri i te Reo Māori — orthographic conventions",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["te-reo", "macrons", "cultural-safety"],
};

const accuracyPredicate: PolicyPredicate = (action) => {
  const hasTeReo = action.payload.containsTeReo as boolean | undefined;
  const macronsValidated = action.payload.macronsValidated as boolean | undefined;
  if (hasTeReo && macronsValidated !== true) {
    return fail(
      TE_REO_ACCURACY.id,
      "warn",
      "Te reo content detected but macron validation not confirmed. " +
      "Check Te Aka (maoridictionary.co.nz) and flag for reo speaker review."
    );
  }
  return pass(TE_REO_ACCURACY.id, "warn");
};

/* ── 2. Kaitiaki review — human reo speaker gate ────────────── */
const KAITIAKI_REVIEW: Policy = {
  id: "tereo.kaitiaki_review",
  domain: "language",
  name: "Kaitiaki review required",
  rationale:
    "Complex te reo (sentences, karakia, legal, product naming) MUST be " +
    "reviewed by a competent reo speaker. AI is a support tool only.",
  source: "Te Mana Raraunga — Māori Data Sovereignty; Four Pou governance",
  severity: "block",
  oversight: "always_human",
  tags: ["te-reo", "human-in-loop", "cultural-safety"],
};

const kaitiakiPredicate: PolicyPredicate = (action) => {
  const complexTeReo = action.payload.complexTeReo as boolean | undefined;
  const kaitiakiApproved = action.payload.kaitiakiApproved as boolean | undefined;
  if (complexTeReo && kaitiakiApproved !== true) {
    return fail(
      KAITIAKI_REVIEW.id,
      "block",
      "Complex te reo content requires kaitiaki (reo speaker) review. " +
      "Nō rātou te reo, mā rātou e ārahi."
    );
  }
  return pass(KAITIAKI_REVIEW.id, "block");
};

/* ── 3. Data sovereignty — Te Mana Raraunga ─────────────────── */
const DATA_SOVEREIGNTY: Policy = {
  id: "tereo.data_sovereignty",
  domain: "language",
  name: "Māori data sovereignty",
  rationale:
    "Māori data is a taonga. Data about te reo usage, iwi-specific " +
    "dialect, and revitalisation must be governed by Māori.",
  source: "Te Mana Raraunga; Te Hiku Media Kaitiakitanga licence",
  severity: "block",
  oversight: "always_human",
  tags: ["data-sovereignty", "te-mana-raraunga", "kaitiakitanga"],
};

const sovereigntyPredicate: PolicyPredicate = (action) => {
  const touchesMaoriData = action.payload.touchesMaoriData as boolean | undefined;
  const sovereigntyCleared = action.payload.sovereigntyCleared as boolean | undefined;
  if (touchesMaoriData && sovereigntyCleared !== true) {
    return fail(
      DATA_SOVEREIGNTY.id,
      "block",
      "Action touches Māori data without sovereignty clearance. " +
      "Te Mana Raraunga principles require Māori governance."
    );
  }
  return pass(DATA_SOVEREIGNTY.id, "block");
};

/* ── 4. Tikanga compliance — Mead's Five Tests ──────────────── */
const TIKANGA_COMPLIANCE: Policy = {
  id: "tereo.tikanga_compliance",
  domain: "language",
  name: "Tikanga compliance (Mead's Five Tests)",
  rationale:
    "Cultural content must pass Tika, Pono, Aroha, Tikanga, and Mana " +
    "tests. If any fails, recommend human cultural consultation.",
  source: "Prof. Hirini Moko Mead — Tikanga Māori (2003); Ellis v R [2022] NZSC 114",
  severity: "warn",
  oversight: "ask_each_time",
  tags: ["tikanga", "cultural-safety", "meads-tests"],
};

const tikangaPredicate: PolicyPredicate = (action) => {
  const culturalContent = action.payload.culturalContent as boolean | undefined;
  const tikangaCleared = action.payload.tikangaCleared as boolean | undefined;
  if (culturalContent && tikangaCleared !== true) {
    return fail(
      TIKANGA_COMPLIANCE.id,
      "warn",
      "Cultural content has not passed Mead's Five Tests (Tika, Pono, Aroha, Tikanga, Mana)."
    );
  }
  return pass(TIKANGA_COMPLIANCE.id, "warn");
};

/* ── 5. Sacred content — karakia / whaikōrero gate ──────────── */
const SACRED_CONTENT: Policy = {
  id: "tereo.sacred_content",
  domain: "language",
  name: "Sacred content prohibition",
  rationale:
    "AI must NEVER generate karakia, whaikōrero, or waiata. These must " +
    "be sourced from kaumātua or the organisation's Māori advisor.",
  source: "Four Pou Framework — Rangatiratanga; Te Ture mō Te Reo Māori 2016",
  severity: "block",
  oversight: "never_allow",
  tags: ["te-reo", "sacred", "karakia"],
};

const sacredPredicate: PolicyPredicate = (action) => {
  const sacredContent = action.payload.sacredContent as boolean | undefined;
  if (sacredContent) {
    return fail(
      SACRED_CONTENT.id,
      "block",
      "AI-generated sacred content (karakia, whaikōrero, waiata) is prohibited. " +
      "Source from kaumātua or your Māori advisor."
    );
  }
  return pass(SACRED_CONTENT.id, "block");
};

/* ── Export ──────────────────────────────────────────────────── */
export const TE_REO_POLICIES: RegisteredPolicy[] = [
  { policy: TE_REO_ACCURACY, predicate: accuracyPredicate },
  { policy: KAITIAKI_REVIEW, predicate: kaitiakiPredicate },
  { policy: DATA_SOVEREIGNTY, predicate: sovereigntyPredicate },
  { policy: TIKANGA_COMPLIANCE, predicate: tikangaPredicate },
  { policy: SACRED_CONTENT, predicate: sacredPredicate },
];
