/**
 * DO runtime — Assembl hosts inference by default.
 *
 * Product posture:
 * - Personal / Pro: Assembl-hosted (included in subscription)
 * - Enterprise BYO: later opt-in via DO_RUNTIME=byo + OPENAI_API_KEY
 *
 * Inference spine:
 * - Prefer OpenAI Agents SDK (`@openai/agents`) for compile / Clear / hard jobs
 *   when an OpenAI-compatible key is present (agent + tools + guardrails + HITL).
 * - Otherwise thin TypeScript orchestrator matching the same concepts
 *   (sessions, handoffs, HITL) — not a fake SDK, the durable DO contract.
 *
 * FAIL-OPEN: without provider keys, compile + Clear still run and label
 * “Assembl runtime · DEMO”.
 */

import 'server-only';
import { clearHeuristics, type ClearMark } from './clear';
import { compileAgent } from './compile';
import type { CompileRequest, CompileResponse } from './types';
import type {
  DoRuntimeCapability,
  DoRuntimeMode,
  DoRuntimeProvider,
  DoRuntimeStatus,
} from './runtime-status';
import { resolveDoSpineAsync } from './spine';

export type { ClearMark } from './clear';
export type {
  DoRuntimeMode,
  DoRuntimeProvider,
  DoRuntimeCapability,
  DoRuntimeStatus,
} from './runtime-status';

export type ClearRewriteResult = {
  original: string;
  rewritten: string;
  marks: ClearMark[];
  runtime: DoRuntimeStatus;
  spine?: string;
  sessionId?: string;
};

function envMode(): DoRuntimeMode {
  const raw = (process.env.DO_RUNTIME || 'assembl').trim().toLowerCase();
  return raw === 'byo' ? 'byo' : 'assembl';
}

function hasAssemblLadderKey(): boolean {
  return Boolean(
    process.env.ANTHROPIC_API_KEY ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GROQ_API_KEY ||
      process.env.XAI_API_KEY ||
      process.env.OLLAMA_BASE_URL,
  );
}

function hasByoKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY);
}

function hasOpenAiKey(): boolean {
  return hasByoKey();
}

/** Resolve current runtime posture for chips + docs. */
export function getDoRuntimeStatus(): DoRuntimeStatus {
  const mode = envMode();
  const spine = hasOpenAiKey() ? 'openai-sdk' : 'orchestrator';

  if (mode === 'byo') {
    if (hasByoKey()) {
      return {
        mode: 'byo',
        provider: 'byo',
        capability: 'live',
        label: 'BYO runtime',
        note: 'DO_RUNTIME=byo with OpenAI / gateway key — Enterprise-style bring-your-own.',
        spine,
      };
    }
    return {
      mode: 'byo',
      provider: 'byo',
      capability: 'demo',
      label: 'BYO · DEMO',
      note: 'DO_RUNTIME=byo but no OPENAI_API_KEY / AI_GATEWAY_API_KEY — orchestrator DEMO.',
      spine: 'orchestrator',
    };
  }

  if (hasAssemblLadderKey() || hasByoKey()) {
    return {
      mode: 'assembl',
      provider: 'assemblHosted',
      capability: 'live',
      label: hasOpenAiKey() ? 'Assembl runtime · Agents SDK' : 'Assembl runtime',
      note: hasOpenAiKey()
        ? 'Assembl-hosted via OpenAI Agents SDK (Personal / Pro).'
        : 'Assembl-hosted via model ladder + DO orchestrator spine (Personal / Pro).',
      spine,
    };
  }

  return {
    mode: 'assembl',
    provider: 'assemblHosted',
    capability: 'demo',
    label: 'Assembl runtime · DEMO',
    note: 'No model keys — orchestrator spine keeps compile + Clear + HITL wired.',
    spine: 'orchestrator',
  };
}

/**
 * Compile via Agents SDK spine (or orchestrator). Always fails open to
 * deterministic compileAgent so UX stays wired.
 */
