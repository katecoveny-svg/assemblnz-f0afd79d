/**
 * THE pricing registry — the single source of truth for every surface that
 * shows a price: /pricing, the Ask assembl widget, admin, whatever comes next.
 *
 * Consolidation rule (2026-07-05): one bundle/agent/pricing registry mirrored
 * everywhere. Never hardcode a price inside a component again — import it
 * from here so a repricing is a one-file change.
 *
 * This is the LIVE marketplace ladder (Free / $9.99 / Pro Stack $49 pick 3+1 /
 * Specialist $199 / All-Access $250 / enterprise custom / outcome from $5,000).
 * It replaced the pre-marketplace May-11 setup+monthly ladder, which is dead
 * on every surface. All prices NZD, GST inclusive.
 *
 * NOTE: lib/pricing.ts still carries the older Industry Pack canon and is kept
 * only for surfaces that haven't migrated; new code reads from here.
 */

export type PricingRow = { label: string; price: string };

export type PricingTier = {
  name: string;
  benefit: string;
  rows: PricingRow[];
  points: string[];
  cta: { label: string; href: string };
  featured?: boolean;
};

export const PRICING_NOTE = 'All prices NZD, GST inclusive.';

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'individual',
    benefit: 'one job off your plate.',
    rows: [
      { label: 'try any agent', price: 'free' },
      { label: 'one agent, yours', price: '$9.99/mo' },
    ],
    points: [
      'every agent inside your living site answers three messages free — no card',
      'pick the one that earns its keep and take it home',
      'every reply is a draft you approve',
    ],
    cta: { label: 'try an agent', href: '/agents' },
  },
  {
    name: 'operator',
    benefit: 'the working day, drafted. the standard for NZ teams.',
    rows: [
      { label: 'pro stack — pick 3 + 1 agents', price: '$49/mo' },
      { label: 'specialist collection', price: '$199/mo' },
      { label: 'all-access — every agent', price: '$250/mo' },
    ],
    points: [
      'pro stack: any three agents plus one, working as a team',
      'specialist: a whole purpose-built collection — construction, automotive, creative, animal care and more',
      'all-access: every agent assembl runs, one price',
    ],
    cta: { label: 'book a pilot', href: '/pilot-sprint' },
    featured: true,
  },
  {
    name: 'enterprise',
    benefit: 'the whole operation, with governance to match.',
    rows: [{ label: 'custom', price: "let's talk" }],
    points: [
      'organisation-wide rollout with named owners',
      'privacy designed to the Privacy Act 2020, including IPP 3A',
      'mana receipts and audit-pack exports your board can read',
    ],
    cta: { label: 'talk to us', href: 'mailto:assembl@assembl.co.nz?subject=enterprise' },
  },
  {
    name: 'outcome',
    benefit: 'buy the result, not the software.',
    rows: [{ label: 'per outcome', price: 'from $5,000' }],
    points: [
      'one workflow, built and proven inside 30 days',
      'priced as the outcome it delivers, not seats',
      'you keep the evidence pack either way',
    ],
    cta: { label: 'start a pilot', href: '/pilot-sprint' },
  },
];

/** Which tier buys which V4 bundle — the commerce map, no invented prices. */
export function tierForBundle(slug: string, standalone?: boolean): string {
  if (standalone) return 'pack-priced — per application, on the collection page';
  if (slug === 'hearth') return 'individual — $9.99 an agent, or pro stack $49';
  return 'operator — specialist collection $199/mo';
}

/**
 * The ladder as plain sentences, derived from PRICING_TIERS so chat surfaces
 * (the Ask assembl widget) can quote pricing without a second copy that
 * drifts. One line per tier: "operator — pro stack — pick 3 + 1 agents $49/mo,
 * specialist collection $199/mo, …".
 */
export function pricingPlainLines(): string[] {
  return PRICING_TIERS.map(
    (tier) =>
      `${tier.name}: ${tier.rows.map((row) => `${row.label} ${row.price}`).join(', ')}`,
  );
}
