/**
 * PREVIEW homepage copy — "assembl the work" commercial architecture.
 * Draft for Kate approval only. Not in COPY.md. Not live on `/`.
 * Do not merge until Kate signs off. Banned: "keep it.", AI slop, bare product claims.
 */

export const PREVIEW_META = {
  title: 'PREVIEW — Homepage: assembl the work (find · DO · show)',
  description:
    'PREVIEW draft. assembl the work — find it. DO it. show it. Three products: Pursuit, DO, Studio. Not live.',
} as const;

export const NAV = {
  products: [
    { label: 'Pursuit', href: '/journeys', emphasis: false },
    { label: 'DO', href: '/do', emphasis: true },
    { label: 'Studio', href: '/creative-studio', emphasis: false },
  ],
  links: [
    { label: 'Use cases', href: '/industries' },
    { label: 'How it works', href: '/how-it-works' },
  ],
  cta: { label: 'give DO a job', href: '/do' },
} as const;

export const HERO = {
  brand: 'assembl',
  headline: 'assembl the work.',
  subhead: 'find it. DO it. show it.',
  body: 'assembl turns live business signals into work.',
  ctaPrimary: { label: 'try DO →', href: '/do' },
  ctaSecondary: { label: 'see how assembl works', href: '#how-it-works' },
  productLine: 'Pursuit · DO · Studio',
  loopLine: 'use one. connect two. run the whole loop.',
} as const;

export const SIGNALS = {
  kicker: 'signals',
  title: 'your business is already producing signals.',
  lede: 'most of them disappear.',
  body: 'Emails, tickets, payments, waits, site visits, compliance dates — they fire every day. assembl catches them before they vanish.',
  flow: [
    { id: 'sources', label: 'sources', examples: 'CRM · inbox · bookings · payments · site · wait' },
    { id: 'assembl', label: 'assembl', examples: 'reads context · ranks urgency · drafts the next step' },
    { id: 'output', label: 'output', examples: 'opportunity · task · journey · pitch · decision' },
  ],
} as const;

export const PRODUCTS = {
  kicker: 'three products · one system',
  title: 'find it. DO it. show it.',
  lede: 'use one. connect two. run the whole loop.',
  items: [
    {
      id: 'pursuit',
      name: 'Pursuit',
      verb: 'find it',
      body: 'Live intelligence and signals that turn into opportunity — who to talk to, what moved, what is worth chasing.',
      href: '/journeys',
      explore: 'explore Pursuit →',
    },
    {
      id: 'do',
      name: 'DO',
      verb: 'DO it',
      hero: true,
      body: 'The outcome product. Say what needs doing. assembl assembles agents, tools and context — then waits for your yes.',
      href: '/do',
      explore: 'open DO →',
    },
    {
      id: 'studio',
      name: 'Studio',
      verb: 'show it',
      body: 'Demonstrators, pitches, sites, campaigns, film and 3D — the elite creative surface that proves the work.',
      href: '/creative-studio',
      explore: 'enter Studio →',
    },
  ],
} as const;

export const DO_INPUT = {
  kicker: 'DO · live input',
  title: 'What do you need done?',
  placeholder: 'e.g. draft a pursuit brief from this RFP…',
  submit: 'give DO the job →',
  honesty: 'DEMO — routes to DO. Nothing sends without a human yes.',
  examples: [
    'chase overdue invoices this week',
    'prepare a customer wait that earns loyalty',
    'turn this RFP into a pursuit brief',
  ],
} as const;

export const JOURNEYS = {
  kicker: 'inside DO',
  title: 'Workflows become journeys.',
  body: 'Agentic waits and loyalty live inside DO as a capability — not as the company definition. Utility first. Reward second. Interruption never.',
  points: [
    {
      label: 'utility first',
      text: 'Fill the delay with something the customer can use — a clear status, a prepared next step, a named owner.',
    },
    {
      label: 'reward second',
      text: 'When the wait earns something back, the value is honest and measurable. Not a spinner with points stuck on.',
    },
    {
      label: 'interruption never',
      text: 'No chatbot takeover. No popup parade. The journey stays in the customer’s path of travel.',
    },
  ],
} as const;

export const STUDIO = {
  kicker: 'Studio',
  title: 'show the work like it matters.',
  body: 'Pitches that land. Sites that breathe. Campaigns, film and 3D that make the outcome undeniable. Studio is where the loop becomes visible.',
  cta: { label: 'open creative studio →', href: '/creative-studio' },
  chips: ['demonstrators', 'pitches', 'sites', 'campaigns', 'film', '3D'],
} as const;

export const LOOP = {
  kicker: 'one loop',
  title: 'SIGNAL → FIND → DO → SHOW → LEARN',
  steps: [
    { id: 'signal', label: 'SIGNAL', text: 'Live business events arrive.' },
    { id: 'find', label: 'FIND', text: 'Pursuit turns noise into opportunity.' },
    { id: 'do', label: 'DO', text: 'Work assembles. Humans approve.' },
    { id: 'show', label: 'SHOW', text: 'Studio makes the outcome visible.' },
    { id: 'learn', label: 'LEARN', text: 'Proof feeds the next signal.' },
  ],
} as const;

export const COMPARE = {
  kicker: 'not just automation',
  title: 'Three ways to handle work.',
  columns: [
    {
      id: 'copilots',
      name: 'Copilots',
      points: ['Chat when asked', 'No durable loop', 'Proof is optional'],
    },
    {
      id: 'automation',
      name: 'Automation',
      points: ['Fixed rules fire', 'Breaks when context shifts', 'Hard to show why'],
    },
    {
      id: 'assembl',
      name: 'assembl',
      highlight: true,
      points: ['Signals become work', 'Agents prepare · humans decide', 'Evidence locks last'],
    },
  ],
} as const;

export const START = {
  kicker: 'start with DO',
  title: 'Give DO one real job.',
  body: 'Pick an outcome. assembl assembles the agents, tools and context. You stay in charge.',
  primary: { label: 'try DO →', href: '/do' },
  secondary: {
    label: 'bring us a company',
    href: 'mailto:assembl@assembl.co.nz?subject=Bring%20us%20a%20company&body=Company%20name%3A%0AWhat%20you%20want%20done%3A%0A',
  },
  note: 'Lead stub — email only until the form ships.',
} as const;

export const FOOTER = {
  line: 'assembl the work · find it · DO it · show it',
  liveNote: 'This page is PREVIEW only. Live homepage remains the cinematic journey until Kate merges.',
} as const;
