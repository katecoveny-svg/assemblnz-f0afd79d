// ════════════════════════════════════════════════════════════════════════
// capability-matcher — score a GETS tender 0..100 against assembl's
// capability profile. Returns a CapabilityAssessment shaped like
// lib/live-feed/types.ts so the Next.js layer can render the breakdown
// without recomputing anything.
//
// Source of truth for the weight table is the brief from 2026-05-22 on
// branch feat/live-feed-gets-2026-05-22. Tune by editing this file only.
//
// Pure module: no I/O. Caller supplies the assessed_at timestamp and the
// hashes for the Mana Receipt.
// ════════════════════════════════════════════════════════════════════════
import type { ExtractedTender } from "./extractor.ts";

type KeteSlug =
  | "waihanga"
  | "manaaki"
  | "pikau"
  | "arataki"
  | "auaha"
  | "ako"
  | "matauranga"
  | "hoko"
  | "toro";

export interface MatcherSignal {
  label: string;
  points: number;
  evidence?: string;
}

export interface MatcherResult {
  score: number;
  signals: MatcherSignal[];
  kete_relevance: Partial<Record<KeteSlug, number>>;
}

// ── Kete keyword map. Each match per kete contributes +20 (capped per kete). ──
// Multiple keyword hits in the same kete do not stack — one kete, one +20.
const KETE_KEYWORDS: Record<KeteSlug, RegExp> = {
  waihanga: /\b(construction|building|builder|consent(?:ing)?|design|architect|engineer|infrastructure|civil|structural|seismic|earthquake[- ]prone|weathertight|lbp|building code|resource consent)\b/i,
  manaaki: /\b(hospitality|hotel|restaurant|cafe|food (?:safety|control plan|hygiene)|liquor|alcohol licence|alcohol licens|accommodation|tourism)\b/i,
  pikau: /\b(freight|logistic|shipping|customs|import|export|supply chain|warehouse|distribution|broker|haulage|cartage|forwarding)\b/i,
  arataki: /\b(automotive|vehicle|fleet|workshop|wof|cof|dealer|nzta|waka kotahi|motor|garage|panelbeater|panel beater)\b/i,
  auaha: /\b(creative|design (?:agency|firm)|brand(?:ing)?|advertising|marketing|graphic|copywrit|content production|video production)\b/i,
  ako: /\b(early childhood|early learning|ece|kindergarten|preschool|tamariki|childcare|kaiako|te whāriki|te whariki|ratios|ero)\b/i,
  matauranga: /\b(school|secondary|ncea|achievement standard|principal|teacher|moe|ministry of education|education review office)\b/i,
  hoko: /\b(retail|consumer|fair trading|cga|consumer guarantees|ecommerce|marketplace|shop|merchant|cccfa|finance company)\b/i,
  toro: /\b(whānau|whanau|family|parents?|caregivers?|household|home life|kids?|tamariki and parents)\b/i,
};

// Cross-cutting "compliance" keyword (no specific kete, but +20 since it's
// a domain the brief calls out). Also count it as a +0 kete map entry so
// it shows in the UI breakdown.
const COMPLIANCE_RE =
  /\b(compliance|regulatory|regulation|audit(?:able|ing|ed)?|attestation|policy|governance|risk register|notifiable)\b/i;

// LLM/agent language — +25 if anything matches. The label avoids the
// bare "AI" string in the user-visible breakdown per brand canon.
const AGENT_RE =
  /\b(artificial intelligence|machine learning|natural language|large language model|llm|chatbot|conversational|intelligent automation|automation|agent[- ]based|ai[- ]assisted|ai[- ]enabled|generative)\b/i;
// We also accept the bare token "AI" but only as a standalone word (not part
// of "Maine", "trainee", etc.). Kept in a separate regex so we can label the
// signal as "agent / automation language" without ever rendering "AI" alone.
const BARE_AI_RE = /(?:^|[^a-zA-Z])AI(?:[^a-zA-Z]|$)/;

const PRIVACY_RE =
  /\b(privacy act|ipp[- ]?\d{1,2}|ipp 3a|data sovereignty|personal information|breach notification|notifiable privacy breach|opcc|privacy commissioner)\b/i;

const TIKANGA_RE =
  /\b(te tiriti|treaty of waitangi|te aranga|tikanga|mātauranga māori|matauranga maori|mana whenua|iwi|hapū|hapu|whānau-led|whanau-led|kaupapa māori|kaupapa maori|māori data|maori data)\b/i;

const NZ_BUILT_RE =
  /\b(nz[- ]built|nz[- ]based|nz[- ]owned|new zealand vendor|local supplier|domestic supplier|onshore (?:supplier|vendor)|aotearoa[- ]based|made in new zealand)\b/i;

