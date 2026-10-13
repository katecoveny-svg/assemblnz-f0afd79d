import { prepareShop, type Meal, type Offer, type Pantry } from '@/lib/do/shop/preparation';

/** Licensed synthetic fixtures. No merchant catalogue, account or offer data. */
export const pantryTemplate: Pantry[] = [
  { id: 'tomato', name: 'Tomatoes', quantity: { amount: 400, unit: 'g' }, reviewed: true },
  { id: 'aubergine', name: 'Aubergine', quantity: { amount: 1, unit: 'each' }, reviewed: true },
  { id: 'pasta', name: 'Pasta', quantity: { amount: 0, unit: 'g' }, reviewed: true },
  { id: 'basil', name: 'Basil', quantity: { amount: 1, unit: 'each' }, reviewed: true },
];
export const meals: Meal[] = [
  { id: 'pasta-night', name: 'Roasted tomato & aubergine pasta', baseServings: 4, ingredients: [
    { id: 'tomato', name: 'Tomatoes', quantity: { amount: 800, unit: 'g' } },
    { id: 'aubergine', name: 'Aubergine', quantity: { amount: 2, unit: 'each' } },
    { id: 'pasta', name: 'Pasta', quantity: { amount: 500, unit: 'g' } },
    { id: 'basil', name: 'Basil', quantity: { amount: 1, unit: 'each' } },
  ] },
];
const packs = [{ id: 'tomato', amount: 500, unit: 'g', price: 450 }, { id: 'aubergine', amount: 1, unit: 'each', price: 350 }, { id: 'pasta', amount: 500, unit: 'g', price: 250 }, { id: 'basil', amount: 1, unit: 'each', price: 300 }] as const;
export const fixtureTime = '2026-10-13T00:00:00Z';
const offers: Offer[] = packs.map(p => ({ id: p.id, ingredientId: p.id, merchant: 'Fictional demonstration store', seller: 'Synthetic fixture', product: pantryTemplate.find(i => i.id === p.id)!.name, variant: 'Demo pack', store: 'No real store', observedAt: fixtureTime, expiresAt: '2026-10-14T00:00:00Z', stock: 'available', source: 'fictional-fixture', fulfilment: 'pickup', pack: { amount: p.amount, unit: p.unit }, currency: 'NZD', priceMinor: p.price, variableWeight: false, allergens: { status: 'reviewed', contains: p.id === 'pasta' ? ['wheat'] : [], mayContain: [] } }));
export function planShop(pantry: Pantry[], servings: number, reviewed: boolean, budget = 4000) {
  return prepareShop({ mission: 'occasion', choices: [{ mealId: 'pasta-night', servings, occurrences: 1 }], pantry, pantryReviewed: reviewed, excludedAllergens: [], selectedOffers: Object.fromEntries(packs.map(p => [p.id, p.id])), budget: { currency: 'NZD', limitMinor: budget, feeMinor: 0 } }, meals, offers, fixtureTime);
}
export const money = (minor: number) => new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD' }).format(minor / 100);
export function canApprove(reviewedDigest: string | null, currentDigest: string, blockers: string[]) { return reviewedDigest === currentDigest && blockers.length === 0; }
