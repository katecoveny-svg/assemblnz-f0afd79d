/**
 * Per-kete page content. Workflows, comparison rows, and additional depth
 * fields (description, legislation, typicalWorkflows, placeholderAgents,
 * pilotSprintPitch) are kept in data so the [slug] route can render any
 * kete from a single template.
 */

import type { KeteSlug } from './kete';

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

export type PlaceholderAgent = {
  name: string;
  description: string;
};

export type IndustryKeteDetail = {
  slug: Exclude<KeteSlug, 'toro'>;
  heroLead: string;
  heroBody: string;
  /** Three plain-English paragraphs explaining the kete's scope. */
  description: string[];
  /** NZ legislation grounding the kete (Acts, regs, NZS standards). */
  legislation: string[];
  /** One-liner names of typical workflows this kete handles end-to-end. */
  typicalWorkflows: string[];
  /** 4–6 specialist agents in this kete (placeholder copy, refined later). */
  placeholderAgents: PlaceholderAgent[];
  /** Kete-specific Pilot Sprint pitch — short, concrete. */
  pilotSprintPitch: string;
  workflows: Workflow[];
  comparisonLegacyLabel: string;
  comparison: ComparisonRow[];
  availableOn: string;
};

export type WhanauKeteDetail = {
  slug: 'toro';
  heroLead: string;
  heroBody: string;
  description: string[];
  legislation: string[];
  /**
   * Three sub-plugins inside the Tōro pack. Each ships independently. Status
   * controls the card's badge ("Live now", "Coming May", "Ships July"...).
   */
  subAgents: {
    name: string;
    pitch: string;
    body: string;
    status: 'live' | 'coming-soon';
    statusLabel: string;
  }[];
  features: { name: string; body: string }[];
  price: { monthly: string; setup: string };
};

export const KETE_DETAIL: Record<
  KeteSlug,
  IndustryKeteDetail | WhanauKeteDetail
