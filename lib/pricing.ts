/**
 * Source of truth: Industry Pack flat-rate pricing canon (locked 2026-05-15).
 * All prices NZD, GST exclusive.
 */

export type SubscribePlan = {
  slug: 'family' | 'industry-pack';
  name: string;
  monthly: string;
  setup: string;
  summary: string;
  features: string[];
  highlighted?: boolean;
};

export const SUBSCRIBE_PLANS: SubscribePlan[] = [
  {
    slug: 'family',
    name: 'Tōro Family',
    monthly: 'NZ$29 / month',
    setup: '$0 setup',
    summary: 'The family assistant for school, money, routines, and the week ahead.',
    features: [
      'Tōro family assistant',
      'Reviewed family actions and records',
      'Month to month',
    ],
  },
  {
    slug: 'industry-pack',
    name: 'Industry Pack',
    monthly: 'NZ$3,500 / month',
    setup: '$0 setup',
    summary:
      'A live specialist-agent fleet sequenced into one operating loop for one industry kete.',
    features: [
      'Pick one of the 8 industry kete',
      'Switch kete any time',
      'No usage limits',
      'No setup fee',
      'Evidence packs included',
      'Cancel any time',
    ],
    highlighted: true,
  },
];

export const FAMILY_PLAN = SUBSCRIBE_PLANS[0];
export const INDUSTRY_PACK_PLAN = SUBSCRIBE_PLANS[1];

export const PILOT_SPRINT = {
  frame: 'Founding Pilot price.',
  bannerCopy:
    'NZ$1,500 + GST · ten working days · one workflow · one evidence pack · founding pilots only.',
  creditBack:
    'Use the Founding Pilot Sprint to prove the workflow first. Any ongoing pack is scoped and priced separately after the Sprint.',
};

export const OUTCOME_OFFER = {
  name: 'Outcome',
  price: 'from NZ$5,000',
  summary:
    'Bespoke engagements for high-value workflows where the scope, evidence pack, and commercial model are agreed up front.',
};

export const PRICING_NOTE = 'All prices NZD, GST exclusive.';
