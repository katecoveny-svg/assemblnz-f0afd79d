/**
 * assembl — plan service
 * ----------------------
 * Stages 4–6: assemble meal ideas and a structured, budget-aware basket from
 * the illustrative catalogue. Deterministic. Enforces the hard rules the
 * genome states: dietary exclusions are absolute, premium items surface a
 * value swap, ingredients are de-duplicated (low waste), and the basket is
 * estimated against any known budget.
 *
 * No live prices, no invented offers — every number is indicative demo NZD.
 */

import {
  CATALOGUE,
  MEAL_IDEAS,
  productBySku,
  type CatalogueProduct,
  type DietaryTag,
  type MealIdea,
  type MealSlot,
} from '../catalogue';
import type { GroceryIntent } from './intent';

export type BasketItem = {
  sku: string;
  name: string;
  quantity: number;
  unitPriceNzd: number;
  lineTotalNzd: number;
  tier: CatalogueProduct['tier'];
  category: string;
  /** Meal ideas this item supports (for grouping / evidence). */
  forMeals: string[];
  available: boolean;
};

export type ValueOpportunity = {
  sku: string;
  suggestion: string;
  /** Indicative saving if swapped to the value alternative (NZD). */
  estimatedSavingNzd: number;
};

export type PlanResult = {
  meals: MealIdea[];
  basket: BasketItem[];
  estimatedTotalNzd: number;
  budgetCeilingNzd: number | null;
  withinBudget: boolean;
  overBudgetByNzd: number;
  assumptions: string[];
  valueOpportunities: ValueOpportunity[];
  /** Meals/items excluded to honour dietary rules — surfaced for transparency. */
  excludedForDiet: string[];
};

/** Build the set of dietary tags that must NOT appear, from the intent. */
export function dietaryExclusions(intent: GroceryIntent): Set<DietaryTag> {
  const excl = new Set<DietaryTag>();
  const diet = intent.dietaryNeeds.map((d) => d.toLowerCase());
  if (diet.includes('vegetarian') || diet.includes('vegan')) {
    excl.add('contains_meat');
    excl.add('contains_fish');
  } else if (diet.includes('pescatarian')) {
    // Pescatarian: no meat, fish is fine.
    excl.add('contains_meat');
  }
  if (diet.includes('vegan')) excl.add('contains_dairy');
  if (intent.avoid.some((a) => /spic/i.test(a))) excl.add('spicy');
  if (intent.avoid.some((a) => /nut/i.test(a))) excl.add('contains_nuts');
  return excl;
}

function violatesDiet(dietary: DietaryTag[], exclusions: Set<DietaryTag>): boolean {
  return dietary.some((tag) => exclusions.has(tag));
}

/** Which meal slots the intent asks for. Defaults sensibly if unstated. */
function requestedSlots(intent: GroceryIntent): MealSlot[] {
  const slots = new Set<MealSlot>();
  for (const need of intent.mealNeeds.map((m) => m.toLowerCase())) {
    if (need.includes('dinner')) slots.add('dinner');
    if (need.includes('breakfast')) slots.add('breakfast');
    if (need.includes('lunch')) slots.add('lunch');
    if (need.includes('snack')) slots.add('snack');
  }
  if (slots.size === 0) slots.add('dinner');
  return [...slots];
}

function prefersEasy(intent: GroceryIntent): boolean {
  return (
    intent.priorities.some((p) => /easy|simple|quick|minimal/i.test(p)) ||
    intent.mealNeeds.some((m) => /easy/i.test(m))
  );
}

function qtyFor(slot: MealSlot, people: number, durationDays: number): number {
  if (people <= 0) people = 1;
  switch (slot) {
    case 'snack':
      return Math.max(1, Math.ceil((people * durationDays) / 4));
    case 'drink':
      return Math.max(1, Math.ceil(people / 4));
    case 'breakfast':
    case 'lunch':
    case 'dinner':
      return Math.max(1, Math.ceil(people / 5));
    default:
      return 1;
  }
}

/**
 * Assemble a plan. `budgetOverride` lets the runtime pass a budget captured in
 * the context stage when the intent didn't state one.
 */
