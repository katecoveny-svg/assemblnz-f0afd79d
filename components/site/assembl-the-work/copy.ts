/** Public homepage positioning. Product demonstrations are labelled at their entry points. */
export const HOME_META = {
  title: 'assembl — find it. DO it. show it.',
  description: 'Pursuit finds evidence-backed work. DO is the portable agent workforce that gets it moving. Studio turns the result into proof, pitches and experiences. One shared context and factory underneath.',
} as const;

export const PREVIEW_META = {
  title: 'Homepage preview · assembl',
  description: 'Preview of the current assembl system: Pursuit, DO, Studio and the shared Factory beneath them.',
} as const;

export const NAV = {
  products: [
    { label: 'Pursuit', href: 'https://assembl-pursuit.katecoveny.chatgpt.site', emphasis: false, external: true },
    { label: 'DO', href: '/do', emphasis: true },
    { label: 'Studio', href: '/creative-studio', emphasis: false },
  ],
  links: [
    { label: 'How it works', href: '#how-it-works' },
  ],
  cta: { label: 'open DO', href: '#do-input' },
} as const;

export const HERO = {
  brand: 'One system for finding, doing and showing valuable work.',
  headline: 'assembl the work.',
  subhead: 'find it. DO it. show it.',
  body: 'Pursuit finds the work. DO does the work. Studio shows the possibility.',
  explanation: 'Find the opportunity. Bring together the right DOs, tools and context to act on it. Turn the result into something people can see, approve, test or buy.',
  ctaPrimary: { label: 'open Meeting or Household →', href: '#do-input' },
  ctaSecondary: { label: 'see the system', href: '#products' },
  productLine: 'Pursuit · DO · Studio',
  loopLine: 'use one. connect two. run the whole loop.',
} as const;

export const SIGNALS = {
  kicker: 'Pursuit · business intelligence',
  title: 'an opportunity starts with a signal.',
  body: 'A tender opens. A company announces a project. A customer needs the next step. Pursuit brings relevant signals into context so you can see what is worth doing next.',
  flow: [
    { id: 'public', label: 'public sources', examples: 'Tenders · procurement · projects · news · market changes', note: 'Relevant sources, with their dates and evidence.' },
    { id: 'connected', label: 'your business context', examples: 'CRM · email · customer events · company documents', note: 'Only the systems and information you choose to connect.' },
    { id: 'output', label: 'a prepared next move', examples: 'Opportunity brief · buyer research · deadline · response plan', note: 'Review the source, the fit and what still needs checking.' },
  ],
} as const;

export const PRODUCTS = {
  kicker: 'three products · one system',
  title: 'three ways to assembl the work.',
  lede: 'Start with Pursuit, DO or Studio. Each works independently. Together, they connect the opportunity, the work and the proof.',
  items: [
    {
      id: 'pursuit', name: 'Pursuit', verb: '01 · find it.',
      body: 'For teams finding their next opportunity. Bring relevant public signals and permissioned business context into buyer research, a qualified opportunity and a next-step brief.',
      href: 'https://assembl-pursuit.katecoveny.chatgpt.site',
      external: true,
      explore: 'Open Pursuit hub', note: 'Start with the market, company or work you want to understand.',
    },
    {
      id: 'do', name: 'DO', verb: '02 · DO it.', hero: true,
      body: 'Public DO offers Meeting notes and a Household chores board. Record a meeting into notes you can use, or try the demo household board. Drafts only — nothing is sent for you.',
      href: '/do', explore: 'Try DO', note: 'Meeting DO and Household DO on the public face. Deeper tools stay behind sign-in.',
    },
    {
      id: 'studio', name: 'Studio', verb: '03 · show it.',
      body: 'For teams making an idea tangible. Turn a brief or completed work into demonstrators, pitches, websites, campaigns, imagery, film and interactive experiences.',
      href: '/creative-studio', explore: 'Explore Studio', note: 'Use Studio independently or as the proof layer for Pursuit and DO.',
    },
  ],
} as const;

export const DO_INPUT = {
  kicker: 'open DO',
  title: 'what do you need done?',
  placeholder: 'Meeting notes, or a household chores board…',
  submit: 'open DO →',
  honesty: 'Opens public DO — Meeting notes or a Household board. Nothing is sent for you.',
  examples: [
    'Turn today’s meeting into notes with actions and decisions.',
    'Try the demo household chores board for this week.',
    'Record a call and prepare meeting notes you can review.',
  ],
} as const;

export const JOURNEYS = {
  kicker: 'customer journeys · reusable primitive',
  title: 'agentic journeys remain part of the system.',
  body: 'DO can work inside customer journeys as well as standalone tasks — gathering context, preparing the next step, coordinating approvals and leaving evidence.',
  value: 'Rewards, loyalty and partner value belong where they improve the customer outcome, not as interruption.',
  points: [
    { label: 'utility first', text: 'Make the next step genuinely useful.' },
    { label: 'permission visible', text: 'Keep context sharing and consequential actions explicit.' },
    { label: 'proof attached', text: 'Show what happened, why and what still needs a person.' },
  ],
} as const;

export const STUDIO = {
  kicker: 'Studio · creative production',
  title: 'make the possibility visible.',
  body: 'Turn a brief, an opportunity or completed agent work into something people can experience. Demonstrate the journey. Build the pitch. Create the website, campaign or visual concept.',
  cta: { label: 'enter Studio →', href: '/creative-studio' },
  chips: ['demonstrators', 'interactive pitches', 'websites', 'advertising', 'marketing', 'film', '3D experiences'],
} as const;

export const LOOP = {
  kicker: 'how the products connect',
  title: 'one loop. start anywhere.',
  steps: [
    { id: 'signal', label: 'SIGNAL', text: 'Notice a relevant change.' },
    { id: 'find', label: 'FIND', text: 'Understand the opportunity.' },
    { id: 'do', label: 'DO', text: 'Research, prepare, build or act within authority.' },
    { id: 'show', label: 'SHOW', text: 'Make the result tangible.' },
    { id: 'learn', label: 'LEARN', text: 'Use proof and decisions to improve the next job.' },
  ],
} as const;

export const REVIEW = {
  kicker: 'people stay in control',
  title: 'know what is ready. decide what happens next.',
  columns: [
    { id: 'context', name: 'Choose the context', points: ['Agree the outcome and available sources.', 'Choose what can be used and shared.'] },
    { id: 'prepare', name: 'Inspect the work', points: ['Review the prepared result and its evidence.', 'See assumptions, gaps and open questions.'] },
    { id: 'review', name: 'Approve the next step', highlight: true, points: ['A person reviews consequential actions.', 'Sending, submission, publication and spend need the required authority.'] },
  ],
} as const;

export const START = {
  kicker: 'start with DO',
  title: 'open Meeting or Household.',
  body: 'Two tools: meeting notes you can use, and a demo household chores board. Drafts only.',
  primary: { label: 'open DO →', href: '#do-input' },
  secondary: {
    label: 'bring us a company',
    href: 'mailto:assembl@assembl.co.nz?subject=Bring%20us%20a%20company&body=Company%20name%3A%0AWhat%20you%20want%20done%3A%0A',
  },
} as const;

export const FOOTER = {
  line: 'find it. DO it. show it.',
  note: 'One shared context · portable agents · proof that compounds. · Built in New Zealand',
} as const;
