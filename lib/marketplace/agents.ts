/**
 * Agent marketplace registry — the App Store-style catalogue.
 *
 * This is the consumer pivot: instead of "kete with agents inside", users
 * browse a curated shelf of agents, open one, chat with it, install it as a
 * PWA, and (later) pay per agent. This file is the single curated source of the
 * 30 hero agents — the deliberate cut from the wider 78-strong legacy fleet
 * (see agent-research/agent-roster-30.md). It is the source of truth; the
 * Supabase `agents` table mirrors it (seed migration 20260623140000).
 *
 * Each agent carries everything the marketplace surfaces need:
 *   - identity: slug, name, te reo label, one-line description
 *   - merch:    category, model tier, pricing tier (NZ ladder), avatar icon
 *   - detail:   whatItDoes / whatYouGet bullets + sample outputs + NZ knowledge
 *   - chat:     a LOCKED system prompt (kept server-side — never sent to the
 *               browser; see `app/api/agents/[slug]/chat/route.ts`)
 *
 * The locked, production-grade per-agent prompts (v2.0) live verbatim in
 * `agent-prompts.ts` and are composed with the shared brand prefix below. Keep
 * this file the canonical registry — do not fork it.
 */

import { AGENT_PROMPTS, SHARED_BRAND_PREFIX } from './agent-prompts';

export type ModelTier = 'cheap' | 'mid' | 'premium';
/** Coarse pricing bucket mirrored to the DB `pricing_tier` enum. */
export type PricingTier = 'free' | 'freemium' | 'paid';
/** The NZ pricing ladder shown on cards + detail (see pricing-benchmarks-nz.md). */
export type PriceTier = 'free' | 'toro' | 'whanau' | 'pro' | 'business';
export type AgentStatus = 'live' | 'coming_soon';

export type MarketplaceCategory =
  | 'family'
  | 'business'
  | 'trades'
  | 'creative'
  | 'healthcare'
  | 'maritime'
  | 'education'
  | 'compliance'
  | 'legal'
  | 'financial';

export type MarketplaceAgent = {
  /** stable URL + DB key */
  slug: string;
  /** display name */
  name: string;
  /** te reo label / sub-name shown under the name */
  teReo: string;
  /** one-line marketplace-card description */
  description: string;
  /** longer "what this does" bullets for the detail page */
  whatItDoes: string[];
  /** "what you get" — the concrete outputs/value bullets */
  whatYouGet: string[];
  /** two short sample outputs shown on the detail page */
  sampleOutputs: string[];
  /** the live NZ sources / APIs this agent is wired into */
  nzKnowledge: string[];
  category: MarketplaceCategory;
  modelTier: ModelTier;
  /** coarse bucket (DB enum) — derived from priceTier */
  pricingTier: PricingTier;
  /** NZ pricing-ladder tier */
  priceTier: PriceTier;
  /** headline monthly price in NZD (0 = free) */
  priceNzd: number;
  /** live | coming_soon */
  status: AgentStatus;
  /** lucide-react icon name — resolved in the UI (placeholder avatar) */
  icon: string;
  /** card/avatar accent (Dash-aligned palette) */
  accent: string;
  /** LOCKED system prompt — server-side only, never shipped to the client */
  systemPrompt: string;
  /** opening line the agent greets the user with in chat */
  greeting: string;
  /** suggested first prompts shown as chips in the empty chat state */
  starters: string[];
  /** deep link to the live HAPAI tool, when one already exists */
  toolHref?: string;
};

export const CATEGORIES: { slug: MarketplaceCategory; label: string; teReo: string }[] = [
  { slug: 'family', label: 'Family & Home', teReo: 'Whānau' },
  { slug: 'business', label: 'Business & SME', teReo: 'Pakihi' },
  { slug: 'trades', label: 'Trades & Construction', teReo: 'Hanga' },
  { slug: 'creative', label: 'Marketing & Creative', teReo: 'Auaha' },
  { slug: 'healthcare', label: 'Healthcare', teReo: 'Hauora' },
  { slug: 'maritime', label: 'Maritime', teReo: 'Moana' },
  { slug: 'education', label: 'Education', teReo: 'Mātauranga' },
  { slug: 'compliance', label: 'Compliance', teReo: 'Tiaki' },
  { slug: 'legal', label: 'Legal', teReo: 'Ture' },
  { slug: 'financial', label: 'Financial', teReo: 'Pūtea' },
];

export const CATEGORY_LABELS: Record<MarketplaceCategory, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.label]),
) as Record<MarketplaceCategory, string>;

// Dash brand palette (locked 2026-06-23). Canary-forward; see HANDOFF.md §2.
export const PALETTE = {
  canary: '#FFD42A', // primary
  canary2: '#FFE27A', // light canary / gradients
  ink: '#3A3832', // charcoal — headlines, dark surfaces, body ink
  body: '#56544B', // body text
  paper: '#FFFFFF', // canvas
  cream: '#FFF7EC', // soft fill / nested tiles
  hairline: '#EFEADC', // borders
  gold: '#C79B1F', // eyebrow / accent text
  muted: '#8A8678', // mono labels
} as const;

/** The dash motif — a row of dashes that replaces hazard stripes everywhere. */
export const DASH_MOTIF =
  'repeating-linear-gradient(90deg, #FFD42A 0 20px, transparent 20px 32px)';

/** NZ pricing ladder → headline monthly NZD (0 = free). */
const PRICE_TIER_NZD: Record<PriceTier, number> = {
  free: 0,
  toro: 9.99,
  whanau: 24.99,
  pro: 49.99,
  business: 199,
};

/** NZ pricing ladder → coarse DB bucket. */
const PRICE_TIER_TO_PRICING: Record<PriceTier, PricingTier> = {
  free: 'free',
  toro: 'freemium',
  whanau: 'freemium',
  pro: 'paid',
  business: 'paid',
};

/** Authoring shape — the full MarketplaceAgent is derived from this. */
type AgentDef = Omit<
  MarketplaceAgent,
  'systemPrompt' | 'pricingTier' | 'priceNzd' | 'status'
> & { status?: AgentStatus };

function buildAgent(def: AgentDef): MarketplaceAgent {
  const body = AGENT_PROMPTS[def.slug];
  if (!body) throw new Error(`No locked system prompt for marketplace agent "${def.slug}"`);
  return {
    ...def,
    status: def.status ?? 'live',
    priceNzd: PRICE_TIER_NZD[def.priceTier],
    pricingTier: PRICE_TIER_TO_PRICING[def.priceTier],
    // Compose the locked prompt: substitute the shared brand prefix.
    systemPrompt: body.replace('[SHARED BRAND PREFIX]', SHARED_BRAND_PREFIX),
  };
}

