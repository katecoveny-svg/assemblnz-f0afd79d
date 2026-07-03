/**
 * Contact Energy × Assembling — pitch-concept demo data.
 *
 * CONCEPT ONLY. Contact Energy is a pitch target, not a customer. Everything
 * here is fictional and illustrative: no real accounts, no real meter data,
 * no real credits, no partner commitments. Brand values verified from
 * contact.co.nz — see public/brand/contact-energy/README.md.
 */

// ── Brand tokens (verified from contact.co.nz computed CSS, 2026-07-03) ─────
export const CONTACT_BRAND = {
  slug: 'contact-energy',
  displayName: 'Contact Energy',
  red: '#E62A32', // logo + headlines
  redCta: '#D91C24', // "Join us" button
  ink: '#303030',
  charcoal: '#3F3C39',
  paper: '#F9F8F8',
  softGrey: '#CDCACA',
  white: '#FFFFFF',
  // assembl earn-layer chrome (DIRECTION-LOCKED-2026-07-01) — never red
  gold: '#BFA37A',
  goldDeep: '#8A6B4E',
  paperWarm: '#FBFAF6',
} as const;

/** "$4.23" — NZ dollars, always two decimals. */
export function nzd(value: number): string {
  return `$${value.toFixed(2)}`;
}

// ── Demo persona (fictional — no real Contact customer resembles this) ──────
export const DEMO_PERSONA = {
  name: 'Aroha',
  suburb: 'Te Atatū Peninsula, Auckland',
  plan: 'Good Nights',
  planBlurb: 'Free power 9pm–midnight on weeknights',
  fuels: 'Electricity + broadband',
  accountLabel: 'demo account · fictional',
};

// ── Usage (demo) — shaped like an Auckland home, entirely invented ──────────
export type UsageMonth = { month: string; kwh: number; freeKwh: number; billed: number };

export const USAGE_MONTHS: UsageMonth[] = [
  { month: 'Aug', kwh: 842, freeKwh: 118, billed: 251.4 },
  { month: 'Sep', kwh: 761, freeKwh: 104, billed: 228.9 },
  { month: 'Oct', kwh: 644, freeKwh: 92, billed: 197.3 },
  { month: 'Nov', kwh: 551, freeKwh: 78, billed: 172.1 },
  { month: 'Dec', kwh: 498, freeKwh: 66, billed: 158.4 },
  { month: 'Jan', kwh: 472, freeKwh: 61, billed: 149.9 },
  { month: 'Feb', kwh: 465, freeKwh: 63, billed: 147.2 },
  { month: 'Mar', kwh: 528, freeKwh: 71, billed: 166.0 },
  { month: 'Apr', kwh: 617, freeKwh: 87, billed: 190.8 },
  { month: 'May', kwh: 655, freeKwh: 95, billed: 203.1 },
  { month: 'Jun', kwh: 812, freeKwh: 121, billed: 247.6 },
  { month: 'Jul', kwh: 318, freeKwh: 44, billed: 96.2 }, // month to date
];

/** Why June ran higher than May — the Switch "why was my bill higher" answer. */
export const JUNE_VS_MAY = {
  deltaDollars: 44.5,
  drivers: [
    { label: 'Heating (cold snap, 14–22 June)', dollars: 31.2 },
    { label: 'Hot water (winter inlet temps)', dollars: 8.1 },
    { label: 'Two extra billing days in the period', dollars: 5.2 },
  ],
  offset: 'Good Nights free hours absorbed 121 kWh (≈ $36) that would otherwise have been billed.',
};

// ── Bill preview (demo) ──────────────────────────────────────────────────────
export const BILL_PREVIEW = {
  period: '12 Jun – 11 Jul 2026',
  dueDate: '28 Jul 2026',
  usageDollars: 214.9,
  dailyCharges: 39.1,
  discounts: -6.4, // prompt-payment style discount, illustrative
  assemblingCredits: -4.23,
  total: 243.37,
  forecastNote: 'Forecast — final bill issues 12 Jul. Figures illustrative.',
};

// ── Assembling wallet ────────────────────────────────────────────────────────
export const WALLET = {
  thisMonth: 4.23,
  lifetime: 38.71,
  sinceLabel: 'since March 2026',
  appliedToNextBill: true,
};

// ── The three "Switch has done" tiles ────────────────────────────────────────
export const SWITCH_TILES = [
  {
    key: 'best-plan',
    title: 'Best-plan check',
    headline: 'Good Nights still wins for you',
    detail:
      'Checked your last 90 days against Good Weekends, Basic and Broadband Bundle. Your 9pm–midnight EV-charge and dishwasher habit keeps Good Nights ahead by $8.10/month.',
    stamp: 'checked overnight · re-runs weekly',
  },
  {
    key: 'bill-forecast',
    title: 'Bill forecast',
    headline: '$243.37 due 28 Jul',
    detail:
      'Tracking $12 under June thanks to the warm start to July. Includes −$4.23 of Assembling credits, applied automatically before the bill issues.',
    stamp: 'updates daily from your usage',
  },
  {
    key: 'assembling-wallet',
    title: 'Assembling wallet',
    headline: '$4.23 earned this month',
    detail:
      'Earned by watching relevant offers during app loading moments — payment processing, meter refreshes, plan comparisons. Real bill credits, not points. Pause anytime.',
    stamp: 'applied to next bill · opt-in',
    isAttention: true,
  },
] as const;

