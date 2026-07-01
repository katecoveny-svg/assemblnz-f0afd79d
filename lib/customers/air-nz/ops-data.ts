/**
 * Air New Zealand × Dash — back-of-house PARTNER OPERATIONS data.
 *
 * The console the Air NZ partnerships / finance / compliance team would use to
 * RUN a Dash partnership: sponsors, campaigns, revenue split, passenger-segment
 * analytics, compliance, comms drafting, Koru reconciliation, and the CDO daily
 * brief.
 *
 * CONCEPT / DEMO ONLY. Every figure is mocked. No live Air NZ / Koru / Airpoints
 * API calls, no real Airpoints minted, no real passenger PII — segment analytics
 * are aggregate-only by construction. There is no real Air NZ partnership; every
 * surface is marked "concept · demo pending".
 *
 * Currency: Airpoints Dollars, written `A$` (never "koru points"). Revenue and
 * spend are NZ$. Economics canon is shared with lib/customers/air-nz/data.ts
 * (base CPM NZ$45, publisher/treasury share 55%, assembl share 45%).
 */

import { nzd, apd } from './data';

export { nzd, apd };

// ---------------------------------------------------------------------------
// Sponsor tiers — platinum / gold / silver, different attribution + pricing
// ---------------------------------------------------------------------------
export type SponsorTier = 'platinum' | 'gold' | 'silver';

export const SPONSOR_TIERS: Record<
  SponsorTier,
  { label: string; cpmFloor: number; attribution: string; waitStates: string; colour: string; perks: string[] }
> = {
  platinum: {
    label: 'Platinum',
    cpmFloor: 62,
    attribution: 'First-look + category exclusivity',
    waitStates: 'All wait states incl. premium IFE',
    colour: '#111111',
    perks: ['Category exclusivity', 'Premium IFE inventory', 'Named on Mana Receipt', 'Quarterly business review'],
  },
  gold: {
    label: 'Gold',
    cpmFloor: 45,
    attribution: 'Priority fill after platinum',
    waitStates: 'Gate · booking · check-in · baggage',
    colour: '#C79B1F',
    perks: ['Priority fill', 'Route targeting', 'Named on Mana Receipt', 'Monthly performance pack'],
  },
  silver: {
    label: 'Silver',
    cpmFloor: 36,
    attribution: 'Remnant / unsold fill',
    waitStates: 'Booking · check-in · baggage',
    colour: '#8A8678',
    perks: ['Remnant fill', 'Aggregate reporting'],
  },
};

// ---------------------------------------------------------------------------
// Sponsors — brands buying wait-state moments
// ---------------------------------------------------------------------------
export type Sponsor = {
  id: string;
  name: string;
  category: string;
  tier: SponsorTier;
  status: 'live' | 'onboarding' | 'paused' | 'review';
  monthlyBudget: number; // NZ$
  spentThisMonth: number; // NZ$
  creativeAssets: number;
  creativeApproved: number;
  windowStart: string; // ISO date
  windowEnd: string;
  targeting: string;
  accountManager: string;
};

export const SPONSORS: Sponsor[] = [
  {
    id: 'bnz',
    name: 'BNZ',
    category: 'Banking',
    tier: 'platinum',
    status: 'live',
    monthlyBudget: 48000,
    spentThisMonth: 31200,
    creativeAssets: 8,
    creativeApproved: 8,
    windowStart: '2026-07-01',
    windowEnd: '2026-09-30',
    targeting: 'Domestic gate · Koru Gold/Silver · AKL·WLG·CHC',
    accountManager: 'Priya N.',
  },
  {
    id: 'asb',
    name: 'ASB',
    category: 'Banking',
    tier: 'gold',
    status: 'live',
    monthlyBudget: 32000,
    spentThisMonth: 24800,
    creativeAssets: 6,
    creativeApproved: 5,
    windowStart: '2026-07-01',
    windowEnd: '2026-08-31',
    targeting: 'Booking + check-in · all tiers · main trunk',
    accountManager: 'Priya N.',
  },
  {
    id: 'foodstuffs',
    name: 'Foodstuffs',
    category: 'Grocery',
    tier: 'gold',
    status: 'live',
    monthlyBudget: 28000,
    spentThisMonth: 19100,
    creativeAssets: 5,
    creativeApproved: 5,
    windowStart: '2026-07-01',
    windowEnd: '2026-12-31',
    targeting: 'Baggage carousel · regional arrivals',
    accountManager: 'Marcus T.',
  },
  {
    id: 'sharesies',
    name: 'Sharesies',
    category: 'Investing',
    tier: 'silver',
    status: 'live',
    monthlyBudget: 12000,
    spentThisMonth: 7400,
    creativeAssets: 4,
    creativeApproved: 4,
    windowStart: '2026-07-01',
    windowEnd: '2026-09-30',
    targeting: 'Booking spinner · under-40 segment (aggregate)',
    accountManager: 'Marcus T.',
  },
  {
    id: '2degrees',
    name: '2degrees',
    category: 'Telco',
    tier: 'gold',
    status: 'onboarding',
    monthlyBudget: 22000,
    spentThisMonth: 0,
    creativeAssets: 3,
    creativeApproved: 1,
    windowStart: '2026-07-15',
    windowEnd: '2026-10-15',
    targeting: 'Gate wait · trans-Tasman',
    accountManager: 'Priya N.',
  },
  {
    id: 'whittakers',
    name: "Whittaker's",
    category: 'Grocery',
    tier: 'silver',
    status: 'review',
    monthlyBudget: 9000,
    spentThisMonth: 0,
    creativeAssets: 2,
    creativeApproved: 0,
    windowStart: '2026-08-01',
    windowEnd: '2026-10-31',
    targeting: 'Seat check-in · family segment (aggregate)',
    accountManager: 'Marcus T.',
  },
];

