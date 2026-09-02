/**
 * One NZ × assembl — preview journey configuration.
 *
 * CONCEPT / DEMO ONLY. Independent concept — not an official One NZ product,
 * partnership, or offer. No real Phone Dollars are minted; tallies are
 * demonstration values. Accent locked to One NZ green `#00A45F` only.
 *
 * Narrative arc: Wait → Earn → Phone Dollars → Mana Receipt.
 */

export const ONE_NZ_ACCENT = '#00A45F' as const;

export const ONE_NZ_BRAND = {
  slug: 'one-nz',
  displayName: 'One NZ',
  accent: ONE_NZ_ACCENT,
  ink: '#0A0A0A',
  paper: '#FFFDFB',
  chalk: '#F5F1F2',
  muted: '#5C5C5C',
  field: '#0D1F16',
} as const;

/** Phone Dollars formatter — always two decimals. */
export function pd(value: number): string {
  return `PD$${value.toFixed(2)}`;
}

export type OneNzPhase = 'wait' | 'earn' | 'phone-dollars' | 'mana-receipt';

export type OneNzStage = {
  key: OneNzPhase;
  index: number;
  label: string;
  eyebrow: string;
  headline: string;
  body: string;
  /** Mono evidence / wait-state label */
  evidence: string;
  earn?: number;
};

export const ONE_NZ_STAGES: OneNzStage[] = [
  {
    key: 'wait',
    index: 0,
    label: 'Wait',
    eyebrow: '01 · the wait',
    headline: 'Your plan change is processing.',
    body: 'While One NZ confirms the change, the moment does not go idle. The wait opens a permissioned earn surface — one useful choice, one clear next step.',
    evidence: 'WAIT · PLAN CHANGE · ~18s',
  },
  {
    key: 'earn',
    index: 1,
    label: 'Earn',
    eyebrow: '02 · the earn',
    headline: 'Complete one useful micro-action.',
    body: 'Confirm household lines still in use. That preference returns to the adviser desk and funds Phone Dollars for the wait — value for readiness, never for watching an ad.',
    evidence: 'EARN · HOUSEHOLD CHECK · OPTIONAL',
    earn: 1.2,
  },
  {
    key: 'phone-dollars',
    index: 2,
    label: 'Phone Dollars',
    eyebrow: '03 · phone dollars',
    headline: 'Credit lands in the wallet.',
    body: 'Phone Dollars settle into the loyalty balance in the moment. The treasury paid you for a useful action during a real process wait — not a rebate after the fact.',
    evidence: 'WALLET · +PD$1.20 · SETTLED',
    earn: 1.2,
  },
  {
    key: 'mana-receipt',
    index: 3,
    label: 'Mana Receipt',
    eyebrow: '04 · mana receipt',
    headline: 'Proof you can hold.',
    body: 'Every earn carries a Mana Receipt: what waited, what you approved, what credited, and who remains responsible. Legible. Signed. Reviewable.',
    evidence: 'RECEIPT · HASHED · HUMAN IN LOOP',
  },
];

export const ONE_NZ_DISCLAIMER =
  'Independent concept / demo only. This is not an official One NZ product, partnership, or offer. Phone Dollars shown here are demonstration values — nothing is minted or billed.';

export const DEMO_PERSONA = {
  name: 'Aroha',
  plan: 'One NZ Share Plan · 3 lines',
  route: 'Plan change · add shared data',
} as const;
