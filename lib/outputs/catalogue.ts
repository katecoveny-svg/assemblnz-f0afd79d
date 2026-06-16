/**
 * The output catalogue — every named thing assembl produces, kete by kete.
 *
 * A prospect lands on /outputs, scans named outputs, recognises one that maps
 * to their job, and clicks through. This is the missing conversion page between
 * "interested" and "signed up".
 *
 * Source of truth: every entry here maps to a real workflow on a live kete page
 * (lib/kete-detail.ts → typicalWorkflows / workflows) or to a live HAPAI tool
 * (lib/hapai/shareable-tools.ts). We do NOT invent outputs. If a kete looks
 * thin, that is a real gap to flag — not a prompt to fabricate.
 *
 * Voice rules (locked 2026-06-16):
 *  1. Lead every pack description with plain English — "a downloadable bundle of
 *     PDFs…". "Mana Receipt" only appears as second-reference depth.
 *  2. Founder is Kate Hudson.
 *  3. Zero mana whenua relationship claims. Cultural-review outputs describe HOW
 *     we build (tikanga values in the prompt), never WHO endorses us.
 *  4. AI / agent / agentic all fine on first reference.
 */

import type { KeteSlug } from '@/lib/kete';

/** A kete slug, or the cross-cutting group for platform-wide outputs. */
export type OutputGroup = KeteSlug | 'cross-cutting';

/**
 * The shape of the deliverable. Drives the "output type" filter and the badge
 * on each card. Kept deliberately small so a prospect can reason about it.
 */
export type OutputType =
  | 'Draft'
  | 'Redline'
  | 'Evidence pack'
  | 'Decision memo'
  | 'Log/record'
  | 'Brief/summary'
  | 'Calculation'
  | 'Compliance check';

/** Where the output can land. Drives the channel filter + the channel matrix. */
export type OutputChannel =
  | 'Web'
  | 'Email'
  | 'PDF'
  | 'Word'
  | 'Voice'
  | 'SMS'
  | 'WhatsApp';

export type OutputDefinition = {
  /** Unique URL slug — /outputs/[slug]. Stable; good for direct-share + SEO. */
  slug: string;
  /** Output name, NZ English, lowercase brand. */
  name: string;
  /** One-line description. Leads with plain-English evidence-pack framing. */
  oneLiner: string;
  /** The kete (or cross-cutting group) this output belongs to. */
  group: OutputGroup;
  /** The kete pack or HAPAI tool that produces it (human-readable). */
  producedBy: string;
  type: OutputType;
  /** Legislation / frameworks cited in the output, if any. */
  frameworks: string[];
  channels: OutputChannel[];
  /** Two-or-three sentence description for the detail page. */
  description: string;
  /** Honest "what's in the pack" preview — used in place of a fabricated sample. */
  whatsInside: string[];
  /**
   * If this output is backed by a live tool a prospect can run right now, the
   * tool path. Drives a "Run this output" CTA. Otherwise the CTA routes to the
   * Pilot Sprint form.
   */
  toolHref?: string;
};

/** Display metadata for each group, including the kete accent for theming. */
export const OUTPUT_GROUPS: Record<
  OutputGroup,
  { label: string; sublabel: string; accent: string }
> = {
  waihanga: { label: 'Waihanga', sublabel: 'Construction', accent: '#2B6B57' },
  manaaki: { label: 'Manaaki', sublabel: 'Hospitality', accent: '#AC5838' },
  pikau: { label: 'Pīkau', sublabel: 'Freight & customs', accent: '#255F94' },
  arataki: { label: 'Arataki', sublabel: 'Automotive & fleet', accent: '#8F4F13' },
  auaha: { label: 'Auaha', sublabel: 'Creative', accent: '#5B4FA0' },
  ako: { label: 'Ako', sublabel: 'Early childhood education', accent: '#6B5843' },
  matauranga: { label: 'Mātauranga', sublabel: 'Secondary education', accent: '#3D5A7A' },
  hoko: { label: 'Hoko', sublabel: 'Retail & commerce', accent: '#7B3F8F' },
  toro: { label: 'Tōro', sublabel: 'Whānau', accent: '#23211F' },
  'cross-cutting': { label: 'Cross-cutting', sublabel: 'Every kete', accent: '#2B6B57' },
};

/** Canonical group order for the page. */
export const GROUP_ORDER: OutputGroup[] = [
  'waihanga',
  'manaaki',
  'pikau',
  'arataki',
  'auaha',
  'ako',
  'matauranga',
  'hoko',
  'toro',
  'cross-cutting',
];