export async function runtimeCompile(
  input: CompileRequest,
): Promise<CompileResponse & { runtime: DoRuntimeStatus; sessionId?: string; spine?: string }> {
  const runtime = getDoRuntimeStatus();
  const spine = await resolveDoSpineAsync(getDoRuntimeStatus);
  const result = await spine.compile(input);

  if (result.ok) {
    // If Assembl live without OpenAI, optionally polish name via ladder.
    if (
      runtime.capability === 'live' &&
      runtime.spine === 'orchestrator' &&
      hasAssemblLadderKey()
    ) {
      try {
        const polished = await refineCompileWithModel(input, result.output, runtime);
        return {
          ...polished,
          runtime: { ...runtime, spine: 'orchestrator' },
          sessionId: result.session.id,
          spine: result.spine,
        };
      } catch {
        /* keep spine output */
      }
    }
    return {
      ...result.output,
      runtime: { ...result.runtime, spine: result.spine },
      sessionId: result.session.id,
      spine: result.spine,
    };
  }

  const base = compileAgent(input);
  return {
    ...base,
    honesty: `${base.honesty} · ${runtime.label}`,
    runtime,
  };
}

async function refineCompileWithModel(
  input: CompileRequest,
  base: CompileResponse,
  runtime: DoRuntimeStatus,
): Promise<CompileResponse> {
  const { generateWithFallback, resolveModelLadder } = await import('@/lib/ai/router');
  const ladder = resolveModelLadder('claude-sonnet-4-6', [
    'gemini-2.5-flash',
    'groq:llama-3.3-70b-versatile',
  ]);
  if (ladder.length === 0) return base;

  const brief = input.brief || base.spec.brief;
  const result = await generateWithFallback({
    ladder,
    system:
      'You refine DO agent briefs. Reply with ONE short agent display name (max 48 chars). No quotes, no explanation. DO is a portable agent object product — not a chatbot.',
    messages: [{ role: 'user', content: `Brief: ${brief}\nPrimitive: ${base.spec.primitive}` }],
    agentSlug: 'do-runtime',
    tenant: 'do',
    taskId: 'compile-name',
    maxOutputTokens: 48,
  });

  if (!result.ok) return base;
  const name = result.text.trim().replace(/^["']|["']$/g, '').slice(0, 48);
  if (!name) return base;
  return {
    spec: {
      ...base.spec,
      name,
      lastNote: `Compiled via ${runtime.label}. Not active yet — review, then activate.`,
    },
    honesty: `${base.honesty} · ${runtime.label}`,
  };
}

/** Clear rewrite — Agents SDK / orchestrator + underlines. */
export async function runtimeClearRewrite(text: string): Promise<ClearRewriteResult> {
  const runtime = getDoRuntimeStatus();
  const spine = await resolveDoSpineAsync(getDoRuntimeStatus);
  const result = await spine.clear(text);

  if (result.ok) {
    return {
      ...result.output,
      runtime: { ...result.runtime, spine: result.spine },
      spine: result.spine,
      sessionId: result.session.id,
    };
  }

  const heuristic = clearHeuristics(text.slice(0, 4_000));
  return { ...heuristic, runtime };
}

/** Astra-class hard job through spine (SDK handoff or orchestrator). */
export async function runtimeAstraHardJob(input: {
  brief: string;
  contextSummary: string;
}): Promise<{
  draft: string;
  honesty: string;
  runtime: DoRuntimeStatus;
  sessionId?: string;
  spine?: string;
  interruptions?: Array<{ id: string; reason: string }>;
}> {
  const runtime = getDoRuntimeStatus();
  const spine = await resolveDoSpineAsync(getDoRuntimeStatus);
  const result = await spine.hardJob(input);

  if (result.ok) {
    return {
      draft: result.output.draft,
      honesty: result.output.honesty,
      runtime: { ...result.runtime, spine: result.spine },
      sessionId: result.session.id,
      spine: result.spine,
      interruptions: result.interruptions.map((i) => ({ id: i.id, reason: i.reason })),
    };
  }

  return {
    draft: `DEMO hard-job stub · ${input.brief.slice(0, 80)}`,
    honesty: `${result.error} · ${runtime.label}`,
    runtime,
  };
}

export { clearHeuristics } from './clear';
