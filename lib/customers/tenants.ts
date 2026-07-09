/**
 * Canonical tenant registry for the hosted pilot workspaces.
 *
 * This is the source of truth for the `/customers` hub page and any code
 * that needs to enumerate pilots without hitting the database. Keep in sync
 * with the `tenant_customers` table in Supabase (seeded per migration).
 *
 * Status semantics:
 *   'concept'  = pre-partnership pitch surface (draft-only, never real data)
 *   'pilot'    = signed & live with a real customer
 *   'archived' = historical, kept for reference
 */

export type TenantStatus = 'concept' | 'pilot' | 'archived';

export interface Tenant {
  slug: string;
  displayName: string;
  parentBrand?: string;
  status: TenantStatus;
  /** Short one-line description used on the hub card. */
  blurb: string;
  /** Optional accent used on the hub card border/tint (Tailwind class). */
  accentClass?: string;
}

export const TENANTS: readonly Tenant[] = [
  {
    slug: 'creative-agency',
    displayName: 'AUAHA Creative Kete',
    parentBrand: 'assembl studio',
    status: 'concept',
    blurb: 'A creative studio in a chat — Prism art-directs and generates imagery, Muse writes, Flux films, Verse voices. Real generation, on-brand.',
    accentClass: 'border-amber-300/70',
  },
  {
    slug: 'happy-tails',
    displayName: 'Happy Tails',
    parentBrand: 'Franklin & friends',
    status: 'concept',
    blurb: 'Dog daycare + grooming workspace — roster, dog CRM, welcome pack.',
    accentClass: 'border-amber-200/70',
  },
  {
    slug: 'auckland-dog-trainer',
    displayName: 'Fred OS',
    parentBrand: 'Auckland Dog Trainer · Learn To Talk Dog',
    status: 'concept',
    blurb:
      'Dog trainer operating system — intake triage, session notes → homework, programmes, course builder, hiring.',
    accentClass: 'border-rose-300/70',
  },
  {
    slug: 'aironaut',
    displayName: 'Aironaut Customs Brokers',
    parentBrand: 'Aironaut Customs Brokers Ltd.',
    status: 'concept',
    blurb: 'Customs brokerage — entries, shipment tracking, invoice chasing, cashflow.',
    accentClass: 'border-sky-200/70',
  },
  {
    slug: 'auckland-zoo',
    displayName: 'Auckland Zoo',
    parentBrand: 'Kaitiaki pilot',
    status: 'concept',
    blurb: 'Keeper ops — species register, welfare, clinical notes, kaumātua-safe hero.',
    accentClass: 'border-emerald-200/70',
  },
  {
    slug: 'air-nz',
    displayName: 'Air New Zealand × Dash',
    parentBrand: 'Koru partner concept',
    status: 'concept',
    blurb: 'Wait-moment earn in the journey — sponsors, revenue split, Koru reconciliation.',
    accentClass: 'border-teal-200/70',
  },
  {
    slug: 'contact-energy',
    displayName: 'Contact Energy × Assembling',
    parentBrand: 'Switch pitch concept',
    status: 'concept',
    blurb: 'Earn layer in the app — loading moments become bill credits; Switch power assistant.',
    accentClass: 'border-red-200/70',
  },
  {
    slug: 'everyday-rewards',
    displayName: 'Everyday Rewards × Dash',
    parentBrand: 'Woolworths NZ',
    status: 'concept',
    blurb: 'Wait-moment earn — sponsors, tiers, reconciliation, treasury.',
    accentClass: 'border-lime-200/70',
  },
  {
    slug: 'toa-architects',
    displayName: 'TOA Architects',
    parentBrand: 'TOA × ARC concept',
    status: 'concept',
    blurb: 'Architecture practice ops — brand-film hero, BIM viewers, six-job tray, integrations orbit.',
    accentClass: 'border-stone-300/70',
  },
  {
    slug: 'lula-inn',
    displayName: 'Lula Inn',
    parentBrand: 'Hospo pilot concept',
    status: 'concept',
    blurb: 'Hospitality ops — roster, compliance, service periods, mana receipts.',
    accentClass: 'border-rose-200/70',
  },
  {
    slug: 'moana',
    displayName: 'Moana',
    parentBrand: 'Boating & fishing concept',
    status: 'concept',
    blurb: 'Recreational boating & fishing assistant — forecast, tides, catch log, knots, safety.',
    accentClass: 'border-cyan-200/70',
  },
  {
    slug: 'family',
    displayName: 'Family OS',
    parentBrand: 'Whānau operating system concept',
    status: 'concept',
    blurb: 'The family operating system — forward a school newsletter, get the week: events, pickups, shopping, approvals.',
    accentClass: 'border-orange-200/70',
  },
] as const;

export function findTenant(slug: string): Tenant | undefined {
  return TENANTS.find((t) => t.slug === slug);
}

export const TENANT_SLUGS: readonly string[] = TENANTS.map((t) => t.slug);