> = {
  waihanga: {
    slug: 'waihanga',
    heroLead: 'Fewer reworked consents. Faster council sign-off.',
    heroBody:
      "assembl's construction kete bundles six specialist agents covering the full consent lifecycle — from site safety through to quality assurance. Each agent is grounded in NZ construction legislation and produces documentation your team can stand behind with a BCA.",
    description: [
      "Waihanga handles the work that sits between the design office and the BCA: consent applications, producer statements, site safety paperwork, variation packs, and the evidence trail that ends with a Code Compliance Certificate. The work that, when it goes well, nobody notices — and when it goes badly, costs you weeks.",
      "Every agent in the kete cites the Building Act 2004, the Building Code, the Acceptable Solutions, NZS 3910:2013, and the relevant council process notes inline. Reviewers see exactly which clause each paragraph stands on. Auditors see the same trail months later. The pack does not drift.",
      "Waihanga is the first live kete because it is where the cost of getting it wrong is most visible — every reworked consent is a fortnight of delay. The Pilot Sprint usually starts here.",
    ],
    legislation: [
      'Building Act 2004 (incl. s 14B, s 94)',
      'Building Code 2025 + Acceptable Solutions',
      'NZS 3910:2013 / NZS 3915:2005 contracts',
      'Health and Safety at Work Act 2015',
      'Resource Management Act 1991',
      'Engineering NZ practice notes (PS1–PS4)',
    ],
    typicalWorkflows: [
      'Building consent precheck → BCA accept',
      'Producer statement (PS1/PS3/PS4) drafting',
      'Variation pack against NZS 3910',
      'Site SWMS + hazard register refresh',
      'Code Compliance Certificate (CCC) bundle',
      'Toolbox-talk records and inductions',
    ],
    placeholderAgents: [
      {
        name: 'Whakaaē',
        description: 'Building consents — drafts s 14B applications citing Acceptable Solutions inline.',
      },
      {
        name: 'Ārai',
        description: 'Site safety — SSSPs, hazard register, and toolbox-talk records grounded in HSWA 2015.',
      },
      {
        name: 'Ata',
        description: 'BIM and plan analysis — clash detection, NZ Building Code review, model coordination.',
      },
      {
        name: 'Kaupapa',
        description: 'Project scoping — defines scope, identifies regulatory touchpoints, maps consent pathway.',
      },
      {
        name: 'Rawa',
        description: 'Materials and procurement — checks specs against the Building Product Specifications.',
      },
      {
        name: 'Pai',
        description: 'Quality assurance — final compliance pass and CCC evidence pack assembly.',
      },
    ],
    pilotSprintPitch:
      "Pick one consent that has been bouncing back. assembl drafts the s 14B precheck — every Acceptable Solution cited, every producer statement scoped — alongside your designer. By Friday: a precheck pack the BCA has acknowledged.",
    workflows: [
      {
        name: 'Quote & estimate',
        description:
          'Itemised quotes against a live materials price index, with allowances for council fees, BWoF and producer-statement costs surfaced up front.',
        compliance: ['Fair Trading Act 1986', 'CCCFA disclosure'],
      },
      {
        name: 'Building consent pack',
        description:
          'Generates a complete consent application: PIM, building consent, producer statements, code-compliance evidence — formatted for the relevant TA.',
        compliance: ['Building Act 2004 s 14B', 'MBIE consent processing standards'],
      },
      {
        name: 'Producer statements (PS1–PS4)',
        description:
          'Drafts PS1 / PS3 / PS4 with the right author, scope, and limitations — flags scope-creep and missing peer-review before submission.',
        compliance: ['Engineering NZ practice notes', 'LBP scheme'],
      },
      {
        name: 'Site safety & SWMS',
        description:
          'Site-specific SWMS, hazard register, and toolbox-talk records, kept current as the build phase changes.',
        compliance: ['Health and Safety at Work Act 2015', 'WorkSafe NZ guidance'],
      },
      {
        name: 'Variations & RFIs',
        description:
          'Variation packs with cost, time, and contract impact captured against the original NZS3910/NZS3915 form. RFIs auto-tracked to closure.',
        compliance: ['NZS 3910:2013', 'NZS 3915:2005'],
      },
      {
        name: 'Code Compliance Certificate (CCC)',
        description:
          'Bundles the full evidence trail for CCC — producer statements, inspections, BWoF schedule — into one auditor-defensible pack.',
        compliance: ['Building Act 2004 s 94', 'BWoF compliance schedule'],
      },
    ],
    comparisonLegacyLabel: 'Standard PM tools',
    comparison: [
      { capability: 'Building Act s 14B consent pack drafting', assembl: true, legacy: false },
      { capability: 'Producer statement (PS1/PS3/PS4) generation', assembl: true, legacy: false },
      { capability: 'NZS 3910 variation forms', assembl: true, legacy: false },
      { capability: 'Site SWMS auto-refresh', assembl: true, legacy: false },
      { capability: 'Evidence packs with provenance watermark', assembl: true, legacy: false },
      { capability: 'Cost & schedule tracking', assembl: true, legacy: 'Yes' },
      { capability: 'Document storage', assembl: true, legacy: 'Yes' },
      { capability: 'NZ data residency', assembl: true, legacy: 'Sometimes' },
      { capability: 'Cites legislation in outputs', assembl: true, legacy: false },
    ],
    availableOn: 'Operator plan and above (NZ$1,490/mo + setup).',
  },

  manaaki: {
    slug: 'manaaki',
    heroLead: 'From liquor licensing to food safety.',
    heroBody:
      "assembl's hospitality kete covers food safety (Food Act 2014), liquor licensing (Sale and Supply of Alcohol Act 2012), health and safety, and guest privacy — purpose-built for restaurants, hotels, bars, and tourism operators across Aotearoa.",
    description: [
      "Manaaki keeps the kitchen running. Food Control Plans, alcohol licences, host responsibility logs, allergen records, employment paperwork — the operational compliance layer that keeps verifiers, DLCs, and WorkSafe inspectors satisfied.",
      "Every output cites the Food Act 2014, the Sale and Supply of Alcohol Act 2012, the Holidays Act 2003, and the relevant MPI / DLC guidance inline. Verifiers see a clean trail; managers spend an hour reviewing instead of a week reconstructing.",
      "Manaaki launches after Waihanga and Pīkau reach five customers each. Kitchens and dining-rooms can register interest now and shape the first releases.",
    ],
    legislation: [
      'Food Act 2014 + MPI registered FCP',
      'Sale and Supply of Alcohol Act 2012',
      'Holidays Act 2003 / Minimum Wage Act 1983',
      'Employment Relations Act 2000',
      'Health Act 1956 + WorkSafe NZ guidance',
      'Privacy Act 2020 (IPP 3A — guest data)',
    ],
    typicalWorkflows: [
      'Food Control Plan diary + verification pack',
      'On-licence renewal + manager certificate pack',
      'Host responsibility log',
      'Holidays Act-correct rostering',
      'Allergen review on menu changes',
      'Guest privacy + complaint handling',
    ],
    placeholderAgents: [
      {
        name: 'Aura',
        description: 'Guest experience and service compliance — manages standards and SLA documentation.',
      },
      {
        name: 'Saffron',
        description: 'Kitchen and food safety — drafts FCP entries and corrective actions under Food Act 2014.',
      },
      {
        name: 'Cellar',
        description: 'Liquor licensing — handles renewals, manager certificates, host responsibility logs.',
      },
      {
        name: 'Roster',
        description: 'Holidays Act rostering — break rules, public holiday entitlements, wage coverage.',
      },
    ],
    pilotSprintPitch:
      "Pick the FCP verification that is due, or the on-licence up for renewal. assembl produces the diary, corrective actions, host responsibility logs, and licence pack — DLC-ready. Your manager spends an hour, not a week.",
    workflows: [
      {
        name: 'Rostering & wage coverage',
        description:
          'Rosters built against forecast covers, minimum-wage and break-rule compliance, plus public holiday entitlements correctly costed.',
        compliance: ['Holidays Act 2003', 'Minimum Wage Act 1983', 'Employment Relations Act 2000'],
      },
      {
        name: 'Food Control Plan & verification',
        description:
          'Maintains your registered FCP, daily diary, and corrective actions — packaged into an MPI-ready evidence bundle for verification visits.',
        compliance: ['Food Act 2014', 'MPI registered FCP template'],
      },
      {
        name: 'Alcohol licensing & host responsibility',
        description:
          'On/off-licence renewal packs, manager certifications, and host-responsibility logs kept current against your DLC expectations.',
        compliance: ['Sale and Supply of Alcohol Act 2012', 'DLC reporting standards'],
      },
    ],
    comparisonLegacyLabel: 'POS + spreadsheets',
    comparison: [
      { capability: 'Food Act FCP diary', assembl: true, legacy: false },
      { capability: 'Alcohol licensing renewal pack', assembl: true, legacy: false },
      { capability: 'Holidays Act-correct rostering', assembl: true, legacy: 'Often wrong' },
      { capability: 'Allergen check on menu changes', assembl: true, legacy: false },
      { capability: 'Evidence packs for MPI verification', assembl: true, legacy: false },
      { capability: 'Sales reporting', assembl: true, legacy: 'Yes' },
      { capability: 'NZ data residency', assembl: true, legacy: 'Rarely' },
      { capability: 'Cites legislation in outputs', assembl: true, legacy: false },
    ],
    availableOn:
      'Operator plan and above (NZ$1,490/mo + setup). Coming soon — launching after Waihanga and Pīkau reach five customers each.',
  },

  pikau: {
    slug: 'pikau',
    heroLead: 'The audit trail your broker needs.',
    heroBody:
      "assembl's freight and customs kete covers customs declarations, tariff classification, and trade compliance documentation — grounded in the Customs and Excise Act 2018 and NZ Customs requirements.",
    description: [
      "Pīkau handles the paperwork at the border: Trade Single Window lodgements, tariff classification reviews against the Working Tariff Document, MPI biosecurity declarations, and the dangerous-goods chain of custody from origin to release.",
      "Every entry cites the Customs and Excise Act 2018, the relevant Import Health Standard, and the Land Transport Rule for DG. Brokers see the working they expect; auditors see the trail months later. Reclassification rework drops to zero on the lines assembl runs.",
      "Pīkau is live alongside Waihanga. Importers, exporters, and customs brokers can run a Pilot Sprint on a single recurring line and have an audit-clean record by Friday.",
    ],
    legislation: [
      'Customs and Excise Act 2018',
      'NZ Working Tariff Document + WCO HS',
      'Biosecurity Act 1993 + MPI Import Health Standards',
      'Hazardous Substances and New Organisms Act 1996',
      'Land Transport Rule: Dangerous Goods 2005 (NZS 5433:2012)',
      'Maritime NZ requirements',
    ],
    typicalWorkflows: [
      'Customs entry → Trade Single Window lodgement',
      'Tariff classification review',
      'MPI IHS biosecurity declaration',
      'Dangerous goods classification + placard',
      'Chain-of-custody evidence pack',
      'Manifest + POD bundling',
    ],
    placeholderAgents: [
      {
        name: 'Pikau',
        description: 'Customs declarations — drafts entries citing Customs and Excise Act 2018 inline.',
      },
      {
        name: 'Gateway',
        description: 'Tariff classification — HS codes and duty assessed against the NZ Tariff Schedule.',
      },
      {
        name: 'Transit-Freight',
        description: 'Freight documentation — manifests, POD capture, broker-ready audit trail.',
      },
      {
        name: 'Quarantine',
        description: 'Biosecurity — drafts IHS declarations, tracks treatment evidence and quarantine release.',
      },
    ],
    pilotSprintPitch:
      "Pick a recurring import line your broker manages by hand. assembl drafts the entry, the IHS declaration, and the DG classification — lodged via Trade Single Window. Your audit trail is one click from the moment of release.",
    workflows: [
      {
        name: 'Customs lodgement',
        description:
          'Import / export entries lodged via Trade Single Window, with tariff classification reviewed against the Working Tariff Document and prior rulings.',
        compliance: ['Customs and Excise Act 2018', 'NZ Working Tariff Document'],
      },
      {
        name: 'MPI biosecurity & IHS',
        description:
          'Biosecurity declarations against the relevant Import Health Standard, with treatment evidence and quarantine status tracked through release.',
        compliance: ['Biosecurity Act 1993', 'MPI Import Health Standards'],
      },
      {
        name: 'Dangerous goods',
        description:
          'DG declarations classified against UN numbers, packaging compatibility, and segregation rules — driver placard checks at dispatch.',
        compliance: ['NZS 5433:2012', 'Land Transport Rule: Dangerous Goods 2005'],
      },
    ],
    comparisonLegacyLabel: 'TMS + email',
    comparison: [
      { capability: 'Trade Single Window lodgement', assembl: true, legacy: false },
      { capability: 'Working Tariff classification review', assembl: true, legacy: false },
      { capability: 'MPI IHS declaration drafting', assembl: true, legacy: false },
      { capability: 'Chain-of-custody evidence pack', assembl: true, legacy: false },
      { capability: 'Manifest generation', assembl: true, legacy: 'Yes' },
      { capability: 'POD capture', assembl: true, legacy: 'Yes' },
      { capability: 'NZ data residency', assembl: true, legacy: 'Sometimes' },
      { capability: 'Cites legislation in outputs', assembl: true, legacy: false },
    ],
    availableOn: 'Operator plan and above (NZ$1,490/mo + setup).',
  },

  arataki: {
    slug: 'arataki',
    heroLead: 'Automotive (workshop, fleet, governance).',
    heroBody:
      "assembl's automotive kete is built for NZ workshops, fleet operators, and dealerships. WoF/CoF schedules, driver endorsement currency, NZTA logbook checks, CCCFA disclosures, Consumer Guarantees warranty handling, and IPP 3A privacy obligations — every output cites the Act and section it stands on.",
    description: [
      "Arataki sits across the workshop, the dealer floor, and the fleet office. WoF/CoF schedules, driver endorsement currency, NZTA logbook checks, incident triage to WorkSafe thresholds, and the insurance evidence packs that follow.",
      "The kete grounds outputs in the Land Transport Act 1998, the relevant Land Transport Rules, the Consumer Guarantees Act 1993 (for sales), and HSWA 2015 (for the workshop floor). Each output stamps which clause it stands on.",
      "Arataki launches after Waihanga and Pīkau reach five customers each. Workshops and fleet operators can register interest now to shape the first releases.",
    ],
    legislation: [
      'Land Transport Act 1998',
      'Land Transport Rules (Vehicle Standards, Driver Licensing)',
      'NZTA logbook + heavy-vehicle requirements',
      'Health and Safety at Work Act 2015',
      'Consumer Guarantees Act 1993',
      'Motor Vehicle Sales Act 2003',
    ],
    typicalWorkflows: [
      'Per-vehicle WoF / CoF schedule',
      'Driver endorsement currency check',
      'Notifiable-event triage + WorkSafe pack',
      'Insurance evidence bundle',
      'Workshop H&S plan refresh',
      'Dealer Consumer Guarantees pack',
    ],
    placeholderAgents: [
      {
        name: 'Motor',
        description: 'Workshop safety and dealership compliance — H&S plan, equipment register, CGA pack.',
      },
      {
        name: 'Transit',
        description: 'Heavy vehicle compliance — NZTA logbook, driver endorsement currency, RUC tracking.',
      },
      {
        name: 'Fleet',
        description: 'Fleet documentation — WoF/CoF schedules, defect history, MTBI alerts.',
      },
      {
        name: 'Incident',
        description: 'Accident reporting — meets WorkSafe notification thresholds and insurer evidence requirements.',
      },
    ],
    pilotSprintPitch:
      "Pick one fleet of vehicles or one workshop. assembl drafts the WoF/CoF schedule, driver endorsement register, and an insurance-grade incident bundle. By Friday: every vehicle and every driver in one auditable trail.",
    workflows: [
      {
        name: 'WoF / CoF tracking',
        description:
          'Per-vehicle WoF and CoF schedules, defect histories, and MTBI alerts before a vehicle goes off-road for inspection.',
        compliance: ['Land Transport Rule: Vehicle Standards', 'Land Transport Rule: Heavy-vehicles'],
      },
      {
        name: 'Driver licensing & endorsements',
        description:
          'Class, P, I, F, V, R, T, W, D endorsements tracked per driver — currency checks before they touch the keys.',
        compliance: ['Land Transport (Driver Licensing) Rule 1999'],
      },
      {
        name: 'Accident & incident reporting',
        description:
          'Incident packs that meet WorkSafe notification thresholds and your insurer evidence requirements — all in one bundle.',
        compliance: ['Health and Safety at Work Act 2015', 'WorkSafe NZ notifiable-event criteria'],
      },
    ],
    comparisonLegacyLabel: 'Fleet spreadsheet',
    comparison: [
      { capability: 'WoF/CoF expiry forecasting', assembl: true, legacy: 'Manual' },
      { capability: 'Driver endorsement currency', assembl: true, legacy: 'Manual' },
      { capability: 'Notifiable-event triage', assembl: true, legacy: false },
      { capability: 'Insurance evidence packs', assembl: true, legacy: false },
      { capability: 'Per-asset cost ledger', assembl: true, legacy: 'Yes' },
      { capability: 'NZ data residency', assembl: true, legacy: 'Rarely' },
      { capability: 'Cites legislation in outputs', assembl: true, legacy: false },
    ],
    availableOn:
      'Operator plan and above (NZ$1,490/mo + setup). Coming soon — launching after Waihanga and Pīkau reach five customers each.',
  },

  auaha: {
    slug: 'auaha',
    heroLead: 'Brand work that is compliant by default.',
    heroBody:
      "assembl's creative kete covers advertising compliance (ASA Codes, Fair Trading Act 1986), brand governance, content production, and media buying — for agencies, studios, and in-house creative teams.",
    description: [
      "Auaha sits inside the creative process — the brief, the script, the channel-specific variants, the claims-substantiation pass before an ad goes live. Each output keeps the house voice and adds a Fair Trading + ASA Code review at every stage.",
      "If a campaign references te ao Māori, Auaha runs a tikanga and cultural review pass first — and assembl never generates karakia, whaikōrero, mihimihi, pepeha, or waiata. That is a hard boundary.",
      "Auaha launches after Waihanga and Pīkau reach five customers each. Agencies and in-house creative teams can register interest now.",
    ],
    legislation: [
      'Fair Trading Act 1986',
      'ASA Code of Ethics + ASA Children & Young People Code',
      'Copyright Act 1994',
      'Broadcasting Act 1989',
      'Privacy Act 2020 (campaign consent)',
      'Major-platform ad policies (Meta, LinkedIn, TikTok)',
    ],
    typicalWorkflows: [
      'Brief + audience strategy',
      'Long-form copy + scripts',
      'Channel-aware social variants',
      'Claims substantiation pass',
      'Tikanga + cultural review (where relevant)',
      'Performance + media buy report',
    ],
    placeholderAgents: [
      {
        name: 'Prism',
        description: 'Brand strategy — positioning, audience map, creative direction with NZ-context citations.',
      },
      {
        name: 'Muse',
        description: 'Copywriting — drafts in your house voice with provenance watermark on every output.',
      },
      {
        name: 'Channel',
        description: 'Social + paid media — channel-aware variants for Meta, LinkedIn, TikTok.',
      },
      {
        name: 'Claim',
        description: 'Claims substantiation — Fair Trading and ASA Code review before any product statement ships.',
      },
    ],
    pilotSprintPitch:
      "Pick a campaign that is currently bottle-necked at legal review. assembl produces the creative, the claims substantiation, and the ASA-Code pass — house voice intact. By Friday: a launch-ready pack with the trail attached.",
    workflows: [
      {
        name: 'Brief & strategy',
        description:
          'Creative briefs that capture audience, tone, channel, and constraints — with a tikanga check if the campaign references te ao Māori.',
        compliance: ['Fair Trading Act 1986', 'ASA Code of Ethics'],
      },
      {
        name: 'Scripts & long-form copy',
        description:
          'Drafts scripts, blog posts, and long-form copy in your house voice — provenance watermark on every output.',
        compliance: ['Copyright Act 1994'],
      },
      {
        name: 'Social & paid-media',
        description:
          'Channel-aware variants for Meta, LinkedIn, TikTok — with claims-substantiation check before any product or outcome statement.',
        compliance: ['Fair Trading Act 1986', 'Meta / LinkedIn ad policies'],
      },
    ],
    comparisonLegacyLabel: 'Generic LLM writers',
    comparison: [
      { capability: 'House-voice training', assembl: true, legacy: 'Surface-level' },
      { capability: 'Provenance watermark on outputs', assembl: true, legacy: false },
      { capability: 'Fair Trading claims-substantiation check', assembl: true, legacy: false },
      { capability: 'ASA Code review', assembl: true, legacy: false },
      { capability: 'Tikanga & cultural review pass', assembl: true, legacy: false },
      { capability: 'Multi-channel variants', assembl: true, legacy: 'Yes' },
      { capability: 'NZ data residency', assembl: true, legacy: 'Rarely' },
    ],
    availableOn:
      'Operator plan and above (NZ$1,490/mo + setup). Coming soon — launching after Waihanga and Pīkau reach five customers each.',
  },

  hoko: {
    slug: 'hoko',
    heroLead: 'Consumer protection compliance for NZ retailers.',
    heroBody:
      "assembl's retail kete covers consumer protection (Consumer Guarantees Act 1993, Fair Trading Act 1986), product safety, and retail employment compliance for New Zealand retailers.",
    description: [
      "Hoko handles the compliance layer underneath the till: Consumer Guarantees Act remedies, Fair Trading Act claims review, product safety recalls, and the privacy obligations on customer data captured at checkout or online.",
      "Each output cites the relevant Act and section inline. Returns workflows, gift-card terms, and refund policies all hold up under Disputes Tribunal scrutiny because the trail is in the box.",
      "Hoko is in development. Multi-site retailers and online sellers can register interest now to shape the first release.",
    ],
    legislation: [
      'Consumer Guarantees Act 1993',
      'Fair Trading Act 1986',
      'Privacy Act 2020',
      'Sale of Goods Act 1908',
      'Product Recalls Code (MBIE)',
    ],
    typicalWorkflows: [
      'CGA remedy assessment',
      'Returns + refund policy review',
      'Fair Trading claims substantiation',
      'Product recall pack',
      'Customer privacy notice + IPP review',
    ],
    placeholderAgents: [
      {
        name: 'Hoko-CGA',
        description: 'Consumer Guarantees Act — remedy assessments, returns, and dispute response packs.',
      },
      {
        name: 'Trader',
        description: 'Fair Trading Act — claims substantiation review on product, price, and origin statements.',
      },
      {
        name: 'Recall',
        description: 'Product safety — recall packs, supplier traceback, and customer-comms drafting.',
      },
      {
        name: 'Till',
        description: 'Customer privacy — IPP review on data captured at checkout and through loyalty programmes.',
      },
    ],
    pilotSprintPitch:
      "Pick one returns workflow or one recurring CGA dispute. assembl drafts the remedy assessment, the customer-comms pack, and a Disputes-Tribunal-defensible record. By Friday: the same case, end-to-end, in one trail.",
    workflows: [],
    comparisonLegacyLabel: 'Manual compliance',
    comparison: [
      { capability: 'Consumer Guarantees Act documentation', assembl: 'In development', legacy: 'Manual' },
      { capability: 'Fair Trading Act compliance checks', assembl: 'In development', legacy: 'Manual' },
    ],
    availableOn: 'Coming soon — retail kete in development. Register your interest via /contact.',
  },

  ako: {
    slug: 'ako',
    heroLead: 'Early Childhood Education — compliance that protects tamariki.',
    heroBody:
      "assembl's early childhood education kete covers ECE licensing, ratios and kaiako qualifications, Te Whāriki learning records, ERO review prep, Children's Act safety checks, and the Privacy Act 2020 (IPP 3A) obligations on tamariki data — purpose-built for centres and home-based services across Aotearoa.",
    description: [
      "Ako sits inside an ECE centre's daily compliance load. ERO documentation, MoE licensing returns, Police vetting and Children's Act safety checks for staff, individual learning records, and the privacy notices that explain what tamariki data is held and why.",
      "The kete grounds outputs in the Education and Training Act 2020, the Children's Act 2014 (Vulnerable Children's Act), and Privacy Act 2020 — including the new IPP 3A obligations from 1 May 2026. Every record is whānau-readable, not just regulator-readable.",
      "Ako is in development. Centres and groups can register interest now to shape the first release.",
    ],
    legislation: [
      'Education and Training Act 2020',
      "Children's Act 2014 (incl. safety checking)",
      'Education (ECE Services) Regulations 2008',
      'Privacy Act 2020 + IPP 3A (1 May 2026)',
      'Health and Safety at Work Act 2015',
      'Te Whāriki + ERO requirements',
    ],
    typicalWorkflows: [
      'ERO documentation + self-review',
      'MoE licensing return',
      "Police vetting + Children's Act safety check",
      'Individual learning record (Te Whāriki)',
      'Whānau privacy notice + IPP 3A review',
    ],
    placeholderAgents: [
      {
        name: 'Ako-Licence',
        description: 'Licensing — drafts MoE returns and ERO self-review docs against current criteria.',
      },
      {
        name: 'Tiaki',
        description: 'Child safety — Children\'s Act vetting, safety-check policy, incident records.',
      },
      {
        name: 'Whāriki',
        description: 'Curriculum — Te Whāriki-aligned learning records, individual progress notes.',
      },
      {
        name: 'Whānau',
        description: 'Privacy + comms — whānau-readable IPP 3A privacy notices and consent records.',
      },
    ],
    pilotSprintPitch:
      "Pick the next ERO visit or the next MoE return. assembl drafts the documentation, runs the privacy and Children's Act safety pass, and packages a whānau-readable evidence trail. By Friday: a full pack, ready to file.",
    workflows: [],
    comparisonLegacyLabel: 'Manual compliance',
    comparison: [
      { capability: 'Privacy Act 2020 IPP 3A documentation', assembl: 'In development', legacy: 'Manual' },
      { capability: 'Licensing compliance records', assembl: 'In development', legacy: 'Manual' },
    ],
    availableOn: 'Coming soon — early childhood kete in development. Register your interest via /contact.',
  },

  matauranga: {
    slug: 'matauranga',
    heroLead: 'NCEA L1–3 weekly reporting for school operators.',
    heroBody:
      "assembl's secondary education kete is greenfield — being built with a pilot Auckland school (in negotiation) for the school-operator audience. Parses weekly reports, tracks Achievement Standards, surfaces UE Literacy/Numeracy gaps. Pilot copy and agents land after Reo signs off.",
    description: [
      "Mātauranga is the school-operator-facing kete for NCEA L1–3 — distinct from the whānau-facing NCEA layer that lives inside Tōro. Where Tōro helps parents track their tamariki, Mātauranga helps a secondary school track its cohort: weekly-report parsing, Achievement Standards progress, UE Literacy/Numeracy compliance, ERO secondary review prep.",
      "Grounding lands with the pilot. Expected scope: Education and Training Act 2020 (Part 4 — secondary), NZQA Act 2024 (Achievement Standards), Privacy Act 2020 (student data, IPP 3A, parental consent under 16), and Te Mātaiaho curriculum refresh expectations.",
      "Pilot customer (in negotiation): Sacred Heart College Auckland. No agents seeded yet — the kete is intentionally empty until pilot signal arrives. An empty kete is better than a mis-shaped kete.",
    ],
    legislation: [
      'Education and Training Act 2020 (Part 4 — secondary)',
      'NZQA Act 2024 (Achievement Standards, NCEA framework)',
      'Privacy Act 2020 + IPP 3A (student data, parental consent under 16)',
      'Te Mātaiaho curriculum refresh',
      'Health and Safety at Work Act 2015 (school grounds)',
    ],
    typicalWorkflows: [
      'Weekly NCEA report parsing',
      'Achievement Standards progress tracking',
      'UE Literacy / Numeracy compliance check',
      'ERO secondary review prep',
      'Parental consent (IPP 3A) workflow for under-16 data',
    ],
    placeholderAgents: [],
    pilotSprintPitch:
      "Pilot customer in negotiation. When a school commits, assembl drafts the first weekly-report parser against the school's actual reporting cadence — not a template. Agents are written from pilot signal, fitted to real student-data architecture.",
    workflows: [],
    comparisonLegacyLabel: 'Manual reporting',
    comparison: [],
    availableOn: 'Coming soon — pilot in negotiation. Register your interest via /contact.',
  },

  toro: {
    slug: 'toro',
    heroLead: 'Forward your school comms — get a structured plan back.',
    heroBody:
      "Tōro is the whānau assistant inside assembl. Forward the school newsletter, the kindo notice, the OSCAR confirmation — it reads them, pulls out what matters, and hands back a term-shaped plan you can act on. Three sub-plugins under one Family plan.",
    description: [
      "Tōro starts with email. Each whānau gets a private inbound address — term-<whanau-id>@toro.nz — so the school newsletter, the assembly note, the hot-lunch reminder all land in one place. Tōro reads them, drafts the response or the calendar entry, and waits for you to approve before anything goes out.",
      "Nothing ships without a human click. Every draft is reviewable, every action is consent-gated, and every reply uses your voice not Tōro's. Privacy Act 2020 IPP 3A is honoured by default — children's data stays inside the whānau tenant.",
      "Available now at the Family tier — NZ$29/month, no setup. Cancel any time.",
    ],
    legislation: ['Privacy Act 2020 + IPP 3A (1 May 2026)'],
    subAgents: [
      {
        name: 'Term Planner',
        pitch: 'Forward school newsletters, get a term-shaped plan back.',
        body: "Drop the term newsletter, the assembly note, the permission slip — Tōro reads it, pulls the dates into a draft calendar, drafts the reply you would have sent, and waits for your tick before anything goes out. Works with Kindo, Hero, Seesaw, and plain-email schools alike.",
        status: 'live',
        statusLabel: 'Live now',
      },
      {
        name: 'Kid Money',
        pitch: 'Chores, photo proof, payments split three ways.',
        body: "Set a chore, tamariki submit photo proof, you approve. Payments split across save / spend / koha so the four pou — mahi (the work), koha (the giving), kaitiakitanga (the keeping), manaakitanga (the looking after) — show up in the maths, not just the marketing.",
        status: 'coming-soon',
        statusLabel: 'Coming May',
      },
      {
        name: 'Holiday Ideas',
        pitch: 'NZ-shaped school-holiday plans in 10 minutes, not two evenings.',
        body: "Two-week term-break plans pulled from real local OSCAR programmes, council activities, and rainy-day options for your region. Drafts a parent-coordinated week, surfaces booking deadlines, and only proposes what fits the budget you set.",
        status: 'coming-soon',
        statusLabel: 'Ships July (Term 2 holidays)',
      },
    ],
    features: [
      {
        name: 'Household routines',
        body: 'Morning, after-school, and bedtime routines tracked alongside the school calendar — gentle reminders, never nags.',
      },
      {
        name: 'School logistics',
        body: 'Assembly notes, hot-lunch orders, sports gear, permission slips — captured from email and surfaced when they are actually needed.',
      },
      {
        name: 'The running list',
        body: 'Groceries, repairs, birthday gifts, library books to return — forward it in, Tōro keeps the thread.',
      },
      {
        name: 'Kid-safe by default',
        body: "Tōro is scoped to your whānau tenant. No public profile, no surfacing of children's data, no upsells inside the conversation.",
      },
      {
        name: 'Te reo Māori, optional',
        body: 'Switch the voice to te reo Māori, English, or both — set per whānau member.',
      },
      {
        name: 'Email-first, by design',
        body: 'Forward from any client — Gmail, Outlook, school portal, your phone. No new app to install for the school comms you already get.',
      },
    ],
    price: { monthly: 'NZ$29', setup: '—' },
  },
};