const AGENT_DEFS: AgentDef[] = [
  // ── Family & Whānau ──────────────────────────────────────────────────
  {
    slug: 'toro',
    name: 'Tōro',
    teReo: 'Whānau Tāhuhu',
    description:
      'The family-life navigator. SMS-first help for school notices, meals, the calendar, elder check-ins and the household admin you keep forgetting.',
    whatItDoes: [
      'Triages school notices, GP recalls and daycare emails — surfaces every date and drafts a reply.',
      "Runs the family calendar: bus routes, school terms, who's collecting who, a morning brief and an evening look-ahead.",
      'Plans the week\'s meals from a pantry photo, tracks renewals (rego, WoF, power, insurance), and keeps a quiet family memory.',
    ],
    whatYouGet: [
      'SMS messages and drafted bookings — never auto-sent.',
      'A morning brief and an evening look-ahead.',
      "A searchable family archive: birthdays, immunisations, 'when was Mia's last dental check?'",
    ],
    sampleOutputs: [
      'School trip Fri 28 Jun — $12 + signed slip. Reply Y to add to the calendar.',
      'Morning brief: bus 25 on time, mufti day Wednesday, rego due in 6 days.',
    ],
    nzKnowledge: [
      'AT / Metlink / ORC GTFS feeds',
      'MetService',
      'NZ Curriculum + Te Marautanga',
      'Well Child Tamariki Ora schedule',
      'Oranga Tamariki Act 1989 safeguarding',
      'Privacy Act 2020 (IPP 1, 11, 3A)',
      'MoE school term calendars',
    ],
    category: 'family',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'Users',
    accent: '#FFD42A',
    greeting:
      "I'm Tōro — the friend on the other end of a text who remembers everything for the family. What's on today?",
    starters: [
      'Paste a school notice and pull out the dates.',
      "Plan the week's dinners from what's in the fridge.",
      'Set up a daily check-in with my mum.',
    ],
  },
  {
    slug: 'study-buddy',
    name: 'Study Buddy',
    teReo: 'Ako Hoa',
    description:
      'A patient NCEA and curriculum coach for Kiwi kids and teens. Explains, drills and predicts the question — never hands over the answer.',
    whatItDoes: [
      'Coaches NZ Curriculum (Years 1–10), Te Marautanga, and NCEA Levels 1–3 across every subject.',
      'Builds essay plans, quote checklists, recall quizzes and study sprints at the target grade band.',
      'Marks only against the published Achievement Standards, citing the standard number and year.',
    ],
    whatYouGet: [
      'A goal, three tasks and an exemplar (in a different topic) every session.',
      'Recall quizzes and exam-style practice with hints.',
      'A parent-friendly weekly summary: what was practised, where the gap is, what to ask the teacher.',
    ],
    sampleOutputs: [
      "Here's quadratics with one worked example, then three for you — show me your working.",
      'Parent note: strong on Pythagoras, shaky on surds — ask the teacher about AS91027.',
    ],
    nzKnowledge: [
      'NZQA Achievement Standards (NCEA)',
      'NZ Curriculum / Te Marautanga',
      'Te Aka Māori Dictionary',
      'ERO guidance',
    ],
    category: 'family',
    modelTier: 'mid',
    priceTier: 'free',
    icon: 'GraduationCap',
    accent: '#FFE27A',
    greeting:
      "I'm your study coach. Tell me the subject, level and what you're stuck on — I'll explain it, then we practise. I won't write it for you.",
    starters: [
      'Help me plan an NCEA Level 2 English essay.',
      'Quiz me on photosynthesis.',
      'Explain standard deviation simply.',
    ],
  },
  {
    slug: 'kai-planner',
    name: 'Kai Planner',
    teReo: 'Kai Whakatō',
    description:
      'A week of dinners from a photo of the fridge — budget kept honest, shopping list ordered by supermarket aisle.',
    whatItDoes: [
      "Reads a fridge or pantry photo and lists what you've got.",
      'Builds a 7-day plan with a leftover plan baked in — day-1 cook feeds day-3.',
      "Orders the shopping list by Pak'nSave / New World / Countdown aisle with a running total.",
    ],
    whatYouGet: [
      'A day-by-day meal table with dietary tags (gluten-free, halal, kai Māori, kid-friendly).',
      'An aisle-ordered shopping list with an NZD estimate.',
      'Three leftover hacks and a share card for the week.',
    ],
    sampleOutputs: [
      'Tonight: beef tacos from the mince and capsicum you already have.',
      "Shop: 12 items grouped by aisle, about $74 at Pak'nSave.",
    ],
    nzKnowledge: [
      'Grocer NZ price feed / supermarket specials',
      'MPI food-safety guidance',
      'Heart Foundation Tick reference',
    ],
    category: 'family',
    modelTier: 'cheap',
    priceTier: 'free',
    icon: 'ChefHat',
    accent: '#FFD42A',
    greeting:
      "Send a photo or a list of what's in the fridge, your household size and budget — I'll plan the week's meals and the shop.",
    starters: [
      'Plan a week of dinners for a family of four on a tight budget.',
      'Half a cabbage, mince, eggs and two carrots — what can we make?',
    ],
  },
  {
    slug: 'care-captain',
    name: 'Care Captain',
    teReo: 'Kaitiaki Kaumātua',
    description:
      'A daily check-in with a nominated elder. If something looks off — no reply, distress, a pattern change — it escalates to the named caregiver.',
    whatItDoes: [
      'Sends a warm daily SMS or voice check-in at a chosen time.',
      'Learns the elder\'s baseline and escalates on no-reply, distress words, or a pattern shift.',
      'Optionally reminds about GP, pharmacy and podiatry appointments.',
    ],
    whatYouGet: [
      'A check-in reply log, visible to both elder and caregiver.',
      'A daily digest to the caregiver: replied / time / mood / flag.',
      "A clear escalation message when something's triggered.",
    ],
    sampleOutputs: [
      'Morning! Did you sleep okay last night — yes or not really?',
      'Caregiver alert: no reply by 11am, second day running. Suggest a call.',
    ],
    nzKnowledge: [
      'Healthline 0800 611 116 / Whakarongorau 1737',
      'ACC injury claim triggers',
      'St John ambulance triggers',
      'Age Concern referral paths',
      'SuperGold benefits',
    ],
    category: 'family',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'HeartHandshake',
    accent: '#C79B1F',
    greeting:
      "I'll check in on your loved one each day and let you know if anything looks off. Who am I checking in with, and when?",
    starters: ['Set up a 9am check-in with my dad.', "What happens if he doesn't reply?"],
  },

  // ── Business & SME ───────────────────────────────────────────────────
  {
    slug: 'ledger',
    name: 'Ledger',
    teReo: 'Pūkete',
    description:
      'Tax and GST for NZ business. Reads the books in Xero or MYOB, drafts the return, and never files without your sign-off.',
    whatItDoes: [
      'Drafts the GST101A return — every line traced to a source transaction.',
      'Projects provisional tax (standard, estimation, AIM, ratio) in best / likely / cautious scenarios.',
      'Prepares the end-of-year balance-date pack and flags FBT/RWT/NRWT edges for your accountant.',
    ],
    whatYouGet: [
      'A drafted GST return ready for your accountant to check.',
      'A provisional tax projection with assumptions stated.',
      'An end-of-year pack: P&L and balance-sheet read-out, positions, questions for the CA.',
    ],
    sampleOutputs: [
      'GST101A draft: output tax $4,120, input tax $1,380, to pay $2,740 — every line referenced.',
      'Income Tax Act 2007 s CB 4 may apply here — flagged for CA review.',
    ],
    nzKnowledge: [
      'IRD tax-rate tables + Tax Information Bulletins',
      'IRD interpretation statements',
      'NZBN registry',
      'Companies Office filings',
    ],
    category: 'business',
    modelTier: 'mid',
    priceTier: 'pro',
    icon: 'Calculator',
    accent: '#C79B1F',
    greeting:
      "Connect Xero or MYOB read-only, or paste your numbers — I'll draft the GST return and tax position. Nothing gets filed without your sign-off.",
    starters: ['Draft my two-monthly GST return.', 'How much provisional tax should I set aside?'],
  },
  {
    slug: 'pulse',
    name: 'Pulse',
    teReo: 'Manawa',
    description:
      'The Holidays Act 2003 sense-checker. Calculates leave the way the Act actually requires and flags where your payroll system is likely off.',
    whatItDoes: [
      'Reviews holiday pay line-by-line against the Holidays Act 2003, citing the section.',
      'Audits KiwiSaver employer contributions and reconciles PAYE against IRD.',
      'Prepares the April-1 rate-update memo and pay-equity readiness.',
    ],
    whatYouGet: [
      "A per-employee 'likely correct / under / over' sense-check pack.",
      'A KiwiSaver audit with dollar exposure by employee.',
      'A one-page April-1 memo covering every rate change that hits your payroll.',
    ],
    sampleOutputs: [
      'Likely underpaid: 3 staff on alternative holidays (s56) — total exposure ~$2,400.',
      'KiwiSaver gap: employer 3% missed on a bonus for 2 employees.',
    ],
    nzKnowledge: [
      'Holidays Act 2003 + MBIE guidance',
      'KiwiSaver Act 2006',
      'Employment Relations Act 2000',
      'IRD PAYE/KiwiSaver tables',
      'Employment Court decisions',
    ],
    category: 'business',
    modelTier: 'premium',
    priceTier: 'pro',
    icon: 'HeartPulse',
    accent: '#FFD42A',
    greeting:
      "Upload your payroll export and I'll sense-check holiday pay and KiwiSaver against the Holidays Act 2003. It's fixable — I'll show the path.",
    starters: [
      'Sense-check our holiday pay.',
      'Audit our KiwiSaver contributions.',
      'Prep the April 1 rate memo.',
    ],
  },
  {
    slug: 'compass',
    name: 'Compass',
    teReo: 'Kāwhena',
    description:
      'Maps an employee or applicant to a viable NZ visa pathway and the documents needed. Checks the live INZ source, never memory.',
    whatItDoes: [
      'Maps AEWV accreditation, job check and work-visa steps.',
      'Covers post-study, partnership, residence-from-work and skilled-migrant pathways.',
      'Pulls live median wage, Green List and Skills Shortage settings before advising.',
    ],
    whatYouGet: [
      'A ranked pathway map with eligible options.',
      'A document checklist per option and an accreditation gap report.',
      "A risk register and a 'refer to a licensed adviser' line on every output.",
    ],
    sampleOutputs: [
      'Likely eligible: AEWV via Green List Tier 1 — accreditation gap: no advertising evidence.',
      'INZ Operational Manual WK3.10 — confirm against the current amendment.',
    ],
    nzKnowledge: [
      'INZ Operational Manual (live)',
      'Immigration Act 2009',
      'AEWV settings + median wage gazette',
      'INZ Green List / Skills Shortage List',
      'NZQA recognition',
    ],
    category: 'business',
    modelTier: 'premium',
    priceTier: 'pro',
    icon: 'Compass',
    accent: '#FFE27A',
    greeting:
      "Tell me the role, salary, the applicant's nationality and current visa — I'll map the pathways. Drafts for a licensed adviser to confirm.",
    starters: ['Map an AEWV pathway for a chef on $30/hr.', 'What does employer accreditation need?'],
  },
  {
    slug: 'helm',
    name: 'Helm',
    teReo: 'Helm',
    description:
      'A voice receptionist any SME can stand up in 30 minutes. Answers calls, captures leads, books appointments, and transfers when it matters.',
    whatItDoes: [
      'Answers with your greeting and a Privacy Act collection notice, then captures name, number, intent and urgency.',
      'Books appointments, test drives or tables to your linked calendar.',
      "Transfers to the on-call human on your 'always escalate' rules.",
    ],
    whatYouGet: [
      'Answered calls with full transcripts and intent classification.',
      'Captured leads and drafted bookings in your CRM.',
      'An end-of-day digest: missed / booked / leads / needs-human.',
    ],
    sampleOutputs: [
      'Booked: Friday 2pm test drive, called back the lead, texted a confirmation.',
      'Needs human: caller asked for a $5,000 refund — outside scope, transferred.',
    ],
    nzKnowledge: [
      'Twilio NZ regulatory bundle (TCF verified caller ID)',
      'Privacy Act 2020 IPP 3 collection notice',
      'Telco numbering plan',
      'Fair Trading Act 1986',
    ],
    category: 'business',
    modelTier: 'mid',
    priceTier: 'business',
    icon: 'Headset',
    accent: '#C79B1F',
    greeting:
      "I'm Helm — your voice line. Give me your hours, top five FAQs and the number to transfer to, and I'll start answering calls.",
    starters: ['Set up after-hours reception for a trades business.', 'What do you say when you answer?'],
  },

  // ── Trades & Construction ────────────────────────────────────────────
  {
    slug: 'site-safety',
    name: 'Site Safety',
    teReo: 'Ārai',
    description:
      'H&S plans, SWMS, toolbox talks and the notifiable-event procedure — drafted for the PCBU under the Health and Safety at Work Act 2015.',
    whatItDoes: [
      'Drafts a Site-Specific Safety Plan and a SWMS per high-risk task.',
      'Builds a hazard register with the hierarchy of controls applied in order.',
      'Drafts the notifiable-event flowchart and WorkSafe notification.',
    ],
    whatYouGet: [
      'An SSSP, SWMS pack and weekly toolbox talk slides.',
      'A severity-rated hazard register.',
      'A notifiable-event draft matched to the WorkSafe form fields.',
    ],
    sampleOutputs: [
      'Working at height — controls: edge protection (isolation) before harness (PPE), HSWA s36.',
      'Notifiable event under HSWA s56: report to WorkSafe — call 0800 030 040 now.',
    ],
    nzKnowledge: [
      'Health and Safety at Work Act 2015 + General Risk Regs 2016',
      'WorkSafe Approved Codes of Practice',
      'LBP register lookups',
      'ACC ClaimsManager guidance',
    ],
    category: 'trades',
    modelTier: 'mid',
    priceTier: 'pro',
    icon: 'HardHat',
    accent: '#FFD42A',
    greeting:
      "Tell me the site, the scope and who's on it — I'll draft the safety plan and the SWMS. You're the PCBU; these are drafts you own.",
    starters: [
      'Draft an SSSP for a residential reroof.',
      'Toolbox talk on working at height.',
      "What's a notifiable event?",
    ],
  },
  {
    slug: 'project-manager',
    name: 'Project Manager',
    teReo: 'Kaupapa',
    description:
      'Payment claims, schedules, variations and EOTs under the Construction Contracts Act 2002 and NZS 3910:2023.',
    whatItDoes: [
      'Drafts a CCA-compliant payment claim and validates it against s20(2).',
      'Tracks variations, retentions (CCA Part 2A) and the critical path.',
      'Drafts Extension of Time claims and an adjudication-readiness pack.',
    ],
    whatYouGet: [
      'A standardised, fully-referenced payment claim.',
      'A payment schedule and variation register.',
      'An EOT pack: cause, contractual entitlement, time claimed, mitigation.',
    ],
    sampleOutputs: [
      'Payment claim #7 validated under CCA s20(2) — all six requirements met.',
      'Payment schedule overdue: 20 working days passed, claimed amount now due (s21).',
    ],
    nzKnowledge: [
      'Construction Contracts Act 2002',
      'NZS 3910:2023 / 3915 / 3916',
      'MBIE construction sector reports',
    ],
    category: 'trades',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'ClipboardList',
    accent: '#C79B1F',
    greeting:
      "Tell me the contract type, value and this month's work — I'll draft the payment claim and keep the variation register straight.",
    starters: [
      "Draft this month's payment claim.",
      'Log a variation for extra excavation.',
      'Prep an EOT for the weather delay.',
    ],
  },
  {
    slug: 'quality-defects',
    name: 'Quality + Defects',
    teReo: 'Pai',
    description:
      'ITPs, hold points, NCRs, the practical-completion punch list and producer-statement packs — drafted and tracked to the Building Code.',
    whatItDoes: [
      'Builds an Inspection and Test Plan per trade with hold points.',
      'Runs the NCR register and the PC punch list room-by-room.',
      'Assembles the producer-statement pack (PS1/PS3/PS4) and CCC prerequisites.',
    ],
    whatYouGet: [
      'An ITP per trade and a live NCR register.',
      'A photo-backed practical-completion punch list.',
      'A producer-statement pack checked for completeness.',
    ],
    sampleOutputs: [
      'NCR #12: cladding clearance below E2/AS1 — corrective action logged, awaiting sign-off.',
      'CCC prerequisites: 3 of 14 outstanding, PS3 still to assemble.',
    ],
    nzKnowledge: [
      'NZ Building Code (B1–H1)',
      'BRANZ Bulletins',
      'MBIE Determinations database',
      'Council acceptable-solutions guidance',
    ],
    category: 'trades',
    modelTier: 'mid',
    priceTier: 'business',
    icon: 'BadgeCheck',
    accent: '#FFE27A',
    greeting:
      "Give me the trade list and milestones — I'll draft the ITPs, track defects, and build the producer-statement pack.",
    starters: [
      'Build an ITP for the concrete pour.',
      'Start an NCR for a waterproofing defect.',
      "What's needed before CCC?",
    ],
  },
  {
    slug: 'building-consent',
    name: 'Building Consent',
    teReo: 'Whakaaē',
    description:
      "Building and resource consent applications, amendments and RFI responses — pre-filled to each council's quirks under the Building Act 2004.",
    whatItDoes: [
      'Pre-fills the consent application pack per BCA (Auckland vs Christchurch vs Wellington).',
      'Drafts amendments, RFI responses and the CCC prerequisites checklist.',
      'Checks Schedule 1 exemptions and heritage overlays before advising.',
    ],
    whatYouGet: [
      'An application pack cover sheet with drawings, specs and PS lists.',
      'Numbered RFI responses, each tied to a Code clause and drawing.',
      'A council inspection booking message and CCC checklist.',
    ],
    sampleOutputs: [
      'RFI 3 response: H1 compliance shown on drawing A-204, calc sheet 6.',
      'Auckland Council: this needs a PIM — not exempt under Schedule 1 item 2.',
    ],
    nzKnowledge: [
      'Building Act 2004 + NZ Building Code',
      'Resource Management Act 1991',
      'Council e-services APIs (AC, CCC, WCC, TCC, HCC, QLDC)',
      'MBIE Determinations',
      'LINZ property records',
    ],
    category: 'trades',
    modelTier: 'premium',
    priceTier: 'pro',
    icon: 'Building2',
    accent: '#FFD42A',
    greeting:
      "Give me the site, the scope and your drawings — I'll pre-fill the consent application for your council and chase the CCC.",
    starters: [
      'Pre-fill a building consent for a deck.',
      'Draft an RFI response for the council.',
      'Is this work exempt under Schedule 1?',
    ],
  },

  // ── Marketing & Creative ─────────────────────────────────────────────
  {
    slug: 'auaha',
    name: 'Auaha',
    teReo: 'Auaha',
    description:
      'The full creative shop in one chat: brief → copy → image → video → podcast → schedule. Every render previews inline.',
    whatItDoes: [
      'Turns a conversation into a creative brief, then writes copy in your brand voice.',
      'Generates images and video across the vendor stack, gated by Brand Voice and Ad Compliance.',
      'Schedules to Buffer / Meta / Google as drafts — publishes only with your sign-off.',
    ],
    whatYouGet: [
      'A brief, copy variants, image options and video cuts — previewed in chat.',
      'Ad sets and scheduled posts with projected reach.',
      'A post-performance digest with the next iteration.',
    ],
    sampleOutputs: [
      'Three hero images on your cream-and-canary palette — pick one to animate.',
      'Campaign pack: 5 posts scheduled as drafts, Ad Compliance passed.',
    ],
    nzKnowledge: [
      'ASA Codes (live)',
      'Fair Trading Act 1986',
      'Copyright Act 1994',
      'NZ On Air voice guidance',
      'Te Mātāwai te reo references',
    ],
    category: 'creative',
    modelTier: 'mid',
    priceTier: 'pro',
    icon: 'Palette',
    accent: '#FFE27A',
    greeting:
      "I'm Auaha — your creative studio. Tell me the brand, the audience and the channel, and we'll go brief → copy → image → video → schedule.",
    starters: [
      'Brief and design a launch campaign.',
      'Write three ad headlines in our voice.',
      'Make a social video for the weekend special.',
    ],
  },
  {
    slug: 'brand-voice',
    name: 'Brand Voice',
    teReo: 'Muse',
    description:
      'Learns your best copy, then enforces your tone on every new piece — flagging AI-slop sentences and fixing them in place.',
    whatItDoes: [
      'Builds a voice profile from 10+ examples of your best copy.',
      "Passes any new piece through the profile and redlines it with a 'why' per change.",
      'Flags slop, NZ-spelling slips and missing macrons every time.',
    ],
    whatYouGet: [
      'Original / redline / why, paragraph by paragraph.',
      'A voice-profile snapshot of what it learned.',
      'A word-frequency anomaly list when a piece drifts off-voice.',
    ],
    sampleOutputs: [
      "Cut 'leverage our seamless platform' → 'use the tool'. Slop blacklist, line 1.",
      'Voice profile: short sentences, no rule-of-three, macrons on every kupu.',
    ],
    nzKnowledge: [
      'elite-copywriter ruleset (anti-AI patterns)',
      'NZ English spelling',
      'Te reo correctness gate',
      'Te Aka Māori Dictionary',
    ],
    category: 'creative',
    modelTier: 'mid',
    priceTier: 'pro',
    icon: 'Megaphone',
    accent: '#C79B1F',
    greeting:
      "Paste 10 examples of your best copy and I'll learn your voice — then send me anything new and I'll keep it on-tone and slop-free.",
    starters: [
      'Learn our voice from these examples.',
      "Rewrite this 'About' page in our tone.",
      'Audit this page for slop.',
    ],
  },
  {
    slug: 'ad-compliance',
    name: 'Ad Compliance',
    teReo: 'Pae',
    description:
      'Reads any ad before it ships — flags substantiation gaps, misleading claims and code breaches, then drafts a defensible substantiation pack.',
    whatItDoes: [
      'Gives a pass / flag / fail call against the ASA Codes and Fair Trading Act 1986.',
      'Checks comparative claims, kids-marketing, alcohol, therapeutic and financial rules.',
      'Checks the current ASA decisions database before passing.',
    ],
    whatYouGet: [
      'A pass/flag/fail summary with a rule-by-rule breakdown.',
      'A substantiation pack: every claim matched to its evidence.',
      'Suggested edits to convert a flag into a pass.',
    ],
    sampleOutputs: [
      "FLAG: '#1 in NZ' needs like-for-like, current substantiation (FTA s9).",
      'Alcohol post: drinking depicted too rapidly — Alcohol Promotion Code breach.',
    ],
    nzKnowledge: [
      'ASA Codes (Advertising, Children, Therapeutic, Financial, Alcohol, Vehicle, Gambling)',
      'Fair Trading Act 1986',
      'Commerce Commission guidance',
      'Medicines Act 1981',
      'Vaping Reform Act 2020',
    ],
    category: 'creative',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'ScanEye',
    accent: '#FFD42A',
    greeting:
      "Send the ad — image, copy, video or landing page — plus the offer and your evidence. I'll tell you if it ships, and how to fix it if not.",
    starters: [
      'Check this ad before we run it.',
      'Is this comparison claim safe?',
      'Build a substantiation pack for our specials.',
    ],
  },

  // ── Healthcare ───────────────────────────────────────────────────────
  {
    slug: 'scribe',
    name: 'Scribe',
    teReo: 'Tā Kōrero',
    description:
      'Clinical-note capture for GPs and allied health. Consult in, SOAP note out, ICD-10-AM coded — supports the clinician, never diagnoses.',
    whatItDoes: [
      'Captures the consult (live or transcript) into SOAP, DAP, SBAR or a discharge summary.',
      'Suggests ICD-10-AM v12 codes for the coder to confirm.',
      'Runs a drug-interaction sanity check and refers to the pharmacist.',
    ],
    whatYouGet: [
      'A structured note with the assessment and plan.',
      'Suggested codes with reasoning in a separate section.',
      'A plain-language patient summary the clinician can send.',
    ],
    sampleOutputs: [
      'SOAP drafted; differential ranked; ICD-10-AM J06.9 suggested — clinician to confirm.',
      'Patient summary: what we talked about, what we agreed, when to come back.',
    ],
    nzKnowledge: [
      'Health Information Privacy Code 2020',
      'HPCAA 2003',
      'Medical Council of NZ standards',
      'NZ ePrescription Service readiness',
      'ICD-10-AM v12',
      'Whakarongorau triage triggers',
    ],
    category: 'healthcare',
    modelTier: 'premium',
    priceTier: 'pro',
    icon: 'Stethoscope',
    accent: '#C79B1F',
    greeting:
      "With per-visit consent captured, paste or record the consult — I'll draft the SOAP note and suggest codes. Clinical sign-off stays with you.",
    starters: [
      'Draft a SOAP note from this consult.',
      'Write a referral letter to cardiology.',
      'Suggest ICD-10-AM codes.',
    ],
  },
  {
    slug: 'practice-manager',
    name: 'Practice Manager',
    teReo: 'Remedy',
    description:
      'The non-clinical heart of a practice: APC renewals, patient recalls, HDC complaint prep and audit readiness.',
    whatItDoes: [
      "Tracks every clinician's Annual Practising Certificate to the day.",
      'Runs the recall system and drafts the recall letters, SMS and email.',
      'Drafts HDC complaint responses per the relevant Right and preps CORNERSTONE audits.',
    ],
    whatYouGet: [
      'An APC tracker by clinician and registration body.',
      'A recall list with drafted messages.',
      'An HDC complaint response with a per-Right rebuttal and evidence pack.',
    ],
    sampleOutputs: [
      "APC alert: Dr Patel's certificate expires in 21 days — renewal not yet lodged.",
      'Recall: 38 patients due for cervical screening, draft SMS ready.',
    ],
    nzKnowledge: [
      'HPCAA 2003',
      'HDC Code of Rights',
      'Medical / Dental / Nursing Council registers',
      'RNZCGP CORNERSTONE audit framework',
      'Pharmac formulary',
    ],
    category: 'healthcare',
    modelTier: 'mid',
    priceTier: 'business',
    icon: 'ClipboardPlus',
    accent: '#FFE27A',
    greeting:
      "Tell me your clinicians and recall criteria — I'll track APCs, draft the recalls, and keep you audit-ready.",
    starters: [
      'Track our APC renewal dates.',
      'Draft a recall for overdue immunisations.',
      'Prep an HDC complaint response.',
    ],
  },
  {
    slug: 'workplace-wellbeing',
    name: 'Workplace Wellbeing',
    teReo: 'Vitals',
    description:
      'Employer-side wellbeing: HSWA on the people side, ACC claim navigation, return-to-work plans and anonymous pulse surveys.',
    whatItDoes: [
      'Runs an anonymised wellbeing pulse (minimum cell size 5) and surfaces themes.',
      'Navigates the employer side of ACC claims and drafts return-to-work plans.',
      'Flags fatigue and bullying patterns and drafts EAP referral letters.',
    ],
    whatYouGet: [
      'A monthly wellbeing pack: summary, themes, actions, top three risks.',
      'An ACC claim pack with key dates and employer responsibilities.',
      'A graduated return-to-work plan with review dates.',
    ],
    sampleOutputs: [
      'This month: workload the top theme across 3 teams (cell size respected).',
      'RTW plan: 4-week graduated return, lifting limit, review at week 2.',
    ],
    nzKnowledge: [
      'Health and Safety at Work Act 2015 (people side)',
      'ACC Act 2001',
      'MentalHealth.org.nz resources',
      'MBIE bullying and harassment guidance',
    ],
    category: 'healthcare',
    modelTier: 'mid',
    priceTier: 'business',
    icon: 'Activity',
    accent: '#FFD42A',
    greeting:
      "Tell me your headcount and sector — I'll set up an anonymous pulse, navigate ACC, and draft return-to-work plans. The agent enables; you act.",
    starters: [
      'Run a wellbeing pulse survey.',
      'Help me navigate an ACC claim.',
      'Draft a return-to-work plan.',
    ],
  },

  // ── Maritime ─────────────────────────────────────────────────────────
  {
    slug: 'mariner',
    name: 'Mariner',
    teReo: 'Mariner',
    description:
      'The vessel-side companion for NZ skippers: pre-departure briefs, MOSS readiness, MNZ drafts and Coastguard trip reports.',
    whatItDoes: [
      'Builds a pre-departure brief from live weather, tides, fuel and a crew check.',
      'Drafts the Coastguard trip report — ready, never auto-sent.',
      'Preps MOSS inspections and drafts MNZ correspondence and incident reports.',
    ],
    whatYouGet: [
      'A pre-departure brief: weather window, tides, sunrise/sunset, fuel calc, contingency.',
      'A drafted Coastguard trip report you send when ready.',
      'A MOSS inspection prep pack, section by section.',
    ],
    sampleOutputs: [
      'Pre-departure: 1.2m swell easing, high tide 13:40, fuel +20% reserve — good window.',
      'Trip report drafted: vessel, POB 4, intended track, ETA 17:00 — reply SEND to file.',
    ],
    nzKnowledge: [
      'Maritime Transport Act 1994 + Maritime Rules',
      'MNZ MOSS framework',
      'LINZ tides API',
      'MetService Marine / NIWA wave forecast',
      'Coastguard NZ trip-report endpoint',
      'AIS live feed',
    ],
    category: 'maritime',
    modelTier: 'mid',
    priceTier: 'pro',
    icon: 'Anchor',
    accent: '#C79B1F',
    greeting:
      "Give me your vessel, skipper details and the trip — I'll build the pre-departure brief and draft the Coastguard trip report. You stay the skipper.",
    starters: [
      'Build a pre-departure brief for a Hauraki Gulf run.',
      'Draft a Coastguard trip report.',
      'Prep my MOSS inspection.',
    ],
  },
  {
    slug: 'skipper',
    name: 'Skipper',
    teReo: 'Kaihautū',
    description:
      'The charter-operator companion: customer safety briefs, manifests, insurance evidence and Adventure Activities compliance.',
    whatItDoes: [
      'Builds the customer pre-trip pack: safety, what to bring, weather contingency, refunds.',
      'Produces a Coastguard-shareable manifest and an insurance evidence pack.',
      'Keeps the Adventure Activities Regulations 2016 compliance pack and post-trip log.',
    ],
    whatYouGet: [
      'A one-page customer-facing pre-trip PDF.',
      'A trip manifest and an insurance evidence schedule.',
      'A post-trip log with consented photos.',
    ],
    sampleOutputs: [
      'Pre-trip pack: bring layers and closed shoes, trip runs if swell stays under 1.5m.',
      'Manifest: skipper, POB 9, emergency contacts, ETD 09:00, ETA 14:00.',
    ],
    nzKnowledge: [
      'Adventure Activities Regulations 2016',
      'HSW (Adventure Activities) Regulations 2016',
      'MNZ MOSS Operator Safety Audits',
      'DOC permits / marine reserves',
      'AIS feed',
      'MetService Marine',
    ],
    category: 'maritime',
    modelTier: 'mid',
    priceTier: 'business',
    icon: 'Sailboat',
    accent: '#FFE27A',
    greeting:
      "Tell me the vessel, the charter type and the manifest — I'll build the safety brief, the manifest and the insurance pack. Safety first, adventure second.",
    starters: [
      'Build a customer safety brief for a fishing charter.',
      "Make a manifest for tomorrow's trip.",
      'What does Adventure Activities certification need?',
    ],
  },

  // ── Education ────────────────────────────────────────────────────────
  {
    slug: 'scholar',
    name: 'Scholar',
    teReo: 'Scholar',
    description:
      'The NZQA compliance companion for training providers: EER evidence, programme approval and micro-credential application packs.',
    whatItDoes: [
      'Builds the External Evaluation and Review evidence pack around the 6 key questions.',
      'Drafts programme-approval and micro-credential submissions.',
      'Summarises learner consultation and tracks Category 1–4 evidence.',
    ],
    whatYouGet: [
      'An EER pack with evidence and a self-rating per question.',
      'A programme-approval submission: outcomes, structure, assessment, support.',
      'A micro-credential pack linked to a real skill need.',
    ],
    sampleOutputs: [
      'EER self-rating: Confident in educational performance, Adequate in capability — evidence attached.',
      "Micro-credential: 'Scaffolding Safety', Level 3, 10 credits, mapped to the WDC priority.",
    ],
    nzKnowledge: [
      'NZQA rules + EER methodology',
      'Education and Training Act 2020',
      'Pastoral Care Codes 2021',
      'Workforce Development Council priorities',
    ],
    category: 'education',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'School',
    accent: '#FFD42A',
    greeting:
      "Tell me your provider type, NZQA category and programmes — I'll build the EER evidence and the approval submissions.",
    starters: [
      'Build our EER evidence pack.',
      'Draft a micro-credential application.',
      'Prep a programme approval submission.',
    ],
  },
  {
    slug: 'te-reo-tutor',
    name: 'Te Reo Tutor',
    teReo: 'Te Reo',
    description:
      'A daily-practice te reo Māori companion for families, beginners and professionals returning. Never substitutes for a kaiako.',
    whatItDoes: [
      'Runs daily phrase practice with pronunciation feedback (voice in / voice out).',
      'Teaches household- and workplace-scoped vocabulary and greeting drills.',
      'Gives a mihimihi skeleton — you fill the personal pepeha content.',
    ],
    whatYouGet: [
      'A daily phrase: kupu, English, pronunciation guide, example.',
      'A 5-prompt drill with immediate correction.',
      'A weekly progress note and Te Aka lookups.',
    ],
    sampleOutputs: [
      "Kupu o te rā: 'tūru' — chair. 'Homai te tūru, koa.' (Pass the chair, please.)",
      'Marked: review by a competent reo speaker required before use.',
    ],
    nzKnowledge: [
      'Te Aka Māori Dictionary',
      'Te Taura Whiri guidance',
      'Te Hiku Media papa reo (with permission)',
    ],
    category: 'education',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'Languages',
    accent: '#FFE27A',
    greeting:
      "I'll help you practise te reo Māori every day — phrases, pronunciation, household kupu. For karakia, waiata or your pepeha, see a kaiako.",
    starters: [
      'Teach me a phrase a day for the kitchen.',
      'Help me with my pronunciation.',
      'Give me a mihimihi structure.',
    ],
  },

  // ── Compliance ───────────────────────────────────────────────────────
  {
    slug: 'shield',
    name: 'Shield',
    teReo: 'Shield',
    description:
      'The Privacy Act 2020 and IPP 3A companion. Runs the assessment, drafts the disclosures, and reads the breach.',
    whatItDoes: [
      'Runs an IPP-by-IPP audit (all 13 plus IPP 3A).',
      'Drafts the IPP 3A automated-decision disclosure per system.',
      'Drafts breach-notification packs for the OPC and affected individuals.',
    ],
    whatYouGet: [
      'A per-IPP audit: pass / gap / breach, with evidence and actions.',
      'An IPP 3A notice drafted for each user-facing system.',
      'A Privacy Impact Assessment and a breach pack.',
    ],
    sampleOutputs: [
      'IPP 12 gap: customer data flows to a US processor with no s22 safeguard.',
      'Breach pack: serious-harm threshold met — notify the OPC as soon as practicable (s114).',
    ],
    nzKnowledge: [
      'Privacy Act 2020 + IPP 3A (live 1 May 2026)',
      'Health Information Privacy Code 2020',
      'Credit Reporting Privacy Code',
      'Office of the Privacy Commissioner guidance',
      'GCSB cross-border guidance',
    ],
    category: 'compliance',
    modelTier: 'premium',
    priceTier: 'pro',
    icon: 'Shield',
    accent: '#FFD42A',
    greeting:
      "Describe your systems and data flows — I'll run the IPP audit, draft your IPP 3A notices, and prep a breach pack if you need one.",
    starters: [
      'Run a Privacy Act audit on our systems.',
      'Draft an IPP 3A notice for our app.',
      "We've had a breach — what now?",
    ],
  },
  {
    slug: 'tikanga-guard',
    name: 'Tikanga Guard',
    teReo: 'Tikanga',
    description:
      "A cultural-compliance review on copy, branding or product names against Professor Mead's five tests. Never substitutes for mana whenua.",
    whatItDoes: [
      'Runs a five-test pass / refer report (Tika, Pono, Aroha, Tikanga, Mana) on any content.',
      'Reviews te reo correctness, cultural-symbol use and place-names.',
      'Audits Māori data sovereignty under Te Mana Raraunga.',
    ],
    whatYouGet: [
      'A five-test pass / refer / fail report with reasons.',
      'Suggested edits and a glossary of correct te reo.',
      "A list of items to refer to mana whenua — with an explicit 'we cannot make this call'.",
    ],
    sampleOutputs: [
      'REFER: koru used as a brand mark — who holds the authority to approve this? Not us.',
      "Glossary: 'whānau' not 'whanau' — macron required; 'kai' correct.",
    ],
    nzKnowledge: [
      'Te Aka Māori Dictionary',
      'Te Taura Whiri / Te Mātāwai guidance',
      'Te Mana Raraunga (Māori Data Sovereignty)',
      'Treaty of Waitangi Act 1975 + Waitangi Tribunal reports',
    ],
    category: 'compliance',
    modelTier: 'mid',
    priceTier: 'pro',
    icon: 'Feather',
    accent: '#FFE27A',
    greeting:
      "Send the content and where it'll be used — I'll run Mead's five tests and flag anything that needs to go to mana whenua. Quiet and careful, not preachy.",
    starters: [
      'Review this campaign for cultural safety.',
      'Is this use of a koru okay?',
      'Check our te reo is correct.',
    ],
  },
  {
    slug: 'risk-audit',
    name: 'Risk + Audit',
    teReo: 'Audit',
    description:
      'A quarterly internal audit pack for boards, auditors and regulators. Picks samples, drafts findings, builds the evidence binder.',
    whatItDoes: [
      'Builds an audit plan per scope area with materiality thresholds.',
      'Selects samples (statistical or risk-based) and drafts findings.',
      'Assembles a cross-referenced evidence binder and a quarterly trend report.',
    ],
    whatYouGet: [
      'An audit plan: scope, period, methodology, sample, materiality.',
      'Findings in a condition / criteria / cause / effect / recommendation format.',
      'A cover sheet with ratings a board or regulator can read.',
    ],
    sampleOutputs: [
      'Finding: 3 of 20 invoices lacked approval — control gap, recommend dual sign-off.',
      "Rating: payroll 'needs improvement', customer data 'acceptable'.",
    ],
    nzKnowledge: [
      'XRB / NZICA audit standards',
      'ISO 27001 (where claimed)',
      'NZISM controls',
      'ISACA frameworks',
    ],
    category: 'compliance',
    modelTier: 'premium',
    priceTier: 'business',
    icon: 'ClipboardCheck',
    accent: '#FFD42A',
    greeting:
      "Tell me the areas to cover and the period — I'll plan the audit, pick the samples, and build the evidence binder for your board or auditor.",
    starters: [
      'Plan a quarterly internal audit.',
      'Sample our payroll controls.',
      'Draft findings for the board.',
    ],
  },

  // ── Legal ────────────────────────────────────────────────────────────
  {
    slug: 'arbiter',
    name: 'Arbiter',
    teReo: 'Arbiter',
    description:
      'A navigator for the Disputes Tribunal, Tenancy Tribunal, employment problems and mediation. Not a lawyer — a guide who gets you ready.',
    whatItDoes: [
      'Builds a dated timeline and an evidence binder from your facts.',
      'Pre-fills tribunal applications (Disputes, Tenancy, ERA mediation).',
      'Drafts a mediation script and three negotiating positions.',
    ],
    whatYouGet: [
      'A timeline of facts and an evidence list with provenance.',
      'A tribunal application pre-fill and a 300-word opening statement.',
      'Aspiration / realistic / walk-away negotiating positions.',
    ],
    sampleOutputs: [
      'Disputes Tribunal application drafted — claim $4,200, under the $30,000 cap.',
      'Opening statement (300 words) plus an A/B/C settlement ladder.',
    ],
    nzKnowledge: [
      'Disputes Tribunal Act 1988',
      'Residential Tenancies Act 1986',
      'Employment Relations Act 2000 (personal grievance)',
      'Fencing Act 1978',
      'MoJ tribunal forms',
    ],
    category: 'legal',
    modelTier: 'premium',
    priceTier: 'pro',
    icon: 'Gavel',
    accent: '#C79B1F',
    greeting:
      "Paste the timeline and the key documents — I'll get you ready for the tribunal or mediation. For advice, I'll point you to a lawyer or community law.",
    starters: [
      'Prep a Disputes Tribunal claim.',
      'Help with a Tenancy Tribunal application.',
      'Draft a mediation opening statement.',
    ],
  },
  {
    slug: 'contract-reader',
    name: 'Contract Reader',
    teReo: 'Pou',
    description:
      'Reads any NDA, MSA or SLA, triages it green/yellow/red against your playbook, and drafts the redlines. Not legal advice.',
    whatItDoes: [
      'Triages a contract GREEN (sign), YELLOW (counsel), RED (full legal review).',
      'Redlines clause by clause against your playbook.',
      'Flags NZ-specific risks: pay-when-paid, uncapped indemnities, personal guarantees.',
    ],
    whatYouGet: [
      'A cover sheet: GREEN / YELLOW / RED plus the top five issues.',
      'A clause-by-clause redline: original / proposed / why.',
      'A deviation report and A/B/C fallback positions.',
    ],
    sampleOutputs: [
      'RED: personal guarantee in clause 14 — always escalate to the director.',
      'Pay-when-paid clause is usually void under the Construction Contracts Act 2002 — flagged.',
    ],
    nzKnowledge: [
      'Contract and Commercial Law Act 2017',
      'Consumer Guarantees Act 1993',
      'Fair Trading Act 1986',
      'Construction Contracts Act 2002',
      'Privacy Act 2020 / IPP 3A clauses',
      'Companies Office filings',
    ],
    category: 'legal',
    modelTier: 'premium',
    priceTier: 'pro',
    icon: 'FileSearch',
    accent: '#FFD42A',
    greeting:
      "Paste the contract and your playbook (or use the default NZ SaaS one) — I'll triage it and draft your redlines. For a legal opinion, see your lawyer.",
    starters: ['Triage this NDA.', 'Redline an MSA against our playbook.', 'Flag the risky clauses in this agreement.'],
  },

  // ── Financial ────────────────────────────────────────────────────────
  {
    slug: 'charter',
    name: 'Charter',
    teReo: 'Charter',
    description:
      'The Companies Act 1993 companion: director duties, AGM packs, board minutes and conflict-of-interest registers.',
    whatItDoes: [
      'Builds the AGM pack: notice, agenda, financial summary, minutes template.',
      'Drafts board minutes from your notes and maintains the conflict register.',
      'Refreshes director duties (s131–s138) and pre-fills the annual return.',
    ],
    whatYouGet: [
      'An AGM pack with the correct notice timeframe.',
      'Board minutes: attendees, decisions, action register.',
      'A conflict-of-interest register: interest, declared, recused.',
    ],
    sampleOutputs: [
      's131 reminder: act in good faith and in the best interests of the company.',
      'Solvency concern flagged under s135/s136 — refer to an insolvency lawyer.',
    ],
    nzKnowledge: [
      'Companies Act 1993',
      'Financial Reporting Act 2013',
      'Companies Office register',
      'IRD director-duties guidance',
      'Institute of Directors NZ',
    ],
    category: 'financial',
    modelTier: 'mid',
    priceTier: 'pro',
    icon: 'ScrollText',
    accent: '#C79B1F',
    greeting:
      "Tell me the company, the directors and your last AGM date — I'll build the AGM pack, draft the minutes, and keep the conflict register straight.",
    starters: [
      'Build our AGM pack.',
      'Draft board minutes from these notes.',
      'Remind me of my director duties.',
    ],
  },
  {
    slug: 'vault',
    name: 'Vault',
    teReo: 'Vault',
    description:
      'Reads your business insurance schedule, compares it to your actual risk, and flags under-insurance and the exclusions that matter.',
    whatItDoes: [
      'Reviews each policy: type, insurer, sum insured, premium, key exclusions.',
      'Does the sum-insured maths against your real revenue, staff, assets and sites.',
      'Drafts the renewal email and a claim-navigation pack.',
    ],
    whatYouGet: [
      'A policy-by-policy gap report with dollar exposure.',
      'An exclusion alert list, quoting the wording where it matters.',
      'A renewal email requesting three quotes.',
    ],
    sampleOutputs: [
      'Under-insured: business interruption covers 3 months, your recovery is ~6 — gap ~$80k.',
      'Exclusion alert: cyber policy excludes social-engineering fraud.',
    ],
    nzKnowledge: [
      'ICNZ industry standards',
      'IBANZ broker guidance',
      'EQC natural-hazards guidance',
      'NZ ComCom merger thresholds (D&O)',
      'FMA disclosure rules',
    ],
    category: 'financial',
    modelTier: 'premium',
    priceTier: 'pro',
    icon: 'Vault',
    accent: '#FFE27A',
    greeting:
      "Send your current policy schedule and your real revenue, staff and assets — I'll flag the gaps and the exclusions, and draft the renewal.",
    starters: [
      'Review our insurance schedule for gaps.',
      'Are we under-insured for business interruption?',
      'Draft a renewal email for three quotes.',
    ],
  },
  {
    slug: 'wealth-coach',
    name: 'Wealth Coach',
    teReo: 'Pūtea',
    description:
      'Personal finance for NZ: KiwiSaver fit, first-home steps, mortgage scenarios. Explains the options — never gives advice.',
    whatItDoes: [
      'Matches a KiwiSaver fund category to your risk and time horizon.',
      'Projects retirement income (with NZ Super) and models mortgage scenarios.',
      'Builds a first-home checklist: KiwiSaver withdrawal, First Home Grant, Kāinga Ora.',
    ],
    whatYouGet: [
      "A KiwiSaver fit read-out with a clear 'this is not advice' footer.",
      'A retirement projection in best / likely / cautious scenarios.',
      'A first-home checklist and mortgage scenario pack.',
    ],
    sampleOutputs: [
      'A growth fund category fits a 30-year horizon — discuss with a Financial Advice Provider.',
      'First home: KiwiSaver withdrawal eligible, First Home Grant likely — steps attached.',
    ],
    nzKnowledge: [
      'Sorted.org.nz fund tracker',
      'FMA KiwiSaver tracker',
      'MBIE first-home guidance',
      'Kāinga Ora HomeStart eligibility',
      'IRD KiwiSaver Member Tax Credit rules',
    ],
    category: 'financial',
    modelTier: 'mid',
    priceTier: 'toro',
    icon: 'TrendingUp',
    accent: '#FFD42A',
    greeting:
      "Tell me your age, income, KiwiSaver balance and your goal — I'll lay out the options. I'm not a Financial Advice Provider, so the call stays yours.",
    starters: [
      'Which KiwiSaver fund type fits me?',
      'Project my retirement income.',
      'Am I ready for a first home?',
    ],
  },
];

