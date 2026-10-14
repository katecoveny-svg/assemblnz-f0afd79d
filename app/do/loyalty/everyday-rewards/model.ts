import { parseShopBrief } from '@/lib/do/shop/journey';
import { lowerCostAlternative, missionChoices, type ShopMission } from '@/lib/do/shop/missions';
import {
  prepareShop,
  type Meal,
  type Offer,
  type Pantry,
} from "@/lib/do/shop/preparation";

/** Licensed synthetic fixtures. No merchant catalogue, account or offer data. */
export const pantryTemplate: Pantry[] = [
  {
    id: "tomato",
    name: "Tomatoes",
    quantity: { amount: 400, unit: "g" },
    reviewed: true,
  },
  {
    id: "aubergine",
    name: "Aubergine",
    quantity: { amount: 1, unit: "each" },
    reviewed: true,
  },
  {
    id: "pasta",
    name: "Pasta",
    quantity: { amount: 0, unit: "g" },
    reviewed: true,
  },
  {
    id: "basil",
    name: "Basil",
    quantity: { amount: 1, unit: "each" },
    reviewed: true,
  },
];
export const meals: Meal[] = [
  {
    id: "pasta-night",
    name: "Roasted tomato & aubergine pasta",
    baseServings: 4,
    ingredients: [
      { id: "tomato", name: "Tomatoes", quantity: { amount: 800, unit: "g" } },
      {
        id: "aubergine",
        name: "Aubergine",
        quantity: { amount: 2, unit: "each" },
      },
      { id: "pasta", name: "Pasta", quantity: { amount: 500, unit: "g" } },
      { id: "basil", name: "Basil", quantity: { amount: 1, unit: "each" } },
    ],
  },
];
meals.push(
  {
    id: "rice-night",
    name: "Tomato & aubergine rice bowls",
    baseServings: 4,
    ingredients: [
      { id: "tomato", name: "Tomatoes", quantity: { amount: 600, unit: "g" } },
      {
        id: "aubergine",
        name: "Aubergine",
        quantity: { amount: 2, unit: "each" },
      },
      { id: "rice", name: "Rice", quantity: { amount: 400, unit: "g" } },
      { id: "basil", name: "Basil", quantity: { amount: 1, unit: "each" } },
    ],
  },
  {
    id: "eggs-toast",
    name: "Tomato eggs on toast",
    baseServings: 4,
    ingredients: [
      { id: "tomato", name: "Tomatoes", quantity: { amount: 600, unit: "g" } },
      { id: "egg", name: "Eggs", quantity: { amount: 8, unit: "each" } },
      {
        id: "bread",
        name: "Bread slices",
        quantity: { amount: 8, unit: "each" },
      },
      { id: "basil", name: "Basil", quantity: { amount: 1, unit: "each" } },
    ],
  },
);
const packs = [
  { id: "tomato", amount: 500, unit: "g", price: 450 },
  { id: "aubergine", amount: 1, unit: "each", price: 350 },
  { id: "pasta", amount: 500, unit: "g", price: 250 },
  { id: "basil", amount: 1, unit: "each", price: 300 },
  { id: "rice", amount: 1000, unit: "g", price: 400 },
  { id: "egg", amount: 6, unit: "each", price: 600 },
  { id: "bread", amount: 20, unit: "each", price: 400 },
] as const;
export const recipeDescriptions: Record<string, string> = {
  "pasta-night":
    "Roast tomatoes and aubergine, cook pasta and toss with basil.",
  "rice-night":
    "Cook rice and serve with roasted tomato and aubergine, finished with basil.",
  "eggs-toast":
    "Cook the eggs and tomatoes thoroughly and serve on toast with basil.",
};
export const fixtureTime = "2026-10-13T00:00:00Z";
const offers: Offer[] = packs.map((p) => ({
  id: p.id,
  ingredientId: p.id,
  merchant: "Fictional demonstration store",
  seller: "Synthetic fixture",
  product: p.id,
  variant: "Demo pack",
  store: "No real store",
  observedAt: fixtureTime,
  expiresAt: "2026-10-14T00:00:00Z",
  stock: "available",
  source: "fictional-fixture",
  fulfilment: "pickup",
  pack: { amount: p.amount, unit: p.unit },
  currency: "NZD",
  priceMinor: p.price,
  variableWeight: false,
  allergens: {
    status: "reviewed",
    contains: ["pasta", "bread"].includes(p.id)
      ? ["wheat"]
      : p.id === "egg"
        ? ["egg"]
        : [],
    mayContain: [],
  },
}));
export function planShop(
  pantry: Pantry[],
  servings: number,
  reviewed: boolean,
  budget = 4000,
  mealId = "pasta-night",
  mission: ShopMission = "tonight",
  dietaryText = "",
) {
  const diet = parseShopBrief(dietaryText);
  const eligible = demoEligibleMeals(dietaryText);
  const plan = prepareShop(
    {
      mission: "occasion",
      choices: eligible.some(m => m.id === mealId) ? [{ mealId, servings, occurrences: mission === "extra" ? 2 : 1 }] : [],
      pantry,
      pantryReviewed: reviewed,
      excludedAllergens: diet.excludedAllergens.map(a => a === "gluten" ? "wheat" : a),
      selectedOffers: Object.fromEntries(packs.map((p) => [p.id, p.id])),
      budget: { currency: "NZD", limitMinor: budget, feeMinor: 0 },
    },
    meals,
    offers,
    fixtureTime,
  );
  if (!eligible.length) plan.blockers.push('Dietary requirements need manual review; these sample recipes cannot verify suitability.');
  return plan;
}
export function demoEligibleMeals(dietaryText: string) {
  const diet = parseShopBrief(dietaryText);
  if (diet.vegan || diet.dietaryReviewRequired || diet.unrecognised.length) return [];
  const excluded = diet.excludedAllergens.map(a => a === 'gluten' ? 'wheat' : a);
  return meals.filter(meal => !meal.ingredients.some(ingredient => offers.find(o => o.ingredientId === ingredient.id)?.allergens.contains.some(a => excluded.includes(a))));
}
export function demoMissionRecipe(mission: ShopMission, pantry: Pantry[], servings: number, current: string, dietaryText = '') {
  return missionChoices(mission, demoEligibleMeals(dietaryText), pantry, servings, current)[0]?.mealId ?? null;
}
export function demoAlternative(pantry: Pantry[], servings: number, reviewed: boolean, budget: number, recipe: string, mission: ShopMission, dietaryText = '') {
  if (!reviewed) return null;
  const eligible = demoEligibleMeals(dietaryText);
  if (!eligible.some(m => m.id === recipe)) return null;
  return lowerCostAlternative([{ mealId: recipe, servings, occurrences: mission === 'extra' ? 2 : 1 }], eligible, choices =>
    planShop(pantry, servings, true, budget, choices[0].mealId, mission, dietaryText).estimatedMinor);
}

export const money = (minor: number) =>
  new Intl.NumberFormat("en-NZ", { style: "currency", currency: "NZD" }).format(
    minor / 100,
  );
export function canApprove(
  reviewedDigest: string | null,
  currentDigest: string,
  blockers: string[],
) {
  return reviewedDigest === currentDigest && blockers.length === 0;
}
