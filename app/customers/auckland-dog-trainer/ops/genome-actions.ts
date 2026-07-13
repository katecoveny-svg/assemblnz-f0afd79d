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
    // Read the current value first so the edit lands in the history log.
    const { data: before } = await supabase
      .from('living_site_genome')
      .select('value')
      .eq('tenant', GENOME_TENANT)
      .eq('fact_id', id)
      .maybeSingle();

    const now = new Date().toISOString();
    // Update only — facts are born in migrations/ops flows, never from here.
    // An owner edit is the strongest provenance there is: confirmed, now.
    let { data, error } = await supabase
      .from('living_site_genome')
      .update({
        value: v,
        updated_at: now,
        source: 'owner-edit',
        verification: 'confirmed',
        verified_at: now,
      })
      .eq('tenant', GENOME_TENANT)
      .eq('fact_id', id)
      .select('fact_id');
    if (error) {
      // Provenance columns may not exist yet (migration 20260722090000
      // pending on this database) — never let that block an owner edit.
      ({ data, error } = await supabase
        .from('living_site_genome')
        .update({ value: v, updated_at: now })
        .eq('tenant', GENOME_TENANT)
        .eq('fact_id', id)
        .select('fact_id'));
    }
    if (error) return { ok: false, message: 'The database write failed — try again.' };
    if (!data || data.length === 0) {
      return { ok: false, message: 'That fact isn’t in the live genome yet.' };
    }

    // Append-only edit history — best-effort, never blocks the edit.
    try {
      await supabase.from('living_site_genome_history').insert({
        tenant: GENOME_TENANT,
        fact_id: id,
        old_value: before?.value ?? null,
        new_value: v,
        new_verification: 'confirmed',
        source: 'owner-edit',
        actor: 'ops-console',
      });
    } catch {
      /* history table pending — the edit itself already succeeded */
    }
  } catch {
    return { ok: false, message: 'The database is unreachable right now.' };
  }

  // Every surface that reads the genome re-renders with the new value.
  revalidatePath('/living-site');
  revalidatePath('/living-site/dog-training');
  revalidatePath('/customers/auckland-dog-trainer/ops');
  return { ok: true };
}
