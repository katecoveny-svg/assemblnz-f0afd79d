/**
 * Homepage copy — Kate Hudson craft PREVIEW (declutter + loyalty desk).
 * Assembl-only. Short. No AI slop. No mana/kete. No One NZ / client cards on `/`.
 *
 * Dual-track (do not merge language):
 * 1) Loyalty wait → earn / Evidence receipt — not agent hours-back credits.
 * 2) Vertical agents on live NZ feeds — cite source + as-of; DEMO if not wired.
 */

export const HOME_META = {
  title: 'assembl · agentic customer journeys',
  description:
    'assembl builds agentic customer journeys. Agents prepare the next step. Humans stay in charge. Loyalty wait earns an evidence receipt. Industry agents cite live NZ sources.',
} as const;

export const NAV = {
  studio: { label: 'Studio', href: '/generative-studio' },
  operator: { label: 'Operator', href: 'https://demo.assembl.co.nz/admin/login' },
  journeys: { label: 'Journeys', href: '/journeys' },
  discuss: {
    label: 'Discuss one wait',
    href: 'mailto:assembl@assembl.co.nz?subject=One%20useful%20customer%20wait',
  },
} as const;

export const HERO = {
  kicker: 'agentic customer journeys',
  brand: 'assembl',
  headline: 'Agents prepare.\nYou decide.',
  lede: 'Two tracks on one page: a loyalty wait that earns an evidence receipt, and industry agents that cite live NZ sources. Agents prepare. Humans stay in charge.',
  ctaPrimary: { label: 'Loyalty wait', href: '#loyalty-wait' },
  ctaSecondary: { label: 'Industry agents', href: '#industries' },
  proofLine: 'evidence receipt · draft-only · nothing sends without you',
} as const;

export const STORY = {
  kicker: 'what assembl is',
  title: 'Agentic customer journeys.',
  body: 'Agents prepare the next step around the customer. A named human stays in charge. Proof locks last.',
} as const;

/** Track 1 — loyalty / rewarded wait. Not credits pricing. */
export const WAIT = {
  kicker: 'track 1 · loyalty wait',
  title: 'Wait. Earn. Evidence receipt.',
  body: 'While systems process, the wait becomes useful — and rewarded. Progress the customer can use. An evidence receipt locks what changed. This is not agent hours-back credits.',
  points: [
    {
      label: 'wait',
      text: 'The delay already exists. Fill it with something useful — not a spinner.',
    },
    {
      label: 'earn',
      text: 'Loyalty wait: time in delay earns value back. Not credit packs. Not pricing tiers.',
    },
    {
      label: 'receipt',
      text: 'Evidence receipt: context used, work prepared, who approved — measurable and honest.',
    },
  ],
} as const;

export type IndustrySourceStatus = 'demo' | 'live';

export type IndustrySource = {
  label: string;
  cite: string;
  asOf: string;
  status: IndustrySourceStatus;
};

/**
 * Track 2 — industry agents ↔ live NZ documents/tools.
 * Paper/plum agent-apps. Cite source + as-of. DEMO when the feed is not wired.
 */
