import type { Meal, Offer, ShopInput } from './preparation';
export const meals: Meal[] = [
  { id: 'rice-bowl', name: 'Bean & vegetable rice bowls', baseServings: 4, ingredients: [{ id: 'rice', name: 'Dry rice', quantity: { amount: 300, unit: 'g' } }, { id: 'beans', name: 'Drained beans', quantity: { amount: 480, unit: 'g' } }, { id: 'vegetables', name: 'Vegetables', quantity: { amount: 600, unit: 'g' } }] },
  { id: 'soup', name: 'Bean & vegetable soup', baseServings: 4, ingredients: [{ id: 'beans', name: 'Drained beans', quantity: { amount: 480, unit: 'g' } }, { id: 'vegetables', name: 'Vegetables', quantity: { amount: 800, unit: 'g' } }] },
];
const common = { merchant: 'Fictional Grocer', seller: 'Fictional Grocer', store: 'Sample Auckland store', observedAt: '2026-10-12T00:00:00Z', expiresAt: '2099-01-01T00:00:00Z', stock: 'available' as const, source: 'fictional-fixture' as const, fulfilment: 'pickup' as const, currency: 'NZD', variableWeight: false, allergens: { status: 'reviewed' as const, contains: [], mayContain: [] } };
export const offers: Offer[] = [
  { ...common, id: 'rice-1', ingredientId: 'rice', product: 'Sample rice', variant: '1 kg dry', pack: { amount: 1, unit: 'kg' }, priceMinor: 420 },
  { ...common, id: 'rice-2', ingredientId: 'rice', product: 'Sample rice alternative', variant: '500 g dry', pack: { amount: 500, unit: 'g' }, priceMinor: 260 },
  { ...common, id: 'beans-1', ingredientId: 'beans', product: 'Sample beans', variant: 'Can: 240 g drained (400 g gross)', pack: { amount: 240, unit: 'g' }, priceMinor: 190 },
  { ...common, id: 'beans-2', ingredientId: 'beans', product: 'Sample beans alternative', variant: '480 g drained', pack: { amount: 480, unit: 'g' }, priceMinor: 350 },
  { ...common, id: 'veg-1', ingredientId: 'vegetables', product: 'Sample vegetable mix', variant: '1 kg frozen', pack: { amount: 1, unit: 'kg' }, priceMinor: 550 },
  { ...common, id: 'veg-2', ingredientId: 'vegetables', product: 'Sample loose vegetables', variant: 'Estimated 500 g', pack: { amount: 500, unit: 'g' }, priceMinor: 310, variableWeight: true },
  { ...common, id: 'veg-unknown', ingredientId: 'vegetables', product: 'Sample mystery mix', variant: '1 kg · label unknown', pack: { amount: 1, unit: 'kg' }, priceMinor: 400, allergens: { status: 'unknown', contains: [], mayContain: [] } },
];
export const initialShop: ShopInput = { mission: 'weekly', choices: [{ mealId: 'rice-bowl', servings: 4, occurrences: 3 }, { mealId: 'soup', servings: 4, occurrences: 2 }], pantry: [{ id: 'rice', name: 'Dry rice', quantity: { amount: 500, unit: 'g' }, reviewed: false }, { id: 'beans', name: 'Drained beans', quantity: { amount: 240, unit: 'g' }, reviewed: false }, { id: 'vegetables', name: 'Vegetables', quantity: { amount: 0, unit: 'g' }, reviewed: false }], pantryReviewed: false, excludedAllergens: [], selectedOffers: { rice: 'rice-1', beans: 'beans-1', vegetables: 'veg-1' }, budget: { currency: 'NZD', limitMinor: 6000, feeMinor: null } };
