/**
 * Homepage copy — the single strings source, mirrored in COPY.md.
 *
 * The simplified public story below was approved by Kate on 17 July 2026.
 * Components import from here so the homepage keeps one short, consistent
 * vocabulary.
 */

export const BRAND = {
  wordmark: 'assembl',
  tagline: 'Mahi that earns its proof. Built in Aotearoa.',
  genomeName: 'Business Genome',
} as const;

export const HERO = {
  signalRail: ['Try it without an account', 'Built in Aotearoa', 'You approve every action'],
  eyebrow: 'Agents for the work behind your business',
  headline: {
    line1: 'Less admin.',
    line2: 'More mahi.',
  },
  lede: 'assembl creates one source of truth for your business, then gives you agents that prepare useful work for your approval.',
  actions: {
    primary: 'Try the live demo',
    secondary: 'Start a pilot',
  },
  proofLine: ['One source of truth', 'Drafts ready to review', 'Nothing sends without you'],
} as const;

/**
 * Mahi-saved calculator (homepage tool). A plain, no-form planning estimate.
 * Assumes half of repetitive admin time is recoverable — labelled as an
 * estimate, never a promise.
 */
export const SAVINGS = {
  eyebrow: 'A two-minute reality check',
  heading: 'How many hours could you get back?',
  body: 'Use your own numbers. We will show a plain planning estimate — no form, no phone call and no inflated promise.',
  peopleLabel: 'People doing repeat admin',
  hoursLabel: 'Admin hours each week, per person',
  repeatableLabel: 'How much of that work is repetitive?',
  repeatableOptions: [
    { value: 20, label: 'a little' },
    { value: 35, label: 'a fair amount' },
    { value: 50, label: 'about half' },
  ],
  hoursShort: 'hrs',
  resultLabel: 'Your mahi-saved estimate',
  resultHeading: 'hours back each week',
  yearlyHoursLabel: 'hours a year',
  workingDaysLabel: 'working days',
  planningNote: 'This estimate assumes half of your repetitive admin time could be recovered. Planning estimate only.',
  liveDemoAction: 'Try the live demo',
  shareAction: 'Share result',
  sharedAction: 'Result shared',
  shareTitle: 'How much time could assembl give back?',
  shareText: (weeklyHours: string, workingDays: number) =>
    `Our assembl planning estimate: ${weeklyHours} hours back each week — about ${workingDays} working days a year.`,
} as const;

export const HOME = {
  metadata: {
    title: 'assembl — less admin, more mahi',
    description: 'assembl creates one source of truth for your business, then gives you agents that prepare the admin for your approval.',
  },
  savings: SAVINGS,
  how: {
    eyebrow: 'How it works',
    heading: 'One workflow. Three clear steps.',
    steps: [
      { number: '01', title: 'We understand it.', body: 'We capture the facts, rules and tools behind one piece of work.' },
      { number: '02', title: 'Agents prepare it.', body: 'Replies, follow-ups, briefs and documents arrive as useful drafts.' },
      { number: '03', title: 'Your team approves it.', body: 'Important actions wait for a person, with sources and status visible.' },
    ],
  },
  pilot: {
    eyebrow: 'Founding pilot · NZ$1,500 + GST',
    heading: 'Start with one workflow.',
    body: 'In ten working days, we build and test one useful workflow around the way your business already works.',
    includes: ['One agreed workflow', 'Your rules and source facts', 'A working, reviewable result'],
    actions: { primary: 'Start a pilot', secondary: 'See the price' },
  },
} as const;

/** Sculpture caption labels — order is genome-first, then the wing cycle. */
export const HERO_CAPTIONS = {
  genome: 'your living business genome',
  wing: 'collective knowledge',
  school: 'coordinated movement',
  matariki: 'patterns become visible',
  rivers: 'work begins to flow',
  place: 'Tāmaki Makaurau · Aotearoa',
} as const;

