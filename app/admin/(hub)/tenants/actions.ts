'use server';

import { revalidatePath } from 'next/cache';
import { ensureAdmin } from '@/lib/admin/ensureAdmin';
import { getServiceClient } from '@/lib/supabase/service';

/**
 * Tenant/customer pilot server actions. Service-role writes only after
 * ensureAdmin(); the tenant_customers RLS stays intact.
 *
 * The code registry (lib/customers/tenants.ts) is the source of truth for
 * WHICH pilots exist; tenant_customers carries the operational state this page
 * edits: pilot status, brand-config pointer, demo-seed toggle.
 */

// Union of statuses used across the pilot migrations + the registry semantics.
const STATUSES = ['concept', 'concept-pending', 'pilot', 'live', 'paused', 'archived'] as const;

export async function updateTenant(formData: FormData) {
  await ensureAdmin();

  const slug = String(formData.get('slug') ?? '');
  if (!slug) return;

  const status = String(formData.get('status') ?? '');
  const brandConfig = String(formData.get('brand_config') ?? '').trim();
  const tagline = String(formData.get('tagline') ?? '').trim();
  const demoSeed = formData.get('demo_seed_enabled') === 'on';

  const patch: Record<string, unknown> = {
    demo_seed_enabled: demoSeed,
    updated_at: new Date().toISOString(),
  };
  if ((STATUSES as readonly string[]).includes(status)) patch.status = status;
  patch.brand_config = brandConfig || null;
  if (tagline) patch.tagline = tagline;

  try {
    const sb = getServiceClient();
    await sb.from('tenant_customers').update(patch).eq('slug', slug);
  } catch {
    // Fail soft in half-migrated environments (brand_config/demo_seed_enabled
    // land with migration 20260703100000).
  }

  revalidatePath('/admin/tenants');
}
