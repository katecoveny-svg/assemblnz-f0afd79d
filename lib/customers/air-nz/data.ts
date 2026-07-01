/**
 * Air New Zealand × Dash — hosted pilot workspace demo data.
 *
 * CONCEPT / DEMO ONLY. Every figure here is mocked for the pitch workspace we
 * share with Air NZ. No live Air NZ / Koru / Airpoints APIs are called, and no
 * real Airpoints Dollars are minted — the earn tallies are demonstration values.
 * There is no actual Air NZ partnership; the chrome carries "concept · demo
 * pending" throughout.
 *
 * The programme is Koru; the currency is Airpoints Dollars, written `A$xx.xx`
 * (per the authoritative brand-notes v2 — never "koru points"). Status Points
 * are written `Sxxx`.
 *
 * Brand tokens mirror the seeded `tenant_customers` row for `air-nz` so the
 * workspace themes itself from data, not hard-coded chrome.
 */

export const AIR_NZ_BRAND = {
  slug: 'air-nz',
  displayName: 'Air New Zealand',
  header: '#111111',
  accent: '#00B0B9', // Ocean Teal — the one interactive colour
  accentDeep: '#00838C',
  bg: '#FFFFFF',
  ink: '#111111',
  warmGrey: '#6B6E71',
  silver: '#EAEAEA',
  coolGrey: '#F5F5F6',
  success: '#2E7D5B',
  // assembl-side lockup tokens (canary + cream + charcoal + Cormorant)
  canary: '#FFD42A',
  cream: '#FFF7EC',
  charcoal: '#3A3832',
} as const;

