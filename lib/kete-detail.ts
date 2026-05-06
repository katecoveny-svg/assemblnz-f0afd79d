/**
 * Per-kete page content. Workflows and comparison rows are kept in data so
 * the [slug] route can render any kete from a single template.
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

export type IndustryKeteDetail = {
  slug: Exclude<KeteSlug, 'toro'>;
  heroLead: string;
  heroBody: string;
  workflows: Workflow[];
  comparisonLegacyLabel: string;
  comparison: ComparisonRow[];
  availableOn: string;
};

export type WhanauKeteDetail = {
  slug: 'toro';
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
    slug: 'waihanga',
    heroLead: 'Fewer reworked consents. Faster council sign-off.',
    heroBody:
      "assembl's construction kete bundles six specialist agents covering the full consent lifecycle — from site safety through to quality assurance. Each agent is grounded in NZ construction legislation and produces documentation your team can stand behind with a BCA.",
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
    availableOn: 'Operator plan and above (NZ$1,490/mo + setup). Coming soon — launching after Waihanga and Pikau reach five customers each.',
  },

  pikau: {
    slug: 'pikau',
    heroLead: 'The audit trail your broker needs.',
    heroBody:
      "assembl's freight and customs kete covers customs declarations, tariff classification, and trade compliance documentation — grounded in the Customs and Excise Act 2018 and NZ Customs requirements.",
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
    heroLead: 'From workshop compliance to fleet documentation.',
    heroBody:
      "assembl's automotive kete covers workshop safety, vehicle compliance, fleet management, and transport regulations for dealerships, workshops, and fleet operators in Aotearoa.",
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
    availableOn: 'Operator plan and above (NZ$1,490/mo + setup). Coming soon — launching after Waihanga and Pikau reach five customers each.',
  },

  auaha: {
    slug: 'auaha',
    heroLead: 'Brand work that is compliant by default.',
    heroBody:
      "assembl's creative kete covers advertising compliance (ASA Codes, Fair Trading Act 1986), brand governance, content production, and media buying — for agencies, studios, and in-house creative teams.",
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
    comparisonLegacyLabel: 'Generic AI writers',
    comparison: [
      { capability: 'House-voice training', assembl: true, legacy: 'Surface-level' },
      { capability: 'Provenance watermark on outputs', assembl: true, legacy: false },
      { capability: 'Fair Trading claims-substantiation check', assembl: true, legacy: false },
      { capability: 'ASA Code review', assembl: true, legacy: false },
      { capability: 'Tikanga & cultural review pass', assembl: true, legacy: false },
      { capability: 'Multi-channel variants', assembl: true, legacy: 'Yes' },
      { capability: 'NZ data residency', assembl: true, legacy: 'Rarely' },
    ],
    availableOn: 'Operator plan and above (NZ$1,490/mo + setup). Coming soon — launching after Waihanga and Pikau reach five customers each.',
  },

  hoko: {
    slug: 'hoko',
    heroLead: 'Consumer protection compliance for NZ retailers.',
    heroBody:
      "assembl's retail kete covers consumer protection (Consumer Guarantees Act 1993, Fair Trading Act 1986), product safety, and retail employment compliance for New Zealand retailers.",
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
    heroLead: 'Compliance that protects tamariki.',
    heroBody:
      "assembl's early childhood kete covers licensing compliance, child safety, staff vetting, curriculum documentation, and privacy obligations (Privacy Act 2020, IPP 3A) for ECE centres across Aotearoa.",
    workflows: [],
    comparisonLegacyLabel: 'Manual compliance',
    comparison: [
      { capability: 'Privacy Act 2020 IPP 3A documentation', assembl: 'In development', legacy: 'Manual' },
      { capability: 'Licensing compliance records', assembl: 'In development', legacy: 'Manual' },
    ],
    availableOn: 'Coming soon — early childhood kete in development. Register your interest via /contact.',
  },

  toro: {
    slug: 'toro',
    heroLead: 'Your family\'s quiet assistant.',
    heroBody:
      'Tōro is assembl\'s family agent — a personal assistant for household admin, school communications, appointment management, and family scheduling. Available self-serve at the Family tier.',
    features: [
      {
        name: 'Household routines',
        body: 'Morning, after-school, and bedtime routines tracked over SMS — gentle reminders, never nags.',
      },
      {
        name: 'School logistics',
        body: 'Assembly notes, hot-lunch orders, sports gear, school-trip permission slips — captured and surfaced when they are actually needed.',
      },
      {
        name: 'The running list',
        body: 'Groceries, repairs, birthday gifts, library books to return — text it in, Tōro keeps the thread.',
      },
      {
        name: 'Kid-safe by default',
        body: 'Tōro replies only to numbers you have added. No public profile, no surfacing of children\'s data, no upsells inside the conversation.',
      },
      {
        name: 'Te reo Māori, optional',
        body: 'Switch the voice to te reo Māori, English, or both — set per whānau member.',
      },
      {
        name: 'Works on any phone',
        body: 'SMS first, so it works on any phone — older phones, school-issue devices, low-data plans.',
      },
    ],
    price: { monthly: 'NZ$29', setup: '—' },
  },
};
