'use server';

import { revalidatePath } from 'next/cache';
import { ensureAdmin } from '@/lib/admin/ensureAdmin';
import { getServiceClient } from '@/lib/supabase/service';
import { ASSEMBL_TENANT } from '@/lib/customers/assembl/genome';

export type GenomeActionResult = { ok: boolean; message?: string };

const SECTIONS = new Set(['identity', 'services', 'team', 'knowledge', 'proof', 'operations']);
const SURFACES = new Set([
  'website',
  'booking',
  'proposals',
  'faq',
  'voice',
  'support',
  'email',
  'crm',
  'course',
  'social',
]);

/**
 * Edit one fact on assembl's OWN genome — Kate's operator write, behind
 * ensureAdmin() (never the shared demo credential; this is real business
 * data, not the fictional cast). An owner edit is the strongest provenance
 * there is: confirmed, now. Every ripple reader (site, ad studio, operating
 * loop) picks the new value up on next load.
 */
export async function updateAssemblFactAction(
  factId: string,
  value: string,
): Promise<GenomeActionResult> {
  await ensureAdmin();

  const id = factId.trim();
  const v = value.trim().slice(0, 300);
  if (!/^g-[a-z0-9-]{1,40}$/.test(id) || v.length === 0) {
    return { ok: false, message: 'That edit doesn’t look right — value can’t be empty.' };
  }

  try {
    const supabase = getServiceClient();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('living_site_genome')
      .update({
        value: v,
        updated_at: now,
        source: 'owner-edit',
        verification: 'confirmed',
        verified_at: now,
      })
      .eq('tenant', ASSEMBL_TENANT)
      .eq('fact_id', id)
      .select('fact_id')
      .maybeSingle();
    if (error) return { ok: false, message: 'Could not save that just now.' };
    if (!data) return { ok: false, message: 'That fact isn’t in the live genome yet.' };
    revalidatePath('/admin/genome');
    revalidatePath('/genome');
    return { ok: true };
  } catch {
    return { ok: false, message: 'Could not reach the database.' };
  }
}

/**
 * Add a new fact to assembl's genome. Facts added here are owner-confirmed
 * from birth. The fact id is derived from the label; read_by starts with
 * the surfaces chosen.
 */
export async function addAssemblFactAction(input: {
  section: string;
  label: string;
  value: string;
  readBy: string[];
}): Promise<GenomeActionResult> {
  await ensureAdmin();

  const section = SECTIONS.has(input.section) ? input.section : 'operations';
  const label = input.label.trim().slice(0, 60);
  const value = input.value.trim().slice(0, 300);
  const readBy = input.readBy.filter((s) => SURFACES.has(s)).slice(0, 10);
  if (!label || !value) {
    return { ok: false, message: 'A label and a value are both needed.' };
  }

  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 36);
  if (!slug) return { ok: false, message: 'Could not make an id from that label.' };
  const factId = `g-${slug}`;

  try {
    const supabase = getServiceClient();
    const now = new Date().toISOString();
    const { error } = await supabase.from('living_site_genome').insert({
      tenant: ASSEMBL_TENANT,
      fact_id: factId,
      section,
      label,
      value,
      read_by: readBy.length ? readBy : ['website'],
      source: 'owner-edit',
      verification: 'confirmed',
      verified_at: now,
      updated_at: now,
    });
    if (error) {
      const duplicate = /duplicate|unique/i.test(error.message);
      return {
        ok: false,
        message: duplicate ? 'A fact with that label already exists — edit it instead.' : 'Could not save that just now.',
      };
    }
    revalidatePath('/admin/genome');
    revalidatePath('/genome');
    return { ok: true };
  } catch {
    return { ok: false, message: 'Could not reach the database.' };
  }
}
