'use server';

import { revalidatePath } from 'next/cache';
import { ensureAdmin } from '@/lib/admin/ensureAdmin';
import { getServiceClient } from '@/lib/supabase/service';

/**
 * Knowledge registry server actions (Tier A pipeline, migration
 * 20260701090000). Service-role writes only after ensureAdmin(); RLS stays on.
 */

const TIERS = ['A', 'B', 'C'] as const;
const SOURCE_TYPES = ['api', 'rss', 'scrape'] as const;

/** Update a source's tier / cadence / staleness watermark / steward / active flag. */
export async function updateKnowledgeSource(formData: FormData) {
  await ensureAdmin();

  const sourceSlug = String(formData.get('source_slug') ?? '');
  if (!sourceSlug) return;

  const tier = String(formData.get('tier') ?? '');
  const cadence = Number(formData.get('refresh_cadence_days'));
  const staleness = Number(formData.get('staleness_threshold_days'));
  const steward = String(formData.get('steward') ?? '').trim();
  const active = formData.get('active') === 'on';

  const patch: Record<string, unknown> = { active, updated_at: new Date().toISOString() };
  if ((TIERS as readonly string[]).includes(tier)) patch.tier = tier;
  if (Number.isFinite(cadence) && cadence > 0) patch.refresh_cadence_days = Math.trunc(cadence);
  if (Number.isFinite(staleness) && staleness > 0) patch.staleness_threshold_days = Math.trunc(staleness);
  if (steward) patch.steward = steward;

  try {
    const sb = getServiceClient();
    await sb.from('knowledge_sources').update(patch).eq('source_slug', sourceSlug);
  } catch {
    // Fail soft in half-migrated environments.
  }

  revalidatePath('/admin/knowledge');
}

/** Register a new source in the Tier A/B/C registry. */
export async function addKnowledgeSource(formData: FormData) {
  const admin = await ensureAdmin();

  const sourceSlug = String(formData.get('source_slug') ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const sourceName = String(formData.get('source_name') ?? '').trim();
  const url = String(formData.get('url') ?? '').trim();
  const tier = String(formData.get('tier') ?? 'A');
  const sourceType = String(formData.get('source_type') ?? 'scrape');
  const cadence = Number(formData.get('refresh_cadence_days'));

  if (!sourceSlug || !sourceName) return;

  try {
    const sb = getServiceClient();
    await sb.from('knowledge_sources').upsert(
      {
        source_slug: sourceSlug,
        source_name: sourceName,
        url: url || null,
        tier: (TIERS as readonly string[]).includes(tier) ? tier : 'A',
        source_type: (SOURCE_TYPES as readonly string[]).includes(sourceType) ? sourceType : 'scrape',
        refresh_cadence_days: Number.isFinite(cadence) && cadence > 0 ? Math.trunc(cadence) : 7,
        steward: admin.email,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'source_slug' },
    );
  } catch {
    // Fail soft.
  }

  revalidatePath('/admin/knowledge');
}

/** Mark a steward alert as resolved. */
export async function resolveKnowledgeAlert(formData: FormData) {
  const admin = await ensureAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) return;

  try {
    const sb = getServiceClient();
    await sb
      .from('knowledge_alerts')
      .update({ resolved: true, resolved_at: new Date().toISOString(), resolved_by: admin.email })
      .eq('id', id);
  } catch {
    // Fail soft.
  }

  revalidatePath('/admin/knowledge');
}
