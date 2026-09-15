/**
 * Runtime routing — DO is not a chatbot or Astra wrapper.
 *
 * Simple jobs (price/page change, single extract) → local primitives / Watch.
 * Hard multi-source / compare / exception / computer-use → Astra-class lane
 * behind a clear interface (stub provider in v0 — DEMO honesty, no vendor secrets).
 */

import type { AgentPrimitive } from './types';
import type { DoIntent, RuntimeLane, ToolPlan } from './pipeline';

const ASTRA_HINT =
  /\b(compar(e|ison)|multi[- ]?source|across (sites|pages|quotes)|exception|computer[- ]?use|research|reconcile)\b/i;

const ENSEMBLE_HINT =
  /\b(creative|art direction|web design|design director|visual director|brand refs?|ensemble|studio)\b/i;

export function chooseLane(primitive: AgentPrimitive, brief: string): RuntimeLane {
  if (ENSEMBLE_HINT.test(brief)) return 'ensemble';
  if (primitive === 'compare') return 'astra';
  if (primitive === 'find') return 'astra';
  if (ASTRA_HINT.test(brief)) return 'astra';
  // watch / extract / prepare stay local unless the brief clearly needs multi-source work
  return 'local';
}

export function planTools(primitive: AgentPrimitive, intent: DoIntent): ToolPlan {
  const lane = chooseLane(primitive, intent.brief);
  if (lane === 'ensemble') {
    return {
      primitive,
      lane: 'ensemble',
      reason:
        'Creative / Ensemble lane — art directions, visual targets, craft critique (Assembl Studio language).',
      tools: [
        'ensemble.directions',
        'ensemble.visual_targets',
        'ensemble.critic',
        'evidence.capture',
        'permissions.gate',
      ],
    };
  }
  if (lane === 'local') {
    const tools =
      primitive === 'watch'
        ? ['watch.snapshot', 'watch.diff', 'evidence.capture']
        : primitive === 'extract'
          ? ['extract.dates', 'evidence.capture']
          : ['prepare.brief', 'evidence.capture'];
    return {
      primitive,
      lane: 'local',
      reason: 'Simple single-source job — local Watch / primitive, no frontier model.',
      tools,
    };
  }
  return {
    primitive,
    lane: 'astra',
    reason:
      'Multi-source / compare / exception-class job — routes to Astra-class capability (DEMO stub in v0).',
    tools: ['astra.run', 'evidence.capture', 'permissions.gate'],
  };
}

/** Astra-class provider interface — stub only in v0. */
export interface AstraProvider {
  readonly name: string;
  run(input: { brief: string; contextSummary: string }): Promise<{ draft: string; honesty: string }>;
}

export const stubAstraProvider: AstraProvider = {
  name: 'astra-stub',
  async run({ brief, contextSummary }) {
    return {
      draft: `DEMO Astra stub · would analyse: “${brief.slice(0, 80)}” with context “${contextSummary.slice(0, 80)}”. No vendor call made.`,
      honesty: 'DEMO · Astra-class lane is stubbed. No API keys, no external model call.',
    };
  },
};