// ── Wait-state demos (the money shot) ────────────────────────────────────────
export type WaitStateDemoDef = {
  key: string;
  trigger: string; // the button the viewer presses
  processLabel: string; // what the app pretends to be doing
  durationMs: number;
  partner: string;
  offer: string;
  offerDetail: string;
  match: string; // why this offer is relevant
  earn: number; // NZ$ credited
};

export const WAIT_STATE_DEMOS: WaitStateDemoDef[] = [
  {
    key: 'payment',
    trigger: 'Pay bill',
    processLabel: 'Processing your payment…',
    durationMs: 4000,
    partner: 'Ecostore',
    offer: '20% off laundry powder',
    offerDetail: 'Cold-wash formula — pairs with washing in your Good Nights free hours.',
    match: 'Matches your energy-saving profile',
    earn: 0.15,
  },
  {
    key: 'plan-compare',
    trigger: 'Compare plans',
    processLabel: 'Comparing plans against your usage…',
    durationMs: 6000,
    partner: 'Mitre 10',
    offer: '30% off LED smart bulbs',
    offerDetail: 'Schedule them to your free-power window straight from the app.',
    match: 'Matches your evening usage pattern',
    earn: 0.22,
  },
];

// ── Credit ledger (47 fictional entries, deterministic) ──────────────────────
export type LedgerEntry = {
  id: string;
  date: string; // '2 Jul'
  context: string; // the loading moment
  partner: string;
  seconds: number;
  credit: number;
};

const LEDGER_CONTEXTS = [
  'Paying your bill',
  'Refreshing meter data',
  'Comparing plans',
  'Loading usage history',
  'Broadband speed test',
  'Scheduling EV charging',
  'Updating account details',
  'Generating your bill',
];

const LEDGER_PARTNERS = [
  'Ecostore',
  'Mitre 10',
  'Kathmandu',
  'PB Tech',
  'Sistema',
  'Fisher & Paykel',
  'AA Home',
  'Resene',
];

// Fixed, deterministic 47-entry ledger walking back from 2 Jul 2026.
// (No randomness — stable across server/client renders.)
const LEDGER_DAYS = [
  '2 Jul', '2 Jul', '1 Jul', '30 Jun', '29 Jun', '29 Jun', '27 Jun', '26 Jun',
  '25 Jun', '25 Jun', '24 Jun', '23 Jun', '21 Jun', '21 Jun', '20 Jun', '19 Jun',
  '18 Jun', '17 Jun', '17 Jun', '15 Jun', '14 Jun', '13 Jun', '12 Jun', '11 Jun',
  '10 Jun', '9 Jun', '8 Jun', '8 Jun', '6 Jun', '5 Jun', '4 Jun', '3 Jun',
  '2 Jun', '1 Jun', '31 May', '30 May', '29 May', '28 May', '27 May', '26 May',
  '24 May', '23 May', '22 May', '21 May', '20 May', '19 May', '18 May',
];

export const LEDGER: LedgerEntry[] = LEDGER_DAYS.map((date, i) => {
  const credit = [15, 22, 12, 18, 9, 25, 14, 20, 11, 17][i % 10] / 100;
  return {
    id: `ae-${String(47 - i).padStart(3, '0')}`,
    date,
    context: LEDGER_CONTEXTS[i % LEDGER_CONTEXTS.length],
    partner: LEDGER_PARTNERS[(i * 3 + 1) % LEDGER_PARTNERS.length],
    seconds: [4, 6, 3, 5, 4, 8, 5, 6, 3, 5][i % 10],
    credit,
  };
});

export const LEDGER_TOTAL = LEDGER.reduce((s, e) => s + e.credit, 0);

// ── Weekly earn trend (8 weeks, demo) ────────────────────────────────────────
export const WEEKLY_TREND = [
  { week: '11 May', earned: 0.87 },
  { week: '18 May', earned: 1.02 },
  { week: '25 May', earned: 0.64 },
  { week: '1 Jun', earned: 1.18 },
  { week: '8 Jun', earned: 0.92 },
  { week: '15 Jun', earned: 1.31 },
  { week: '22 Jun', earned: 1.05 },
  { week: '29 Jun', earned: 1.24 },
];

// ── Settings defaults (ledger page) ──────────────────────────────────────────
export const SETTINGS = [
  {
    key: 'pause',
    label: 'Pause Assembling',
    detail: 'One tap. Loading moments go back to plain spinners — no offers, no earn.',
    enabled: false,
  },
  {
    key: 'categories',
    label: 'Offer categories',
    detail: 'Home & garden, outdoors, appliances, NZ-made. Untick any category to block it.',
    enabled: true,
  },
  {
    key: 'blocklist',
    label: 'Block a partner',
    detail: 'Never see a specific brand again. Takes effect immediately.',
    enabled: true,
  },
] as const;

// ── Pitch economics (illustrative; scale figures cite public reporting) ──────
export const ECONOMICS = {
  residentialConnections: 600_000, // order-of-magnitude from Contact's public FY reporting
  appSecondsPerMonth: 400, // avg addressable loading time per active app user
  cpmNzd: 45,
  publisherShare: 0.55, // Contact-side share of gross, majority to customer credits
  creditsPerCustomerYearLow: 50,
  creditsPerCustomerYearHigh: 80,
};
