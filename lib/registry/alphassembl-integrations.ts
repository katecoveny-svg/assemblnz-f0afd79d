/**
 * Alphassembl's own integrations catalogue.
 *
 * Kept separate from assembl's platform Pipedream Connect list on purpose:
 * Alphassembl is a product with its own connector namespace. Only integrations
 * that actually earn their place for a NZ dog-owner / pet-business OS live here.
 *
 * `status` is honest: 'live' = wired today; 'roadmap' = named commitment, not
 * yet wired. Nothing here dispatches without a human — ACTION_DISPATCH is off.
 */

export type AlphassemblIntegrationStatus = 'live' | 'roadmap';

export interface AlphassemblIntegration {
  slug: string;
  name: string;
  category: 'welfare' | 'finance' | 'payments' | 'records';
  status: AlphassemblIntegrationStatus;
  /** One plain line — what it does for a dog owner or pet business. */
  blurb: string;
  /** Who it's for. */
  audience: 'owner' | 'pet-business';
}

export const ALPHASSEMBL_INTEGRATIONS: AlphassemblIntegration[] = [
  {
    slug: 'spca-nz',
    name: 'SPCA NZ',
    category: 'welfare',
    status: 'live',
    blurb: 'Welfare-first referrals for rehoming and welfare concerns — Kaiako links to spca.nz/advice.',
    audience: 'owner',
  },
  {
    slug: 'dog-control-act',
    name: 'NZ Dog Control Act 1996',
    category: 'records',
    status: 'live',
    blurb: 'Registration, microchipping and public-control obligations, grounded in Kaiako’s knowledge base.',
    audience: 'owner',
  },
  {
    slug: 'xero',
    name: 'Xero',
    category: 'finance',
    status: 'roadmap',
    blurb: 'Pet-business admin — reconcile daycare and grooming income. Draft-only; nothing posts without a human.',
    audience: 'pet-business',
  },
  {
    slug: 'stripe-nz',
    name: 'Stripe (NZ)',
    category: 'payments',
    status: 'roadmap',
    blurb: 'Take deposits on grooming and daycare bookings in NZD. Off until a pilot opts in.',
    audience: 'pet-business',
  },
];

export function liveAlphassemblIntegrations(): AlphassemblIntegration[] {
  return ALPHASSEMBL_INTEGRATIONS.filter((i) => i.status === 'live');
}
