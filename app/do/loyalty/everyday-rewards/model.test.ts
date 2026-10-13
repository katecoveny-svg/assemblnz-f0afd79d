import { describe, expect, it } from "vitest";
import { canApprove, demoAlternative, demoEligibleMeals, demoMissionRecipe, pantryTemplate, planShop } from "./model";

describe("loyalty DO preparation boundary", () => {
  it('cooks two dinners with one pantry deduction and exact pack leftovers', () => {
    const extra = planShop(pantryTemplate, 4, true, 4000, 'pasta-night', 'extra');
    expect(extra.estimatedMinor).toBe(3200);
    expect(extra.basket.find(l => l.ingredientId === 'tomato')).toMatchObject({ required: 1600, pantryUsed: 400, needed: 1200, packs: 3, leftover: 300, estimatedMinor: 1350 });
    expect(demoMissionRecipe('pantry', pantryTemplate, 4, 'eggs-toast')).toBe('rice-night');
  });
  it('offers calculated full-basket savings and invalidates the previous review', () => {
    const alternative = demoAlternative(pantryTemplate, 4, true, 4000, 'rice-night', 'tonight');
    expect(alternative).toMatchObject({ beforeMinor: 1200, afterMinor: 1050, to: 'pasta-night' });
    const before = planShop(pantryTemplate, 4, true, 4000, 'rice-night');
    const after = planShop(pantryTemplate, 4, true, 4000, alternative!.to);
    expect(canApprove(before.digest, after.digest, after.blockers)).toBe(false);
    expect(demoAlternative(pantryTemplate, 4, false, 4000, 'rice-night', 'tonight')).toBeNull();
  });
  it('fails closed for unsupported diets and filters explicit catalogue allergens', () => {
    for (const text of ['vegan', 'sesame allergy', 'low sodium']) {
      expect(demoEligibleMeals(text)).toEqual([]);
      expect(planShop(pantryTemplate, 4, true, 4000, 'pasta-night', 'tonight', text).blockers.length).toBeGreaterThan(0);
    }
    expect(demoEligibleMeals('gluten free').map(m => m.id)).toEqual(['rice-night']);
    expect(demoAlternative(pantryTemplate, 4, true, 4000, 'rice-night', 'tonight', 'gluten free')).toBeNull();
  });
  it("deducts reviewed pantry once and rounds missing quantities to packs", () => {
    const plan = planShop(pantryTemplate, 4, true);
    expect(plan.estimatedMinor).toBe(1050);
    expect(plan.blockers).toEqual([]);
    expect(plan.basket.find((l) => l.ingredientId === "tomato")).toMatchObject({
      needed: 400,
      packs: 1,
      leftover: 100,
    });
    expect(plan.basket.find((l) => l.ingredientId === "basil")).toMatchObject({
      packs: 0,
      estimatedMinor: 0,
    });
  });
  it("scales the recipe, recalculates cost and prevents stale approval", () => {
    const before = planShop(pantryTemplate, 4, true),
      after = planShop(pantryTemplate, 8, true);
    expect(after.estimatedMinor).toBe(3200);
    expect(canApprove(before.digest, after.digest, after.blockers)).toBe(false);
    expect(canApprove(after.digest, after.digest, after.blockers)).toBe(true);
  });
  it("blocks unreviewed stock and over-budget baskets", () => {
    const unreviewed = planShop(pantryTemplate, 4, false);
    expect(
      canApprove(unreviewed.digest, unreviewed.digest, unreviewed.blockers),
    ).toBe(false);
    const over = planShop(pantryTemplate, 8, true, 2000);
    expect(over.blockers).toContain("Estimated basket exceeds the NZD budget");
  });
  it("does not treat fixture stock or prices as merchant evidence", () => {
    const plan = planShop(pantryTemplate, 4, true);
    expect(
      plan.basket
        .filter((l) => l.offer)
        .every((l) => l.offer?.source === "fictional-fixture"),
    ).toBe(true);
    expect(canApprove(null, plan.digest, plan.blockers)).toBe(false);
  });
});
