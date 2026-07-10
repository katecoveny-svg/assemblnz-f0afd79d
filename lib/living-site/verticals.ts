/**
 * Living Site sample verticals — the generic businesses behind /living-site/[vertical].
 *
 * EVERY business, owner, price and testimonial here is FICTIONAL. The Living
 * Site demo deliberately names nobody real: no prospect has agreed to appear,
 * so the whole cast is invented and each sample site wears a demo strip
 * saying so. Dog training is the flagship (its genome lives in Supabase under
 * the long-standing `auckland-dog-trainer` tenant key — the KEY is legacy, the
 * DISPLAYED identity is fictional); the other verticals are seeded by
 * migration 20260719 and read live the same way.
 *
 * One vertical per installer industry — `/install` lands each template on its
 * matching sample site.
 */
import {
  GENOME_FACTS,
  type GenomeFact,
  type GenomeSection,
  type SurfaceId,
} from '@/lib/customers/auckland-dog-trainer/genome';

export type VerticalPalette = {
  /** Structural dark — headings, buttons. */
  ink: string;
  /** Brand accent — eyebrows, prices, links. */
  accent: string;
  /** Page background wash. */
  bg: string;
  /** Card background. */
  card: string;
  /** Muted body copy. */
  muted: string;
};

export type SampleVertical = {
  /** URL segment: /living-site/[slug] — matches the installer industry id. */
  slug: string;
  /** living_site_genome tenant key. */
  tenant: string;
  industryLabel: string;
  businessName: string;
  /** Lowercase strapline under the wordmark. */
  tagline: string;
  /** The fictional owner's first name. */
  owner: string;
  heroHeadline: string;
  heroLede: string;
  palette: VerticalPalette;
  /** Brand-font pairing (getBrandFonts key — reuses loaded font sets). */
  fontSlug: string;
  enquiry: {
    heading: string;
    lede: string;
    detailLabel: string;
    detailPlaceholder: string;
    messagePlaceholder: string;
  };
  /** Only verticals with a real streaming agent route get a chat panel. */
  chat?: {
    apiPath: string;
    agentName: string;
    greeting: string;
    tryMe: string[];
    draftNote: string;
  };
  fallbackFacts: GenomeFact[];
};

const DEFAULT_READ_BY: Record<GenomeSection, SurfaceId[]> = {
  identity: ['website', 'email', 'voice', 'social'],
  services: ['website', 'booking', 'proposals', 'email', 'voice', 'crm'],
  team: ['website', 'booking', 'crm'],
  knowledge: ['website', 'faq', 'voice', 'support'],
  proof: ['website', 'proposals', 'email', 'social'],
  operations: ['booking', 'email', 'crm', 'voice'],
};

function fact(
  section: GenomeSection,
  id: string,
  label: string,
  value: string,
  readBy: SurfaceId[] = DEFAULT_READ_BY[section],
): GenomeFact {
  return { id, section, label, value, readBy };
}

