/**
 * Source of truth: assembl-pricing-model.xlsx (locked 2026-05-06).
 * All prices NZD, GST exclusive.
 *
 * Three ways to buy:
 *   Subscribe          — predictable monthly, 4 sub-plans (Family / Operator /
 *                        Leader / Enterprise), each with quota + overage rate
 *   Pay per output     — one-off jobs, per-document fee
 *   Pay per resolution — outcome-based, customer pays only on objective
 *                        external trigger (e.g., BCA accept, NZ Customs accept)
 *
 * Plus standalone:
 *   Pilot Sprint       — NZ$5,000 + GST · 2 weeks · 1 workflow · 1 evidence
 *                        pack · money-back if no time saved by week 2.
 *                        Credit-back to Subscribe if converted within 30 days.
 *
 * "Output" definition is exported separately because it's referenced by both
 * Subscribe (quota counting) and Pay per output (per-unit billing).
 */

// ─────────────────────────────────────────────────────────────────────────────
// Subscribe — 4 sub-plans
// ─────────────────────────────────────────────────────────────────────────────

export type SubscribePlan = {
  slug: 'family' | 'operator' | 'leader' | 'enterprise';
  name: string;
  monthly: string;
  setup: string;
  outputsIncluded: string;
  overage: string;
  features: string[];
  highlighted?: boolean;
};

export const SUBSCRIBE_PLANS: SubscribePlan[] = [
  {
    slug: 'family',
    name: 'Family',
    monthly: 'NZ$29 / month',
    setup: '$0 setup',
    outputsIncluded: '5 outputs / month',
    overage: '$9 per extra output',
    features: ['Single kete', 'Tōro agent only'],
  },
  {
    slug: 'operator',
    name: 'Operator',
    monthly: 'NZ$1,490 / month',
    setup: '$590 setup',
    outputsIncluded: '50 outputs / month',
    overage: '$12 per extra output',
    features: ['Up to 2 kete', 'Named team of 3'],
  },
  {
    slug: 'leader',
    name: 'Leader',
    monthly: 'NZ$1,990 / month',
    setup: '$1,290 setup',
    outputsIncluded: '150 outputs / month',
    overage: '$8 per extra output',
    features: ['All kete', 'Named team of 8', 'Weekly evidence pack'],
    highlighted: true,
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    monthly: 'from NZ$2,990 / month',
    setup: 'from $2,890 setup',
    outputsIncluded: 'Unlimited within named kete + named team',
    overage: 'Included',
    features: ['Weekly + monthly evidence packs', 'Dedicated kaitiaki contact'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Pay per output — 4 rates
// ─────────────────────────────────────────────────────────────────────────────

export type PayPerOutputRate = {
  name: string;
  description: string;
  rate: string;
};

export const PAY_PER_OUTPUT_RATES: PayPerOutputRate[] = [
  {
    name: 'Compliance document',
    description: 'SSSP, S14B precheck, payment claim, audit pack',
    rate: 'from NZ$89',
  },
  {
    name: 'Customer or supplier communication',
    description: 'with NZ legislation citations',
    rate: 'from NZ$19',
  },
  {
    name: 'Weekly evidence pack',
    description: '7-day compliance roll-up',
    rate: 'from NZ$149',
  },
  {
    name: 'Bespoke output',
    description: 'quoted up-front',
    rate: 'from NZ$290',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Pay per resolution — 5 rates
// ─────────────────────────────────────────────────────────────────────────────

export type PayPerResolutionRate = {
  name: string;
  description: string;
  rate: string;
};

export const PAY_PER_RESOLUTION_RATES: PayPerResolutionRate[] = [
  {
    name: 'Consent precheck → BCA accept',
    description: '60-day window, no rework on cited clauses',
    rate: 'NZ$1,490',
  },
  {
    name: 'SSSP accepted on site',
    description: 'supervisor signs off, no amendments',
    rate: 'NZ$290',
  },
  {
    name: 'Customs entry lodged',
    description: 'NZ Customs accepts, no re-classification',
    rate: 'NZ$190',
  },
  {
    name: 'Compliance audit passed',
    description: 'external auditor signs off period',
    rate: 'NZ$890',
  },
  {
    name: 'Bespoke outcome',
    description: 'defined in engagement',
    rate: 'quoted',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Definitions and standalone offers
// ─────────────────────────────────────────────────────────────────────────────

export const OUTPUT_DEFINITION =
  'An "output" is one compliance doc, one drafted communication, one audit check, or one workflow run. Counted at human approval, not draft generation.';

export const PILOT_SPRINT = {
  frame: 'Not sure which way to buy? Start with a Pilot Sprint.',
  bannerCopy:
    'NZ$5,000 + GST · 2 weeks · 1 workflow · 1 evidence pack · money-back if no time saved by week 2.',
  creditBack:
    'Pilot Sprint customers who convert to Subscribe within 30 days of completion get the $5,000 fully credited to their first 3 months of subscription.',
};

export const PRICING_NOTE = 'All prices NZD, ex GST.';
