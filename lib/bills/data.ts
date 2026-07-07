/**
 * Assembl Bills — demo sample data.
 *
 * Everything here is SAMPLE data for a fictional NZ household ("the Harding
 * whānau", Kohimarama). No real person, inbox or bank feed — same rule as the
 * Echo dashboard. Provider brand names (Mercury, Spark, AMI, One NZ, Contact,
 * Netflix, Adobe, Auckland Council…) are real NZ companies used here as public
 * information in a concept demo.
 *
 * Pricing shown for alternatives is INDICATIVE only — the demo never asserts a
 * specific live rate as fact. Every savings figure carries a source note
 * (Powerswitch / Consumer NZ / provider site) and a "verify" framing. Assembl
 * Bills recommends; the household switches (SPARK-style empower-not-replace).
 */

export type Category =
  | 'Electricity'
  | 'Broadband'
  | 'Insurance'
  | 'Council'
  | 'Subscriptions'
  | 'Mobile'
  | 'Gas';

export const CATEGORY_ORDER: Category[] = [
  'Electricity',
  'Broadband',
  'Insurance',
  'Council',
  'Subscriptions',
  'Mobile',
  'Gas',
];

// ── Household headline stats ────────────────────────────────────────────────
export const household = {
  name: 'the Harding whānau',
  suburb: 'Kohimarama, Tāmaki Makaurau',
  billsTracked: 11,
};

export type Stat = {
  key: string;
  label: string;
  value: string;
  sub: string;
  tone: 'neutral' | 'good' | 'cost';
};

export const stats: Stat[] = [
  { key: 'monthly', label: 'Monthly bills', value: '$1,684', sub: 'across 11 tracked bills', tone: 'neutral' },
  { key: 'annual', label: 'Annual cost', value: '$20,208', sub: 'projected on current plans', tone: 'neutral' },
  { key: 'savings', label: 'Savings found', value: '$2,055', sub: 'per year, across 6 alternatives', tone: 'good' },
  { key: 'hidden', label: 'Hidden costs', value: '$2,157', sub: 'per year, flagged for review', tone: 'cost' },
  { key: 'tracked', label: 'Bills tracked', value: '11', sub: 'email + upload + bank', tone: 'neutral' },
];

// ── 7-month spend trend (for the area/line chart) ───────────────────────────
export type TrendPoint = { month: string; spend: number; power: number };
export const spendTrend: TrendPoint[] = [
  { month: 'Jan', spend: 1498, power: 286 },
  { month: 'Feb', spend: 1472, power: 274 },
  { month: 'Mar', spend: 1531, power: 312 },
  { month: 'Apr', spend: 1605, power: 358 },
  { month: 'May', spend: 1662, power: 402 },
  { month: 'Jun', spend: 1710, power: 448 },
  { month: 'Jul', spend: 1684, power: 431 },
];

// ── Category split (donut) ──────────────────────────────────────────────────
export type CategorySlice = { category: Category; amount: number };
export const categorySplit: CategorySlice[] = [
  { category: 'Electricity', amount: 431 },
  { category: 'Broadband', amount: 89 },
  { category: 'Insurance', amount: 348 },
  { category: 'Council', amount: 298 },
  { category: 'Subscriptions', amount: 96 },
  { category: 'Mobile', amount: 130 },
  { category: 'Gas', amount: 62 },
];

// ── The 8 tracked bills (Bills tab) ─────────────────────────────────────────
export type Bill = {
  id: string;
  provider: string;
  category: Category;
  plan: string;
  amount: number;
  cycle: 'monthly' | 'quarterly' | 'annual';
  due: string; // ISO date
  source: 'Email' | 'Upload' | 'Bank';
  status: 'Paid' | 'Due soon' | 'Upcoming';
  trend?: 'up' | 'down' | 'flat';
  trendNote?: string;
};

