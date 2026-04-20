/**
 * Single source of truth for all pricing across the site.
 *
 * LOCKED MODEL — 2026-04-20 (Kate × Lovable platform-wide lock)
 * Plain-English tier names. NZD ex GST. Add 15% GST at invoice.
 *
 * Tier ladder (business):
 *   Operator   $1,490/mo + $590  setup · 1 industry kete + cross-cutting agents · up to 5  seats
 *   Leader     $1,990/mo + $1,290 setup · 2 industry ketes + cross-cutting agents · up to 15 seats · multi-kete discount eligible
 *   Enterprise $2,990/mo + $2,890 setup · all 7 industry ketes + Tōro + cross-cutting agents · unlimited seats · 99.9% SLA · NZ data residency
 *   Outcome    from $5,000/mo · per-engagement scope · 10–20% of measured savings · Stripe Invoices only
 *
 * Consumer:
 *   Family     $29/mo · SMS-first whānau agent (Tōro) · household coordination
 *
 * Cross-cutting agents included at every paid tier:
 *   AROHA   — HR & Employment Hero
 *   SIGNAL  — Security (NZISM aligned)
 *   SENTINEL — Monitoring & uptime
 *
 * The 8 ketes (7 industry + Tōro):
 *   MANAAKI (Hospitality) · WAIHANGA (Construction) · AUAHA (Creative) ·
 *   ARATAKI (Automotive & Fleet) · PIKAU (Freight & Customs) · HOKO (Retail) ·
 *   AKO (Early Childhood Education) · TŌRO (Family — consumer tier)
 *
 * Operator-as-platform: Business, professional services, and technology
 * customers buy Operator ($1,490/mo + $590 setup, same Stripe SKU) and
 * build on top of Iho + cross-cutting agents. Marketed at /platform.
 *
 * Stripe lookup keys (LOCKED — do not change):
 *   family-29-monthly
 *   operator-1490-monthly · operator-590-setup
 *   leader-1990-monthly   · leader-1290-setup
 *   enterprise-2990-monthly · enterprise-2890-setup
 *   (Outcome = Stripe Invoices, not Products)
 *
 * Multi-kete % discount: NONE. There is no per-kete percentage discount.
 * Bundling is expressed at the tier level (Leader = 2 ketes, Enterprise = 7+Tōro).
 * Extra ketes beyond a tier's bundle are sold à la carte at $290/mo flat (see ADD_ONS).
 * The only stacking discount is ANNUAL12 (12% off annual prepay) on the monthly subscription.
 *
 * Setup fees can be split across the first 3 invoices on request.
 *
 * Retired kete names that MUST NOT appear in user-facing copy:
 *   Hanga · Pakihi · Waka · Hangarau · Hauora · Te Kāhui Reo · Whenua · Ora · Kāinga
 *   (See /docs/legacy-kete-codes.md for the full archive.)
 */

