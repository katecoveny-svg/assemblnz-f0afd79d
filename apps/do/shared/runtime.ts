/**
 * DO runtime — Assembl hosts inference by default.
 *
 * Product posture:
 * - Personal / Pro: Assembl-hosted (included in subscription)
 * - Enterprise BYO: later opt-in via DO_RUNTIME=byo + OPENAI_API_KEY
 *
 * FAIL-OPEN: without provider keys, compile + Clear still run on
 * deterministic heuristics and label “Assembl runtime · DEMO”.
 */

import 'server-only';
import { clearHeuristics, type ClearMark } from './clear';
import { compileAgent } from './compile';
import { stubAstraProvider } from './router';
import type { CompileRequest, CompileResponse } from './types';

export type { ClearMark } from './clear';

export type DoRuntimeMode = 'assembl' | 'byo';

export type DoRuntimeProvider = 'assemblHosted' | 'byo';

export type DoRuntimeCapability = 'live' | 'demo';

export type DoRuntimeStatus = {
  mode: DoRuntimeMode;
  provider: DoRuntimeProvider;
  capability: DoRuntimeCapability;
  /** Chip label for UI honesty. */
  label: string;
  /** Plain-English note for README / telemetry. */
  note: string;
};

export type ClearRewriteResult = {
  original: string;
  rewritten: string;
  marks: ClearMark[];
  runtime: DoRuntimeStatus;
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

/** Resolve current runtime posture for chips + docs. */
export function getDoRuntimeStatus(): DoRuntimeStatus {
  const mode = envMode();
  if (mode === 'byo') {
    if (hasByoKey()) {
      return {
        mode: 'byo',
        provider: 'byo',
        capability: 'live',
        label: 'BYO runtime',
        note: 'DO_RUNTIME=byo with OpenAI / gateway key — Enterprise-style bring-your-own.',
      };
    }
    return {
      mode: 'byo',
      provider: 'byo',
      capability: 'demo',
      label: 'BYO · DEMO',
      note: 'DO_RUNTIME=byo but no OPENAI_API_KEY / AI_GATEWAY_API_KEY — deterministic DEMO.',
    };
  }

  if (hasAssemblLadderKey() || hasByoKey()) {
    return {
      mode: 'assembl',
      provider: 'assemblHosted',
      capability: 'live',
      label: 'Assembl runtime',
      note: 'Assembl-hosted inference via existing model ladder (Personal / Pro default).',
    };
  }

  return {
    mode: 'assembl',
    provider: 'assemblHosted',
    capability: 'demo',
    label: 'Assembl runtime · DEMO',
    note: 'No model keys configured — deterministic compile + Clear heuristics still wired.',
  };
}

/**
 * Compile via Assembl-hosted default (or BYO). Always falls back to
 * deterministic compileAgent so UX stays wired without keys.
 */
export async function runtimeCompile(
  input: CompileRequest,
): Promise<CompileResponse & { runtime: DoRuntimeStatus }> {
  const runtime = getDoRuntimeStatus();
  const base = compileAgent(input);

  if (runtime.capability === 'demo') {
    return {
      ...base,
      honesty: `${base.honesty} · ${runtime.label}`,
      runtime,
    };
  }

  try {
    const refined = await refineCompileWithModel(input, base, runtime);
    return { ...refined, runtime };
  } catch {
    return {
      ...base,
      honesty: `${base.honesty} · ${runtime.label} (heuristic fallback)`,
      runtime,
    };
  }
}

async function refineCompileWithModel(
  input: CompileRequest,
  base: CompileResponse,
  runtime: DoRuntimeStatus,
): Promise<CompileResponse> {
  const { generateWithFallback, resolveModelLadder, resolveLadderFromIds } = await import(
    '@/lib/ai/router'
  );

  const ladder =
    runtime.provider === 'byo'
      ? resolveLadderFromIds(['gpt-4o-mini', 'gpt-4o'])
      : resolveModelLadder('claude-sonnet-4-6', [
          'gemini-2.5-flash',
          'groq:llama-3.3-70b-versatile',
        ]);

  if (ladder.length === 0) {
    return {
      ...base,
      honesty: `${base.honesty} · ${runtime.label}`,
    };
  }

  const brief = input.brief || base.spec.brief;
  const result = await generateWithFallback({
    ladder,
    system:
      'You refine DO agent briefs. Reply with ONE short agent display name (max 48 chars). No quotes, no explanation.',
    messages: [{ role: 'user', content: `Brief: ${brief}\nPrimitive: ${base.spec.primitive}` }],
    agentSlug: 'do-runtime',
    tenant: 'do',
    taskId: 'compile-name',
    maxOutputTokens: 48,
  });

  if (!result.ok) {
    return { ...base, honesty: `${base.honesty} · ${runtime.label}` };
  }

  const name = result.text.trim().replace(/^["']|["']$/g, '').slice(0, 48);
  if (!name) {
    return { ...base, honesty: `${base.honesty} · ${runtime.label}` };
  }

  return {
    spec: {
      ...base.spec,
      name,
      lastNote: `Compiled via ${runtime.label}. Not active yet — review, then activate.`,
    },
    honesty: `${base.honesty} · ${runtime.label}`,
  };
}

/** Clear rewrite — underlines + suggested tighter copy. */
export async function runtimeClearRewrite(text: string): Promise<ClearRewriteResult> {
  const runtime = getDoRuntimeStatus();
  const original = text.slice(0, 4_000);
  const heuristic = clearHeuristics(original);

  if (runtime.capability === 'demo' || !original.trim()) {
    return { ...heuristic, runtime };
  }

  try {
    const { generateWithFallback, resolveModelLadder, resolveLadderFromIds } = await import(
      '@/lib/ai/router'
    );
    const ladder =
      runtime.provider === 'byo'
        ? resolveLadderFromIds(['gpt-4o-mini', 'gpt-4o'])
        : resolveModelLadder('claude-sonnet-4-6', [
            'gemini-2.5-flash',
            'groq:llama-3.3-70b-versatile',
          ]);

    if (ladder.length === 0) {
      return { ...heuristic, runtime };
    }

    const result = await generateWithFallback({
      ladder,
      system:
        'Rewrite the user text for clarity. Keep meaning. Shorter is better. Return only the rewritten text.',
      messages: [{ role: 'user', content: original }],
      agentSlug: 'do-clear',
      tenant: 'do',
      taskId: 'clear-rewrite',
      maxOutputTokens: 600,
    });

    if (!result.ok || !result.text.trim()) {
      return { ...heuristic, runtime };
    }

    return {
      original,
      rewritten: result.text.trim(),
      marks: heuristic.marks,
      runtime,
    };
  } catch {
    return { ...heuristic, runtime };
  }
}

/** Astra-class hard job — Assembl-hosted stub that can call the model when live. */
export async function runtimeAstraHardJob(input: {
  brief: string;
  contextSummary: string;
}): Promise<{ draft: string; honesty: string; runtime: DoRuntimeStatus }> {
  const runtime = getDoRuntimeStatus();
  const stub = await stubAstraProvider.run(input);

  if (runtime.capability === 'demo') {
    return {
      draft: stub.draft,
      honesty: `${stub.honesty} · ${runtime.label}`,
      runtime,
    };
  }

  try {
    const { generateWithFallback, resolveModelLadder, resolveLadderFromIds } = await import(
      '@/lib/ai/router'
    );
    const ladder =
      runtime.provider === 'byo'
        ? resolveLadderFromIds(['gpt-4o-mini'])
        : resolveModelLadder('claude-sonnet-4-6', ['gemini-2.5-flash']);

    if (ladder.length === 0) {
      return { draft: stub.draft, honesty: `${stub.honesty} · ${runtime.label}`, runtime };
    }

    const result = await generateWithFallback({
      ladder,
      system:
        'You are DO’s Astra-class planner stub. Draft a short multi-source plan. Do not claim anything was submitted or sent.',
      messages: [
        {
          role: 'user',
          content: `Brief: ${input.brief}\nContext: ${input.contextSummary}`,
        },
      ],
      agentSlug: 'do-astra',
      tenant: 'do',
      taskId: 'astra-hard-job',
      maxOutputTokens: 400,
    });

    if (!result.ok) {
      return { draft: stub.draft, honesty: `${stub.honesty} · ${runtime.label}`, runtime };
    }

    return {
      draft: result.text.trim(),
      honesty: `Assembl-hosted Astra-class draft · ${runtime.label}. Nothing sent.`,
      runtime,
    };
  } catch {
    return { draft: stub.draft, honesty: `${stub.honesty} · ${runtime.label}`, runtime };
  }
}

export { clearHeuristics } from './clear';
