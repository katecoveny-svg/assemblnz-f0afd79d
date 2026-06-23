/**
 * Pilot Mana Receipts.
 *
 * Every Pilot action that matters — saved to My Agents, submitted for review,
 * published — gets a signed, hash-chained receipt in public.pilot_receipts.
 * Reuses the canonical chain math from lib/voice/hashing.ts so a Pilot receipt
 * verifies the same way a voice receipt does:
 *
 *   sha256     = sha256(canonical(payload))
 *   chain_hash = sha256(prev_hash || sha256)
 *
 * The chain is per-owner (each user has their own receipt book), so the
 * prev_hash walks that owner's most recent receipt. Service-role writes only.
 *
 * Server-only.
 */
import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import { GENESIS_PREV_HASH, hashPayload, chainHash } from '@/lib/voice/hashing';
import type { PilotDraft } from './types';

export type ReceiptAction = 'saved' | 'submitted' | 'published';

export interface PilotReceiptPayload {
  schema_version: 'pilot-1';
  action: ReceiptAction;
  agent: {
    id: string;
    slug: string;
    name: string;
    te_reo: string;
    category: string;
    model_preference: string;
    price_tier: string;
    tools: string[];
    compliance: string[];
    /** hash of the system prompt, not the prompt itself */
    system_prompt_sha256: string;
  };
  owner_id: string;
  signed_at: string;
}

export interface SignedReceipt {
  id: string;
  receipt_number: number;
  chain_hash: string;
  sha256: string;
  signed_at: string;
}

/** The most recent chain_hash for this owner, or the genesis seed. */
async function latestChainHash(ownerId: string): Promise<string> {
  const db = getServiceClient();
  const { data } = await db
    .from('pilot_receipts')
    .select('chain_hash')
    .eq('owner_id', ownerId)
    .order('receipt_number', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.chain_hash ?? (process.env.MANA_RECEIPT_PREV_HASH || GENESIS_PREV_HASH);
}

/**
 * Sign and persist a Mana Receipt for a Pilot action. Pure-ish: the hash math
 * is deterministic; only the timestamp and DB write are side effects.
 */
export async function signPilotReceipt(opts: {
  ownerId: string;
  pilotAgentId: string;
  draft: PilotDraft;
  action: ReceiptAction;
  signedAt: string;
}): Promise<SignedReceipt> {
  const { ownerId, pilotAgentId, draft, action, signedAt } = opts;

  const payload: PilotReceiptPayload = {
    schema_version: 'pilot-1',
    action,
    agent: {
      id: pilotAgentId,
      slug: draft.slug,
      name: draft.name,
      te_reo: draft.teReo,
      category: draft.category,
      model_preference: draft.modelPreference,
      price_tier: draft.priceTier,
      tools: [...draft.tools].sort(),
      compliance: [...draft.compliance].sort(),
      system_prompt_sha256: hashPayload(draft.systemPrompt),
    },
    owner_id: ownerId,
    signed_at: signedAt,
  };

  const prevHash = await latestChainHash(ownerId);
  const sha256 = hashPayload(payload);
  const chain = chainHash(prevHash, sha256);

  const db = getServiceClient();
  const { data, error } = await db
    .from('pilot_receipts')
    .insert({
      pilot_agent_id: pilotAgentId,
      owner_id: ownerId,
      action,
      payload_json: payload,
      sha256,
      prev_hash: prevHash,
      chain_hash: chain,
    })
    .select('id, receipt_number')
    .single();

  if (error) throw new Error(`Failed to sign Mana Receipt: ${error.message}`);

  return {
    id: data.id as string,
    receipt_number: Number(data.receipt_number),
    chain_hash: chain,
    sha256,
    signed_at: signedAt,
  };
}
