/**
 * Suite orchestrator (Phase 1C, spec §7.2.3).
 *
 * For each scenario: build the bundle's deterministic world, fire the injected
 * event, ask the agent-under-test to respond, grade the response on the
 * five-axis rubric + tikanga gate, and aggregate a pass/fail. This is exactly
 * what the CI gate runs.
 */

import { simulateForScenario } from './bundle-simulator';
import { grade, type GradeOptions } from './rubric';
import { referenceAgent } from './reference-agent';
import { loadPack } from './load-scenarios';
import type {
  AgentUnderTest,
  BundleId,
  Scenario,
  ScenarioResult,
  SuiteResult,
} from './types';

export interface RunOptions extends GradeOptions {
  agent?: AgentUnderTest;
}

/** Run one scenario end-to-end. */
export async function runScenario(scenario: Scenario, opts: RunOptions = {}): Promise<ScenarioResult> {
  const agent = opts.agent ?? referenceAgent;
  const start = Date.now();

  const { world, event } = simulateForScenario(
    scenario.bundle,
    scenario.seed,
    scenario.inject_flags ?? [],
    scenario.inject_event,
  );

  const turn = await agent.respond(scenario, world, event);
  const { score, details, passed, failures } = await grade(scenario, turn, opts);

  return {
    scenario_id: scenario.id,
    bundle: scenario.bundle,
    passed,
    response: turn.text,
    chosen_route: turn.route,
    score,
    details,
    failures,
    duration_ms: Date.now() - start,
  };
}

/** Run a whole bundle's pack. */
export async function runBundleSuite(bundle: BundleId, opts: RunOptions = {}): Promise<SuiteResult> {
  const pack = loadPack(bundle);
  const results: ScenarioResult[] = [];
  for (const scenario of pack.scenarios) {
    results.push(await runScenario(scenario, opts));
  }
  const failed = results.filter((r) => !r.passed).length;
  return { bundle, passed: failed === 0, results, total: results.length, failed };
}

/** Human-readable one-line summary of a scenario result. */
export function summariseResult(r: ScenarioResult): string {
  const mark = r.passed ? '✓' : '✗';
  const s = r.score;
  const axes = `fact ${s.factuality} · nz ${s.nz_accuracy} · tone ${s.tone} · hard ${s.hard_rules ? 'pass' : 'FAIL'} · route ${s.route ? 'pass' : 'FAIL'} · tikanga ${s.tikanga_gate ? 'pass' : 'FAIL'}`;
  const tail = r.passed ? '' : `\n      ${r.failures.join('\n      ')}`;
  return `  ${mark} ${r.scenario_id} — ${axes}${tail}`;
}