export function assemblePlan(
  intent: GroceryIntent,
  budgetOverride?: number | null,
): PlanResult {
  const exclusions = dietaryExclusions(intent);
  const slots = requestedSlots(intent);
  const easy = prefersEasy(intent);
  const excludedForDiet: string[] = [];
  const assumptions: string[] = [];

  // ── Choose meals ────────────────────────────────────────────────────────
  const candidateMeals = MEAL_IDEAS.filter((m) => slots.includes(m.slot));
  const chosenMeals: MealIdea[] = [];
  for (const meal of candidateMeals) {
    if (violatesDiet(meal.dietary, exclusions)) {
      excludedForDiet.push(`${meal.name} (dietary)`);
      continue;
    }
    chosenMeals.push(meal);
  }
  // "Easy" priority: prefer low/no-effort meals, keep at least one per slot.
  const mealsBySlot = new Map<MealSlot, MealIdea[]>();
  for (const m of chosenMeals) {
    const list = mealsBySlot.get(m.slot) ?? [];
    list.push(m);
    mealsBySlot.set(m.slot, list);
  }
  const finalMeals: MealIdea[] = [];
  for (const [slot, list] of mealsBySlot) {
    const ranked = [...list].sort((a, b) => effortRank(a.effort) - effortRank(b.effort));
    // Three dinners across a weekend — this naturally surfaces the popular but
    // out-of-stock item, so the resolution stage (Stage 9) is a real part of
    // the loop rather than an artificial trigger.
    const take = slot === 'dinner' ? 3 : 1;
    finalMeals.push(...(easy ? ranked : list).slice(0, take));
  }

  if (finalMeals.some((m) => m.slot === 'dinner')) {
    assumptions.push(`Planned ${finalMeals.filter((m) => m.slot === 'dinner').length} easy dinners for ${intent.people || 'the group'}.`);
  }

  // ── Build basket (dedupe = low waste) ────────────────────────────────────
  const lines = new Map<string, BasketItem>();
  const addSku = (sku: string, slot: MealSlot, mealId?: string) => {
    const product = productBySku(sku);
    if (!product) return;
    if (violatesDiet(product.dietary, exclusions)) {
      excludedForDiet.push(`${product.name} (dietary)`);
      return;
    }
    const q = qtyFor(slot, intent.people, intent.durationDays);
    const existing = lines.get(sku);
    if (existing) {
      existing.quantity += q;
      existing.lineTotalNzd = round2(existing.quantity * existing.unitPriceNzd);
      if (mealId && !existing.forMeals.includes(mealId)) existing.forMeals.push(mealId);
      return;
    }
    lines.set(sku, {
      sku,
      name: product.name,
      quantity: q,
      unitPriceNzd: product.priceNzd,
      lineTotalNzd: round2(q * product.priceNzd),
      tier: product.tier,
      category: product.category,
      forMeals: mealId ? [mealId] : [],
      available: product.available,
    });
  };

  for (const meal of finalMeals) {
    for (const sku of meal.skus) addSku(sku, meal.slot, meal.id);
  }

  // Snacks (always, if asked or if teens present) + drinks + core staples.
  const wantsSnacks = slots.includes('snack') || intent.ageGroups.includes('teenager');
  if (wantsSnacks) {
    for (const p of pickBySlot('snack', exclusions, 3, lines)) addSku(p.sku, 'snack');
    assumptions.push('Added a spread of snacks (teen-friendly, shareable).');
  }
  for (const p of pickBySlot('drink', exclusions, 2, lines)) addSku(p.sku, 'drink');
  for (const p of pickBySlot('staple', exclusions, 2, lines)) addSku(p.sku, 'staple');

  const basket = [...lines.values()];
  const estimatedTotalNzd = round2(basket.reduce((sum, i) => sum + i.lineTotalNzd, 0));

  // ── Value opportunities (premium → value swap) ───────────────────────────
  const valueOpportunities: ValueOpportunity[] = [];
  for (const item of basket) {
    if (item.tier !== 'premium') continue;
    const cheaper = CATALOGUE.filter(
      (p) =>
        p.available &&
        p.tier !== 'premium' &&
        p.slots.some((s) => productBySku(item.sku)?.slots.includes(s)) &&
        !violatesDiet(p.dietary, exclusions),
    ).sort((a, b) => a.priceNzd - b.priceNzd)[0];
    if (cheaper) {
      valueOpportunities.push({
        sku: item.sku,
        suggestion: `Swap ${item.name} → ${cheaper.name} for a cheaper option.`,
        estimatedSavingNzd: round2((item.unitPriceNzd - cheaper.priceNzd) * item.quantity),
      });
    }
  }

  // ── Budget ────────────────────────────────────────────────────────────────
  const budgetCeilingNzd = budgetOverride ?? intent.budget ?? null;
  const tolerance = 0.05;
  const withinBudget =
    budgetCeilingNzd == null || estimatedTotalNzd <= budgetCeilingNzd * (1 + tolerance);
  const overBudgetByNzd =
    budgetCeilingNzd == null ? 0 : Math.max(0, round2(estimatedTotalNzd - budgetCeilingNzd));

  if (budgetCeilingNzd == null) {
    assumptions.push('No budget set — estimate shown for review before finalising.');
  }

  return {
    meals: finalMeals,
    basket,
    estimatedTotalNzd,
    budgetCeilingNzd,
    withinBudget,
    overBudgetByNzd,
    assumptions,
    valueOpportunities,
    excludedForDiet: [...new Set(excludedForDiet)],
  };
}