export const bills: Bill[] = [
  {
    id: 'mercury',
    provider: 'Mercury Energy',
    category: 'Electricity',
    plan: 'Open Term · anytime',
    amount: 431,
    cycle: 'monthly',
    due: '2026-07-18',
    source: 'Email',
    status: 'Due soon',
    trend: 'up',
    trendNote: 'Up 18% vs last winter',
  },
  {
    id: 'spark',
    provider: 'Spark',
    category: 'Broadband',
    plan: 'Unlimited Fibre 300',
    amount: 89,
    cycle: 'monthly',
    due: '2026-07-22',
    source: 'Email',
    status: 'Upcoming',
    trend: 'up',
    trendNote: 'Promo ended — up $20/mo',
  },
  {
    id: 'ami',
    provider: 'AMI Insurance',
    category: 'Insurance',
    plan: 'Home & Contents',
    amount: 208,
    cycle: 'monthly',
    due: '2026-07-28',
    source: 'Upload',
    status: 'Upcoming',
    trend: 'up',
    trendNote: 'Renewal up 14%',
  },
  {
    id: 'onenz',
    provider: 'One NZ',
    category: 'Mobile',
    plan: 'Family — 3 lines',
    amount: 130,
    cycle: 'monthly',
    due: '2026-07-15',
    source: 'Email',
    status: 'Due soon',
    trend: 'flat',
  },
  {
    id: 'council',
    provider: 'Auckland Council',
    category: 'Council',
    plan: 'Rates — residential',
    amount: 894,
    cycle: 'quarterly',
    due: '2026-08-31',
    source: 'Upload',
    status: 'Upcoming',
    trend: 'up',
    trendNote: 'Rates rising ~15% this year',
  },
  {
    id: 'adobe',
    provider: 'Adobe',
    category: 'Subscriptions',
    plan: 'Creative Cloud — All Apps',
    amount: 96,
    cycle: 'monthly',
    due: '2026-07-19',
    source: 'Bank',
    status: 'Upcoming',
    trend: 'flat',
  },
  {
    id: 'netflix',
    provider: 'Netflix',
    category: 'Subscriptions',
    plan: 'Premium 4K',
    amount: 26,
    cycle: 'monthly',
    due: '2026-07-24',
    source: 'Bank',
    status: 'Upcoming',
    trend: 'up',
    trendNote: 'Up $3 at last price review',
  },
  {
    id: 'contact',
    provider: 'Contact Energy',
    category: 'Gas',
    plan: 'Natural gas — supply',
    amount: 62,
    cycle: 'monthly',
    due: '2026-07-20',
    source: 'Email',
    status: 'Upcoming',
    trend: 'flat',
  },
];

// ── Bank tab: parser support + recurring detection + transaction log ─────────
export type BankFormat = { bank: string; short: string; status: 'Detected' | 'Ready' };
export const bankFormats: BankFormat[] = [
  { bank: 'ANZ', short: 'ANZ', status: 'Ready' },
  { bank: 'ASB', short: 'ASB', status: 'Ready' },
  { bank: 'BNZ', short: 'BNZ', status: 'Ready' },
  { bank: 'Westpac', short: 'Westpac', status: 'Ready' },
  { bank: 'Kiwibank', short: 'Kiwibank', status: 'Ready' },
];

export type RecurringCharge = {
  merchant: string;
  category: Category;
  amount: number;
  cadence: string;
  note: string;
};
export const recurringCharges: RecurringCharge[] = [
  { merchant: 'Sky Sport Now', category: 'Subscriptions', amount: 39.99, cadence: 'monthly', note: 'No usage detected in 3 months' },
  { merchant: 'Anytime Fitness — Ōrākei', category: 'Subscriptions', amount: 27.6, cadence: 'fortnightly', note: 'Last swipe 68 days ago' },
  { merchant: 'Spotify Premium', category: 'Subscriptions', amount: 17.99, cadence: 'monthly', note: 'Duplicate — also on family plan' },
  { merchant: 'Mercury Energy', category: 'Electricity', amount: 431, cadence: 'monthly', note: 'Matched to emailed bill' },
  { merchant: 'AMI Insurance', category: 'Insurance', amount: 208, cadence: 'monthly', note: 'Matched to uploaded PDF' },
];

