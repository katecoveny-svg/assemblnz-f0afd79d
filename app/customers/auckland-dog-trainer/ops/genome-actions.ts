'use server';

import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { getServiceClient } from '@/lib/supabase/service';
import { GENOME_TENANT } from '@/lib/customers/auckland-dog-trainer/genome-store';
import { INVITE_COOKIE } from '@/lib/demo-invites/crypto';

export type EditFactResult = { ok: boolean; message?: string };

/**
 * Write one Business Genome fact — the ripple made user-editable.
 *
 * The middleware demo gate (basic auth / signed invite cookie) protects every
 * /customers/* request this action is invoked from. The credential check here
 * is defence in depth: the action id also ships on surfaces that render the
 * genome read-only (e.g. /living-site), and those requests carry neither
 * credential, so they are refused before any write.
 */
export async function updateGenomeFactAction(
  factId: string,
  value: string,
): Promise<EditFactResult> {
  const h = await headers();
  const jar = await cookies();
  const hasBasicAuth = (h.get('authorization') ?? '').startsWith('Basic ');
  const hasInviteCookie = Boolean(jar.get(INVITE_COOKIE)?.value);
  if (!hasBasicAuth && !hasInviteCookie) {
    return { ok: false, message: 'Not authorised to edit the genome.' };
  }

  const id = factId.trim();
  const v = value.trim().slice(0, 300);
  if (!/^g-[a-z0-9-]{1,40}$/.test(id) || v.length === 0) {
    return { ok: false, message: 'That edit doesn’t look right — value can’t be empty.' };
  }

  try {
    const supabase = getServiceClient();
    // Update only — facts are born in migrations/ops flows, never from here.
    const { data, error } = await supabase
      .from('living_site_genome')
      .update({ value: v, updated_at: new Date().toISOString() })
      .eq('tenant', GENOME_TENANT)
      .eq('fact_id', id)
      .select('fact_id');
    if (error) return { ok: false, message: 'The database write failed — try again.' };
    if (!data || data.length === 0) {
      return { ok: false, message: 'That fact isn’t in the live genome yet.' };
    }
  } catch {
    return { ok: false, message: 'The database is unreachable right now.' };
  }

  // Every surface that reads the genome re-renders with the new value.
  revalidatePath('/living-site');
  revalidatePath('/living-site/fred');
  revalidatePath('/customers/auckland-dog-trainer/ops');
  return { ok: true };
}
