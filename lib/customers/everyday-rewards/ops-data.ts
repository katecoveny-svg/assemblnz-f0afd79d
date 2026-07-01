/**
 * Everyday Rewards × Dash — back-of-house PARTNER OPERATIONS data.
 *
 * The console the Everyday Rewards / Woolworths NZ loyalty, finance and
 * compliance teams would use to RUN a Dash wait-moment attribution partnership:
 * sponsors + tiers, earn scheduling, sponsor-funded points reconciliation, the
 * points-liability treasury, shopper-segment analytics, compliance, comms
 * drafting, and the CDMO daily brief for Sarah Chapman.
 *
 * CONCEPT / DEMO ONLY. Every figure is mocked. No live Everyday Rewards / points
 * systems are touched, no real points are minted, and NO shopper PII — segment
 * analytics are aggregate-only by construction. There is no real partnership;
 * every surface is marked "concept · pending".
 *
 * Currency: Everyday Rewards **points** (native — never "assembl points" or a new
 * currency). 2,000 points → $15 voucher or a travel reward. Ad revenue is NZ$.
 * Economics canon shared with lib/customers/everyday-rewards/config.ts
 * (shopper 55% minted as points · Everyday Rewards 30% · assembl 15%).
 */

export function nzd(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}m`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toFixed(0)}`;
}
export function pts(n: number): string {
  return `${Math.round(n).toLocaleString('en-NZ')} pts`;
}
export function pct(n: number): string {
  return `${(n * 100).toFixed(0)}%`;
}

// ---------------------------------------------------------------------------
// Sponsor tiers — platinum / gold / silver, different attribution + pricing
// ---------------------------------------------------------------------------
export type SponsorTier = 'platinum' | 'gold' | 'silver';

export const SPONSOR_TIERS: Record<
  SponsorTier,
  {
    label: string;
    cpmFloor: number;
    attribution: string;
    waitMoments: string;
    exclusivity: string;
    colour: string;
    perks: string[];
  }
> = {
  platinum: {
    label: 'Platinum',
    cpmFloor: 24,
    attribution: 'First-look + category exclusivity',
    waitMoments: 'All six wait moments incl. checkout-scan',
    exclusivity: 'Full category lock for the window',
    colour: '#22303c',
    perks: ['Category exclusivity', 'Checkout-scan inventory', 'Named on Mana Receipt', 'Quarterly business review'],
  },
  gold: {
    label: 'Gold',
    cpmFloor: 18,
    attribution: 'Priority fill after platinum',
    waitMoments: 'Offers · balance · card · order-status',
    exclusivity: 'Sub-category lock (e.g. yoghurt, not all dairy)',
    colour: '#C79B1F',
    perks: ['Priority fill', 'Segment targeting', 'Named on Mana Receipt', 'Monthly performance pack'],
  },
  silver: {
    label: 'Silver',
    cpmFloor: 12,
    attribution: 'Remnant / unsold fill',
    waitMoments: 'Offers refresh · balance sync',
    exclusivity: 'None — shared category',
    colour: '#8A8678',
    perks: ['Remnant fill', 'Aggregate reporting'],
  },
};

// ---------------------------------------------------------------------------
// Sponsors — brands buying wait-moment attribution (ASB precedent)
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
  windowStart: string;
  windowEnd: string;
  targeting: string;
  accountManager: string;
};

