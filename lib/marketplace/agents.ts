/**
 * Agent marketplace registry — LOCKED CANON, unified roster (updated 2026-06-27).
 *
 * 2026-06-27 unification: this registry is now the SINGLE source of truth for
 * both the public /agents grid AND the signed-in detail/chat surfaces. The 19
 * fleet specialists previously only in lib/agents.ts (construction, automotive,
 * freight/customs, hospitality and whānau) were absorbed here with full
 * MarketplaceAgent data + locked prompts. Industry verticals carry
 * `vertical: true` (All-Access $250); consumer agents are flat per-agent. All
 * tiles are cream/canary (no ink) and greetings are English-first per the
 * brand canon. Base roster: LOCKED CANON (2026-06-23).
 *
 * Source of truth, read first: ~/Downloads/dash-gemini/CANON-LOCKED-2026-06-23.md.
 * English name headlines; te reo is a quiet label beside the name (never the
 * headline). Per-agent price tiers: Free / $9.99 / $199. Icons are the canon
 * flat-vector avatars (components/marketplace/AgentIcon.tsx); avatar tile
 * colourway per agent (cream everyday / canary free-featured / ink business).
 *
 * Locked prompts live in agent-prompts.ts, composed with the shared brand
 * prefix server-side and never shipped to the browser. The Supabase `agents`
 * table mirrors this registry via the seed migration.
 */

import { AGENT_PROMPTS, SHARED_BRAND_PREFIX } from './agent-prompts';
import {
  ALL_ACCESS_PLAN,
  getAgentPlan,
  planForAgentPriceNzd,
  priceLabelForNzd,
} from '@/lib/billing/agent-pricing';

export type ModelTier = 'cheap' | 'mid' | 'premium';
/** Coarse DB bucket — uniformly 'per_agent' (price set by the catalogue tier). */
export type PricingTier = 'per_agent' | 'free' | 'freemium' | 'paid';
/** Canon price tiers: Free / $9.99 / $199. */
export type PriceTier = 'free' | 'toro' | 'business';
export type AgentStatus = 'live' | 'coming_soon';
/** Avatar tile colourway (canon). */
export type TileTone = 'cream' | 'canary' | 'ink';

export type MarketplaceCategory = 'start-here' | 'family' | 'business' | 'creative' | 'trades' | 'health' | 'build';

export type MarketplaceAgent = {
  slug: string;
  name: string;
  /** te reo label shown quietly beside the name; '' when the agent has none */
  teReo: string;
  description: string;
  whatItDoes: string[];
  whatYouGet: string[];
  sampleOutputs: string[];
  nzKnowledge: string[];
  tools: string[];
  skills: string[];
  fallbackModels: string[];
  category: MarketplaceCategory;
  modelTier: ModelTier;
  pricingTier: PricingTier;
  priceTier: PriceTier;
  priceNzd: number;
  status: AgentStatus;
  /** canon avatar key (AgentIcon) */
  icon: string;
  /** avatar tile colourway */
  tile: TileTone;
  /** legacy accent hex (kept for back-compat; UI uses `tile`) */
  accent: string;
  /** LOCKED system prompt — server-side only */
  systemPrompt: string;
  greeting: string;
  starters: string[];
  toolHref?: string;
  /** featured in the marketplace — surfaces as the lead "Start here" card */
  featured: boolean;
  /**
   * Industry-vertical premium agent (owns a whole industry, e.g. Arataki for
   * automotive). Verticals are not sold at the flat per-agent rate — they are
   * included in the All-Access plan, so their price label and Subscribe CTA
   * point at All-Access rather than the $15 per-agent checkout.
   */
  vertical: boolean;
};

export const CATEGORIES: { slug: MarketplaceCategory; label: string; teReo: string }[] = [
  { slug: 'start-here', label: 'Start here', teReo: 'Mahere' },
  { slug: 'family', label: 'Family & Whānau', teReo: 'Whānau' },
  { slug: 'business', label: 'Business & SME', teReo: 'Pakihi' },
  { slug: 'creative', label: 'Marketing & Creative', teReo: 'Auaha' },
  { slug: 'trades', label: 'Trades, Ops & Coast', teReo: 'Mahi' },
  { slug: 'health', label: 'Health & Service', teReo: 'Hauora' },
  { slug: 'build', label: 'Build', teReo: 'Hanga' },
];

export const CATEGORY_LABELS: Record<MarketplaceCategory, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.label]),
) as Record<MarketplaceCategory, string>;

// Locked canon palette.
export const PALETTE = {
  canary: '#FFD42A',
  canary2: '#FFE27A',
  ink: '#3A3832',
  body: '#56544B',
  paper: '#FFFFFF',
  cream: '#FFF7EC',
  hairline: '#EFEADC',
  gold: '#C79B1F',
  muted: '#8A8678',
} as const;

export const DASH_MOTIF =
  'repeating-linear-gradient(90deg, #FFD42A 0 20px, transparent 20px 32px)';

/** Free-fallback model ladder after the tier primary (lib/ai/router.ts). */
export const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'groq:llama-3.3-70b-versatile',
  'ollama:llama3.3',
] as const;

const DEFAULT_TOOLS = ['nz-gazette', 'nz-legislation', 'beehive'];

/** Canon price tiers → headline monthly NZD (0 = free). */
const PRICE_TIER_NZD: Record<PriceTier, number> = {
  free: 0,
  toro: 9.99,
  business: 199,
};

/** Avatar tile → background hex. */
export const TILE_BG: Record<TileTone, string> = {
  cream: '#FFF7EC',
  canary: '#FFD42A',
  ink: '#3A3832',
};

/** Authoring shape — the full MarketplaceAgent is derived from this. */
type AgentDef = Omit<
  MarketplaceAgent,
  | 'systemPrompt'
  | 'pricingTier'
  | 'priceNzd'
  | 'status'
  | 'tools'
  | 'skills'
  | 'fallbackModels'
  | 'accent'
  | 'featured'
  | 'vertical'
> & { status?: AgentStatus; tools?: string[]; skills?: string[]; featured?: boolean; vertical?: boolean };

function buildAgent(def: AgentDef): MarketplaceAgent {
  const body = AGENT_PROMPTS[def.slug];
  if (!body) throw new Error(`No locked system prompt for marketplace agent "${def.slug}"`);
  return {
    ...def,
    status: def.status ?? 'live',
    priceNzd: PRICE_TIER_NZD[def.priceTier],
    // Flat per-agent metadata bucket; the catalogue priceTier sets the price.
    pricingTier: 'per_agent',
    tools: def.tools ?? DEFAULT_TOOLS,
    skills: def.skills ?? [],
    fallbackModels: [...FALLBACK_MODELS],
    accent: TILE_BG[def.tile],
    featured: def.featured ?? false,
    vertical: def.vertical ?? false,
    systemPrompt: body.replace('[SHARED BRAND PREFIX]', SHARED_BRAND_PREFIX),
  };
}

