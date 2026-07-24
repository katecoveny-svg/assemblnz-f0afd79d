/**
 * Agent marketplace registry — LOCKED CANON, unified roster (updated 2026-06-27).
 *
 * 2026-06-27 unification: this registry is now the SINGLE source of truth for
 * both the public /agents grid AND the signed-in detail/chat surfaces. The 19
 * fleet specialists previously only in lib/agents.ts (construction, automotive,
 * freight/customs, hospitality and whānau) were absorbed here with full
 * MarketplaceAgent data + locked prompts. Industry verticals carry
 * `vertical: true` (All-Access $250); consumer agents are flat per-agent. All
 * tiles are cream/accentGold (no ink) and greetings are English-first per the
 * brand canon. Base roster: LOCKED CANON (2026-06-23).
 *
 * Source of truth, read first: ~/Downloads/dash-gemini/CANON-LOCKED-2026-06-23.md.
 * English name headlines; te reo is a quiet label beside the name (never the
 * headline). Per-agent price tiers: Free / $9.99 / $199. Icons are the canon
 * flat-vector avatars (components/marketplace/AgentIcon.tsx); avatar tile
 * colourway per agent (cream everyday / accentGold free-featured / ink business).
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
export type TileTone = 'cream' | 'accentGold' | 'ink';

export type MarketplaceCategory = 'start-here' | 'family' | 'business' | 'creative' | 'trades' | 'health' | 'build' | 'animal';

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
  /**
   * Bundle membership (V4). When set, this agent is surfaced through its bundle
   * card + /bundles/<slug> page rather than as a standalone tile on the flat
   * /agents and homepage shelves. Mirrors public.agents.bundle. Currently only
   * the Kaitiaki bundle carries this in code; the other bundles' membership
   * lives DB-only pending the Phase 3 floor swap.
   */
  bundle?: string;
  /** front-door lead agent for its bundle (mirrors public.agents.is_bundle_lead) */
  isBundleLead?: boolean;
  /** featured in the marketplace — surfaces as the lead "Start here" card */
  featured: boolean;
  /**
   * Industry-vertical premium agent (owns a whole industry, e.g. Arataki for
   * automotive). Verticals are not sold at the flat per-agent rate — they are
   * included in the All-Access plan, so their price label and Subscribe CTA
   * point at All-Access rather than the $15 per-agent checkout.
   */
  vertical: boolean;
  /**
   * Consult-grade audio capture. When true, the chat composer shows a real
   * MediaRecorder consult recorder (mic → MediaRecorder → Deepgram en-NZ,
   * diarised → transcript) instead of the lightweight Web Speech dictation
   * mic. Used by Quill, where a full two-party consult must be recorded
   * and transcribed onshore — not streamed phrase-by-phrase to a browser
   * speech engine. Optional; defaults to off.
   */
  consultCapture?: boolean;
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

export const CATEGORY_LABELS: Record<MarketplaceCategory, string> = {
  ...(Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.label])) as Record<MarketplaceCategory, string>),
  // 'animal' is intentionally NOT in CATEGORIES (no flat-grid filter button — the
  // Kaitiaki specialists surface through the bundle, not the shelf). The label
  // exists only so the detail page can resolve CATEGORY_LABELS[agent.category].
  animal: 'Animal & Conservation',
};

// Public editorial palette. Shared by the agent index, detail and chat surfaces
// so moving between them feels like one assembl system.
export const PALETTE = {
  accentGold: '#C9CBC7',
  accentGold2: '#E3E4E0',
  ink: '#252D31',
  body: '#555C5F',
  paper: '#FAFAF7',
  cream: '#F3F2ED',
  hairline: '#D7D8D3',
  gold: '#8E928F',
  muted: '#797F7D',
} as const;

export const DASH_MOTIF =
  'repeating-linear-gradient(90deg, #252D31 0 20px, transparent 20px 32px)';

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
  accentGold: '#BFA37A',
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

/**
 * Per-agent Claude Skill ids, layered on top of any inline `skills` on the def.
 *
 * Id conventions:
 *   - `plugin:skill` — a skill from an installed Cowork/Claude plugin (sales,
 *     marketing, legal, finance, human-resources, operations, customer-support).
 *   - bare-name — a skill from assembl's own library (elite-copywriter,
 *     tikanga-compliance, nz-privacy-act-2020, nz-hospitality-compliance, etc.).
 *
 * These are MERGED with each def's inline `skills` (deduped) in buildAgent, so
 * an agent that already declares a core skill keeps it and gains these too.
 * Seeded to `public.agents.skills`; runtime dispatch is a follow-up.
 */