export const SPONSORS: Sponsor[] = [
  {
    id: 'asb', name: 'ASB', category: 'Banking', tier: 'platinum', status: 'live',
    monthlyBudget: 46000, spentThisMonth: 29800, creativeAssets: 8, creativeApproved: 8,
    windowStart: '2026-07-01', windowEnd: '2026-09-30',
    targeting: 'Digital-card load · all clusters · national', accountManager: 'Priya N.',
  },
  {
    id: 'anchor', name: 'Anchor', category: 'Dairy', tier: 'gold', status: 'live',
    monthlyBudget: 30000, spentThisMonth: 21400, creativeAssets: 6, creativeApproved: 6,
    windowStart: '2026-07-01', windowEnd: '2026-10-31',
    targeting: 'Offers refresh · family shoppers (aggregate)', accountManager: 'Marcus T.',
  },
  {
    id: 'whittakers', name: "Whittaker's", category: 'Confectionery', tier: 'gold', status: 'live',
    monthlyBudget: 24000, spentThisMonth: 16200, creativeAssets: 5, creativeApproved: 5,
    windowStart: '2026-07-01', windowEnd: '2026-12-31',
    targeting: 'Balance sync · all clusters', accountManager: 'Marcus T.',
  },
  {
    id: 'sanitarium', name: 'Sanitarium', category: 'Breakfast', tier: 'silver', status: 'live',
    monthlyBudget: 12000, spentThisMonth: 7300, creativeAssets: 4, creativeApproved: 4,
    windowStart: '2026-07-01', windowEnd: '2026-09-30',
    targeting: 'Checkout-scan queue · family cluster (aggregate)', accountManager: 'Marcus T.',
  },
  {
    id: 'airnz', name: 'Air New Zealand', category: 'Travel', tier: 'gold', status: 'onboarding',
    monthlyBudget: 26000, spentThisMonth: 0, creativeAssets: 3, creativeApproved: 1,
    windowStart: '2026-07-15', windowEnd: '2026-10-15',
    targeting: 'Voucher-redemption · travel-reward converters', accountManager: 'Priya N.',
  },
  {
    id: 'uber', name: 'Uber', category: 'Delivery', tier: 'silver', status: 'review',
    monthlyBudget: 9000, spentThisMonth: 0, creativeAssets: 2, creativeApproved: 0,
    windowStart: '2026-08-01', windowEnd: '2026-10-31',
    targeting: 'Order-status tracker · online-shop cluster (aggregate)', accountManager: 'Marcus T.',
  },
];

export function sponsorById(id: string) {
  return SPONSORS.find((s) => s.id === id);
}

// ---------------------------------------------------------------------------
// Category exclusion rules — protect Woolworths own-brand + tier exclusivity
// ---------------------------------------------------------------------------
export const EXCLUSION_RULES: { rule: string; detail: string }[] = [
  {
    rule: 'No competing dairy sponsor vs Woolworths Milk',
    detail: 'Anchor holds the dairy slot on offers-refresh; no second dairy sponsor while own-brand milk is on promotion.',
  },
  {
    rule: 'One bank at platinum',
    detail: 'ASB holds banking category exclusivity on digital-card load. Other banks confined to remnant silver, non-card moments.',
  },
  {
    rule: 'Travel exclusivity on voucher-redemption',
    detail: 'Air New Zealand (travel-reward partner) gets first-look on the redemption moment; no competing travel brand in-window.',
  },
  {
    rule: 'No sponsor creative on age-restricted categories',
    detail: 'Alcohol, tobacco and gambling excluded from all wait moments regardless of tier (Sale & Supply of Alcohol Act).',
  },
];

// ---------------------------------------------------------------------------
// Campaign scheduler — sponsor × wait moment × cluster/day
// ---------------------------------------------------------------------------
export type Campaign = {
  id: string;
  sponsorId: string;
  waitMoment: string;
  cluster: string;
  days: string;
  cpm: number; // NZ$ per 1,000 sponsored moments
  dailyCap: number;
  status: 'scheduled' | 'running' | 'ended' | 'draft';
};

export const CAMPAIGNS: Campaign[] = [
  { id: 'c1', sponsorId: 'asb', waitMoment: 'Digital card load', cluster: 'All clusters', days: 'Daily', cpm: 24, dailyCap: 90000, status: 'running' },
  { id: 'c2', sponsorId: 'asb', waitMoment: 'Points balance sync', cluster: 'All clusters', days: 'Daily', cpm: 22, dailyCap: 70000, status: 'running' },
  { id: 'c3', sponsorId: 'anchor', waitMoment: 'Offers refresh', cluster: 'Family shoppers', days: 'Mon–Sun', cpm: 19, dailyCap: 120000, status: 'running' },
  { id: 'c4', sponsorId: 'whittakers', waitMoment: 'Points balance sync', cluster: 'All clusters', days: 'Thu–Sun', cpm: 18, dailyCap: 60000, status: 'running' },
  { id: 'c5', sponsorId: 'sanitarium', waitMoment: 'Checkout scan companion', cluster: 'Family shoppers', days: 'Daily', cpm: 16, dailyCap: 50000, status: 'running' },
  { id: 'c6', sponsorId: 'airnz', waitMoment: 'Voucher redemption', cluster: 'Travel-reward converters', days: 'Fri–Mon', cpm: 22, dailyCap: 30000, status: 'scheduled' },
  { id: 'c7', sponsorId: 'uber', waitMoment: 'Order status', cluster: 'Online-shop cluster', days: 'Sat–Sun', cpm: 14, dailyCap: 25000, status: 'draft' },
];

