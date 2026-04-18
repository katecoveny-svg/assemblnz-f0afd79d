/**
 * Kete Capability Briefs
 * ----------------------
 * Short, marketing-ready explainers for each of the 7 industry kete + Tōro.
 *
 * Each brief is structured for reuse across:
 *   • Kete landing pages (hero sub-section / "What this kete does")
 *   • Marketing pages, sales decks, proposals
 *   • Social cards, ads, SMS/WhatsApp opt-in messages
 *
 * Voice: evidence-pack-first, plain English, NZ-grounded.
 * Length budget: tagline ≤ 90 chars, oneLiner ≤ 140 chars,
 * capabilities = 4 short verbs, proofPoint ≤ 120 chars.
 */

export interface KeteCapabilityBrief {
  /** Canonical kete id — must match KETE_CONFIG.id */
  id: string;
  /** Display name */
  name: string;
  /** Industry / audience label */
  sector: string;
  /** ≤ 90 char punchy tagline */
  tagline: string;
  /** ≤ 140 char one-liner explaining the kete in plain English */
  oneLiner: string;
  /** 4 capability verbs — what the kete actually does */
  capabilities: string[];
  /** Channels currently live for this kete */
  channels: string[];
  /** Specific NZ regulatory / commercial frame */
  groundedIn: string;
  /** ≤ 120 char proof point — concrete outcome or stat */
  proofPoint: string;
  /** Marketing-ready CTA copy */
  cta: string;
}

