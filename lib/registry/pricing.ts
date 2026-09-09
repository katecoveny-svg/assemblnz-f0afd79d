/**
 * THE pricing registry — the single source of truth for every surface that
 * shows a price: Ask assembl, and any other registry consumer.
 *
 * Live public ladder (matches /pricing, 2026-09): Install $1,500 +GST once ·
 * keep it running $250/mo +GST · team $800/mo +GST · Outcome talk to us.
 * All prices NZD, GST exclusive.
 *
 * RETIRED (do not quote on any public surface): the marketplace seat ladder
 * (free / $9.99 / Pro Stack $49 / Specialist $199 / All-Access $250 /
 * outcome from $5,000 / GST inclusive). That framing is dead.
 *
 * NOTE: lib/pricing.ts still carries older Industry Pack / Tōro canon for
 * unmigrated internal surfaces. New public commercial copy reads from here.
 * /pricing (CinematicPricing) imports the named amount constants below.
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
    benefit: 'one real thing running in about two weeks.',
    rows: [{ label: 'the install', price: `${PRICE_INSTALL} +GST once` }],
    points: [
      'two weeks: written record of how the business works, one agent on one real job, one customer journey end to end',
      'first month of running included',
      'NZ-hosted, Privacy Act 2020',
    ],
    cta: { label: 'see pricing', href: '/pricing' },
    featured: true,
  },
  {
    name: 'keep it running',
    benefit: 'hosted, accurate, cancel any time.',
    rows: [{ label: 'monthly', price: `${PRICE_RUNNING}/mo +GST` }],
    points: [
      'hosting and running costs',
      'written record kept current when prices, staff or policies change',
      'you keep the written record either way',
    ],
    cta: { label: 'see pricing', href: '/pricing' },
  },
  {
    name: 'team',
    benefit: 'a few agents covering one full journey.',
    rows: [{ label: 'monthly', price: `${PRICE_TEAM}/mo +GST` }],
    points: [
      'everything in keep it running',
      'several agents, each with written limits',
      'shared drafts the team can see',
    ],
    cta: { label: 'see pricing', href: '/pricing' },
  },
  {
    name: 'outcome',
    benefit: 'priced on the work delivered, not seats.',
    rows: [{ label: 'custom', price: PRICE_OUTCOME }],
    points: [
      'scoped against a result you name',
      'scorecard agreed before we start',
      'larger loyalty / wait→earn pilots: talk to us',
    ],
    cta: { label: 'talk to us', href: '/contact' },
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
