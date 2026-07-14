/**
 * Homepage copy — the single strings source, mirroring COPY.md verbatim.
 *
 * Components import from here; no homepage copy is authored inline. Per
 * CLAUDE.md → "Copy rules — non-negotiable": never rewrite, paraphrase,
 * "tighten" or "improve" any string here. If a change seems needed, STOP and
 * ask Kate. Propose; never substitute. Keep this file byte-identical to
 * COPY.md.
 */

export const BRAND = {
  wordmark: 'assembl',
  tagline: 'Mahi that earns its proof. Built in Aotearoa.',
  genomeName: 'Business Genome',
} as const;

export const HERO = {
  signalRail: ['Living Business Genome', 'Built in Aotearoa', 'Human approval stays visible'],
  eyebrow: 'Your business · understood as one living system',
  headline: {
    line1: 'Your business already has a genome.',
    line2: 'assembl makes it intelligent.',
  },
  lede: 'Connect the people, knowledge, customers and workflows you already have. assembl turns that context into a working operating system — with specialised agents, clear permissions and proof before anything consequential changes.',
  actions: {
    primary: 'Build your Business Genome',
    secondary: 'See the living system',
  },
  proofLine: ['One shared source of truth', 'Review before send', 'Sources attached'],
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
