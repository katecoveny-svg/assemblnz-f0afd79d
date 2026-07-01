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
    slug: 'happy-tails',
    displayName: 'Happy Tails',
    parentBrand: 'Franklin & friends',
    status: 'concept',
    blurb: 'Dog daycare + grooming workspace — roster, dog CRM, welcome pack.',
    accentClass: 'border-amber-200/70',
  },
  {
    slug: 'aironaut',
    displayName: 'Aironaut Customs Brokers',
    parentBrand: 'Pīkau family pilot',
    status: 'concept',
    blurb: 'Customs brokerage — entries, HS classification, landed-cost, Mana Receipts.',
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
    slug: 'everyday-rewards',
    displayName: 'Everyday Rewards × Dash',
    parentBrand: 'Woolworths NZ',
    status: 'concept',
    blurb: 'Wait-moment earn — sponsors, tiers, reconciliation, treasury.',
    accentClass: 'border-lime-200/70',
  },
] as const;

export function findTenant(slug: string): Tenant | undefined {
  return TENANTS.find((t) => t.slug === slug);
}

export const TENANT_SLUGS: readonly string[] = TENANTS.map((t) => t.slug);