const PILOT_RE =
  /\b(pilot|proof[- ]of[- ]concept|poc|small[- ]scale|trial|prototype|pre[- ]?market|sandbox|discovery phase|feasibility)\b/i;

const NAMED_AGENCY_RE =
  /\b(mbie|ministry of business|innovation and employment|mfe|ministry for the environment|ministry of education|moh|ministry of health|mpi|ministry for primary industries|nzta|waka kotahi|new zealand customs|customs service|worksafe)\b/i;

const BUDGET_THRESHOLD_NZD = 50_000;

/**
 * Score a tender 0..100. Pure: no I/O. Caller supplies extractor output and
 * the full text corpus we should match against (title + summary + any
 * detail-page text).
 */
export function scoreTender(args: {
  tender: ExtractedTender;
  corpus: string;
}): MatcherResult {
  const { tender, corpus } = args;
  const haystack = `${tender.title} ${tender.summary ?? ""} ${corpus}`.toLowerCase();
  const haystackOriginal = `${tender.title} ${tender.summary ?? ""} ${corpus}`;

  const signals: MatcherSignal[] = [];
  const kete_relevance: Partial<Record<KeteSlug, number>> = {};

  // 1) Agent / automation language (+25)
  const agentMatch = haystack.match(AGENT_RE) || haystackOriginal.match(BARE_AI_RE);
  if (agentMatch) {
    signals.push({
      label: "agent or automation language",
      points: 25,
      evidence: typeof agentMatch[0] === "string" ? agentMatch[0].trim() : undefined,
    });
  }

  // 2) Kete domain matches (+20 each, max one per kete)
  for (const [slug, re] of Object.entries(KETE_KEYWORDS) as Array<[KeteSlug, RegExp]>) {
    const m = haystack.match(re);
    if (m) {
      signals.push({
        label: `kete:${slug}`,
        points: 20,
        evidence: m[0].trim(),
      });
      kete_relevance[slug] = 60; // baseline kete relevance for a keyword hit
    }
  }

  // Cross-cutting compliance (+15 — counted under the kete bucket but with
  // its own label so the UI can show it as a separate signal).
  const complianceMatch = haystack.match(COMPLIANCE_RE);
  if (complianceMatch) {
    signals.push({
      label: "compliance / regulatory framing",
      points: 15,
      evidence: complianceMatch[0].trim(),
    });
  }

  // 3) Privacy / IPP / data sovereignty (+15)
  const privacyMatch = haystack.match(PRIVACY_RE);
  if (privacyMatch) {
    signals.push({
      label: "privacy / IPP / data sovereignty",
      points: 15,
      evidence: privacyMatch[0].trim(),
    });
  }

  // 4) Te Tiriti / tikanga (+15)
  const tikangaMatch = haystack.match(TIKANGA_RE);
  if (tikangaMatch) {
    signals.push({
      label: "te Tiriti / tikanga framing",
      points: 15,
      evidence: tikangaMatch[0].trim(),
    });
  }

  // 5) NZ-built / NZ vendor preference (+10)
  const nzMatch = haystack.match(NZ_BUILT_RE);
  if (nzMatch) {
    signals.push({
      label: "NZ-built / local supplier preference",
      points: 10,
      evidence: nzMatch[0].trim(),
    });
  }

  // 6) Pilot / PoC (+10)
  const pilotMatch = haystack.match(PILOT_RE);
  if (pilotMatch) {
    signals.push({
      label: "pilot / proof-of-concept",
      points: 10,
      evidence: pilotMatch[0].trim(),
    });
  }

  // 7) Budget under threshold (+10) — only if we extracted a budget at all.
  if (
    typeof tender.budget_nzd_estimate === "number" &&
    tender.budget_nzd_estimate > 0 &&
    tender.budget_nzd_estimate < BUDGET_THRESHOLD_NZD
  ) {
    signals.push({
      label: "budget under $50k (Pilot Sprint fit)",
      points: 10,
      evidence: `NZ$${tender.budget_nzd_estimate.toLocaleString()}`,
    });
  }

  // 8) Named active agency (+10)
  // Match on the agency field first (more reliable than free text).
  const agencyText = (tender.agency ?? "") + " " + haystack;
  const agencyMatch = agencyText.match(NAMED_AGENCY_RE);
  if (agencyMatch) {
    signals.push({
      label: "active assembl-relevant agency",
      points: 10,
      evidence: agencyMatch[0].trim(),
    });
  }

  const rawScore = signals.reduce((acc, s) => acc + s.points, 0);
  const score = Math.max(0, Math.min(100, rawScore));

  return { score, signals, kete_relevance };
}
