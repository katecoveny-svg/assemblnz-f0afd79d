/**
 * Pilot draft store — server-side CRUD for public.pilot_agents.
 *
 * Uses the cookie-aware Supabase server client so RLS (owner_id = auth.uid())
 * does the authorisation. getOwner() is fail-safe (returns null when Supabase is
 * unconfigured or there is no session) so the guided flow renders for everyone;
 * auth is only needed to save or ship.
 *
 * The row carries the structured `spec` (steps 1–7) and the generated `pack`
 * (19 items), plus the lightweight identity fields used by the marketplace card.
 *
 * Server-only.
 */
import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { PilotDraft, DraftStatus, PilotSpec, AgentPack } from './types';
import { emptyDraft } from './types';

export interface StoredDraft extends PilotDraft {
  id: string;
  status: DraftStatus;
  updatedAt: string;
}

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
  const base = emptyDraft();
  const specRow = row.spec as PilotSpec | undefined;
  const packRow = row.pack as AgentPack | undefined;
  return {
    id: row.id as string,
    slug: (row.slug as string) ?? '',
    name: (row.name as string) ?? '',
    teReo: (row.te_reo as string) ?? '',
    description: (row.description as string) ?? '',
    category: (row.category as string) ?? 'build',
    icon: (row.icon as string) ?? 'spark',
    accent: (row.accent as string) ?? '#BFA37A',
    spec: specRow && Object.keys(specRow).length ? specRow : base.spec,
    pack: packRow && Object.keys(packRow).length ? packRow : null,
    modelPreference: (row.model_preference as PilotDraft['modelPreference']) ?? 'claude',
    priceTier: (row.price_tier as PilotDraft['priceTier']) ?? 'free',
    status: (row.status as DraftStatus) ?? 'draft',
    updatedAt: (row.updated_at as string) ?? '',
  };
}

export async function listDrafts(): Promise<StoredDraft[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('pilot_agents')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error || !data) return [];
  return data.map(rowToDraft);
}

export async function getDraft(id: string): Promise<StoredDraft | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('pilot_agents').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return rowToDraft(data);
}

/** Map a draft to the DB row shape. */
function toRecord(ownerId: string, draft: PilotDraft, status: DraftStatus) {
  return {
    owner_id: ownerId,
    slug: draft.slug || 'my-agent',
    name: draft.name,
    te_reo: draft.teReo || null,
    description: draft.description,
    category: draft.category || 'build',
    icon: draft.icon || 'spark',
    accent: draft.accent || '#BFA37A',
    spec: draft.spec,
    pack: draft.pack ?? {},
    agent_type: draft.spec?.agentType ?? null,
    model_preference: draft.modelPreference,
    // Mirror the system prompt in its own column for the sandbox/server.
    system_prompt: draft.pack?.systemPrompt ?? '',
    price_tier: draft.priceTier,
    status,
    updated_at: new Date().toISOString(),
  };
}

/** Upsert a draft for the current user. */
export async function saveDraft(
  ownerId: string,
  draft: PilotDraft,
  status: DraftStatus = 'draft',
): Promise<StoredDraft | null> {
  const supabase = await createClient();
  const record = toRecord(ownerId, draft, status);

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