export const SAMPLE_VERTICALS: SampleVertical[] = [
  {
    slug: 'dog-training',
    tenant: 'auckland-dog-trainer',
    industryLabel: 'dog training',
    businessName: 'Harbourside Dog Training',
    tagline: 'calm, method-first training',
    owner: 'Sam',
    heroHeadline: 'Your dog isn’t being difficult. They’re talking.',
    heroLede:
      'Clear communication, calm handling, and walks you both enjoy. Sam works with the dogs other trainers turn away — reactivity, recall, manners — and coaches you, not just your dog.',
    palette: {
      ink: '#1B2A4A',
      accent: '#B87A8A',
      bg: '#F7EEF1',
      card: '#FFFCFB',
      muted: '#6B7389',
    },
    fontSlug: 'auckland-dog-trainer',
    enquiry: {
      heading: 'Tell Sam about your dog',
      lede: 'Every enquiry lands in the CRM, gets triaged by the intake agent, and Sam reads it personally. Bite history or safety worries? Say so — those go to the top of the pile.',
      detailLabel: 'your dog (name · breed)',
      detailPlaceholder: 'Bruno · heading collie x',
      messagePlaceholder: 'Lunging at other dogs on lead, fine off lead. Started three months ago…',
    },
    chat: {
      apiPath: '/api/customers/auckland-dog-trainer/chat',
      agentName: 'the desk',
      greeting:
        "Kia ora — you're on the Harbourside Dog Training desk. I can triage a new enquiry, match a dog to a programme, or answer anything on this page — prices, policies, method. Everything is a draft for Sam's yes; nothing sends.",
      tryMe: [
        'My dog lunges at other dogs on lead — where do we start?',
        'What does Reactivity Rewired cost and how long is it?',
        'Is a muzzle a punishment?',
      ],
      draftNote: "Draft-only: the agent never books a session or emails anyone without Sam's yes.",
    },
    fallbackFacts: GENOME_FACTS,
  },
  {
    slug: 'customs',
    tenant: 'sample-customs',
    industryLabel: 'customs brokerage',
    businessName: 'Gateway Customs Brokers',
    tagline: 'clear the border, calmly',
    owner: 'Ana',
    heroHeadline: 'Your freight, cleared before it costs you.',
    heroLede:
      'Entries lodged fast, tariff codes right the first time, and one broker who answers the phone. Gateway handles air and sea freight for importers who’d rather run their business than learn the tariff.',
    palette: {
      ink: '#13313D',
      accent: '#3D7A8C',
      bg: '#EDF3F4',
      card: '#FDFEFE',
      muted: '#5C6E74',
    },
    fontSlug: 'contact-energy',
    enquiry: {
      heading: 'Tell Ana about your shipment',
      lede: 'Every enquiry is triaged on arrival — perishables and vessel deadlines go to the top of the pile. Ana reads each one before anything is quoted.',
      detailLabel: 'your shipment (goods · origin)',
      detailPlaceholder: 'FCL of joinery hardware · Shenzhen',
      messagePlaceholder: 'First time importing — vessel arrives on the 24th and I don’t know what I owe at the border…',
    },
    fallbackFacts: [
      fact('identity', 'g-name', 'Business', 'Gateway Customs Brokers · clear the border, calmly'),
      fact('identity', 'g-voice', 'Brand voice', 'Plain-spoken, precise, deadline-aware — never jargon-first'),
      fact('identity', 'g-area', 'Service area', 'Ports of Auckland & Tauranga · air + sea freight'),
      fact('services', 'g-entry', 'Import entry & clearance', '$185 + GST · per entry, most consignments'),
      fact('services', 'g-tariff', 'Tariff classification review', '$450 + GST · binding-ruling preparation'),
      fact('services', 'g-reconcile', 'Duty & GST reconciliation', '$120/mo + GST · monthly statement and refund checks'),
      fact('services', 'g-setup', 'New importer setup', '$650 + GST · client codes, registrations, first entry'),
      fact('team', 'g-team', 'Team', 'Ana (licensed broker · lead) · two brokers · one compliance reviewer'),
      fact('knowledge', 'g-faq-gst', 'FAQ · border GST', '“Why is there GST at the border?” → answered in plain language with a worked example'),
      fact('knowledge', 'g-policy-perishables', 'Perishables policy', 'Perishable consignments → same-day entry lodgement, flagged on intake'),
      fact('proof', 'g-testimonials', 'Testimonials', '17 importers · latest: “cleared before the ship berthed”'),
      fact('operations', 'g-booking-rules', 'Service rules', 'Entries lodged within 4 business hours · urgent line for vessel deadlines'),
      fact('operations', 'g-automations', 'Automations', 'Draft-only: entry summaries, client updates, invoice chasers — Ana approves every send', ['email', 'crm', 'support']),
    ],
  },
  {
    slug: 'architecture',
    tenant: 'sample-architecture',
    industryLabel: 'architecture practice',
    businessName: 'Ridgeline Architecture',
    tagline: 'homes that fit their hill',
    owner: 'Theo',
    heroHeadline: 'A home that fits the land, the light, and the life in it.',
    heroLede:
      'Ridgeline designs homes and small commercial spaces across Auckland and the Waikato — from first sketch to lodged consent, in plain English the whole way.',
    palette: {
      ink: '#2A2A26',
      accent: '#A8763E',
      bg: '#F2EFE9',
      card: '#FDFCFA',
      muted: '#6E6A60',
    },
    fontSlug: 'toa-architects',
    enquiry: {
      heading: 'Tell Theo about your project',
      lede: 'Site, budget range, and what the space needs to do — that’s enough to start. Theo reads every enquiry and the first site visit is free.',
      detailLabel: 'your project (site · type)',
      detailPlaceholder: 'Sloping section in Titirangi · new build',
      messagePlaceholder: 'We’ve bought a bush section with a 30° slope and a view we don’t want to waste…',
    },
    fallbackFacts: [
      fact('identity', 'g-name', 'Business', 'Ridgeline Architecture · homes that fit their hill'),
      fact('identity', 'g-voice', 'Brand voice', 'Considered, visual, plain English — no archispeak'),
      fact('identity', 'g-area', 'Service area', 'Auckland & Waikato · residential + small commercial'),
      fact('services', 'g-concept', 'Concept & feasibility', '$4,800 + GST · site visit, massing options, budget range'),
      fact('services', 'g-consent', 'Developed design & consent', 'from $28,000 + GST · through to lodged consent'),
      fact('services', 'g-observe', 'Site observation', '$210/hr + GST · staged inspections through the build'),
      fact('services', 'g-reno', 'Renovation studio', 'from $9,500 + GST · design to consent for alterations'),
      fact('team', 'g-team', 'Team', 'Theo (director) · practice of five · landscape partner on call'),
      fact('knowledge', 'g-faq-cost', 'FAQ · cost', '“What does an architect actually cost?” → answered with worked examples per project size'),
      fact('knowledge', 'g-policy-heritage', 'Heritage policy', 'Heritage overlays → pre-application meeting with council first, always'),
      fact('proof', 'g-testimonials', 'Testimonials', '31 completed homes · latest: “they made the hill the hero”'),
      fact('operations', 'g-booking-rules', 'Service rules', 'First site visit free · fortnightly design reviews · consent milestones tracked'),
      fact('operations', 'g-automations', 'Automations', 'Draft-only: client updates, consent RFIs, invoice reminders — Theo approves every send', ['email', 'crm', 'support']),
    ],
  },
  {
    slug: 'hospitality',
    tenant: 'sample-hospitality',
    industryLabel: 'café & hospitality',
    businessName: 'Wharf Lane Café',
    tagline: 'good coffee, run calmly',
    owner: 'Rosa',
    heroHeadline: 'The café that runs itself between rushes.',
    heroLede:
      'Wharf Lane does brunch, coffee and small functions — with rosters, food-safety records and supplier orders handled by the same system that runs this site.',
    palette: {
      ink: '#3A2B23',
      accent: '#B0653A',
      bg: '#F6EFE8',
      card: '#FFFDFA',
      muted: '#77675C',
    },
    fontSlug: 'lula-inn',
    enquiry: {
      heading: 'Tell Rosa what you’re planning',
      lede: 'Function bookings, standing orders, or a table for twelve — every enquiry is triaged and Rosa confirms before anything is booked.',
      detailLabel: 'your booking (date · group size)',
      detailPlaceholder: 'Saturday the 14th · 18 people',
      messagePlaceholder: 'Work farewell brunch — two long tables, a couple of coeliacs, cake allowed?…',
    },
    fallbackFacts: [
      fact('identity', 'g-name', 'Business', 'Wharf Lane Café · good coffee, run calmly'),
      fact('identity', 'g-voice', 'Brand voice', 'Warm, quick, local — reads like the specials board'),
      fact('identity', 'g-area', 'Location & hours', 'Wynyard-side laneway · 7–3 weekdays, 8–3 weekends'),
      fact('services', 'g-brunch', 'Brunch & coffee', 'Menu $14–$28 · counter + table service'),
      fact('services', 'g-functions', 'Functions', 'from $45/head + GST · after-hours, 20–60 guests'),
      fact('services', 'g-catering', 'Office catering', 'from $12/head + GST · weekday drop-off, ordered by 3pm prior'),
      fact('team', 'g-team', 'Team', 'Rosa (owner · front of house) · chef Ben · roster of eight'),
      fact('knowledge', 'g-faq-dietary', 'FAQ · dietary', '“Can you do gluten-free / dairy-free?” → yes, flagged at booking; separate prep bench'),
      fact('knowledge', 'g-policy-foodsafety', 'Food safety', 'Food Control Plan records logged daily — temperature checks prompt at open and close'),
      fact('proof', 'g-testimonials', 'Testimonials', '4.8★ across 320 reviews · latest: “the flat white that ruined all other flat whites”'),
      fact('operations', 'g-booking-rules', 'Booking rules', 'Groups of 8+ → booked · functions confirmed with deposit · walk-ins first-come'),
      fact('operations', 'g-automations', 'Automations', 'Draft-only: supplier orders, roster gaps, review replies — Rosa approves every send', ['email', 'crm', 'support']),
    ],
  },
  {
    slug: 'trades',
    tenant: 'sample-trades',
    industryLabel: 'trades & construction',
    businessName: 'Brightwork Builders',
    tagline: 'quoted straight, built right',
    owner: 'Mike',
    heroHeadline: 'Renovations without the runaround.',
    heroLede:
      'Brightwork does renovations, decks and small builds across the North Shore — quotes that hold, variations in writing, and a consent trail you can actually follow.',
    palette: {
      ink: '#26303A',
      accent: '#C98A2D',
      bg: '#F1F0EC',
      card: '#FCFCFA',
      muted: '#66707A',
    },
    fontSlug: 'everyday-rewards',
    enquiry: {
      heading: 'Tell Mike about the job',
      lede: 'A few lines and a rough budget is plenty — the intake agent sorts quotes from questions, and Mike walks every site before a number goes on paper.',
      detailLabel: 'your job (type · suburb)',
      detailPlaceholder: 'Deck + pergola · Birkenhead',
      messagePlaceholder: 'South-facing deck is rotten, want to rebuild bigger with a louvre roof…',
    },
    fallbackFacts: [
      fact('identity', 'g-name', 'Business', 'Brightwork Builders · quoted straight, built right'),
      fact('identity', 'g-voice', 'Brand voice', 'Straight-up, specific, no tradie mumble — photos with every update'),
      fact('identity', 'g-area', 'Service area', 'North Shore & upper harbour · renovations, decks, small builds'),
      fact('services', 'g-reno', 'Kitchen & bathroom renovations', 'from $38,000 + GST · design to handover'),
      fact('services', 'g-decks', 'Decks & outdoor rooms', 'from $18,000 + GST · consent handled where needed'),
      fact('services', 'g-smallworks', 'Small works day rate', '$95/hr + GST · two-hour minimum, quoted first'),
      fact('team', 'g-team', 'Team', 'Mike (LBP · lead) · crew of six · sparkie and plumber on call'),
      fact('knowledge', 'g-faq-consent', 'FAQ · consent', '“Do I need consent for a deck?” → answered plainly: height thresholds and when Brightwork lodges it'),
      fact('knowledge', 'g-policy-variations', 'Variations policy', 'No variation proceeds without a written, priced change — signed off in the app'),
      fact('proof', 'g-testimonials', 'Testimonials', '26 jobs reviewed · latest: “finished the deck two days early and left the site cleaner than they found it”'),
      fact('operations', 'g-booking-rules', 'Job rules', 'Site visit before every quote · quotes hold 60 days · progress payments on milestones'),
      fact('operations', 'g-automations', 'Automations', 'Draft-only: quote follow-ups, variation records, council paperwork — Mike approves every send', ['email', 'crm', 'support']),
    ],
  },
  {
    slug: 'health',
    tenant: 'sample-health',
    industryLabel: 'physio & allied health',
    businessName: 'Momentum Physio',
    tagline: 'moving well, for good',
    owner: 'Priya',
    heroHeadline: 'Get moving again — and stay there.',
    heroLede:
      'Momentum treats sports injuries, post-surgery rehab and the niggles you’ve been ignoring — ACC registered, evening appointments, and a plan you actually understand.',
    palette: {
      ink: '#1F3B33',
      accent: '#2E8C6E',
      bg: '#ECF3F0',
      card: '#FCFEFD',
      muted: '#5E6F69',
    },
    fontSlug: 'moana',
    enquiry: {
      heading: 'Tell Priya what’s going on',
      lede: 'Where it hurts, how it started, and what you need to get back to. ACC claims are sorted at booking — you don’t need a referral.',
      detailLabel: 'your injury (what · how long)',
      detailPlaceholder: 'Right knee · three weeks, worse on stairs',
      messagePlaceholder: 'Rolled my ankle at netball six weeks ago and it still isn’t right…',
    },
    fallbackFacts: [
      fact('identity', 'g-name', 'Business', 'Momentum Physio · moving well, for good'),
      fact('identity', 'g-voice', 'Brand voice', 'Encouraging, evidence-based, plain language — never scare-copy'),
      fact('identity', 'g-area', 'Clinic & hours', 'Two rooms + gym floor · weekdays 7–7, Saturday mornings'),
      fact('services', 'g-initial', 'Initial assessment', '$95 · 45 min · ACC surcharge $45'),
      fact('services', 'g-followup', 'Follow-up treatment', '$75 · 30 min · ACC surcharge $35'),
      fact('services', 'g-rehab', 'Rehab programme', '$390 · 6-session block with gym plan'),
      fact('team', 'g-team', 'Team', 'Priya (MNZSP · lead) · two physios · one hand-therapy specialist'),
      fact('knowledge', 'g-faq-acc', 'FAQ · ACC', '“Do I need a referral for ACC?” → no — the claim is lodged at your first visit'),
      fact('knowledge', 'g-policy-redflags', 'Clinical policy', 'Red-flag symptoms → same-day GP/ED referral, never wait-listed'),
      fact('proof', 'g-testimonials', 'Testimonials', '48 recoveries reviewed · latest: “back running the half in ten weeks”'),
      fact('operations', 'g-booking-rules', 'Booking rules', 'Online booking · 24h cancellation · recall reminders at weeks 2 and 6'),
      fact('operations', 'g-automations', 'Automations', 'Draft-only: exercise plans, recall nudges, GP letters — Priya approves every send', ['email', 'crm', 'support']),
    ],
  },
  {
    slug: 'beauty',
    tenant: 'sample-beauty',
    industryLabel: 'salon & beauty',
    businessName: 'Willow & Fern',
    tagline: 'unhurried hair, honest advice',
    owner: 'Jess',
    heroHeadline: 'Hair you don’t have to fight with on Tuesday.',
    heroLede:
      'Willow & Fern is a four-chair salon that books properly, runs on time, and tells you the truth about what your hair will do at home.',
    palette: {
      ink: '#3B2E3A',
      accent: '#A96B8F',
      bg: '#F5EEF3',
      card: '#FEFCFE',
      muted: '#756773',
    },
    fontSlug: 'auckland-zoo',
    enquiry: {
      heading: 'Tell Jess what you’re after',
      lede: 'New colour, a reset cut, or a wedding morning — say what you want and when. Consults are free and nothing is booked until you confirm.',
      detailLabel: 'your appointment (service · timing)',
      detailPlaceholder: 'Balayage refresh · a Saturday this month',
      messagePlaceholder: 'Grown-out balayage, want to go warmer for winter without the brass…',
    },
    fallbackFacts: [
      fact('identity', 'g-name', 'Business', 'Willow & Fern · unhurried hair, honest advice'),
      fact('identity', 'g-voice', 'Brand voice', 'Warm, unhurried, honest — no upsell scripts'),
      fact('identity', 'g-area', 'Salon & hours', 'Four chairs · Tue–Sat · late nights Thursday'),
      fact('services', 'g-cut', 'Cut & finish', 'from $85 · 60 min with consult'),
      fact('services', 'g-colour', 'Colour & balayage', 'from $220 · patch test 48h prior'),
      fact('services', 'g-occasion', 'Occasion styling', 'from $120 · weddings travel by quote'),
      fact('team', 'g-team', 'Team', 'Jess (owner · colour lead) · three stylists · apprentice on Saturdays'),
      fact('knowledge', 'g-faq-patchtest', 'FAQ · patch tests', '“Why do I need a patch test?” → answered plainly: 48 hours before any new colour, no exceptions'),
      fact('knowledge', 'g-policy-corrections', 'Corrections policy', 'Colour corrections → consult first, staged over sessions — hair integrity before speed'),
      fact('proof', 'g-testimonials', 'Testimonials', '4.9★ across 210 reviews · latest: “first salon that listened to what I actually said”'),
      fact('operations', 'g-booking-rules', 'Booking rules', 'Online booking with deposit for 2h+ services · 24h cancellation · rebooking nudge at 6 weeks'),
      fact('operations', 'g-automations', 'Automations', 'Draft-only: rebooking nudges, review replies, retail restock — Jess approves every send', ['email', 'crm', 'support']),
    ],
  },
  {
    slug: 'tutoring',
    tenant: 'sample-tutoring',
    industryLabel: 'tutoring & education',
    businessName: 'Northside Tutoring',
    tagline: 'confidence first, marks follow',
    owner: 'David',
    heroHeadline: 'The tutor who teaches how to learn it, not just what.',
    heroLede:
      'Northside runs one-on-one and small-group tutoring for years 7–13 — maths, sciences and NCEA prep, with progress reports parents can actually read.',
    palette: {
      ink: '#22334A',
      accent: '#3E6FB0',
      bg: '#EDF1F6',
      card: '#FCFDFE',
      muted: '#61708A',
    },
    fontSlug: 'family',
    enquiry: {
      heading: 'Tell David about your learner',
      lede: 'Year level, subjects, and what’s been hard lately. The first session is a free assessment — no lock-in, and David matches the tutor personally.',
      detailLabel: 'your learner (year · subjects)',
      detailPlaceholder: 'Year 11 · maths + physics',
      messagePlaceholder: 'NCEA level 1 maths wobble — confident in class, freezes in assessments…',
    },
    fallbackFacts: [
      fact('identity', 'g-name', 'Business', 'Northside Tutoring · confidence first, marks follow'),
      fact('identity', 'g-voice', 'Brand voice', 'Encouraging, specific, jargon-free — written for parents and students both'),
      fact('identity', 'g-area', 'Where & when', 'In-home across the Shore + online · after school and weekends'),
      fact('services', 'g-one2one', 'One-on-one tutoring', '$75/hr · years 7–13 · maths, sciences, English'),
      fact('services', 'g-group', 'Small-group sessions', '$35/hr per student · max 4, matched by level'),
      fact('services', 'g-ncea', 'NCEA exam prep', '$390 · 6-week block with practice papers'),
      fact('team', 'g-team', 'Team', 'David (owner · maths lead) · eight tutors, all police-vetted'),
      fact('knowledge', 'g-faq-progress', 'FAQ · progress', '“How do I know it’s working?” → progress report after every fourth session, in plain English'),
      fact('knowledge', 'g-policy-safety', 'Safeguarding policy', 'All tutors police-vetted · in-home sessions with a parent present or online'),
      fact('proof', 'g-testimonials', 'Testimonials', '60 students helped · latest: “went from dreading maths to teaching her brother”'),
      fact('operations', 'g-booking-rules', 'Booking rules', 'Free first assessment · same tutor every week · pause any time, no lock-in'),
      fact('operations', 'g-automations', 'Automations', 'Draft-only: progress reports, session summaries, invoice reminders — David approves every send', ['email', 'crm', 'support']),
    ],
  },
];

export function verticalBySlug(slug: string): SampleVertical | undefined {
  return SAMPLE_VERTICALS.find((v) => v.slug === slug);
}

/** Tenant keys that may receive public enquiries. */
export const VERTICAL_TENANTS: ReadonlySet<string> = new Set(
  SAMPLE_VERTICALS.map((v) => v.tenant),
);