export type AppliedResolutions = {
  /** fromSku → toSku swaps the customer approved. */
  swaps: Record<string, string>;
  /** SKUs the customer approved removing. */
  removed: string[];
};

/**
 * Apply approved resolutions to a freshly-computed plan so the basket honestly
 * reflects the customer's decisions (swaps land, removals drop, totals and
 * budget recompute). Without this, a derived plan would keep showing a resolved
 * exception as unresolved.
 */
export function applyResolutions(plan: PlanResult, res: AppliedResolutions): PlanResult {
  if (Object.keys(res.swaps).length === 0 && res.removed.length === 0) return plan;
  const basket: BasketItem[] = [];
  for (const item of plan.basket) {
    if (res.removed.includes(item.sku)) continue;
    const toSku = res.swaps[item.sku];
    const sub = toSku ? productBySku(toSku) : undefined;
    if (sub) {
      basket.push({
        ...item,
        sku: sub.sku,
        name: sub.name,
        unitPriceNzd: sub.priceNzd,
        lineTotalNzd: round2(item.quantity * sub.priceNzd),
        tier: sub.tier,
        category: sub.category,
        available: sub.available,
      });
      continue;
    }
    basket.push(item);
  }
  const estimatedTotalNzd = round2(basket.reduce((s, i) => s + i.lineTotalNzd, 0));
  const ceiling = plan.budgetCeilingNzd;
  const withinBudget = ceiling == null || estimatedTotalNzd <= ceiling * 1.05;
  const overBudgetByNzd = ceiling == null ? 0 : Math.max(0, round2(estimatedTotalNzd - ceiling));
  return { ...plan, basket, estimatedTotalNzd, withinBudget, overBudgetByNzd };
}

function effortRank(effort: CatalogueProduct['effort']): number {
  return { none: 0, low: 1, medium: 2, high: 3 }[effort];
}

function pickBySlot(
  slot: MealSlot,
  exclusions: Set<DietaryTag>,
  n: number,
  existing?: Map<string, unknown>,
): CatalogueProduct[] {
  return CATALOGUE.filter(
    (p) =>
      p.available &&
      p.slots.includes(slot) &&
      !violatesDiet(p.dietary, exclusions) &&
      !(existing?.has(p.sku)),
  )
    .sort((a, b) => {
      // Prefer items dedicated to this slot (a real snack over cheese that also
      // happens to snack), then crowd-pleasers.
      const dedicated = Number(a.slots.length === 1) - Number(b.slots.length === 1);
      if (dedicated !== 0) return -dedicated;
      return Number(Boolean(b.crowdPleaser)) - Number(Boolean(a.crowdPleaser));
    })
    .slice(0, n);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
