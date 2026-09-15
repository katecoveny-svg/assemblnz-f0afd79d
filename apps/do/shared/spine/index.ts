/**
 * Resolve the DO Agents spine.
 *
 * Prefer OpenAI Agents SDK when an OpenAI-compatible key is present.
 * Otherwise use the thin orchestrator (same concepts: agent / tools /
 * handoffs / sessions / HITL) so DEMO stays fully wired.
 */

import 'server-only';
import type { DoRuntimeStatus } from '../runtime-status';
import { createOrchestratorSpine } from './orchestrator';
import type { DoAgentsSpine } from './types';

export type { DoAgentsSpine, DoSpineKind, DoSession, DoInterruption } from './types';
export { createOrchestratorSpine } from './orchestrator';

function hasOpenAiKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY);
}

/** Async resolver — preferred in route handlers / runtime. */
export async function resolveDoSpineAsync(
  getRuntime: () => DoRuntimeStatus,
): Promise<DoAgentsSpine> {
  if (hasOpenAiKey()) {
    try {
      const { createOpenAiSdkSpine } = await import('./openai-adapter');
      return createOpenAiSdkSpine(getRuntime);
    } catch {
      return createOrchestratorSpine(getRuntime);
    }
  }
  return createOrchestratorSpine(getRuntime);
}

/** Sync helper for tests / DEMO-only paths (always orchestrator). */
export function resolveDoSpineDemo(getRuntime: () => DoRuntimeStatus): DoAgentsSpine {
  return createOrchestratorSpine(getRuntime);
}
