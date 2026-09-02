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
  'Independent concept by assembl — not a current One NZ product, offer, or partnership. Phone Dollars, One Wallet and Mana Receipts shown here are proposed experience design only.';

export const WAIT_TRIGGERS = [
  { id: 'esim', label: 'eSIM activation', dwell: '~90s' },
  { id: 'plan', label: 'Plan change', dwell: '~2 min' },
  { id: 'ivr', label: 'IVR hold', dwell: '~4 min' },
] as const;

export const DEMO_EARN = {
  thisWait: 2.75,
  stamp: 0.45,
  balance: 27.4,
  householdShare: 0.15,
} as const;

/** Fresh Mana Receipt timestamp — NZ preview demo (not May 2025). */
export const DEMO_RECEIPT_AT = '1 Sep 2026, 8:14pm' as const;

/** Mana Receipt evidence composition — shown before final CTA. */
export const EVIDENCE_SPLIT = [
  { id: 'wait', label: 'wait duration', pct: 55, note: 'time in a real process' },
  { id: 'action', label: 'useful moment', pct: 30, note: 'permissioned micro-action' },
  { id: 'household', label: 'household share', pct: 15, note: 'optional rebalance' },
] as const;

export function nzd(amount: number): string {
  return amount.toLocaleString('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
  });
}