export function sponsorById(id: string) {
  return SPONSORS.find((s) => s.id === id);
}

// ---------------------------------------------------------------------------
// Campaign scheduler — sponsor × wait moment × route/day/segment
// ---------------------------------------------------------------------------
export type Campaign = {
  id: string;
  sponsorId: string;
  waitState: 'booking' | 'identity' | 'seat' | 'gate' | 'ife' | 'baggage';
  waitLabel: string;
  route: string;
  segment: string;
  days: string; // e.g. 'Mon–Fri'
  cpm: number;
  dailyCap: number; // impressions
  status: 'scheduled' | 'running' | 'ended' | 'draft';
};

export const CAMPAIGNS: Campaign[] = [
  { id: 'c1', sponsorId: 'bnz', waitState: 'gate', waitLabel: 'Gate wait', route: 'AKL ⇄ WLG', segment: 'Koru Gold/Silver', days: 'Mon–Fri', cpm: 64, dailyCap: 22000, status: 'running' },
  { id: 'c2', sponsorId: 'bnz', waitState: 'ife', waitLabel: 'IFE unlock', route: 'AKL ⇄ CHC', segment: 'All · international fleet', days: 'Daily', cpm: 68, dailyCap: 14000, status: 'running' },
  { id: 'c3', sponsorId: 'asb', waitState: 'booking', waitLabel: 'Booking flow', route: 'Main trunk', segment: 'All tiers', days: 'Daily', cpm: 40, dailyCap: 30000, status: 'running' },
  { id: 'c4', sponsorId: 'asb', waitState: 'seat', waitLabel: 'Seat check-in', route: 'AKL ⇄ WLG', segment: 'All tiers', days: 'Thu–Sun', cpm: 38, dailyCap: 18000, status: 'running' },
  { id: 'c5', sponsorId: 'foodstuffs', waitState: 'baggage', waitLabel: 'Baggage carousel', route: 'Regional arrivals', segment: 'All', days: 'Daily', cpm: 36, dailyCap: 16000, status: 'running' },
  { id: 'c6', sponsorId: 'sharesies', waitState: 'booking', waitLabel: 'Booking flow', route: 'All domestic', segment: 'Under-40 (aggregate)', days: 'Mon–Fri', cpm: 38, dailyCap: 12000, status: 'running' },
  { id: 'c7', sponsorId: '2degrees', waitState: 'gate', waitLabel: 'Gate wait', route: 'Trans-Tasman', segment: 'All', days: 'Fri–Mon', cpm: 45, dailyCap: 20000, status: 'scheduled' },
  { id: 'c8', sponsorId: 'whittakers', waitState: 'seat', waitLabel: 'Seat check-in', route: 'AKL ⇄ ZQN', segment: 'Family (aggregate)', days: 'Sat–Sun', cpm: 36, dailyCap: 8000, status: 'draft' },
];

export function campaignsForSponsor(id: string) {
  return CAMPAIGNS.filter((c) => c.sponsorId === id);
}

// ---------------------------------------------------------------------------
// Revenue split — gross → Koru treasury / Airpoints$ liability / net to Air NZ
// Canon: treasury 55% (of which 60% credited as Airpoints$), assembl 45%.
// ---------------------------------------------------------------------------
export const REVENUE_MTD = {
  grossAdRevenue: 82440, // NZ$ this month to date
  fillRate: 0.66,
  paidImpressions: 1_618_000,
};

export function revenueSplit(gross: number) {
  const treasury = gross * 0.55;
  const airpointsLiability = treasury * 0.6; // credited to members as Airpoints$
  const koruNet = treasury - airpointsLiability; // Air NZ retained margin
  const assemblShare = gross * 0.45;
  return { gross, treasury, airpointsLiability, koruNet, assemblShare };
}

