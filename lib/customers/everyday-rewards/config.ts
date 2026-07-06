/**
 * Everyday Rewards × assembl — pilot workspace config
 * ---------------------------------------------------
 * Config-driven data for the hosted concept workspace at
 * `/customers/everyday-rewards/dash`. This is a CONCEPT pitch surface shown to
 * Woolworths NZ / Everyday Rewards. Nothing here is a live integration:
 *
 *  - No real Everyday Rewards or ASB logos — silhouette / placeholder marks only.
 *  - No live points minting — every tally on these pages is a demo number.
 *  - Chrome is marked "concept · pending" everywhere.
 *
 * Brand tokens verified against the live everydayrewards.co.nz design system on
 * 2026-07-01 (see WOOLWORTHS-KAI-PACK-2026-06-29/08-visuals-v2/brand-notes.md).
 * Primary orange is #fd6400 (the real --edr-color-primary--orange), NOT a guess.
 */

export const EDR_BRAND = {
  // Everyday Rewards side — verified from live CSS design tokens.
  orange: '#fd6400',
  orangeDark: '#c65100',
  orangeLight: '#ffe6d1',
  charcoal: '#3a474e',
  navy: '#22303c',
  white: '#ffffff',
  greyLight: '#f2f2f2',
  greyMid: '#8a959c',
  leaf: '#4caf50',
  successGreen: '#2e7d32',
  errorRed: '#bd161c',
  // assembl side of the cross-brand lockup (canon).
  canary: '#BFA37A',
  gold: '#C79B1F',
  cream: '#FFF7EC',
  assemblCharcoal: '#3A3832',
} as const;

export const EDR_TENANT = {
  slug: 'everyday-rewards',
  displayName: 'Everyday Rewards',
  parentBrand: 'Woolworths New Zealand',
  contactName: 'Sarah Chapman',
  contactRole: 'Chief Digital & Marketing Officer, Woolworths NZ',
  conceptLabel: 'concept · pending',
  watermark: 'concept · assembl × everyday rewards',
  // Native points economy — do NOT invent a new currency. Verified.
  voucherThreshold: 2000,
  voucherValueNzd: 15,
} as const;

/** The six real wait moments in the Everyday Rewards app that become earn surfaces. */
export type WaitMoment = {
  id: string;
  index: number;
  label: string;
  screen: string;
  /** What the shopper sees while waiting today. */
  todayState: string;
  /** How long the wait typically lasts. */
  waitSeconds: number;
  /** Points minted into the shopper's balance during this wait moment (demo). */
  pointsEarned: number;
  /** The advertiser attributed to this earn moment (fictional demo sponsors). */
  sponsor: string;
  /** One-line description of the sponsored earn card that slides in. */
  earnCopy: string;
};

export const WAIT_MOMENTS: WaitMoment[] = [
  {
    id: 'offers-refresh',
    index: 1,
    label: 'Offers refresh',
    screen: 'Home · member offers',
    todayState: 'Spinner while personalised offers load',
    waitSeconds: 3,
    pointsEarned: 8,
    sponsor: 'Anchor',
    earnCopy: 'Points earned while your offers refreshed — brought to you by a partner.',
  },
  {
    id: 'points-balance-sync',
    index: 2,
    label: 'Points balance sync',
    screen: 'Wallet · balance',
    todayState: 'Balance pill shows a shimmer while syncing',
    waitSeconds: 2,
    pointsEarned: 6,
    sponsor: 'Whittaker’s',
    earnCopy: 'A moment to sync your balance — and a few points on the house.',
  },
  {
    id: 'checkout-scan',
    index: 3,
    label: 'Checkout scan companion',
    screen: 'In-store · Scan&Go queue',
    todayState: 'Waiting for barcode / queue at self-checkout',
    waitSeconds: 40,
    pointsEarned: 12,
    sponsor: 'Sanitarium',
    earnCopy: 'You waited 40s in the queue. We turned that into points.',
  },
  {
    id: 'digital-card-load',
    index: 4,
    label: 'Digital card load',
    screen: 'Wallet · digital card',
    todayState: 'Card barcode renders / brightness ramps',
    waitSeconds: 2,
    pointsEarned: 5,
    sponsor: 'ASB',
    earnCopy: 'Your card, ready to scan — with points from a partner while it loaded.',
  },
  {
    id: 'voucher-redemption',
    index: 5,
    label: 'Voucher redemption',
    screen: 'Rewards · redeem',
    todayState: 'Processing voucher / travel conversion',
    waitSeconds: 4,
    pointsEarned: 10,
    sponsor: 'Air New Zealand',
    earnCopy: 'While your voucher processed, a partner topped up your balance.',
  },
  {
    id: 'order-status',
    index: 6,
    label: 'Order status',
    screen: 'Delivery · ETA tracker',
    todayState: 'Waiting on delivery-window / driver ETA',
    waitSeconds: 6,
    pointsEarned: 9,
    sponsor: 'Uber',
    earnCopy: 'Tracking your delivery? Here are points for the wait.',
  },
];

