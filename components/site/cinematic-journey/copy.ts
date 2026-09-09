/**
 * Homepage copy for the cinematic 3D preview.
 * Assembl-only product story. Written for Kate's blunt NZ voice + no-AI-slop.
 * No named client / independent-concept panels on home (Kate hard lock).
 */

export const HOME_META = {
  title: 'assembl · active customer journeys',
  description:
    'Every customer journey has moments in between. assembl turns waiting, processing and handoff into useful progress — with specialist agents, human control and proof.',
} as const;

export const NAV = {
  studio: { label: 'Generative Studio', href: '/generative-studio' },
  operator: { label: 'Operator', href: '/admin/login' },
  discuss: {
    label: 'Discuss one wait',
    href: 'mailto:assembl@assembl.co.nz?subject=One%20useful%20customer%20wait',
  },
} as const;

export const HERO = {
  kicker: 'active customer journeys',
  brand: 'assembl',
  headline: 'Make the wait useful.',
  lede: 'While systems process and people review, specialist agents prepare the next step — customer informed, human still in charge.',
  ctaPrimary: { label: 'Watch a journey assemble', href: '#assemble' },
  ctaSecondary: { label: 'Try a live wait', href: '#live-wait' },
  proofLine: 'Quotes · claims · orders · bookings · applications · handoffs · every moment marked processing.',
} as const;

export const ASSEMBLY_BEATS = [
  {
    id: 'intent',
    n: '01',
    label: 'intent',
    title: 'What the customer needs right now.',
    body: 'A clear signal — not a blank chat box. The journey starts from the real situation, not a menu of products.',
  },
  {
    id: 'context',
    n: '02',
    label: 'context',
    title: 'Only the facts approved for this moment.',
    body: 'Application status, household details, preferences — shared with permission, removable before handoff.',
  },
  {
    id: 'rules',
    n: '03',
    label: 'rules',
    title: 'What the agent may prepare. What it may not.',
    body: 'Draft, explain, organise. Never send, approve or commit without a named human saying yes.',
  },
  {
    id: 'agents',
    n: '04',
    label: 'agents',
    title: 'Specialists do the preparatory work.',
    body: 'Not one giant assistant. Named agents with explicit purpose, tools and limits — one coherent service for the customer.',
  },
  {
    id: 'evidence',
    n: '05',
    label: 'evidence',
    title: 'A receipt of what changed.',
    body: 'What context was used, what was prepared, who approved it. The business can measure the result — not just believe it.',
  },
] as const;

export const LOST_TIME = {
  kicker: 'the moments in between',
  title: 'The spinner is lost time.',
  body: 'Not because nothing is happening. Because nothing useful is happening for the customer.',
  before: ['loading', 'checking', 'reviewing', 'assigning', 'preparing'] as const,
  after: ['understand', 'prepare', 'approve', 'hand off', 'prove'] as const,
  closer: 'The wait already exists. The job is what happens inside it.',
} as const;

export const LIVE_WAIT = {
  kicker: 'try an active wait',
  title: 'A real delay. Something useful while it runs.',
  body: 'Pick a moment. Watch the journey prepare the next step — simulated for the demo, live when you talk to an agent.',
  scenarios: [
    {
      id: 'quote',
      label: 'quote in review',
      status: 'Your personalised quote is being reviewed.',
      wait: 'The assessment is still running.',
      prompt: 'While that happens, I can prepare the decision.',
      choices: ['align with payday', 'check my documents', 'show total cost', 'prepare my questions'],
      outcome: 'Adviser-ready summary assembled.',
      detail: 'You reach the next step informed, organised and still in control.',
    },
    {
      id: 'application',
      label: 'application in review',
      status: 'Your application is with the team.',
      wait: 'A specialist is reviewing what you sent.',
      prompt: 'While they work, I can check what is missing.',
      choices: ['check my documents', 'prepare my questions', 'keep me updated', 'explain the next step'],
      outcome: 'Handoff brief ready for review.',
      detail: 'Nothing reaches a named person until you approve what will be shared.',
    },
    {
      id: 'order',
      label: 'order being prepared',
      status: 'Your order is being prepared.',
      wait: 'Fulfilment is still running.',
      prompt: 'While that happens, let’s get the next step ready.',
      choices: ['confirm delivery details', 'add a note for the team', 'see what happens next', 'pause and review'],
      outcome: 'Next-step plan ready.',
      detail: 'Progress stays visible. Approval stays human.',
    },
  ],
} as const;

export const PROOF = {
  kicker: 'proof',
  title: 'Do not ask the business to believe the experience improved. Show it.',
  body: 'Every journey starts with a measurable problem and ends with evidence of what changed.',
  customerSees: {
    label: 'customer sees',
    title: 'the next step, prepared.',
    items: [
      'clear progress',
      'less repeated explanation',
      'visible control',
      'a named person when it matters',
    ],
  },
  businessMeasures: {
    label: 'business can measure',
    title: 'pilot measures',
    items: [
      'completion',
      'customer effort',
      'handoff quality',
      'staff preparation',
      'confidence',
      'conversion',
    ],
    note: 'Example measurement framework · no invented results.',
  },
  fold: 'turn the journey over',
} as const;

export const CLOSE = {
  kicker: 'the active journey sprint',
  title: 'Pick one moment in between. Make it useful.',
  body: 'Choose a customer delay that already exists — uncertainty, repeated explanation, or dead waiting. We design the active journey around it and define how to prove it worked.',
  cta: {
    label: 'Assemble a customer journey',
    href: 'mailto:assembl@assembl.co.nz?subject=Assemble%20one%20customer%20moment&body=The%20customer%20moment%3A%0A%0AWhat%20happens%20today%3A%0A%0AWhat%20I%27d%20like%20to%20improve%3A%0A%0ACompany%3A%0A',
  },
  tagline: 'Find the friction. Assemble the journey. Prove the result.',
} as const;

export const FOOTER = {
  line: 'active customer journeys · mahi that earns its proof.',
  links: [
    { label: 'Generative Studio', href: '/generative-studio' },
    { label: 'Operator', href: '/admin/login' },
    { label: 'contact', href: 'mailto:assembl@assembl.co.nz' },
  ],
} as const;