export const PRICING = {
  family: {
    name: 'Family',
    price: 29,
    period: '/mo',
    currency: 'NZD',
    setup: 0,
    descriptor: 'SMS-first AI for NZ whānau — household coordination, no app, just text',
    features: [
      'SMS-first family agent',
      'Household coordination (school, meals, calendar)',
      'Budget tracking',
      'Transport & bus times',
      'Up to 6 family members',
      'Email support',
    ],
    cta: 'Join the waitlist',
    link: '/toroa',
    popular: false,
  },
  operator: {
    name: 'Operator',
    price: 1490,
    period: '/mo',
    currency: 'NZD',
    setup: 590,
    setupNote: 'Splittable across first 3 invoices on request',
    descriptor: 'Sole traders and micro-SMEs — one industry, one team, one source of truth',
    features: [
      '1 industry kete (your pick)',
      'Cross-cutting agents: AROHA (HR), SIGNAL (security), SENTINEL (monitoring)',
      'Up to 5 seats',
      'Tikanga posture — partner, not label. Mead\'s Five Tests applied to Māori-origin content. Sacred content hard-blocked.',
      'Privacy Act 2020 + AAAIP alignment',
      'SMS, WhatsApp & dashboard access',
      '3 training hours / year',
      'Email support, 1 business day',
      '99.0% uptime',
    ],
    cta: 'Talk to us',
    link: '/contact',
    popular: false,
    valueAnchor: '5 hours a week back at $60–$120/hr = $1,300–$2,600/mo recovered. ROI before a single risk event.',
    platformNote: 'For Business, Professional Services, or Technology customers: ask about Operator-as-platform — same $1,490/mo + $590 setup, no industry kete bundle, full platform + cross-cutting agents. You build your own workflows on top of Iho (our governed router).',
  },
  leader: {
    name: 'Leader',
    price: 1990,
    period: '/mo',
    currency: 'NZD',
    setup: 1290,
    setupNote: 'Splittable across first 3 invoices on request',
    descriptor: 'Multi-discipline SMEs and growing teams — two industry ketes plus quarterly compliance review',
    features: [
      '2 industry ketes (your pick)',
      'Cross-cutting agents: AROHA (HR), SIGNAL (security), SENTINEL (monitoring)',
      'Up to 15 seats',
      'Tikanga posture — partner, not label. Mead\'s Five Tests applied to Māori-origin content. Sacred content hard-blocked.',
      'Privacy Act 2020 + AAAIP alignment',
      'Quarterly compliance review (signed)',
      'Monthly audit report',
      '8 training hours / year',
      'Email + chat, 4 business hours',
      '99.5% uptime',
    ],
    cta: 'Talk to us',
    link: '/contact',
    popular: true,
    valueAnchor: 'One avoided compliance event pays for the year — Food Act notice, LBP action, H&S prohibition, or notifiable privacy breach.',
  },
  enterprise: {
    name: 'Enterprise',
    price: 2990,
    period: '/mo',
    currency: 'NZD',
    setup: 2890,
    setupNote: 'Splittable across first 3 invoices on request',
    descriptor: 'Multi-site, regulated, high-stakes operations — every kete, the SLA, and a named human to call',
    features: [
      'All 7 industry ketes + Tōro',
      'Cross-cutting agents: AROHA (HR), SIGNAL (security), SENTINEL (monitoring)',
      'Unlimited seats',
      'NZ data residency (attested, where available)',
      '99.9% uptime SLA',
      'Named success manager',
      'Quarterly compliance review (signed)',
      'Monthly audit report',
      '16 training hours / year',
      'Priority phone + chat, 1 business hour',
    ],
    cta: 'Talk to us',
    link: '/contact',
    popular: false,
    valueAnchor: 'A fraction of a full-time compliance manager ($80k–$120k/yr) with auditable agent decisions and an audit trail that stands up.',
  },
  outcome: {
    name: 'Outcome',
    price: 5000,
    priceLabel: 'from $5,000',
    period: '/mo',
    currency: 'NZD',
    setup: null,
    setupNote: 'Per-engagement scope',
    descriptor: 'Bespoke workflows where Assembl takes on the outcome — freight route optimisation, building maintenance scheduling, fleet uptime',
    features: [
      'All 7 kete + Tōro + custom agent build',
      'Unlimited seats',
      'Named engagement team',
      'Outcome uplift: 10–20% of measured savings',
      'Monthly reconciliation',
      'NZ data residency',
      '99.9% uptime SLA',
    ],
    cta: 'Contact sales',
    link: '/contact',
    popular: false,
    valueAnchor: 'Scoped per engagement. Base + a share of measured savings. Don\'t quote cold — talk to us.',
  },
} as const;

export const CORE_PLATFORM = {
  name: 'Assembl Core',
  description: 'Included in every subscription',
  features: [
    'Iho routing engine',
    'SIGNAL security agent',
    'Compliance pipeline (Kahu → Iho → Tā → Mahara → Mana)',
    'SMS & WhatsApp access',
    'Dashboard & analytics',
    'NZ data residency on Enterprise',
  ],
} as const;

