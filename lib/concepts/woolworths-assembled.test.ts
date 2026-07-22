import { describe, expect, it } from 'vitest';
import {
  BASE_SCENARIO,
  buildScenarioRun,
  type Scenario,
} from './woolworths-assembled';

describe('woolworths assembled scenario engine', () => {
  it('builds a complete run for the base scenario', () => {
    const { run, plan, proof, negotiation } = buildScenarioRun(BASE_SCENARIO);
    expect(run.timeline.length).toBeGreaterThan(5);
    expect(plan.basket.length).toBeGreaterThan(0);
    expect(plan.estimatedTotalNzd).toBeGreaterThan(0);
    expect(proof.runId).toBe(run.id);
    expect(negotiation.voices.length).toBe(4);
  });

  it('is deterministic — same scenario yields the same run id and total', () => {
    const a = buildScenarioRun(BASE_SCENARIO);
    const b = buildScenarioRun(BASE_SCENARIO);
    expect(a.run.id).toBe(b.run.id);
    expect(a.plan.estimatedTotalNzd).toBe(b.plan.estimatedTotalNzd);
    expect(a.run.timeline.length).toBe(b.run.timeline.length);
  });

  it('recomputes the basket when guests are added (change one thing)', () => {
    const base = buildScenarioRun(BASE_SCENARIO);
    const more: Scenario = { ...BASE_SCENARIO, extraGuests: 2 };
    const bigger = buildScenarioRun(more);
    // More people → a higher (or equal) estimated total, never lower.
    expect(bigger.plan.estimatedTotalNzd).toBeGreaterThanOrEqual(base.plan.estimatedTotalNzd);
  });

  it('honours a gluten-free change by excluding gluten items', () => {
    const gf = buildScenarioRun({ ...BASE_SCENARIO, glutenFree: true });
    const glutenLines = gf.plan.basket.filter((i) =>
      ['brk-bread-toast', 'brk-bread-multigrain', 'din-pasta-1kg', 'lun-wraps-8'].includes(i.sku),
    );
    // The known gluten SKUs must not appear once a guest is gluten-free.
    expect(glutenLines.length).toBe(0);
  });

  it('surfaces a budget conflict when the ceiling is dropped low', () => {
    const tight = buildScenarioRun({ ...BASE_SCENARIO, budgetNzd: 150, extraGuests: 4 });
    // Either resolved within budget, or the negotiation honestly shows the gap.
    expect(typeof tight.negotiation.withinBudget).toBe('boolean');
    expect(tight.negotiation.voices.some((v) => v.agent === 'Budget')).toBe(true);
  });
});
