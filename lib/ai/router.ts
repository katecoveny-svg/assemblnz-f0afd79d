/**
 * Multi-provider model router with a free-fallback ladder.
 *
 * Ladder (the amendment's spec, per agent):
 *   1. Primary  — the model matched to the agent's tier (Claude via Anthropic)
 *   2. Gemini 2.5 Flash  (Google free tier)
 *   3. Groq Llama 3.3 70B  (Groq free tier)
 *   4. local Ollama  (on-prem / power users)
 *
 * Built on the Vercel AI SDK. The non-Anthropic rungs are reached through the
 * OpenAI-compatible endpoint each provider exposes, so the whole ladder runs on
 * the already-installed `@ai-sdk/openai` + `@ai-sdk/anthropic` — no extra deps.
 *
 * FAIL-OPEN: a rung is only included when its credential is configured, so a
 * missing key transparently drops to the next rung (the agent keeps answering).
 * Use:
 *   - `resolveModelLadder()` + `pickRung()` for streaming routes (selection-time
 *     fallback by availability; mid-stream provider errors are logged via the
 *     route's `onError` — true mid-stream failover is a documented follow-up).
 *   - `generateWithFallback()` for non-streaming callers (ambient nudges,
 *     handoffs): real sequential failover with logging.
 *
 * Server-only.
 */
import 'server-only';
import { anthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, type LanguageModel, type ModelMessage } from 'ai';
import { recordModelFallback } from './fallback-log';

export type ModelRung = {
  /** ladder id, e.g. 'claude-sonnet-4-6', 'gemini-2.5-flash', 'groq:llama-3.3-70b-versatile' */
  id: string;
  /** short human label shown in disclosures / telemetry */
  label: string;
  model: LanguageModel;
  isPrimary: boolean;
};

/** Self-disclosure appended to the system prompt when running on a fallback. */
export const FALLBACK_DISCLOSURE =
  'You are currently running on a lighter fallback model, not the primary. ' +
  'If quality matters for this task, tell the user plainly — "I am on a lighter ' +
  'model right now; I can retry on the full model when it is back" — and offer the retry.';

function geminiProvider() {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;
  return createOpenAI({
    apiKey,
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  });
}

function groqProvider() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  return createOpenAI({ apiKey, baseURL: 'https://api.groq.com/openai/v1' });
}

function ollamaProvider() {
  // Only when explicitly configured (serverless can't reach localhost).
  const baseURL = process.env.OLLAMA_BASE_URL;
  if (!baseURL) return null;
  return createOpenAI({ apiKey: process.env.OLLAMA_API_KEY ?? 'ollama', baseURL });
}

/**
 * Build the ordered, availability-filtered ladder for one agent.
 * @param primaryModelId concrete Anthropic id from the agent's tier
 * @param fallbackModels the agent's `fallbackModels` ladder ids
 */
export function resolveModelLadder(
  primaryModelId: string,
  fallbackModels: readonly string[],
): ModelRung[] {
  const rungs: ModelRung[] = [];

  if (process.env.ANTHROPIC_API_KEY && primaryModelId.startsWith('claude')) {
    rungs.push({ id: primaryModelId, label: 'Primary', model: anthropic(primaryModelId), isPrimary: true });
  }

  for (const id of fallbackModels) {
    if (id.startsWith('gemini')) {
      const p = geminiProvider();
      if (p) rungs.push({ id, label: 'Gemini 2.5 Flash', model: p(id), isPrimary: false });
    } else if (id.startsWith('groq:')) {
      const p = groqProvider();
      if (p) rungs.push({ id, label: 'Groq Llama 3.3', model: p(id.slice('groq:'.length)), isPrimary: false });
    } else if (id.startsWith('ollama:')) {
      const p = ollamaProvider();
      if (p) rungs.push({ id, label: 'Ollama (local)', model: p(id.slice('ollama:'.length)), isPrimary: false });
    }
  }

  return rungs;
}

/** The highest-priority configured rung (primary if available, else first fallback). */
export function pickRung(ladder: ModelRung[]): ModelRung | null {
  return ladder[0] ?? null;
}

/**
 * Non-streaming generate with true sequential fallback. Tries each rung in
 * order; on error logs to model_fallback_events and drops to the next. Returns
 * the first success, or fail-open `{ ok: false }` if every rung is exhausted.
 */
export async function generateWithFallback(opts: {
  ladder: ModelRung[];
  system: string;
  messages: ModelMessage[];
  agentSlug?: string | null;
  userId?: string | null;
  /** model_calls ledger context (migration 20260722093000). */
  tenant?: string | null;
  taskId?: string | null;
}): Promise<{ ok: true; text: string; rung: ModelRung } | { ok: false }> {
  const { ladder, messages, agentSlug, userId } = opts;
  const { recordModelCall, providerFromModelId } = await import('./call-log');
  for (let i = 0; i < ladder.length; i++) {
    const rung = ladder[i];
    const system = rung.isPrimary ? opts.system : `${opts.system}\n\n${FALLBACK_DISCLOSURE}`;
    const started = Date.now();
    try {
      const { text, usage } = await generateText({ model: rung.model, system, messages });
      void recordModelCall({
        tenant: opts.tenant,
        agent: agentSlug,
        taskId: opts.taskId,
        provider: providerFromModelId(rung.id),
        model: rung.id,
        fallbackFrom: i > 0 ? ladder[0].id : null,
        latencyMs: Date.now() - started,
        tokensIn: usage?.inputTokens,
        tokensOut: usage?.outputTokens,
        ok: true,
      });
      return { ok: true, text, rung };
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      void recordModelCall({
        tenant: opts.tenant,
        agent: agentSlug,
        taskId: opts.taskId,
        provider: providerFromModelId(rung.id),
        model: rung.id,
        fallbackFrom: i > 0 ? ladder[0].id : null,
        latencyMs: Date.now() - started,
        ok: false,
        error: reason,
      });
      await recordModelFallback({
        agentSlug,
        userId,
        primaryModel: rung.id,
        fallbackModel: ladder[i + 1]?.id ?? null,
        reason,
      });
    }
  }
  return { ok: false };
}
