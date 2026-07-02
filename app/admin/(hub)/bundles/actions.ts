'use server';

import { revalidatePath } from 'next/cache';
import { ensureAdmin } from '@/lib/admin/ensureAdmin';
import { getServiceClient } from '@/lib/supabase/service';
import { isMarketplaceAgent } from '@/lib/marketplace/agents';

/**
 * Bundles CRUD server actions. Writes go through the service role only after
 * ensureAdmin(); the bundles table keeps its RLS (public read of live rows,
 * admin write policy from 20260701093000).
 *
 * Membership respects the bundle / is_bundle_lead / parent_slug columns from
 * migration 20260701093000 — assigning an agent sets agents.bundle; removing
 * clears bundle AND is_bundle_lead (a lead can't lead a bundle it left).
 */

const BUNDLE_SLUGS = ['assembler', 'forge', 'ensemble', 'practice', 'hearth', 'counsel', 'visa'] as const;

function isBundleSlug(v: string): v is (typeof BUNDLE_SLUGS)[number] {
  return (BUNDLE_SLUGS as readonly string[]).includes(v);
}

/** Update a bundle's card: name, tagline (short_pitch), price, order, status, lead. */
export async function updateBundle(formData: FormData) {
  await ensureAdmin();

  const slug = String(formData.get('slug') ?? '');
  if (!isBundleSlug(slug)) return;

  const name = String(formData.get('name') ?? '').trim();
  const shortPitch = String(formData.get('short_pitch') ?? '').trim();
  const leadAgent = String(formData.get('lead_agent_slug') ?? '').trim();
  const monthly = Number(formData.get('monthly_nzd'));
  const sortOrder = Number(formData.get('sort_order'));
  const status = String(formData.get('status') ?? '');

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (name) patch.name = name;
  if (shortPitch) patch.short_pitch = shortPitch;
  if (leadAgent) patch.lead_agent_slug = leadAgent;
  if (Number.isFinite(monthly) && monthly >= 0) patch.monthly_nzd = monthly;
  if (Number.isFinite(sortOrder)) patch.sort_order = Math.trunc(sortOrder);
  if (status === 'live' || status === 'draft' || status === 'retired') patch.status = status;

  try {
    const sb = getServiceClient();
    await sb.from('bundles').update(patch).eq('slug', slug);
  } catch {
    // Fail soft in half-migrated environments.
  }

  revalidatePath('/admin/bundles');
}

/** Assign an agent to a bundle (or clear it with bundle=''). */
export async function setAgentBundle(formData: FormData) {
  await ensureAdmin();

  const agentSlug = String(formData.get('agent_slug') ?? '');
  const bundleRaw = String(formData.get('bundle') ?? '');
  if (!isMarketplaceAgent(agentSlug)) return;

  const bundle = isBundleSlug(bundleRaw) ? bundleRaw : null;
  const patch: Record<string, unknown> = { bundle, updated_at: new Date().toISOString() };
  if (!bundle) patch.is_bundle_lead = false;

  try {
    const sb = getServiceClient();
    await sb.from('agents').update(patch).eq('slug', agentSlug);
  } catch {
    // Fail soft.
  }

  revalidatePath('/admin/bundles');
  revalidatePath(`/admin/agents/${agentSlug}`);
}