const AGENT_DEFS: AgentDef[] = [
  // ── Start here ───────────────────────────────────────────────────────
  {
    slug: 'atlas',
    name: 'Atlas',
    teReo: 'Mahere',
    description:
      'The free AI adoption coach. Maps your week, points you to the agents that fit, and walks you from idea to your first built workflow — honest about where AI will not help.',
    whatItDoes: [
      'Learns your week through plain questions, then finds and scores where AI could help.',
      'Recommends one to three agents from the shelf, or picks one low-risk first build and hands it to Pilot.',
      'Teaches as it goes — eight expert lenses, the Privacy Act 2020 and tikanga, and an honest read on what AI cannot do.',
    ],
    whatYouGet: [
      'A short, honest read on where AI fits your week — and where it does not.',
      'One to three agent picks you can open and try for free, or a first build handed to Pilot.',
      'A one-page roadmap to save or share, and a journey map that tracks your progress, badges and streak.',
    ],
    sampleOutputs: [
      'For school notices and the family calendar, start with Pānui Parser and 9am Brief — both free.',
      'AI will not fix a messy roster on its own. Tidy the availability first, then Roster Sorter can hold it.',
    ],
    nzKnowledge: ['Privacy Act 2020 (IPP 3A, from 1 May 2026)', 'The assembl agent shelf', 'Tikanga considerations for whānau and Māori data'],
    category: 'start-here',
    modelTier: 'mid',
    priceTier: 'free',
    icon: 'atlas',
    tile: 'cream',
    featured: true,
    greeting:
      'I am Atlas, the free AI adoption coach. I will not sell you anything. Tell me what you do most days, and we will find one useful thing to build — starting small and low-risk.',
    starters: [
      'What do you do most days?',
      'What do you repeat every week that feels slow?',
      'Help me find one thing to automate.',
    ],
  },
  // ── Family & Whānau ──────────────────────────────────────────────────
  {
    slug: '9am-brief',
    name: '9am Brief',
    teReo: 'Te Rā',
    description: 'Your day briefed before the kettle boils.',
    whatItDoes: [
      'Scans your calendar, the weather, and what changed overnight.',
      'Surfaces the time-sensitive things first — early starts, drop-offs, deadlines.',
      'Flags anything new or unusual so you can check it.',
    ],
    whatYouGet: [
      'A short brief you can read in two minutes.',
      "A clear 'what needs you today' line.",
      'A pointer to the source for anything that needs a decision.',
    ],
    sampleOutputs: [
      'Today: school assembly 9am, dentist 2pm, rain easing by midday.',
      'Changed overnight: tomorrow’s site visit moved to Thursday.',
    ],
    nzKnowledge: ['MetService', 'NZ school term calendars (MoE)'],
    category: 'family',
    modelTier: 'cheap',
    priceTier: 'free',
    icon: 'brief',
    tile: 'cream',
    greeting: 'Tell me your calendar and where you are, and I will brief your day. Short and plain.',
    starters: ['Brief my day.', 'What changed overnight?', 'What needs me today?'],
  },
  {
    slug: 'fridge-to-list',
    name: 'Fridge-to-List',
    teReo: 'Kete',
    description: 'Snap the fridge, get the shopping list.',
    whatItDoes: [
      'Reads a photo or description of what is in the fridge and pantry.',
      'Builds a categorised shopping list, NZ supermarket-aware.',
      'Suggests a few dinners from what you already have plus a short top-up.',
    ],
    whatYouGet: [
      'A categorised list ready to copy to your phone.',
      'Two or three dinner ideas with the extra items needed.',
      'A use-first note for what is close to its date.',
    ],
    sampleOutputs: [
      'Tonight: tacos from the mince and capsicum you already have.',
      'Shop: 12 items grouped by aisle.',
    ],
    nzKnowledge: ["Pak'nSave / Countdown / New World aisle conventions", 'MPI food-safety guidance'],
    category: 'family',
    modelTier: 'cheap',
    priceTier: 'free',
    icon: 'list',
    tile: 'canary',
    greeting: 'Send a photo or a list of what is in the fridge, and I will sort the shopping and a few dinners.',
    starters: ['Plan a week of dinners.', 'What can I make tonight?'],
  },
  {
    slug: 'panui-parser',
    name: 'Pānui Parser',
    teReo: 'Pānui',
    description: 'School notices in, dates and permission slips out.',
    whatItDoes: [
      'Reads a pasted school pānui, newsletter or email.',
      'Pulls out every date, cost, permission and deadline.',
      'Turns it into a short list of actions for you.',
    ],
    whatYouGet: [
      'A dated list of events, soonest first.',
      'A money-and-permissions summary.',
      'A plain checklist of what you need to do.',
    ],
    sampleOutputs: [
      'Due Fri 28 Jun: $12 museum trip and a signed slip.',
      'Mufti day Wed 3 Jul, gold coin, no uniform.',
    ],
    nzKnowledge: ['NZ school term calendars (MoE)'],
    category: 'family',
    modelTier: 'cheap',
    priceTier: 'toro',
    icon: 'panui',
    tile: 'cream',
    greeting: 'Paste the school notice and I will pull out the dates, costs and what you need to do.',
    starters: ['Parse this newsletter.', 'What permission slips are due?'],
  },
  {
    slug: 'whanau-help',
    name: 'Whānau Help',
    teReo: 'Whānau',
    description: 'Household assistant — appointments, reminders, who is picking up whom.',
    whatItDoes: [
      'Keeps the family logistics straight: appointments, pick-ups, reminders.',
      'Spots clashes and gaps in the week early.',
      'Drafts the coordinating messages — you send them.',
    ],
    whatYouGet: [
      'A simple weekly view of who is doing what.',
      'Draft messages ready to send.',
      'Reminders so nothing slips.',
    ],
    sampleOutputs: [
      'Thursday clash: both kids need collecting at 3pm.',
      'Draft to Nan: are you free to pick up Mia on Friday?',
    ],
    nzKnowledge: ['AT / Metlink / ORC GTFS feeds', 'Privacy Act 2020'],
    category: 'family',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'whanau',
    tile: 'cream',
    greeting: 'Tell me what the week holds and I will keep the appointments, pick-ups and reminders straight.',
    starters: ['Map our week.', 'Who is picking up the kids on Friday?', 'Set a reminder.'],
  },
  {
    slug: 'school-notice',
    name: 'School Notice',
    teReo: 'Kura',
    description: 'Parses the newsletter, adds events to the calendar.',
    whatItDoes: [
      'Reads a school newsletter and finds every event with a date and place.',
      'Drafts calendar entries with clear titles and any cost.',
      'Lists the forms, payments and mufti days tied to them.',
    ],
    whatYouGet: [
      'Draft calendar events ready to add.',
      'A list of actions and due dates.',
      'Recurring items grouped so they are easy to add.',
    ],
    sampleOutputs: [
      'Event: Cross-country, Tue 9 Jul, 10am, school field.',
      'Action: pay $8 for the trip by Friday.',
    ],
    nzKnowledge: ['NZ school term calendars (MoE)'],
    category: 'family',
    modelTier: 'cheap',
    priceTier: 'toro',
    icon: 'bell',
    tile: 'cream',
    greeting: 'Paste the newsletter and I will turn the events into calendar entries for you to add.',
    starters: ['Turn this newsletter into calendar events.', 'What is on this term?'],
  },
  {
    slug: 'care-captain',
    name: 'Care Captain',
    teReo: '',
    description: 'Daily SMS check-in with an elder, escalates on distress.',
    whatItDoes: [
      'Sends a warm daily check-in by SMS and reads the reply.',
      'Notes how the person seems and whether they have what they need.',
      'Escalates to a named caregiver on distress, a fall, or no reply.',
    ],
    whatYouGet: [
      'A daily note for the caregiver: how they seem, anything needed.',
      'A clear flag when someone needs to step in.',
      'A simple record of check-ins over time.',
    ],
    sampleOutputs: [
      'Morning. Did you sleep okay last night — yes or not really?',
      'Caregiver alert: no reply by 11am, second day. Suggest a call.',
    ],
    nzKnowledge: ['Healthline 0800 611 116', 'Health Information Privacy Code 2020'],
    category: 'family',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'careCaptain',
    tile: 'cream',
    greeting: 'I will check in on your loved one each day and let you know if anything looks off. Who am I checking in with, and when?',
    starters: ['Set up a 9am check-in with my dad.', 'What happens if there is no reply?'],
  },

  // ── Business & SME ───────────────────────────────────────────────────
  {
    slug: 'invoice-tidy',
    name: 'Invoice Tidy',
    teReo: '',
    description: 'Reconciles invoices against statements.',
    whatItDoes: [
      'Matches invoices to lines on a bank or supplier statement.',
      'Flags mismatches: wrong amount, missing payment, duplicate.',
      'Notes GST where it is visible, for the bookkeeper to confirm.',
    ],
    whatYouGet: [
      'A reconciliation summary: matched, mismatched, unresolved.',
      'A short list of items needing a human decision.',
      'A clear view of what is paid, part-paid and outstanding.',
    ],
    sampleOutputs: [
      'Mismatch: invoice 1042 is $230, the statement shows $320.',
      'Possible duplicate payment to Mitre 10 on 12 and 14 Jun.',
    ],
    nzKnowledge: ['IRD GST guidance', 'NZBN registry'],
    category: 'business',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'invoice',
    tile: 'cream',
    greeting: 'Upload your invoices and statement and I will reconcile them and flag what does not match. I never edit the books.',
    starters: ['Reconcile this month.', 'Find any duplicate payments.'],
  },
  {
    slug: 'hui-notes',
    name: 'Hui Notes',
    teReo: 'Hui',
    description: 'Joins the meeting, leaves the minutes.',
    whatItDoes: [
      'Turns a transcript or notes into clean minutes.',
      'Pulls out decisions and action items with owners.',
      'Notes open questions and anything parked.',
    ],
    whatYouGet: [
      'Minutes: decisions, actions (owner, due), open questions.',
      'A one-line summary of what the hui was for.',
      'Faithful to what was said — no invented commitments.',
    ],
    sampleOutputs: [
      'Decision: ship the pricing change on Monday.',
      'Action: Mere to update the landing page by Friday.',
    ],
    nzKnowledge: ['Privacy Act 2020'],
    category: 'business',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'hui',
    tile: 'cream',
    greeting: 'Paste a transcript or your notes and I will leave clean minutes — decisions and actions with owners.',
    starters: ['Turn this transcript into minutes.', 'Pull out the actions and owners.'],
  },
  {
    slug: 'roster-sorter',
    name: 'Roster Sorter',
    teReo: '',
    description: 'Builds the staff roster around availability, leave and rules.',
    whatItDoes: [
      'Builds a draft roster from availability, leave and required cover.',
      'Respects breaks and work patterns; flags short cover.',
      'Notes shifts that may trigger overtime or a pay rule to check.',
    ],
    whatYouGet: [
      'A draft roster by day and person, hours totalled.',
      'A list of gaps, clashes and rules to check.',
      'A fair spread of hours where the rules allow.',
    ],
    sampleOutputs: [
      'Saturday is one short on the close — no one available after 6pm.',
      'Heads up: Sam hits overtime if you add Thursday.',
    ],
    nzKnowledge: ['Holidays Act 2003', 'Employment Relations Act 2000'],
    category: 'business',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'roster',
    tile: 'cream',
    greeting: 'Give me availability, leave and the cover you need, and I will draft a roster and flag the rules to check.',
    starters: ['Draft next week’s roster.', 'Where am I short on cover?'],
  },
  {
    slug: 'inbox-triage',
    name: 'Inbox Triage',
    teReo: '',
    description: 'Sorts the morning inbox into reply-now, later, never.',
    whatItDoes: [
      'Reads new email and sorts it: reply now, later, no reply.',
      'Flags anything urgent or from a key contact.',
      'Drafts short replies for the reply-now items.',
    ],
    whatYouGet: [
      'Three buckets so you see the morning fast.',
      'Draft replies, clearly marked as drafts.',
      'A list of what can be archived or ignored.',
    ],
    sampleOutputs: [
      'Reply now: supplier needs the PO number by noon.',
      'Drafted: a two-line reply to the council enquiry.',
    ],
    nzKnowledge: ['Privacy Act 2020'],
    category: 'business',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'inbox',
    tile: 'cream',
    greeting: 'I will sort the morning inbox into reply-now, later and never, and draft the quick replies for you to send.',
    starters: ['Triage my inbox.', 'Draft replies for the urgent ones.'],
  },
  {
    slug: 'travel-logs',
    name: 'Travel Logs',
    teReo: 'Haerenga',
    description: 'Receipts and trips into a clean, IRD-ready expense claim.',
    whatItDoes: [
      'Reads receipts and trip records and sorts them into a claim.',
      'Applies mileage and expense categories per IRD guidance.',
      'Flags receipts missing GST or a clear business purpose.',
    ],
    whatYouGet: [
      'A draft claim: date, category, amount, GST, purpose.',
      'A list of items needing a receipt or a clearer purpose.',
      'A clear split of business versus personal.',
    ],
    sampleOutputs: [
      'Mileage: 320km at the IRD rate — confirm the rate before filing.',
      'Flag: the café receipt has no business purpose noted.',
    ],
    nzKnowledge: ['IRD mileage and expense rules'],
    category: 'business',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'koru',
    tile: 'cream',
    greeting: 'Send your receipts and trips and I will draft a tidy, IRD-ready expense claim. I never file it.',
    starters: ['Build this month’s claim.', 'Which receipts are missing detail?'],
  },
  {
    slug: 'tax-tidy',
    name: 'Tax Tidy',
    teReo: '',
    description: 'GST, PAYE, provisional tax.',
    whatItDoes: [
      'Organises GST, PAYE and provisional tax workings.',
      'Sorts transactions into the right boxes and totals them.',
      'Flags due dates so nothing is missed.',
    ],
    whatYouGet: [
      'Draft workings with totals and a plain-words explanation.',
      'A list of due dates and items needing an accountant.',
      'A clear set-this-aside figure.',
    ],
    sampleOutputs: [
      'GST to set aside this period: about $2,740. Every line referenced.',
      'Provisional tax due 28 Aug — drafted, ready for your accountant.',
    ],
    nzKnowledge: ['IRD tax-rate tables', 'Tax Administration Act 1994'],
    category: 'business',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'tax',
    tile: 'cream',
    greeting: 'Give me your numbers and I will draft the GST, PAYE and provisional tax workings. General help, not advice — I never file.',
    starters: ['What should I set aside for GST?', 'Draft my provisional tax.'],
  },
  {
    slug: 'meeting-records',
    name: 'Meeting Records',
    teReo: '',
    description: 'A searchable record of every meeting.',
    whatItDoes: [
      'Keeps transcripts and summaries of meetings in one place.',
      "Answers 'what did we decide about X' with the relevant moment.",
      'Links every answer back to the meeting and the point in the transcript.',
    ],
    whatYouGet: [
      'A searchable memory of every meeting.',
      'A direct answer plus the supporting quote.',
      'On-request summaries of past meetings.',
    ],
    sampleOutputs: [
      'You decided to delay the launch in the 4 Jun standup — here is the moment.',
      'Summary: three decisions, two open questions, with links back.',
    ],
    nzKnowledge: ['Privacy Act 2020'],
    category: 'business',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'mic',
    tile: 'cream',
    greeting: 'Ask me what was decided or said in any past meeting and I will find the moment and point you to it.',
    starters: ['What did we decide about pricing?', 'Summarise last week’s standup.'],
  },
  {
    slug: 'power-watch',
    name: 'Power Watch',
    teReo: '',
    description: 'Reads the power bill, finds a cheaper plan.',
    whatItDoes: [
      'Reads a power bill: usage, rate, daily charge, plan.',
      'Compares against NZ retailers’ published plans.',
      'Shows an illustrative saving if a cheaper plan fits.',
    ],
    whatYouGet: [
      'A short comparison with the assumptions stated.',
      'An illustrative annual difference, marked as an estimate.',
      'A pointer to Powerswitch to confirm.',
    ],
    sampleOutputs: [
      'On your usage, a low-user plan could save about $180 a year — an estimate to verify.',
      'Check Powerswitch and the retailer before switching.',
    ],
    nzKnowledge: ['Powerswitch', 'NZ electricity retailers'],
    category: 'business',
    modelTier: 'cheap',
    priceTier: 'free',
    icon: 'power',
    tile: 'canary',
    greeting: 'Send your power bill and I will see whether a cheaper plan fits your usage. Illustrative, not advice.',
    starters: ['Check my power bill.', 'Could I save by switching?'],
  },

  // ── Trades, Ops & Coast ──────────────────────────────────────────────
  {
    slug: 'arataki',
    name: 'Arataki',
    teReo: 'Arataki',
    description:
      'The automotive agent that runs a dealership end to end — sales compliance, finance disclosure, the service lane, courtesy cars, and heavy-transport operations.',
    whatItDoes: [
      'Prepares the Consumer Information Notice and CCCFA finance disclosure for every sale, and checks trader registration, PPSR and odometer history.',
      'Runs the service lane: VIRM-based WoF/CoF checks, workshop job cards, LVV modification tracking, and courtesy-car logistics.',
      'Keeps the commercial fleet legal — Transport Service Licence, work-time and logbooks, Road User Charges and VDAM mass and load.',
    ],
    whatYouGet: [
      'A complete, accurate CIN and a CCCFA disclosure statement ready for the trader to issue.',
      'WoF/CoF inspection records with the specific VIRM references, and job cards with the customer approval trail.',
      'A Motor Vehicle Disputes Tribunal response pack, and TSL / work-time / RUC records ready for an auditor.',
    ],
    sampleOutputs: [
      'CIN drafted: 2018 Mazda CX-5, odometer 84,210km (confirm against service history), WoF expires 12 Aug — recall check clear.',
      'Finance: $28,990 over 48 months at 12.9% — disclosure drafted with total payable, fees and payment schedule; affordability inquiry and 5-day cancellation right noted.',
      'Courtesy car DEAL-4471 is 2 days overdue. The customer is also service-due — one call covers both.',
    ],
    nzKnowledge: [
      'Motor Vehicle Sales Act 2003',
      'Consumer Guarantees Act 1993',
      'Fair Trading Act 1986',
      'Credit Contracts and Consumer Finance Act 2003',
      'Land Transport Act 1998 + VIRM',
      'Road User Charges Act 2012',
    ],
    category: 'trades',
    modelTier: 'premium',
    priceTier: 'business',
    vertical: true,
    icon: 'car',
    tile: 'cream',
    greeting:
      'Tell me the vehicle, the customer, or the job and I will prepare it — a compliant CIN, a finance disclosure, a WoF record, or a fleet check. A registered trader, inspector or broker reviews and acts; I never lodge or issue.',
    starters: [
      'Draft a Consumer Information Notice for this trade-in.',
      'Prepare the CCCFA disclosure for a $24,990 finance deal.',
      'What does this vehicle need to pass its WoF?',
      'Is my driver within work-time limits this week?',
    ],
    toolHref: '/operator/arataki/service-match',
  },
  {
    slug: 'customs-entry',
    name: 'Customs Entry',
    teReo: '',
    description: 'Drafts the import entry from invoice and packing list.',
    whatItDoes: [
      'Reads the commercial invoice and packing list.',
      'Suggests tariff classifications against the NZ Working Tariff.',
      'Flags duty, GST and missing documents for the broker.',
    ],
    whatYouGet: [
      'A draft entry: line items, HS suggestions, values, origin.',
      'A list of assumptions the broker must confirm.',
      'A missing-documents checklist before lodging.',
    ],
    sampleOutputs: [
      'Line 1: LED fittings → HS 9405.11 (confirm), duty 5%.',
      'Missing: the supplier’s country-of-origin declaration.',
    ],
    nzKnowledge: ['Customs and Excise Act 2018', 'NZ Working Tariff', 'MPI BACC'],
    category: 'trades',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'container',
    tile: 'cream',
    greeting: 'Paste the invoice and packing list and I will draft the import entry. A licensed broker checks and lodges — I never lodge.',
    starters: ['Draft an entry from this invoice.', 'Classify the HS tariff.'],
  },
  {
    slug: 'food-temp-logs',
    name: 'Food Temp Logs',
    teReo: '',
    description: 'Daily fridge and cool-store logs.',
    whatItDoes: [
      'Records daily fridge, freezer and cool-store readings.',
      'Compares each to the safe range in your Food Control Plan.',
      'Flags out-of-range readings and prompts a corrective action.',
    ],
    whatYouGet: [
      'A tidy, time-stamped log ready for your verifier.',
      'Out-of-range alerts with a suggested action.',
      'Missed checks logged so the record is complete.',
    ],
    sampleOutputs: [
      'Fridge 2 at 6.1°C — above 5°C. Suggested action: move stock, call the tech.',
      'Today: 6 checks, all in range except Fridge 2 (resolved).',
    ],
    nzKnowledge: ['Food Act 2014', 'Food Control Plan requirements'],
    category: 'trades',
    modelTier: 'cheap',
    priceTier: 'business',
    icon: 'temp',
    tile: 'cream',
    greeting: 'Read me your temperature checks and I will log them, flag anything out of range, and keep it ready for your verifier.',
    starters: ['Log today’s temps.', 'What do I do if a fridge is too warm?'],
  },
  {
    slug: 'stock-count',
    name: 'Stock Count',
    teReo: '',
    description: 'Walk the shelves, talk the counts.',
    whatItDoes: [
      'Takes a spoken or typed walk of the shelves and captures counts.',
      'Matches each count to the right product and unit.',
      'Flags discrepancies against expected quantities.',
    ],
    whatYouGet: [
      'A structured stocktake: product, unit, quantity.',
      'A discrepancy list: counted versus expected.',
      'A note of what is low, missing or over-stocked.',
    ],
    sampleOutputs: [
      'Counted 14 of SKU 2203 — system expected 20. Gap of 6.',
      'Low: only 3 left of the house lager.',
    ],
    nzKnowledge: ['Privacy Act 2020'],
    category: 'trades',
    modelTier: 'cheap',
    priceTier: 'business',
    icon: 'stock',
    tile: 'cream',
    greeting: 'Walk the shelves and talk or type the counts, and I will build the stocktake and flag the gaps. I never adjust the system.',
    starters: ['Start a stock count.', 'Where are the discrepancies?'],
  },
  {
    slug: 'compliance-check',
    name: 'Compliance Check',
    teReo: '',
    description: 'Certs, H&S and renewals.',
    whatItDoes: [
      'Keeps a register of certs, licences and training with expiry dates.',
      'Tracks the health and safety obligations that apply.',
      'Flags what is due, expiring soon or overdue.',
    ],
    whatYouGet: [
      'A status register: item, owner, expiry, status.',
      'A short list of renewals and gaps needing action.',
      'Draft reminders for the renewals.',
    ],
    sampleOutputs: [
      'Overdue: the first-aid certificate expired last week.',
      'Due in 30 days: the gas cert and two inductions.',
    ],
    nzKnowledge: ['Health and Safety at Work Act 2015', 'WorkSafe guidance'],
    category: 'trades',
    modelTier: 'mid',
    priceTier: 'business',
    icon: 'shield',
    tile: 'cream',
    greeting: 'Give me your certs and obligations and I will track the expiries and flag what is due. I never renew or certify.',
    starters: ['What is expiring soon?', 'Track our certifications.'],
  },
  {
    slug: 'building-consent',
    name: 'Consent',
    teReo: 'Whakaaetanga',
    description:
      'NZ Building Code specifications, product technical statements and consent-package QA/QC — drafted for your architect to review.',
    whatItDoes: [
      'Writes specifications in the Masterspec three-part format, referencing the current Building Code Acceptable Solutions.',
      'Runs QA/QC on a consent package: flags missing documents, drawing-to-spec mismatches and code gaps with a risk rating.',
      'Cross-references Building Code clauses to spec sections and reviews material choices against the Te Aranga design principles.',
    ],
    whatYouGet: [
      'A three-part specification (General, Products, Execution) ready for a licensed architect to review.',
      'A QA/QC flag table: item, risk, code reference, remediation.',
      'A Te Aranga review and an authentication block on every draft.',
    ],
    sampleOutputs: [
      'HIGH risk: cladding specified but no E2/AS1 weathertightness documentation in the package.',
      'Spec section 4.2 meets H1/AS1 6th edition; the bracing schedule is missing — flag before lodgement.',
    ],
    nzKnowledge: ['NZ Building Code Acceptable Solutions (B1, B2, E2, E3, G4, H1)', 'NZS 3604', 'Building Act 2004 (Clause 14G)', 'Auckland Unitary Plan', 'Te Aranga Māori Design Principles'],
    skills: ['masterspec-specification-agent'],
    category: 'build',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'shield',
    tile: 'cream',
    greeting:
      'Give me your project and I will draft the specification in Masterspec format and flag what is missing from the consent package. Everything I produce is a draft for your licensed architect to review.',
    starters: ['Write a basic residential specification.', 'QA my consent package.'],
  },
  {
    slug: 'maritime-brief',
    name: 'Maritime Brief',
    teReo: 'Moana',
    description: 'Tides, swell, wind, notices.',
    whatItDoes: [
      'Pulls tides, swell, wind and the marine forecast for your window.',
      'Notes relevant Maritime NZ notices and warnings.',
      'Summarises the window of concern through the day.',
    ],
    whatYouGet: [
      'A pre-departure brief: tides, wind, swell, notices.',
      'The window of concern called out clearly.',
      'A reminder line and the official sources to confirm.',
    ],
    sampleOutputs: [
      '1.2m swell easing, high tide 13:40 — a fair window this afternoon.',
      'Notice: navigational warning for the harbour entrance.',
    ],
    nzKnowledge: ['Maritime NZ', 'MetService Marine', 'LINZ tides'],
    category: 'trades',
    modelTier: 'mid',
    priceTier: 'business',
    icon: 'anchor',
    tile: 'cream',
    greeting: 'Tell me the area and your window and I will brief the tides, wind, swell and notices. The call to go is always yours.',
    starters: ['Brief tomorrow’s trip on the Hauraki Gulf.', 'What are the tides this afternoon?'],
  },
  {
    slug: 'tide-weather',
    name: 'Tide & Weather',
    teReo: '',
    description: 'Local marine forecast in plain words.',
    whatItDoes: [
      'Gives tides, wind and swell for a chosen spot.',
      'Translates the forecast into plain language.',
      'Flags the best and worst windows of the day.',
    ],
    whatYouGet: [
      'A plain-words forecast anyone can read.',
      'The day’s windows, good and rough.',
      'A pointer to MetService and Maritime NZ to confirm.',
    ],
    sampleOutputs: [
      'Calm this morning, wind building to 20 knots after lunch.',
      'Best window: before 11am. Confirm with MetService.',
    ],
    nzKnowledge: ['MetService Marine', 'Maritime NZ', 'LINZ tides'],
    category: 'trades',
    modelTier: 'cheap',
    priceTier: 'free',
    icon: 'tide',
    tile: 'canary',
    greeting: 'Tell me your spot and I will give the tides and marine forecast in plain words. Always confirm with MetService.',
    starters: ['Forecast for Raglan bar this afternoon.', 'When are the tides today?'],
  },
  {
    slug: 'catch-log',
    name: 'Catch Log',
    teReo: 'Ika',
    description: "Logbook for the day's catch.",
    whatItDoes: [
      'Records species, quantity, size, location and time.',
      'Builds a tidy log of the day on the water.',
      'Keeps a running record across trips.',
    ],
    whatYouGet: [
      'A log entry per catch.',
      'A trip summary at the end of the day.',
      'A pointer to MPI for the rules and limits.',
    ],
    sampleOutputs: [
      'Logged: 3 snapper, ~35cm, off Kawau, 7:40am.',
      'For limits, check MPI’s recreational fishing rules.',
    ],
    nzKnowledge: ['MPI recreational fishing rules', 'NZ Fishing Rules app'],
    category: 'trades',
    modelTier: 'cheap',
    priceTier: 'free',
    icon: 'fish',
    tile: 'canary',
    greeting: 'Tell me what you caught and I will keep the logbook. For limits and rules, I will point you to MPI.',
    starters: ['Log a catch.', 'Show today’s trip.'],
  },

  // ── Health & Service ─────────────────────────────────────────────────
  {
    slug: 'care-scribe',
    name: 'Care Scribe',
    teReo: '',
    description: 'Writes the clinical note while you focus on the patient.',
    whatItDoes: [
      'Turns a consult into a structured clinical note, such as SOAP.',
      'Drafts referrals and follow-up notes for review.',
      'Flags where the record is unclear and needs confirming.',
    ],
    whatYouGet: [
      'A structured note, marked as a draft for review.',
      'A short list of items needing the clinician to confirm.',
      'A faithful record of the consult.',
    ],
    sampleOutputs: [
      'SOAP drafted; assessment and plan captured — clinician to confirm.',
      'Flag: the dosage mentioned was unclear; please confirm.',
    ],
    nzKnowledge: ['Health Information Privacy Code 2020', 'HPCAA 2003'],
    category: 'health',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'scribe',
    tile: 'cream',
    greeting: 'With per-visit consent in place, paste or record the consult and I will draft the clinical note. I never diagnose — sign-off stays with you.',
    starters: ['Draft a SOAP note from this consult.', 'Write a referral letter.'],
  },
  {
    slug: 'voice-cs',
    name: 'Voice CS',
    teReo: '',
    description: 'Answers the phones after hours.',
    whatItDoes: [
      'Answers after-hours calls and greets the caller.',
      'Captures name, contact, reason and urgency with a collection notice.',
      'Transfers or escalates on your rules.',
    ],
    whatYouGet: [
      'A message per call: caller, contact, reason, urgency.',
      'A clear flag on anything urgent.',
      'A tidy overnight digest in the morning.',
    ],
    sampleOutputs: [
      'Captured: Dan, 021…, burst pipe, urgent. Escalated to on-call.',
      'Overnight: 4 calls, 1 urgent, 3 for the morning.',
    ],
    nzKnowledge: ['Privacy Act 2020 (IPP 3 collection notice)', 'Twilio NZ'],
    category: 'health',
    modelTier: 'mid',
    priceTier: 'business',
    icon: 'voice',
    tile: 'cream',
    greeting: 'Give me your greeting, your escalation rules and the number to transfer to, and I will answer the phones after hours.',
    starters: ['Set up after-hours reception.', 'What do you say when you answer?'],
  },
  // ── Marketing & Creative ─────────────────────────────────────────────
  {
    // English-first name that happens to be the te reo word (Kate's call — a
    // known sub-brand from the kete days). No separate te reo label.
    slug: 'auaha',
    name: 'Auaha',
    teReo: '',
    description: 'Full creative shop — brief → copy → image → video → podcast → one-shot apps.',
    whatItDoes: [
      'Turns a brief into a creative direction, then drafts the copy.',
      'Writes image prompts, video scripts and podcast outlines from the same brief.',
      'Drafts a one-shot landing page ready to drop in.',
    ],
    whatYouGet: [
      'A few options per asset, in your brand voice, for you to choose.',
      'Copy, image prompts, a video script and a podcast outline.',
      'A flags list: claims to substantiate and anything for cultural review.',
    ],
    sampleOutputs: [
      'Three headline options in your voice, plus an image prompt for each.',
      'A 30-second video script and a two-line podcast outline.',
    ],
    nzKnowledge: ['Fair Trading Act 1986', 'ASA advertising codes'],
    category: 'creative',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'spark',
    tile: 'canary',
    greeting: 'Tell me the brief — the brand, the audience, the channel — and I will draft the copy, image prompts, video and more for you to review.',
    starters: [
      'Brief and draft a launch campaign.',
      'Write three ad headlines in our voice.',
      'Draft a one-shot landing page.',
    ],
  },
  {
    slug: 'social-manager',
    name: 'Social Manager',
    teReo: '',
    description: 'The always-on half of your social — publishes, watches comments, drafts replies.',
    whatItDoes: [
      'Schedules and publishes approved posts across your channels.',
      'Watches comments and DMs and drafts replies in your voice.',
      'Runs the weekly performance and sentiment review.',
    ],
    whatYouGet: [
      'Scheduled posts and drafted comment and DM replies.',
      'A weekly performance and sentiment digest.',
      'Trend and brand-mention alerts.',
    ],
    sampleOutputs: [
      '12 comments overnight — 9 drafted replies, 1 flagged for you, 2 spam.',
      'Weekly: reach up 18%, sentiment steady, your reel is trending.',
    ],
    nzKnowledge: ['Fair Trading Act 1986', 'ASA advertising codes'],
    category: 'creative',
    modelTier: 'mid',
    priceTier: 'business',
    icon: 'social',
    tile: 'canary',
    greeting: 'Connect your accounts and tone guide, and I will publish, watch the comments, and draft the replies. Auaha makes it; I run it.',
    starters: [
      'Schedule this week’s posts.',
      'Draft replies to today’s comments.',
      'Run my weekly social review.',
    ],
  },

  // ── Business & SME (re-adds) ──────────────────────────────────────────
  {
    slug: 'chief',
    name: 'Chief',
    teReo: '',
    description: 'A chief of staff for one — inbox, calendar, expenses, drafted and ready for your nod.',
    whatItDoes: [
      'Triages your inbox and drafts replies in your voice.',
      'Runs your calendar: holds, clashes, a one-page brief per meeting.',
      'Processes expense receipts and drafts standing reports.',
    ],
    whatYouGet: [
      'A triaged inbox with drafted replies waiting for your nod.',
      'Calendar holds and a brief before each meeting.',
      'An end-of-day digest: handled / needs you / scheduled.',
    ],
    sampleOutputs: [
      '3 emails need you: drafted replies attached. 11 handled, 2 escalated.',
      'Tomorrow 10am with Acme — brief: last thread, open actions, their news.',
    ],
    nzKnowledge: ['Privacy Act 2020'],
    category: 'business',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'chief',
    tile: 'cream',
    greeting: 'Connect your inbox and calendar and tell me your priorities and escalate rules, and I will run the day with you. Nothing sends without your nod.',
    starters: [
      'Triage my inbox and draft the replies.',
      'Brief me for my next meeting.',
      'Hold focus time this week.',
    ],
  },
  {
    slug: 'roster',
    name: 'Roster',
    teReo: '',
    description: 'Your CRM and pipeline, kept current — logs activity, drafts follow-ups, flags cold leads.',
    whatItDoes: [
      'Logs activity from email and calendar against the right deal.',
      'Drafts follow-ups on your cadence and suggests stage moves.',
      'Flags cold leads and runs the weekly pipeline review.',
    ],
    whatYouGet: [
      'Auto-logged activity and drafted follow-up emails.',
      'A weekly pipeline brief with the top three actions.',
      'Lost-deal reasons tracked over time.',
    ],
    sampleOutputs: [
      '4 deals untouched 14+ days — drafted nudges ready to send.',
      'Pipeline brief: $48k weighted, 2 deals slipping, 1 ready to close.',
    ],
    nzKnowledge: ['Fair Trading Act 1986', 'Privacy Act 2020'],
    category: 'business',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'people',
    tile: 'cream',
    greeting: 'Connect your CRM and tell me your stages and win criteria, and I will log the activity, draft the follow-ups, and keep deals moving.',
    starters: [
      'Draft follow-ups for my stalled deals.',
      'Run this week’s pipeline review.',
      'Which leads have gone cold?',
    ],
  },
  {
    slug: 'counter',
    name: 'Counter',
    teReo: '',
    description: 'Retail ops in one place — POS brief, supplier reorders, returns and customer queries.',
    whatItDoes: [
      'Reads daily POS data and writes a sales and margin brief.',
      'Drafts supplier reorder POs and triages returns under the CGA.',
      'Triages customer queries across web, email and social.',
    ],
    whatYouGet: [
      'A daily sales and margin brief.',
      'Drafted reorder POs and returns decisions for your sign-off.',
      'Drafted customer replies and a weekly retail pack.',
    ],
    sampleOutputs: [
      'Yesterday: $4,120 sales, 38% margin — restock two best-sellers (PO drafted).',
      'Return: faulty kettle, 3 weeks old — CGA remedy: repair, replace or refund.',
    ],
    nzKnowledge: ['Consumer Guarantees Act 1993', 'Sale of Goods Act 1908', 'Fair Trading Act 1986'],
    category: 'business',
    modelTier: 'mid',
    priceTier: 'business',
    icon: 'store',
    tile: 'cream',
    greeting: 'Connect your POS and supplier list, and I will write the daily brief, draft the reorders, and triage returns and customer queries for your sign-off.',
    starters: [
      'Write today’s sales brief.',
      'Draft a reorder for low stock.',
      'Triage this customer return.',
    ],
  },

  // ── Build ────────────────────────────────────────────────────────────
  {
    slug: 'pilot',
    name: 'Pilot',
    teReo: 'Kaiurungi',
    description:
      'Your step-by-step agent maker. Pilot walks you through naming, building, testing and shipping your own agent — no code, no jargon. First one free.',
    whatItDoes: [
      'Guides you through seven plain-English steps: name, goal, inputs, tools, voice and safety, a test drive, then ship.',
      'Writes the system prompt for you against the locked assembl voice — sentence case, English-first, no slop — and adds the right NZ Acts for your category.',
      'Suggests an icon, an optional te reo label, the tools that fit, and a price tier — you edit anything you like.',
    ],
    whatYouGet: [
      'A working agent you can test in a sandbox before it goes anywhere.',
      'A draft saved to My Agents for your own use, free.',
      'An optional path to submit it for marketplace review, signed with a Mana Receipt.',
    ],
    sampleOutputs: [
      'Built “Lease Reader” — reads a tenancy agreement, flags the clauses that matter, cites the Residential Tenancies Act 1986. Saved as a draft.',
      'Suggested icon: scroll. Te reo label: none that fits naturally. Model: Claude Sonnet for the reasoning.',
    ],
    nzKnowledge: [
      'assembl voice canon (English-first, slop blacklist, draft-only)',
      'Privacy Act 2020 (IPP 3A) compliance prompts',
      'Fair Trading Act + ASA advertising rules',
      'Holidays Act + Employment Relations Act',
      'Health and Safety at Work Act 2015',
      'Health and Disability Commissioner code',
    ],
    category: 'build',
    modelTier: 'premium',
    priceTier: 'free',
    icon: 'pilot',
    tile: 'cream',
    greeting:
      'I am Pilot. I will help you build your own agent, one step at a time — no code. To start: what do you want to call it, and what should it do in one line?',
    starters: [
      'Build me an agent that reads my tenancy agreements.',
      'I want an agent that drafts replies to customer reviews.',
      'I am not sure what to build — help me figure it out.',
    ],
  },
  // ── Service / concierge ──────────────────────
  {
    slug: 'echo',
    name: 'Echo',
    teReo: '',
    description: 'Answers your website visitors and points them to the right place.',
    whatItDoes: [
      'Greets visitors and answers common questions in your voice.',
      'Works out what the person needs and routes them to the right agent or page.',
      'Hands off to a human when a question needs one — and says so plainly.',
    ],
    whatYouGet: [
      'A concierge on your site that replies in seconds.',
      'A tidy log of what people asked and where they were sent.',
      'Clear hand-offs for anything it should not answer itself.',
    ],
    sampleOutputs: [
      'Routed a consent question to Building Consent; pointed, booked nothing.',
      'Escalated a billing dispute to a human, with the details captured.',
    ],
    nzKnowledge: ['Privacy Act 2020 (IPP 3 collection notice)'],
    category: 'business',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'voice',
    tile: 'cream',
    greeting: 'I am Echo, your website concierge. Tell me what your visitors usually ask, and I will answer and route them. I never promise or commit on your behalf — I hand those to you.',
    starters: ['What do my visitors usually need?', 'Set up the homepage concierge.'],
  },
  {
    slug: 'prism',
    name: 'Prism',
    teReo: '',
    description:
      'The creative studio in one chat — brand DNA, campaigns, social, video and design direction, drafted on-brand for you to approve.',
    whatItDoes: [
      'Reads your site into a Brand DNA, then keeps every piece on-brand.',
      'Turns a one-line brief into a full cross-platform campaign, content calendar or video storyboard.',
      'Gives real design direction — palettes with hex, type, composition — and presents distinct directions to choose from.',
    ],
    whatYouGet: [
      'Campaign sets: Instagram, Story, Reel script, LinkedIn, Facebook, email and ad copy.',
      'A monthly content calendar mapped to the NZ calendar, with a brief per post.',
      'Logo and design directions, and video storyboards — all drafts for you to approve.',
    ],
    sampleOutputs: [
      'Three directions for "fresh and edgy", each with palette, type and a sample post.',
      'A Matariki series — respectful, in te reo where genuine, flagged for kaitiaki review.',
    ],
    nzKnowledge: ['NZ social trends and posting times', 'Matariki, Waitangi, ANZAC (handled with care)', 'Copyright Act 1994', 'Fair Trading Act 1986 and ASA codes', 'te reo Māori with macrons'],
    skills: ['prism-creative-studio'],
    category: 'creative',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'spark',
    tile: 'canary',
    greeting:
      'Before I make anything, tell me about your brand — the real version — and your site or socials if you have them. I will build your Brand DNA so everything I draft is unmistakably yours. I draft and direct; you approve before anything is published.',
    starters: ['Build a campaign from one line.', 'Plan our content for next month.'],
  },
  {
    slug: 'aroha',
    name: 'Aroha',
    teReo: '',
    description:
      'NZ HR and employment law — agreements, disciplinary process, leave, and the true cost of a hire, drafted for you to check.',
    whatItDoes: [
      'Walks you through hiring, managing, disciplinary process and restructuring the NZ way — process and people both.',
      'Drafts employment and contractor agreements and variation letters, with the clauses that need customising flagged.',
      'Calculates the true cost of a hire, and flags the leave, minimum-wage and KiwiSaver changes that affect your team.',
    ],
    whatYouGet: [
      'Compliant draft agreements and letters for you (and a lawyer where it matters) to review.',
      'Step-by-step disciplinary and restructuring guidance: what to do, say and put in writing.',
      'A true-employment-cost breakdown and proactive flags on what is coming up.',
    ],
    sampleOutputs: [
      'A $65,000 salary works out around $80,000 once leave, KiwiSaver and on-costs are in — here is the breakdown.',
      'Three staff sit just under the new minimum wage before 1 April — want the variation letters?',
    ],
    nzKnowledge: ['Employment Relations Act 2000', 'Holidays Act 2003', 'Health and Safety at Work Act 2015', 'minimum wage + KiwiSaver settings (confirmed current)', 'MBIE mediation + Employment NZ'],
    skills: ['aroha-hr-specialist'],
    category: 'business',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'people',
    tile: 'cream',
    greeting:
      'Before we dive in — how many people are on your team, and is there something specific on your mind? NZ employment law changed a lot recently, so if your agreements are not up to date, that is a good place to start. I draft and guide; for high-stakes calls I will tell you when you need an employment lawyer.',
    starters: ['What does this hire really cost?', 'Draft an employment agreement.'],
  },

  // ── Build (construction vertical specialists) ─────────────────────────
  {
    slug: 'kaupapa',
    name: 'Kaupapa',
    teReo: '',
    description:
      'The construction project director — scope, programme, contract administration, payment claims and the consent pathway, drafted for your reviewer to act on.',
    whatItDoes: [
      'Defines scope and maps the building- and resource-consent pathway for the build.',
      'Administers the contract: payment claims and schedules, variations, retentions and extension-of-time claims under the Construction Contracts Act 2002.',
      'Tracks the programme and critical path, surfacing delay and cost risk before it bites.',
    ],
    whatYouGet: [
      'Payment claim and schedule packs that respect the statutory CCA timeframes.',
      'A live variation register and EOT claims with the evidence attached.',
      'A programme update and a consent-pathway plan your client can read.',
    ],
    sampleOutputs: [
      'Payment schedule due in 3 working days — draft ready; miss it and the claimed $84,200 falls due in full.',
      'Variation V-017 is verbal only. Not instructed until it is in writing — draft sent for sign-off.',
    ],
    nzKnowledge: ['Construction Contracts Act 2002', 'NZS 3910:2013', 'Building Act 2004', 'Resource Management Act 1991'],
    skills: ['kaupapa-project-mgmt'],
    category: 'build',
    modelTier: 'premium',
    priceTier: 'business',
    vertical: true,
    icon: 'koru',
    tile: 'canary',
    greeting:
      'Tell me the project, the contract, or the claim and I will prepare it — a payment schedule, a variation, an EOT claim, or a consent pathway. A licensed practitioner or your project manager reviews and acts; I never lodge or certify.',
    starters: [
      'Draft a payment schedule for this claim.',
      'Set up the variation register for this build.',
      'Map the consent pathway for a new dwelling.',
    ],
  },
  {
    slug: 'ata',
    name: 'Ata',
    teReo: '',
    description:
      'BIM and plan review — clash detection, Building Code compliance and accessibility, drafted to the NZ BIM Handbook for your designer to sign.',
    whatItDoes: [
      'Reviews models and plan sets against the NZ Building Code and NZS 4121:2001 accessibility.',
      'Runs clash and coordination checks across disciplines, each finding clause-referenced.',
      'Tracks Level of Development and assembles as-built and handover documentation.',
    ],
    whatYouGet: [
      'Clash reports and coordination notes tied to the specific drawing and discipline.',
      'Code-compliance review notes that cite the clause (B1, E2, D1).',
      'LOD trackers and a handover bundle ready for the next stage.',
    ],
    sampleOutputs: [
      'Clash: HVAC duct vs structural beam at grid C4 — flagged for the designer to resolve.',
      'Accessibility: corridor width 1100mm at level 2 falls short of NZS 4121 — note raised.',
    ],
    nzKnowledge: ['NZ Building Code', 'NZS 4121:2001', 'Building Product Specifications 2025', 'NZ BIM Handbook / ISO 19650'],
    skills: ['ata-bim'],
    category: 'build',
    modelTier: 'premium',
    priceTier: 'business',
    vertical: true,
    icon: 'list',
    tile: 'cream',
    greeting:
      'Share the model or plan set and I will review it — clashes, Building Code compliance, accessibility, coordination. A Licensed Building Practitioner or chartered professional reviews and signs; I prepare the findings.',
    starters: [
      'Run a clash check on this model.',
      'Review these plans for Building Code compliance.',
      'Check accessibility against NZS 4121.',
    ],
  },
  {
    slug: 'rawa',
    name: 'Rawa',
    teReo: '',
    description:
      'Materials, products and procurement — checked against the Building Product Specifications 2025 and the Building Code, with supplier evidence held for your reviewer.',
    whatItDoes: [
      'Checks specified and substituted products against BPS 2025 and the relevant Building Code clause.',
      'Holds supplier evidence — CodeMark, Appraisals, BRANZ, manufacturer documentation.',
      'Runs substitution control, flagging swaps that change the compliance basis or warranty.',
    ],
    whatYouGet: [
      'Product schedules with the compliance evidence attached.',
      'Substitution approvals with the durability (B2) and weathertightness (E2) risk noted.',
      'A supplier-evidence bundle ready for the evidence pack.',
    ],
    sampleOutputs: [
      'Substitution: cladding swap changes the E2 basis — needs written approval before use; draft raised.',
      'Missing: CodeMark for the specified membrane — flagged before the BCA asks.',
    ],
    nzKnowledge: ['Building Product Specifications 2025', 'NZ Building Code (B2, E2)', 'CodeMark / BRANZ Appraisals'],
    skills: ['rawa-resources'],
    category: 'build',
    modelTier: 'premium',
    priceTier: 'business',
    vertical: true,
    icon: 'stock',
    tile: 'cream',
    greeting:
      'Tell me the product or the substitution and I will check it against BPS 2025 and the Building Code, and hold the supplier evidence. Your reviewer approves substitutions; I prepare the record.',
    starters: [
      'Check this product against BPS 2025.',
      'Is this substitution a like-for-like or does it change compliance?',
      'Build the supplier-evidence bundle for this job.',
    ],
  },
  {
    slug: 'whakaae',
    name: 'Whakaaē',
    teReo: '',
    description:
      'Building and resource consents — applications, AEEs and council RFI responses citing the Building Act 2004, drafted for your LBP to lodge.',
    whatItDoes: [
      'Drafts building-consent applications and Assessments of Environmental Effects on the right pathway.',
      'Responds to council Requests for Information and tracks producer statements (PS1–PS4).',
      'Maps consent conditions and inspection hold points into the programme.',
    ],
    whatYouGet: [
      'A consent application that identifies the Acceptable Solution or Alternative Solution.',
      'RFI responses that answer the council before it asks twice.',
      'A producer-statement register and a CCC readiness checklist.',
    ],
    sampleOutputs: [
      'RFI response drafted: E2 weathertightness detail at the parapet — citing the Acceptable Solution.',
      'PS4 outstanding for the structural steel — flagged before the CCC application.',
    ],
    nzKnowledge: ['Building Act 2004 (s14B)', 'Acceptable Solutions / Verification Methods', 'Resource Management Act 1991'],
    skills: ['whakaaee-consenting'],
    category: 'build',
    modelTier: 'premium',
    priceTier: 'business',
    vertical: true,
    icon: 'panui',
    tile: 'cream',
    greeting:
      'Tell me the build and I will draft the consent — application, AEE, or an RFI response — on the right pathway. A Licensed Building Practitioner or agent lodges and signs; I prepare, I never lodge.',
    starters: [
      'Draft a building consent application for this dwelling.',
      'Respond to this council RFI.',
      'What producer statements does this build need?',
    ],
  },
  {
    slug: 'pai',
    name: 'Pai',
    teReo: '',
    description:
      'Construction quality assurance — inspection and test plans, non-conformance and defect tracking, and the sealed evidence pack for your reviewer to sign.',
    whatItDoes: [
      'Builds and runs Inspection and Test Plans, hold and witness points, and non-conformance reports.',
      'Tracks defects to close-out and manages practical completion and handover punch lists.',
      'Assembles the Evidence Pack — provenance, citations, reviewer sign-off, regulator-ready.',
    ],
    whatYouGet: [
      'ITPs and hold-point records that gate the work properly.',
      'A live NCR and defect register with corrective actions verified.',
      'A sealed evidence pack ready for the regulator to review.',
    ],
    sampleOutputs: [
      'NCR-009 open: waterproofing test failed at the wet area — corrective action pending verification.',
      'Hold point: pre-line inspection not signed — work cannot proceed until the reviewer clears it.',
    ],
    nzKnowledge: ['Building Act 2004', 'NZS 3910:2013', 'AS/NZS ISO 9001'],
    skills: ['pai-quality'],
    category: 'build',
    modelTier: 'premium',
    priceTier: 'business',
    vertical: true,
    icon: 'shield',
    tile: 'cream',
    greeting:
      'Tell me the job and I will prepare the quality record — an ITP, an NCR, a defect register, or a sealed evidence pack. A named reviewer signs off; I prepare and seal, I never sign for you.',
    starters: [
      'Build an inspection and test plan for this build.',
      'Log a non-conformance for this defect.',
      'Assemble the handover evidence pack.',
    ],
  },
  {
    slug: 'arai',
    name: 'Ārai',
    teReo: '',
    description:
      'Construction health and safety — Site-Specific Safety Plans, risk registers and incident records built on the Health and Safety at Work Act 2015, drafted for a competent person to act on.',
    whatItDoes: [
      'Drafts SSSPs, Safe Work Method Statements, risk registers, inductions and toolbox talks.',
      'Triages incidents and near-misses and identifies notifiable events and the WorkSafe pathway.',
      'Tracks worker competency, LBP verification and PPE/fall/scaffold/confined-space requirements.',
    ],
    whatYouGet: [
      'An SSSP and SWMS built on the hierarchy of controls, not just PPE.',
      'A risk register and induction records ready for the site.',
      'Incident reports and notifiable-event notifications drafted for a competent person to send.',
    ],
    sampleOutputs: [
      'Notifiable event: fall from height over 3m — report to WorkSafe immediately and preserve the site; notification drafted.',
      'Control gap: working at height relies on PPE only — elimination and fall-arrest options raised first.',
    ],
    nzKnowledge: ['Health and Safety at Work Act 2015 (s36–46)', 'WorkSafe Codes of Practice', 'Hierarchy of controls'],
    skills: ['arai-site-safety'],
    category: 'build',
    modelTier: 'premium',
    priceTier: 'business',
    vertical: true,
    icon: 'shield',
    tile: 'canary',
    greeting:
      'Tell me the site, the task, or the incident and I will prepare it — an SSSP, a SWMS, a risk register, or a notifiable-event notification. A competent person reviews and acts; for a notifiable event I draft the notice, you send it.',
    starters: [
      'Draft an SSSP for this site.',
      'Build a SWMS for working at height.',
      'Is this incident a notifiable event?',
    ],
  },

  // ── Trades (automotive + freight specialists) ────────────────────────
  {
    slug: 'motor',
    name: 'Motor',
    teReo: '',
    description:
      'Workshop safety, equipment compliance and dealership obligations — job cards and CGA records under the Motor Vehicle Sales Act, drafted for a registered trader to act on.',
    whatItDoes: [
      'Manages workshop safety and equipment compliance — hoist certification, hazardous substances, technician competency.',
      'Holds dealership obligations under the MVSA and Consumer Guarantees Act 1993.',
      'Captures job cards with diagnosis, itemised quote, customer approval and road-test result.',
    ],
    whatYouGet: [
      'Job cards with the customer-approval trail before any work starts.',
      'An equipment-certification register that flags lapses early.',
      'CGA decision records that hold up if a repair is disputed.',
    ],
    sampleOutputs: [
      'Additional work found mid-service — fresh approval required (CGA s28); customer message drafted.',
      'Hoist certification expires in 9 days — flagged before it lapses.',
    ],
    nzKnowledge: ['Consumer Guarantees Act 1993', 'Motor Vehicle Sales Act 2003', 'Health and Safety at Work Act 2015'],
    category: 'trades',
    modelTier: 'premium',
    priceTier: 'business',
    vertical: true,
    icon: 'car',
    tile: 'cream',
    greeting:
      'Tell me the job, the vehicle, or the workshop and I will prepare the record — a job card, an equipment check, or a CGA decision. A registered trader or competent person reviews and acts; I prepare, I never certify.',
    starters: [
      'Open a job card for this repair.',
      'What does the customer need to approve before we start?',
      'Check our workshop equipment certifications.',
    ],
  },
  {
    slug: 'transit',
    name: 'Transit',
    teReo: '',
    description:
      'Freight movement and transport compliance — chain-of-custody, work-time and TSL records under the Land Transport Act 1998, drafted for your operator to act on.',
    whatItDoes: [
      'Tracks carrier handoffs, ETAs, proof-of-delivery and exceptions with a full movement record.',
      'Monitors work-time and logbook limits, Transport Service Licence currency and load security.',
      'Drafts operator and customer updates for delays, holds and documentation gaps.',
    ],
    whatYouGet: [
      'A chain-of-custody record from pickup to delivery.',
      'Work-time and logbook checks that flag a breach before it happens.',
      'Customer-update drafts ready before the phone rings.',
    ],
    sampleOutputs: [
      'Driver approaching the 13-hour work-time limit — flagged; reschedule or rest break drafted.',
      'POD missing for consignment 4471 — surfaced, not assumed delivered.',
    ],
    nzKnowledge: ['Land Transport Act 1998', 'Work Time and Logbooks Rule 2007', 'NZTA transport rules'],
    category: 'trades',
    modelTier: 'mid',
    priceTier: 'business',
    vertical: true,
    icon: 'container',
    tile: 'cream',
    greeting:
      'Tell me the movement, the driver, or the exception and I will prepare the record — chain-of-custody, a work-time check, or a customer update. Your operator acts; I prepare and flag.',
    starters: [
      'Track this consignment and flag any exceptions.',
      'Are my drivers within work-time limits this week?',
      'Draft a delay update for the customer.',
    ],
  },
  {
    slug: 'transit-freight',
    name: 'Transit-Freight',
    teReo: '',
    description:
      'Freight documentation — commercial docs, packing lists and BOL/AWB packs with audit trails for customs and brokers, drafted for a licensed broker to lodge.',
    whatItDoes: [
      'Assembles commercial documents, packing lists and Bills of Lading / Air Waybills.',
      'Builds broker-ready evidence: missing-document checklists, origin declarations, correction history.',
      'Coordinates documentation deadlines against shipment cut-offs.',
    ],
    whatYouGet: [
      'A complete, consignee-correct document set per shipment.',
      'A missing-document checklist before the deadline bites.',
      'A broker-ready pack that clears faster because it is already right.',
    ],
    sampleOutputs: [
      'Missing: supplier country-of-origin declaration for shipment SH-2208 — flagged before lodging.',
      'BOL drafted and cross-checked against the packing list — discrepancy on carton count raised.',
    ],
    nzKnowledge: ['Customs and Excise Act 2018', 'Maritime NZ requirements', 'IMO IMDG (dangerous goods)'],
    category: 'trades',
    modelTier: 'mid',
    priceTier: 'business',
    vertical: true,
    icon: 'container',
    tile: 'cream',
    greeting:
      'Send the shipment details and I will assemble the documentation — commercial docs, packing list, BOL or AWB, and a missing-document checklist. A licensed broker lodges; I prepare the pack.',
    starters: [
      'Build the document set for this shipment.',
      'What documents are missing before we can lodge?',
      'Draft the Bill of Lading from this packing list.',
    ],
  },
  {
    slug: 'pikau',
    name: 'Pīkau',
    teReo: '',
    description:
      'Customs declarations — import entries drafted from the invoice and packing list under the Customs and Excise Act 2018, ready for a licensed broker to check and lodge.',
    whatItDoes: [
      'Reads the commercial invoice, packing list and Incoterms and drafts the import entry.',
      'Calculates duty and import GST and flags permits, preferences and missing documents.',
      'Maintains the importer profile and audit-ready records for the broker handoff.',
    ],
    whatYouGet: [
      'A draft entry with line items, values and origin.',
      'A clear list of assumptions the broker must confirm.',
      'A missing-documents checklist before lodging.',
    ],
    sampleOutputs: [
      'Line 1: LED fittings → HS 9405.11 (confirm), duty 5%, GST on landed value.',
      'Missing: the supplier’s country-of-origin declaration — flagged before lodging.',
    ],
    nzKnowledge: ['Customs and Excise Act 2018', 'NZ Working Tariff', 'Import GST rules'],
    category: 'trades',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'container',
    tile: 'cream',
    greeting:
      'Paste the invoice and packing list and I will draft the import entry — line items, duty, GST, and a list of what to confirm. A licensed customs broker checks and lodges; I never lodge.',
    starters: [
      'Draft an entry from this invoice.',
      'Calculate the duty and GST for this shipment.',
      'What documents are missing before we lodge?',
    ],
  },
  {
    slug: 'gateway',
    name: 'Gateway',
    teReo: '',
    description:
      'Tariff classification — HS codes and duty assessed against the NZ Working Tariff and the WCO Harmonised System, with reasoning a broker or Customs can rely on.',
    whatItDoes: [
      'Suggests HS classifications with the General Rules of Interpretation applied.',
      'Assesses duty rates, preference eligibility and the valuation basis.',
      'Flags where a binding tariff ruling would reduce risk.',
    ],
    whatYouGet: [
      'A classification suggestion with the tariff heading and the GRI logic.',
      'A duty and preference assessment with the evidence noted.',
      'A clear recommendation on when to seek a ruling.',
    ],
    sampleOutputs: [
      'Classification: HS 8544.42 (confirm) — GRI 1 and 3(b) applied; duty free under the relevant FTA if origin proven.',
      'Preference claim needs a certificate of origin — flagged before lodging.',
    ],
    nzKnowledge: ['Customs and Excise Act 2018', 'NZ Working Tariff', 'WCO Harmonised System'],
    category: 'trades',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'container',
    tile: 'cream',
    greeting:
      'Describe the goods and I will classify them — an HS suggestion with the reasoning, the duty rate, and any preference. A licensed broker confirms and lodges; my classification is a reasoned suggestion.',
    starters: [
      'Classify the HS tariff for these goods.',
      'What duty applies to this product?',
      'Do these goods qualify for a preference rate?',
    ],
  },

  // ── Hospitality & retail specialists ─────────────────────────────────
  {
    slug: 'aura',
    name: 'Aura',
    teReo: '',
    description:
      'Guest experience and service compliance for hospitality — host-responsibility records and service standards under the Sale and Supply of Alcohol Act 2012, drafted for your duty manager.',
    whatItDoes: [
      'Holds guest-experience standards, service-recovery drafts and the venue’s approved voice.',
      'Tracks host-responsibility obligations — intoxication management, ID checks, food and signage.',
      'Summarises bookings, incidents and review patterns before the shift.',
    ],
    whatYouGet: [
      'Service-standard notes and on-brand guest replies.',
      'Host-responsibility records that keep the licence safe.',
      'An incident log that escalates the right things to the duty manager.',
    ],
    sampleOutputs: [
      'Incident: intoxicated patron refused service — recorded with time and action for the duty manager.',
      'Booking review: three one-star reviews mention wait times — service-recovery reply drafted.',
    ],
    nzKnowledge: ['Sale and Supply of Alcohol Act 2012', 'Health Act 1956', 'Privacy Act 2020'],
    category: 'health',
    modelTier: 'mid',
    priceTier: 'business',
    vertical: true,
    icon: 'bell',
    tile: 'cream',
    greeting:
      'Tell me about the shift, the guest, or the incident and I will prepare it — a service-recovery reply, a host-responsibility record, or an incident log. Your duty manager acts; I prepare and flag.',
    starters: [
      'Draft a reply to this guest review.',
      'Log a host-responsibility incident.',
      'Brief me on tonight’s bookings and risks.',
    ],
  },
  {
    slug: 'cellar',
    name: 'Cellar',
    teReo: '',
    description:
      'Product and licence records for retail — restricted-goods checks and supplier traceability under the Sale and Supply of Alcohol Act 2012, drafted for an auditor or inspector.',
    whatItDoes: [
      'Maintains the product register, supplier certifications and licence-condition tracking.',
      'Runs traceability and evidence trails for provenance and recalls.',
      'Flags restricted-goods, age-restriction and supplier-document gaps.',
    ],
    whatYouGet: [
      'A product register with supplier evidence attached.',
      'Restricted-goods checks tied to your licence conditions.',
      'A traceability bundle ready for a licensing inspector.',
    ],
    sampleOutputs: [
      'Licence condition: single-area sales only — a product placed outside the area; flagged.',
      'Recall: batch trace for the affected product assembled for the supplier and inspector.',
    ],
    nzKnowledge: ['Sale and Supply of Alcohol Act 2012', 'Consumer Guarantees Act 1993', 'Food Act 2014'],
    category: 'business',
    modelTier: 'mid',
    priceTier: 'business',
    vertical: true,
    icon: 'stock',
    tile: 'cream',
    greeting:
      'Tell me the product or the licence question and I will prepare the record — a product register, a restricted-goods check, or a traceability bundle. The licensee acts; I prepare and flag.',
    starters: [
      'Check this product against our licence conditions.',
      'Build a traceability trail for this batch.',
      'What supplier evidence is missing from the register?',
    ],
  },
  {
    slug: 'hoko-cga',
    name: 'Hoko-CGA',
    teReo: '',
    description:
      'Consumer-protection compliance for retail — returns, remedies and dispute records under the Consumer Guarantees Act 1993 and Fair Trading Act 1986, drafted for you to decide.',
    whatItDoes: [
      'Assesses returns and complaints against the CGA guarantees and the right remedy.',
      'Checks advertising and pricing claims against the Fair Trading Act.',
      'Builds dispute-ready records for the Disputes Tribunal.',
    ],
    whatYouGet: [
      'A CGA remedy assessment — repair, replace or refund — with the reasoning.',
      'A Fair Trading claim check that flags misleading conduct before it costs you.',
      'A Disputes Tribunal response pack with the evidence in order.',
    ],
    sampleOutputs: [
      'Major failure: the customer may reject and choose a refund or replacement — their choice, not ours.',
      '“No refunds” signage is unlawful for faulty goods — flagged for correction.',
    ],
    nzKnowledge: ['Consumer Guarantees Act 1993', 'Fair Trading Act 1986', 'Disputes Tribunal process'],
    category: 'business',
    modelTier: 'mid',
    priceTier: 'business',
    icon: 'invoice',
    tile: 'cream',
    greeting:
      'Tell me the return, the complaint, or the claim and I will assess it against the CGA and Fair Trading Act, with the remedy and the reasoning. You decide the remedy; I prepare the assessment.',
    starters: [
      'Is this return covered by the CGA?',
      'Check this promotion against the Fair Trading Act.',
      'Build a Disputes Tribunal response pack.',
    ],
  },

  // ── Creative specialists ─────────────────────────────────────────────
  {
    slug: 'muse',
    name: 'Muse',
    teReo: '',
    description:
      'Copywriting and communications — on-brand, claim-safe copy across every channel under the Fair Trading Act 1986 and ASA codes, drafted for you to approve.',
    whatItDoes: [
      'Drafts copy across web, email, social and ads in your approved voice.',
      'Keeps a claim register and flags any claim that needs substantiation.',
      'Fits each draft to its channel and audience.',
    ],
    whatYouGet: [
      'Channel-ready copy drafts that sound like you.',
      'A claim register with substantiation flags so nothing oversteps.',
      'A publish-review checklist before anything goes live.',
    ],
    sampleOutputs: [
      'Claim “NZ’s most trusted” needs evidence or it breaches the Fair Trading Act — flagged with safer alternatives.',
      'Three subject-line options for the launch email, each under 45 characters.',
    ],
    nzKnowledge: ['Fair Trading Act 1986', 'ASA Codes', 'te reo Māori with macrons (used only where genuine)'],
    category: 'creative',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'scribe',
    tile: 'canary',
    greeting:
      'Tell me what you need written and who it is for, and I will draft it in your voice — claim-safe and ready to publish. You approve before anything goes live.',
    starters: [
      'Write the copy for this landing page.',
      'Draft three ad variations for this offer.',
      'Check this claim against the Fair Trading Act.',
    ],
  },
  {
    slug: 'saffron',
    name: 'Saffron',
    teReo: '',
    description:
      'Campaign and content production — production plans, asset schedules and handoff records, claim-safe under the ASA codes, drafted for you to approve.',
    whatItDoes: [
      'Drafts content-production plans, asset schedules and channel sequencing for a campaign.',
      'Manages approval gates and handoff records between brief, production and publishing.',
      'Surfaces blocked work and the next batch of assets or approvals.',
    ],
    whatYouGet: [
      'A production plan that keeps the campaign on time.',
      'An asset schedule with the approval gate on every piece.',
      'A handoff pack so nothing falls between brief and publish.',
    ],
    sampleOutputs: [
      'Reel script and three carousel posts drafted; all sitting at the approval gate for your sign-off.',
      'Blocked: the launch video needs final copy before it can be scheduled — flagged with the owner.',
    ],
    nzKnowledge: ['Fair Trading Act 1986', 'ASA Codes', 'NZ campaign calendar (Matariki, Waitangi handled with care)'],
    category: 'creative',
    modelTier: 'mid',
    priceTier: 'business',
    vertical: true,
    icon: 'palette',
    tile: 'cream',
    greeting:
      'Tell me the campaign and I will plan the production — assets, sequencing, and the approval gates. Nothing publishes until you sign it off; I prepare and keep it moving.',
    starters: [
      'Plan the production for this campaign.',
      'Build the asset schedule for next month.',
      'What is blocking the launch?',
    ],
  },

  // ── Whānau (consumer) ────────────────────────────────────────────────
  {
    slug: 'toro',
    name: 'Tōro',
    teReo: '',
    description:
      'The whānau operations navigator — household admin, school comms, appointments, money and travel, drafted for a parent to approve.',
    whatItDoes: [
      'Reads the week ahead and prepares drafts for school comms, routines, appointments and travel.',
      'Pulls dates, costs, permissions and deadlines out of school notices and emails.',
      'Holds household preferences, calendars and consent boundaries.',
    ],
    whatYouGet: [
      'A weekly brief that puts the time-sensitive things first.',
      'School-comms and appointment drafts ready for a parent to send.',
      'A permissions and allowance record so nothing slips.',
    ],
    sampleOutputs: [
      'This week: school assembly Wednesday 9am, dentist Friday 2pm, mufti-day gold-coin Thursday.',
      'Permission slip due tomorrow for the class trip — draft reply ready for you to send.',
    ],
    nzKnowledge: ['NZ school term calendars (MoE)', 'Privacy Act 2020', 'NZ public holidays'],
    category: 'family',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'whanau',
    tile: 'canary',
    greeting:
      'Tell me what is on this week — school notices, appointments, the family calendar — and I will sort it into drafts and reminders. You approve before anything is sent or booked.',
    starters: [
      'Brief my week.',
      'Pull the dates out of this school notice.',
      'Draft a reply to the teacher.',
    ],
  },
  {
    slug: 'voyage',
    name: 'Voyage',
    teReo: '',
    description:
      'Trip planning for New Zealanders heading away — day-by-day itineraries, FX-aware budgets and packing lists, drafted for you to book.',
    whatItDoes: [
      'Builds day-by-day itineraries with must-book-ahead activities flagged and realistic timing.',
      'Budgets in NZD with foreign-exchange awareness and surfaces where costs add up.',
      'Produces packing lists and pre-departure checklists.',
    ],
    whatYouGet: [
      'A day-by-day plan that actually works on the ground.',
      'A budget in NZD with the big costs called out.',
      'A must-book list and a packing checklist before you go.',
    ],
    sampleOutputs: [
      'Day 4 Florence: book the Uffizi now — timed entry sells out two weeks ahead.',
      'Budget: 10 days, two adults, ~NZ$6,400 incl. flights — accommodation is the swing factor.',
    ],
    nzKnowledge: ['NZ passport and overseas entry timing', 'NZD foreign-exchange awareness', 'Privacy Act 2020'],
    category: 'family',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'anchor',
    tile: 'cream',
    greeting:
      'Tell me where you are going, for how long, and who with, and I will plan it day by day — with the must-book-ahead bits flagged and a real NZD budget. You confirm and book; I plan.',
    starters: [
      'Plan a 10-day Italy trip for two.',
      'What do I need to book ahead?',
      'Build a packing list for this trip.',
    ],
  },

  // ── Early childhood (service business) ───────────────────────────────
  {
    slug: 'ako-licence',
    name: 'Ako-Licence',
    teReo: '',
    description:
      'Early-childhood-education licensing and compliance — ratios, qualifications, child safety and ERO readiness under the Education and Training Act 2020, drafted for your centre manager.',
    whatItDoes: [
      'Tracks ratios, staffing and kaiako qualifications against the ECE regulations.',
      'Maintains child-safety records, curriculum documentation (Te Whāriki) and ERO evidence.',
      'Drafts whānau communications in the centre’s approved voice.',
    ],
    whatYouGet: [
      'A ratio and qualification tracker that flags a shortfall before the day starts.',
      'Child-safety and ERO evidence kept current and confidential.',
      'Whānau-comms drafts ready for the manager to send.',
    ],
    sampleOutputs: [
      'Ratio risk Thursday afternoon: one qualified teacher short for the under-2s — flagged with options.',
      'ERO evidence: curriculum documentation for term 2 assembled and indexed.',
    ],
    nzKnowledge: ['Education and Training Act 2020', 'Education (Early Childhood Services) Regulations 2008', 'Children’s Act 2014', 'Privacy Act 2020 (IPP 3A)'],
    category: 'business',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'koru',
    tile: 'cream',
    greeting:
      'Tell me about the centre, the roster, or the ERO visit and I will prepare it — a ratio check, child-safety records, or an evidence bundle. Your manager acts; a safeguarding concern always routes to a person, never advice.',
    starters: [
      'Check our ratios for this week.',
      'Assemble the ERO evidence bundle.',
      'Draft a whānau update about the term.',
    ],
  },
];

