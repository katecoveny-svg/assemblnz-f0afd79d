/**
 * Per-kete page content. Workflows and comparison rows are kept in data so
 * the [slug] route can render any kete from a single template.
 *
 * Note: per-workflow pricing is intentionally omitted. The locked pricing
 * model (PRICING-LOCKED.md) sells kete by tier (Operator / Leader /
 * Enterprise), not by individual workflow.
 */

import type { KeteSlug } from "./kete";

export type Workflow = {
  name: string;
  description: string;
  compliance: string[];
};

export type ComparisonRow = {
  capability: string;
  assembl: string | true;
  legacy: string | false;
};

export type IndustryKeteDetail = {
  slug: Exclude<KeteSlug, "toroa">;
  heroLead: string;
  heroBody: string;
  workflows: Workflow[];
  comparisonLegacyLabel: string;
  comparison: ComparisonRow[];
  availableOn: string;
};

export type WhanauKeteDetail = {
  slug: "toroa";
  heroLead: string;
  heroBody: string;
  features: { name: string; body: string }[];
  price: { monthly: string; setup: string };
};

export const KETE_DETAIL: Record<
  KeteSlug,
  IndustryKeteDetail | WhanauKeteDetail
> = {
  waihanga: {
    slug: "waihanga",
    heroLead: "Autonomous construction compliance.",
    heroBody:
      "Waihanga handles the paper trail behind every build — quotes, variations, RFIs, producer statements, and PS3/PS4 sign-offs — citing the Building Act and Code as it goes.",
    workflows: [
      {
        name: "Quote & estimate",
        description:
          "Itemised quotes against a live materials price index, with allowances for council fees, BWoF and producer-statement costs surfaced up front.",
        compliance: ["Fair Trading Act 1986", "CCCFA disclosure"],
      },
      {
        name: "Building consent pack",
        description:
          "Generates a complete consent application: PIM, building consent, producer statements, code-compliance evidence — formatted for the relevant TA.",
        compliance: [
          "Building Act 2004 §41",
          "MBIE consent processing standards",
        ],
      },
      {
        name: "Producer statements (PS1–PS4)",
        description:
          "Drafts PS1 / PS3 / PS4 with the right author, scope, and limitations — flags scope-creep and missing peer-review before submission.",
        compliance: ["Engineering NZ practice notes", "LBP scheme"],
      },
      {
        name: "Site safety & SWMS",
        description:
          "Site-specific SWMS, hazard register, and toolbox-talk records, kept current as the build phase changes.",
        compliance: [
          "Health and Safety at Work Act 2015",
          "WorkSafe NZ guidance",
        ],
      },
      {
        name: "Variations & RFIs",
        description:
          "Variation packs with cost, time, and contract impact captured against the original NZS3910/NZS3915 form. RFIs auto-tracked to closure.",
        compliance: ["NZS 3910:2013", "NZS 3915:2005"],
      },
      {
        name: "Subcontractor management",
        description:
          "Insurance, LBP currency, and tax-status checks for every subcontractor — refreshed automatically and surfaced before site induction.",
        compliance: ["LBP scheme", "IRD subcontractor schedular payments"],
      },
      {
        name: "Progress claims & retentions",
        description:
          "CCA-compliant progress claims with payment-schedule reminders. Retentions tracked against the trust-account regime.",
        compliance: [
          "Construction Contracts Act 2002",
          "CCA retentions amendment 2023",
        ],
      },
      {
        name: "Code Compliance Certificate (CCC)",
        description:
          "Bundles the full evidence trail for CCC — producer statements, inspections, BWoF schedule — into one auditor-defensible pack.",
        compliance: ["Building Act 2004 §94", "BWoF compliance schedule"],
      },
    ],
    comparisonLegacyLabel: "Standard PM tools",
    comparison: [
      { capability: "Building Act §41 consent pack drafting", assembl: true, legacy: false },
      { capability: "Producer statement (PS1/PS3/PS4) generation", assembl: true, legacy: false },
      { capability: "NZS 3910 variation forms", assembl: true, legacy: false },
      { capability: "CCA progress-claim compliance", assembl: true, legacy: false },
      { capability: "LBP currency checks", assembl: true, legacy: false },
      { capability: "Site SWMS auto-refresh", assembl: true, legacy: false },
      { capability: "Cost & schedule tracking", assembl: true, legacy: "Yes" },
      { capability: "Document storage", assembl: true, legacy: "Yes" },
      { capability: "Evidence packs with provenance watermark", assembl: true, legacy: false },
      { capability: "NZ data residency", assembl: true, legacy: "Sometimes" },
      { capability: "Cites legislation in outputs", assembl: true, legacy: false },
    ],
    availableOn: "Operator tier and above ($1,490/mo + setup).",
  },

  manaaki: {
    slug: "manaaki",
    heroLead: "Front-of-house, quietly handled.",
    heroBody:
      "Manaaki runs the back-office of hospitality — rosters, food safety, alcohol licensing, supplier contracts — citing the Food Act and the Sale and Supply of Alcohol Act as it works.",
    workflows: [
      {
        name: "Rostering & wage coverage",
        description:
          "Rosters built against forecast covers, minimum-wage and break-rule compliance, plus public holiday entitlements correctly costed into the schedule.",
        compliance: [
          "Holidays Act 2003",
          "Minimum Wage Act 1983",
          "Employment Relations Act 2000",
        ],
      },
      {
        name: "Food Control Plan & verification",
        description:
          "Maintains your registered FCP, daily diary, and corrective actions — packaged into an MPI-ready evidence bundle for verification visits.",
        compliance: [
          "Food Act 2014",
          "MPI registered FCP template",
        ],
      },
      {
        name: "Alcohol licensing & host responsibility",
        description:
          "On/off-licence renewal packs, manager certifications, and host-responsibility logs kept current against your DLC's expectations.",
        compliance: [
          "Sale and Supply of Alcohol Act 2012",
          "DLC reporting standards",
        ],
      },
      {
        name: "Allergens & menu changes",
        description:
          "Every menu change runs an allergen and Plant-Based Beverages Standard check before going live — staff notified, briefing logged.",
        compliance: ["Australia New Zealand Food Standards Code"],
      },
      {
        name: "Supplier & cost-of-goods",
        description:
          "Supplier price drift, cost-of-goods variance, and contract renewal flags — quietly, before the next stocktake surprises you.",
        compliance: ["Fair Trading Act 1986"],
      },
    ],
    comparisonLegacyLabel: "POS + spreadsheets",
    comparison: [
      { capability: "Food Act FCP diary", assembl: true, legacy: false },
      { capability: "Alcohol licensing renewal pack", assembl: true, legacy: false },
      { capability: "Holidays Act-correct rostering", assembl: true, legacy: "Often wrong" },
      { capability: "Allergen check on menu changes", assembl: true, legacy: false },
      { capability: "Supplier cost variance alerts", assembl: true, legacy: false },
      { capability: "Sales reporting", assembl: true, legacy: "Yes" },
      { capability: "Stocktake", assembl: true, legacy: "Yes" },
      { capability: "Evidence packs for MPI verification", assembl: true, legacy: false },
      { capability: "NZ data residency", assembl: true, legacy: "Rarely" },
      { capability: "Cites legislation in outputs", assembl: true, legacy: false },
      { capability: "Te reo Māori in customer-facing copy", assembl: true, legacy: "Manual" },
    ],
    availableOn: "Operator tier and above ($1,490/mo + setup).",
  },

  pikau: {
    slug: "pikau",
    heroLead: "Manifests, customs, and chain of custody.",
    heroBody:
      "Pikau handles the freight paper trail end-to-end — manifests, customs lodgements, MPI declarations, and proof-of-delivery — with a defensible chain of custody from pick-up to release.",
    workflows: [
      {
        name: "Customs lodgement",
        description:
          "Import / export entries lodged via Trade Single Window, with tariff classification reviewed against the Working Tariff Document and prior rulings.",
        compliance: [
          "Customs and Excise Act 2018",
          "NZ Working Tariff Document",
        ],
      },
      {
        name: "MPI biosecurity & IHS",
        description:
          "Biosecurity declarations against the relevant Import Health Standard, with treatment evidence and quarantine status tracked through release.",
        compliance: [
          "Biosecurity Act 1993",
          "MPI Import Health Standards",
        ],
      },
      {
        name: "Manifest & POD",
        description:
          "Consolidated manifests, signed proof-of-delivery, and discrepancy reports captured at scan — auditable per consignment.",
        compliance: ["Maritime Transport Act 1994", "Carriage of Goods Act 1979"],
      },
      {
        name: "Driver hours & RUC",
        description:
          "Logbook hours, work-time compliance, and RUC reconciliation — flagged before they become an infringement.",
        compliance: [
          "Land Transport Act 1998",
          "Road User Charges Act 2012",
        ],
      },
      {
        name: "Dangerous goods",
        description:
          "DG declarations classified against UN numbers, packaging compatibility, and segregation rules — driver placard checks at dispatch.",
        compliance: ["NZS 5433:2012", "Land Transport Rule: Dangerous Goods 2005"],
      },
    ],
    comparisonLegacyLabel: "TMS + email",
    comparison: [
      { capability: "Trade Single Window lodgement", assembl: true, legacy: false },
      { capability: "Working Tariff classification review", assembl: true, legacy: false },
      { capability: "MPI IHS declaration drafting", assembl: true, legacy: false },
      { capability: "Driver hours & RUC reconciliation", assembl: true, legacy: "Manual" },
      { capability: "Dangerous goods declarations", assembl: true, legacy: "Templates only" },
      { capability: "Manifest generation", assembl: true, legacy: "Yes" },
      { capability: "POD capture", assembl: true, legacy: "Yes" },
      { capability: "Chain-of-custody evidence pack", assembl: true, legacy: false },
      { capability: "NZ data residency", assembl: true, legacy: "Sometimes" },
      { capability: "Cites legislation in outputs", assembl: true, legacy: false },
      { capability: "Te reo Māori in customer-facing copy", assembl: true, legacy: false },
    ],
    availableOn: "Operator tier and above ($1,490/mo + setup).",
  },

  arataki: {
    slug: "arataki",
    heroLead: "Fleet compliance, quietly maintained.",
    heroBody:
      "Arataki keeps a fleet legal and documented — WoF/CoF, service records, driver compliance, and accident reporting — with audit-ready evidence the next time NZTA or your insurer asks.",
    workflows: [
      {
        name: "WoF / CoF tracking",
        description:
          "Per-vehicle WoF and CoF schedules, defect histories, and MTBI alerts before a vehicle goes off-road for inspection.",
        compliance: [
          "Land Transport Rule: Vehicle Standards",
          "Land Transport Rule: Heavy-vehicles",
        ],
      },
      {
        name: "Service & maintenance",
        description:
          "OEM service intervals enforced per asset, parts traceability, and warranty-claim packs ready when a fault recurs.",
        compliance: [
          "Health and Safety at Work Act 2015",
          "ACC fleet safety guidance",
        ],
      },
      {
        name: "Driver licensing & endorsements",
        description:
          "Class, P, I, F, V, R, T, W, D endorsements tracked per driver — currency checks before they touch the keys.",
        compliance: ["Land Transport (Driver Licensing) Rule 1999"],
      },
      {
        name: "Accident & incident reporting",
        description:
          "Incident packs that meet WorkSafe notification thresholds and your insurer's evidence requirements — all in one bundle.",
        compliance: [
          "Health and Safety at Work Act 2015",
          "WorkSafe NZ notifiable-event criteria",
        ],
      },
    ],
    comparisonLegacyLabel: "Fleet spreadsheet",
    comparison: [
      { capability: "WoF/CoF expiry forecasting", assembl: true, legacy: "Manual" },
      { capability: "Driver endorsement currency", assembl: true, legacy: "Manual" },
      { capability: "Notifiable-event triage", assembl: true, legacy: false },
      { capability: "Insurance evidence packs", assembl: true, legacy: false },
      { capability: "Defect-history tracking", assembl: true, legacy: "Patchy" },
      { capability: "OEM service interval enforcement", assembl: true, legacy: "Yes" },
      { capability: "Per-asset cost ledger", assembl: true, legacy: "Yes" },
      { capability: "Provenance-watermarked records", assembl: true, legacy: false },
      { capability: "NZ data residency", assembl: true, legacy: "Rarely" },
      { capability: "Cites legislation in outputs", assembl: true, legacy: false },
      { capability: "Te reo Māori in customer-facing copy", assembl: true, legacy: false },
    ],
    availableOn: "Operator tier and above ($1,490/mo + setup).",
  },

  auaha: {
    slug: "auaha",
    heroLead: "Briefs, scripts, brand guardrails.",
    heroBody:
      "Auaha is the creative kete — briefs, scripts, social posts, brand guardrails — with provenance watermarking on every output and tikanga checks before a campaign goes live.",
    workflows: [
      {
        name: "Brief & strategy",
        description:
          "Creative briefs that capture audience, tone, channel, and constraints — with a tikanga check if the campaign references te ao Māori.",
        compliance: ["Fair Trading Act 1986", "ASA Code of Ethics"],
      },
      {
        name: "Scripts & long-form copy",
        description:
          "Drafts scripts, blog posts, and long-form copy in your house voice — provenance watermark on every output, ready to defend if challenged.",
        compliance: ["Copyright Act 1994"],
      },
      {
        name: "Social & paid-media",
        description:
          "Channel-aware variants for Meta, LinkedIn, TikTok — with claims-substantiation check before any product or outcome statement.",
        compliance: ["Fair Trading Act 1986", "Meta / LinkedIn ad policies"],
      },
      {
        name: "Brand & visual guardrails",
        description:
          "Outputs scored against your brand kit — colours, type, tone, photography style — and rejected when they drift.",
        compliance: ["Internal brand guidelines"],
      },
      {
        name: "Tikanga & cultural review",
        description:
          "Optional review pass for campaigns referencing te ao Māori, against your cultural advisor's guidance — flagged early, not at sign-off.",
        compliance: ["Te Tiriti o Waitangi principles"],
      },
    ],
    comparisonLegacyLabel: "Generic AI writers",
    comparison: [
      { capability: "House-voice training", assembl: true, legacy: "Surface-level" },
      { capability: "Provenance watermark on outputs", assembl: true, legacy: false },
      { capability: "Fair Trading claims-substantiation check", assembl: true, legacy: false },
      { capability: "ASA Code review", assembl: true, legacy: false },
      { capability: "Tikanga & cultural review pass", assembl: true, legacy: false },
      { capability: "Brand kit enforcement", assembl: true, legacy: "Manual" },
      { capability: "Multi-channel variants", assembl: true, legacy: "Yes" },
      { capability: "Long-form drafting", assembl: true, legacy: "Yes" },
      { capability: "Evidence pack per campaign", assembl: true, legacy: false },
      { capability: "NZ data residency", assembl: true, legacy: "Rarely" },
      { capability: "Te reo Māori in customer-facing copy", assembl: true, legacy: "Patchy" },
    ],
    availableOn: "Operator tier and above ($1,490/mo + setup).",
  },

  toroa: {
    slug: "toroa",
    heroLead: "A quiet whānau agent for the family.",
    heroBody:
      "Tōroa is an SMS-first agent for households. Routines, school logistics, the running list of things — without another app to open, another login to remember.",
    features: [
      {
        name: "Household routines",
        body: "Morning, after-school, and bedtime routines tracked over SMS — gentle reminders, never nags.",
      },
      {
        name: "School logistics",
        body: "Assembly notes, hot-lunch orders, sports gear, school-trip permission slips — captured and surfaced when they're actually needed.",
      },
      {
        name: "The running list",
        body: "Groceries, repairs, birthday gifts, library books to return — text it in, Tōroa keeps the thread.",
      },
      {
        name: "Kid-safe by default",
        body: "Tōroa replies only to numbers you've added. No public profile, no surfacing of children's data, no upsells inside the conversation.",
      },
      {
        name: "Te reo Māori, optional",
        body: "Switch the voice to te reo Māori, English, or both — set per whānau member.",
      },
      {
        name: "Works on any phone",
        body: "SMS first, so it works on any phone — older phones, school-issue devices, low-data plans.",
      },
    ],
    price: { monthly: "$29", setup: "—" },
  },
};
