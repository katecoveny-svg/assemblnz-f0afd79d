import { consolidate, type MealChoice, type Pantry, type Requirement } from './preparation';
import { AISLE_ORDER, INGREDIENTS, MEALS, ingredientById, ingredientByName, type Aisle, type CatalogueMeal } from './catalogue';
import { budgetSummary, fingerprint, type Budget } from '../preparation/contracts';

/** A grocery brief in the shopper's own words, read deterministically: no model, no guessing
 * beyond the patterns below. Anything not recognised stays in `unrecognised` for the person. */
export type ShopBrief = {
  servings: number; nights: number; budget: Budget | null;
  vegetarian: boolean; vegan?: boolean; dietaryReviewRequired?: boolean; excludedAllergens: string[];
  pantryHints: { id: string; name: string }[];
  unrecognised: string[];
};
const ALLERGEN_WORDS: Record<string, string[]> = { gluten: ['gluten', 'gluten-free', 'gluten free', 'coeliac', 'celiac'], milk: ['dairy', 'dairy-free', 'dairy free', 'lactose'], egg: ['egg-free', 'egg free', 'no eggs', 'no egg'], fish: ['no fish', 'fish-free'], soy: ['no soy', 'soy-free', 'soy free'], nuts: ['no nuts', 'no nut', 'nut-free', 'nut free', 'nut allerg', 'allergic to nuts', 'no peanuts', 'peanut allerg', 'peanut-free', 'peanut free'] };
export function parseShopBrief(text: string): ShopBrief {
  const source = text.replace(/\s+/g, ' ').trim();
  const lower = source.toLowerCase();
  const peopleSource = lower.replace(/\b\d{1,2}\s*(?:nights?|dinners?|days?|meals?)\b/g, '');
  const people = peopleSource.match(/(?:for|feed|feeds|feeding)\s+(\d{1,2})\b|(\d{1,2})\s*(?:people|adults|of us|pax)\b|family of\s+(\d{1,2})/);
  const servings = Math.min(12, Math.max(1, Number(people?.[1] ?? people?.[2] ?? people?.[3] ?? 4)));
  const nightsMatch = lower.match(/\b(\d{1,2})\s*(?:nights?|dinners?|days?|meals?)\b/) ?? (/\b(a )?week\b|weekly/.test(lower) ? ['', '5'] : null);
  const nights = Math.min(7, Math.max(1, Number(nightsMatch?.[1] ?? 5)));
  const money = lower.match(/\$\s?(\d{2,4})(?:\.(\d{2}))?|(\d{2,4})\s*(?:dollars|bucks|nzd)\b|budget (?:of|is)\s*\$?(\d{2,4})/);
  const limit = money ? Number(money[1] ?? money[3] ?? money[4]) * 100 + Number(money[2] ?? 0) : null;
  const budget: Budget | null = limit && limit > 0 ? { currency: 'NZD', limitMinor: limit, feeMinor: null } : null;
  const vegetarian = /\bvegetarian|\bveggie\b|\bno meat\b|\bmeat-free\b|\bvegan\b/.test(lower);
  const excludedAllergens = Object.entries(ALLERGEN_WORDS).filter(([, words]) => words.some(word => lower.includes(word))).map(([key]) => key);
  const pantryHints: ShopBrief['pantryHints'] = [];
  const have = lower.match(/(?:we|i|we've|i've)\s+(?:have|got|already have|already got)\s+([^.;]+)/g) ?? [];
  for (const phrase of have) {
    const items = phrase.replace(/^(?:we|i|we've|i've)\s+(?:have|got|already have|already got)\s+/, '').split(/,|\band\b|&/);
    for (const item of items) {
      const known = ingredientByName(item.replace(/\b(some|a|an|plenty of|lots of|heaps of|enough)\b/g, '').trim());
      if (known && !pantryHints.some(hint => hint.id === known.id)) pantryHints.push({ id: known.id, name: known.name });
    }
  }
  const unrecognised = source.split(/[.;]\s*/).map(part => part.trim()).filter(part => part && !/(for|feed)\s+\d|\d\s*(people|adults|nights?|dinners?|days?)|\$|dollars|budget|vegetarian|veggie|have|got|week|gluten|dairy|nut|egg|fish|soy/i.test(part));
  // Retain every dietary clause for review, including clauses attached to recognised counts.
  const dietaryReviewRequired = /allerg|intoleran|sesame|shellfish|celery|mustard|sulphite|lupin|halal|kosher|low.sodium|diabet|keto/i.test(source);
  if (dietaryReviewRequired) unrecognised.push('Dietary requirements need manual review; this catalogue cannot verify allergy safety.');
  return { servings, nights, budget, vegetarian, dietaryReviewRequired, vegan: /\bvegan\b/.test(lower), excludedAllergens, pantryHints, unrecognised };
}

/** Pick dinners for the brief: rotate the catalogue, honour vegetarian and allergen limits,
 * never repeat a dinner before every eligible one has been used. */