/** A$ formatter — Airpoints Dollars, always two decimals. */
export function apd(value: number): string {
  return `A$${value.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Trip journey — six stages, booking → post-flight. Each stage carries the
// wait-state trigger, the sponsored earn moment, and the A$ credited.
// ---------------------------------------------------------------------------
export type JourneyStage = {
  key: string;
  index: number;
  label: string; // short nav label
  screen: string; // breadcrumb, e.g. 'Book › Search'
  headline: string; // Air NZ-voice screen title
  trigger: string; // the wait-state trigger
  waitSeconds: number; // how long the wait lasts
  sponsor: string; // placeholder sponsor
  sponsorCategory: string;
  cpm: number; // effective CPM (NZ$)
  earn: number; // A$ credited to the passenger
  earnCopy: string; // the on-screen earn line (assembl voice)
  loader: 'koru' | 'plane' | 'progress' | 'oscar';
};

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    key: 'booking',
    index: 0,
    label: 'Booking',
    screen: 'Book › Search › Confirm availability',
    headline: 'Confirming availability',
    trigger: 'The fare search spinner — 3 to 5 seconds while availability loads.',
    waitSeconds: 4,
    sponsor: 'Sharesies',
    sponsorCategory: 'Investing',
    cpm: 38,
    earn: 0.6,
    earnCopy: 'Earn A$0.60 while we confirm your fare.',
    loader: 'koru',
  },
  {
    key: 'identity',
    index: 1,
    label: 'Identity',
    screen: 'identity.airnewzealand.com › Verifying',
    headline: 'Verifying you',
    trigger: 'The identity.airnewzealand.com hand-off — a 4 to 8 second white canvas.',
    waitSeconds: 6,
    sponsor: 'Kiwibank',
    sponsorCategory: 'Banking',
    cpm: 40,
    earn: 0.4,
    earnCopy: 'Earn A$0.40 while we verify you.',
    loader: 'progress',
  },
  {
    key: 'seat',
    index: 2,
    label: 'Check-in',
    screen: 'Check-in › Seat map',
    headline: 'Loading your seat map',
    trigger: 'The 24-hour check-in window — the seat map paints in over a couple of seconds.',
    waitSeconds: 3,
    sponsor: "Whittaker's",
    sponsorCategory: 'Grocery',
    cpm: 36,
    earn: 0.8,
    earnCopy: 'Earn A$0.80 while your seat map loads.',
    loader: 'koru',
  },
  {
    key: 'gate',
    index: 3,
    label: 'Gate',
    screen: 'Boarding pass › Gate 22',
    headline: 'Boarding in 14 min',
    trigger: 'The gate wait — the pilot moment. Minutes of dwell time at the gate.',
    waitSeconds: 5,
    sponsor: '2degrees',
    sponsorCategory: 'Telco',
    cpm: 45,
    earn: 1.2,
    earnCopy: 'Earn A$1.20 while you wait at the gate.',
    loader: 'plane',
  },
  {
    key: 'ife',
    index: 4,
    label: 'In-flight',
    screen: 'In-flight › Entertainment',
    headline: 'Unlocking entertainment',
    trigger: 'The IFE load — a captive, de-duplicated audience. Premium CPM.',
    waitSeconds: 4,
    sponsor: 'Spark',
    sponsorCategory: 'Telco',
    cpm: 62,
    earn: 0.9,
    earnCopy: 'Earn A$0.90 while your entertainment loads.',
    loader: 'plane',
  },
  {
    key: 'baggage',
    index: 5,
    label: 'Baggage',
    screen: 'Arrival › Bag tracker › Belt 3',
    headline: 'Your bag lands at Belt 3',
    trigger: 'The baggage carousel — taxiway to belt, a few minutes of standing and watching.',
    waitSeconds: 4,
    sponsor: 'NZ Post',
    sponsorCategory: 'Delivery',
    cpm: 36,
    earn: 0.3,
    earnCopy: 'Earn A$0.30 while your bag reaches the belt.',
    loader: 'progress',
  },
];

export const JOURNEY_TOTAL_EARN = JOURNEY_STAGES.reduce((s, x) => s + x.earn, 0); // A$4.20
export const JOURNEY_SPONSOR_COUNT = JOURNEY_STAGES.length; // 6

export const DEMO_PERSONA = {
  name: 'Kate',
  tier: 'Koru Gold',
  route: 'AKL → WLG',
  flight: 'NZ0429',
  balanceApd: 635.67, // A$ balance shown on the Koru card
  statusPoints: 302, // S302
  shairpointsApd: 635.67,
};

// ---------------------------------------------------------------------------
// Six wait-state mockups (clickable panels). Mirrors the journey but framed as
// the standalone "un-monetised canvas" catalogue.
// ---------------------------------------------------------------------------
export type WaitState = {
  key: string;
  title: string;
  where: string;
  dwell: string; // human dwell figure
  cpm: number;
  earn: number;
  sponsor: string;
  loader: 'koru' | 'plane' | 'progress' | 'oscar';
  detail: string;
};

export const WAIT_STATES: WaitState[] = [
  {
    key: 'booking',
    title: 'Booking flow',
    where: 'Book › Search › Confirming availability',
    dwell: '3–5 sec',
    cpm: 38,
    earn: 0.6,
    sponsor: 'Sharesies',
    loader: 'koru',
    detail:
      'The fare search spinner. Today it is a dead spinner. With Dash it is a koru unfurl and a sponsored earn moment credited to the wallet.',
  },
  {
    key: 'identity',
    title: 'Identity load',
    where: 'identity.airnewzealand.com',
    dwell: '4–8 sec',
    cpm: 40,
    earn: 0.4,
    sponsor: 'Kiwibank',
    loader: 'progress',
    detail:
      'The bare white identity hand-off canvas with a thin progress bar. The single biggest un-monetised surface in the app — a full-height sponsored earn panel.',
  },
  {
    key: 'gate',
    title: 'Gate wait',
    where: 'Boarding pass › Gate',
    dwell: '5–20 min',
    cpm: 45,
    earn: 1.2,
    sponsor: '2degrees',
    loader: 'plane',
    detail:
      'The pilot moment. Minutes of dwell time at the gate with the boarding pass open. Auckland and Wellington domestic, 90 days.',
  },
  {
    key: 'ife',
    title: 'IFE unlock',
    where: 'In-flight › Entertainment',
    dwell: '3–6 sec',
    cpm: 62,
    earn: 0.9,
    sponsor: 'Spark',
    loader: 'plane',
    detail:
      'The in-flight entertainment load. A captive, de-duplicated audience the industry has priced at a premium for a decade. A 787-9 silhouette cruises every ten minutes.',
  },
  {
    key: 'seat',
    title: 'Seat map load',
    where: 'Check-in › Seat map',
    dwell: '2–4 sec',
    cpm: 36,
    earn: 0.8,
    sponsor: "Whittaker's",
    loader: 'koru',
    detail:
      'The 24-hour check-in window. Teal-outlined seats paint in while the earn moment runs inline, never blocking the tap target.',
  },
  {
    key: 'oscar',
    title: 'AI assistant thinking',
    where: 'Ask Oscar',
    dwell: '2–5 sec',
    cpm: 44,
    earn: 0.5,
    sponsor: 'ASB',
    loader: 'oscar',
    detail:
      'Oscar, Air NZ’s AI assistant, thinks for a couple of seconds before answering. Built-in recognition, an earn panel that slides up from the bottom on the same screen.',
  },
];

// ---------------------------------------------------------------------------
// All Koru Partners — assembl listed as a native partner card
// ---------------------------------------------------------------------------
export const KORU_PARTNERS: { name: string; blurb: string; assembl?: boolean }[] = [
  { name: 'Airpoints Store', blurb: 'Earn Airpoints™ on everyday shopping' },
  { name: 'BP', blurb: 'Earn Airpoints™ on fuel' },
  { name: 'The Warehouse', blurb: 'Earn Airpoints™ in store and online' },
  {
    name: 'assembl',
    blurb: 'Earn Airpoints™ during app wait moments',
    assembl: true,
  },
  { name: 'OfficeMax', blurb: 'Earn Airpoints™ on business supplies' },
  { name: 'Westpac', blurb: 'Earn Airpoints™ on eligible spend' },
  { name: 'Localist', blurb: 'Earn Airpoints™ on local services' },
];

// ---------------------------------------------------------------------------
// Economics — inputs from 05-economics (public Air NZ + assembl canon)
// ---------------------------------------------------------------------------
export const ECONOMICS_INPUTS = {
  domesticPassengers: 10_100_000, // Air NZ FY25 Annual Report
  gateReachRate: 0.94, // ~94% reached at gate
  optInRate: 0.34, // steady-state opt-in
  unitsPerPax: 1.4, // attention units per passenger per gate wait
  fillRate: 0.62, // Y1 ramp
  baseCpm: 45, // dash canon base CPM (NZ$)
  publisherShare: 0.55, // Koru treasury share (fixed canon)
  passengerShareOfTreasury: 0.6, // A$ credited to members = 60% of treasury share
} as const;

/** Year-1 domestic-gate economics from a live-adjustable input set. */
export function computeEconomics(i: {
  domesticPassengers: number;
  gateReachRate: number;
  optInRate: number;
  unitsPerPax: number;
  fillRate: number;
  baseCpm: number;
  publisherShare: number;
  passengerShareOfTreasury: number;
}) {
  const reached = i.domesticPassengers * i.gateReachRate;
  const optIn = reached * i.optInRate;
  const units = optIn * i.unitsPerPax;
  const paidUnits = units * i.fillRate;
  const gross = (paidUnits * i.baseCpm) / 1000;
  const treasury = gross * i.publisherShare;
  const toMembers = treasury * i.passengerShareOfTreasury;
  const koruRetained = treasury - toMembers;
  const assemblShare = gross * (1 - i.publisherShare);
  return { reached, optIn, units, paidUnits, gross, treasury, toMembers, koruRetained, assemblShare };
}

/** Year-3 model — all four wait states, both fleets (from 05-economics §3). */
export const Y3_WAIT_STATES = [
  { name: 'Gate wait', units: 1.4, cpm: 45, y3Units: 9_270_000, gross: 417_150 },
  { name: 'Booking & check-in', units: 0.8, cpm: 38, y3Units: 5_290_000, gross: 201_020 },
  { name: 'In-flight IFE load', units: 2.2, cpm: 62, y3Units: 10_860_000, gross: 673_320 },
  { name: 'Baggage carousel', units: 1.6, cpm: 36, y3Units: 7_900_000, gross: 284_400 },
] as const;

export const Y3_TOTAL_GROSS = Y3_WAIT_STATES.reduce((s, x) => s + x.gross, 0); // 1,575,890

export function nzd(value: number): string {
  return `NZ$${Math.round(value).toLocaleString('en-NZ')}`;
}
