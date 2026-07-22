'use server';

/**
 * Server actions for the journey experience. The model call and all persistence
 * happen here — never in the client component. Each action degrades safely: a
 * missing API key or unreachable database falls back rather than throwing.
 */

import type { IntentParseResult } from '@/lib/journey/services/intent';
import { resolveIntentService } from '@/lib/journey/services/intent-live';
import type { JourneyRun } from '@/lib/journey/types';
import { SupabaseJourneyRepository } from '@/lib/journey/repository-supabase';

const repo = new SupabaseJourneyRepository();

/** Structure a natural-language intent with the model (or deterministic fallback). */
export async function structureIntentAction(statedIntent: string): Promise<IntentParseResult> {
  return resolveIntentService().parse(statedIntent);
}

/** Persist a run. Fire-and-forget from the client; never throws. */
export async function persistJourneyRunAction(run: JourneyRun): Promise<{ ok: boolean }> {
  try {
    await repo.saveRun(run);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/** Resume a persisted run by id, scoped to its tenant. */
export async function loadJourneyRunAction(
  tenantId: string,
  runId: string,
): Promise<JourneyRun | null> {
  try {
    return await repo.getRun(tenantId, runId);
  } catch {
    return null;
  }
}