export function planMeals(brief: Pick<ShopBrief, 'servings' | 'nights' | 'vegetarian' | 'vegan' | 'dietaryReviewRequired' | 'excludedAllergens'>, catalogue: CatalogueMeal[] = MEALS): MealChoice[] {
  // Catalogue does not verify animal-derived ingredients in sauces or packaged goods.
  if (brief.vegan || brief.dietaryReviewRequired) return [];
  const eligible = catalogue.filter(meal => (!brief.vegetarian || meal.tags.includes('vegetarian'))
    && !meal.ingredients.some(item => ingredientById(item.id)?.allergens.some(allergen => brief.excludedAllergens.includes(allergen))));
  if (!eligible.length) return [];
  const choices = new Map<string, MealChoice>();
  for (let night = 0; night < brief.nights; night++) {
    const meal = eligible[night % eligible.length];
    const existing = choices.get(meal.id);
    if (existing) existing.occurrences += 1; else choices.set(meal.id, { mealId: meal.id, servings: brief.servings, occurrences: 1 });
  }
  return [...choices.values()];
}

export type ListLine = Requirement & { aisle: Aisle; display: string; estimateMinor: number; allergens: string[] };
export type AisleGroup = { aisle: Aisle; lines: ListLine[] };
/** A merchant-neutral list grouped the way a supermarket is laid out, with a rough NZD estimate. */
export function aisleList(choices: MealChoice[], pantry: Pantry[], catalogue: CatalogueMeal[] = MEALS): { groups: AisleGroup[]; lines: ListLine[] } {
  const lines: ListLine[] = consolidate(choices, catalogue, pantry).filter(need => need.needed > 0).map(need => {
    const item = ingredientById(need.ingredientId);
    const aisle = item?.aisle ?? 'pantry';
    const per = item?.indicativeMinorPer;
    const perBase = per ? per.amount * (per.unit === 'kg' || per.unit === 'l' ? 1000 : 1) : 0;
    const packs = per && perBase > 0 ? Math.ceil(need.needed / perBase) : 0;
    return { ...need, aisle, display: displayQuantity(need.needed, need.unit), estimateMinor: per ? packs * per.priceMinor : 0, allergens: item?.allergens ?? [] };
  });
  const groups = AISLE_ORDER.map(aisle => ({ aisle, lines: lines.filter(line => line.aisle === aisle) })).filter(group => group.lines.length);
  return { groups, lines };
}
export function displayQuantity(amount: number, unit: Requirement['unit']): string {
  if (unit === 'each') return `${Math.ceil(amount)}`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(amount % 1000 ? 1 : 0)} ${unit === 'g' ? 'kg' : 'L'}`;
  return `${Math.ceil(amount / 10) * 10} ${unit}`;
}

export type ShopEstimate = ReturnType<typeof budgetSummary> | null;
export function estimate(lines: ListLine[], budget: Budget | null): ShopEstimate {
  return budget ? budgetSummary(budget, lines.map(line => line.estimateMinor)) : null;
}

/** Public search pages on the retailer's own site, opened in the shopper's own browser. Nothing is
 * added to a cart by DO; the person searches, chooses and checks out themselves. URL shapes are
 * best-known public forms and should be checked when the retailer changes its site. */
export const RETAILERS = {
  woolworths: { name: 'Woolworths', search: (q: string) => `https://www.woolworths.co.nz/shop/searchproducts?search=${encodeURIComponent(q)}` },
  'new-world': { name: 'New World', search: (q: string) => `https://www.newworld.co.nz/shop/search?q=${encodeURIComponent(q)}` },
  'paknsave': { name: "PAK'nSAVE", search: (q: string) => `https://www.paknsave.co.nz/shop/search?q=${encodeURIComponent(q)}` },
} as const;
export type RetailerKey = keyof typeof RETAILERS;
export type HandoffLine = { name: string; display: string; aisle: Aisle; url: string };
export function retailerHandoff(lines: ListLine[], retailer: RetailerKey): { retailer: (typeof RETAILERS)[RetailerKey]['name']; lines: HandoffLine[] } {
  const target = RETAILERS[retailer];
  return { retailer: target.name, lines: lines.map(line => ({ name: line.name, display: line.display, aisle: line.aisle, url: target.search(line.name.replace(/\s*\(.*?\)\s*/g, ' ').trim()) })) };
}
/** Plain-text list for clipboard, notes or a kept task. */
export function listText(groups: AisleGroup[], title = 'Shopping list'): string {
  return [title, ...groups.flatMap(group => ['', group.aisle.toUpperCase(), ...group.lines.map(line => `- ${line.name} · ${line.display}`)])].join('\n');
}
export function shopDigest(value: { brief: ShopBrief; choices: MealChoice[]; pantry: Pantry[]; lines: ListLine[] }): string { return fingerprint(value); }
export const CATALOGUE_INGREDIENT_IDS = INGREDIENTS.map(item => item.id);

export type ShopNight = { mealId: string; servings: number };
/** Keep different serving counts separate; consolidate sums their exact quantities. */
export function choicesFromNights(nights: ShopNight[]): MealChoice[] {
  const choices = new Map<string, MealChoice>();
  for (const night of nights) {
    const key = `${night.mealId}:${night.servings}`;
    const previous = choices.get(key);
    if (previous) previous.occurrences += 1;
    else choices.set(key, { ...night, occurrences: 1 });
  }
  return [...choices.values()];
}

/** UI boundary: empty and fractional edits remain drafts, never quantities. */
export function validShopCount(raw: string, max: number): boolean {
  return /^\d+$/.test(raw) && Number.isSafeInteger(Number(raw)) && Number(raw) >= 1 && Number(raw) <= max;
}
