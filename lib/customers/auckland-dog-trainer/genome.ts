/**
 * Business Genome — Harbourside Dog Training's single source of truth.
 *
 * Every surface of the Living Site (website, booking flow, proposals, FAQ,
 * voice agent, support assistant, emails, CRM, course, social) reads from
 * these facts. Change a fact once and every surface that reads it updates.
 *
 * SAMPLE only — values track the demo-data offers, never a real transaction.
 */

export type SurfaceId =
  | 'website'
  | 'booking'
  | 'proposals'
  | 'faq'
  | 'voice'
  | 'support'
  | 'email'
  | 'crm'
  | 'course'
  | 'social';

export type GenomeSurface = {
  id: SurfaceId;
  name: string;
  reads: string;
};

export const GENOME_SURFACES: GenomeSurface[] = [
  { id: 'website', name: 'Public website', reads: 'Services, pricing, FAQs, testimonials, hours' },
  { id: 'booking', name: 'Booking flow', reads: 'Offers, booking rules, calendar, deposits' },
  { id: 'proposals', name: 'Proposals & invoices', reads: 'Pricing, policies, payment terms' },
  { id: 'faq', name: 'Knowledge base', reads: 'FAQs, policies, programme curricula' },
  { id: 'voice', name: 'Voice & chat agent', reads: 'Everything — answers only from the genome' },
  { id: 'support', name: 'Support assistant', reads: 'FAQs, curricula, session-note history' },
  { id: 'email', name: 'Email templates', reads: 'Offers, pricing, signatures, follow-up rules' },
  { id: 'crm', name: 'Training CRM', reads: 'Offers, stages, booking rules, next actions' },
  { id: 'course', name: 'Online course', reads: 'Curricula, FAQs, method language' },
  { id: 'social', name: 'Social studio', reads: 'Offers, testimonials, brand voice' },
];

export type GenomeSection =
  | 'identity'
  | 'services'
  | 'team'
  | 'knowledge'
  | 'proof'
  | 'operations';

export type GenomeFact = {
  id: string;
  section: GenomeSection;
  label: string;
  value: string;
  readBy: SurfaceId[];
};

export const GENOME_SECTION_LABELS: Record<GenomeSection, string> = {
  identity: 'Identity & brand',
  services: 'Services & pricing',
  team: 'Team',
  knowledge: 'FAQs & policies',
  proof: 'Testimonials & proof',
  operations: 'Bookings & automations',
};

