// ════════════════════════════════════════════════════════════════════════
// response-template — emits the go/no-go reasoning and a response draft
// for one GETS tender, driven by the capability signals. Pure TS, no LLM.
//
// The brief calls for a "pre-drafted response template" — template implies
// non-bespoke. We bake the structure here and substitute the tender-specific
// matches; a human edits before sending.
// ════════════════════════════════════════════════════════════════════════
import type { ExtractedTender } from "./extractor.ts";
import type { MatcherResult, MatcherSignal } from "./capability-matcher.ts";

const HIGH = 70;
const MEDIUM = 40;

export interface GoNoGoDraft {
  decision: "go" | "no_go" | "tbd";
  reasoning: string;
  drafted_at: string;
}

export interface ResponseDraft {
  body: string;
  drafted_at: string;
  model: string;
}

export function draftGoNoGo(args: {
  tender: ExtractedTender;
  matcher: MatcherResult;
}): GoNoGoDraft {
  const { tender, matcher } = args;
  const now = new Date().toISOString();

  if (matcher.score >= HIGH) {
    const evidence = matcher.signals
      .slice()
      .sort((a, b) => b.points - a.points)
      .slice(0, 4)
      .map((s) => `  - ${s.label} (+${s.points}${s.evidence ? `, "${s.evidence}"` : ""})`)
      .join("\n");
    return {
      decision: "go",
      reasoning: [
        `Capability score ${matcher.score}/100. assembl can credibly respond.`,
        ``,
        `Strongest signals:`,
        evidence,
        ``,
        tender.close_at ? `Close: ${tender.close_at}.` : `Close date not extracted from RSS — verify on detail page.`,
        tender.agency ? `Agency: ${tender.agency}.` : `Agency not extracted — verify on detail page.`,
      ].join("\n"),
      drafted_at: now,
    };
  }

  if (matcher.score >= MEDIUM) {
    return {
      decision: "tbd",
      reasoning: [
        `Capability score ${matcher.score}/100. Partial match — review before deciding.`,
        ``,
        `Signals present: ${matcher.signals.map((s) => s.label).join(", ") || "none"}.`,
        ``,
        `Most likely reason to bid: at least one kete domain matches.`,
        `Most likely reason to pass: missing agent/automation framing or assembl-relevant agency.`,
      ].join("\n"),
      drafted_at: now,
    };
  }

  return {
    decision: "no_go",
    reasoning: `Capability score ${matcher.score}/100, below the medium threshold (${MEDIUM}). Logged for reference; no further action recommended.`,
    drafted_at: now,
  };
}

const RESPONSE_HEADER = (tender: ExtractedTender) => `
RE: ${tender.ref_number ? `${tender.ref_number} — ` : ""}${tender.title}
${tender.agency ? `To: ${tender.agency}` : ""}

Tēnā koe,

Thank you for the opportunity to respond to ${tender.ref_number ?? "this notice"}. assembl is an Aotearoa-built compliance-and-evidence platform serving NZ businesses and government across nine industry kete (Construction, Hospitality, Logistics, Automotive, Creative, Education, Knowledge, Commerce, Family).
`.trim();

const RESPONSE_FOOTER = `
Every response assembl generates is backed by a Mana Receipt — a cryptographically-signable attestation showing the inputs, the outputs, the citations used, and the four pou (Rangatiratanga, Kaitiakitanga, Manaakitanga, Whanaungatanga) checked. Verifiable at https://assembl.co.nz/verify.

We watch GETS in real time, ingest the NZ Gazette, and track Privacy Commissioner enforcement weekly. Our compliance recommendations are not claims — they cite live regulatory data.

Ngā mihi,

Kate Hudson
Founder, assembl
kate@assembl.co.nz
`.trim();

function paragraphForSignal(signal: MatcherSignal): string | null {
  switch (signal.label) {
    case "agent or automation language":
      return `assembl's nine industry kete are agent fleets — Iho routes a request through the right specialist (compliance, evidence, drafting), each backed by versioned prompts and live regulatory feeds. Today there are 42 named agents across the kete.`;
    case "compliance / regulatory framing":
      return `Compliance is the spine of assembl. Every output cites the regulation that backs it (Privacy Act IPP refs, Building Code clauses, HSWA sections, CGA, CCCFA), with the full evidence trail exported to the auditor on demand.`;
    case "privacy / IPP / data sovereignty":
      return `assembl is built for the Privacy Act 2020, including IPP 3A effective 1 May 2026. PII is redacted before any cross-border model call; data stays in NZ where customers require it.`;
    case "te Tiriti / tikanga framing":
      return `assembl runs a Tikanga Compliance layer (Rangatiratanga, Kaitiakitanga, Manaakitanga, Whanaungatanga) on every output. We work with Te Hiku Media on te reo Māori support and respect Māori data sovereignty as a hard constraint, not a feature.`;
    case "NZ-built / local supplier preference":
      return `assembl is built and operated in Aotearoa, by Kate Hudson and a team in Auckland. We are on the Registered Business Programme and qualify for All-of-Government domestic-supplier preferences.`;
    case "pilot / proof-of-concept":
      return `assembl runs Pilot Sprints — a fixed-scope, fixed-price engagement (usually under NZ$50k) that delivers a working compliance agent for one industry kete inside four weeks, with the Mana Receipt verifier turned on from day one.`;
    case "budget under $50k (Pilot Sprint fit)":
      return `Budget fits assembl's Pilot Sprint envelope (under NZ$50k) — fixed scope, four-week delivery, Mana Receipts on from day one.`;
    case "active assembl-relevant agency":
      return `assembl already tracks ${signal.evidence ?? "this agency's"} regulatory feed weekly through our Live Feed pipeline (GETS, NZ Gazette, Privacy Commissioner enforcement) — we ingest the source, not the summary.`;
    default:
      // kete:* signals
      if (signal.label.startsWith("kete:")) {
        const slug = signal.label.split(":")[1];
        return `assembl ships an active ${slug} kete with named agents covering the regulatory and operational shape of this industry — see https://assembl.co.nz/kete/${slug} for the agent roster.`;
      }
      return null;
  }
}

export function draftResponse(args: {
  tender: ExtractedTender;
  matcher: MatcherResult;
}): ResponseDraft | null {
  const { tender, matcher } = args;
  if (matcher.score < HIGH) return null;

  const paragraphs: string[] = [];
  const seen = new Set<string>();
  for (const sig of matcher.signals.slice().sort((a, b) => b.points - a.points)) {
    const p = paragraphForSignal(sig);
    if (p && !seen.has(p)) {
      paragraphs.push(p);
      seen.add(p);
    }
    if (paragraphs.length >= 4) break; // keep the response template tight
  }

  const body = [
    RESPONSE_HEADER(tender),
    "",
    "Why assembl is a credible respondent here:",
    "",
    ...paragraphs.map((p) => `· ${p}`),
    "",
    "What we'd propose:",
    "",
    `· A four-week Pilot Sprint scoped to the ${tender.ref_number ?? "tender"} requirements.`,
    `· Mana Receipts turned on for every output, with the verifier link published alongside the deliverable.`,
    `· A weekly readout of the live regulatory feeds backing the work, so your team sees the citations as they update.`,
    "",
    RESPONSE_FOOTER,
  ].join("\n");

  return {
    body,
    drafted_at: new Date().toISOString(),
    model: "template:response-v1",
  };
}