export type Transaction = { date: string; merchant: string; category: Category; amount: number };
export const transactions: Transaction[] = [
  { date: '2026-07-06', merchant: 'Mercury Energy', category: 'Electricity', amount: 431.0 },
  { date: '2026-07-05', merchant: 'Sky Sport Now', category: 'Subscriptions', amount: 39.99 },
  { date: '2026-07-04', merchant: 'One NZ', category: 'Mobile', amount: 130.0 },
  { date: '2026-07-03', merchant: 'Spotify Premium', category: 'Subscriptions', amount: 17.99 },
  { date: '2026-07-02', merchant: 'Contact Energy — Gas', category: 'Gas', amount: 62.0 },
  { date: '2026-07-01', merchant: 'AMI Insurance', category: 'Insurance', amount: 208.0 },
  { date: '2026-06-30', merchant: 'Anytime Fitness', category: 'Subscriptions', amount: 27.6 },
  { date: '2026-06-29', merchant: 'Netflix', category: 'Subscriptions', amount: 26.0 },
  { date: '2026-06-28', merchant: 'Spark Broadband', category: 'Broadband', amount: 89.0 },
  { date: '2026-06-27', merchant: 'Adobe', category: 'Subscriptions', amount: 96.0 },
];

// ── Savings tab: $2,055/yr across 6 alternatives ────────────────────────────
export type Saving = {
  id: string;
  billId: string;
  fromProvider: string;
  toProvider: string;
  toPlan: string;
  category: Category;
  annualSaving: number;
  source: string; // where the comparison comes from
  note: string;
};

export const savings: Saving[] = [
  {
    id: 's-power',
    billId: 'mercury',
    fromProvider: 'Mercury Energy — Open Term',
    toProvider: 'Electric Kiwi',
    toPlan: 'MoveMaster',
    category: 'Electricity',
    annualSaving: 622,
    source: 'Powerswitch (Consumer NZ) — indicative for this usage',
    note: 'Free off-peak "Hour of Power" suits your evening load. Verify on Powerswitch.',
  },
  {
    id: 's-broadband',
    billId: 'spark',
    fromProvider: 'Spark — Fibre 300',
    toProvider: '2degrees',
    toPlan: 'Fibre Classic',
    category: 'Broadband',
    annualSaving: 240,
    source: 'Provider list pricing — indicative',
    note: 'Same 300/100 speed tier, $20/mo lower list price. Check current promos.',
  },
  {
    id: 's-insurance',
    billId: 'ami',
    fromProvider: 'AMI — Home & Contents',
    toProvider: 'Tower',
    toPlan: 'Home + Contents',
    category: 'Insurance',
    annualSaving: 384,
    source: 'Consumer NZ insurance comparison — indicative',
    note: 'Like-for-like sum insured. Confirm excess and cover details before switching.',
  },
  {
    id: 's-mobile',
    billId: 'onenz',
    fromProvider: 'One NZ — Family 3 lines',
    toProvider: 'Kogan Mobile',
    toPlan: '3 × Large',
    category: 'Mobile',
    annualSaving: 456,
    source: 'Provider list pricing — indicative',
    note: 'Same data allowance per line on the One NZ network. Verify coverage.',
  },
  {
    id: 's-gas',
    billId: 'contact',
    fromProvider: 'Contact — natural gas',
    toProvider: 'Genesis Energy',
    toPlan: 'Dual fuel bundle',
    category: 'Gas',
    annualSaving: 168,
    source: 'Powerswitch (Consumer NZ) — indicative',
    note: 'Dual-fuel discount if you move power + gas together. Model both together.',
  },
  {
    id: 's-subs',
    billId: 'adobe',
    fromProvider: 'Adobe — All Apps',
    toProvider: 'Adobe',
    toPlan: 'Photography plan',
    category: 'Subscriptions',
    annualSaving: 185,
    source: 'Adobe published pricing',
    note: 'Only Lightroom + Photoshop show usage — the full suite may be more than you need.',
  },
];

