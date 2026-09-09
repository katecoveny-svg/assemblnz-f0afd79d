/**
 * Homepage copy — Kate Hudson craft PREVIEW (declutter pass).
 * Assembl-only product story. Short. No AI slop. No mana/kete labels.
 * No named client / independent-concept panels on home (Kate hard lock).
 */

export const HOME_META = {
  title: 'assembl · agentic customer journeys',
  description:
    'assembl builds agentic customer journeys. Agents prepare the next step. Humans stay in charge. Wait becomes useful — with an evidence receipt.',
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
  lede: 'assembl turns the moments in between — waits, reviews, handoffs — into useful progress. Specialist agents do the preparatory work. A named human stays in charge.',
  ctaPrimary: { label: 'See industry agents', href: '#industries' },
  ctaSecondary: { label: 'Try a live wait', href: '#live-wait' },
  proofLine: 'draft-only · evidence receipt · nothing sends without you',
} as const;

export const STORY = {
  kicker: 'what assembl is',
  title: 'One journey object. Clear control.',
  body: 'A customer journey understands what someone needs, completes the work around them, and proves the experience improved. Agents prepare. Humans approve.',
} as const;

export const WAIT = {
  kicker: 'loyalty wait',
  title: 'The wait becomes useful — and rewarded.',
  body: 'While systems process, assembl fills the gap with progress the customer can use. Every useful action leaves an evidence receipt: what context was used, what was prepared, who approved it.',
  points: [
    {
      label: 'useful',
      text: 'Explain, organise, draft the next step — not another spinner.',
    },
    {
      label: 'rewarded',
      text: 'Loyalty wait: time in delay earns value back, not dead minutes.',
    },
    {
      label: 'receipt',
      text: 'Evidence receipt locks last — measurable, reviewable, honest.',
    },
  ],
} as const;

export type IndustrySourceStatus = 'demo' | 'live';

/**
 * Industry strip — same pattern per vertical: agent ↔ live NZ documents/tools.
 * Label DEMO vs live-source honestly when a feed is not wired yet.
 */
export const INDUSTRIES = {
  kicker: 'industry agents',
  title: 'Connected to tools and live NZ sources.',
  body: 'Each vertical agent reads the same pattern: observe the work, cite the source, draft for approval.',
  items: [
    {
      id: 'arc',
      name: 'Arc',
      vertical: 'architecture',
      href: '/agents/arc',
      line: 'Reads the model. Flags code issues. Drafts fixes that wait for your yes.',
      sources: [
        { label: 'NZ Building Code', status: 'demo' satisfies IndustrySourceStatus },
        { label: 'Parliamentary building updates', status: 'demo' satisfies IndustrySourceStatus },
        { label: 'Health & Safety at Work Act', status: 'demo' satisfies IndustrySourceStatus },
      ],
    },
    {
      id: 'customs',
      name: 'Customs',
      vertical: 'trade & border',
      href: '/agents/customs',
      line: 'Reads the invoice. Flags tariff and origin gaps. Drafts the entry for a broker.',
      sources: [
        { label: 'Customs and Excise Act 2018', status: 'live' satisfies IndustrySourceStatus },
        { label: 'NZ Working Tariff', status: 'live' satisfies IndustrySourceStatus },
      ],
    },
    {
      id: 'forge',
      name: 'Forge',
      vertical: 'automotive',
      href: '/agents/forge',
      line: 'Reads the floor plate. Flags WoF and CCCFA gaps. Holds the service note.',
      sources: [
        { label: 'NZTA WoF / CoF', status: 'demo' satisfies IndustrySourceStatus },
        { label: 'CCCFA disclosure', status: 'demo' satisfies IndustrySourceStatus },
      ],
    },
    {
      id: 'ensemble',
      name: 'Ensemble',
      vertical: 'creative',
      href: '/agents/ensemble',
      line: 'Reads the studio board. Flags ASA and Fair Trading claims. Stages the draft.',
      sources: [
        { label: 'ASA standards', status: 'demo' satisfies IndustrySourceStatus },
        { label: 'Fair Trading Act 1986', status: 'demo' satisfies IndustrySourceStatus },
      ],
    },
  ],
} as const;

export const LIVE_WAIT = {
  kicker: 'try an active wait',
  title: 'A real delay. Something useful while it runs.',
  body: 'Talk to a live specialist in the phone — flagships can cite NZ knowledge when a provider key is configured. The “simulated wait” tab is labelled and separate.',
} as const;

export const CLOSE = {
  kicker: 'start with one moment',
  title: 'Pick one wait. Make it useful.',
  body: 'Choose a customer delay that already exists. We assemble the journey around it and define how to prove it worked.',
  cta: {
    label: 'Assemble a customer journey',
    href: 'mailto:assembl@assembl.co.nz?subject=Assemble%20one%20customer%20moment&body=The%20customer%20moment%3A%0A%0AWhat%20happens%20today%3A%0A%0AWhat%20I%27d%20like%20to%20improve%3A%0A%0ACompany%3A%0A',
  },
  demos: { label: 'Browse journey demos', href: '/journeys' },
  tagline: 'Find the friction. Assemble the journey. Prove the result.',
} as const;

export const FOOTER = {
  line: 'agentic customer journeys · work that earns its proof.',
  links: [
    { label: 'Studio', href: '/generative-studio' },
    { label: 'Journeys', href: '/journeys' },
    { label: 'Operator', href: 'https://demo.assembl.co.nz/admin/login' },
    { label: 'contact', href: 'mailto:assembl@assembl.co.nz' },
  ],
} as const;

export const HEADER_TAG = 'work that earns its proof.' as const;
