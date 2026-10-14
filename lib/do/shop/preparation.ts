import { type Budget, fingerprint, budgetSummary } from '../preparation/contracts';
export type Unit = 'g' | 'kg' | 'ml' | 'l' | 'each';
export type Quantity = { amount: number; unit: Unit };
export type Ingredient = { id: string; name: string; quantity: Quantity };
export type Meal = { id: string; name: string; baseServings: number; ingredients: Ingredient[] };
export type MealChoice = { mealId: string; servings: number; occurrences: number };
export type Pantry = Ingredient & { reviewed: boolean };
/** Merchant-neutral need. Never contains retailer product IDs. */
export type Requirement = { ingredientId: string; name: string; unit: 'g' | 'ml' | 'each'; required: number; pantryUsed: number; needed: number; meals: string[] };
export type Offer = {
  id: string; ingredientId: string; merchant: string; seller: string; product: string; variant: string;
  store: string; observedAt: string; expiresAt: string; stock: 'available' | 'unavailable' | 'unknown';
  source: 'fictional-fixture'; fulfilment: 'pickup' | 'delivery'; pack: Quantity;
  currency: string; priceMinor: number; variableWeight: boolean;
  allergens: { status: 'reviewed' | 'unknown'; contains: string[]; mayContain: string[] };
};
export type ShopInput = { mission: 'weekly' | 'occasion'; choices: MealChoice[]; pantry: Pantry[]; pantryReviewed: boolean; excludedAllergens: string[]; selectedOffers: Record<string, string>; budget: Budget };
export type BasketLine = Requirement & { offer: Offer | null; packs: number; leftover: number; estimatedMinor: number };
export type ShopPlan = { requirements: Requirement[]; basket: BasketLine[]; estimatedMinor: number; totalMinor: number | null; blockers: string[]; disclosures: string[]; digest: string };
function base(q: Quantity): { amount: number; unit: Requirement['unit'] } {
  if (!Number.isFinite(q.amount) || q.amount < 0) throw new Error('Quantity must be finite and non-negative');
  if (!['g', 'kg', 'ml', 'l', 'each'].includes(q.unit)) throw new Error('Unknown unit');
  return { amount: q.amount * (q.unit === 'kg' || q.unit === 'l' ? 1000 : 1), unit: q.unit === 'kg' ? 'g' : q.unit === 'l' ? 'ml' : q.unit };
}
export function consolidate(choices: MealChoice[], meals: Meal[], pantry: Pantry[]): Requirement[] {
  const needs = new Map<string, Requirement>();
  for (const choice of choices) {
    if (!Number.isInteger(choice.servings) || choice.servings < 1 || choice.servings > 30 || !Number.isInteger(choice.occurrences) || choice.occurrences < 1 || choice.occurrences > 7) throw new Error('Bounded servings and occurrences required');
    const meal = meals.find(m => m.id === choice.mealId);
    if (!meal || !Number.isInteger(meal.baseServings) || meal.baseServings < 1) throw new Error('Unknown meal or invalid recipe yield');
    for (const ingredient of meal.ingredients) {
      const quantity = base(ingredient.quantity), previous = needs.get(ingredient.id);
      if (previous && previous.unit !== quantity.unit) throw new Error('Cannot combine incompatible units');
      const required = quantity.amount * choice.servings / meal.baseServings * choice.occurrences;
      needs.set(ingredient.id, { ingredientId: ingredient.id, name: ingredient.name, unit: quantity.unit, required: (previous?.required ?? 0) + required, pantryUsed: 0, needed: 0, meals: [...new Set([...(previous?.meals ?? []), meal.name])] });
    }
  }
  const stock = new Map<string, { amount: number; unit: Requirement['unit'] }>();
  const pantryIds = new Set<string>();
  for (const p of pantry) {
    const quantity = base(p.quantity);
    if (pantryIds.has(p.id)) throw new Error('Duplicate pantry ingredient; review a single consolidated quantity');
    pantryIds.add(p.id);
    if (p.reviewed) stock.set(p.id, quantity);
  }
  return [...needs.values()].map(n => {
    const p = stock.get(n.ingredientId);
    if (p && p.unit !== n.unit) throw new Error('Pantry unit mismatch');
    const pantryUsed = Math.min(n.required, p?.amount ?? 0);
    return { ...n, pantryUsed, needed: n.required - pantryUsed };
  });
}
export function prepareShop(input: ShopInput, meals: Meal[], offers: Offer[], now: string): ShopPlan {
  if (!Number.isFinite(Date.parse(now))) throw new Error('Invalid preparation time');
  if (input.budget.currency !== 'NZD' || !Number.isSafeInteger(input.budget.limitMinor) || input.budget.limitMinor <= 0 || (input.budget.feeMinor !== null && (!Number.isSafeInteger(input.budget.feeMinor) || input.budget.feeMinor < 0))) throw new Error('Valid NZD budget required');
  const requirements = consolidate(input.choices, meals, input.pantry), blockers: string[] = [], disclosures: string[] = [];
  if (!input.choices.length) blockers.push('Select at least one meal');
  if (!input.pantryReviewed || input.pantry.some(p => !p.reviewed)) blockers.push('Review the pantry quantities, including zero stock');
  const basket = requirements.map(n => {
    if (!n.needed) return { ...n, offer: null, packs: 0, leftover: 0, estimatedMinor: 0 };
    const offer = offers.find(o => o.id === input.selectedOffers[n.ingredientId] && o.ingredientId === n.ingredientId);
    if (!offer) { blockers.push(`Select an offer for ${n.name}`); return { ...n, offer: null, packs: 0, leftover: 0, estimatedMinor: 0 }; }
    const pack = base(offer.pack);
    if (pack.unit !== n.unit || pack.amount <= 0) throw new Error('Offer pack must match ingredient unit');
    if (!Number.isSafeInteger(offer.priceMinor) || offer.priceMinor < 0) throw new Error('Invalid offer price');
    if (offer.currency !== 'NZD') blockers.push(`${n.name}: currency is not NZD`);
    if (offer.stock !== 'available') blockers.push(`${n.name}: stock ${offer.stock}`);
    if (!Number.isFinite(Date.parse(offer.observedAt)) || !Number.isFinite(Date.parse(offer.expiresAt)) || Date.parse(offer.observedAt) > Date.parse(now) || Date.parse(offer.expiresAt) <= Date.parse(now)) blockers.push(`${n.name}: stale or invalid offer evidence`);
    if (offer.allergens.status === 'unknown') blockers.push(`${n.name}: allergen information unknown`);
    if ([...offer.allergens.contains, ...offer.allergens.mayContain].some(a => input.excludedAllergens.includes(a))) blockers.push(`${n.name}: excluded allergen or cross-contact risk`);
    if (offer.variableWeight) disclosures.push(`${n.name}: variable-weight estimate; final weight and price unknown`);
    const packs = Math.ceil(n.needed / pack.amount);
    return { ...n, offer, packs, leftover: packs * pack.amount - n.needed, estimatedMinor: packs * offer.priceMinor };
  });
  const { estimatedMinor, totalMinor, exceedsBudget } = budgetSummary(input.budget, basket.map(line => line.estimatedMinor));
  if (input.budget.feeMinor === null) disclosures.push('Fulfilment fees unknown; budget coverage cannot be confirmed');
  if (exceedsBudget) blockers.push('Estimated basket exceeds the NZD budget');
  disclosures.push('Fictional recipes and allergen declarations require real product-label checks before any actual purchase. Dinner mission only; not a complete nutritional plan.');
  return { requirements, basket, estimatedMinor, totalMinor, blockers, disclosures, digest: fingerprint({ input, basket, blockers, disclosures }) };
}