export const savingsTotal = savings.reduce((n, s) => n + s.annualSaving, 0); // 2055

// ── Alerts tab: 6 typed alerts ──────────────────────────────────────────────
export type AlertType =
  | 'savings'
  | 'loyalty-trap'
  | 'subsidy'
  | 'mortgage-refix'
  | 'price-increase'
  | 'hidden-cost';

export type Alert = {
  id: string;
  type: AlertType;
  title: string;
  body: string;
  amount?: string;
  source?: string;
  cta: string;
};

export const alerts: Alert[] = [
  {
    id: 'a-savings',
    type: 'savings',
    title: 'Cheaper power plan for your address',
    body: 'A challenger retailer matches your evening-heavy usage for an estimated $622/year less than your Mercury Open Term plan.',
    amount: '$622 / yr',
    source: 'Powerswitch (Consumer NZ)',
    cta: 'Review switch',
  },
  {
    id: 'a-loyalty',
    type: 'loyalty-trap',
    title: 'Loyalty credit is costing you more than it saves',
    body: 'Your current plan carries a conditional annual credit that locks you in. Even after forfeiting it, switching nets an estimated $430/year saving.',
    amount: 'net +$430 / yr',
    source: 'Consumer NZ Energy Task Force',
    cta: 'See the maths',
  },
  {
    id: 'a-subsidy',
    type: 'subsidy',
    title: 'You may qualify for Warmer Kiwi Homes',
    body: 'Based on your area and dwelling, you could be eligible for a grant covering up to 80% of heat-pump or insulation costs — a one-off cut to your winter power bills.',
    amount: 'up to 80% funded',
    source: 'EECA — Warmer Kiwi Homes',
    cta: 'Check eligibility',
  },
  {
    id: 'a-refix',
    type: 'mortgage-refix',
    title: 'Your mortgage refixes in 54 days',
    body: 'A fixed rate ending soon is a high-value moment. We can line up current advertised rates from all NZ banks so you walk into the conversation prepared.',
    amount: '54 days',
    source: 'interest.co.nz rate table',
    cta: 'Compare rates',
  },
  {
    id: 'a-price',
    type: 'price-increase',
    title: 'Netflix raised your plan by $3',
    body: 'Your Premium 4K plan went up at the last price review. Standard with ads or a shared plan would hold your spend flat.',
    amount: '+$36 / yr',
    source: 'Netflix billing history',
    cta: 'Review options',
  },
  {
    id: 'a-hidden',
    type: 'hidden-cost',
    title: 'Sky Sport Now — no usage in 3 months',
    body: 'A $39.99/month charge with no detected sign-in since April. Pausing or cancelling stops the bleed with no change to anything you use.',
    amount: '$480 / yr',
    source: 'Bank transaction pattern',
    cta: 'Queue cancellation',
  },
];

// ── Hidden Costs tab: $2,157/yr detected ────────────────────────────────────
export type HiddenCost = {
  id: string;
  name: string;
  category: Category | 'KiwiSaver' | 'ACC';
  annual: number;
  detail: string;
  action: string; // NZ-specific action note
};

