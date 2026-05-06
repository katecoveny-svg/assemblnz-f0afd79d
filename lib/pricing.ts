/**
 * Source of truth: assembl-pricing-model.xlsx (Kate-owned).
 * All prices NZD, GST exclusive.
 *
 * STRATEGIC DIRECTION (2026-05-06): the legacy 5-tier ladder
 * (Family / Operator / Leader / Enterprise / Outcome) is superseded
 * by a three-options model:
 *
 *   Subscribe        — predictable monthly, plan includes a quota,
 *                      price flexes on overage
 *   Pay per output   — one-off jobs (per-document fee)
 *   Pay per resolution — outcome-based (Zendesk Fin / Intercom Fin
 *                        reference model)
 *
 * TODO(reo-track-1): the specific monthly / per-output / per-resolution
 * numbers below are PLACEHOLDERS. Replace with confirmed values from
 * assembl-pricing-model.xlsx before this PR leaves draft.
 */

export type PricingPlan = {
  slug: 'subscribe' | 'per-output' | 'per-resolution';
  name: string;
  audience: string;
  monthly: string;
  monthlyNote?: string;
  setup: string;
  setupNote?: string;
  includes: string[];
  highlighted?: boolean;
  cta: string;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    slug: 'subscribe',
    name: 'Subscribe',
    audience: 'Predictable monthly cost',
    monthly: 'from $X / month',
    monthlyNote: 'Plan includes a sensible monthly quota; price flexes on overage',
    setup: '—',
    includes: [
      'Plan-included monthly quota of compliance docs, drafts, and checks',
      'Overage flex pricing — only pay for what you exceed',
      'Draft Mode review on every output',
      'NZ-hosted data',
      // TODO(reo-track-1): full feature list pending Kate's spreadsheet
    ],
    highlighted: true,
    cta: 'Start free',
  },
  {
    slug: 'per-output',
    name: 'Pay per output',
    audience: 'One-off jobs',
    monthly: 'from $X per output',
    monthlyNote: 'No subscription. Pay only for what you run.',
    setup: '—',
    includes: [
      'Per-document fee — generate a consent application, customs declaration, or compliance report on demand',
      'Same Draft Mode review on every output',
      'No commitment, no monthly minimum',
      // TODO(reo-track-1): per-output rate(s) pending Kate's spreadsheet
    ],
    cta: 'Talk to us',
  },
  {
    slug: 'per-resolution',
    name: 'Pay per resolution',
    audience: 'Outcome-based',
    monthly: 'from $X per resolution',
    monthlyNote: 'You only pay when a workflow reaches its final, signed-off outcome',
    setup: 'Per engagement',
    includes: [
      'Outcome-based — fee tied to a successful resolution, not a draft',
      'Reference model: Zendesk Fin, Intercom Fin',
      'Best fit for high-value workflows where you want skin in the game',
      // TODO(reo-track-1): per-resolution rate(s) and engagement scope pending Kate's spreadsheet
    ],
    cta: 'Talk to us',
  },
];

export const PRICING_NOTE =
  'All prices NZD, GST exclusive. Add 15% GST at invoice. Either way, every output goes through Draft Mode first — nothing gets sent, filed, or published without your sign-off.';
