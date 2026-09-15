/**
 * DO Agents SDK spine — adapter surface.
 *
 * Product locks (not negotiable):
 * - NOT a ChatGPT / OpenAI consumer-agent clone
 * - NOT Grammarly grammar-first (Clear is vertical / anti-slop, secondary)
 * - NOT Instinct-style messaging assistant
 * - DO = see something → ✦ make portable AgentSpec → place / template / delete
 * - Home = Wallet / Things cards + Needs you — never chat threads
 *
 * Commercial default remains Assembl-hosted. BYO OpenAI is Enterprise later.
 */

import type { CompileRequest, CompileResponse } from '../types';
import type { ClearMark } from '../clear';
import type { DoRuntimeStatus } from '../runtime-status';

/** Spine jobs that prefer Agents SDK patterns. */
export type DoSpineJob = 'compile' | 'clear' | 'hard';

export type DoSpineKind = 'openai-sdk' | 'orchestrator';

export type DoToolName =
  | 'compile.agent_spec'
  | 'clear.rewrite'
  | 'astra.plan'
  | 'evidence.attach'
  | 'consequential.send'
  | 'consequential.submit'
  | 'consequential.pay';

export type DoToolCall = {
  id: string;
  name: DoToolName;
  args: Record<string, unknown>;
  /** True when this tool must pause for a human yes (HITL). */
  needsApproval: boolean;
};

export type DoHandoff = {
  from: string;
  to: string;
  reason: string;
};

export type DoSession = {
  id: string;
  job: DoSpineJob;
  createdAt: string;
  updatedAt: string;
  /** Serialized run state for pause / resume (HITL). */
  state?: string;
  notes: string[];
};

export type DoInterruption = {
  id: string;
  tool: DoToolName;
  reason: string;
  args: Record<string, unknown>;
  sessionId: string;
};

export type DoSpineResult<T> = {
  ok: true;
  output: T;
  session: DoSession;
  handoffs: DoHandoff[];
  interruptions: DoInterruption[];
  spine: DoSpineKind;
  runtime: DoRuntimeStatus;
};

export type DoSpineError = {
  ok: false;
  error: string;
  spine: DoSpineKind;
  runtime: DoRuntimeStatus;
};

export type CompileSpineOutput = CompileResponse;
export type ClearSpineOutput = {
  original: string;
  rewritten: string;
  marks: ClearMark[];
};
export type HardSpineOutput = {
  draft: string;
  honesty: string;
};

export interface DoAgentsSpine {
  readonly kind: DoSpineKind;
  compile(input: CompileRequest): Promise<DoSpineResult<CompileSpineOutput> | DoSpineError>;
  clear(text: string): Promise<DoSpineResult<ClearSpineOutput> | DoSpineError>;
  hardJob(input: {
    brief: string;
    contextSummary: string;
  }): Promise<DoSpineResult<HardSpineOutput> | DoSpineError>;
  /** Resume a paused session after human approve / reject. */
  resolveInterruption(input: {
    sessionId: string;
    interruptionId: string;
    decision: 'approve' | 'reject';
  }): Promise<DoSpineResult<{ note: string }> | DoSpineError>;
}
