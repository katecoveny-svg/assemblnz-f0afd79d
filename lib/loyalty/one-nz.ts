/**
 * One NZ agentic loyalty — locked concept tokens and copy.
 *
 * Client accent is FIXED at digital turquoise `#007C92` (Kate, 2026-09-01).
 * Do not substitute One NZ brand green `#00A45F` as the journey accent.
 * Green may only appear inside literal One NZ chrome fidelity if ever needed;
 * wait / earn / Phone Dollars accents always use DIGITAL_TURQUOISE.
 *
 * Independent concept — not a current One NZ product or partnership claim.
 */

export const ONE_NZ_ACCENT = '#007C92' as const;
/** Alias kept for swappable-token architecture; value must stay `#007C92`. */
export const DIGITAL_TURQUOISE = ONE_NZ_ACCENT;

export const ASSEMBL_CANON = {
  plum: '#240B21',
  mulberry: '#654A4E',
  heather: '#916A70',
  chalk: '#F5F1F2',
  paper: '#FFFDFB',
} as const;

/** Twelve-word energy — locked positioning line. */
export const TWELVE_WORD_ENERGY =
  'assembling turns the wait inside a loyalty programme into currency the customer already values.';

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
  householdShare: 0.9,
} as const;

export function nzd(amount: number): string {
  return amount.toLocaleString('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
  });
}