export const hiddenCosts: HiddenCost[] = [
  {
    id: 'h-sky',
    name: 'Sky Sport Now',
    category: 'Subscriptions',
    annual: 480,
    detail: 'No sign-in detected in 3 months. Charged monthly at $39.99.',
    action: 'Pause in-season only, or cancel — Sky Sport Now has no fixed term.',
  },
  {
    id: 'h-gym',
    name: 'Anytime Fitness — Ōrākei',
    category: 'Subscriptions',
    annual: 718,
    detail: 'Last swipe 68 days ago. Fortnightly direct debit still running.',
    action: 'NZ gyms need written cancellation notice — we can draft it for you to send.',
  },
  {
    id: 'h-spotify',
    name: 'Spotify — duplicate',
    category: 'Subscriptions',
    annual: 216,
    detail: 'An individual plan running alongside your family plan. Same account listens on both.',
    action: 'Cancel the individual plan; keep the family plan everyone uses.',
  },
  {
    id: 'h-acc',
    name: 'ACC earners’ levy — overpayment',
    category: 'ACC',
    annual: 312,
    detail: 'Levy applied on income above the annual maximum on one PAYE source.',
    action: 'Claim a refund from ACC for levy paid over the maximum leviable earnings.',
  },
  {
    id: 'h-kiwisaver',
    name: 'KiwiSaver — high fund fees',
    category: 'KiwiSaver',
    annual: 431,
    detail: 'Your fund’s total fees sit well above a comparable low-cost balanced fund.',
    action: 'Compare on Sorted’s KiwiSaver Fund Finder before switching provider or fund.',
  },
];

export const hiddenCostsTotal = hiddenCosts.reduce((n, h) => n + h.annual, 0); // 2157

// ── Provider DB tab: 14 plans (electricity 7, broadband 4, insurance 3) ─────
export type Plan = {
  id: string;
  provider: string;
  planName: string;
  category: Category;
  indicativeMonthly: string; // framed as indicative, never asserted as live fact
  features: string[];
  link: string;
  linkLabel: string;
};

export const providerPlans: Plan[] = [
  // Electricity (7)
  { id: 'p-ek', provider: 'Electric Kiwi', planName: 'MoveMaster', category: 'Electricity', indicativeMonthly: '~$360', features: ['Free Hour of Power off-peak', 'No fixed term', 'Prompt-pay pricing'], link: 'https://www.electrickiwi.co.nz/', linkLabel: 'electrickiwi.co.nz' },
  { id: 'p-contact-e', provider: 'Contact Energy', planName: 'Broadband + Power', category: 'Electricity', indicativeMonthly: '~$395', features: ['Dual-fuel + broadband bundle', 'Rewards for prompt payment', 'Online account'], link: 'https://contact.co.nz/', linkLabel: 'contact.co.nz' },
  { id: 'p-genesis', provider: 'Genesis Energy', planName: 'Energy Plus', category: 'Electricity', indicativeMonthly: '~$405', features: ['Power + gas dual fuel', 'Fixed-term rate certainty', 'Fly Buys'], link: 'https://www.genesisenergy.co.nz/', linkLabel: 'genesisenergy.co.nz' },
  { id: 'p-meridian', provider: 'Meridian Energy', planName: '100% renewable', category: 'Electricity', indicativeMonthly: '~$412', features: ['100% renewable generation', 'Weekend free-power options', 'EV plans'], link: 'https://www.meridianenergy.co.nz/', linkLabel: 'meridianenergy.co.nz' },
  { id: 'p-flick', provider: 'Flick Electric', planName: 'Flat', category: 'Electricity', indicativeMonthly: '~$418', features: ['Flat rate simplicity', 'Wholesale option available', 'Carbon-neutral'], link: 'https://www.flickelectric.co.nz/', linkLabel: 'flickelectric.co.nz' },
  { id: 'p-frank', provider: 'Frank Energy', planName: 'Simple', category: 'Electricity', indicativeMonthly: '~$408', features: ['No-frills low rate', 'No fixed term', 'Paperless'], link: 'https://www.frankenergy.co.nz/', linkLabel: 'frankenergy.co.nz' },
  { id: 'p-mercury', provider: 'Mercury Energy', planName: 'Open Term (current)', category: 'Electricity', indicativeMonthly: '~$431', features: ['Anytime rate', 'Airpoints options', 'Your current plan'], link: 'https://www.mercury.co.nz/', linkLabel: 'mercury.co.nz' },

  // Broadband (4)
  { id: 'p-2deg', provider: '2degrees', planName: 'Fibre Classic 300', category: 'Broadband', indicativeMonthly: '~$75', features: ['300/100 fibre', 'No term option', 'Bundle with mobile'], link: 'https://www.2degrees.nz/', linkLabel: '2degrees.nz' },
  { id: 'p-quic', provider: 'Quic', planName: 'Fibre 300', category: 'Broadband', indicativeMonthly: '~$77', features: ['NZ-owned', 'No contract', 'Static IP add-on'], link: 'https://quic.nz/', linkLabel: 'quic.nz' },
  { id: 'p-now', provider: 'NOW', planName: 'Fibre Unlimited', category: 'Broadband', indicativeMonthly: '~$85', features: ['NZ-based support', 'Fixed price promise', 'Business plans'], link: 'https://www.now.co.nz/', linkLabel: 'now.co.nz' },
  { id: 'p-spark-b', provider: 'Spark', planName: 'Unlimited Fibre 300 (current)', category: 'Broadband', indicativeMonthly: '~$89', features: ['300/100 fibre', 'Spark app', 'Your current plan'], link: 'https://www.spark.co.nz/', linkLabel: 'spark.co.nz' },

  // Insurance (3)
  { id: 'p-tower', provider: 'Tower', planName: 'Home + Contents', category: 'Insurance', indicativeMonthly: '~$176', features: ['Online quote + manage', 'Multi-policy discount', 'Risk-based pricing'], link: 'https://www.tower.co.nz/', linkLabel: 'tower.co.nz' },
  { id: 'p-state', provider: 'State', planName: 'Home & Contents', category: 'Insurance', indicativeMonthly: '~$192', features: ['Bundle discount', 'AA member offers', '24/7 claims'], link: 'https://www.state.co.nz/', linkLabel: 'state.co.nz' },
  { id: 'p-ami', provider: 'AMI', planName: 'Home & Contents (current)', category: 'Insurance', indicativeMonthly: '~$208', features: ['Branch network', 'Multi-policy discount', 'Your current policy'], link: 'https://www.ami.co.nz/', linkLabel: 'ami.co.nz' },
];