export const GENOME_FACTS: GenomeFact[] = [
  {
    id: 'g-name',
    section: 'identity',
    label: 'Business',
    value: 'Harbourside Dog Training · calm, method-first',
    readBy: ['website', 'proposals', 'email', 'voice', 'social'],
  },
  {
    id: 'g-voice',
    section: 'identity',
    label: 'Brand voice',
    value: 'Warm, plain-spoken, method-first — never shouty',
    readBy: ['website', 'email', 'voice', 'support', 'social', 'course'],
  },
  {
    id: 'g-area',
    section: 'identity',
    label: 'Service area',
    value: 'Greater Auckland · in-home + Western Springs field',
    readBy: ['website', 'booking', 'voice', 'crm'],
  },
  {
    id: 'g-private',
    section: 'services',
    label: 'Private In-Home Session',
    value: '$299 + GST · assessment + success plan',
    readBy: ['website', 'booking', 'proposals', 'email', 'voice', 'crm'],
  },
  {
    id: 'g-reactivity',
    section: 'services',
    label: 'Reactivity Rewired',
    value: '$2,200 + GST · 6 weeks',
    readBy: ['website', 'booking', 'proposals', 'faq', 'email', 'voice', 'crm', 'course'],
  },
  {
    id: 'g-recall',
    section: 'services',
    label: 'Recall Mastery',
    value: '$1,750 + GST · 4 weeks',
    readBy: ['website', 'booking', 'proposals', 'email', 'voice', 'crm'],
  },
  {
    id: 'g-board',
    section: 'services',
    label: 'Perfect Dog Board & Train',
    value: '$4,500 + GST · 3 weeks live-in',
    readBy: ['website', 'booking', 'proposals', 'email', 'voice', 'crm'],
  },
  {
    id: 'g-bootcamp',
    section: 'services',
    label: 'Group Bootcamp',
    value: 'Launching — Saturday small-group intensives',
    readBy: ['website', 'booking', 'email', 'voice', 'crm', 'social'],
  },
  {
    id: 'g-team',
    section: 'team',
    label: 'Trainers',
    value: 'Sam (method lead) · second trainer hiring — Aroha W. on trial',
    readBy: ['website', 'booking', 'crm'],
  },
  {
    id: 'g-faq-threshold',
    section: 'knowledge',
    label: 'FAQ · thresholds',
    value: '“What is a threshold?” → answered in plain language + 0:48 video',
    readBy: ['website', 'faq', 'voice', 'support', 'course'],
  },
  {
    id: 'g-policy-safety',
    section: 'knowledge',
    label: 'Safety policy',
    value: 'Bite history → private assessment first, never straight to group work',
    readBy: ['booking', 'faq', 'voice', 'support', 'crm'],
  },
  {
    id: 'g-testimonials',
    section: 'proof',
    label: 'Testimonials',
    value: '23 approved · latest: Tank “a reliable house dog in 4 weeks”',
    readBy: ['website', 'proposals', 'email', 'social'],
  },
  {
    id: 'g-booking-rules',
    section: 'operations',
    label: 'Booking rules',
    value: 'Sessions 75 min · travel buffered · Thu/Fri field days · deposit to confirm',
    readBy: ['booking', 'email', 'crm', 'voice'],
  },
  {
    id: 'g-automations',
    section: 'operations',
    label: 'Automations',
    value: 'Draft-only: enquiry replies, homework emails, follow-ups — Sam approves every send',
    readBy: ['email', 'crm', 'support'],
  },
];

/**
 * Living Site ripple scenarios — the "change once, everything updates" demo.
 * Each scenario edits one genome fact and shows the surfaces that update.
 */
export type RippleUpdate = {
  surface: SurfaceId;
  where: string;
  change: string;
};

export type RippleScenario = {
  id: string;
  chip: string;
  factLabel: string;
  before: string;
  after: string;
  narrative: string;
  updates: RippleUpdate[];
  /** How the applied change lands in the genome itself. */
  applies: {
    factId: string;
    value: string;
    /** Present when the change introduces a brand-new fact. */
    adds?: { section: GenomeSection; label: string; readBy: SurfaceId[] };
  };
};

