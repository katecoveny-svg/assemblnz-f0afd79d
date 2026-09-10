/**
 * One NZ agentic loyalty — locked concept tokens and copy.
 *
 * Client accent FIXED at digital turquoise `#007C92` (Kate confirmed).
 * Optional depth `#00B0CA` sparingly. Never `#00A45F`, magenta, or orange.
 *
 * Independent concept — not a current One NZ product or partnership claim.
 */

export const ONE_NZ_ACCENT = '#007C92' as const;
/** Alias kept for swappable-token architecture; value must stay `#007C92`. */
export const DIGITAL_TURQUOISE = ONE_NZ_ACCENT;
/** Optional depth highlight — use sparingly on speculars / active ripples. */
export const ONE_NZ_ACCENT_DEPTH = '#00B0CA' as const;

export const ASSEMBL_CANON = {
  plum: '#240B21',
  plumDeep: '#170f13',
  mulberry: '#654A4E',
  heather: '#916A70',
  chalk: '#F5F1F2',
  paper: '#FFFDFB',
} as const;

/** Locked positioning spine (Experience Designer / Kate) — One NZ journey only. */
export const TWELVE_WORD_ENERGY =
  'assembling turns activation and hold-time waits into phone dollars toward the next upgrade.';

/**
 * Assembl homepage spine — no client packaging (Kate lock: no One NZ on `/`).
 * Must stay free of Phone Dollars / One Wallet / upgrade-offer wording.
 */
export const ASSEMBL_HOME_SPINE =
  'assembling turns activation and hold-time waits into earned credit — with proof you can keep.';

export const MASTHEAD = 'the wait is the earn event.';

export const INDEPENDENT_CONCEPT_DISCLAIMER =
  'Independent concept by assembl, not a current One NZ product, offer, or partnership. Phone Dollars, One Wallet and Evidence receipts shown here are proposed experience design only.';

export const WAIT_TRIGGERS = [
  { id: 'esim', label: 'eSIM activation', dwell: '~90s', primary: true },
  { id: 'plan', label: 'Plan change', dwell: '~2 min', primary: true },
  { id: 'ivr', label: 'IVR hold', dwell: '~4 min', primary: false },
] as const;

export const DEMO_EARN = {
  thisWait: 2.75,
  stamp: 0.45,
  balance: 27.4,
  householdShare: 0.15,
} as const;

/** Fresh Evidence receipt timestamp — NZ preview demo (not May 2025). */
export const DEMO_RECEIPT_AT = '1 Sep 2026, 8:14pm' as const;

/** Evidence receipt composition — shown before final CTA. */
export const EVIDENCE_SPLIT = [
  { id: 'wait', label: 'wait duration', pct: 55, note: 'time in a real process' },
  { id: 'action', label: 'useful moment', pct: 30, note: 'permissioned micro-action' },
  { id: 'household', label: 'household share', pct: 15, note: 'optional rebalance' },
] as const;

/** Mode A ownership — locked Phase 0 pack. */
export const MODE_A = {
  label: 'Mode A',
  oneNz: {
    title: 'One NZ owns',
    points: ['Member relationship', 'Phone Dollars currency', 'P&L on the moment pool'],
  },
  assembl: {
    title: 'assembl brings',
    points: ['Wait detection layer', 'Permissioned agent moments', 'Evidence receipts as proof'],
  },
} as const;

/**
 * Phase 0 pilot commercials — factual pack numbers only.
 * Do not invent uplift, partnership, or conversion claims.
 */
export const PHASE_0 = {
  title: 'Phase 0 pilot',
  lede: 'One wait trigger, one earn rule, Evidence receipts from day one. Opted-in members only.',
  facts: [
    { label: 'Investment', value: 'NZ$85–140k' },
    { label: 'Build', value: '~4 weeks' },
    { label: 'Cohort', value: '500–1,000 opted-in' },
    { label: 'Sponsor pool', value: '~$0.30 / wait (indicative)' },
    { label: 'Moment split', value: '55 / 30 / 15' },
    { label: 'Member cost', value: '$0' },
  ],
} as const;

export const AGENT_CHIPS = [
  'Why am I earning?',
  'Show Evidence receipt',
  'Share with household?',
] as const;

export function nzd(amount: number): string {
  return amount.toLocaleString('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
  });
}
