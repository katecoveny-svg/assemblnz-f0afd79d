/** Public homepage positioning. Product demonstrations are labelled at their entry points. */
export const HOME_META = {
  title: 'assembl the work. find it. DO it. show it.',
  description: 'Connect business signals, specialist agent work and creative production. Pursuit finds opportunities. DO prepares the work. Studio makes it visible. People review the next step.',
} as const;

export const PREVIEW_META = {
  title: 'Homepage preview · assembl the work.',
  description: 'Preview of the assembl homepage: Pursuit, DO and Studio.',
} as const;

export const NAV = {
  products: [
    { label: 'Pursuit', href: '/pursuit', emphasis: false },
    { label: 'DO', href: '/do', emphasis: true },
    { label: 'Studio', href: '/creative-studio', emphasis: false },
  ],
  links: [
    { label: 'Use cases', href: '#use-cases' },
    { label: 'How it works', href: '#how-it-works' },
  ],
  cta: { label: 'give DO a job', href: '#do-input' },
} as const;

export const HERO = {
  brand: 'Work that earns its proof.',
  headline: 'assembl the work.',
  subhead: 'find it. DO it. show it.',
  body: 'assembl turns live business signals into work.',
  explanation: 'Find the opportunity. Bring together the agents, tools and context to act on it. Then turn the result into something people can see, approve or experience.',
  ctaPrimary: { label: 'give DO a job →', href: '#do-input' },
  ctaSecondary: { label: 'see how assembl works', href: '#how-it-works' },
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
  lede: 'Start with Pursuit, DO or Studio. Each works independently. Together, they connect the opportunity, the work and the experience.',
  items: [
    {
      id: 'pursuit', name: 'Pursuit', verb: '01 · find it.',
      body: 'For teams finding their next opportunity. Bring relevant public signals and permissioned business context into buyer research, a qualified opportunity and a next-step brief.',
      href: '/pursuit',
      explore: 'Explore Pursuit', note: 'Start with your business and the opportunities you want to find.',
    },
    {
      id: 'do', name: 'DO', verb: '02 · DO it.', hero: true,
      body: 'Your writing and task agents, wherever work happens. Draft a reply, polish your writing, turn notes into a plan or work through the options. Review the result and take it with you.',
      href: '/do', explore: 'Try DO', note: 'Use DO here, in your browser or through the downloadable website widget.',
    },
    {
      id: 'studio', name: 'Studio', verb: '03 · show it.',
      body: 'For teams making an idea tangible. Turn an independent brief or prepared work into demonstrators, pitches, websites, advertising, marketing campaigns, imagery and film.',
      href: '/creative-studio', explore: 'Explore Studio', note: 'Open your private creative workspace, or bring a brief for a scoped engagement.',
    },
  ],
} as const;

export const DO_INPUT = {
  kicker: 'give DO a job',
  title: 'what do you need done?',
  placeholder: 'Describe the outcome you need.',
  submit: 'give DO the job →',
  honesty: 'Your brief opens in DO for review before preparation.',
  examples: [
    'Find relevant opportunities for my business and prepare the strongest one.',
    'Turn this tender into a response plan and first draft.',
    'Design a useful customer journey while a quote is being prepared.',
    'Turn this opportunity into a pitch and campaign concept.',
  ],
} as const;

export const JOURNEYS = {
  kicker: 'customer journeys · inside DO',
  title: 'waiting can move the work forward.',
  body: 'While a customer waits for a quote, application, delivery or decision, agents can help prepare what comes next. Gather the missing information. Explain the next step. Prepare the handoff.',
  value: 'Add loyalty, rewards or partner value where it helps the customer.',
  points: [
    { label: 'utility first', text: 'One optional, useful step. The customer can skip it and continue their original task.' },
    { label: 'reward second', text: 'Where agreed, recognise useful participation. Make the value and any sponsor clear.' },
    { label: 'interruption never', text: 'The customer reviews what is shared. A named person or team owns the next step.' },
  ],
} as const;

export const STUDIO = {
  kicker: 'Studio · creative production',
  title: 'make the possibility visible.',
  body: 'Turn a brief, an opportunity or a piece of agent work into something people can experience. Demonstrate the journey. Build the pitch. Create the website, campaign or visual concept.',
  cta: { label: 'enter Studio →', href: '/creative-studio' },
  chips: ['demonstrators', 'interactive pitches', 'websites', 'advertising', 'marketing', 'film', '3D concepts'],
} as const;

export const LOOP = {
  kicker: 'how the products connect',
  title: 'one loop. start anywhere.',
  steps: [
    { id: 'signal', label: 'SIGNAL', text: 'Notice a relevant change.' },
    { id: 'find', label: 'FIND', text: 'Understand the opportunity.' },
    { id: 'do', label: 'DO', text: 'Prepare the work for review.' },
    { id: 'show', label: 'SHOW', text: 'Make it tangible.' },
    { id: 'learn', label: 'LEARN', text: 'Use the response to inform the next brief.' },
  ],
} as const;

export const REVIEW = {
  kicker: 'people stay in control',
  title: 'know what is ready. decide what happens next.',
  columns: [
    { id: 'context', name: 'Choose the context', points: ['Agree the outcome and available sources.', 'Choose what can be used and shared.'] },
    { id: 'prepare', name: 'Inspect the work', points: ['Review the prepared draft and its sources.', 'See assumptions, gaps and open questions.'] },
    { id: 'review', name: 'Approve the next step', highlight: true, points: ['A person reviews consequential actions.', 'Sending, submission and publication need separate approval.'] },
  ],
} as const;

export const START = {
  kicker: 'start with DO',
  title: 'give DO one real job.',
  body: 'Start with an outcome. Bring the context you have. See what can be prepared next.',
  primary: { label: 'give DO a job →', href: '#do-input' },
  secondary: {
    label: 'bring us a company',
    href: 'mailto:assembl@assembl.co.nz?subject=Bring%20us%20a%20company&body=Company%20name%3A%0AWhat%20you%20want%20done%3A%0A',
  },
} as const;

export const FOOTER = {
  line: 'assembl the work. find it. DO it. show it.',
  note: 'Work that earns its proof. · Built in New Zealand.',
  tagline: 'Work that earns its proof.',
  place: 'Built in New Zealand.',
} as const;