export const RIPPLE_SCENARIOS: RippleScenario[] = [
  {
    id: 'price',
    chip: 'Change a price',
    factLabel: 'Reactivity Rewired · price',
    before: '$2,200 + GST',
    after: '$2,400 + GST',
    narrative:
      'Sam raises the Reactivity Rewired price once, in the genome. No CMS, no duplicate editing — every surface that quotes it rewrites itself.',
    updates: [
      { surface: 'website', where: 'Programme card + pricing section', change: 'Price and “from” copy updated' },
      { surface: 'booking', where: 'Checkout + deposit maths', change: 'Deposit recalculated on the new total' },
      { surface: 'proposals', where: 'Proposal template', change: 'Line item and totals refreshed' },
      { surface: 'faq', where: '“How much does it cost?”', change: 'Answer rewritten with the new price' },
      { surface: 'voice', where: 'Agent answers', change: 'Quotes $2,400 from the next conversation' },
      { surface: 'email', where: 'Enquiry reply drafts', change: 'Draft replies re-priced before Sam approves' },
      { surface: 'crm', where: 'Offer value on open leads', change: 'Pipeline value re-forecast' },
    ],
    applies: {
      factId: 'g-reactivity',
      value: '$2,400 + GST · 6 weeks',
    },
  },
  {
    id: 'faq',
    chip: 'Add an FAQ',
    factLabel: 'FAQ · muzzles',
    before: 'Not in the genome — Sam answers it by hand every week',
    after: '“Is a muzzle a punishment?” → No — a well-fitted muzzle is safety equipment…',
    narrative:
      'The support inbox keeps asking the same question. One approved answer enters the genome and every answering surface learns it at once.',
    updates: [
      { surface: 'website', where: 'FAQ section', change: 'New question published with video slot' },
      { surface: 'faq', where: 'Knowledge base', change: 'Canonical answer stored + versioned' },
      { surface: 'voice', where: 'Voice & chat agent', change: 'Answers it without pinging Sam' },
      { surface: 'support', where: 'Support assistant', change: 'Auto-resolves the repeat thread' },
      { surface: 'course', where: 'Reactivity module', change: 'Lesson callout suggested' },
    ],
    applies: {
      factId: 'g-faq-muzzle',
      value: '“Is a muzzle a punishment?” → No — a well-fitted muzzle is safety equipment',
      adds: { section: 'knowledge', label: 'FAQ · muzzles', readBy: ['website', 'faq', 'voice', 'support', 'course'] },
    },
  },
  {
    id: 'service',
    chip: 'Launch a service',
    factLabel: 'Group Bootcamp',
    before: 'Launching soon — no public path',
    after: 'Live · Saturday intensives · 6 dogs max',
    narrative:
      'Sam flips Group Bootcamp to live. The Living Site builds the whole path — page, bookings, CRM tags, campaign — in one move.',
    updates: [
      { surface: 'website', where: 'New landing section', change: 'Bootcamp page drafted from the curriculum' },
      { surface: 'booking', where: 'Saturday slots', change: '6-dog capacity + waitlist opened' },
      { surface: 'crm', where: 'Lead routing', change: 'Group-fit leads tagged and routed' },
      { surface: 'email', where: 'Waitlist campaign', change: 'Announcement drafted for the 18-person waitlist' },
      { surface: 'voice', where: 'Agent answers', change: 'Recommends bootcamp for group-fit enquiries' },
      { surface: 'social', where: 'Launch posts', change: 'Three drafts queued for approval' },
    ],
    applies: {
      factId: 'g-bootcamp',
      value: 'Live · Saturday small-group intensives · 6 dogs max + waitlist',
    },
  },
  {
    id: 'testimonial',
    chip: 'Approve a testimonial',
    factLabel: 'Testimonial · Diesel',
    before: 'Nirtika’s note sitting in the support inbox',
    after: '“Diesel recalled away from a full dog park. Life-changing.” — approved',
    narrative:
      'One tap approves the quote into the genome. Proof shows up everywhere Sam sells, without touching a page builder.',
    updates: [
      { surface: 'website', where: 'Testimonials + Recall page', change: 'Quote placed beside Recall Mastery' },
      { surface: 'proposals', where: 'Recall proposal template', change: 'Social proof block refreshed' },
      { surface: 'email', where: 'Enquiry reply drafts', change: 'Recall replies cite Diesel’s result' },
      { surface: 'social', where: 'Content queue', change: 'Win-story post drafted' },
    ],
    applies: {
      factId: 'g-testimonials',
      value: '24 approved · latest: Diesel “recalled away from a full dog park. Life-changing.”',
    },
  },
];

export function surfaceName(id: SurfaceId): string {
  return GENOME_SURFACES.find((s) => s.id === id)?.name ?? id;
}

/**
 * The genome after a set of ripple scenarios has been applied — existing
 * facts take the scenario's new value, `adds` scenarios append a new fact.
 * `base` defaults to the in-repo facts; pass live DB facts when available.
 */
export function genomeFactsWith(
  appliedIds: Iterable<string>,
  base: GenomeFact[] = GENOME_FACTS,
): GenomeFact[] {
  const ids = new Set(appliedIds);
  const facts = base.map((f) => ({ ...f }));
  for (const s of RIPPLE_SCENARIOS) {
    if (!ids.has(s.id)) continue;
    const existing = facts.find((f) => f.id === s.applies.factId);
    if (existing) {
      existing.value = s.applies.value;
    } else if (s.applies.adds) {
      facts.push({
        id: s.applies.factId,
        section: s.applies.adds.section,
        label: s.applies.adds.label,
        value: s.applies.value,
        readBy: s.applies.adds.readBy,
      });
    }
  }
  return facts;
}
