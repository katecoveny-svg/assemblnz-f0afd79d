/**
 * Thin TypeScript orchestration matching OpenAI Agents SDK concepts
 * (agent · tools · handoffs · sessions · HITL) without requiring the SDK
 * or an OpenAI key. Used for Assembl DEMO and when SDK is unavailable.
 *
 * This is intentionally not a fake SDK wrapper — it is the durable DO
 * contract that the real @openai/agents adapter implements as well.
 */

import { randomUUID } from 'node:crypto';
import { clearHeuristics } from '../clear';
import { compileAgent } from '../compile';
import { stubAstraProvider } from '../router';
import { detectConsequentialVerb } from '../policy';
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

type SessionRecord = DoSession & { pending?: DoInterruption[] };

const sessions = new Map<string, SessionRecord>();

function newSession(job: DoSession['job'], note: string): SessionRecord {
  const now = new Date().toISOString();
  const session: SessionRecord = {
    id: randomUUID(),
    job,
    createdAt: now,
    updatedAt: now,
    notes: [note],
  };
  sessions.set(session.id, session);
  return session;
}

function touch(session: SessionRecord, note?: string) {
  session.updatedAt = new Date().toISOString();
  if (note) session.notes.push(note);
  sessions.set(session.id, session);
}

function ok<T>(
  output: T,
  session: SessionRecord,
  runtime: DoRuntimeStatus,
  handoffs: DoHandoff[] = [],
  interruptions: DoInterruption[] = [],
): DoSpineResult<T> {
  return {
    ok: true,
    output,
    session,
    handoffs,
    interruptions,
    spine: 'orchestrator',
    runtime,
  };
}

function fail(error: string, runtime: DoRuntimeStatus): DoSpineError {
  return { ok: false, error, spine: 'orchestrator', runtime };
}

export function createOrchestratorSpine(getRuntime: () => DoRuntimeStatus): DoAgentsSpine {
  return {
    kind: 'orchestrator',

    async compile(input: CompileRequest) {
      const runtime = getRuntime();
      const session = newSession('compile', 'compile · local agent');
      const handoffs: DoHandoff[] = [
        {
          from: 'do.router',
          to: 'do.compile',
          reason: 'Portable AgentSpec compile — not a chat turn',
        },
      ];

      try {
        const base = compileAgent(input);
        // Guardrail: consequential verbs never auto-complete.
        const hit = detectConsequentialVerb(
          `${base.spec.brief} ${base.spec.must_ask_before.join(' ')}`,
        );
        const interruptions: DoInterruption[] = [];
        if (hit) {
          const interruption: DoInterruption = {
            id: randomUUID(),
            tool: hit === 'pay' ? 'consequential.pay' : hit === 'submit' ? 'consequential.submit' : 'consequential.send',
            reason: `Policy · “${hit}” needs a human yes before anything leaves the device.`,
            args: { brief: base.spec.brief },
            sessionId: session.id,
          };
          interruptions.push(interruption);
          const rec = sessions.get(session.id);
          if (rec) rec.pending = interruptions;
          touch(session, `HITL pause · ${hit}`);
        } else {
          touch(session, 'compiled AgentSpec');
        }

        const output: CompileSpineOutput = {
          ...base,
          honesty: `${base.honesty} · spine:orchestrator · ${runtime.label}`,
        };
        return ok(output, session, runtime, handoffs, interruptions);
      } catch (e) {
        return fail(e instanceof Error ? e.message : 'compile failed', runtime);
      }
    },

    async clear(text: string) {
      const runtime = getRuntime();
      const session = newSession('clear', 'clear · anti-slop rewrite');
      const handoffs: DoHandoff[] = [
        {
          from: 'do.router',
          to: 'do.clear',
          reason: 'Vertical plain rewrite — not Grammarly grammar-first',
        },
      ];
      const original = text.slice(0, 4_000);
      const heuristic = clearHeuristics(original);
      touch(session, `marks:${heuristic.marks.length}`);
      const output: ClearSpineOutput = {
        original,
        rewritten: heuristic.rewritten,
        marks: heuristic.marks,
      };
      return ok(output, session, runtime, handoffs);
    },

    async hardJob(input) {
      const runtime = getRuntime();
      const session = newSession('hard', 'astra · hard job');
      const handoffs: DoHandoff[] = [
        {
          from: 'do.router',
          to: 'do.astra',
          reason: 'Multi-source / compare class — specialist handoff',
        },
      ];
      const stub = await stubAstraProvider.run(input);
      // Consequential planning always surfaces HITL if brief implies send/submit.
      const hit = detectConsequentialVerb(input.brief);
      const interruptions: DoInterruption[] = [];
      if (hit) {
        interruptions.push({
          id: randomUUID(),
          tool: 'consequential.send',
          reason: 'Hard job draft ready — sending/submitting needs your yes.',
          args: { brief: input.brief },
          sessionId: session.id,
        });
        session.pending = interruptions;
        touch(session, 'HITL pause · consequential');
      } else {
        touch(session, 'astra stub draft');
      }
      const output: HardSpineOutput = {
        draft: stub.draft,
        honesty: `${stub.honesty} · spine:orchestrator · ${runtime.label}`,
      };
      return ok(output, session, runtime, handoffs, interruptions);
    },

    async resolveInterruption({ sessionId, interruptionId, decision }) {
      const runtime = getRuntime();
      const session = sessions.get(sessionId);
      if (!session) return fail('session not found', runtime);
      const pending = session.pending || [];
      const item = pending.find((p) => p.id === interruptionId);
      if (!item) return fail('interruption not found', runtime);
      session.pending = pending.filter((p) => p.id !== interruptionId);
      touch(
        session,
        decision === 'approve'
          ? `HITL approved · ${item.tool} (DEMO — nothing external sent)`
          : `HITL rejected · ${item.tool}`,
      );
      return ok(
        {
          note:
            decision === 'approve'
              ? `Approved ${item.tool} · DEMO honesty — no external send/submit/pay executed.`
              : `Rejected ${item.tool}.`,
        },
        session,
        runtime,
        [],
        session.pending || [],
      );
    },
  };
}