export function campaignsForSponsor(id: string) {
  return CAMPAIGNS.filter((c) => c.sponsorId === id);
}

// ---------------------------------------------------------------------------
// Revenue split + points liability
// Canon: shopper 55% (minted as points), Everyday Rewards 30%, assembl 15%.
// Points are minted at 100 points = NZ$0.75 (i.e. 2,000 pts = $15 voucher).
// ---------------------------------------------------------------------------
export const POINT_VALUE_NZD = 15 / 2000; // $0.0075 per point

export const REVENUE_MTD = {
  grossAdRevenue: 214_600, // NZ$ month to date
  fillRate: 0.35,
  sponsoredMoments: 11_920_000,
};

export function revenueSplit(gross: number) {
  const toShopper = gross * 0.55; // minted to shoppers as points
  const toEdr = gross * 0.3; // Everyday Rewards / Woolworths retained
  const toAssembl = gross * 0.15; // attribution engine + fill
  const pointsMinted = toShopper / POINT_VALUE_NZD;
  return { gross, toShopper, toEdr, toAssembl, pointsMinted };
}

export const REVENUE_TREND = [
  { month: 'Feb', gross: 88_000 },
  { month: 'Mar', gross: 121_000 },
  { month: 'Apr', gross: 154_000 },
  { month: 'May', gross: 178_000 },
  { month: 'Jun', gross: 199_000 },
  { month: 'Jul', gross: 214_600 },
];
export const REVENUE_FORECAST_JUL = 205_000;

// ---------------------------------------------------------------------------
// Sponsor-funded points reconciliation — which sponsor funded which batch
// ---------------------------------------------------------------------------
export type PointsBatch = {
  id: string;
  date: string;
  sponsor: string;
  waitMoment: string;
  moments: number;
  pointsMinted: number;
  fundedNzd: number;
  status: 'reconciled' | 'pending';
};

export const POINTS_BATCHES: PointsBatch[] = [
  { id: 'b-0714-asb', date: '14 Jul', sponsor: 'ASB', waitMoment: 'Digital card load', moments: 88400, pointsMinted: 442000, fundedNzd: 3315, status: 'reconciled' },
  { id: 'b-0714-anc', date: '14 Jul', sponsor: 'Anchor', waitMoment: 'Offers refresh', moments: 116200, pointsMinted: 464800, fundedNzd: 3486, status: 'reconciled' },
  { id: 'b-0714-whi', date: '14 Jul', sponsor: "Whittaker's", waitMoment: 'Balance sync', moments: 54100, pointsMinted: 216400, fundedNzd: 1623, status: 'reconciled' },
  { id: 'b-0714-san', date: '14 Jul', sponsor: 'Sanitarium', waitMoment: 'Checkout scan', moments: 41800, pointsMinted: 250800, fundedNzd: 1881, status: 'pending' },
];

export const RECON = {
  status: 'balanced' as 'balanced' | 'variance',
  pointsMintedMtd: 15_730_000,
  treasuryFundedMtd: 15_730_000,
  variancePts: 0,
  unreconciledMoments: 41_800,
  lastReconciled: 'today · 06:00 NZT',
};

// ---------------------------------------------------------------------------
// Points liability treasury — breakage + redemption forecasting
// ---------------------------------------------------------------------------
export const LIABILITY = {
  outstandingPoints: 486_200_000, // total unredeemed points across the base
  breakageRate: 0.14, // share expected never to redeem
  redeemVoucherShare: 0.71, // of redeemers, share taking $15 voucher
  redeemTravelShare: 0.29, // share converting to travel reward
  monthlyMintPts: 15_730_000,
  monthlyRedeemPts: 12_940_000,
};

export function liabilityModel(outstandingPoints: number, breakage: number) {
  const expectedRedeem = outstandingPoints * (1 - breakage);
  const liabilityNzd = expectedRedeem * POINT_VALUE_NZD;
  const breakageGainNzd = outstandingPoints * breakage * POINT_VALUE_NZD;
  return { expectedRedeem, liabilityNzd, breakageGainNzd };
}

export const REDEMPTION_FORECAST = [
  { month: 'Jul', voucher: 71000, travel: 29000 },
  { month: 'Aug', voucher: 76000, travel: 33000 },
  { month: 'Sep', voucher: 80000, travel: 38000 },
  { month: 'Oct', voucher: 83000, travel: 41000 },
];

