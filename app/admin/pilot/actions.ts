'use server';

import { revalidatePath } from 'next/cache';
import { ensureAdmin } from '@/lib/admin/ensureAdmin';
import { getServiceClient } from '@/lib/supabase/service';

/**
 * Sign off a user-built (Pilot) agent. Records the operator decision against the
 * draft row — the Mana Receipt sign-off step. Admin-gated; fail-soft when the
 * draft table is absent in this environment.
 */
export async function signOffPilotAgent(formData: FormData) {
  const admin = await ensureAdmin();
  const table = String(formData.get('table') ?? '');
  const id = String(formData.get('id') ?? '');
  const decision = String(formData.get('decision') ?? '');
  if (!table || !id || !['approved', 'rejected'].includes(decision)) return;

  try {
    const sb = getServiceClient();
    await sb
      .from(table)
      .update({
        status: decision,
        reviewed_by: admin.email,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);
  } catch {
    // Table/columns may differ — fail soft.
  }

  revalidatePath('/admin/pilot');
}
