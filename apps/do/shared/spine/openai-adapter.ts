/**
 * OpenAI Agents SDK adapter for DO.
 *
 * Uses @openai/agents (Agent + tool + needsApproval HITL + handoffs).
 * Only selected when an OpenAI-compatible key is present.
 * Assembl-hosted commercial model still owns the product — this is the
 * inference engine for hard jobs / compile refine / Clear rewrite, not a
 * ChatGPT clone UI.
 */

import 'server-only';
import { Agent, run, tool } from '@openai/agents';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { clearHeuristics } from '../clear';
import { compileAgent } from '../compile';
import type { CompileRequest } from '../types';
import type { DoRuntimeStatus } from '../runtime-status';
import type {
  ClearSpineOutput,
  CompileSpineOutput,
  DoAgentsSpine,
  DoHandoff,
  DoInterruption,
  DoSession,
  DoSpineError,
  DoSpineResult,
  HardSpineOutput,
} from './types';

function session(job: DoSession['job'], note: string): DoSession {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    job,
    createdAt: now,
    updatedAt: now,
    notes: [note],
  };
}

function ok<T>(
  output: T,
  s: DoSession,
  runtime: DoRuntimeStatus,
  handoffs: DoHandoff[] = [],
  interruptions: DoInterruption[] = [],
): DoSpineResult<T> {
  return {
    ok: true,
    output,
    session: s,
    handoffs,
    interruptions,
    spine: 'openai-sdk',
    runtime: { ...runtime, spine: 'openai-sdk' },
  };
}

function fail(error: string, runtime: DoRuntimeStatus): DoSpineError {
  return {
    ok: false,
    error,
    spine: 'openai-sdk',
    runtime: { ...runtime, spine: 'openai-sdk' },
  };
}

const DO_SYSTEM = `You are DO's inference specialist inside assembl.
DO is NOT ChatGPT, NOT a consumer chat agent, NOT Grammarly, NOT Instinct.
You help compile portable AgentSpec objects, tighten plain vertical copy (anti-slop),
and plan multi-source hard jobs. Never claim you sent, submitted, paid, or signed.
Consequential acts always need a human yes.`;