export const OUTPUTS: OutputDefinition[] = [
  // ── Waihanga · Construction ────────────────────────────────────────────────
  {
    slug: 'building-consent-precheck-pack',
    name: 'Building consent precheck pack',
    oneLiner:
      'A council-ready bundle of PDFs — the s 14B application with every Acceptable Solution cited inline, so the BCA accepts it the first time.',
    group: 'waihanga',
    producedBy: 'Waihanga — Construction pack',
    type: 'Evidence pack',
    frameworks: ['Building Act 2004 s 14B', 'Building Code 2025 + Acceptable Solutions'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'A complete consent application drafted alongside your designer: PIM, building consent, producer statements, and code-compliance evidence — formatted for the relevant territorial authority. Every paragraph stands on a clause a reviewer can check, and an auditor can check the same trail months later.',
    whatsInside: [
      'Section 14B application form, pre-filled',
      'Acceptable Solutions cited inline against each clause',
      'Producer-statement scope summary',
      'Code-compliance evidence index',
      'Provenance trail (sources, decisions, timestamps)',
    ],
  },
  {
    slug: 'producer-statement-draft',
    name: 'Producer statement draft (PS1/PS3/PS4)',
    oneLiner:
      'A drafted producer statement with the right author, scope, and limitations — scope-creep and missing peer-review flagged before you submit.',
    group: 'waihanga',
    producedBy: 'Waihanga — Construction pack',
    type: 'Draft',
    frameworks: ['Engineering NZ practice notes (PS1–PS4)', 'LBP scheme'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'Drafts PS1 / PS3 / PS4 with the correct author, scope, and limitations. The agent flags scope-creep and missing peer-review before the statement leaves your office, so the BCA sees a clean document.',
    whatsInside: [
      'Author and scope block, drafted',
      'Limitations stated explicitly',
      'Scope-creep flags surfaced for review',
      'Peer-review checklist',
    ],
  },
  {
    slug: 'variation-pack',
    name: 'Variation pack',
    oneLiner:
      'A downloadable record of a variation captured against the original NZS 3910 form — cost, time, and contract impact in one trail.',
    group: 'waihanga',
    producedBy: 'Waihanga — Construction pack',
    type: 'Evidence pack',
    frameworks: ['Construction Contracts Act 2002', 'NZS 3910:2013', 'NZS 3915:2005'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'Variation packs with cost, time, and contract impact captured against the original NZS 3910 / NZS 3915 form. The evidence trail holds up if the variation is ever disputed.',
    whatsInside: [
      'Variation captured against the original contract form',
      'Cost and programme impact',
      'Contract-clause references',
      'Approval and sign-off trail',
    ],
  },
  {
    slug: 'rfi-response-draft',
    name: 'RFI response draft',
    oneLiner:
      'A drafted reply to a request for information, auto-tracked to closure so nothing stalls the build.',
    group: 'waihanga',
    producedBy: 'Waihanga — Construction pack',
    type: 'Draft',
    frameworks: ['Construction Contracts Act 2002', 'NZS 3910:2013'],
    channels: ['Web', 'Email', 'PDF'],
    description:
      'RFIs drafted and auto-tracked from raised to closed, with the contract context attached. The register shows exactly which RFIs are open and who owns each one.',
    whatsInside: [
      'Drafted RFI response',
      'Linked contract / drawing references',
      'Open / closed status tracking',
      'Owner and due-date register',
    ],
  },
  {
    slug: 'site-swms-hazard-register',
    name: 'Site-specific SWMS + hazard register',
    oneLiner:
      'A site-specific safe work method statement and hazard register, kept current as the build phase changes.',
    group: 'waihanga',
    producedBy: 'Waihanga — Construction pack',
    type: 'Log/record',
    frameworks: ['Health and Safety at Work Act 2015', 'WorkSafe NZ guidance'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'A site-specific SWMS and hazard register that refreshes as the build phase changes — not a generic template filed once and forgotten. The record is ready for a WorkSafe inspector.',
    whatsInside: [
      'Site-specific method statement',
      'Hazard register with controls',
      'Phase-by-phase refresh',
      'HSWA 2015 clause references',
    ],
  },
  {
    slug: 'toolbox-talk-record',
    name: 'Toolbox talk evidence record',
    oneLiner:
      'A dated record of toolbox talks and inductions — the attendance proof a WorkSafe inspector asks for.',
    group: 'waihanga',
    producedBy: 'Waihanga — Construction pack',
    type: 'Log/record',
    frameworks: ['Health and Safety at Work Act 2015'],
    channels: ['Web', 'PDF'],
    description:
      'Toolbox-talk and induction records kept current and dated, so the attendance proof exists before anyone asks for it.',
    whatsInside: [
      'Talk topic and date',
      'Attendance record',
      'Induction sign-off',
      'Linked hazards covered',
    ],
  },
  {
    slug: 'code-compliance-certificate-bundle',
    name: 'Code Compliance Certificate bundle',
    oneLiner:
      'A downloadable, auditor-defensible bundle of PDFs — producer statements, inspections, and the BWoF schedule — that ends in a CCC.',
    group: 'waihanga',
    producedBy: 'Waihanga — Construction pack',
    type: 'Evidence pack',
    frameworks: ['Building Act 2004 s 94', 'BWoF compliance schedule'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'Bundles the full evidence trail for a Code Compliance Certificate — producer statements, inspections, and BWoF schedule — into one auditor-defensible pack you can hand the council.',
    whatsInside: [
      'Producer-statement index',
      'Inspection records',
      'BWoF compliance schedule',
      'Section 94 evidence summary',
    ],
  },
  {
    slug: 'quote-and-estimate',
    name: 'Quote and estimate',
    oneLiner:
      'An itemised quote against a live materials price index, with council fees and producer-statement costs surfaced up front.',
    group: 'waihanga',
    producedBy: 'Waihanga — Construction pack',
    type: 'Draft',
    frameworks: ['Fair Trading Act 1986', 'CCCFA disclosure'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'Itemised quotes against a live materials price index, with allowances for council fees, BWoF, and producer-statement costs surfaced up front so the client sees the real number.',
    whatsInside: [
      'Itemised materials and labour',
      'Council fee and BWoF allowances',
      'Producer-statement cost line',
      'Fair Trading-clean disclosure',
    ],
  },
  {
    slug: 'payment-claim-cca',
    name: 'Payment claim under the CCA',
    oneLiner:
      'A drafted progress payment claim that meets the Construction Contracts Act service requirements.',
    group: 'waihanga',
    producedBy: 'Waihanga — Construction pack',
    type: 'Draft',
    frameworks: ['Construction Contracts Act 2002'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'A progress payment claim drafted to the CCA service requirements, with the supporting detail attached so a payment schedule can be checked against it.',
    whatsInside: [
      'Payment claim, drafted to CCA form',
      'Supporting progress detail',
      'Due-date calculation',
      'Service-requirement checklist',
    ],
  },

  // ── Manaaki · Hospitality ──────────────────────────────────────────────────
  {
    slug: 'food-control-plan-verification-pack',
    name: 'Food Control Plan verification pack',
    oneLiner:
      'A downloadable, MPI-ready bundle — your registered FCP, the daily diary, and corrective actions — packaged for a verification visit.',
    group: 'manaaki',
    producedBy: 'Manaaki — Hospitality pack',
    type: 'Evidence pack',
    frameworks: ['Food Act 2014', 'MPI registered FCP template'],
    channels: ['Web', 'PDF'],
    description:
      'Maintains your registered Food Control Plan, daily diary, and corrective actions — packaged into an MPI-ready evidence bundle for verification visits. Your manager spends an hour reviewing instead of a week reconstructing.',
    whatsInside: [
      'Registered FCP, current',
      'Daily diary entries',
      'Corrective actions log',
      'Verification-ready index',
    ],
  },
  {
    slug: 'food-temperature-log',
    name: 'Food temperature log',
    oneLiner:
      'Daily fridge, freezer, hot-hold, cooking, and cleaning checks — walk away with a Food Act 2014 record.',
    group: 'manaaki',
    producedBy: 'HAPAI — Food temperature log',
    type: 'Log/record',
    frameworks: ['Food Act 2014'],
    channels: ['Web', 'PDF'],
    description:
      'A live HAPAI tool: log the day’s fridge, freezer, hot-hold, cooking, and cleaning checks and walk away with a Food Act 2014 record. The food business operator remains responsible for verification.',
    whatsInside: [
      'Fridge / freezer temperature checks',
      'Hot-hold and cooking checks',
      'Cleaning record',
      'Date-stamped daily log',
    ],
    toolHref: '/hapai/food-temp-log',
  },
  {
    slug: 'on-licence-renewal-pack',
    name: 'On-licence renewal pack',
    oneLiner:
      'A downloadable DLC-ready bundle for an on- or off-licence renewal, kept current against your DLC’s expectations.',
    group: 'manaaki',
    producedBy: 'Manaaki — Hospitality pack',
    type: 'Evidence pack',
    frameworks: ['Sale and Supply of Alcohol Act 2012', 'DLC reporting standards'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'On- and off-licence renewal packs assembled against your District Licensing Committee’s expectations, with the supporting evidence attached so the renewal moves without a back-and-forth.',
    whatsInside: [
      'Renewal application detail',
      'Host-responsibility evidence',
      'Manager certificate status',
      'DLC-ready cover summary',
    ],
  },
  {
    slug: 'manager-certificate-renewal-pack',
    name: 'Manager certificate renewal pack',
    oneLiner:
      'A renewal pack for a duty manager’s certificate, with the currency evidence the DLC expects.',
    group: 'manaaki',
    producedBy: 'Manaaki — Hospitality pack',
    type: 'Evidence pack',
    frameworks: ['Sale and Supply of Alcohol Act 2012'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'Assembles a manager certificate renewal with the currency and host-responsibility evidence the DLC asks for, so a certificate never lapses unnoticed.',
    whatsInside: [
      'Certificate renewal detail',
      'Currency evidence',
      'Host-responsibility record',
      'Expiry tracking',
    ],
  },
  {
    slug: 'host-responsibility-log',
    name: 'Host responsibility log',
    oneLiner:
      'A dated host-responsibility log kept current against your DLC expectations.',
    group: 'manaaki',
    producedBy: 'Manaaki — Hospitality pack',
    type: 'Log/record',
    frameworks: ['Sale and Supply of Alcohol Act 2012'],
    channels: ['Web', 'PDF'],
    description:
      'A host-responsibility log that stays current, so the record exists before a DLC reporting requirement or an incident asks for it.',
    whatsInside: [
      'Host-responsibility entries',
      'Incident notes',
      'Date-stamped trail',
      'DLC-reporting alignment',
    ],
  },
  {
    slug: 'allergen-check',
    name: 'Allergen check on menu changes',
    oneLiner:
      'A compliance pass over a menu change that flags the allergens before the dish reaches a guest.',
    group: 'manaaki',
    producedBy: 'Manaaki — Hospitality pack',
    type: 'Compliance check',
    frameworks: ['Food Act 2014'],
    channels: ['Web', 'PDF'],
    description:
      'Runs an allergen review when the menu changes and surfaces the declarations a kitchen needs to make, so a new dish does not ship without its allergen check.',
    whatsInside: [
      'Allergen declarations per dish',
      'Menu-change diff',
      'Cross-contact flags',
      'Front-of-house summary',
    ],
  },
  {
    slug: 'holidays-act-roster',
    name: 'Holidays Act-correct roster',
    oneLiner:
      'A roster built against forecast covers with minimum-wage, break-rule, and public-holiday entitlements correctly costed.',
    group: 'manaaki',
    producedBy: 'Manaaki — Hospitality pack',
    type: 'Calculation',
    frameworks: ['Holidays Act 2003', 'Minimum Wage Act 1983', 'Employment Relations Act 2000'],
    channels: ['Web', 'PDF'],
    description:
      'Rosters built against forecast covers, with minimum-wage and break-rule compliance plus public-holiday entitlements correctly costed — the calculation most POS-and-spreadsheet setups get wrong.',
    whatsInside: [
      'Roster against forecast covers',
      'Break-rule compliance',
      'Public-holiday entitlement costing',
      'Minimum-wage check',
    ],
  },
  {
    slug: 'guest-privacy-complaint-response',
    name: 'Guest privacy + complaint response',
    oneLiner:
      'A drafted reply to a guest complaint or data request that honours the Privacy Act 2020 by default.',
    group: 'manaaki',
    producedBy: 'Manaaki — Hospitality pack',
    type: 'Draft',
    frameworks: ['Privacy Act 2020 (IPP 3A)'],
    channels: ['Web', 'Email'],
    description:
      'Drafts the reply to a guest complaint or data request with the privacy obligations handled — guest data stays inside your tenant, and the response is reviewable before it goes out.',
    whatsInside: [
      'Drafted complaint response',
      'Privacy-obligation handling',
      'Escalation notes',
      'Record of the exchange',
    ],
  },

  // ── Pīkau · Freight & customs ──────────────────────────────────────────────
  {
    slug: 'customs-entry-draft',
    name: 'Customs entry draft',
    oneLiner:
      'Paste a commercial invoice; get back a structured customs entry draft your broker can check and file. Nothing is ever lodged.',
    group: 'pikau',
    producedBy: 'HAPAI — Customs entry drafter',
    type: 'Draft',
    frameworks: ['Customs and Excise Act 2018', 'NZ Working Tariff Document'],
    channels: ['Web', 'PDF'],
    description:
      'A live HAPAI tool: paste a commercial invoice and get a structured customs entry draft. It structures your invoice into entry fields, never invents an HS code, and never lodges to Trade Single Window — your broker confirms classification and files.',
    whatsInside: [
      'Structured entry fields from your invoice',
      'Line-by-line value breakdown',
      'Classification prompts (broker confirms)',
      'Audit-ready draft record',
    ],
    toolHref: '/hapai/customs-entry',
  },
  {
    slug: 'tariff-classification-justification',
    name: 'Tariff classification justification',
    oneLiner:
      'A decision memo justifying an HS classification against the Working Tariff Document and prior rulings.',
    group: 'pikau',
    producedBy: 'Pīkau — Freight & customs pack',
    type: 'Decision memo',
    frameworks: ['NZ Working Tariff Document + WCO HS', 'Customs and Excise Act 2018'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'Reviews tariff classification against the Working Tariff Document and prior rulings and writes up the reasoning, so a broker or an auditor can see why a line sits where it does. Reclassification rework drops to zero on the lines assembl runs.',
    whatsInside: [
      'Proposed HS code with reasoning',
      'Working Tariff Document references',
      'Prior-ruling comparison',
      'Duty assessment',
    ],
  },
  {
    slug: 'biosecurity-ihs-declaration-pack',
    name: 'Biosecurity (IHS) declaration pack',
    oneLiner:
      'A downloadable declaration against the relevant Import Health Standard, with treatment evidence tracked through release.',
    group: 'pikau',
    producedBy: 'Pīkau — Freight & customs pack',
    type: 'Evidence pack',
    frameworks: ['Biosecurity Act 1993', 'MPI Import Health Standards'],
    channels: ['Web', 'PDF'],
    description:
      'Biosecurity declarations drafted against the relevant Import Health Standard, with treatment evidence and quarantine status tracked through to release.',
    whatsInside: [
      'IHS declaration draft',
      'Treatment evidence',
      'Quarantine status tracking',
      'Release record',
    ],
  },
  {
    slug: 'dangerous-goods-documentation',
    name: 'Dangerous goods documentation',
    oneLiner:
      'A DG declaration classified against UN numbers, packaging compatibility, and segregation rules — with placard checks at dispatch.',
    group: 'pikau',
    producedBy: 'Pīkau — Freight & customs pack',
    type: 'Compliance check',
    frameworks: ['NZS 5433:2012', 'Land Transport Rule: Dangerous Goods 2005'],
    channels: ['Web', 'PDF'],
    description:
      'Dangerous-goods declarations classified against UN numbers, packaging compatibility, and segregation rules, with driver placard checks at dispatch.',
    whatsInside: [
      'UN-number classification',
      'Packaging compatibility check',
      'Segregation rules',
      'Driver placard checklist',
    ],
  },
  {
    slug: 'chain-of-custody-evidence-pack',
    name: 'Chain-of-custody evidence pack',
    oneLiner:
      'A downloadable record of the goods’ journey from origin to release — the trail your broker and auditor both want.',
    group: 'pikau',
    producedBy: 'Pīkau — Freight & customs pack',
    type: 'Evidence pack',
    frameworks: ['Customs and Excise Act 2018'],
    channels: ['Web', 'PDF'],
    description:
      'A chain-of-custody record from origin to release, assembled as one bundle. Brokers see the working they expect; auditors see the same trail months later.',
    whatsInside: [
      'Origin-to-release timeline',
      'Handover records',
      'Linked entry and IHS docs',
      'Provenance trail',
    ],
  },
  {
    slug: 'manifest-pod-bundle',
    name: 'Manifest + POD bundle',
    oneLiner:
      'A bundled manifest and proof-of-delivery record for a consignment, ready to file or forward.',
    group: 'pikau',
    producedBy: 'Pīkau — Freight & customs pack',
    type: 'Log/record',
    frameworks: ['Customs and Excise Act 2018'],
    channels: ['Web', 'PDF', 'Email'],
    description:
      'Bundles the manifest and proof-of-delivery capture for a consignment into one record, so the freight documentation is in one place when a query lands.',
    whatsInside: [
      'Consignment manifest',
      'Proof-of-delivery capture',
      'Linked entry reference',
      'Filing-ready bundle',
    ],
  },

  // ── Arataki · Automotive & fleet ───────────────────────────────────────────
  {
    slug: 'wof-cof-compliance-schedule',
    name: 'WoF / CoF compliance schedule',
    oneLiner:
      'A per-vehicle WoF and CoF schedule with defect history and alerts before a vehicle goes off-road for inspection.',
    group: 'arataki',
    producedBy: 'Arataki — Automotive & fleet pack',
    type: 'Log/record',
    frameworks: ['Land Transport Rule: Vehicle Standards', 'Land Transport Act 1998'],
    channels: ['Web', 'PDF'],
    description:
      'Per-vehicle WoF and CoF schedules, defect histories, and alerts before a vehicle is due — so an inspection never sneaks up and takes an asset off the road unplanned.',
    whatsInside: [
      'Per-vehicle WoF / CoF dates',
      'Defect history',
      'Expiry forecasting',
      'Off-road planning alerts',
    ],
  },
  {
    slug: 'driver-endorsement-currency-check',
    name: 'Driver endorsement currency check',
    oneLiner:
      'A compliance check on each driver’s class and endorsements before they touch the keys.',
    group: 'arataki',
    producedBy: 'Arataki — Automotive & fleet pack',
    type: 'Compliance check',
    frameworks: ['Land Transport (Driver Licensing) Rule 1999'],
    channels: ['Web', 'PDF'],
    description:
      'Class, P, I, F, V, R, T, W, and D endorsements tracked per driver, with currency checks before they get behind the wheel.',
    whatsInside: [
      'Per-driver endorsement register',
      'Currency status',
      'Expiry alerts',
      'Exception list',
    ],
  },
  {
    slug: 'notifiable-event-worksafe-pack',
    name: 'Notifiable-event triage + WorkSafe pack',
    oneLiner:
      'A downloadable incident pack that meets WorkSafe notification thresholds and your insurer’s evidence requirements.',
    group: 'arataki',
    producedBy: 'Arataki — Automotive & fleet pack',
    type: 'Evidence pack',
    frameworks: ['Health and Safety at Work Act 2015', 'WorkSafe NZ notifiable-event criteria'],
    channels: ['Web', 'PDF'],
    description:
      'Triages an incident against WorkSafe notification thresholds and bundles the evidence your insurer wants — all in one pack, drafted for a named reviewer.',
    whatsInside: [
      'Notifiability triage',
      'Incident timeline',
      'Insurer evidence bundle',
      'Action and follow-up record',
    ],
  },
  {
    slug: 'insurance-evidence-bundle',
    name: 'Insurance evidence bundle',
    oneLiner:
      'A downloadable bundle of the maintenance, inspection, and incident evidence an insurer asks for on a claim.',
    group: 'arataki',
    producedBy: 'Arataki — Automotive & fleet pack',
    type: 'Evidence pack',
    frameworks: ['Land Transport Act 1998'],
    channels: ['Web', 'PDF'],
    description:
      'Assembles the maintenance, inspection, and incident records an insurer requests on a claim into one bundle, so a claim is not held up waiting for paperwork.',
    whatsInside: [
      'Maintenance history',
      'Inspection records',
      'Incident evidence',
      'Per-asset cost ledger',
    ],
  },
  {
    slug: 'workshop-hs-plan',
    name: 'Workshop H&S plan',
    oneLiner:
      'A workshop health-and-safety plan and equipment register, kept current under HSWA 2015.',
    group: 'arataki',
    producedBy: 'Arataki — Automotive & fleet pack',
    type: 'Log/record',
    frameworks: ['Health and Safety at Work Act 2015'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'A workshop H&S plan and equipment register that refreshes as the shop changes, with the HSWA clauses cited so an inspector sees a current document.',
    whatsInside: [
      'Workshop H&S plan',
      'Equipment register',
      'Hazard controls',
      'Review schedule',
    ],
  },
  {
    slug: 'dealer-consumer-guarantees-pack',
    name: 'Dealer Consumer Guarantees pack',
    oneLiner:
      'A downloadable, Disputes-Tribunal-defensible record of a CGA remedy assessment for a vehicle sale.',
    group: 'arataki',
    producedBy: 'Arataki — Automotive & fleet pack',
    type: 'Evidence pack',
    frameworks: ['Consumer Guarantees Act 1993', 'Motor Vehicle Sales Act 2003'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'A CGA remedy assessment and customer-comms pack for a vehicle sale, drafted with the Act and section cited so the record holds up under Disputes Tribunal scrutiny.',
    whatsInside: [
      'CGA remedy assessment',
      'Customer-comms draft',
      'Act / section citations',
      'Dispute-ready record',
    ],
  },

  // ── Auaha · Creative ───────────────────────────────────────────────────────
  {
    slug: 'creative-brief',
    name: 'Creative brief',
    oneLiner:
      'A brief that captures audience, tone, channel, and constraints — turn a few notes into something a team can build from.',
    group: 'auaha',
    producedBy: 'HAPAI — Brief generator',
    type: 'Brief/summary',
    frameworks: ['Fair Trading Act 1986', 'ASA Code of Ethics'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'A live HAPAI tool: turn a few notes into a creative, pitch, or project brief that captures audience, tone, channel, and constraints. The owner signs off scope, budget, and deadlines.',
    whatsInside: [
      'Audience and objective',
      'Tone and channel',
      'Constraints and must-haves',
      'Scope and deadline placeholders',
    ],
    toolHref: '/hapai/brief-generator',
  },
  {
    slug: 'claims-substantiation-pass',
    name: 'Fair Trading claims substantiation pass',
    oneLiner:
      'A compliance pass over a campaign’s claims against the Fair Trading Act before anything goes live.',
    group: 'auaha',
    producedBy: 'Auaha — Creative pack',
    type: 'Compliance check',
    frameworks: ['Fair Trading Act 1986', 'ASA Code of Ethics'],
    channels: ['Web', 'PDF'],
    description:
      'Reviews every product, price, and outcome claim in a campaign against the Fair Trading Act and the ASA Code, flagging what needs substantiation before launch — the step that usually bottlenecks at legal review.',
    whatsInside: [
      'Claim-by-claim review',
      'Substantiation requirements',
      'Fair Trading / ASA flags',
      'Sign-off summary',
    ],
  },
  {
    slug: 'asa-ad-copy-review',
    name: 'ASA-ready ad copy review',
    oneLiner:
      'A review of ad copy against the ASA Codes, so the creative clears before media spend commits.',
    group: 'auaha',
    producedBy: 'Auaha — Creative pack',
    type: 'Compliance check',
    frameworks: ['ASA Code of Ethics', 'ASA Children & Young People Code'],
    channels: ['Web', 'PDF'],
    description:
      'Checks ad copy against the ASA Code of Ethics and the Children & Young People Code, so a creative is cleared before the media buy is locked.',
    whatsInside: [
      'ASA Code review',
      'Children & Young People Code check',
      'Flagged lines',
      'Recommended edits',
    ],
  },
  {
    slug: 'channel-social-variants',
    name: 'Channel-aware social variants',
    oneLiner:
      'Platform-fit variants for Meta, LinkedIn, and TikTok, with a claims check before any product statement ships.',
    group: 'auaha',
    producedBy: 'Auaha — Creative pack',
    type: 'Draft',
    frameworks: ['Fair Trading Act 1986', 'Major-platform ad policies'],
    channels: ['Web', 'PDF'],
    description:
      'Channel-aware variants for Meta, LinkedIn, and TikTok, drafted in your house voice with a claims-substantiation check before any product or outcome statement goes out.',
    whatsInside: [
      'Per-platform variants',
      'House-voice draft',
      'Claims check',
      'Provenance watermark',
    ],
  },
  {
    slug: 'tagline-workshop',
    name: 'Tagline workshop',
    oneLiner:
      'See tagline options in five different styles — draft language a human chooses and clears.',
    group: 'auaha',
    producedBy: 'HAPAI — Tagline workshop',
    type: 'Draft',
    frameworks: [],
    channels: ['Web'],
    description:
      'A live HAPAI tool: see tagline options across five different styles for a brand or campaign. Draft language only — a human chooses and clears the final line.',
    whatsInside: [
      'Five distinct tagline styles',
      'Multiple options per style',
      'Rationale per direction',
    ],
    toolHref: '/hapai/tagline-workshop',
  },
  {
    slug: 'tikanga-cultural-review',
    name: 'Tikanga + cultural review pass',
    oneLiner:
      'A review pass that checks campaign content built on tikanga values in the prompt design — never a claim of endorsement.',
    group: 'auaha',
    producedBy: 'Auaha — Creative pack',
    type: 'Compliance check',
    frameworks: ['Fair Trading Act 1986'],
    channels: ['Web', 'PDF'],
    description:
      'When a campaign references te ao Māori, Auaha runs a tikanga and cultural review of the content first — built with tikanga values in the prompt design. assembl never generates karakia, whaikōrero, mihimihi, pepeha, or waiata, and never claims a mana whenua relationship or endorsement; this output describes how content is built, not who endorses it. Final cultural sign-off sits with people, not the agent.',
    whatsInside: [
      'Cultural-content review notes',
      'Hard-boundary flags (no karakia / whaikōrero / waiata)',
      'Recommendations for human review',
      'No endorsement or relationship claims',
    ],
  },
  {
    slug: 'performance-media-buy-report',
    name: 'Performance + media-buy report',
    oneLiner:
      'A summary of campaign performance and media spend, drafted for the next planning conversation.',
    group: 'auaha',
    producedBy: 'Auaha — Creative pack',
    type: 'Brief/summary',
    frameworks: ['Fair Trading Act 1986'],
    channels: ['Web', 'PDF'],
    description:
      'Pulls campaign performance and media-buy data into a readable report, so the next planning conversation starts from the numbers rather than a scramble.',
    whatsInside: [
      'Performance summary',
      'Media-spend breakdown',
      'Channel comparison',
      'Recommended next steps',
    ],
  },
  {
    slug: 'vessel-hero-image',
    name: 'Vessel hero image',
    oneLiner:
      'A branded hero image for a post, page, or deck — generation covered, a human picks the final asset.',
    group: 'auaha',
    producedBy: 'HAPAI — Vessel studio',
    type: 'Draft',
    frameworks: [],
    channels: ['Web'],
    description:
      'A live HAPAI tool: generate a hero image for a post, page, or deck in the locked assembl brand direction. Draft imagery only — a named person picks and publishes the final asset.',
    whatsInside: [
      'Brand-locked hero imagery',
      'Multiple compositions',
      'Pounamu palette',
      'Download-ready asset',
    ],
    toolHref: '/hapai/vessel-studio',
  },

  // ── Ako · Early childhood education ────────────────────────────────────────
  {
    slug: 'ero-self-review-pack',
    name: 'ERO documentation + self-review pack',
    oneLiner:
      'A downloadable, whānau-readable bundle for an ERO review, assembled from the records already on file.',
    group: 'ako',
    producedBy: 'Ako — Education pack',
    type: 'Evidence pack',
    frameworks: ['Education and Training Act 2020', 'Te Whāriki + ERO requirements'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'ERO documentation and self-review drafted against current criteria and assembled from the records already on file, so the pack is built before the visit — not reconstructed the night before.',
    whatsInside: [
      'Self-review documentation',
      'ERO criteria mapping',
      'Evidence index',
      'Whānau-readable summary',
    ],
  },
  {
    slug: 'moe-licensing-return',
    name: 'MoE licensing return',
    oneLiner:
      'A downloadable Ministry of Education licensing return — drafted against current criteria with the supporting evidence indexed into one pack.',
    group: 'ako',
    producedBy: 'Ako — Education pack',
    type: 'Evidence pack',
    frameworks: ['Education (ECE Services) Regulations 2008', 'Education and Training Act 2020'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'Drafts the MoE licensing return against the current ECE Services Regulations, with the supporting evidence indexed so a return is filed on time and on criteria.',
    whatsInside: [
      'Licensing return detail',
      'Regulation criteria mapping',
      'Supporting evidence index',
      'Filing checklist',
    ],
  },
  {
    slug: 'childrens-act-safety-check-record',
    name: 'Children’s Act safety check record',
    oneLiner:
      'A dated record of Police vetting and Children’s Act safety checks for staff.',
    group: 'ako',
    producedBy: 'Ako — Education pack',
    type: 'Log/record',
    frameworks: ["Children's Act 2014 (incl. safety checking)"],
    channels: ['Web', 'PDF'],
    description:
      'Tracks Police vetting and Children’s Act safety checks for staff, with the policy and incident records kept current so the safety-checking obligation is always demonstrable.',
    whatsInside: [
      'Per-staff safety-check status',
      'Police vetting record',
      'Safety-check policy',
      'Renewal alerts',
    ],
  },
  {
    slug: 'te-whariki-learning-record',
    name: 'Te Whāriki learning record',
    oneLiner:
      'An individual learning record aligned to Te Whāriki, written to be read by whānau, not just a regulator.',
    group: 'ako',
    producedBy: 'Ako — Education pack',
    type: 'Draft',
    frameworks: ['Te Whāriki + ERO requirements'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'Individual learning records and progress notes aligned to Te Whāriki, drafted in language whānau can read. Kaiako write the substance; the agent drafts the record around it.',
    whatsInside: [
      'Individual learning story',
      'Te Whāriki strand alignment',
      'Progress notes',
      'Whānau-readable language',
    ],
  },
  {
    slug: 'whanau-privacy-notice-ipp3a',
    name: 'Whānau privacy notice (IPP 3A)',
    oneLiner:
      'A whānau-readable privacy notice that explains what tamariki data is held and why, under the new IPP 3A.',
    group: 'ako',
    producedBy: 'Ako — Education pack',
    type: 'Draft',
    frameworks: ['Privacy Act 2020 + IPP 3A (1 May 2026)'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'A whānau-readable privacy notice and consent record covering the new IPP 3A obligations, explaining what tamariki data is held and why. Children’s data stays inside the centre’s tenant.',
    whatsInside: [
      'Plain-English privacy notice',
      'IPP 3A coverage',
      'Consent record',
      'Data-held summary',
    ],
  },

  // ── Mātauranga · Secondary education ───────────────────────────────────────
  {
    slug: 'ncea-cohort-dashboard',
    name: 'Weekly NCEA cohort dashboard',
    oneLiner:
      'A weekly read of the NCEA export that surfaces at-risk learners and credit-pace alerts before the term ends.',
    group: 'matauranga',
    producedBy: 'Mātauranga — Knowledge & research pack',
    type: 'Brief/summary',
    frameworks: ['NZQA Act 2024', 'Achievement Standards'],
    channels: ['Web', 'PDF'],
    description:
      'Parses the school’s weekly NCEA export and surfaces Achievement-Standards-at-risk learners and credit-pace alerts before the term ends — a pack you can file with the board the same afternoon.',
    whatsInside: [
      'Cohort risk view',
      'At-risk learner list',
      'Credit-pace alerts',
      'Board-ready summary',
    ],
  },
  {
    slug: 'achievement-standards-gap-report',
    name: 'Achievement Standards + UE Lit/Num gap report',
    oneLiner:
      'A report on Achievement Standards progress and UE Literacy and Numeracy gaps, surfaced before results come back.',
    group: 'matauranga',
    producedBy: 'Mātauranga — Knowledge & research pack',
    type: 'Brief/summary',
    frameworks: ['NZQA Act 2024', 'Achievement Standards'],
    channels: ['Web', 'PDF'],
    description:
      'Surfaces Achievement-Standards progress and University Entrance Literacy and Numeracy gaps from the weekly export, early enough for the office to act on rather than discovering after results.',
    whatsInside: [
      'Achievement Standards progress',
      'UE Literacy / Numeracy gaps',
      'Per-learner flags',
      'Trend over the term',
    ],
  },
  {
    slug: 'attendance-reconciliation-report',
    name: 'Attendance reconciliation report',
    oneLiner:
      'A reconciliation of attendance against MoE thresholds that flags the cohort sliding before the chronic-absence trigger fires.',
    group: 'matauranga',
    producedBy: 'Mātauranga — Knowledge & research pack',
    type: 'Log/record',
    frameworks: ['Education and Training Act 2020', 'MoE attendance standards'],
    channels: ['Web', 'PDF'],
    description:
      'Reconciles attendance against MoE reporting thresholds and flags the cohort sliding before the chronic-absence trigger fires — bundling the trail an ERO reviewer would want.',
    whatsInside: [
      'Attendance vs MoE thresholds',
      'Early-slide flags',
      'Chronic-absence watch list',
      'ERO-ready trail',
    ],
  },
  {
    slug: 'board-minutes-draft',
    name: 'Board minutes draft',
    oneLiner:
      'Board minutes drafted in the format the chair signs, from the meeting recording or your notes.',
    group: 'matauranga',
    producedBy: 'Mātauranga — Knowledge & research pack',
    type: 'Draft',
    frameworks: ['Education and Training Act 2020'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'Drafts board minutes in the chair-ready format from a meeting recording or your notes, with claims linked back to source records so the minutes can be forwarded, footnoted.',
    whatsInside: [
      'Chair-ready minutes',
      'Decisions and action items',
      'Source-linked claims',
      'Next-steps register',
    ],
  },
  {
    slug: 'ero-secondary-review-pack',
    name: 'ERO secondary review evidence pack',
    oneLiner:
      'A downloadable evidence bundle for an ERO secondary review, assembled from data already on file.',
    group: 'matauranga',
    producedBy: 'Mātauranga — Knowledge & research pack',
    type: 'Evidence pack',
    frameworks: ['Education and Training Act 2020', 'ERO secondary review'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'Bundles the ERO secondary-review evidence from data already on file — no reconstruction the night before the visit. A pack the registrar can file and ERO can read months later.',
    whatsInside: [
      'Self-review evidence',
      'Data already on file, indexed',
      'ERO criteria mapping',
      'Provenance trail',
    ],
  },
  {
    slug: 'ipp3a-parental-consent-record',
    name: 'IPP 3A parental-consent record',
    oneLiner:
      'A consent record for under-16 student data that meets the new IPP 3A obligation.',
    group: 'matauranga',
    producedBy: 'Mātauranga — Knowledge & research pack',
    type: 'Log/record',
    frameworks: ['Privacy Act 2020 + IPP 3A (student data)'],
    channels: ['Web', 'PDF'],
    description:
      'A parental-consent record for under-16 student data, covering the IPP 3A obligation so the consent trail exists when it is needed.',
    whatsInside: [
      'Per-student consent status',
      'IPP 3A coverage',
      'Parental-consent record',
      'Data-use summary',
    ],
  },

  // ── Hoko · Retail & commerce ───────────────────────────────────────────────
  {
    slug: 'cga-remedy-assessment',
    name: 'CGA remedy assessment',
    oneLiner:
      'A decision memo assessing a customer’s Consumer Guarantees Act remedy, with the Act and section cited.',
    group: 'hoko',
    producedBy: 'Hoko — Commerce pack',
    type: 'Decision memo',
    frameworks: ['Consumer Guarantees Act 1993'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'Assesses a customer’s CGA remedy — repair, replace, or refund — with the Act and section cited inline, so the reasoning holds up if the case reaches the Disputes Tribunal.',
    whatsInside: [
      'Remedy assessment',
      'Act / section citations',
      'Customer-comms draft',
      'Dispute-ready record',
    ],
  },
  {
    slug: 'returns-refund-policy-review',
    name: 'Returns + refund policy review',
    oneLiner:
      'A compliance check on a returns or refund policy against the CGA and Fair Trading Act.',
    group: 'hoko',
    producedBy: 'Hoko — Commerce pack',
    type: 'Compliance check',
    frameworks: ['Consumer Guarantees Act 1993', 'Fair Trading Act 1986'],
    channels: ['Web', 'PDF'],
    description:
      'Reviews a returns, refund, or gift-card policy against the CGA and Fair Trading Act and flags the lines that would not hold up, so the policy is defensible before a dispute tests it.',
    whatsInside: [
      'Policy-clause review',
      'CGA / Fair Trading flags',
      'Suggested wording',
      'Risk summary',
    ],
  },
  {
    slug: 'fair-trading-substantiation',
    name: 'Fair Trading claims substantiation',
    oneLiner:
      'A check on product, price, and origin claims against the Fair Trading Act before they go to market.',
    group: 'hoko',
    producedBy: 'Hoko — Commerce pack',
    type: 'Compliance check',
    frameworks: ['Fair Trading Act 1986'],
    channels: ['Web', 'PDF'],
    description:
      'Reviews product, price, and origin statements against the Fair Trading Act and surfaces what needs substantiation, so a claim is not made that the business cannot back.',
    whatsInside: [
      'Claim-by-claim review',
      'Substantiation requirements',
      'Fair Trading flags',
      'Sign-off summary',
    ],
  },
  {
    slug: 'product-recall-pack',
    name: 'Product recall pack',
    oneLiner:
      'A downloadable recall bundle — supplier traceback and customer-comms — assembled against the MBIE Product Recalls Code.',
    group: 'hoko',
    producedBy: 'Hoko — Commerce pack',
    type: 'Evidence pack',
    frameworks: ['Product Recalls Code (MBIE)', 'Fair Trading Act 1986'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'Assembles a product-recall pack with supplier traceback and drafted customer communications against the MBIE Product Recalls Code, so a recall moves fast and leaves a clean trail.',
    whatsInside: [
      'Recall notice draft',
      'Supplier traceback',
      'Customer-comms pack',
      'Recalls Code mapping',
    ],
  },
  {
    slug: 'customer-privacy-notice-ipp-review',
    name: 'Customer privacy notice + IPP review',
    oneLiner:
      'A privacy notice and IPP review for data captured at checkout and through loyalty programmes.',
    group: 'hoko',
    producedBy: 'Hoko — Commerce pack',
    type: 'Draft',
    frameworks: ['Privacy Act 2020'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'Reviews the data captured at checkout and through loyalty programmes against the IPPs and drafts the customer-facing privacy notice, so the obligations on customer data are met and documented.',
    whatsInside: [
      'Customer privacy notice',
      'IPP review of data flows',
      'Loyalty-data coverage',
      'Plain-English summary',
    ],
  },

  // ── Tōro · Whānau ──────────────────────────────────────────────────────────
  {
    slug: 'term-planner-draft',
    name: 'Term planner draft',
    oneLiner:
      'Forward the school newsletter; get a term-shaped plan and a drafted reply back, waiting for your tick.',
    group: 'toro',
    producedBy: 'Tōro — Family pack',
    type: 'Draft',
    frameworks: ['Privacy Act 2020 + IPP 3A'],
    channels: ['Web', 'Email'],
    description:
      'Drop the term newsletter, assembly note, or permission slip. Tōro pulls the dates into a draft calendar, drafts the reply you would have sent, and waits for your approval before anything goes out. Kindo, Hero, Seesaw, and plain-email schools all fit the same pattern.',
    whatsInside: [
      'Draft calendar entries',
      'Drafted reply',
      'Deadline list',
      'Consent-gated approval step',
    ],
  },
  {
    slug: 'pocket-money-chores-ledger',
    name: 'Pocket-money + chores ledger',
    oneLiner:
      'A chores-and-pocket-money ledger: kids submit photo proof, you approve, payments split across save, spend, and giving.',
    group: 'toro',
    producedBy: 'Tōro — Family pack',
    type: 'Log/record',
    frameworks: ['Privacy Act 2020 + IPP 3A'],
    channels: ['Web'],
    description:
      'Set a chore, kids submit photo proof, you approve. Payments can split across save, spend, and giving so the habit shows up in the maths, not just the marketing. One ledger per household, kid-safe by default.',
    whatsInside: [
      'Chore list and photo proof',
      'Approval step',
      'Save / spend / give split',
      'Per-household ledger',
    ],
  },
  {
    slug: 'school-holiday-plan',
    name: 'School-holiday plan',
    oneLiner:
      'An NZ-shaped, two-week school-holiday plan from real local programmes — in 10 minutes, not two evenings.',
    group: 'toro',
    producedBy: 'Tōro — Family pack',
    type: 'Brief/summary',
    frameworks: ['Privacy Act 2020 + IPP 3A'],
    channels: ['Web', 'Email'],
    description:
      'Two-week term-break plans pulled from real local OSCAR programmes, council activities, and rainy-day options for your region. Drafts a parent-coordinated week, surfaces booking deadlines, and only proposes what fits the budget you set. Launching Q3 2026.',
    whatsInside: [
      'Two-week plan from local programmes',
      'Booking deadlines',
      'Budget-fit options',
      'Rainy-day alternatives',
    ],
  },
  {
    slug: 'kai-planner-meal-plan',
    name: 'Kai planner meal plan + shopping list',
    oneLiner:
      'Photo of the fridge in. A week’s meal plan and a supermarket-aisle shopping list out, tuned for NZ kai.',
    group: 'toro',
    producedBy: 'HAPAI — Fridge to shopping list',
    type: 'Draft',
    frameworks: [],
    channels: ['Web'],
    description:
      'A live HAPAI tool: take a photo of the fridge and get a week’s meal plan and a supermarket-aisle shopping list, tuned for NZ kai conventions. A household planning aid — check allergies, budget, and preferences.',
    whatsInside: [
      'Week of meals',
      'Supermarket-aisle list',
      'NZ kai conventions',
      'Uses what’s in the fridge',
    ],
    toolHref: '/hapai/fridge-to-list',
  },
  {
    slug: 'kiwisaver-kids-briefing',
    name: 'KiwiSaver Kids briefing',
    oneLiner:
      'A plain-English briefing that explains KiwiSaver for tamariki to a parent making the call.',
    group: 'toro',
    producedBy: 'HAPAI — KiwiSaver Kids',
    type: 'Brief/summary',
    frameworks: [],
    channels: ['Web'],
    description:
      'A live HAPAI tool: a plain-English briefing on KiwiSaver for tamariki, so a parent can make the call with the basics in front of them. Information aid only — not financial advice.',
    whatsInside: [
      'How KiwiSaver works for kids',
      'Options compared',
      'Plain-English explainer',
      'Questions to ask a provider',
    ],
    toolHref: '/hapai/kiwisaver-kids',
  },
  {
    slug: 'trip-itinerary',
    name: 'Trip itinerary',
    oneLiner:
      'A coordinated family trip itinerary with the bookings, timings, and what-to-pack drawn together.',
    group: 'toro',
    producedBy: 'HAPAI — Voyage Italy',
    type: 'Brief/summary',
    frameworks: [],
    channels: ['Web', 'Email'],
    description:
      'A live HAPAI tool: a family trip itinerary that pulls bookings, timings, and packing into one plan the household can follow. A planning aid — confirm bookings and details yourself.',
    whatsInside: [
      'Day-by-day itinerary',
      'Bookings and timings',
      'Packing list',
      'Family-coordinated plan',
    ],
    toolHref: '/hapai/voyage-italy',
  },
  {
    slug: 'school-comms-summary',
    name: 'School comms summary',
    oneLiner:
      'Forward the week’s school notices; get back a clear summary of what matters and what needs a reply.',
    group: 'toro',
    producedBy: 'Tōro — Family pack',
    type: 'Brief/summary',
    frameworks: ['Privacy Act 2020 + IPP 3A'],
    channels: ['Web', 'Email'],
    description:
      'Forward the newsletters, assembly notes, and hot-lunch reminders. Tōro reads what arrives and hands back a clear summary — what matters, what needs a reply, what to pack — before it becomes another evening admin scramble.',
    whatsInside: [
      'What matters this week',
      'Replies needed',
      'Dates and deadlines',
      'What to pack / bring',
    ],
  },

  // ── Cross-cutting · Every kete ─────────────────────────────────────────────
  {
    slug: 'evidence-pack',
    name: 'Evidence pack',
    oneLiner:
      'Every output ends in a downloadable bundle of PDFs — sources, decisions, and timestamps — you can show a regulator, an auditor, or a client.',
    group: 'cross-cutting',
    producedBy: 'Every kete and tool',
    type: 'Evidence pack',
    frameworks: [],
    channels: ['Web', 'PDF'],
    description:
      'The thing every assembl workflow ends in: a downloadable bundle of files with the sources, decisions, and timestamps behind the output, so the work can be checked months later. (We call this a Mana Receipt — Ed25519-signed and cryptographically tamper-evident — but you do not need to know that to use it.)',
    whatsInside: [
      'The output itself',
      'Sources and citations',
      'Decision trail with timestamps',
      'Tamper-evident signature (the Mana Receipt)',
    ],
  },
  {
    slug: 'privacy-act-breach-memo',
    name: 'Privacy Act breach memo (72-hour)',
    oneLiner:
      'A decision memo on a notifiable privacy breach, drafted to the Privacy Act 2020 72-hour notification clock.',
    group: 'cross-cutting',
    producedBy: 'Every kete — privacy layer',
    type: 'Decision memo',
    frameworks: ['Privacy Act 2020'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'When a breach happens, drafts the notifiability assessment and the notification memo against the Privacy Act 2020 timeframe, so the 72-hour clock is met with a defensible record. Plain-English draft only — not legal advice.',
    whatsInside: [
      'Notifiability assessment',
      'Notification draft',
      'Timeline against the 72-hour clock',
      'Affected-party summary',
    ],
  },
  {
    slug: 'privacy-act-one-pager',
    name: 'Privacy Act one-pager',
    oneLiner:
      'A tailored Privacy Act 2020 summary that maps your data flows to the 13 IPPs, including IPP 3A.',
    group: 'cross-cutting',
    producedBy: 'HAPAI — Privacy Act one-pager',
    type: 'Brief/summary',
    frameworks: ['Privacy Act 2020 + IPP 3A'],
    channels: ['Web', 'PDF'],
    description:
      'A live HAPAI tool: generate a tailored Privacy Act 2020 summary for your organisation, mapping your data flows to the 13 Information Privacy Principles including IPP 3A. Plain-English draft only — not legal advice.',
    whatsInside: [
      'Your data flows mapped to the 13 IPPs',
      'IPP 3A coverage',
      'Plain-English explainer',
      'Gaps to address',
    ],
    toolHref: '/hapai/privacy-act',
  },
  {
    slug: 'privacy-impact-assessment',
    name: 'Privacy impact assessment',
    oneLiner:
      'A structured assessment of the privacy risk in a new process or system, against the Privacy Act 2020.',
    group: 'cross-cutting',
    producedBy: 'Every kete — privacy layer',
    type: 'Compliance check',
    frameworks: ['Privacy Act 2020'],
    channels: ['Web', 'PDF', 'Word'],
    description:
      'Works through the privacy risk in a new process, product, or data flow against the IPPs and writes up the assessment, so privacy is considered and documented before the thing ships. Plain-English draft only — not legal advice.',
    whatsInside: [
      'Data-flow mapping',
      'IPP risk assessment',
      'Mitigations',
      'Sign-off summary',
    ],
  },
  {
    slug: '9am-brief',
    name: 'The 9am Brief',
    oneLiner:
      'Paste the day’s mess; get back a clear list of what matters, who to chase, and what to pack.',
    group: 'cross-cutting',
    producedBy: 'HAPAI — The 9am Brief',
    type: 'Brief/summary',
    frameworks: [],
    channels: ['Web'],
    description:
      'A live HAPAI tool: paste the day’s mess and get back a clear operating brief — what matters, who to chase, what to pack. It does not send messages, change calendars, or make commitments.',
    whatsInside: [
      'What matters today',
      'Who to chase',
      'What to pack / prepare',
      'Priority order',
    ],
    toolHref: '/hapai/9am-brief',
  },
  {
    slug: 'meeting-notes-summary',
    name: 'Meeting notes summary',
    oneLiner:
      'Record or paste a meeting; walk away with proper notes — decisions, action items, next steps.',
    group: 'cross-cutting',
    producedBy: 'HAPAI — Meeting recorder',
    type: 'Brief/summary',
    frameworks: [],
    channels: ['Web', 'Voice'],
    description:
      'A live HAPAI tool: record or paste a meeting and walk away with a proper record — decisions, action items, next steps. Draft meeting record only — get consent and review before sharing or filing.',
    whatsInside: [
      'Decisions',
      'Action items with owners',
      'Next steps',
      'Full summary',
    ],
    toolHref: '/hapai/meeting-recorder',
  },
  {
    slug: 'admin-tax-calculator',
    name: 'Admin tax calculator',
    oneLiner:
      'Add up the unbilled admin hours your team loses each week and see the annual cost — and where a kete claws it back.',
    group: 'cross-cutting',
    producedBy: 'HAPAI — Admin tax calculator',
    type: 'Calculation',
    frameworks: [],
    channels: ['Web'],
    description:
      'A live HAPAI tool: add up the unbilled admin hours your team loses each week and see the annual cost, then where a kete pack would claw it back. Indicative calculator only — confirm your own rates and hours.',
    whatsInside: [
      'Weekly admin-hours input',
      'Annual cost estimate',
      'Per-role breakdown',
      'Claw-back projection',
    ],
    toolHref: '/hapai/admin-tax',
  },
  {
    slug: 'project-tracker-dashboard',
    name: 'Project tracker dashboard',
    oneLiner:
      'A live view of where each piece of work sits — drafts pending review, evidence packs sealed, what is next.',
    group: 'cross-cutting',
    producedBy: 'Every kete — operator view',
    type: 'Brief/summary',
    frameworks: [],
    channels: ['Web'],
    description:
      'The operator view that shows where each workflow sits — what is drafted and waiting for review, what is sealed in an evidence pack, and what is next. The daily work happens here, draft-only and human-reviewed.',
    whatsInside: [
      'Work-in-progress view',
      'Pending approvals',
      'Sealed evidence packs',
      'Next actions',
    ],
  },
];

/** All outputs for a given group, in catalogue order. */
export function outputsForGroup(group: OutputGroup): OutputDefinition[] {
  return OUTPUTS.filter((o) => o.group === group);
}

export function getOutput(slug: string): OutputDefinition | undefined {
  return OUTPUTS.find((o) => o.slug === slug);
}

/** Distinct output types present in the catalogue, in a stable display order. */
export const OUTPUT_TYPES: OutputType[] = [
  'Draft',
  'Evidence pack',
  'Decision memo',
  'Log/record',
  'Brief/summary',
  'Calculation',
  'Compliance check',
  'Redline',
];

/** Distinct channels, in display order. */
export const OUTPUT_CHANNELS: OutputChannel[] = [
  'Web',
  'Email',
  'PDF',
  'Word',
  'Voice',
  'SMS',
  'WhatsApp',
];

/** All distinct frameworks cited across the catalogue, sorted for the filter. */
export function allFrameworks(): string[] {
  const set = new Set<string>();
  for (const o of OUTPUTS) for (const f of o.frameworks) set.add(f);
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}
