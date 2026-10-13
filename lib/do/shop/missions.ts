import { consolidate, type Meal, type MealChoice, type Pantry } from './preparation';

export const SHOP_MISSIONS = [
  { id: 'tonight', title: 'Dinner tonight', detail: 'One dinner · your chosen recipe', symbol: '01' },
  { id: 'pantry', title: 'Use what I have', detail: 'Choose by confirmed pantry coverage', symbol: '02' },
  { id: 'extra', title: 'Cook extra for tomorrow', detail: 'Cook once · portions for two dinners', symbol: '03' },
] as const;
export type ShopMission = typeof SHOP_MISSIONS[number]['id'];

/** Compare coverage per ingredient, never add unlike grams/each quantities. */
export function pantryRecipe(meals: Meal[], pantry: Pantry[], servings: number): Meal | undefined {
  const coverage = (meal: Meal) => {
    const needs = consolidate([{ mealId: meal.id, servings, occurrences: 1 }], meals, pantry);
    return needs.length ? needs.reduce((sum, n) => sum + (n.required ? n.pantryUsed / n.required : 0), 0) / needs.length : 0;
  };
  return meals.map((meal, order) => ({ meal, order, coverage: coverage(meal) }))
    .sort((a, b) => b.coverage - a.coverage || a.order - b.order)[0]?.meal;
}
export function missionChoices(mission: ShopMission, meals: Meal[], pantry: Pantry[], servings: number, selected?: string): MealChoice[] {
  const meal = mission === 'pantry' ? pantryRecipe(meals, pantry, servings) : meals.find(m => m.id === selected) ?? meals[0];
  return meal ? [{ mealId: meal.id, servings, occurrences: mission === 'extra' ? 2 : 1 }] : [];
}

/** One recipe replacement, keeping servings/occurrences; compare the whole consolidated plan. */
export function lowerCostAlternative(choices: MealChoice[], eligible: Meal[], total: (choices: MealChoice[]) => number) {
  if (!choices.length || !eligible.length) return null;
  const beforeMinor = total(choices);
  if (!Number.isSafeInteger(beforeMinor) || beforeMinor < 0) return null;
  let best: { choices: MealChoice[]; beforeMinor: number; afterMinor: number; from: string; to: string } | null = null;
  for (const [index, choice] of choices.entries()) for (const meal of eligible) {
    if (meal.id === choice.mealId) continue;
    const next = choices.map((c, i) => i === index ? { ...c, mealId: meal.id } : { ...c });
    const afterMinor = total(next);
    if (Number.isSafeInteger(afterMinor) && afterMinor >= 0 && afterMinor < (best?.afterMinor ?? beforeMinor)) {
      best = { choices: next, beforeMinor, afterMinor, from: choice.mealId, to: meal.id };
    }
  }
  return best;
}
