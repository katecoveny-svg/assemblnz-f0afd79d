/**
 * Single source of truth for all pricing across the site.
 *
 * LOCKED MODEL — 2026-04-08
 * Plain-English tier names. NZD ex GST. Add 15% GST at invoice.
 *
 * Tier ladder (business):
 *   Operator   $1,490/mo + $590 setup   · 1 kete  · up to 5 seats · 20 evidence packs/mo
 *   Leader     $1,990/mo + $1,290 setup  · 2 kete  · up to 15 seats · 60 evidence packs/mo · quarterly compliance review
 *   Enterprise $2,990/mo + $2,890 setup  · all 5 kete · unlimited seats · 200 evidence packs/mo · 99.9% SLA · NZ data residency · named success manager
 *   Outcome    from $5,000/mo · per-engagement scope · 10–20% of measured savings
 *
 * Consumer:
 *   Family     $29/mo · SMS-first whānau agent · household coordination
 *
 * Setup fees can be split across the first 3 invoices on request.
 *
 * The 7 industry kete + Tōro whānau (V2 expansion 2026-04):
 *   MANAAKI (Hospitality) · WAIHANGA (Construction) · AUAHA (Creative) · ARATAKI (Automotive) · PIKAU (Freight & Customs) · HOKO (Retail)
 *
 * Existing customers on the legacy $199 / $399 / $799 + $749 setup model are
 * grandfathered for 12 months from 2026-04-08 (until 2027-04-08). After that,
 * they roll to the closest new tier with 60 days' written notice.
 *
 * DO NOT introduce te reo on the pricing tier names. Te reo stays on the kete
 * names and the trust layer (Kahu / Iho / Mana / Tā / Mahara). The consumer
 * agent's internal branding (Toro) is unchanged — only the *pricing tier* is
 * called "Family".
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
  },
  leader: {
    name: 'Leader',
    price: 1990,
    period: '/mo',
    currency: 'NZD',
    setup: 1290,
    setupNote: 'Splittable across first 3 invoices on request',
    descriptor: 'Multi-discipline SMEs and growing teams — covers two parts of the business with quarterly compliance review',
    features: [
      '2 industry kete (your pick)',
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
      'All 7 industry kete + Tōro whānau',
      'Unlimited seats',
      'NZ data residency (attested)',
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

/** The 7 industry kete — MANAAKI · WAIHANGA · AUAHA · ARATAKI · PIKAU · HOKO · AKO (V2 expansion) plus Tōro whānau */
export const KETE = [
  {
    key: 'manaaki',
    name: 'Manaaki',
    eng: 'Hospitality',
    desc: 'Food safety, liquor licensing, guest experience, tourism operations',
  },
  {
    key: 'waihanga',
    name: 'Waihanga',
    eng: 'Construction',
    desc: 'Site safety, consenting, project management, quality and sign-off',
  },
  {
    key: 'auaha',
    name: 'Auaha',
    eng: 'Creative',
    desc: 'Brief to publish — copy, image, video, podcast, ads, analytics',
  },
  {
    key: 'arataki',
    name: 'Arataki',
    eng: 'Automotive',
    desc: 'Workshops, fleet, vehicle compliance, service scheduling',
  },
  {
    key: 'pikau',
    name: 'Pikau',
    eng: 'Freight & Customs',
    desc: 'Route optimisation, declarations, broker hand-off, customs compliance',
  },
  {
    key: 'hoko',
    name: 'Hoko',
    eng: 'Retail',
    desc: 'Pricing intelligence, POS-driven re-orders, FTA/CGA compliance lint, unified customer view',
  },
  {
    key: 'ako',
    name: 'Ako',
    eng: 'Early Childhood Education',
    desc: 'Licensing criteria matcher, transparency pack generator, graduated enforcement readiness — built for the 20 April 2026 wedge',
  },
] as const;

/** Feature comparison table data */
export const COMPARISON_FEATURES = [
  { feature: 'Industry Kete', operator: '1', leader: '2', enterprise: 'All 7 + Tōro', outcome: 'All 7 + Tōro + custom' },
  { feature: 'Seats', operator: 'Up to 5', leader: 'Up to 15', enterprise: 'Unlimited', outcome: 'Unlimited' },
  { feature: 'Tikanga — Cultural governance', operator: true, leader: true, enterprise: true, outcome: true },
  { feature: 'Privacy Act 2020 + AAAIP', operator: true, leader: true, enterprise: true, outcome: true },
  { feature: 'SMS & WhatsApp', operator: true, leader: true, enterprise: true, outcome: true },
  { feature: 'Quarterly compliance review', operator: false, leader: true, enterprise: true, outcome: true },
  { feature: 'Monthly audit report', operator: false, leader: true, enterprise: true, outcome: true },
  { feature: 'Named success manager', operator: false, leader: false, enterprise: true, outcome: true },
  { feature: 'NZ data residency (attested)', operator: false, leader: 'Optional', enterprise: true, outcome: true },
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