// ---------------------------------------------------------------------------
// Shopper-segment analytics — aggregate only, no individual PII
// ---------------------------------------------------------------------------
export const SEGMENT_NOTE =
  'Aggregate cohorts only — minimum bucket size 1,000 shoppers. No individual records, no PII, no cross-session identifiers. Privacy Act 2020 compliant by construction; targeting never uses shopper identity.';

export type Segment = {
  cluster: string;
  share: number; // of base
  earnRatePtsWk: number; // avg wait-moment points earned / week
  optIn: number;
  voucherConv: number; // of redeemers → voucher
  travelConv: number; // of redeemers → travel
};

export const SEGMENTS: Segment[] = [
  { cluster: 'Family shoppers', share: 0.38, earnRatePtsWk: 46, optIn: 0.63, voucherConv: 0.82, travelConv: 0.18 },
  { cluster: 'Singles / flatmates', share: 0.27, earnRatePtsWk: 31, optIn: 0.58, voucherConv: 0.64, travelConv: 0.36 },
  { cluster: 'Seniors', share: 0.19, earnRatePtsWk: 38, optIn: 0.71, voucherConv: 0.89, travelConv: 0.11 },
  { cluster: 'Students', share: 0.09, earnRatePtsWk: 24, optIn: 0.49, voucherConv: 0.55, travelConv: 0.45 },
  { cluster: 'Online-shop cluster', share: 0.07, earnRatePtsWk: 52, optIn: 0.66, voucherConv: 0.7, travelConv: 0.3 },
];

export const EARN_BY_MOMENT = [
  { moment: 'Offers refresh', pts: 8, sharePctFill: 0.41 },
  { moment: 'Balance sync', pts: 6, sharePctFill: 0.33 },
  { moment: 'Checkout scan', pts: 12, sharePctFill: 0.52 },
  { moment: 'Card load', pts: 5, sharePctFill: 0.38 },
  { moment: 'Voucher redeem', pts: 10, sharePctFill: 0.27 },
  { moment: 'Order status', pts: 9, sharePctFill: 0.3 },
];

// ---------------------------------------------------------------------------
// Compliance — Fair Trading Act + ASA (Advertising Standards) + Privacy Act
// 2020 (IPP 3A automated-decision notice)
// ---------------------------------------------------------------------------
export type ComplianceCheck = {
  touchpoint: string;
  sponsor: string;
  ipp3aNotice: 'shown' | 'pending';
  fairTrading: 'pass' | 'flag' | 'review';
  asa: 'pass' | 'flag' | 'review';
  note: string;
};

export const COMPLIANCE_CHECKS: ComplianceCheck[] = [
  { touchpoint: 'Card load · ASB', sponsor: 'ASB', ipp3aNotice: 'shown', fairTrading: 'pass', asa: 'pass', note: 'Rate claim substantiated; representative example present.' },
  { touchpoint: 'Offers · Anchor', sponsor: 'Anchor', ipp3aNotice: 'shown', fairTrading: 'pass', asa: 'pass', note: 'Price shown incl. GST; no comparative claims.' },
  { touchpoint: 'Balance · Whittaker’s', sponsor: "Whittaker's", ipp3aNotice: 'shown', fairTrading: 'pass', asa: 'pass', note: 'Clear sponsor identification; offer T&Cs linked.' },
  { touchpoint: 'Checkout · Sanitarium', sponsor: 'Sanitarium', ipp3aNotice: 'shown', fairTrading: 'pass', asa: 'review', note: 'Health-benefit wording under ASA Food & Beverage code review.' },
  { touchpoint: 'Redemption · Air NZ', sponsor: 'Air New Zealand', ipp3aNotice: 'pending', fairTrading: 'review', asa: 'review', note: 'Travel-reward conversion terms + "from" pricing need substantiation before go-live.' },
  { touchpoint: 'Order status · Uber', sponsor: 'Uber', ipp3aNotice: 'pending', fairTrading: 'flag', asa: 'flag', note: '"Fastest delivery" claim needs Commerce Commission-grade substantiation or removal.' },
];

export const IPP3A_NOTICE =
  'This moment uses automated decision-making to choose which sponsored earn you see, based on aggregate shopping context — never on your identity or personal history. You can opt out in Everyday Rewards settings. (Privacy Act 2020, IPP 3A.)';