export const GENOME_SECTION = {
  intro: {
    eyebrow: 'The system becomes visible',
    heading: 'Not another stack of apps. One living map of the business.',
    body: 'Every website answer, booking rule, customer record and agent action reads the same structured Business Genome. Change the source once; each connected surface can prepare the right update for review.',
  },
  systems: ['Business overview', 'People', 'Customers', 'Knowledge', 'Finance', 'Risk', 'Activity'],
  connectedNow: 'connected now',
  mapHeader: { place: 'Fictional Auckland service business', title: 'A living view of today' },
  mapPlace: 'Tāmaki Makaurau · Auckland',
  metrics: [
    { value: '3', label: 'enquiries to review' },
    { value: '1', label: 'improvement prepared' },
    { value: '0', label: 'unapproved sends' },
  ],
  intelligenceTitle: { a: 'assembl is interpreting', b: 'today' },
  intelligence: [
    ['Customer response', 'Three enquiries are ready for review.', 'Open the customer desk'],
    ['Operating signal', 'Friday afternoon has the longest booking gap.', 'Review a draft offer'],
    ['Knowledge risk', 'Two common answers only exist in one person’s inbox.', 'Capture the source'],
  ],
  approvalNote: {
    heading: 'A person stays in control.',
    body: 'Sources, assumptions and approval state travel with the work.',
  },
  action: {
    eyebrow: 'Intelligence in action',
    heading: 'Context becomes useful work.',
    scenarios: [
      {
        number: '01',
        title: 'An enquiry arrives',
        body: 'The customer response agent finds the right service facts, prepares a reply and leaves it on the desk for approval.',
        label: 'Open the customer desk',
      },
      {
        number: '02',
        title: 'A booking becomes a customer',
        body: 'The confirmed request appears in the CRM with its source, next action and the original Business Genome context.',
        label: 'See a working Living Site',
      },
      {
        number: '03',
        title: 'Commercial work stays connected',
        body: 'Proposal and invoice drafts use the approved customer, service and price facts — with reviewer and status visible.',
        label: 'Open the operating dashboard',
      },
      {
        number: '04',
        title: 'The business learns',
        body: 'Repeated customer questions become a suggested knowledge update, ready for a person to review once.',
        label: 'Explore the live genome',
      },
    ],
  },
  agents: {
    eyebrow: 'Agents born from context',
    heading: 'Specialists inside the system — not products on a shelf.',
    body: 'Each capability knows its role, source knowledge, connected tools, permissions, required approvals and success criteria.',
    core: { title: 'Business Genome', sub: 'shared context' },
    list: ['Customer response', 'Operations coordinator', 'Financial monitor', 'Knowledge keeper', 'Growth planner'],
    status: 'connected · reviewed',
  },
  pilot: {
    eyebrow: 'Founding pilot sprint',
    heading: 'Build the first working version of your business.',
    body: 'A focused installation for founding pilots: Business Genome, live dashboard, one priority workflow and the proof needed to decide what comes next.',
    priceCard: { kicker: 'Founding pilot', price: 'NZ$1,500', terms: '+ GST · one focused sprint' },
    includes: ['Business Genome workshop', 'Working Living Site dashboard', 'One connected workflow'],
    cta: 'Apply for a founding pilot',
  },
} as const;

/**
 * The nine Business Genome orbit node labels (Prompt 2 — orbit not yet built).
 * Exact, lowercase, in order.
 */
export const ORBIT_NODES = [
  'pricing',
  'customers',
  'knowledge',
  'services',
  'voice',
  'website',
  'crm',
  'marketing',
  'bookings',
] as const;

/**
 * Conversational build scroll (Prompt 3). Verbatim, in order.
 * DECIDED 2026-07-14 by Kate: the public site opens with "Kia ora."
 */
export const BUILD_SCRIPT = {
  lines: [
    'Kia ora.',
    "Let's build your business.",
    'What do you do?',
    'Tell me about it.',
    "Drop anything you've got.",
  ],
  chips: ['Website', 'PDFs', 'Emails', 'Price list', 'Logo', 'Facebook', 'Google Drive'],
  done: 'Done.',
} as const;

/**
 * Homepage Pattern Studio moment — the brand playground. Drafted from Kate's
 * direction 2026-07-17 ("we imagined the imagery, built the tool to create
 * it"); mirrored in COPY.md, awaiting sign-off.
 */
export const PLAYGROUND = {
  eyebrow: 'Pattern Studio × Ad Studio',
  heading: "We imagined this site's imagery, then built the tool that makes it.",
  body: 'Every moving pattern on this site comes from the Pattern Studio. Paste your web address and it reads your brand — your name, your colour — so you can make your own patterns and ads.',
  urlLabel: 'Your website',
  urlPlaceholder: 'e.g. yourbusiness.co.nz',
  readAction: 'Read my brand',
  readingAction: 'Reading…',
  adsAction: 'Make my ads',
  makingAdsAction: 'Making your ads…',
  openStudioAction: 'Open the Ad Studio',
  patternsAction: 'Open the Pattern Studio',
  heroLiveLabel: 'Your brand, live',
  heroAction: 'Make a motion hero',
  heroMakingAction: 'Directing your motion hero…',
  heroNote: 'A short cinematic hero clip in your brand colour — a draft to review, yours to download.',
  shareAction: 'Share',
  savePatternAction: 'Save this pattern',
} as const;