export const PROVIDER_PRICING_DISCLAIMER =
  'Indicative pricing only, for a household with this usage profile. Not a live quote. Always confirm current rates on the provider’s site or Powerswitch (powerswitch.org.nz, run by Consumer NZ) before switching.';

// ── Connections tab: email + provider detection ─────────────────────────────
export type EmailProvider = { id: string; name: string; note: string };
export const emailProviders: EmailProvider[] = [
  { id: 'gmail', name: 'Gmail', note: 'Reads bill PDFs + email bodies (provider, amount, due date)' },
  { id: 'outlook', name: 'Outlook', note: 'Same parsing, for Microsoft 365 / Outlook.com' },
];

export type DetectedProvider = { name: string; category: Category; detected: boolean };
export const detectedProviders: DetectedProvider[] = [
  { name: 'Mercury Energy', category: 'Electricity', detected: true },
  { name: 'Spark', category: 'Broadband', detected: true },
  { name: 'AMI Insurance', category: 'Insurance', detected: true },
  { name: 'One NZ', category: 'Mobile', detected: true },
  { name: 'Auckland Council', category: 'Council', detected: true },
  { name: 'Contact Energy', category: 'Gas', detected: true },
  { name: 'Netflix', category: 'Subscriptions', detected: true },
  { name: 'Adobe', category: 'Subscriptions', detected: true },
];

// ── Market research claims (cited on the landing + overview) ─────────────────
export type Claim = { stat: string; body: string; source: string };
export const marketClaims: Claim[] = [
  { stat: '+12%', body: 'NZ electricity prices year-on-year', source: 'Consumer NZ' },
  { stat: '~15%', body: 'council rates rising across many regions', source: 'Consumer NZ' },
  { stat: '360,000', body: 'NZ households now classified energy-poor', source: 'Consumer NZ' },
  { stat: '7%', body: 'of households switched power provider last year', source: 'MBIE CDR submission' },
];
