/**
 * Model-call ledger writer — one row per LLM call through the router
 * (table model_calls, migration 20260722093000). Fire-and-forget and
 * fail-soft: telemetry must never break a reply.
 */
import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';

export type ModelCallRecord = {
  tenant?: string | null;
  agent?: string | null;
  taskId?: string | null;
  provider: string;
  model: string;
  fallbackFrom?: string | null;
  latencyMs?: number;
  tokensIn?: number;
  tokensOut?: number;
  ok: boolean;
  error?: string | null;
};

export function providerFromModelId(id: string): string {
  if (id.startsWith('claude')) return 'anthropic';
  if (id.startsWith('gemini')) return 'google';
  if (id.startsWith('groq:')) return 'groq';
  if (id.startsWith('ollama:')) return 'ollama';
  if (id.startsWith('gpt')) return 'openai';
  return 'unknown';
}

export async function recordModelCall(record: ModelCallRecord): Promise<void> {
  try {
    const supabase = getServiceClient();
    await supabase.from('model_calls').insert({
      tenant: record.tenant ?? null,
      agent: record.agent ?? null,
      task_id: record.taskId ?? null,
      provider: record.provider,
      model: record.model,
      fallback_from: record.fallbackFrom ?? null,
      latency_ms: record.latencyMs ?? null,
      tokens_in: record.tokensIn ?? null,
      tokens_out: record.tokensOut ?? null,
      ok: record.ok,
      error: record.error?.slice(0, 500) ?? null,
    });
  } catch {
    /* fail-soft */
  }
}
