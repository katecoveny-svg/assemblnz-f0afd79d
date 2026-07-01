// Multi-tenant hosted-pilot registry.
//
// Reusable scaffold for white-labelled customer workspaces (the same shape the
// spec calls out for Happy Tails / Air NZ / Everyday Rewards style hosted
// pilots). Each tenant carries its own brand tokens so the workspace chrome can
// render in the customer's colours while the underlying agent stays assembl's.
//
// The durable record lives in the `tenant_customers` table (see migration
// 20260701140000_auckland_zoo_keeper_pilot.sql). This registry is the
// code-side mirror the app renders from, so pilot workspaces render
// deterministically on deploy regardless of whether the seed has been applied —
// the established repo pattern (see reference_agent_prompts_live_in_code).

export type TenantBrand = {
  /** Forest / primary brand colour. */
  primary: string;
  primaryDeep: string;
  /** Soft tint of primary for washes and rails. */
  primarySoft: string;
  /** Warm earth accent (gold / clay). */
  accent: string;
  /** Page background — warm cream. */
  cream: string;
  /** Card / raised surface. */
  surface: string;
  /** Deep ink for headings/body. */
  ink: string;
  /** Muted secondary text. */
  muted: string;
  /** Hairline border. */
  line: string;
};

export type TenantCustomer = {
  slug: string;
  /** Customer display name. */
  name: string;
  /** Short label used in the workspace wordmark. */
  shortName: string;
  /** The assembl agent hosting the workspace (Kaitiaki lead). */
  agent: 'keeper';
  bundle: string;
  /** Pilot posture — always "concept · pending" until a real partnership. */
  status: 'concept-pending';
  /** One-line descriptor for the workspace header. */
  tagline: string;
  brand: TenantBrand;
  /** Placeholder mark glyph (never a real logo we don't hold rights to). */
  markLabel: string;
};

export const AUCKLAND_ZOO: TenantCustomer = {
  slug: 'auckland-zoo',
  name: 'Auckland Zoo',
  shortName: 'Auckland Zoo',
  agent: 'keeper',
  bundle: 'Kaitiaki',
  status: 'concept-pending',
  tagline: 'Keeper — animal-first drafting for the NZCCM, keepers and education team',
  markLabel: 'AZ',
  brand: {
    primary: '#1F5132', // forest green
    primaryDeep: '#12341F',
    primarySoft: '#E4EBE0',
    accent: '#B5732E', // warm clay-gold earth tone
    cream: '#F7F3E9',
    surface: '#FFFFFF',
    ink: '#22271F',
    muted: '#5E655A',
    line: '#E1DCCB',
  },
};

const TENANTS: Record<string, TenantCustomer> = {
  'auckland-zoo': AUCKLAND_ZOO,
};

export function getTenant(slug: string): TenantCustomer | null {
  return TENANTS[slug] ?? null;
}

/** CSS custom properties for a tenant, applied to the workspace root so the
 *  whole surface reads in the customer's brand. */
export function tenantCssVars(brand: TenantBrand): Record<string, string> {
  return {
    '--tenant-primary': brand.primary,
    '--tenant-primary-deep': brand.primaryDeep,
    '--tenant-primary-soft': brand.primarySoft,
    '--tenant-accent': brand.accent,
    '--tenant-cream': brand.cream,
    '--tenant-surface': brand.surface,
    '--tenant-ink': brand.ink,
    '--tenant-muted': brand.muted,
    '--tenant-line': brand.line,
  };
}
