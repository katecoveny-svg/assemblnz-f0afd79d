/**
 * Agent stub — Assembl simulator runtime
 * Version: stub · 0.1.0 · 2026-04-09
 *
 * A placeholder agent that accepts GeneratorOutput and returns a WorkflowResult.
 * Used by the simulator runner during development, before real agent workflows are wired.
 *
 * This stub is thrown away when the runner is wired to the managed agents runtime.
 * It exists so scenarios can be developed and CI can run before migration completes.
 *
 * Full implementation: Milestone 3 (simulator runner v0.1)
 */

import type { WorkflowResult, Kete } from '../../evidence-bundles/schema.js';
import type { GeneratorOutput } from '../types.js';

// [TODO: Milestone 3] Replace stub with a real runtime shim that:
//   1. Loads the kete's system prompt from agents/{kete}/<name>/system-prompt.md
//   2. Loads the KB files referenced in agents/{kete}/<name>/kb-refs.md
//   3. Calls the managed agents API (with local fallback adapter during dev)
//   4. Collects Kahu -> Iho -> Ta -> Mahara -> Mana stage outputs
//   5. Returns a fully-populated WorkflowResult
export async function runAgentStub(
  generatorOutput: GeneratorOutput,
  workflowId: string,
): Promise<WorkflowResult> {
  const now = new Date().toISOString();
  const kete = generatorOutput.kete as Kete;

  // Stub: returns a minimal valid WorkflowResult for schema testing only.
  // Findings are empty — real analysis not implemented here.
  const result: WorkflowResult = {
    bundle_id: `stub-${generatorOutput.scenario_id}-${generatorOutput.seed}`,
    schema_version: '0.1.0',
    generated_at: now,

    agent: {
      name: `${kete}-Copilot`,
      version: '0.1.0-stub',
      kete,
    },

    pipeline: {
      kahu: { started_at: now, finished_at: now, notes: 'stub' },
      iho: { started_at: now, finished_at: now, notes: 'stub' },
      ta: { started_at: now, finished_at: now, notes: 'stub' },
      mahara: { started_at: now, finished_at: now, notes: 'stub' },
      mana: { started_at: now, finished_at: now, notes: 'stub' },
    },

    inputs: [
      {
        id: 'input-0',
        kind: 'simulator-fixture',
        source_ref: `simulator/scenarios/${kete.toLowerCase()}/${generatorOutput.scenario_id}.yaml`,
        content_hash: 'stub-hash',
        simulated: true,   // all simulator inputs are simulated
      },
    ],

    steps: [],
    findings: [],
    citations: [],
    reviewer: null,
    simulated: true,   // always true — all simulator inputs are simulated

    kete_extension: {},   // [TODO: Milestone 3] populate per-kete extension
  };

  void workflowId;   // used when wired to the managed agents runtime
  return result;
}