/** Native EDR partners rail — assembl slots in beside existing partners. */
export type Partner = {
  name: string;
  category: string;
  /** How the shopper earns with this partner. */
  earnLine: string;
  /** True when this is the assembl slot (highlighted, cross-brand). */
  isAssembl?: boolean;
  /** True for real existing partners (rendered as silhouette placeholders). */
  live?: boolean;
};

export const PARTNERS: Partner[] = [
  {
    name: 'assembl',
    category: 'Wait-moment attribution',
    earnLine: 'Earn points across the small waits already in the app',
    isAssembl: true,
  },
  { name: 'ASB', category: 'Banking', earnLine: 'Earn on eligible everyday spend', live: true },
  { name: 'BP', category: 'Fuel', earnLine: 'Earn on fuel & in-store', live: true },
  { name: 'Everyday Insurance', category: 'Insurance', earnLine: 'Earn on eligible policies', live: true },
  { name: 'Ampol', category: 'Fuel', earnLine: 'Earn at the pump', live: true },
];

/** The full shopping journey shown on /dash/journey. */
export type JourneyStep = {
  id: string;
  label: string;
  headline: string;
  body: string;
  /** Cumulative points balance after this step (demo). */
  balanceAfter: number;
  /** Points added at this step. */
  delta: number;
  /** Where the points came from. */
  source: string;
};

export const JOURNEY_START_BALANCE = 1517;

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: 'browse',
    label: 'Browse',
    headline: 'Opening the app',
    body: 'Kate opens Everyday Rewards to plan the weekly shop. Offers load — the first wait moment. +8 points while she waits, attributed to a partner.',
    delta: 8,
    balanceAfter: 1525,
    source: 'assembl · offers-refresh wait moment',
  },
  {
    id: 'scan',
    label: 'Checkout scan',
    headline: 'Scan & Go queue',
    body: 'In store, Kate queues at self-checkout for 40 seconds. The scan-companion wait moment mints +12 points, sponsored, while she waits for the barcode.',
    delta: 12,
    balanceAfter: 1537,
    source: 'assembl · checkout-scan wait moment',
  },
  {
    id: 'in-store-earn',
    label: 'Points earned',
    headline: 'Shop complete',
    body: 'The $87.40 shop scans through. +87 points from the shop itself, +38 from wait moments across the day. Every point lands in the same balance.',
    delta: 87 + 18,
    balanceAfter: 1660,
    source: 'In-store scan +87 · assembl wait moments +18',
  },
  {
    id: 'threshold',
    label: '2,000 points',
    headline: 'You’ve hit 2,000 points',
    body: 'A few shops later the balance crosses the native 2,000-point threshold. Nothing invented — the same milestone Everyday Rewards uses today.',
    delta: 340,
    balanceAfter: 2000,
    source: 'Ongoing shops + assembl wait moments',
  },
  {
    id: 'redeem',
    label: '$15 voucher or travel',
    headline: 'Redeem, your way',
    body: '2,000 points converts to a $15 voucher — or to a travel reward. Same rail, same redemption. Wait moments simply got Kate there faster.',
    delta: 0,
    balanceAfter: 0,
    source: 'Native redemption — $15 voucher or travel',
  },
];

/** Live-adjustable economics model defaults (all editable on /dash/economics). */
export const ECONOMICS_DEFAULTS = {
  // Active Everyday Rewards members (public figure ~ 3.5m across NZ).
  shopperBase: 3_500_000,
  // Share who see at least one wait moment per week.
  weeklyActiveShare: 0.62,
  // Wait moments encountered per active shopper per week.
  waitMomentsPerShopperWeek: 9,
  // Fill rate — share of wait moments an advertiser actually sponsors.
  fillRate: 0.35,
  // Advertiser pays per sponsored wait moment (NZD).
  cpmMomentNzd: 0.018,
  // Share of advertiser spend minted to the shopper as points value.
  shopperSharePct: 0.55,
  // Share retained by Everyday Rewards / Woolworths.
  edrSharePct: 0.30,
  // Share to assembl (attribution engine + fill).
  assemblSharePct: 0.15,
} as const;

export type EconomicsInputs = {
  shopperBase: number;
  weeklyActiveShare: number;
  waitMomentsPerShopperWeek: number;
  fillRate: number;
  cpmMomentNzd: number;
  shopperSharePct: number;
  edrSharePct: number;
  assemblSharePct: number;
};

export function computeEconomics(i: EconomicsInputs) {
  const weeklyActive = i.shopperBase * i.weeklyActiveShare;
  const momentsPerWeek = weeklyActive * i.waitMomentsPerShopperWeek;
  const sponsoredPerWeek = momentsPerWeek * i.fillRate;
  const grossWeekly = sponsoredPerWeek * i.cpmMomentNzd;
  const grossAnnual = grossWeekly * 52;
  return {
    weeklyActive,
    momentsPerWeek,
    sponsoredPerWeek,
    grossWeekly,
    grossAnnual,
    toShopper: grossAnnual * i.shopperSharePct,
    toEdr: grossAnnual * i.edrSharePct,
    toAssembl: grossAnnual * i.assemblSharePct,
  };
}