export const MARKETPLACE_AGENTS: MarketplaceAgent[] = AGENT_DEFS.map(buildAgent);

/** Client-safe projection — everything EXCEPT the locked system prompt. */
export type PublicMarketplaceAgent = Omit<MarketplaceAgent, 'systemPrompt'>;

export function toPublicAgent(agent: MarketplaceAgent): PublicMarketplaceAgent {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { systemPrompt, ...rest } = agent;
  return rest;
}

export const PUBLIC_MARKETPLACE_AGENTS: PublicMarketplaceAgent[] =
  MARKETPLACE_AGENTS.map(toPublicAgent);

const BY_SLUG = new Map(MARKETPLACE_AGENTS.map((a) => [a.slug, a]));

export function marketplaceAgentBySlug(slug: string): MarketplaceAgent | undefined {
  return BY_SLUG.get(slug);
}

export function isMarketplaceAgent(slug: string): boolean {
  return BY_SLUG.has(slug);
}

export function agentsByCategory(category: MarketplaceCategory): MarketplaceAgent[] {
  return MARKETPLACE_AGENTS.filter((a) => a.category === category);
}

export const MODEL_TIER_LABELS: Record<ModelTier, string> = {
  cheap: 'Fast',
  mid: 'Balanced',
  premium: 'Deep',
};