export function createOpenAiSdkSpine(getRuntime: () => DoRuntimeStatus): DoAgentsSpine {
  const refineName = tool({
    name: 'compile_agent_name',
    description: 'Propose a short AgentSpec display name (max 48 chars).',
    parameters: z.object({
      brief: z.string(),
      primitive: z.string(),
    }),
    execute: async ({ brief, primitive }) => {
      const cleaned = brief.trim().replace(/\s+/g, ' ');
      const base =
        cleaned.length <= 48
          ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
          : `${cleaned.slice(0, 45).trimEnd()}…`;
      return `${base} · ${primitive}`;
    },
  });

  const clearTool = tool({
    name: 'clear_rewrite',
    description: 'Tighten plain vertical copy. Anti-slop, not grammar-first.',
    parameters: z.object({
      text: z.string(),
    }),
    execute: async ({ text }) => {
      const h = clearHeuristics(text);
      return JSON.stringify({ rewritten: h.rewritten, markCount: h.marks.length });
    },
  });

  const sendTool = tool({
    name: 'consequential_send',
    description: 'Send or notify externally. Always requires human approval.',
    parameters: z.object({
      channel: z.string(),
      body: z.string(),
    }),
    needsApproval: true,
    execute: async () => {
      return 'DEMO · approval recorded only. Nothing was sent.';
    },
  });

  const compileAgentSdk = new Agent({
    name: 'DO Compile',
    instructions: `${DO_SYSTEM}\nJob: refine a portable AgentSpec name. Prefer tools. Do not chat.`,
    tools: [refineName],
  });

  const clearAgentSdk = new Agent({
    name: 'DO Clear',
    instructions: `${DO_SYSTEM}\nJob: vertical plain rewrite. Not Grammarly. Prefer clear_rewrite tool.`,
    tools: [clearTool],
  });

  const astraAgentSdk = new Agent({
    name: 'DO Astra',
    instructions: `${DO_SYSTEM}\nJob: multi-source hard-job plan. Draft only. Use consequential_send only when the user explicitly asked to send — it will pause for HITL.`,
    tools: [sendTool],
    handoffDescription: 'Multi-source compare / find / exception-class jobs',
  });

  const routerAgent = Agent.create({
    name: 'DO Router',
    instructions: `${DO_SYSTEM}\nRoute to DO Compile, DO Clear, or DO Astra. Never become a messaging assistant.`,
    handoffs: [compileAgentSdk, clearAgentSdk, astraAgentSdk],
  });

  void routerAgent;

  return {
    kind: 'openai-sdk',

    async compile(input: CompileRequest) {
      const runtime = getRuntime();
      const s = session('compile', 'openai-sdk · compile');
      const handoffs: DoHandoff[] = [
        { from: 'DO Router', to: 'DO Compile', reason: 'AgentSpec compile' },
      ];
      try {
        const base = compileAgent(input);
        const brief = input.brief || base.spec.brief;
        const result = await run(
          compileAgentSdk,
          `Brief: ${brief}\nPrimitive: ${base.spec.primitive}\nPropose a display name via tool.`,
        );
        const name =
          (typeof result.finalOutput === 'string' && result.finalOutput.trim().slice(0, 48)) ||
          base.spec.name;
        const interruptions: DoInterruption[] = (result.interruptions || []).map((item, i) => ({
          id: `sdk-${i}-${s.id}`,
          tool: 'consequential.send',
          reason: `HITL · ${item.name || 'tool'} needs your yes`,
          args: {},
          sessionId: s.id,
        }));
        s.state = typeof result.state?.toString === 'function' ? result.state.toString() : undefined;
        const output: CompileSpineOutput = {
          spec: {
            ...base.spec,
            name,
            lastNote: `Compiled via OpenAI Agents SDK · ${runtime.label}. Not active yet.`,
          },
          honesty: `${base.honesty} · spine:openai-sdk · ${runtime.label}`,
        };
        return ok(output, s, runtime, handoffs, interruptions);
      } catch (e) {
        // Fail open to deterministic compile — never blank the UX.
        try {
          const base = compileAgent(input);
          return ok(
            {
              ...base,
              honesty: `${base.honesty} · spine:openai-sdk fallback · ${runtime.label}`,
            },
            s,
            runtime,
            handoffs,
          );
        } catch (inner) {
          return fail(inner instanceof Error ? inner.message : 'compile failed', runtime);
        }
      }
    },

    async clear(text: string) {
      const runtime = getRuntime();
      const s = session('clear', 'openai-sdk · clear');
      const handoffs: DoHandoff[] = [
        { from: 'DO Router', to: 'DO Clear', reason: 'Anti-slop rewrite' },
      ];
      const original = text.slice(0, 4_000);
      const heuristic = clearHeuristics(original);
      try {
        const result = await run(
          clearAgentSdk,
          `Tighten this for plain vertical clarity (anti-slop). Use the clear_rewrite tool.\n\n${original}`,
        );
        let rewritten = heuristic.rewritten;
        if (typeof result.finalOutput === 'string' && result.finalOutput.trim()) {
          // Prefer tool-backed heuristic rewrite; model prose is optional polish.
          const maybe = result.finalOutput.trim();
          if (maybe.length < original.length * 1.5) rewritten = maybe;
        }
        const output: ClearSpineOutput = {
          original,
          rewritten,
          marks: heuristic.marks,
        };
        return ok(output, s, runtime, handoffs);
      } catch {
        return ok(
          { original, rewritten: heuristic.rewritten, marks: heuristic.marks },
          s,
          runtime,
          handoffs,
        );
      }
    },

    async hardJob(input) {
      const runtime = getRuntime();
      const s = session('hard', 'openai-sdk · astra');
      const handoffs: DoHandoff[] = [
        { from: 'DO Router', to: 'DO Astra', reason: 'Hard multi-source job' },
      ];
      try {
        const result = await run(
          astraAgentSdk,
          `Draft a short multi-source plan. Do not claim anything was sent.\nBrief: ${input.brief}\nContext: ${input.contextSummary}`,
        );
        const interruptions: DoInterruption[] = (result.interruptions || []).map((item, i) => ({
          id: `sdk-hard-${i}-${s.id}`,
          tool: 'consequential.send',
          reason: `HITL · ${item.name || 'tool'} paused for your yes`,
          args: { brief: input.brief },
          sessionId: s.id,
        }));
        s.state = typeof result.state?.toString === 'function' ? result.state.toString() : undefined;
        const draft =
          (typeof result.finalOutput === 'string' && result.finalOutput.trim()) ||
          `Assembl-hosted Astra plan for “${input.brief.slice(0, 80)}”.`;
        const output: HardSpineOutput = {
          draft,
          honesty: `OpenAI Agents SDK · Astra handoff · ${runtime.label}. Nothing sent.`,
        };
        return ok(output, s, runtime, handoffs, interruptions);
      } catch (e) {
        return fail(e instanceof Error ? e.message : 'hard job failed', runtime);
      }
    },

    async resolveInterruption({ sessionId, interruptionId, decision }) {
      const runtime = getRuntime();
      // Full RunState resume needs persisted state + agent graph rebuild.
      // For PREVIEW we record the decision honestly without replaying side effects.
      const s = session('hard', `resume · ${sessionId}`);
      s.notes.push(`interruption ${interruptionId} → ${decision}`);
      return ok(
        {
          note:
            decision === 'approve'
              ? 'Approved · DEMO — no external send/submit executed.'
              : 'Rejected.',
        },
        s,
        runtime,
      );
    },
  };
}
