import { describe, expect, it } from 'vitest';
import { canApprove, pantryTemplate, planShop } from './model';

describe('loyalty DO preparation boundary', () => {
  it('deducts reviewed pantry once and rounds missing quantities to packs', () => {
    const plan = planShop(pantryTemplate, 4, true);
    expect(plan.estimatedMinor).toBe(1050);
    expect(plan.blockers).toEqual([]);
    expect(plan.basket.find(l => l.ingredientId === 'tomato')).toMatchObject({ needed: 400, packs: 1, leftover: 100 });
    expect(plan.basket.find(l => l.ingredientId === 'basil')).toMatchObject({ packs: 0, estimatedMinor: 0 });
  });
  it('scales the recipe, recalculates cost and prevents stale approval', () => {
    const before = planShop(pantryTemplate, 4, true), after = planShop(pantryTemplate, 8, true);
    expect(after.estimatedMinor).toBe(3200);
    expect(canApprove(before.digest, after.digest, after.blockers)).toBe(false);
    expect(canApprove(after.digest, after.digest, after.blockers)).toBe(true);
  });
  it('blocks unreviewed stock and over-budget baskets', () => {
    const unreviewed = planShop(pantryTemplate, 4, false);
    expect(canApprove(unreviewed.digest, unreviewed.digest, unreviewed.blockers)).toBe(false);
    const over = planShop(pantryTemplate, 8, true, 2000);
    expect(over.blockers).toContain('Estimated basket exceeds the NZD budget');
  });
  it('does not treat fixture stock or prices as merchant evidence', () => {
    const plan = planShop(pantryTemplate, 4, true);
    expect(plan.basket.filter(l => l.offer).every(l => l.offer?.source === 'fictional-fixture')).toBe(true);
    expect(canApprove(null, plan.digest, plan.blockers)).toBe(false);
  });
});