export const KETE_CAPABILITY_BRIEFS: KeteCapabilityBrief[] = [
  {
    id: "manaaki",
    name: "Manaaki",
    sector: "Hospitality & Tourism",
    tagline: "Guest care without the paperwork pile-up.",
    oneLiner:
      "Front-of-house, food safety, alcohol licensing and guest follow-up — coordinated by agents who know NZ hospo rules.",
    capabilities: [
      "Booking + dietary + VIP intake",
      "Food Control Plan logging",
      "Sale & Supply Act compliance checks",
      "Post-stay review + reputation loop",
    ],
    channels: ["Web chat", "SMS", "WhatsApp (coming)"],
    groundedIn: "Food Act 2014 · Sale & Supply of Alcohol Act 2012 · MPI FCP templates",
    proofPoint: "Cleaner audit trails. Fewer missed checks. Guests looked after end-to-end.",
    cta: "See Manaaki in action",
  },
  {
    id: "waihanga",
    name: "Waihanga",
    sector: "Construction",
    tagline: "Site safety and consents without the scramble.",
    oneLiner:
      "Schedule risks, H&S inductions, payment claims and consent docs — surfaced earlier and packaged as evidence.",
    capabilities: [
      "Site safety induction packs",
      "CCA 2002 payment claim drafting",
      "Building consent doc review",
      "Subbie + supplier comms",
    ],
    channels: ["Web chat", "SMS", "WhatsApp (coming)"],
    groundedIn: "Building Act 2004 · CCA 2002 · HSWA 2015 · MBIE / WorkSafe guidance",
    proofPoint: "Approvals that don't stall. Audit trails ready before the inspector asks.",
    cta: "See Waihanga in action",
  },
  {
    id: "auaha",
    name: "Auaha",
    sector: "Creative & Media",
    tagline: "A coordinated studio, not six tools and a freelancer.",
    oneLiner:
      "Brand voice, content, design, campaigns and analytics — brief once, ship across every channel on-brand.",
    capabilities: [
      "Brand DNA scan + tone lock",
      "Multi-platform content + creative",
      "Lead-form + funnel build",
      "Performance + brand-safety review",
    ],
    channels: ["Web chat", "SMS (coming)", "WhatsApp (coming)"],
    groundedIn: "FTA 1986 · ASA Codes · Privacy Act 2020 · NZ creative IP norms",
    proofPoint: "Strategy → creative → publish → measure, with one consistent brand voice.",
    cta: "See Auaha in action",
  },
  {
    id: "arataki",
    name: "Arataki",
    sector: "Automotive",
    tagline: "Enquiry → sale → service → loyalty. No handoff dropped.",
    oneLiner:
      "Lead qualification, finance structuring, MVSA compliance, delivery and service follow-up for NZ dealerships.",
    capabilities: [
      "Lead intake + qualification",
      "Finance + insurance deal prep",
      "MVSA + CGA compliance lint",
      "Delivery pack + service rebook",
    ],
    channels: ["Web chat", "SMS (coming)", "WhatsApp (coming)"],
    groundedIn: "Motor Vehicle Sales Act 2003 · CGA 1993 · CCCFA 2003 · MTA / VIA codes",
    proofPoint: "Every customer touchpoint logged. No lost leads, no missed services.",
    cta: "See Arataki in action",
  },
  {
    id: "pikau",
    name: "Pikau",
    sector: "Freight & Customs",
    tagline: "Border compliance without the scramble.",
    oneLiner:
      "HS classification, customs entries, MPI biosecurity checks and dangerous goods — drafted in minutes, evidence-packed.",
    capabilities: [
      "HS code auto-classification",
      "Customs entry + duty calc",
      "MPI biosecurity rule check",
      "DG declaration + freight quote",
    ],
    channels: ["Web chat", "SMS (coming)", "WhatsApp (coming)"],
    groundedIn: "Customs & Excise Act 2018 · Biosecurity Act 1993 · MPI IHS · NZ Tariff",
    proofPoint: "50 minutes of broker work compressed to ~7 — with the evidence trail intact.",
    cta: "See Pikau in action",
  },
  {
    id: "hoko",
    name: "Hoko",
    sector: "Retail",
    tagline: "Compete with Temu and Amazon without losing margin.",
    oneLiner:
      "Pricing intelligence, POS-driven re-orders, FTA/CGA compliance lint and a unified customer view for NZ's $92.3bn retail sector.",
    capabilities: [
      "Pricing scan vs Temu / Amazon",
      "POS-driven re-order suggestions",
      "FTA + CGA compliance lint",
      "Unified customer + loyalty view",
    ],
    channels: ["Web chat", "SMS (coming)", "WhatsApp (coming)"],
    groundedIn: "Fair Trading Act 1986 · Consumer Guarantees Act 1993 · Privacy Act 2020",
    proofPoint: "Margin defended, claims defensible, customers seen across every channel.",
    cta: "See Hoko in action",
  },
  {
    id: "ako",
    name: "Ako",
    sector: "Early Childhood Education",
    tagline: "Built for the 20 April 2026 ECE wedge moment.",
    oneLiner:
      "Licensing criteria matcher, transparency pack generator and graduated enforcement readiness — for NZ ECE centres.",
    capabilities: [
      "Licensing criteria gap report",
      "Whānau transparency pack",
      "Enforcement readiness dashboard",
      "20 Hours ECE + subsidy prep",
    ],
    channels: ["Web chat", "SMS (coming)", "WhatsApp (coming)"],
    groundedIn:
      "Education and Training Act 2020 · ECE Regs 2008 · Te Whāriki · MoE / ERO licensing criteria",
    proofPoint: "Green/amber/red against ~78 criteria, with the top 3 fixes ready to action.",
    cta: "See Ako in action",
  },
  {
    id: "toro",
    name: "Tōro",
    sector: "Whānau Family Navigator",
    tagline: "SMS-first. No app. No login. Just text.",
    oneLiner:
      "School notices, meals, budgets, reminders and learning support for NZ whānau — by text, in plain language.",
    capabilities: [
      "School notice triage + reminders",
      "Weekly meal + budget plan",
      "Homework + learning support",
      "WfF / WINZ entitlement nudges",
    ],
    channels: ["SMS", "WhatsApp"],
    groundedIn: "WfF / WINZ entitlements · NZ school calendar · MoE curriculum touchpoints",
    proofPoint: "Whānau admin handled by text — no app to download, no login to remember.",
    cta: "Text Tōro to get started",
  },
];

/** Lookup helper — accepts canonical id, returns brief or undefined. */
export function getKeteBrief(id: string): KeteCapabilityBrief | undefined {
  return KETE_CAPABILITY_BRIEFS.find((b) => b.id === id);
}
