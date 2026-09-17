/**
 * THE pricing registry — the single source of truth for every surface that
 * shows a price: Ask assembl, /pricing, and any other registry consumer.
 *
 * Live public ladder (2026-09): Install $1,500 +GST once ·
 * keep it running $250/mo +GST · team $800/mo +GST · Outcome talk to us.
 * All prices NZD, GST exclusive.
 *
 * RETIRED (do not quote on any public surface): the marketplace seat ladder
 * (free / $9.99 / Pro Stack $49 / Specialist $199 / All-Access $250 /
 * outcome from $5,000 / GST inclusive). That framing is dead.
 *
 * NOTE: lib/pricing.ts still carries older Industry Pack / Tōro canon for
 * unmigrated internal surfaces. New public commercial copy reads from here.
 * /pricing imports the named amount constants below.
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

/** Amounts shared with /pricing so the page and the registry cannot drift. */
export const PRICE_INSTALL = '$1,500';
export const PRICE_INSTALL_SUFFIX = ' +GST · once';
export const PRICE_RUNNING = '$250';
export const PRICE_RUNNING_SUFFIX = '/mo +GST';
export const PRICE_TEAM = '$800';
export const PRICE_TEAM_SUFFIX = '/mo +GST';
export const PRICE_OUTCOME = 'talk to us';

export const PRICING_NOTE = 'All prices NZD, GST exclusive.';

export const PRICING_TIERS: PricingTier[] = [
  {
    name: 'install',
    benefit: 'one useful, bounded job running in about two weeks.',
    rows: [{ label: 'the install', price: `${PRICE_INSTALL} +GST once` }],
    points: [
      'two weeks: written working context, one DO on one real job, one end-to-end flow with review points',
      'first month of running included',
      'data handling and hosting agreed for the engagement',
    ],
    cta: { label: 'see pricing', href: '/pricing' },
    featured: true,
  },
  {
    name: 'keep it running',
    benefit: 'keep the installed job available and current.',
    rows: [{ label: 'monthly', price: `${PRICE_RUNNING}/mo +GST` }],
    points: [
      'hosting and running costs',
      'working context kept current when relevant facts, staff or rules change',
      'you keep the written context either way',
    ],
    cta: { label: 'see pricing', href: '/pricing' },
  },
  {
    name: 'team',
    benefit: 'several bounded jobs or agents using the same agreed context.',
    rows: [{ label: 'monthly', price: `${PRICE_TEAM}/mo +GST` }],
    points: [
      'everything in keep it running',
      'several agents or jobs, each with explicit limits',
      'shared context and review points for the team',
    ],
    cta: { label: 'see pricing', href: '/pricing' },
  },
  {
    name: 'outcome',
    benefit: 'priced around the result when the work is bigger than one installed job.',
    rows: [{ label: 'custom', price: PRICE_OUTCOME }],
    points: [
      'scoped against a result you name',
      'scorecard agreed before we start',
      'can combine Pursuit, DO and Studio when the outcome needs the full loop',
    ],
    cta: { label: 'talk to us', href: '/contact?product=system' },
  },
];

/**
 * RETIRED helper — marketplace bundle→tier map. Kept so old call sites do not
 * break, but returns current install/running language only. Do not revive the
 * $9.99 / $49 / $199 ladder here.
 */
export function tierForBundle(_slug: string, _standalone?: boolean): string {
  return `install ${PRICE_INSTALL} +GST once, then keep it running ${PRICE_RUNNING}/mo +GST — see /pricing`;
}

/**
 * The ladder as plain sentences, derived from PRICING_TIERS so chat surfaces
 * (the Ask assembl widget) can quote pricing without a second copy that drifts.
 */
export function pricingPlainLines(): string[] {
  return PRICING_TIERS.map(
    (tier) =>
      `${tier.name}: ${tier.rows.map((row) => `${row.label} ${row.price}`).join(', ')}`,
  );
}