export const PRICING_TIER_LABELS: Record<PricingTier, string> = {
  per_agent: 'Per agent',
  free: 'Free',
  freemium: 'Free to try',
  paid: 'Paid',
};

export const PRICE_TIER_LABELS: Record<PriceTier, string> = {
  free: 'Free',
  toro: '$9.99',
  business: '$199',
};

/**
 * Canon card/detail price label — per agent: Free / $9.99/mo / $199/mo.
 * Delegates to the single source of truth in lib/billing/agent-pricing.ts so a
 * card can never surface an off-ladder figure.
 * (The first 3 messages with any agent are free before the paywall.)
 */
export function priceLabel(agent?: Pick<MarketplaceAgent, 'priceNzd'>): string {
  return priceLabelForNzd(agent?.priceNzd ?? 0);
}

/** All-Access monthly price (NZD) — the plan that includes vertical agents. */
export const ALL_ACCESS_PRICE_NZD =
  getAgentPlan(ALL_ACCESS_PLAN)?.monthlyNzd ?? 250;

/**
 * Price label for a card or detail header. Industry-vertical agents are sold
 * through the All-Access plan, so they show the All-Access price; every other
 * agent shows its per-agent tier price ($9.99 / $199, GST inclusive).
 */
export function agentPriceLabel(
  agent?: Pick<MarketplaceAgent, 'priceNzd' | 'vertical'>,
): string {
  if (!agent || agent.priceNzd === 0) return 'Free';
  if (agent.vertical) return `All-Access · $${ALL_ACCESS_PRICE_NZD}/mo`;
  return priceLabel(agent);
}

/**
 * Checkout href for an agent's Subscribe CTA. Verticals route to All-Access;
 * every other agent routes to the plan that charges its tier ($9.99 everyday or
 * $199 specialist).
 */
export function agentCheckoutHref(
  agent: Pick<MarketplaceAgent, 'slug' | 'priceNzd' | 'vertical'>,
): string {
  if (agent.vertical) return `/agents/checkout?plan=${ALL_ACCESS_PLAN}`;
  const plan = planForAgentPriceNzd(agent.priceNzd);
  return `/agents/checkout?plan=${plan}&agent=${agent.slug}`;
}

/**
 * Maps a marketplace model tier to a concrete model id for the chat route.
 * The registry stays the single source of truth.
 */
export const MODEL_TIER_TO_ANTHROPIC: Record<ModelTier, string> = {
  cheap: 'claude-haiku-4-5-20251001',
  mid: 'claude-sonnet-4-6',
  premium: 'claude-opus-4-8',
};
