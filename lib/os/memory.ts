/**
 * Operating memory — what the system learns from completed work.
 *
 * (Brief §2 "Goals and health" / Phase 5 seed, docs/AGENTIC-OS-ARCHITECTURE.md.)
 * When the desk agent meets a question the genome cannot answer, the
 * question itself becomes a SUGGESTED genome fact — never confirmed, never
 * used to ground a commitment, capped so suggestions can't flood the
 * genome. A human confirms or discards it in the console; the Intelligence
 * surface already counts unverified facts and points the owner at them.
 */
import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import { addEvidence } from './evidence';

/** Hard ceiling on open suggestions per tenant — learning, not noise. */
const SUGGESTION_CAP = 5;

/** Deterministic id for a question so repeats collapse onto one row. */
export function suggestionFactId(question: string): string {
  let h = 5381;
  const q = question.toLowerCase().replace(/\s+/g, ' ').trim();
  for (let i = 0; i < q.length; i++) h = ((h << 5) + h + q.charCodeAt(i)) | 0;
  return `g-sug-${(h >>> 0).toString(36)}`;
}

/**
 * File an unanswered customer question as a suggested genome fact.
 * Fail-soft and idempotent: repeats of the same question land on the same
 * row, the cap keeps the genome calm, and nothing here ever blocks the
 * reply that triggered it.
 */
export async function suggestFactFromQuestion(input: {
  tenant: string;
  question: string;
  taskId?: string;
}): Promise<boolean> {
  const value = input.question.replace(/\s+/g, ' ').trim().slice(0, 200);
  if (value.length < 12) return false;
  try {
    const supabase = getServiceClient();
    const { count } = await supabase
      .from('living_site_genome')
      .select('fact_id', { count: 'exact', head: true })
      .eq('tenant', input.tenant)
      .eq('verification', 'suggested');
    if ((count ?? 0) >= SUGGESTION_CAP) return false;

    const factId = suggestionFactId(value);
    const { error } = await supabase.from('living_site_genome').upsert(
      {
        tenant: input.tenant,
        fact_id: factId,
        section: 'knowledge',
        label: 'Customers are asking',
        value,
        read_by: [],
        source: 'agent-desk',
        verification: 'suggested',
        confidence: 0.4,
      },
      { onConflict: 'tenant,fact_id', ignoreDuplicates: true },
    );
    if (error) return false;

    await addEvidence({
      tenant: input.tenant,
      taskId: input.taskId,
      kind: 'note',
      summary: `The genome couldn't answer this, so it was filed as a suggested fact for review: "${value.slice(0, 120)}"`,
      refs: { factId, verification: 'suggested' },
    });
    return true;
  } catch {
    return false;
  }
}
