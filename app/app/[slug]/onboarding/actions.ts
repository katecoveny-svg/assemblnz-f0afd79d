'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';

type ActionResult = { ok: true } | { ok: false; error: string };

async function assertTenantAccess(slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'not authenticated' as const };

  const service = getServiceClient();
  const { data: tenant } = await service
    .from('tenants')
    .select('id,slug,metadata')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) return { error: 'tenant not found' as const };

  const [{ data: member }, { data: admin }] = await Promise.all([
    service
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', tenant.id)
      .eq('user_id', user.id)
      .maybeSingle(),
    service.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle(),
  ]);

  if (!member && !admin) return { error: 'forbidden' as const };
  return { user, tenant: tenant as { id: string; slug: string; metadata: Record<string, unknown> | null } };
}

export async function verifyAliasAction(slug: string): Promise<ActionResult> {
  const access = await assertTenantAccess(slug);
  if ('error' in access) return { ok: false, error: access.error };

  const service = getServiceClient();
  const { error } = await service
    .from('tenant_email_aliases')
    .update({ status: 'verified', updated_at: new Date().toISOString() })
    .eq('tenant_id', access.tenant.id)
    .eq('purpose', 'ops');

  revalidatePath(`/app/${slug}/onboarding`);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function saveThresholdsAction(
  slug: string,
  formData: FormData,
): Promise<ActionResult> {
  const access = await assertTenantAccess(slug);
  if ('error' in access) return { ok: false, error: access.error };

  const autoConfirm = formData.get('autoConfirm') === 'on';
  const confidence = Number(formData.get('confidence') ?? 0.86);
  const normalisedConfidence = Number.isFinite(confidence)
    ? Math.min(0.99, Math.max(0.5, confidence))
    : 0.86;

  const metadata = {
    ...(access.tenant.metadata ?? {}),
    approval_thresholds: {
      auto_confirm_enabled: autoConfirm,
      min_confidence: normalisedConfidence,
      updated_at: new Date().toISOString(),
    },
  };

  const service = getServiceClient();
  const { error } = await service
    .from('tenants')
    .update({ metadata })
    .eq('id', access.tenant.id);

  revalidatePath(`/app/${slug}/onboarding`);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function completeOnboardingAction(slug: string): Promise<never> {
  const access = await assertTenantAccess(slug);
  if (!('error' in access)) {
    const service = getServiceClient();
    await service
      .from('tenants')
      .update({ onboarding_complete: true })
      .eq('id', access.tenant.id);
  }

  redirect(`/app/${slug}/inbox`);
}
