'use server';

import { revalidatePath } from 'next/cache';
import { ensureAdmin } from '@/lib/admin/ensureAdmin';
import { getServiceClient } from '@/lib/supabase/service';

/**
 * Designated-admins allowlist actions (designated_admins, migration
 * 20260703100000). Service-role writes only after ensureAdmin(); the table has
 * no client write policies at all.
 *
 * Safety rails: the founder mailboxes can never be deactivated (they are also
 * hard-coded in ensureAdmin, so a stray click can't lock Kate out).
 */

const PROTECTED = new Set(['assembl@assembl.co.nz', 'kate@assembl.co.nz']);

export async function addDesignatedAdmin(formData: FormData) {
  const admin = await ensureAdmin();

  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const displayName = String(formData.get('display_name') ?? '').trim();
  if (!email || !email.includes('@')) return;

  try {
    const sb = getServiceClient();
    await sb.from('designated_admins').upsert(
      {
        email,
        display_name: displayName || null,
        added_by: admin.email,
        active: true,
      },
      { onConflict: 'email' },
    );
  } catch {
    // Table lands with migration 20260703100000 — fail soft before it runs.
  }

  revalidatePath('/admin/settings');
}

export async function setDesignatedAdminActive(formData: FormData) {
  await ensureAdmin();

  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const active = String(formData.get('active') ?? '') === '1';
  if (!email || (PROTECTED.has(email) && !active)) return;

  try {
    const sb = getServiceClient();
    await sb.from('designated_admins').update({ active }).eq('email', email);
  } catch {
    // Fail soft.
  }

  revalidatePath('/admin/settings');
}