export const INDUSTRIES = {
  kicker: 'track 2 · industry agents',
  title: 'Vertical agents on live NZ feeds.',
  body: 'Same pattern each vertical: observe the work, cite the instrument, draft for approval. Paper and plum agent-apps — not partnership claims.',
  items: [
    {
      id: 'arc',
      name: 'Arc',
      vertical: 'architecture',
      href: '/agents/arc',
      line: 'Consent → code → H&S → bill revisions. Arc cites the instrument and holds the draft.',
      metaphor: 'consent → code → H&S → bill revisions',
      sources: [
        {
          label: 'Building Act 2004 / NZ Building Code',
          cite: 'legislation.govt.nz · building.govt.nz',
          asOf: 'Sep 2026',
          status: 'demo' satisfies IndustrySourceStatus,
        },
        {
          label: 'Earthquake-prone Buildings · Amendment Bill 2026',
          cite: 'parliamentary / build updates · Bill 2026 framing',
          asOf: 'Sep 2026',
          status: 'demo' satisfies IndustrySourceStatus,
        },
        {
          label: 'HSWA / WorkSafe guidance',
          cite: 'Health and Safety at Work Act · WorkSafe',
          asOf: 'Sep 2026',
          status: 'demo' satisfies IndustrySourceStatus,
        },
        {
          label: 'BCA data pattern',
          cite: 'Building Consent Authority · MBIE / Stats NZ',
          asOf: 'Sep 2026',
          status: 'demo' satisfies IndustrySourceStatus,
        },
      ],
    },
    {
      id: 'customs',
      name: 'Customs',
      vertical: 'trade & border',
      href: '/agents/customs',
      line: 'Reads the invoice. Flags tariff and origin gaps. Drafts the entry for a broker.',
      metaphor: 'invoice → tariff → origin → entry draft',
      sources: [
        {
          label: 'Customs and Excise Act 2018',
          cite: 'legislation.govt.nz · customs.govt.nz',
          asOf: 'Sep 2026',
          status: 'live' satisfies IndustrySourceStatus,
        },
        {
          label: 'NZ Working Tariff',
          cite: 'NZ Customs Working Tariff Document · HS 2022',
          asOf: 'Sep 2026',
          status: 'live' satisfies IndustrySourceStatus,
        },
      ],
    },
    {
      id: 'forge',
      name: 'Forge',
      vertical: 'automotive',
      href: '/agents/forge',
      line: 'Sales rules, consumer notices, fleet data — cited, then staged for your yes.',
      metaphor: 'MVSA → CIN → NZTA fleet',
      sources: [
        {
          label: 'MVSA',
          cite: 'Motor Vehicle Sales Act · motortraders.govt.nz',
          asOf: 'Sep 2026',
          status: 'demo' satisfies IndustrySourceStatus,
        },
        {
          label: 'CIN',
          cite: 'Consumer Information Notice · comcom.govt.nz',
          asOf: 'Sep 2026',
          status: 'demo' satisfies IndustrySourceStatus,
        },
        {
          label: 'NZTA instruments / WoF–CoF',
          cite: 'NZTA live docs pattern · fleet open data',
          asOf: 'Sep 2026',
          status: 'demo' satisfies IndustrySourceStatus,
        },
      ],
    },
    {
      id: 'ensemble',
      name: 'Ensemble',
      vertical: 'creative',
      href: '/agents/ensemble',
      line: 'Campaign claims cited against ASA and Fair Trading — draft held for approval.',
      metaphor: 'claim → standard → draft',
      sources: [
        {
          label: 'ASA Advertising Standards',
          cite: 'asa.co.nz',
          asOf: 'Sep 2026',
          status: 'demo' satisfies IndustrySourceStatus,
        },
        {
          label: 'Fair Trading Act 1986',
          cite: 'legislation.govt.nz',
          asOf: 'Sep 2026',
          status: 'demo' satisfies IndustrySourceStatus,
        },
      ],
    },
  ],
} as const;

export const LIVE_WAIT = {
  kicker: 'try a loyalty wait',
  title: 'A real delay. Earn the receipt while it runs.',
  body: 'Talk to a live specialist in the phone — flagships can cite NZ knowledge when a provider key is configured. The “simulated wait” tab is labelled and separate. Earn progress — not credits.',
} as const;

export const CLOSE = {
  kicker: 'start with one moment',
  title: 'Pick one wait. Make it useful.',
  body: 'Choose a customer delay that already exists. Assemble the loyalty wait or wire an industry agent to its NZ sources — then prove it with an evidence receipt.',
  cta: {
    label: 'Assemble a customer journey',
    href: 'mailto:assembl@assembl.co.nz?subject=Assemble%20one%20customer%20moment&body=The%20customer%20moment%3A%0A%0AWhat%20happens%20today%3A%0A%0AWhat%20I%27d%20like%20to%20improve%3A%0A%0ACompany%3A%0A',
  },
  demos: { label: 'Browse journey demos', href: '/journeys' },
  tagline: 'Find the friction. Assemble the journey. Prove the result.',
} as const;

export const FOOTER = {
  line: 'loyalty wait · evidence receipt · live NZ sources.',
  links: [
    { label: 'Studio', href: '/generative-studio' },
    { label: 'Journeys', href: '/journeys' },
    { label: 'Operator', href: 'https://demo.assembl.co.nz/admin/login' },
    { label: 'contact', href: 'mailto:assembl@assembl.co.nz' },
  ],
} as const;

export const HEADER_TAG = 'work that earns its proof.' as const;
