'use server';

import { revalidatePath } from 'next/cache';
import { ensureAdmin } from '@/lib/admin/ensureAdmin';
import { getServiceClient } from '@/lib/supabase/service';
import { isMarketplaceAgent } from '@/lib/marketplace/agents';

const STATUSES = ['live', 'draft', 'archived'] as const;
type AgentDbStatus = (typeof STATUSES)[number];

/**
 * Set an agent's catalogue status (live / draft / archived) in the `agents`
 * mirror table. The locked system prompt lives in code and is never written
 * here — this only controls catalogue visibility/state. Admin-gated; RLS on the
 * table stays intact (we write with the service role only after ensureAdmin()).
 */
export async function setAgentStatus(formData: FormData) {
  await ensureAdmin();

  const slug = String(formData.get('slug') ?? '');
  const next = String(formData.get('status') ?? '');
  if (!isMarketplaceAgent(slug) || !STATUSES.includes(next as AgentDbStatus)) return;

  try {
    const sb = getServiceClient();
    await sb.from('agents').update({ status: next }).eq('slug', slug);
  } catch {
    // Mirror table may not exist in this environment — fail soft.
  }

  revalidatePath('/admin/agents');
  revalidatePath(`/admin/agents/${slug}`);
}
