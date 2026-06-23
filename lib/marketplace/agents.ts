/**
 * Agent marketplace registry — LOCKED CANON 23-agent roster (2026-06-23).
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

export type ModelTier = 'cheap' | 'mid' | 'premium';
/** Coarse DB bucket — uniformly 'per_agent' (price set by the catalogue tier). */
export type PricingTier = 'per_agent' | 'free' | 'freemium' | 'paid';
/** Canon price tiers: Free / $9.99 / $199 (legacy values kept for the enum). */
export type PriceTier = 'free' | 'toro' | 'whanau' | 'pro' | 'business';
export type AgentStatus = 'live' | 'coming_soon';
/** Avatar tile colourway (canon). */
export type TileTone = 'cream' | 'canary' | 'ink';

export type MarketplaceCategory = 'family' | 'business' | 'creative' | 'trades' | 'health';

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
};

export const CATEGORIES: { slug: MarketplaceCategory; label: string; teReo: string }[] = [
  { slug: 'family', label: 'Family & Whānau', teReo: 'Whānau' },
  { slug: 'business', label: 'Business & SME', teReo: 'Pakihi' },
  { slug: 'creative', label: 'Marketing & Creative', teReo: 'Auaha' },
  { slug: 'trades', label: 'Trades, Ops & Coast', teReo: 'Mahi' },
  { slug: 'health', label: 'Health & Service', teReo: 'Hauora' },
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
  whanau: 24.99,
  pro: 49.99,
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
> & { status?: AgentStatus; tools?: string[]; skills?: string[] };

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
    systemPrompt: body.replace('[SHARED BRAND PREFIX]', SHARED_BRAND_PREFIX),
  };
}

const AGENT_DEFS: AgentDef[] = [
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
    tile: 'ink',
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
    tile: 'ink',
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
    tile: 'ink',
    greeting: 'Give me your certs and obligations and I will track the expiries and flag what is due. I never renew or certify.',
    starters: ['What is expiring soon?', 'Track our certifications.'],
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
    tile: 'ink',
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
    tile: 'ink',
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
    tile: 'ink',
    greeting: 'Connect your POS and supplier list, and I will write the daily brief, draft the reorders, and triage returns and customer queries for your sign-off.',
    starters: [
      'Write today’s sales brief.',
      'Draft a reorder for low stock.',
      'Triage this customer return.',
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
  whanau: '$24.99',
  pro: '$49.99',
  business: '$199',
};

/**
 * Canon card/detail price label — per agent: Free / $9.99/mo / $199/mo.
 * (The first 3 messages with any agent are free before the paywall.)
 */
export function priceLabel(agent?: Pick<MarketplaceAgent, 'priceNzd'>): string {
  if (!agent || agent.priceNzd === 0) return 'Free';
  return `$${agent.priceNzd}/mo`;
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