/** The 7 industry kete (Tōro is the consumer tier — see PRICING.family) */
export const KETE = [
  {
    key: 'manaaki',
    name: 'Manaaki',
    eng: 'Hospitality',
    desc: 'Food Act plans, alcohol licences, toolbox talks, rosters, Holidays Act pay. Built for cafés, restaurants, and hotels.',
  },
  {
    key: 'waihanga',
    name: 'Waihanga',
    eng: 'Construction',
    desc: 'Site safety, Building Act consents, subcontractor payments, retention compliance, H&S at Work Act. Built for builders and trades.',
  },
  {
    key: 'auaha',
    name: 'Auaha',
    eng: 'Creative',
    desc: 'Contracts, invoicing, rights management, project briefs, agency ops. Built for design, media, and arts.',
  },
  {
    key: 'arataki',
    name: 'Arataki',
    eng: 'Automotive & Fleet',
    desc: 'MVSA compliance, warrant of fitness workflows, RUC, fleet ops, Land Transport Act. Built for workshops, dealers, and fleet operators.',
  },
  {
    key: 'pikau',
    name: 'Pikau',
    eng: 'Freight & Customs',
    desc: 'Customs and Excise Act, MPI Import Health Standards, Biosecurity Act, freight docs, import/export ops. Built for logistics and customs brokers.',
  },
  {
    key: 'hoko',
    name: 'Hoko',
    eng: 'Retail',
    desc: 'CGA compliance, stock, supplier contracts, POS reconciliations, ecommerce. Built for retailers and online shops.',
  },
  {
    key: 'ako',
    name: 'Ako',
    eng: 'Early Childhood Education',
    desc: 'Licensing criteria, ratio monitoring, parent communications, staff registration. Built for ECE centres and kindergartens.',
  },
] as const;

/** The consumer kete — separate ladder, $29/mo, no setup. */
export const TORO_KETE = {
  key: 'toro',
  name: 'Tōro',
  eng: 'Family',
  desc: 'Admin, contracts, school notices, household documents. Built for families running life.',
  href: '/toro',
} as const;

/** Feature comparison table data */
export const COMPARISON_FEATURES = [
  { feature: 'Industry kete', operator: '1', leader: '2', enterprise: 'All 7 + Tōro', outcome: 'All 7 + Tōro + custom' },
  { feature: 'Cross-cutting agents (AROHA · SIGNAL · SENTINEL)', operator: true, leader: true, enterprise: true, outcome: true },
  { feature: 'Seats', operator: 'Up to 5', leader: 'Up to 15', enterprise: 'Unlimited', outcome: 'Unlimited' },
  { feature: 'Tikanga posture — partner, not label', operator: true, leader: true, enterprise: true, outcome: true },
  { feature: 'Privacy Act 2020 + AAAIP alignment', operator: true, leader: true, enterprise: true, outcome: true },
  { feature: 'SMS & WhatsApp', operator: true, leader: true, enterprise: true, outcome: true },
  { feature: 'Quarterly compliance review', operator: false, leader: true, enterprise: true, outcome: true },
  { feature: 'Monthly audit report', operator: false, leader: true, enterprise: true, outcome: true },
  { feature: 'Named success manager', operator: false, leader: false, enterprise: true, outcome: true },
  { feature: 'NZ data residency (attested, where available)', operator: false, leader: 'Optional', enterprise: true, outcome: true },
  { feature: 'Uptime SLA', operator: '99.0%', leader: '99.5%', enterprise: '99.9%', outcome: '99.9%' },
  { feature: 'Support', operator: 'Email, 1 day', leader: 'Email + chat, 4hrs', enterprise: 'Phone + chat, 1hr', outcome: 'Named team' },
  { feature: 'Training hours / year', operator: '3', leader: '8', enterprise: '16', outcome: 'Scoped' },
] as const;

/** Add-ons available across business tiers */
export const ADD_ONS = [
  { name: 'Extra kete', price: '$290/mo', available: 'Operator, Leader' },
  { name: 'Extra seat', price: '$39/mo', available: 'Operator, Leader' },
  { name: 'Extra training hour', price: '$195', available: 'All tiers' },
  { name: 'White-glove migration', price: '$3,990 one-time', available: 'All tiers' },
  { name: 'Custom agent build', price: 'from $7,500', available: 'All tiers' },
] as const;

/** Plain-English value anchors for the homepage hero */
export const VALUE_ANCHORS = [
  '5 hours a week back',
  'one avoided compliance event pays for itself',
  'a fraction of a full-time compliance manager',
] as const;
