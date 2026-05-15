'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';

type DraftState = 'approved' | 'reviewing' | 'rejected';
type ActionResult = { ok: true } | { ok: false; error: string };
type ResolvedTenantDraft =
  | {
      user: { id: string };
      tenant: { id: string; slug: string };
      draft: { id: string; status: string; tenant_id: string };
    }
  | { error: string };

async function resolveTenantDraft(slug: string, draftId: string): Promise<ResolvedTenantDraft> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'not authenticated' as const };

  const service = getServiceClient();
  const { data: tenant } = await service
    .from('tenants')
    .select('id,slug')
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

  const { data: draft } = await service
    .from('toro_drafts')
    .select('id,status,tenant_id')
    .eq('id', draftId)
    .eq('tenant_id', tenant.id)
    .maybeSingle();
  if (!draft) return { error: 'draft not found' as const };

  return {
    user,
    tenant: tenant as { id: string; slug: string },
    draft: draft as { id: string; status: string; tenant_id: string },
  };
}

async function transitionDraft(
  slug: string,
  draftId: string,
  toState: DraftState,
  reason: string,
): Promise<ActionResult> {
  const resolved = await resolveTenantDraft(slug, draftId);
  if ('error' in resolved) return { ok: false, error: resolved.error };

  const service = getServiceClient();
  const { error } = await service
    .from('toro_drafts')
    .update({
      status: toState,
      reviewer_user_id: resolved.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', draftId)
    .eq('tenant_id', resolved.tenant.id);

  if (error) return { ok: false, error: error.message };

  await service.from('toro_draft_transitions').insert({
    draft_id: draftId,
    tenant_id: resolved.tenant.id,
    from_state: resolved.draft.status,
    to_state: toState,
    transitioned_by: resolved.user.id,
    reason,
  });

  revalidatePath(`/app/${slug}/inbox`);
  return { ok: true };
}

export async function acceptDraftAction(slug: string, draftId: string) {
  return transitionDraft(slug, draftId, 'approved', 'industry_pack_stub_accept');
}

export async function editDraftAction(slug: string, draftId: string) {
  return transitionDraft(slug, draftId, 'reviewing', 'industry_pack_stub_edit');
}

export async function rejectDraftAction(slug: string, draftId: string) {
  return transitionDraft(slug, draftId, 'rejected', 'industry_pack_stub_reject');
}