const SKILLS_BY_SLUG: Record<string, string[]> = {
  // ── Sales · Automotive · Retail ─────────────────────────────────────
  arataki: [
    'sales:account-research',
    'sales:call-prep',
    'sales:call-summary',
    'sales:competitive-intelligence',
    'sales:create-an-asset',
    'sales:daily-briefing',
    'sales:draft-outreach',
    'sales:forecast',
    'sales:pipeline-review',
  ],
  // motor, transit, transit-freight — KILLED (absorbed into Forge / arataki).
  roster: [
    'sales:account-research',
    'sales:call-prep',
    'sales:call-summary',
    'sales:competitive-intelligence',
    'sales:create-an-asset',
    'sales:daily-briefing',
    'sales:draft-outreach',
    'sales:forecast',
    'sales:pipeline-review',
  ],
  pipeline: [
    'sales:pipeline-review',
    'sales:forecast',
    'sales:draft-outreach',
    'sales:account-research',
    'sales:daily-briefing',
  ],
  counter: [
    'sales:account-research',
    'sales:competitive-intelligence',
    'customer-support:ticket-triage',
    'customer-support:draft-response',
    'operations:vendor-review',
  ],
  cellar: [
    'sales:account-research',
    'operations:vendor-review',
    'customer-support:draft-response',
    'nz-hospitality-compliance',
  ],
  saffron: [
    'nz-hospitality-compliance',
    'operations:vendor-review',
    'customer-support:draft-response',
    'sales:account-research',
  ],
  'hoko-cga': [
    'customer-support:draft-response',
    'customer-support:kb-article',
    'sales:account-research',
  ],

  // ── Business · Ops · Finance ────────────────────────────────────────
  'invoice-tidy': ['finance:financial-statements', 'finance:reconciliation', 'rdti-activity-logger'],
  treasury: ['finance:financial-statements', 'finance:variance-analysis', 'rdti-activity-logger'],
  chief: ['sales:daily-briefing', 'legal:meeting-briefing', 'internal-comms'],
  sweep: ['customer-support:ticket-triage', 'sales:daily-briefing'],
  // meeting-records — KILLED (merged into hui).
  hui: ['legal:meeting-briefing', 'internal-comms'],
  'stock-count': ['operations:vendor-review', 'operations:process-doc'],
  'compliance-check': ['operations:compliance-tracking', 'legal:compliance-check'],
  // customs-entry — KILLED (duplicate of pikau).
  'food-temp-logs': ['nz-hospitality-compliance', 'operations:compliance-tracking'],
  front: ['customer-support:ticket-triage', 'customer-support:draft-response'],
  quill: ['nz-privacy-act-2020'],

  // ── Marketing · Creative ────────────────────────────────────────────
  auaha: [
    'marketing:campaign-plan',
    'marketing:content-creation',
    'marketing:draft-content',
    'elite-copywriter',
    'social-media-manager',
    'assembl-voice',
  ],
  'social-manager': [
    'marketing:campaign-plan',
    'marketing:performance-report',
    'social-media-manager',
    'elite-copywriter',
  ],
  muse: ['marketing:brand-review', 'elite-copywriter', 'assembl-voice', 'tikanga-compliance'],

  // ── Maritime — maritime-brief KILLED (merge Tide & Weather only). ────

  // ── Construction · HR (extend agents that already carry a core skill) ─
  arai: ['operations:risk-assessment'],
  kaupapa: ['operations:status-report', 'operations:capacity-plan'],
  pai: ['operations:process-doc'],
  whakaae: ['legal:compliance-check'],
  aroha: ['aroha-employment-hero', 'human-resources:policy-lookup', 'human-resources:performance-review'],
};

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
    skills: Array.from(new Set([...(def.skills ?? []), ...(SKILLS_BY_SLUG[def.slug] ?? [])])),
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
    teReo: '',
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
      'For school notices and the family calendar, start with Pānui Parser and Dawn — both free.',
      'AI will not fix a messy roster on its own. Tidy the availability first, then Pipeline can hold it.',
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
    slug: 'dawn',
    name: 'Dawn',
    teReo: '',
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
    bundle: 'hearth',
    greeting: 'Tell me your calendar and where you are, and I will brief your day. Short and plain.',
    starters: ['Brief my day.', 'What changed overnight?', 'What needs me today?'],
  },
  {
    slug: 'fridge-to-list',
    name: 'Kai',
    teReo: 'Kai',
    description: 'Snap the fridge, get a Woolworths shopping list — dietary rules and budget kept honest.',
    whatItDoes: [
      'Reads a photo or description of what is in the fridge and pantry.',
      'Builds a Woolworths-formatted list by aisle, against your dietary rules and budget cap.',
      'Plans a week of dinners with a prep schedule, and drafts the shopping backwards from the recipes.',
    ],
    whatYouGet: [
      'A Woolworths-formatted list, section by section, ready to copy into the Woolworths app yourself.',
      'Dietary flags (halal, kosher, dairy-free, vegan, gluten-free, low-FODMAP, nut-free) and a budget check before you shop.',
      'A week of dinners with a two-hour prep plan, and a use-first note for what is close to its date.',
    ],
    sampleOutputs: [
      'Drafted: 22 items, $184.60 — $65 under this week’s cap. Copy it into Woolworths yourself for now.',
      'This week’s dinners: Sun roast → Mon stir-fry from the leftovers → Wed pasta (gluten-free).',
    ],
    nzKnowledge: ['Woolworths NZ aisle sections', "Pak'nSave / New World conventions", 'MPI food-safety guidance', 'Privacy Act 2020 IPP 3A'],
    category: 'family',
    modelTier: 'cheap',
    priceTier: 'free',
    icon: 'list',
    tile: 'accentGold',
    bundle: 'hearth',
    greeting:
      'Snap the fridge or pantry and tell me your household — size, any dietary rules, a budget cap. I’ll draft a Woolworths list you copy into the app yourself, or plan a week of dinners. I draft; you shop.',
    starters: ['Shop for the week from this fridge photo.', 'Plan a week of dinners.', 'Build a $250 list, dairy-free.'],
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
    bundle: 'hearth',
    greeting: 'Paste the school notice and I will pull out the dates, costs and what you need to do.',
    starters: ['Parse this newsletter.', 'What permission slips are due?'],
  },
  // whanau-help — KILLED (absorbed into Tōro/Helm; see hearth bundle lead).
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
    bundle: 'hearth',
    greeting: 'Paste the newsletter and I will turn the events into calendar entries for you to add.',
    starters: ['Turn this newsletter into calendar events.', 'What is on this term?'],
  },
  {
    slug: 'awhi',
    name: 'Awhi',
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
    bundle: 'hearth',
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
    slug: 'hui',
    name: 'Hui',
    teReo: '',
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
    slug: 'pipeline',
    name: 'Pipeline',
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
    slug: 'sweep',
    name: 'Sweep',
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
    teReo: '',
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
    slug: 'treasury',
    name: 'Treasury',
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
  // meeting-records — KILLED (merged into Hui).
  {
    slug: 'switch',
    name: 'Switch',
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
    tile: 'accentGold',
    bundle: 'hearth',
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
    bundle: 'forge',
    isBundleLead: true,
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
  // customs-entry — KILLED (duplicate of Pīkau).
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
  // building-consent — KILLED (duplicate of Whakaaē).
  // maritime-brief — KILLED (merge Tide & Weather only; Tide is the surviving weather agent).
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
    tile: 'accentGold',
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
    tile: 'accentGold',
    bundle: 'hearth',
    greeting: 'Tell me what you caught and I will keep the logbook. For limits and rules, I will point you to MPI.',
    starters: ['Log a catch.', 'Show today’s trip.'],
  },

  // ── Health & Service ─────────────────────────────────────────────────
  {
    slug: 'quill',
    name: 'Quill',
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
    bundle: 'practice',
    greeting: 'With per-visit consent in place, tap record to capture the consult — or paste a transcript — and I will draft the clinical note, suggest codes, and end with a Mana Receipt. I never diagnose; sign-off stays with you.',
    starters: ['Draft a SOAP note from this consult.', 'Draft the ACC45 from this injury consult.', 'Write a referral letter.'],
    consultCapture: true,
  },
  {
    slug: 'front',
    name: 'Front',
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
    bundle: 'practice',
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
    tile: 'accentGold',
    bundle: 'ensemble',
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
    tile: 'accentGold',
    bundle: 'ensemble',
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
    teReo: '',
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
      'Routed a consent question to Whakaaē; pointed, booked nothing.',
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
    tile: 'accentGold',
    bundle: 'ensemble',
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
    tile: 'accentGold',
    bundle: 'assembler',
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
    bundle: 'assembler',
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
    bundle: 'assembler',
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
    bundle: 'assembler',
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
    bundle: 'assembler',
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
    tile: 'accentGold',
    bundle: 'assembler',
    greeting:
      'Tell me the site, the task, or the incident and I will prepare it — an SSSP, a SWMS, a risk register, or a notifiable-event notification. A competent person reviews and acts; for a notifiable event I draft the notice, you send it.',
    starters: [
      'Draft an SSSP for this site.',
      'Build a SWMS for working at height.',
      'Is this incident a notifiable event?',
    ],
  },

  // ── Trades (automotive + freight specialists) ────────────────────────
  // motor, transit, transit-freight — KILLED (absorbed into Forge / arataki).
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
    bundle: 'forge',
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
    bundle: 'forge',
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
    tile: 'accentGold',
    bundle: 'ensemble',
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
    bundle: 'ensemble',
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
    name: 'Helm',
    teReo: 'Tōro',
    description:
      'The whānau lead — the front door to the Hearth bundle. Household admin, school comms, appointments, meals (Kai) and everyday logistics, drafted for a parent to approve.',
    whatItDoes: [
      'Fronts the whole Hearth household: school notices, routines, appointments, meals and everyday logistics.',
      'Routes to Kai for the food shop and to the other Hearth modes; pulls dates, costs and deadlines out of notices.',
      'Holds household preferences, calendars and consent boundaries — and drafts urgent Auckland drop-offs for you to confirm.',
    ],
    whatYouGet: [
      'A weekly brief that puts the time-sensitive things first.',
      'School-comms and appointment drafts ready for a parent to send.',
      'A Mana Receipt (signed Tōro) on every output, and a permissions record so nothing slips.',
    ],
    sampleOutputs: [
      'This week: school assembly Wednesday 9am, dentist Friday 2pm, mufti-day gold-coin Thursday.',
      'Mila has no lunch — I can send it to school via Uber (Auckland), or there’s a sandwich on the bench. You pick.',
    ],
    nzKnowledge: ['NZ school term calendars (MoE)', 'Privacy Act 2020', 'NZ public holidays'],
    category: 'family',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'whanau',
    tile: 'accentGold',
    bundle: 'hearth',
    isBundleLead: true,
    greeting:
      'I’m Helm — the front door to your household. Tell me what’s on this week — school notices, appointments, the shop, the family calendar — and I’ll sort it into drafts and reminders. You approve before anything is sent, booked or bought.',
    starters: [
      'Brief my week.',
      'Shop for the week from this fridge photo.',
      'Send Mila’s lunch to school.',
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
    bundle: 'hearth',
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

  // ── Kaitiaki (animal health, welfare, service & conservation) ──────────
  // Lead: Keeper. Twelve specialists across three groups. These carry
  // bundle:'kaitiaki' and are surfaced through /bundles/kaitiaki + the Kaitiaki
  // card on the shelf, NOT as standalone flat-grid tiles (SHELF_AGENTS filters
  // them out). Chat + detail pages still resolve them by slug.
  {
    slug: 'keeper',
    name: 'Keeper',
    teReo: 'Kaitiaki',
    description:
      'The front door to Kaitiaki. Routes an animal question to the right kind of care — companion vet, farm, equine, exotic, doggy daycare, welfare triage, wildlife rehab or Threatened Species Recovery. Every reply is a draft for a registered vet, welfare officer, licensed operator or named kaitiaki reviewer to sign.',
    whatItDoes: [
      'Hears the request in plain English and routes it to the right specialist — asking one clarifying question only if it is genuinely ambiguous.',
      'Runs the bundle hard-rule checks on the way back: NZVA Code, Animal Welfare Act 1999, MPI notifiable-disease, DOC notification, council + vaccination cross-checks.',
      'Attaches a kaitiaki-review flag to any taonga species so the output cannot ship without a named human reviewer.',
    ],
    whatYouGet: [
      'The right specialist for the animal, without you having to know which one to ask.',
      'A clean draft with every statutory obligation surfaced, never buried.',
      'A Mana Receipt that names the specialist, the sources, and the human who must sign.',
    ],
    sampleOutputs: [
      'Routed to Large Animal — and flagged the M.bovis signal to the MPI notifiable-disease pathway, which cannot be suppressed.',
      'Kia ora — is this a pet, a farm animal, a wild animal, or something about your daycare?',
    ],
    nzKnowledge: [
      'NZVA Code of Professional Conduct',
      'Animal Welfare Act 1999',
      'Wildlife Act 1953',
      'Conservation Act 1987 s4 (Te Tiriti)',
    ],
    category: 'animal',
    modelTier: 'premium',
    priceTier: 'free',
    icon: 'paw',
    tile: 'cream',
    bundle: 'kaitiaki',
    isBundleLead: true,
    greeting:
      "Kia ora, I'm your Keeper. Tell me about the animal — a pet, a farm animal, a wild animal, or your daycare — and I'll route it to the right specialist. Every reply is a draft for a registered vet, welfare officer, licensed operator or kaitiaki reviewer to sign.",
    starters: [
      'My dog has been vomiting since this morning.',
      'We found an injured kererū on the road — what do I do?',
      "Draft tomorrow's pickup SMS for our daycare.",
      "There's a cow down in the paddock and the herd's off its milk.",
    ],
  },

  // Group A — Vet clinical
  {
    slug: 'vet-small-animal',
    name: 'Small Animal Vet',
    teReo: '',
    description:
      'Companion-animal consults for dogs, cats, rabbits and small mammals — a SOAP draft, differentials and a treatment plan for a registered veterinarian to examine and sign.',
    whatItDoes: [
      'Drafts a companion-animal SOAP, differential list and treatment plan from the presentation you describe.',
      'Cross-checks every prescription against the VetMed NZ formulary for species and weight.',
      'Prepares vaccination schedules, dental and desex plans, and end-of-life client-communication support.',
    ],
    whatYouGet: [
      'A structured consult draft, marked for the vet to examine and sign.',
      'A cost estimate as a range, stamped "confirm with clinic front-of-house".',
      'A Mana Receipt citing the NZVA Code, the relevant MPI Code of Welfare and the formulary entry.',
    ],
    sampleOutputs: [
      'SOAP drafted: 6yo DSH, acute vomiting — differentials listed; needs a physical exam, not diagnosed from history alone.',
      'Meloxicam draft cross-checked against VetMed NZ for weight — controlled-drug protocol cited; vet confirms.',
    ],
    nzKnowledge: [
      'NZVA Code of Professional Conduct',
      'MPI Codes of Welfare — Cats, Dogs, Rabbits',
      'VetMed NZ / NZ Formulary (veterinary)',
      'Veterinary Medicines Regulations 2010',
    ],
    category: 'animal',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'scribe',
    tile: 'cream',
    bundle: 'kaitiaki',
    greeting:
      "Tell me the presentation and I'll draft a SOAP, a differential list and a treatment plan — cross-checked against the VetMed NZ formulary. I never diagnose from a photo; a registered vet examines and signs.",
    starters: [
      'Draft a SOAP for a lame 4yo Labrador.',
      'Vaccination schedule for a new kitten.',
      'Discharge notes after a cat dental.',
    ],
  },
  {
    slug: 'vet-large-animal',
    name: 'Large Animal Vet',
    teReo: '',
    description:
      'Production-animal herd health for dairy, beef, sheep, goats and deer — with withholding periods, NAIT checks and MPI notifiable-disease pathways that can never be suppressed.',
    whatItDoes: [
      'Drafts herd and per-animal plans — mastitis, calving, lameness scoring, drench resistance, reproduction.',
      'Calculates milk and meat withholding periods and cross-checks NAIT on any movement or death.',
      'Fires the MPI notifiable-disease pathway on M.bovis and the OSPRI workflow on TB — always, never delayed.',
    ],
    whatYouGet: [
      'A plan with withholding days and a NAIT check surfaced up front.',
      'A notifiable-disease flag the moment production-animal signals appear.',
      'A Mana Receipt citing the DairyNZ or B+L protocol, the MPI code and the OSPRI reference.',
    ],
    sampleOutputs: [
      'Mastitis plan drafted — milk withholding 96h, meat 7d; antimicrobial choice per NZVA AMU guidance.',
      'M.bovis signal: this must go to MPI now — I cannot suppress or delay it. NAIT movement history attached.',
    ],
    nzKnowledge: [
      'DairyNZ SmartSAMM + Healthy Udder',
      'OSPRI TBfree + NAIT',
      'MPI biosecurity + notifiable-disease list',
      'NZVA antimicrobial-use guidelines',
    ],
    category: 'animal',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'careCaptain',
    tile: 'cream',
    bundle: 'kaitiaki',
    greeting:
      "Give me the herd or animal and the signs. I'll draft the plan with milk + meat withholding periods, a NAIT check, and an MPI notifiable-disease flag if one fires — that flag can never be suppressed.",
    starters: [
      'Subclinical mastitis across the herd — where do I start?',
      'Withholding periods for this antibiotic in dairy cows.',
      'Calving intervention checklist.',
    ],
  },
  {
    slug: 'vet-equine',
    name: 'Equine Vet',
    teReo: '',
    description:
      'Horse work across thoroughbred, harness, sport and leisure — lameness, colic triage, reproduction, pre-purchase exams, with live racing and FEI withdrawal-time checks before any prescription.',
    whatItDoes: [
      'Drafts the lameness or colic workup, respiratory and reproduction plans, and pre-purchase examinations.',
      'Cross-checks every prescription against the current NZTR, HRNZ and FEI prohibited-substance lists.',
      'Cites the owner + trainer + vet responsibility framework and any insurance/IDV interaction.',
    ],
    whatYouGet: [
      'A workup draft with a withdrawal-time table for the discipline.',
      'A live compliance stamp against the racing and FEI rules with the retrieval date.',
      'A Mana Receipt citing the rules and the sources.',
    ],
    sampleOutputs: [
      'Lameness workup drafted for a Standardbred — withdrawal-time table attached; HRNZ list checked today.',
      'Colic triage: red-flag signs listed, refer for immediate vet exam — never model-led.',
    ],
    nzKnowledge: [
      'NZTR rules of racing + integrity code',
      'HRNZ rules',
      'FEI prohibited-substances list',
      'NZVA Equine special interest group',
    ],
    category: 'animal',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'paw',
    tile: 'cream',
    bundle: 'kaitiaki',
    greeting:
      "Tell me the horse, the discipline and the signs. I'll draft the workup with a withdrawal-time table cross-checked against the current NZTR, HRNZ and FEI prohibited-substance lists before any prescription.",
    starters: [
      'Pre-purchase exam checklist for a sport horse.',
      'Withdrawal times for this drug before a race.',
      'Colic triage — what needs an urgent referral?',
    ],
  },
  {
    slug: 'vet-exotic',
    name: 'Exotic, Avian & Reptile Vet',
    teReo: '',
    description:
      'A credible second opinion on birds, reptiles, small mammals and companion fish — husbandry-first, with a zoonotic check and a hard route to DOC when an "exotic" turns out to be a native.',
    whatItDoes: [
      'Drafts the consult with a husbandry review — enclosure, diet, UVB, temperature gradient, cage-mate compatibility.',
      'Runs a CITES check on novel exotics and a zoonotic check every presentation.',
      'Routes a native species presented as "exotic" straight to Rescue Coordination and DOC notification.',
    ],
    whatYouGet: [
      'A species-appropriate plan a rural vet can stand behind.',
      'A husbandry review that catches the usual root cause.',
      'A Mana Receipt with the zoonotic and CITES/native checks recorded.',
    ],
    sampleOutputs: [
      'Bearded dragon off its food — husbandry review flags a low UVB output; plan drafted for the vet.',
      'That "green lizard" is a native gecko — this routes to DOC, not a pet consult.',
    ],
    nzKnowledge: [
      'ARAV + AAV open modules',
      'CITES Appendix I/II/III',
      'MPI imported-pet regulations',
      'NZVA exotic animal SIG',
    ],
    category: 'animal',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'fish',
    tile: 'cream',
    bundle: 'kaitiaki',
    greeting:
      "Tell me the species and the signs. I'll draft the consult with a husbandry review, a species-appropriate plan and a zoonotic-risk flag. If your “exotic” turns out to be a NZ native, I route it to DOC.",
    starters: [
      'My cockatiel is fluffed up and quiet.',
      'Husbandry check for a new bearded dragon setup.',
      'Guinea pig with hair loss — where do I start?',
    ],
  },

  // Group B — Welfare & service
  {
    slug: 'spca-workflow',
    name: 'SPCA Workflow',
    teReo: '',
    description:
      'Welfare case triage under the Animal Welfare Act 1999 — severity grading, jurisdiction, inspector-brief and MPI-referral drafting, and the adoption + foster pipeline, for an authorised welfare officer to sign.',
    whatItDoes: [
      'Grades cruelty severity on the AWA framework and checks jurisdiction — SPCA vs MPI vs council.',
      'Drafts the inspector brief and the MPI cruelty-complaint referral when it is triggered.',
      'Runs the adoption and foster pipeline — matching, medical logs, return-to-shelter workflows.',
    ],
    whatYouGet: [
      'A triage with a severity grade and a jurisdiction check.',
      'An inspector-brief draft with facts, evidence and next investigative step.',
      'A Mana Receipt citing the AWA section and the Code of Welfare.',
    ],
    sampleOutputs: [
      'Severity: serious ill-treatment (AWA s29) — jurisdiction SPCA with MPI referral drafted.',
      'Foster match cross-checked against declared capacity and existing animals in the home.',
    ],
    nzKnowledge: [
      'Animal Welfare Act 1999 (PCO)',
      'Animal Welfare (Care and Procedures) Regulations 2018',
      'MPI Codes of Welfare',
      'SPCA Certified Inspector powers (AWA s124)',
    ],
    category: 'animal',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'shield',
    tile: 'cream',
    bundle: 'kaitiaki',
    greeting:
      "Describe the complaint. I'll draft a severity grade, a jurisdiction check and an inspector brief — and the MPI referral if it's triggered. I never advise anyone to enter another person's property; those powers vest in the authorised inspector.",
    starters: [
      'Triage a report of a dog left without water.',
      'Draft an inspector brief for a hoarding complaint.',
      'Set up the adoption pipeline for an intake litter.',
    ],
  },
  {
    slug: 'rescue-coordination',
    name: 'Rescue Coordination',
    teReo: '',
    description:
      'Multi-agency coordination for injured, orphaned or displaced animals — beached marine mammals, injured natives, displaced companions and weather-event response. Human safety first; trained responders act.',
    whatItDoes: [
      'Confirms the species, checks jurisdiction, and drafts the responder sequence with a chain-of-custody note.',
      'Routes beached marine mammals to Project Jonah + DOC, in that order, always.',
      'Surfaces the Wildlife Act 1953 s63 offence loudly whenever an untrained person has handled a native.',
    ],
    whatYouGet: [
      'A rescue triage with region-specific contacts and fallback numbers.',
      'An evidence checklist — photos with EXIF, location, time, condition.',
      'A Mana Receipt with the chain-of-custody note recorded.',
    ],
    sampleOutputs: [
      'Beached dolphin at Ōtaki — call Project Jonah then DOC; keep it upright and wet, do not push it out.',
      'Injured ruru handled by a member of public — Wildlife Act applies; route to Wildbase + DOC.',
    ],
    nzKnowledge: [
      'DOC operational rescue procedures',
      'Project Jonah stranding manual',
      'Marine Mammal Protection Act 1978',
      'Wildlife Act 1953',
    ],
    category: 'animal',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'anchor',
    tile: 'cream',
    bundle: 'kaitiaki',
    greeting:
      "Tell me what's been found and where. I'll confirm the species, check jurisdiction and draft the responder sequence with a chain-of-custody note. Never handle a marine mammal or native yourself — I route you to trained responders.",
    starters: [
      "There's a seal on the beach — what do I do?",
      'Found an orphaned kererū chick.',
      'Displaced dog after the storm — how do I reunite it?',
    ],
  },
  {
    slug: 'doggy-daycare',
    name: 'Doggy Daycare',
    teReo: '',
    description:
      'The operating system for a boutique NZ doggy daycare — enrolment to Welcome Pack, SMS pickup coordination in the carer’s voice, email in the owner’s voice, Xero invoicing, vaccination + council tracking. Every message and invoice is a draft the operator sends.',
    whatItDoes: [
      'Drafts the 5-page Welcome Pack from the enrolment form in the operator’s voice — a 2-minute review instead of 20–30.',
      'Drafts the monthly Xero invoice as a Draft — part-month, itemised, small-pup discounts + swap credits + surcharges pre-applied.',
      'Drafts next-day pickup SMS in the carer’s voice — 30-min window, address-per-day, pre-pickup checklist (fed / toileted / collar + tag).',
    ],
    whatYouGet: [
      'Channel-aware drafts: email sounds like the owner, SMS sounds like the carer, never mixed.',
      'A vaccination + council-registration ledger with 90/60/30-day nudges, and AWA-compliant incident reports.',
      'A Mana Receipt — and the discipline that Keeper never sends; the operator approves and sends every draft.',
    ],
    sampleOutputs: [
      'Hi there, Pick for Biscuit tomorrow will be between 7.50-8.15am. Home address right? Thanks Sam \u{1F600}',
      'Xero invoice drafted: 4 daycare + 5 overnight (small-pup 10%) = NZ$665, 7-day terms — review and issue.',
    ],
    nzKnowledge: [
      'Animal Welfare Act 1999 + Regulations 2018',
      'Dog Control Act 1996 (s57A biting reports)',
      'MPI Code of Welfare — Dogs (2018)',
      'NZVA/NZKC vaccination protocol · Xero API',
    ],
    category: 'animal',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'paw',
    tile: 'cream',
    bundle: 'kaitiaki',
    greeting:
      "Tell me about the dog, the roster or the pickup. I'll draft the Welcome Pack, the next-day SMS in your carer's voice, the monthly Xero invoice, or the owner email in your voice — you review and send. I never send on anyone's behalf.",
    starters: [
      'A new dog just enrolled — draft the Welcome Pack.',
      "Draft this month's Xero invoice for Biscuit.",
      "Draft tomorrow's pickup SMS in the carer's voice.",
      'A dog nipped another at pickup — draft the incident report.',
    ],
  },
  {
    slug: 'kaiako',
    name: 'Kaiako',
    teReo: '',
    description:
      'The force-free dog trainer inside Alphassembl — LIMA, the humane hierarchy, and reward-based methods, in plain-English plans an owner can follow at home. Strong on the two hardest problems, reactivity and jumping, plus recall, biting and crate work. Grounds every reply in the Dog Control Act 1996, SPCA NZ advice and Ian Dunbar’s puppy guidance, and carries a Trust score on each. Guidance only — the moment a bite, aggression or severe anxiety is in play, it refers you to a vet or a certified behaviourist.',
    whatItDoes: [
      'Builds week-by-week, force-free training plans — reactivity under threshold, four-on-the-floor for jumping, recall, bite-inhibition and crate training — using LIMA and the humane hierarchy.',
      'Runs a silent urgency check on every message (routine / concerning / refer_to_professional) and refers straight out to a vet or certified behaviourist the moment a bite or real aggression appears.',
      'Names its source on every claim — the trainer, the method, the SPCA page or the Act — and carries a Trust score (A official/primary, B expert channel, C consensus).',
    ],
    whatYouGet: [
      'A realistic plan measured in weeks, not days, using only force-free methods — never a shock collar, prong, choke chain or "dominance" fix.',
      'Every claim grounded in the Dog Control Act 1996, SPCA NZ or Dunbar, with a Trust tier you can see.',
      'A clear line it will not cross: a bite, aggression or severe anxiety goes to a professional in person, never DIY.',
    ],
    sampleOutputs: [
      'Jumping, week 1: everyone becomes a statue the moment paws leave the floor, and the treat lands the instant four paws are down (Yin; Vette). Real change is 4–6 weeks. Trust: A.',
      'REFER: a snap that made contact is past general training. Please see your vet or an IAABC/CCPDT behaviourist now — I’ve pulled some Auckland options for you.',
    ],
    nzKnowledge: [
      'Dog Control Act 1996 (registration, microchipping, control in public)',
      'SPCA NZ advice (spca.nz/advice)',
      'Ian Dunbar — Before/After You Get Your Puppy (dogstardaily.com)',
      'IAABC / CCPDT professional referral guidance',
    ],
    category: 'animal',
    modelTier: 'premium',
    priceTier: 'free',
    icon: 'paw',
    tile: 'cream',
    bundle: 'kaitiaki',
    greeting:
      "Kia ora — I’m your Alphassembl trainer. Tell me about your dog and what’s tricky: pulling on the lead, puppy biting, recall, jumping on visitors, crate training. I’ll build a force-free plan grounded in NZ advice and cite where each step comes from. Guidance only — anything with a bite or real aggression, I’ll point you straight to a vet or certified behaviourist.",
    starters: [
      'Help with leash pulling.',
      "My puppy won't stop biting.",
      'How do I teach recall?',
      'Crate training help.',
    ],
  },

  // Group C — Conservation & wildlife (taonga specialties are kaumātua-gated)
  {
    slug: 'kakapo-recovery',
    name: 'Kākāpō Recovery',
    teReo: '',
    description:
      'Field-ops support for the DOC Kākāpō Recovery Programme. Coming soon — held until a Ngāi Tahu + DOC tripartite sign-off. The model never generates whakapapa and never surfaces a tracked-bird location.',
    whatItDoes: [
      'Drafts field-ops SOAP for a named bird — transmitter status, weight trend, feeding-station attendance, breeding status (when live).',
      'Surfaces the aspergillosis differential immediately on any respiratory presentation.',
      'Routes every output touching a named bird to a named Ngāi Tahu + DOC kaitiaki reviewer.',
    ],
    whatYouGet: [
      'A programme-scoped draft that follows DOC operational rules exactly.',
      'Ngāi Tahu data sovereignty over all mātauranga and the tracked-bird database.',
      'A Mana Receipt naming the kaitiaki reviewer required before anything ships.',
    ],
    sampleOutputs: [
      'Coming soon — pending iwi + DOC sign-off.',
      'Respiratory sign on a named bird — aspergillosis differential surfaced; routes to the Recovery Programme.',
    ],
    nzKnowledge: [
      'DOC Kākāpō Recovery Programme (partnership-gated)',
      'DOC Species Recovery Plan — Strigops habroptilus',
      'Ngāi Tahu kaitiaki protocols (iwi-owned)',
      'Conservation Act 1987 s4',
    ],
    category: 'animal',
    modelTier: 'premium',
    priceTier: 'business',
    status: 'coming_soon',
    icon: 'koru',
    tile: 'cream',
    bundle: 'kaitiaki',
    greeting:
      'Coming soon — pending iwi + DOC sign-off. When live, every output touching a named bird routes to a named Ngāi Tahu + DOC kaitiaki reviewer, and I never generate whakapapa or surface transmitter data.',
    starters: [
      'What will this specialty do once it ships?',
      'Why is Kākāpō Recovery held for iwi sign-off?',
    ],
  },
  {
    slug: 'kiwi-conservation',
    name: 'Kiwi Conservation',
    teReo: '',
    description:
      'National Kiwi Recovery Plan support — Operation Nest Egg, community trap programmes, dog-avoidance in kiwi zones. Coming soon — ships only after a Kiwis for Kiwi MOU and rohe-appropriate kaumātua sign-off.',
    whatItDoes: [
      'Drafts field surveys, trap-line audits and Operation Nest Egg logistics briefs (when live).',
      'Always frames uncontrolled dogs near kiwi as a Wildlife Act 1953 offence.',
      'Requires kaumātua-validated review on any translocation or whakapapa reference.',
    ],
    whatYouGet: [
      'Recovery-plan-scoped drafts for trusts and community groups.',
      'Certified-provider references for dog-aversion training.',
      'A Mana Receipt naming the kaitiaki reviewer for the rohe.',
    ],
    sampleOutputs: [
      'Coming soon — pending iwi sign-off for the translocation rohe.',
      'Trap-cover standard cited to avoid non-target kiwi capture near the zone.',
    ],
    nzKnowledge: [
      'DOC Kiwi Recovery Plan',
      'Kiwis for Kiwi Best Practice Manual',
      'Operation Nest Egg operational guide',
      'Wildlife Act 1953',
    ],
    category: 'animal',
    modelTier: 'premium',
    priceTier: 'business',
    status: 'coming_soon',
    icon: 'koru',
    tile: 'cream',
    bundle: 'kaitiaki',
    greeting:
      'Coming soon — pending iwi sign-off for the translocation rohe. When live, any translocation or whakapapa reference routes to a named kaitiaki reviewer, and I refuse to produce handling content for an unpermitted person.',
    starters: [
      'What will Kiwi Conservation cover when it ships?',
      'How does the kaumātua sign-off gate work?',
    ],
  },
  {
    slug: 'wildbase-recovery',
    name: 'Wildbase Recovery',
    teReo: '',
    description:
      'The wildlife-hospital pathway — admission protocols, orthopaedic repair, oiled-seabird and lead-toxicity care, rehab and soft-release. Every admission drafts a DOC notification. A draft for a registered vet + kaitiaki reviewer.',
    whatItDoes: [
      'Drafts the admission decision — admit, refer, humanely euthanise, or release-with-tag.',
      'Builds the rehab plan with a target release date and release-site coordination with DOC.',
      'Checks the radio-transmitter mass limit (3% of body weight) before any fitting recommendation.',
    ],
    whatYouGet: [
      'A hospital-pathway SOAP defined by the case, not the species.',
      'A DOC notification draft on every admission, with the Wildlife Act permit cited.',
      'A Mana Receipt naming a kaitiaki reviewer where the species is taonga.',
    ],
    sampleOutputs: [
      'Kererū with lead toxicity — admission drafted; DOC notification attached; chelation plan for the vet.',
      'Wing fracture in a kārearea — orthopaedic plan; transmitter mass limit checked before tagging.',
    ],
    nzKnowledge: [
      'Wildbase clinical protocols (partnership)',
      'DOC wildlife handling standards',
      'Oiled-wildlife response manual',
      'Wildlife Act 1953',
    ],
    category: 'animal',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'careCaptain',
    tile: 'cream',
    bundle: 'kaitiaki',
    greeting:
      "Tell me the casualty and its condition. I'll draft the admission decision, a rehab plan with a release-site coordination note, and the DOC notification — with the radio-transmitter mass limit checked before any tag.",
    starters: [
      'Draft an admission for an oiled seabird.',
      'Rehab plan for a kererū with a wing fracture.',
      'What goes in the DOC notification?',
    ],
  },
  {
    slug: 'zoo-vet',
    name: 'Zoo Vet',
    teReo: '',
    description:
      'Ex-situ collection support for NZ zoos — NZCCM-style clinical notes, species-management dashboards, ZAA + welfare-code compliance, and visitor-education content. Built with Auckland Zoo as design partner (concept · pilot pending).',
    whatItDoes: [
      'Drafts SOAP/DAP notes for the resident collection and wild-native casualties, with species-specific dosing cross-checked against VetMed NZ + AZWMP.',
      'Supports species-management plans, studbook queries and ZAA/AZA/EAZA TAG-bulletin translation for NZ context.',
      'Generates "meet [name]" visitor-education cards in the zoo’s public voice — holding taonga naming + whakapapa for iwi.',
    ],
    whatYouGet: [
      'Clinical, dashboard and education drafts for a vet, keeper or education-team member to sign.',
      'A welfare-code tracker against the MPI Code of Welfare — Zoos and the ZAA manual.',
      'A Mana Receipt with the clinical-accuracy stamp and the iwi-consultation hold on taonga content.',
    ],
    sampleOutputs: [
      'Rhino forelimb lameness post-transfer — SOAP drafted; NSAID dose from AZWMP cross-checked against VetMed NZ.',
      'Meet-the-chick card drafted — naming + whakapapa held as placeholders for iwi consultation.',
    ],
    nzKnowledge: [
      'ZAA Accreditation Manual',
      'MPI Code of Welfare — Zoos',
      'AZWMP proceedings · VetMed NZ',
      'CITES + MPI Import Health Standards',
    ],
    category: 'animal',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'paw',
    tile: 'cream',
    bundle: 'kaitiaki',
    greeting:
      "Tell me the animal and the moment — a clinical note, a species-management query, or a “meet the animal” card. I draft inside your zoo's voice; naming and whakapapa for taonga species are held for iwi consultation, never generated.",
    starters: [
      'Draft a clinical note for a giraffe with a foot issue.',
      'Draft a meet-the-chick card for a kiwi hatch.',
      'Summarise this species-management plan.',
    ],
  },
  {
    slug: 'species-recovery',
    name: 'DOC Species Recovery',
    teReo: '',
    description:
      'General support across the ~200 published Threatened Species Recovery Plans — tuatara, whio, takahē, kōkako, kākā, kea, tuna and more. Recovery-plan interpretation, translocation logistics, predator-control review. Taonga species route to a named kaitiaki reviewer.',
    whatItDoes: [
      'Drafts species-specific recovery-plan briefs, population survey plans and translocation logistics.',
      'Surfaces the 1080 / brodifacoum operational rules loudly — consultation obligations, notification periods, GPS boundaries.',
      'Cross-references iwi consent obligations and the Wildlife Act 1953 permit pathway on every translocation.',
    ],
    whatYouGet: [
      'A recovery-plan-scoped draft for a DOC + iwi partner to sign.',
      'Community-sanctuary content with the sanctuary’s own kaitiaki-partner attribution.',
      'A Mana Receipt citing the Recovery Plan version and the iwi partner.',
    ],
    sampleOutputs: [
      'Whio translocation logistics drafted — iwi consent obligations and the Wildlife Act permit pathway cross-referenced.',
      '1080 aerial-drop review — consultation and notification rules surfaced with the DOC manual version cited.',
    ],
    nzKnowledge: [
      'DOC Threatened Species Recovery Plans',
      'NZ Threat Classification System',
      'Predator Free 2050 operational content',
      'Wildlife Act 1953 · DOC translocation SOP',
    ],
    category: 'animal',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'koru',
    tile: 'cream',
    bundle: 'kaitiaki',
    greeting:
      "Tell me the species and the kaupapa. I'll draft the recovery-plan brief, survey or translocation logistics — with 1080/brodifacoum consultation rules surfaced loudly and taonga content routed to a named kaitiaki reviewer.",
    starters: [
      'Summarise the takahē recovery plan.',
      'Draft translocation logistics for whio.',
      'Predator-control programme review for a mainland island.',
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

/**
 * The flat "agent shelf" — every public agent EXCEPT those that live inside a
 * bundle (currently the Kaitiaki specialists + Keeper). Bundle members surface
 * through their bundle card + /bundles/<slug>, never as standalone tiles, so the
 * homepage grid, the /agents grid and the shelf count all read from here.
 */
export const SHELF_AGENTS: PublicMarketplaceAgent[] =
  PUBLIC_MARKETPLACE_AGENTS.filter((a) => !a.bundle);

/** Public agents that belong to a given bundle, in registry order. */
export function bundleAgents(bundle: string): PublicMarketplaceAgent[] {
  return PUBLIC_MARKETPLACE_AGENTS.filter((a) => a.bundle === bundle);
}

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
 * Pro Stack composition helpers. An agent counts as "everyday" (one of the 3)
 * when it's non-vertical and under $100/mo, and as a "specialist" (the 1) when
 * it's non-vertical and $100+/mo. Verticals are sold through All-Access only.
 */
export function agentEligibleForProStack(
  agent: Pick<MarketplaceAgent, 'priceNzd' | 'vertical'>,
): boolean {
  return !agent.vertical && agent.priceNzd < 100;
}

export function agentIsSpecialist(
  agent: Pick<MarketplaceAgent, 'priceNzd' | 'vertical'>,
): boolean {
  return !agent.vertical && agent.priceNzd >= 100;
}

/**
 * Maps a marketplace model tier to a concrete model id for the chat route.
 * The registry stays the single source of truth.
 */
export const MODEL_TIER_TO_ANTHROPIC: Record<ModelTier, string> = {
  cheap: 'claude-haiku-4-5-20251001',
  mid: 'claude-sonnet-4-6',
  premium: 'claude-opus-5',
};
