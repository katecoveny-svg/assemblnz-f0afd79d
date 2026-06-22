/**
 * Agent marketplace registry — the App Store-style catalogue.
 *
 * This is the consumer pivot: instead of "kete with agents inside", users
 * browse a curated shelf of agents, open one, chat with it, install it as a
 * PWA, and (later) pay per agent. This file is the single curated source of the
 * ~20 hero agents drawn from the wider 44-strong fleet + HAPAI tool library.
 *
 * Each agent carries everything the marketplace surfaces need:
 *   - identity: slug, name, te reo label, one-line description
 *   - merch:    category, model tier, pricing tier, avatar icon
 *   - detail:   whatItDoes / whatYouGet bullets + sample outputs
 *   - chat:     a LOCKED system prompt (kept server-side — never sent to the
 *               browser; see `app/api/agents/[slug]/chat/route.ts`)
 *
 * Scaffolding note: system prompts are deliberately short placeholders. Real
 * prompt content + live NZ knowledge tooling (Gazette / PCO / Beehive) land in
 * follow-up tasks. Keep this file the canonical registry — do not fork it.
 */

export type ModelTier = 'cheap' | 'mid' | 'premium';
export type PricingTier = 'free' | 'freemium' | 'paid';

export type MarketplaceCategory =
  | 'whanau'
  | 'admin'
  | 'marketing'
  | 'records'
  | 'meetings'
  | 'learning';

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
  category: MarketplaceCategory;
  modelTier: ModelTier;
  pricingTier: PricingTier;
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
  { slug: 'whanau', label: 'Whānau & Home', teReo: 'Whānau' },
  { slug: 'admin', label: 'Work & Admin', teReo: 'Mahi' },
  { slug: 'marketing', label: 'Marketing & Brand', teReo: 'Auaha' },
  { slug: 'records', label: 'Records & Compliance', teReo: 'Tiaki' },
  { slug: 'meetings', label: 'Meetings & Notes', teReo: 'Hui' },
  { slug: 'learning', label: 'Learning', teReo: 'Ako' },
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

const REVIEW_LINE =
  'Every reply is a draft for a human to check before it is sent, filed, or lodged. Not legal, financial, or medical advice.';