/** Six-month gross trend (NZ$) for the revenue chart. */
export const REVENUE_TREND = [
  { month: 'Feb', gross: 41200 },
  { month: 'Mar', gross: 52800 },
  { month: 'Apr', gross: 61400 },
  { month: 'May', gross: 68900 },
  { month: 'Jun', gross: 77300 },
  { month: 'Jul', gross: 82440 },
];

export const REVENUE_FORECAST_JUL = 79000; // forecast for the month

// ---------------------------------------------------------------------------
// Passenger-segment analytics — aggregate only, no individual PII
// ---------------------------------------------------------------------------
export const SEGMENT_NOTE =
  'Aggregate cohorts only — minimum bucket size 1,000. No individual passenger records, no PII, no cross-session identifiers. Privacy Act 2020 IPP-compliant by construction.';

export const ROUTE_PERFORMANCE = [
  { route: 'AKL ⇄ WLG', optIn: 0.41, ctr: 0.058, apdPerPax: 4.2, fill: 0.72 },
  { route: 'AKL ⇄ CHC', optIn: 0.38, ctr: 0.051, apdPerPax: 3.8, fill: 0.69 },
  { route: 'AKL ⇄ ZQN', optIn: 0.44, ctr: 0.062, apdPerPax: 4.6, fill: 0.74 },
  { route: 'WLG ⇄ CHC', optIn: 0.35, ctr: 0.047, apdPerPax: 3.3, fill: 0.63 },
  { route: 'Trans-Tasman', optIn: 0.33, ctr: 0.044, apdPerPax: 5.1, fill: 0.58 },
];

export const TIME_OF_DAY = [
  { band: 'Early (05–08)', index: 118 },
  { band: 'Morning (08–11)', index: 104 },
  { band: 'Midday (11–14)', index: 92 },
  { band: 'Afternoon (14–17)', index: 99 },
  { band: 'Evening (17–21)', index: 127 },
];

export const BOOKING_CLASS = [
  { cls: 'Business', optIn: 0.29, note: 'Lower opt-in, higher CPM tolerance' },
  { cls: 'Flexi', optIn: 0.37, note: 'Balanced' },
  { cls: 'Seat', optIn: 0.43, note: 'Highest opt-in, price-sensitive cohort' },
  { cls: 'Seat+Bag', optIn: 0.45, note: 'Best converting cohort' },
];

// ---------------------------------------------------------------------------
// Compliance — Privacy Act 2020 (IPP 3A automated-decision notice) + Fair
// Trading Act check on sponsor creative
// ---------------------------------------------------------------------------
export type ComplianceCheck = {
  touchpoint: string;
  ipp3aNotice: 'shown' | 'pending';
  fairTrading: 'pass' | 'flag' | 'review';
  sponsor: string;
  note: string;
};

export const COMPLIANCE_CHECKS: ComplianceCheck[] = [
  { touchpoint: 'Gate wait · BNZ', ipp3aNotice: 'shown', fairTrading: 'pass', sponsor: 'BNZ', note: 'Rate claim substantiated; “representative example” present.' },
  { touchpoint: 'Booking · ASB', ipp3aNotice: 'shown', fairTrading: 'pass', sponsor: 'ASB', note: 'No comparative claims. Clear sponsor identification.' },
  { touchpoint: 'Baggage · Foodstuffs', ipp3aNotice: 'shown', fairTrading: 'pass', sponsor: 'Foodstuffs', note: 'Price shown incl. GST; offer T&Cs linked.' },
  { touchpoint: 'Booking · Sharesies', ipp3aNotice: 'shown', fairTrading: 'review', sponsor: 'Sharesies', note: 'Investing risk disclaimer required before go-live — awaiting revised asset.' },
  { touchpoint: 'Gate · 2degrees', ipp3aNotice: 'pending', fairTrading: 'flag', sponsor: '2degrees', note: '“Fastest network” claim needs Commerce Commission-grade substantiation or removal.' },
  { touchpoint: 'Seat · Whittaker’s', ipp3aNotice: 'pending', fairTrading: 'review', sponsor: "Whittaker's", note: 'Creative not yet submitted for Fair Trading review.' },
];

export const IPP3A_NOTICE =
  'This moment uses automated decision-making to select which sponsored content you see, based on aggregate flight and journey context — never on your identity or personal history. You can opt out in Koru settings. (Privacy Act 2020, IPP 3A.)';

// ---------------------------------------------------------------------------
// Comms drafting — partner updates, board snippets, sponsor AM comms
// ---------------------------------------------------------------------------
export type CommsTemplate = {
  id: string;
  kind: 'Partner update' | 'Board snippet' | 'Sponsor AM';
  title: string;
  audience: string;
  body: string;
};

