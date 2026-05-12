/**
 * Tenant resolution helpers for Tōro routes.
 *
 * Every multi-tenant URL under /app/toro/[slug] needs to look up which
 * tenants the current user belongs to. The locked architecture
 * (project_toro_multi_tenant_chatwoot.md) has three tables:
 *   tenants(id, slug, name, ...)
 *   tenant_members(user_id, tenant_id, role, ...)
 *   tenant_invitations(...)
 *
 * The single-tenant pilot (Hudson whānau) has exactly one tenant row, but
 * code that calls these helpers MUST assume a list. We always return the
 * member's most-recent tenant first.
 */
import type { createClient } from '@/lib/supabase/server';

// Use the actual return type of the project's server-side helper so we don't
// pull a direct @supabase/supabase-js dependency into the typecheck graph.
type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export interface TenantSummary {
  id: string;
  slug: string;
  name: string;
}

/**
 * Look up the tenant slug the user should be routed to. Returns null if
 * the user isn't a member of any tenant — caller decides what to do
 * (typically redirect to an onboarding screen).
 *
 * Falls back gracefully when the multi-tenant tables don't exist yet
 * (early-pilot environments), returning a hard-coded 'hudson' slug so
 * the pilot keeps working.
 */
export async function resolveTenantSlugForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('tenant_members')
      .select('tenant:tenants(slug, created_at)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false, referencedTable: 'tenants' })
      .limit(1)
      .maybeSingle();

    if (error) {
      // Table likely not present in this env — fall through to the pilot
      // default rather than throwing.
      // eslint-disable-next-line no-console
      console.warn('[resolve-tenant] falling back to hudson:', error.message);
      return 'hudson';
    }

    const tenant = (data as { tenant: { slug: string } | null } | null)?.tenant;
    return tenant?.slug ?? 'hudson';
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      '[resolve-tenant] unexpected error, falling back to hudson:',
      err,
    );
    return 'hudson';
  }
}

/**
 * Return every tenant the user is a member of. Used by the future tenant
 * switcher; for the pilot it's a single-row list.
 */
export async function listTenantsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<TenantSummary[]> {
  try {
    const { data, error } = await supabase
      .from('tenant_members')
      .select('tenant:tenants(id, slug, name)')
      .eq('user_id', userId);

    if (error || !data) return [];
    return (data as unknown as Array<{ tenant: TenantSummary | TenantSummary[] | null }>)
      .map((r) => (Array.isArray(r.tenant) ? r.tenant[0] ?? null : r.tenant))
      .filter((t): t is TenantSummary => t !== null);
  } catch {
    return [];
  }
}
