'use server';

import { revalidatePath } from 'next/cache';
import { ensureAdmin } from '@/lib/admin/ensureAdmin';
import { getServiceClient } from '@/lib/supabase/service';

/**
 * Content-approval server actions. AI-generated content lands in
 * content_approvals as 'pending' (migration 20260703100000) and only ships once
 * approved here. Service-role writes only after ensureAdmin(); RLS stays on
 * (admin-scoped read, no client write policies).
 */

async function review(formData: FormData, status: 'approved' | 'rejected') {
  const admin = await ensureAdmin();

  const id = String(formData.get('id') ?? '');
  const note = String(formData.get('note') ?? '').trim();
  if (!id) return;

  try {
    const sb = getServiceClient();
    await sb
      .from('content_approvals')
      .update({
        status,
        reviewed_by: admin.email,
        reviewed_at: new Date().toISOString(),
        review_note: note || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  } catch {
    // Fail soft before the migration lands.
  }

  revalidatePath('/admin/approvals');
}

export async function approveContent(formData: FormData) {
  await review(formData, 'approved');
}

export async function rejectContent(formData: FormData) {
  await review(formData, 'rejected');
}

/** Send a reviewed item back to pending (undo). */
export async function reopenContent(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) return;

  try {
    const sb = getServiceClient();
    await sb
      .from('content_approvals')
      .update({
        status: 'pending',
        reviewed_by: null,
        reviewed_at: null,
        review_note: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  } catch {
    // Fail soft.
  }

  revalidatePath('/admin/approvals');
}
