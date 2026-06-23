/**
 * Pilot draft store — server-side CRUD for public.pilot_agents.
 *
 * Uses the cookie-aware Supabase server client so RLS (owner_id = auth.uid())
 * does the authorisation. Callers must be authenticated; getOwner() returns the
 * current user id or null.
 *
 * Server-only.
 */
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { PilotDraft, DraftStatus } from './types';

/** Shape returned to the UI for the My Agents list + flow hydration. */
export interface StoredDraft extends PilotDraft {
  id: string;
  status: DraftStatus;
  updatedAt: string;
}

/**
 * The current authenticated user's id, or null. Fail-safe: if Supabase is not
 * configured (e.g. local dev without env) or there is no session, returns null
 * so the guided Pilot flow still renders for everyone — auth is only needed to
 * save or ship.
 */
export async function getOwner(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

function rowToDraft(row: Record<string, unknown>): StoredDraft {
  return {
    id: row.id as string,
    slug: (row.slug as string) ?? '',
    name: (row.name as string) ?? '',
    teReo: (row.te_reo as string) ?? '',
    description: (row.description as string) ?? '',
    category: (row.category as string) ?? 'build',
    icon: (row.icon as string) ?? 'spark',
    accent: (row.accent as string) ?? '#FFD42A',
    goal: (row.goal as PilotDraft['goal']) ?? { output: '', audience: '', frequency: '' },
    inputs: (row.inputs as PilotDraft['inputs']) ?? { needs: [], access: [] },
    tools: (row.tools as string[]) ?? [],
    compliance: (row.compliance as string[]) ?? [],
    modelPreference: (row.model_preference as PilotDraft['modelPreference']) ?? 'claude',
    systemPrompt: (row.system_prompt as string) ?? '',
    priceTier: (row.price_tier as PilotDraft['priceTier']) ?? 'free',
    status: (row.status as DraftStatus) ?? 'draft',
    updatedAt: (row.updated_at as string) ?? '',
  };
}

/** List the current user's drafts, newest first. */
export async function listDrafts(): Promise<StoredDraft[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('pilot_agents')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error || !data) return [];
  return data.map(rowToDraft);
}

/** Fetch one draft owned by the current user. */
export async function getDraft(id: string): Promise<StoredDraft | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('pilot_agents').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return rowToDraft(data);
}

/**
 * Upsert a draft for the current user. Returns the stored draft (with id), or
 * null if not authenticated / the write was denied by RLS.
 */
export async function saveDraft(
  ownerId: string,
  draft: PilotDraft,
  status: DraftStatus = 'draft',
): Promise<StoredDraft | null> {
  const supabase = await createClient();

  const record = {
    owner_id: ownerId,
    slug: draft.slug || 'my-agent',
    name: draft.name,
    te_reo: draft.teReo || null,
    description: draft.description,
    category: draft.category || 'build',
    icon: draft.icon || 'spark',
    accent: draft.accent || '#FFD42A',
    goal: draft.goal,
    inputs: draft.inputs,
    tools: draft.tools,
    compliance: draft.compliance,
    model_preference: draft.modelPreference,
    system_prompt: draft.systemPrompt,
    price_tier: draft.priceTier,
    status,
    updated_at: new Date().toISOString(),
  };

  // Update in place when we already have an id; otherwise insert. (We avoid a
  // blind upsert on (owner_id, slug) so renaming an agent doesn't collide.)
  if (draft.id) {
    const { data, error } = await supabase
      .from('pilot_agents')
      .update(record)
      .eq('id', draft.id)
      .select('*')
      .maybeSingle();
    if (error || !data) return null;
    return rowToDraft(data);
  }

  const { data, error } = await supabase
    .from('pilot_agents')
    .insert(record)
    .select('*')
    .maybeSingle();
  if (error || !data) return null;
  return rowToDraft(data);
}

/** Update Stripe + receipt linkage + status after a ship. Service-side fields. */
export async function attachShipMetadata(
  draftId: string,
  patch: { status?: DraftStatus; stripeProductId?: string | null; stripePriceId?: string | null; manaReceiptId?: string },
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from('pilot_agents')
    .update({
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.stripeProductId !== undefined ? { stripe_product_id: patch.stripeProductId } : {}),
      ...(patch.stripePriceId !== undefined ? { stripe_price_id: patch.stripePriceId } : {}),
      ...(patch.manaReceiptId ? { mana_receipt_id: patch.manaReceiptId } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', draftId);
}