// ---------------------------------------------------------------------------
// Comms drafting — partner updates, shopper newsletter, EDR blog
// ---------------------------------------------------------------------------
export type CommsTemplate = {
  id: string;
  kind: 'Sponsor AM' | 'Shopper newsletter' | 'Blog post' | 'Board snippet';
  title: string;
  audience: string;
  body: string;
};

export const COMMS_TEMPLATES: CommsTemplate[] = [
  {
    id: 'sponsor-am',
    kind: 'Sponsor AM',
    title: 'ASB — monthly performance note',
    audience: 'ASB account manager',
    body: `Kia ora,\n\nASB on Everyday Rewards — month to date:\n• Spend $29,800 of $46,000 budget (65%).\n• 3.9M sponsored moments across digital-card load and balance sync, effective CPM $22–24.\n• Banking category exclusivity held on the card-load moment; no competing bank in-window.\n• Fair Trading + ASA review: all eight assets passed; rate-claim substantiation on file.\n\nHappy to walk the cluster-level breakdown at the QBR. Checkout-scan inventory opens in August if you'd like first look.\n\nNgā mihi`,
  },
  {
    id: 'shopper-newsletter',
    kind: 'Shopper newsletter',
    title: 'New ways to earn — a little back for the little waits',
    audience: 'Everyday Rewards members',
    body: `Kia ora,\n\nGood news for the everyday moments: you can now earn a few points in the small waits inside the app — when your offers load, your balance syncs, or you're in the checkout queue. Nothing to sit through, nothing to click. The points land straight in your balance and redeem the way they always have — 2,000 points for a $15 voucher, or convert to a travel reward.\n\nIt's brought to you by our partners, and you're always in control — you can opt out any time in settings.\n\nHappy earning,\nEveryday Rewards`,
  },
  {
    id: 'blog-post',
    kind: 'Blog post',
    title: 'Blog: Turning the small waits into points you can use',
    audience: 'everydayrewards.co.nz/blog',
    body: `Every app has its small waits — a spinner while offers load, a moment at the checkout. We asked a simple question: what if those seconds gave a little back?\n\nWorking with assembl, we've started turning select wait moments into a new way to earn. A partner sponsors the moment; you earn points for the wait. It all flows to the same balance you already have, and redeems the same way — a $15 voucher at 2,000 points, or a travel reward.\n\nNo new currency. No extra taps. Just a bit more value in the time you already spend with us — and you can opt out whenever you like.`,
  },
  {
    id: 'board-snippet',
    kind: 'Board snippet',
    title: 'Board report — Loyalty innovation (Dash wait-moment pilot)',
    audience: 'Woolworths NZ Board pack',
    body: `Dash pilot (compensated-wait loyalty): live across six in-app wait moments. Month-to-date gross of $214.6k in sponsored attribution, with 55% credited to members as points ($118k value) and 30% retained by Everyday Rewards. Points liability is managed within the existing treasury; breakage tracking on file. Targeting is aggregate-cohort only and IPP 3A-noticed — no shopper PII is used. Recommend proceeding to a full-base rollout decision in Q4.`,
  },
];

// ---------------------------------------------------------------------------
// CDMO daily brief — Sarah Chapman
// ---------------------------------------------------------------------------
export const CDMO_BRIEF = {
  for: 'Sarah Chapman — Chief Digital & Marketing Officer, Woolworths NZ',
  date: 'Overnight to 06:00 NZT',
  headline: 'Revenue 4.7% ahead of forecast; three compliance items open, none blocking live inventory.',
  overnight: [
    '$7,940 gross booked overnight across offers-refresh + card-load (ASB, Anchor).',
    'Fill rate held at 35%; checkout-scan inventory sold out on the Fri evening peak.',
    'Points credited overnight: 1.62M to 33,400 members.',
  ],
  upcoming: [
    'Air New Zealand redemption campaign scheduled 15 Jul — pending travel-terms substantiation.',
    'Whittaker’s checkout-scan first-look opens Friday.',
    'ASB QBR booked month-end; checkout-scan first-look on the table.',
  ],
  revenueVsForecast: { mtd: 214600, forecast: 205000, deltaPct: 4.7 },
  complianceFlags: [
    'Uber "fastest delivery" claim — needs substantiation or removal before go-live.',
    'Air NZ travel-reward conversion terms — Fair Trading + ASA review before 15 Jul.',
    'Sanitarium health-benefit wording — ASA Food & Beverage code review.',
  ],
  loyalty: 'Points treasury reconciliation balanced overnight — zero variance; one Sanitarium batch (250.8k pts) pending funding confirmation.',
};
