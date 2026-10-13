import { describe, expect, it } from 'vitest';
import { lowerCostAlternative, missionChoices } from './missions';
import { consolidate, type Meal, type Pantry } from './preparation';

const meals: Meal[] = [
  { id: 'a', name: 'A', baseServings: 4, ingredients: [{ id: 'rice', name: 'Rice', quantity: { amount: 400, unit: 'g' } }] },
  { id: 'b', name: 'B', baseServings: 4, ingredients: [{ id: 'egg', name: 'Egg', quantity: { amount: 4, unit: 'each' } }] },
];
const pantry: Pantry[] = [{ id: 'egg', name: 'Egg', quantity: { amount: 4, unit: 'each' }, reviewed: true }];
describe('bounded shopping missions', () => {
  it('selects one dinner or two occurrences without changing people', () => {
    expect(missionChoices('tonight', meals, pantry, 4, 'a')).toEqual([{ mealId: 'a', servings: 4, occurrences: 1 }]);
    const extra = missionChoices('extra', meals, pantry, 4, 'b');
    expect(extra).toEqual([{ mealId: 'b', servings: 4, occurrences: 2 }]);
    expect(consolidate(extra, meals, pantry)[0]).toMatchObject({ required: 8, pantryUsed: 4, needed: 4 });
  });
  it('chooses confirmed pantry coverage, never guessed quantities', () => {
    expect(missionChoices('pantry', meals, pantry, 4, 'a')[0].mealId).toBe('b');
    expect(missionChoices('pantry', meals, pantry.map(p => ({ ...p, reviewed: false })), 4)[0].mealId).toBe('a');
    expect(missionChoices('pantry', [], pantry, 4)).toEqual([]);
  });
  it('recomputes complete pack-rounded totals, deducting pantry once across repeated meals', () => {
    const choices = [{ mealId: 'a', servings: 4, occurrences: 1 }, { mealId: 'b', servings: 4, occurrences: 1 }];
    const total = (cs: typeof choices) => consolidate(cs, meals, pantry).reduce((sum, n) => sum + Math.ceil(n.needed / (n.unit === 'g' ? 500 : 6)) * (n.unit === 'g' ? 500 : 300), 0);
    expect(lowerCostAlternative(choices, meals, total)).toMatchObject({ beforeMinor: 500, afterMinor: 300, from: 'a', to: 'b' });
    expect(choices[0].mealId).toBe('a');
    expect(lowerCostAlternative(choices, meals.slice(0, 1), total)).toBeNull();
    expect(lowerCostAlternative(choices, meals, () => NaN)).toBeNull();
  });
});
