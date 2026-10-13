import { describe, expect, it } from 'vitest';
import { MEALS, ingredientByName } from './catalogue';
import { aisleList, displayQuantity, estimate, listText, parseShopBrief, planMeals, retailerHandoff } from './journey';

describe('shop brief parsing', () => {
  it('reads people, nights, budget, diet, allergens and pantry hints from plain words', () => {
    const brief = parseShopBrief('Dinners for 4 for 5 nights, budget $250. We have rice and some onions. No nuts please, and one of us is vegetarian.');
    expect(brief.servings).toBe(4);
    expect(brief.nights).toBe(5);
    expect(brief.budget).toEqual({ currency: 'NZD', limitMinor: 25000, feeMinor: null });
    expect(brief.vegetarian).toBe(true);
    expect(brief.excludedAllergens).toEqual(['nuts']);
    expect(brief.pantryHints.map(hint => hint.id)).toEqual(['rice', 'onions']);
  });
  it('defaults sensibly, bounds numbers and keeps unrecognised parts for the person', () => {
    const brief = parseShopBrief('Something easy this week. Kids hate mushrooms.');
    expect(brief.servings).toBe(4); expect(brief.nights).toBe(5); expect(brief.budget).toBeNull();
    expect(brief.unrecognised).toEqual(['Kids hate mushrooms']);
    expect(parseShopBrief('feed 40 people for 9 nights').servings).toBe(12);
    expect(parseShopBrief('feed 40 people for 9 nights').nights).toBe(7);
  });
  it('never invents a pantry item from an unknown word', () => {
    expect(parseShopBrief('we have truffles and caviar').pantryHints).toEqual([]);
    expect(ingredientByName('Kumara')?.id).toBe('kumara');
  });
});

describe('meal planning', () => {
  it('fills every night, rotates before repeating and honours vegetarian and allergen limits', () => {
    const plan = planMeals({ servings: 4, nights: 5, vegetarian: false, excludedAllergens: [] });
    expect(plan.reduce((sum, choice) => sum + choice.occurrences, 0)).toBe(5);
    expect(new Set(plan.map(choice => choice.mealId)).size).toBe(5);
    const veg = planMeals({ servings: 2, nights: 7, vegetarian: true, excludedAllergens: ['milk'] });
    expect(veg.reduce((sum, choice) => sum + choice.occurrences, 0)).toBe(7);
    for (const choice of veg) {
      const meal = MEALS.find(item => item.id === choice.mealId)!;
      expect(meal.tags).toContain('vegetarian');
      expect(meal.ingredients.some(item => ['cheese', 'milk', 'butter', 'sour-cream'].includes(item.id))).toBe(false);
    }
  });
  it('returns nothing rather than an unsafe plan when no dinner fits', () => {
    expect(planMeals({ servings: 4, nights: 3, vegetarian: true, excludedAllergens: ['milk', 'gluten', 'fish', 'egg', 'soy', 'nuts'] }).length).toBeGreaterThan(0);
    expect(planMeals({ servings: 4, nights: 3, vegetarian: true, excludedAllergens: ['milk'] }, [])).toEqual([]);
  });
});

describe('aisle list, estimate and handoff', () => {
  const choices = planMeals({ servings: 4, nights: 2, vegetarian: false, excludedAllergens: [] });
  it('deducts the pantry once, groups by aisle in store order and estimates in NZD', () => {
    const { groups, lines } = aisleList(choices, [{ id: 'pasta', name: 'Dried pasta', quantity: { amount: 1, unit: 'kg' }, reviewed: true }]);
    expect(lines.some(line => line.ingredientId === 'pasta')).toBe(false);
    expect(groups[0].aisle).toBe('produce');
    expect(groups.every(group => group.lines.length > 0)).toBe(true);
    expect(lines.every(line => line.estimateMinor >= 0 && line.display.length > 0)).toBe(true);
    const summary = estimate(lines, { currency: 'NZD', limitMinor: 10000, feeMinor: null });
    expect(summary?.estimatedMinor).toBeGreaterThan(0);
    expect(summary?.totalMinor).toBeNull();
  });
  it('ignores an unreviewed pantry row', () => {
    const { lines } = aisleList(choices, [{ id: 'pasta', name: 'Dried pasta', quantity: { amount: 1, unit: 'kg' }, reviewed: false }]);
    expect(lines.some(line => line.ingredientId === 'pasta')).toBe(true);
  });
  it('formats quantities the way a person shops', () => {
    expect(displayQuantity(1250, 'g')).toBe('1.3 kg');
    expect(displayQuantity(2000, 'ml')).toBe('2 L');
    expect(displayQuantity(123, 'g')).toBe('130 g');
    expect(displayQuantity(2.2, 'each')).toBe('3');
  });
  it('hands off as plain retailer search links and a copyable list, never a cart', () => {
    const { groups, lines } = aisleList(choices, []);
    const handoff = retailerHandoff(lines, 'woolworths');
    expect(handoff.retailer).toBe('Woolworths');
    expect(handoff.lines[0].url.startsWith('https://www.woolworths.co.nz/shop/searchproducts?search=')).toBe(true);
    expect(handoff.lines.find(line => line.name.startsWith('Chickpeas'))?.url ?? 'https://www.woolworths.co.nz/shop/searchproducts?search=Chickpeas').not.toContain('(');
    const text = listText(groups);
    expect(text.startsWith('Shopping list')).toBe(true);
    expect(text).toContain('PRODUCE');
  });
});