export const COMMS_TEMPLATES: CommsTemplate[] = [
  {
    id: 'partner-weekly',
    kind: 'Partner update',
    title: 'Weekly partner update — Dash on Air New Zealand',
    audience: 'assembl partnerships team',
    body: `Kia ora team,\n\nWeek to date on the Air New Zealand pilot:\n• Gross ad revenue NZ$82,440 MTD, tracking 4% ahead of the July forecast.\n• Six sponsors live or onboarding; BNZ (platinum) leading fill on the gate + IFE inventory.\n• Fill rate 66%, up from 62% at pilot start.\n• Airpoints Dollars credited to members: NZ$27,205 MTD.\n• Two compliance items open (Sharesies risk disclaimer, 2degrees claim) — neither blocks live inventory.\n\nNo passenger-level data leaves the aggregate layer. Next week: 2degrees creative resubmission, trans-Tasman gate go-live.\n\nNgā mihi,\nassembl × Koru`,
  },
  {
    id: 'board-snippet',
    kind: 'Board snippet',
    title: 'Board report — Loyalty innovation (Dash pilot)',
    audience: 'Air NZ Board pack',
    body: `Dash pilot (compensated-wait loyalty): the pilot is live across five domestic routes at the gate, booking, check-in and baggage wait states. Month-to-date gross of NZ$82.4k, with 55% accruing to the Koru treasury and NZ$27.2k credited to members as Airpoints Dollars. NPS on exposed passengers is holding above the control cohort. No individual passenger data is used in targeting; selection is aggregate and IPP 3A-noticed. Recommend proceeding to the full domestic-gate rollout decision in Q4.`,
  },
  {
    id: 'sponsor-am',
    kind: 'Sponsor AM',
    title: 'BNZ — monthly performance note',
    audience: 'BNZ account manager',
    body: `Kia ora,\n\nBNZ on Air New Zealand — month to date:\n• Spend NZ$31,200 of NZ$48,000 budget (65%).\n• 512k paid impressions across gate and IFE, effective CPM NZ$64–68.\n• Category exclusivity (Banking) held on the gate wait; ASB confined to booking + check-in.\n• Fair Trading review: all eight assets passed; rate claim substantiation on file.\n\nHappy to walk the route-level breakdown at the QBR. The seat-check-in inventory opens in August if you'd like first look.\n\nNgā mihi`,
  },
];

// ---------------------------------------------------------------------------
// Koru / Airpoints reconciliation monitor
// ---------------------------------------------------------------------------
export const LOYALTY_RECON = {
  airpointsMintedMtd: 27205, // NZ$ credited as Airpoints Dollars
  treasuryExpected: 27205, // should match
  variance: 0,
  lastReconciled: 'today · 06:00 NZT',
  unreconciledMoments: 0,
  status: 'balanced' as 'balanced' | 'variance',
};

export const LOYALTY_BY_WAIT = [
  { wait: 'Gate wait', moments: 214800, apdMinted: 9860 },
  { wait: 'IFE unlock', moments: 118200, apdMinted: 6420 },
  { wait: 'Booking flow', moments: 301400, apdMinted: 5210 },
  { wait: 'Seat check-in', moments: 142600, apdMinted: 3115 },
  { wait: 'Baggage carousel', moments: 168900, apdMinted: 2600 },
];

// ---------------------------------------------------------------------------
// CDO daily brief — Jeremy O'Brien
// ---------------------------------------------------------------------------
export const CDO_BRIEF = {
  for: "Jeremy O'Brien — Chief Customer & Digital Officer",
  date: 'Overnight to 06:00 NZT',
  headline: 'Revenue 4% ahead of forecast; two compliance items open, neither blocking.',
  overnight: [
    'NZ$3,140 gross booked overnight across gate + IFE (BNZ, ASB).',
    'Fill rate held at 66%; no unsold premium IFE inventory on the AKL⇄CHC evening bank.',
    'Airpoints Dollars credited overnight: NZ$1,036 to 4,120 members.',
  ],
  upcoming: [
    '2degrees gate campaign scheduled to go live 15 Jul — pending creative claim fix.',
    'Trans-Tasman gate inventory opens Friday.',
    'BNZ QBR booked for month-end; seat check-in first-look on the table.',
  ],
  revenueVsForecast: { mtd: 82440, forecast: 79000, deltaPct: 4.4 },
  complianceFlags: [
    '2degrees “fastest network” claim — needs substantiation or removal before 15 Jul.',
    'Sharesies booking asset — investing risk disclaimer required before go-live.',
  ],
  loyalty: 'Koru treasury reconciliation balanced overnight — zero variance, zero unreconciled moments.',
};
