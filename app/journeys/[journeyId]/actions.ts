'use server';

/**
 * Server actions for the journey experience. The model call and all persistence
 * happen here — never in the client component. Guarded server-side: rate limited
 * (per IP), input-size limited, and schema-validated before any model/tool call.
 * Failures are reported to monitoring (redacted) and returned as calm messages.
 */

import { headers } from 'next/headers';
import type { IntentParseResult } from '@/lib/journey/services/intent';
import { resolveIntentService } from '@/lib/journey/services/intent-live';
import type { JourneyRun } from '@/lib/journey/types';
import { SupabaseJourneyRepository } from '@/lib/journey/repository-supabase';
import {
  checkRateLimit,
  clientIp,
  validateIntentInput,
  validateRunId,
  withinBytes,
  RUN_PAYLOAD_MAX_BYTES,
} from '@/lib/journey/guards';
import { reportJourneyError } from '@/lib/observability/journey-report';

const repo = new SupabaseJourneyRepository();

export type IntentActionResult =
  | { ok: true; result: IntentParseResult }
  | { ok: false; reason: 'rate_limited' | 'too_large' | 'empty' | 'error'; message: string; retryAfterSec?: number };

/** Structure a natural-language intent (rate-limited, size-limited, server-side). */
export async function structureIntentAction(statedIntent: unknown): Promise<IntentActionResult> {
  const ip = clientIp(await headers());

  const rate = checkRateLimit(ip, 'intent');
  if (!rate.allowed) {
    reportJourneyError({ kind: 'rate_limited', message: 'intent action rate limited', meta: { retryAfterSec: rate.retryAfterSec } });
    return { ok: false, reason: 'rate_limited', message: 'You’re going a little fast — please try again in a moment.', retryAfterSec: rate.retryAfterSec };
  }

  const input = validateIntentInput(statedIntent);
  if (!input.ok) {
    reportJourneyError({ kind: 'input_rejected', message: `intent input rejected: ${input.reason}` });
    return { ok: false, reason: input.reason, message: input.message };
  }

  try {
    const result = await resolveIntentService().parse(input.value);
    return { ok: true, result };
  } catch (err) {
    reportJourneyError({ kind: 'model_call_failed', message: err instanceof Error ? err.message : 'intent parse failed' });
    return { ok: false, reason: 'error', message: 'We couldn’t read that just now — please try again.' };
  }
}

/** Persist a run. Fire-and-forget from the client; never throws. */
export async function persistJourneyRunAction(run: JourneyRun): Promise<{ ok: boolean }> {
  if (!run || !validateRunId(run.id) || typeof run.tenantId !== 'string') return { ok: false };
  if (!withinBytes(run, RUN_PAYLOAD_MAX_BYTES)) {
    reportJourneyError({ kind: 'input_rejected', message: 'run payload too large', runId: run.id });
    return { ok: false };
  }
  try {
    await repo.saveRun(run);
    return { ok: true };
  } catch (err) {
    reportJourneyError({ kind: 'unhandled_server_error', message: 'saveRun failed', runId: run.id, meta: { err: err instanceof Error ? err.name : 'unknown' } });
    return { ok: false };
  }
}

/** Resume a persisted run by id, scoped to its tenant. */
export async function loadJourneyRunAction(
  tenantId: string,
  runId: string,
): Promise<JourneyRun | null> {
  if (typeof tenantId !== 'string' || !validateRunId(runId)) return null;
  try {
    return await repo.getRun(tenantId, runId);
  } catch {
    return null;
  }
}