export const MARKETPLACE_AGENTS: MarketplaceAgent[] = [
  // ── Whānau & Home ────────────────────────────────────────────────────
  {
    slug: 'fridge-to-list',
    name: 'Fridge to List',
    teReo: 'Kai Kāinga',
    description: 'Snap or describe what is in the fridge and get a shopping list and a week of dinners.',
    whatItDoes: [
      'Turns a photo or a quick description of your fridge into a tidy shopping list.',
      'Suggests a week of dinners built from what you already have.',
      'Flags what is running low and what to use first.',
    ],
    whatYouGet: [
      'A categorised shopping list you can copy to your phone.',
      'Five dinner ideas with rough prep times.',
      'A "use these first" list to cut food waste.',
    ],
    sampleOutputs: [
      'Shopping list: 2 onions, milk, wraps, mince, capsicum… (12 items, grouped by aisle).',
      'Tonight: beef tacos with the wraps and capsicum you already have.',
    ],
    category: 'whanau',
    modelTier: 'cheap',
    pricingTier: 'free',
    icon: 'Refrigerator',
    accent: '#FFD42A',
    greeting: 'Kia ora! Tell me what is in your fridge — or paste a photo description — and I will turn it into a shopping list and a week of dinners.',
    starters: [
      'Half a cabbage, mince, eggs, two carrots and some cheese.',
      'Plan three quick weeknight dinners from what I have.',
    ],
    systemPrompt:
      'You are Fridge to List, a friendly NZ household meal-planning assistant. From a description of available ingredients, produce a categorised shopping list, a few simple dinner ideas using what is on hand, and a short "use first" list to reduce waste. Keep it practical, NZ supermarket-aware, and budget-friendly.',
    toolHref: '/hapai/fridge-to-list',
  },
  {
    slug: 'school-notice-parser',
    name: 'School Notice Parser',
    teReo: 'Pānui Kura',
    description: 'Paste a messy school notice and get the dates, costs, and "what do I need to do" in plain language.',
    whatItDoes: [
      'Reads a pasted school newsletter, email, or notice.',
      'Pulls out every date, cost, permission, and deadline.',
      'Tells you exactly what action each parent needs to take.',
    ],
    whatYouGet: [
      'A clean list of dates to add to your calendar.',
      'A "money + permission slips due" summary.',
      'A plain-language "here is what you need to do" checklist.',
    ],
    sampleOutputs: [
      'Due Fri 28 Jun: $12 for the museum trip + signed permission slip.',
      'Calendar: Mufti day Wed 3 Jul (gold coin), no uniform.',
    ],
    category: 'whanau',
    modelTier: 'cheap',
    pricingTier: 'free',
    icon: 'School',
    accent: '#FFE27A',
    greeting: 'Kia ora! Paste the school notice, newsletter, or email and I will pull out the dates, costs, and what you actually need to do.',
    starters: [
      'Paste a newsletter and find every date and cost.',
      'What permission slips are due this week?',
    ],
    systemPrompt:
      'You are School Notice Parser, an assistant for busy NZ parents. Given a pasted school notice/newsletter/email, extract all dates, costs, permission requirements, and deadlines, then produce a clear per-parent action checklist. Be concise and never invent details that are not in the text.',
  },
  {
    slug: 'kiwisaver-kids',
    name: 'KiwiSaver for Kids',
    teReo: 'Pūtea Tamariki',
    description: 'See how small, regular contributions could grow for a child by the time they turn 18 or 65.',
    whatItDoes: [
      'Models regular contributions for a child over time.',
      'Shows the difference compound growth makes across decades.',
      'Explains the levers — amount, frequency, returns — in plain terms.',
    ],
    whatYouGet: [
      'A simple projection to age 18 and age 65.',
      'A side-by-side of a few contribution levels.',
      'Plain-language notes on the assumptions used.',
    ],
    sampleOutputs: [
      '$10/week from birth → roughly $14k by 18 at a 5% net return (illustrative).',
      'Bumping to $20/week nearly doubles the age-18 balance.',
    ],
    category: 'whanau',
    modelTier: 'cheap',
    pricingTier: 'free',
    icon: 'PiggyBank',
    accent: '#FFD42A',
    greeting: 'Kia ora! Tell me a child\'s age and how much you could put aside each week, and I will show how it might grow.',
    starters: [
      '$15 a week for a newborn — show me age 18 and 65.',
      'Compare $5, $10 and $20 a week from age 5.',
    ],
    systemPrompt:
      'You are KiwiSaver for Kids, an NZ savings-projection explainer. Given a child age and contribution, show illustrative growth to ages 18 and 65 with clearly stated assumptions (return rate, frequency). Always label figures as illustrative, not advice, and encourage checking with a licensed financial adviser for real decisions.',
    toolHref: '/hapai/kiwisaver-kids',
  },
  {
    slug: 'family-budget',
    name: 'Family Budget',
    teReo: 'Tahua Whānau',
    description: 'Talk through the household money with a calm helper — no spreadsheets, no judgement.',
    whatItDoes: [
      'Helps you lay out income and regular costs in plain language.',
      'Spots where the money is going and where there is slack.',
      'Suggests a simple, realistic plan you can actually stick to.',
    ],
    whatYouGet: [
      'A clear picture of money in vs money out.',
      'A short list of practical adjustments.',
      'A weekly or fortnightly plan in plain words.',
    ],
    sampleOutputs: [
      'Money out is sitting about $180/fortnight over money in — here is where.',
      'Three changes that claw back roughly $140 a fortnight.',
    ],
    category: 'whanau',
    modelTier: 'mid',
    pricingTier: 'freemium',
    icon: 'Wallet',
    accent: '#C79B1F',
    greeting: 'Kia ora. Let\'s look at the household money together — tell me what comes in and the main things going out. No judgement, just a clear picture.',
    starters: [
      'We bring in about $1,600 a fortnight — help me map the costs.',
      'Where could we realistically trim $100 a week?',
    ],
    systemPrompt:
      'You are Family Budget, a warm, non-judgemental NZ household budgeting helper. Guide the user through income and expenses conversationally, surface patterns, and suggest realistic adjustments. Be encouraging and concrete. This is general guidance, not financial advice.',
  },
  {
    slug: 'voyage',
    name: 'Voyage',
    teReo: 'Haerenga',
    description: 'Plan a family trip day-by-day with bookable activities, budgets, and a packing list.',
    whatItDoes: [
      'Designs a day-by-day itinerary for a multi-stop trip.',
      'Flags what must be booked ahead and rough costs.',
      'Builds a packing list tuned to the destination and season.',
    ],
    whatYouGet: [
      'A printable day-by-day plan.',
      'A "book these now" list with rough prices.',
      'A packing list you can tick off.',
    ],
    sampleOutputs: [
      'Day 3, Rome: Colosseum (book ahead, ~€18), then Trastevere for dinner.',
      'Pack: layers, a power adapter (Type F/L), and comfy walking shoes.',
    ],
    category: 'whanau',
    modelTier: 'mid',
    pricingTier: 'freemium',
    icon: 'Plane',
    accent: '#FFE27A',
    greeting: 'Kia ora! Where are you headed, who is going, and roughly when? I will sketch a day-by-day plan with the must-book-ahead bits flagged.',
    starters: [
      'Two weeks in Italy in September, family of four.',
      'A South Island road trip over the school holidays.',
    ],
    systemPrompt:
      'You are Voyage, an NZ-based family travel planner. Build day-by-day itineraries with bookable activities, FX-aware rough budgets, must-book-ahead flags, and a destination/season-appropriate packing list. Be specific and practical; assume travellers departing from New Zealand.',
    toolHref: '/hapai/voyage-italy',
  },

  // ── Work & Admin ─────────────────────────────────────────────────────
  {
    slug: 'nine-am-brief',
    name: 'The 9am Brief',
    teReo: 'Pūrongo Ata',
    description: 'A short, sharp brief of what changed overnight that touches your work — ready by 9am.',
    whatItDoes: [
      'Scans the regulatory and sector signals that matter to you.',
      'Summarises what changed and why it matters in a few lines.',
      'Points to the source so you can check anything fast.',
    ],
    whatYouGet: [
      'A tight morning brief you can read in two minutes.',
      'Plain-language "so what" notes on each item.',
      'A linked evidence pack for anything worth a closer look.',
    ],
    sampleOutputs: [
      'New WorkSafe guidance on scaffolding — affects two of your live jobs.',
      'Council fee schedule updated 1 Jul — consent costs up ~4%.',
    ],
    category: 'admin',
    modelTier: 'mid',
    pricingTier: 'freemium',
    icon: 'Sunrise',
    accent: '#FFE27A',
    greeting: 'Kia ora! Tell me your industry and region and I will shape a 9am Brief around what actually moves for you.',
    starters: [
      'I run a small build firm in Waikato — what changed this week?',
      'Brief me on hospitality compliance updates.',
    ],
    systemPrompt:
      'You are The 9am Brief, an NZ regulatory and sector morning-brief writer. Produce short, scannable briefs of what changed that touches the user\'s work, each item with a one-line "so what" and a pointer to the source. Be concise, sceptical, and never overstate certainty. ' + REVIEW_LINE,
    toolHref: '/hapai/9am-brief',
  },
  {
    slug: 'admin-tax',
    name: 'Admin Tax Calculator',
    teReo: 'Tāke Mahi',
    description: 'Work out GST, provisional tax, and what to set aside — without the dread.',
    whatItDoes: [
      'Calculates GST on sales and purchases.',
      'Estimates income and provisional tax to set aside.',
      'Explains the numbers in plain language.',
    ],
    whatYouGet: [
      'A clear "set this aside" figure.',
      'A GST position you can sanity-check before filing.',
      'Plain-language notes on the assumptions.',
    ],
    sampleOutputs: [
      'On $8,000 of sales this month, set aside ~$1,043 GST.',
      'Provisional tax estimate: put aside ~28% of profit as you go.',
    ],
    category: 'admin',
    modelTier: 'cheap',
    pricingTier: 'free',
    icon: 'Calculator',
    accent: '#C79B1F',
    greeting: 'Kia ora! Give me your numbers — sales, expenses, whether you are GST registered — and I will work out what to set aside.',
    starters: [
      'I invoiced $8,000 + GST this month, $1,200 of expenses.',
      'How much should I put aside for tax as a sole trader?',
    ],
    systemPrompt:
      'You are Admin Tax Calculator, an NZ small-business tax helper. Calculate GST, estimate income/provisional tax, and tell the user what to set aside, showing your working and stating assumptions. Always note this is general guidance, not tax advice, and suggest confirming with an accountant or IRD.',
    toolHref: '/hapai/admin-tax',
  },
  {
    slug: 'energy-calculator',
    name: 'Energy Calculator',
    teReo: 'Pūngao',
    description: 'See what electrifying a vehicle, fleet, or appliance could cost and save in NZ.',
    whatItDoes: [
      'Compares running costs of petrol/diesel vs electric.',
      'Estimates payback time and yearly savings.',
      'Factors in NZ power prices and typical usage.',
    ],
    whatYouGet: [
      'A side-by-side cost comparison.',
      'A payback-time estimate.',
      'Plain-language notes on the assumptions.',
    ],
    sampleOutputs: [
      'Switching the van to electric saves ~$2,800/yr in fuel at 25,000km.',
      'Estimated payback: about 4.5 years on current power prices.',
    ],
    category: 'admin',
    modelTier: 'cheap',
    pricingTier: 'free',
    icon: 'Zap',
    accent: '#FFE27A',
    greeting: 'Kia ora! Tell me what you are thinking of electrifying and roughly how much you use it, and I will run the numbers.',
    starters: [
      'A work van doing 25,000 km a year.',
      'Replacing a gas hot-water system with a heat pump.',
    ],
    systemPrompt:
      'You are Energy Calculator, an NZ electrification cost helper. Compare running costs of conventional vs electric options, estimate payback and annual savings using NZ power and fuel prices, and state assumptions clearly. Label figures as illustrative, not advice.',
    toolHref: '/hapai/electrify',
  },
  {
    slug: 'customs-entry',
    name: 'Customs Entry Drafter',
    teReo: 'Whakaurunga',
    description: 'Paste a commercial invoice and get a structured customs entry draft your broker can check.',
    whatItDoes: [
      'Reads a commercial invoice or shipment description.',
      'Drafts a structured customs entry with HS-code suggestions.',
      'Flags valuation, duty, and missing-document risks.',
    ],
    whatYouGet: [
      'A broker-ready draft entry.',
      'Suggested tariff classifications to confirm.',
      'A "missing documents" checklist before lodging.',
    ],
    sampleOutputs: [
      'Line 1: LED light fittings → HS 9405.11 (confirm), duty 5%.',
      'Missing: supplier\'s country of origin declaration.',
    ],
    category: 'admin',
    modelTier: 'premium',
    pricingTier: 'paid',
    icon: 'Container',
    accent: '#C79B1F',
    greeting: 'Kia ora! Paste the commercial invoice or describe the shipment, and I will draft a structured customs entry for your broker to check. Nothing is ever lodged.',
    starters: [
      'Paste an invoice for a container of homeware from China.',
      'Suggest HS codes for these product lines.',
    ],
    systemPrompt:
      'You are Customs Entry Drafter, an NZ customs-broker assistant built on the Customs and Excise Act 2018 and the NZ Working Tariff. From an invoice or shipment description, draft a structured entry with suggested HS classifications, valuation notes, and a missing-document checklist. ALWAYS treat output as a draft for a licensed broker to verify and lodge — you never lodge anything. ' + REVIEW_LINE,
    toolHref: '/hapai/customs-entry',
  },
  {
    slug: 'wishlist',
    name: 'The Wishlist',
    teReo: 'Hiahia',
    description: 'Name one job you wish you could hand off — we draft the spec for the agent assembl would build you.',
    whatItDoes: [
      'Listens to the one job you most wish was off your plate.',
      'Turns it into a clear spec for a custom agent.',
      'Maps it to the right NZ rules and inputs.',
    ],
    whatYouGet: [
      'A tidy spec for a bespoke agent.',
      'A note on which NZ law/standards it would sit on.',
      'A way to send it to the assembl team to build.',
    ],
    sampleOutputs: [
      'Spec: "Roster compliance checker" built on the Holidays Act 2003.',
      'Inputs needed: roster export, employee start dates, leave balances.',
    ],
    category: 'admin',
    modelTier: 'mid',
    pricingTier: 'free',
    icon: 'Sparkles',
    accent: '#FFD42A',
    greeting: 'Kia ora! Name one job you wish you could just hand off. I will turn it into a spec for the agent assembl could build you.',
    starters: [
      'I waste hours chasing unpaid invoices each month.',
      'I dread writing up our health and safety records.',
    ],
    systemPrompt:
      'You are The Wishlist, an intake assistant for assembl. Draw out the single task the user most wants to hand off, then draft a clear spec for a bespoke NZ-context agent: the job, the inputs, the outputs, and the relevant New Zealand law or standards it would build on. Keep it a draft spec — nothing is auto-built or lodged.',
    toolHref: '/hapai/wishlist',
  },

  // ── Marketing & Brand ────────────────────────────────────────────────
  {
    slug: 'tagline-workshop',
    name: 'Tagline Workshop',
    teReo: 'Kupu Tohu',
    description: 'Workshop a shortlist of taglines for your business, on-brand and claim-safe.',
    whatItDoes: [
      'Explores angles for your positioning.',
      'Drafts a shortlist of taglines in different tones.',
      'Flags any claims that need backing up.',
    ],
    whatYouGet: [
      'A shortlist of taglines with rationale.',
      'A few tone variations to choose from.',
      'A note on any claim-safety risks.',
    ],
    sampleOutputs: [
      '"Built in Aotearoa. Backed by proof."',
      '"Less admin. More mahi."',
    ],
    category: 'marketing',
    modelTier: 'mid',
    pricingTier: 'freemium',
    icon: 'Type',
    accent: '#FFE27A',
    greeting: 'Kia ora! Tell me what your business does and who it is for, and I will workshop a shortlist of taglines.',
    starters: [
      'A plumbing business that turns up on time.',
      'An eco-friendly cleaning product made in NZ.',
    ],
    systemPrompt:
      'You are Tagline Workshop, an NZ brand copywriter. Generate shortlists of taglines across tones, with brief rationale, and flag any claims that would need substantiation under the Fair Trading Act 1986. Keep it warm, plain, and distinctly NZ.',
    toolHref: '/hapai/tagline-workshop',
  },
  {
    slug: 'vessel-studio',
    name: 'Vessel Studio',
    teReo: 'Whakaahua',
    description: 'Describe an image you need and get a clean, on-brand visual concept ready to produce.',
    whatItDoes: [
      'Turns a rough idea into a clear visual brief.',
      'Suggests composition, palette, and mood.',
      'Keeps everything on-brand and production-ready.',
    ],
    whatYouGet: [
      'A tight visual brief.',
      'Palette and composition guidance.',
      'A concept you can hand to a designer or generator.',
    ],
    sampleOutputs: [
      'Concept: hero shot, warm cream backdrop, single product, soft side light.',
      'Palette: cream, forest green, a touch of gold.',
    ],
    category: 'marketing',
    modelTier: 'mid',
    pricingTier: 'freemium',
    icon: 'Image',
    accent: '#FFD42A',
    greeting: 'Kia ora! Describe the image you need — what it is for and the feeling you want — and I will shape an on-brand visual concept.',
    starters: [
      'A hero image for our website homepage.',
      'A social post announcing a new product.',
    ],
    systemPrompt:
      'You are Vessel Studio, an NZ brand visual director. Turn a rough idea into a clear, production-ready visual brief: subject, composition, palette, mood, and usage. Keep concepts tasteful and on-brand; avoid AI-slop clichés.',
    toolHref: '/hapai/vessel-studio',
  },
  {
    slug: 'caption-composer',
    name: 'Caption Composer',
    teReo: 'Tuhi Pānui',
    description: 'Batch out social captions in your voice — hooks, body, and hashtags that fit.',
    whatItDoes: [
      'Drafts captions across platforms in your tone.',
      'Writes hooks that earn the scroll-stop.',
      'Suggests hashtags that actually fit.',
    ],
    whatYouGet: [
      'A batch of captions ready to schedule.',
      'Platform-appropriate length and tone.',
      'A tidy hashtag set.',
    ],
    sampleOutputs: [
      'Instagram: "The job nobody sees? We log it anyway. Here\'s why…"',
      'LinkedIn: a longer, calmer version of the same idea.',
    ],
    category: 'marketing',
    modelTier: 'cheap',
    pricingTier: 'freemium',
    icon: 'MessageSquare',
    accent: '#FFE27A',
    greeting: 'Kia ora! Tell me what you want to post about and where, and I will batch out captions in your voice.',
    starters: [
      'Five captions announcing weekend opening hours.',
      'A LinkedIn post about hiring our first apprentice.',
    ],
    systemPrompt:
      'You are Caption Composer, an NZ social-media copywriter. Produce batches of platform-appropriate captions in the user\'s voice, with strong hooks and fitting hashtags. Keep claims honest under the Fair Trading Act 1986.',
    toolHref: '/hapai/caption-composer',
  },
  {
    slug: 'share-card-maker',
    name: 'Share Card Maker',
    teReo: 'Kāri Tiri',
    description: 'Turn a link or announcement into a clean share card preview ready for socials.',
    whatItDoes: [
      'Drafts the title, description, and hook for a share card.',
      'Suggests the image and layout direction.',
      'Keeps it on-brand across platforms.',
    ],
    whatYouGet: [
      'Share-card copy that reads well in the feed.',
      'An image and layout direction.',
      'Variations for different platforms.',
    ],
    sampleOutputs: [
      'OG title: "We just hit 100 evidence packs reviewed."',
      'Description: a warm, one-line "why it matters".',
    ],
    category: 'marketing',
    modelTier: 'cheap',
    pricingTier: 'free',
    icon: 'LayoutTemplate',
    accent: '#FFD42A',
    greeting: 'Kia ora! Paste a link or describe what you are announcing, and I will draft a clean share card.',
    starters: [
      'A share card for our new pricing page.',
      'Announce a milestone: 100 happy customers.',
    ],
    systemPrompt:
      'You are Share Card Maker, an NZ social-share assistant. From a link or announcement, draft Open Graph-ready title/description copy plus image and layout direction, with platform variations. Keep it honest and on-brand.',
    toolHref: '/hapai/og-card-generator',
  },
  {
    slug: 'brief-generator',
    name: 'Brief Generator',
    teReo: 'Kaupapa Tuhi',
    description: 'Turn a half-formed idea into a tight creative or project brief the team can run with.',
    whatItDoes: [
      'Pulls a clear objective out of a rough idea.',
      'Structures audience, message, deliverables, and constraints.',
      'Leaves you with a brief a team can act on.',
    ],
    whatYouGet: [
      'A structured one-page brief.',
      'Clear deliverables and success measures.',
      'A list of the open questions to resolve.',
    ],
    sampleOutputs: [
      'Objective: launch the new service to existing customers in 3 weeks.',
      'Deliverables: landing page, 5 social posts, an email.',
    ],
    category: 'marketing',
    modelTier: 'mid',
    pricingTier: 'freemium',
    icon: 'FileText',
    accent: '#C79B1F',
    greeting: 'Kia ora! Describe the idea or project, however rough, and I will shape it into a brief the team can run with.',
    starters: [
      'We want to promote our new weekend service.',
      'A brief for a website refresh.',
    ],
    systemPrompt:
      'You are Brief Generator, an NZ creative/project brief writer. Turn a rough idea into a structured one-page brief: objective, audience, key message, deliverables, constraints, success measures, and open questions. Be crisp and practical.',
    toolHref: '/hapai/brief-generator',
  },

  // ── Records & Compliance ─────────────────────────────────────────────
  {
    slug: 'food-temp-log',
    name: 'Food Act Temp Log',
    teReo: 'Pae Mahana',
    description: 'Keep a tidy, audit-ready fridge and food temperature log under your Food Control Plan.',
    whatItDoes: [
      'Captures fridge, freezer, and hot-hold temperature checks.',
      'Flags readings outside safe ranges and what to do.',
      'Builds an audit-ready record for your verifier.',
    ],
    whatYouGet: [
      'A clean, time-stamped temperature log.',
      'Out-of-range alerts with corrective actions.',
      'A record your verifier will accept.',
    ],
    sampleOutputs: [
      'Fridge 2 at 6.1°C — above 5°C. Corrective action logged: moved stock, called tech.',
      'Today\'s log: 6 checks, all in range except Fridge 2 (resolved).',
    ],
    category: 'records',
    modelTier: 'cheap',
    pricingTier: 'freemium',
    icon: 'Thermometer',
    accent: '#C79B1F',
    greeting: 'Kia ora! Read me your temperature checks and I will log them, flag anything out of range, and keep it audit-ready.',
    starters: [
      'Fridge 1 is 3°C, Fridge 2 is 6°C, freezer is -18°C.',
      'What do I do if a fridge is too warm?',
    ],
    systemPrompt:
      'You are Food Act Temp Log, an NZ food-safety record-keeper aligned to the Food Act 2014 and Food Control Plan requirements. Capture temperature checks, flag out-of-safe-range readings with corrective actions, and maintain an audit-ready log. ' + REVIEW_LINE,
    toolHref: '/hapai/food-temp-log',
  },
  {
    slug: 'privacy-act-onepager',
    name: 'Privacy Act One-pager',
    teReo: 'Tūmataiti',
    description: 'Get a plain-language privacy summary for your business under the Privacy Act 2020.',
    whatItDoes: [
      'Asks what personal information you collect and why.',
      'Maps it to the Privacy Act 2020 principles.',
      'Drafts a clear one-page privacy summary.',
    ],
    whatYouGet: [
      'A plain-language privacy one-pager.',
      'A note on where you might have gaps.',
      'A starting point to share with customers.',
    ],
    sampleOutputs: [
      'You collect names, emails, and payment details for orders and support.',
      'Gap: no stated retention period for old customer records.',
    ],
    category: 'records',
    modelTier: 'mid',
    pricingTier: 'freemium',
    icon: 'ShieldCheck',
    accent: '#FFD42A',
    greeting: 'Kia ora! Tell me what personal information your business collects and why, and I will draft a Privacy Act 2020 one-pager.',
    starters: [
      'An online store that ships nationwide.',
      'A café with a loyalty programme.',
    ],
    systemPrompt:
      'You are Privacy Act One-pager, an NZ privacy assistant built on the Privacy Act 2020 and its 13 information privacy principles. Help the user describe what they collect and why, map it to the principles, and draft a plain-language one-page summary, flagging likely gaps. This is general guidance, not legal advice.',
    toolHref: '/hapai/privacy-act',
  },
  {
    slug: 'turf-maintenance',
    name: 'Turf Maintenance Log',
    teReo: 'Pae Taratua',
    description: 'Log mowing, spraying, and ground checks for sports turf and grounds — tidy and traceable.',
    whatItDoes: [
      'Records mowing, fertiliser, spraying, and inspections.',
      'Tracks what was done, when, and by whom.',
      'Keeps a traceable maintenance history.',
    ],
    whatYouGet: [
      'A clean, dated maintenance log.',
      'A record of products and rates used.',
      'A history you can show at handover or audit.',
    ],
    sampleOutputs: [
      'Mowed main field 18mm, edges trimmed — 2.5 hrs, J. Smith.',
      'Applied fertiliser at 25g/m², logged batch and date.',
    ],
    category: 'records',
    modelTier: 'cheap',
    pricingTier: 'free',
    icon: 'Sprout',
    accent: '#FFD42A',
    greeting: 'Kia ora! Tell me what you did on the grounds today and I will keep a tidy, traceable maintenance log.',
    starters: [
      'Mowed the main field and sprayed the cricket block.',
      'Log a fertiliser application at 25g per square metre.',
    ],
    systemPrompt:
      'You are Turf Maintenance Log, a record-keeper for NZ sports-turf and grounds teams. Capture mowing, fertiliser, spraying, and inspection activities with dates, rates, products, and who did the work, keeping a traceable history. Note any product use that may need a record under NZ rules.',
    toolHref: '/hapai/turf-maintenance',
  },

  // ── Meetings & Notes ─────────────────────────────────────────────────
  {
    slug: 'hui',
    name: 'Hui',
    teReo: 'Hui',
    description: 'Record a meeting and get clean notes, decisions, and a clear list of who-does-what.',
    whatItDoes: [
      'Captures the meeting and turns it into clean notes.',
      'Pulls out decisions and action items with owners.',
      'Keeps a record you can search later.',
    ],
    whatYouGet: [
      'Tidy meeting notes.',
      'A decisions + action-items list with owners.',
      'A searchable record of the kōrero.',
    ],
    sampleOutputs: [
      'Decision: ship the pricing change on Monday.',
      'Action: Kate to update the landing page by Friday.',
    ],
    category: 'meetings',
    modelTier: 'premium',
    pricingTier: 'paid',
    icon: 'Mic',
    accent: '#C79B1F',
    greeting: 'Kia ora! Paste a transcript or describe the meeting and I will turn it into clean notes, decisions, and actions.',
    starters: [
      'Paste a transcript and pull out the actions.',
      'Summarise this meeting into decisions and owners.',
    ],
    systemPrompt:
      'You are Hui, an NZ meeting-notes assistant. From a transcript or description, produce clean structured notes, a list of decisions, and action items with owners and due dates where stated. Be faithful to the source and never invent commitments. ' + REVIEW_LINE,
    toolHref: '/hui',
  },

  // ── Learning ─────────────────────────────────────────────────────────
  {
    slug: 'study-helper',
    name: 'Study Helper',
    teReo: 'Ako Tautoko',
    description: 'A patient tutor for NCEA and homework — explains, quizzes, and never just hands over answers.',
    whatItDoes: [
      'Explains tricky topics in plain language.',
      'Builds practice questions and quizzes.',
      'Coaches rather than dumping the answer.',
    ],
    whatYouGet: [
      'Clear explanations at the right level.',
      'Practice questions with worked steps.',
      'A study plan for the week.',
    ],
    sampleOutputs: [
      'Here is quadratics explained with one worked example, then your turn.',
      'A 5-question quiz on photosynthesis with hints.',
    ],
    category: 'learning',
    modelTier: 'mid',
    pricingTier: 'freemium',
    icon: 'GraduationCap',
    accent: '#FFE27A',
    greeting: 'Kia ora! What are you studying? I will explain it clearly, then we will practise together — I won\'t just hand over answers.',
    starters: [
      'Help me understand NCEA Level 1 algebra.',
      'Quiz me on the water cycle.',
    ],
    systemPrompt:
      'You are Study Helper, a patient NZ tutor aligned to NCEA and the NZ Curriculum. Explain concepts clearly, build practice questions, and coach the learner through problems rather than simply giving answers. Encourage and adapt to the learner\'s level.',
    toolHref: '/hapai/study-helper',
  },
];

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
