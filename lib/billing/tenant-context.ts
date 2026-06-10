/**
 * Resolve (or provision) the tenant a self-serve checkout should bill.
 *
 * Free-tool users converting with a card may not have a tenant yet, so this
 * creates a minimal one + an owner membership on first checkout. Uses the
 * service role because a brand-new user has no rows to satisfy tenant RLS yet.
 */
import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';

/** Read-only: the user's most-recent tenant id, or null. Never provisions. */
export async function resolveTenantIdForUser(userId: string): Promise<string | null> {
  if (!userId) return null;
  let svc: ReturnType<typeof getServiceClient>;
  try {
    svc = getServiceClient();
  } catch {
    return null;
  }
  const { data } = await svc
    .from('tenant_members')
    .select('tenant_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.tenant_id as string | undefined) ?? null;
}

export async function resolveOrCreateTenantId(
  userId: string,
  email: string | null,
): Promise<string> {
  const svc = getServiceClient();

  const { data: member } = await svc
    .from('tenant_members')
    .select('tenant_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (member?.tenant_id) return member.tenant_id as string;

  const name = email ? email.split('@')[0] : 'New workspace';
  const { data: tenant, error } = await svc
    .from('tenants')
    .insert({ name, billing_email: email, plan: 'self_serve', status: 'active' })
    .select('id')
    .single();

  if (error || !tenant) {
    throw new Error(`resolveOrCreateTenantId: tenant create failed — ${error?.message ?? 'no row'}`);
  }

  const tenantId = tenant.id as string;
  await svc
    .from('tenant_members')
    .insert({ tenant_id: tenantId, user_id: userId, role: 'owner' });

  return tenantId;
}