export const MARKETPLACE_AGENTS: MarketplaceAgent[] = AGENT_DEFS.map(buildAgent);

/**
 * Client-safe projection of an agent — everything EXCEPT the locked system
 * prompt. Pass this (never the raw agent) into Client Components so the prompt
 * stays server-side only.
 */
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
  free: 'Free',
  freemium: 'Free to try',
  paid: 'Paid',
};

export const PRICE_TIER_LABELS: Record<PriceTier, string> = {
  free: 'Free',
  toro: 'Tōro',
  whanau: 'Whānau',
  pro: 'Pro',
  business: 'Business',
};

/** Card/detail price chip, e.g. "Free", "Tōro · $9.99", "Business · $199". */
export function priceLabel(agent: Pick<MarketplaceAgent, 'priceTier' | 'priceNzd'>): string {
  if (agent.priceTier === 'free' || agent.priceNzd === 0) return 'Free';
  return `${PRICE_TIER_LABELS[agent.priceTier]} · $${agent.priceNzd}`;
}

/**
 * Maps a marketplace model tier to a concrete model id for the chat route.
 * Kept here so the registry stays the single source of truth. The chat route
 * resolves Anthropic model ids; tiers can be re-pointed without touching routes.
 */
export const MODEL_TIER_TO_ANTHROPIC: Record<ModelTier, string> = {
  cheap: 'claude-haiku-4-5-20251001',
  mid: 'claude-sonnet-4-6',
  premium: 'claude-opus-4-8',
};
