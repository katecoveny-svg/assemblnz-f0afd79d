import { describe, expect, it } from 'vitest';
import { runEval } from './run-eval';
import { JOURNEY_SCENARIOS } from './scenarios';

describe('journey evaluation suite', () => {
  const report = runEval();

  it('covers at least 30 scenarios', () => {
    expect(JOURNEY_SCENARIOS.length).toBeGreaterThanOrEqual(30);
  });

  it('has no critical failures across the suite', () => {
    const failing = report.results.filter((r) => r.criticalFailed);
    // Surface which scenarios failed for a readable assertion message.
    expect(failing.map((f) => `${f.id}: ${f.checks.filter((c) => !c.passed).map((c) => c.id).join(',')}`)).toEqual([]);
  });

  it('covers the required categories', () => {
    const cats = new Set(JOURNEY_SCENARIOS.map((s) => s.category));
    for (const c of ['dietary', 'allergy', 'budget', 'unavailable', 'malformed', 'prompt_injection', 'unsafe_purchase', 'tenant_isolation']) {
      expect(cats.has(c)).toBe(true);
    }
  });
});
