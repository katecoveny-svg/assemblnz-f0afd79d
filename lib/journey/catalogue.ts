/**
 * assembl — mock grocery catalogue
 * --------------------------------
 * ILLUSTRATIVE demonstration data only. This is NOT a live retailer feed and
 * does NOT represent Woolworths systems, pricing, availability or promotions.
 * Prices are indicative NZD for the "everyday, assembled" reference journey.
 *
 * Kept deliberately separate from UI and from the runtime so a real catalogue
 * connector can replace `CATALOGUE` behind the same shape later.
 */

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink' | 'staple';

export type DietaryTag =
  | 'vegetarian'
  | 'pescatarian'
  | 'contains_meat'
  | 'contains_fish'
  | 'spicy'
  | 'contains_gluten'
  | 'contains_dairy'
  | 'contains_nuts';

export type CatalogueTier = 'value' | 'everyday' | 'premium';

export type CatalogueProduct = {
  sku: string;
  name: string;
  category: string;
  slots: MealSlot[];
  /** Indicative NZD unit price. Demonstration only. */
  priceNzd: number;
  tier: CatalogueTier;
  dietary: DietaryTag[];
  /** Rough preparation effort — powers "easy dinners" style intents. */
  effort: 'none' | 'low' | 'medium' | 'high';
  /** Availability in this illustrative catalogue. */
  available: boolean;
  /** SKUs offered as substitutes when this item is unavailable/over budget. */
  substitutes?: string[];
  /** Whether teenagers tend to like it — supports "teen-friendly" priorities. */
  crowdPleaser?: boolean;
};

/** A meal idea assembled from catalogue SKUs. */
export type MealIdea = {
  id: string;
  name: string;
  slot: MealSlot;
  servesPeople: number;
  effort: CatalogueProduct['effort'];
  skus: string[];
  dietary: DietaryTag[];
  note?: string;
};

export const CATALOGUE: CatalogueProduct[] = [
  // ── Breakfasts ──────────────────────────────────────────────────────────
  { sku: 'brk-eggs-12', name: 'Free-range eggs (12)', category: 'Eggs & dairy', slots: ['breakfast'], priceNzd: 8.5, tier: 'everyday', dietary: ['vegetarian', 'pescatarian'], effort: 'low', available: true, crowdPleaser: true },
  { sku: 'brk-oats-1kg', name: 'Rolled oats 1kg', category: 'Breakfast', slots: ['breakfast'], priceNzd: 4.2, tier: 'value', dietary: ['vegetarian', 'pescatarian', 'contains_gluten'], effort: 'low', available: true },
  { sku: 'brk-bread-toast', name: 'Toast bread loaf', category: 'Bakery', slots: ['breakfast', 'lunch'], priceNzd: 3.6, tier: 'everyday', dietary: ['vegetarian', 'pescatarian', 'contains_gluten'], effort: 'none', available: true, crowdPleaser: true, substitutes: ['brk-bread-multigrain'] },
  { sku: 'brk-bread-multigrain', name: 'Multigrain loaf', category: 'Bakery', slots: ['breakfast', 'lunch'], priceNzd: 4.5, tier: 'premium', dietary: ['vegetarian', 'pescatarian', 'contains_gluten'], effort: 'none', available: true },
  { sku: 'brk-cereal-flakes', name: 'Corn flakes 500g', category: 'Breakfast', slots: ['breakfast'], priceNzd: 5.0, tier: 'everyday', dietary: ['vegetarian', 'pescatarian', 'contains_gluten'], effort: 'none', available: true, crowdPleaser: true },
  { sku: 'brk-yoghurt-1kg', name: 'Natural yoghurt 1kg', category: 'Eggs & dairy', slots: ['breakfast', 'snack'], priceNzd: 6.0, tier: 'everyday', dietary: ['vegetarian', 'pescatarian', 'contains_dairy'], effort: 'none', available: true },

  // ── Lunches ─────────────────────────────────────────────────────────────
  { sku: 'lun-tuna-4pk', name: 'Tuna in springwater (4pk)', category: 'Pantry', slots: ['lunch'], priceNzd: 7.8, tier: 'everyday', dietary: ['pescatarian', 'contains_fish'], effort: 'none', available: true },
  { sku: 'lun-cheese-500', name: 'Tasty cheese 500g', category: 'Eggs & dairy', slots: ['lunch', 'dinner', 'snack'], priceNzd: 9.5, tier: 'everyday', dietary: ['vegetarian', 'pescatarian', 'contains_dairy'], effort: 'none', available: true, crowdPleaser: true },
  { sku: 'lun-salad-bag', name: 'Mixed salad bag', category: 'Produce', slots: ['lunch', 'dinner'], priceNzd: 4.0, tier: 'everyday', dietary: ['vegetarian', 'pescatarian'], effort: 'low', available: true },
  { sku: 'lun-wraps-8', name: 'Soft tortilla wraps (8)', category: 'Bakery', slots: ['lunch', 'dinner'], priceNzd: 4.2, tier: 'everyday', dietary: ['vegetarian', 'pescatarian', 'contains_gluten'], effort: 'low', available: true, crowdPleaser: true },

  // ── Dinners ─────────────────────────────────────────────────────────────
  { sku: 'din-salmon-fillets', name: 'Salmon fillets (per kg)', category: 'Seafood', slots: ['dinner'], priceNzd: 34.0, tier: 'premium', dietary: ['pescatarian', 'contains_fish'], effort: 'medium', available: true, substitutes: ['din-white-fish', 'din-tuna-pasta'] },
  { sku: 'din-white-fish', name: 'NZ white fish fillets (per kg)', category: 'Seafood', slots: ['dinner'], priceNzd: 26.0, tier: 'everyday', dietary: ['pescatarian', 'contains_fish'], effort: 'medium', available: true },
  { sku: 'din-pasta-1kg', name: 'Spaghetti 1kg', category: 'Pantry', slots: ['dinner'], priceNzd: 2.8, tier: 'value', dietary: ['vegetarian', 'pescatarian', 'contains_gluten'], effort: 'low', available: true, crowdPleaser: true },
  { sku: 'din-pasta-sauce', name: 'Tomato pasta sauce', category: 'Pantry', slots: ['dinner'], priceNzd: 3.2, tier: 'everyday', dietary: ['vegetarian', 'pescatarian'], effort: 'none', available: true },
  { sku: 'din-tuna-pasta', name: 'Tuna pasta bake kit', category: 'Meal kits', slots: ['dinner'], priceNzd: 6.5, tier: 'everyday', dietary: ['pescatarian', 'contains_fish', 'contains_gluten'], effort: 'low', available: true, crowdPleaser: true },
  { sku: 'din-veg-stirfry', name: 'Stir-fry vegetable mix', category: 'Produce', slots: ['dinner'], priceNzd: 5.5, tier: 'everyday', dietary: ['vegetarian', 'pescatarian'], effort: 'low', available: true },
  { sku: 'din-curry-paste-hot', name: 'Hot curry paste', category: 'Pantry', slots: ['dinner'], priceNzd: 3.9, tier: 'everyday', dietary: ['vegetarian', 'pescatarian', 'spicy'], effort: 'low', available: true },
  // Deliberately UNAVAILABLE — drives the resolution exception path.
  { sku: 'din-pizza-bases-4', name: 'Fresh pizza bases (4)', category: 'Bakery', slots: ['dinner'], priceNzd: 5.0, tier: 'everyday', dietary: ['vegetarian', 'pescatarian', 'contains_gluten'], effort: 'low', available: false, crowdPleaser: true, substitutes: ['din-pizza-bases-frozen', 'lun-wraps-8'] },
  { sku: 'din-pizza-bases-frozen', name: 'Frozen pizza bases (5)', category: 'Frozen', slots: ['dinner'], priceNzd: 6.2, tier: 'everyday', dietary: ['vegetarian', 'pescatarian', 'contains_gluten'], effort: 'low', available: true, crowdPleaser: true },

  // ── Snacks ──────────────────────────────────────────────────────────────
  { sku: 'snk-crackers', name: 'Rice crackers', category: 'Snacks', slots: ['snack'], priceNzd: 2.5, tier: 'value', dietary: ['vegetarian', 'pescatarian'], effort: 'none', available: true, crowdPleaser: true },
  { sku: 'snk-hummus', name: 'Hummus tub', category: 'Deli', slots: ['snack'], priceNzd: 4.5, tier: 'everyday', dietary: ['vegetarian', 'pescatarian'], effort: 'none', available: true },
  { sku: 'snk-fruit-mix', name: 'Seasonal fruit box', category: 'Produce', slots: ['snack'], priceNzd: 12.0, tier: 'everyday', dietary: ['vegetarian', 'pescatarian'], effort: 'none', available: true, crowdPleaser: true },
  { sku: 'snk-chips-6', name: 'Sharing chips (6pk)', category: 'Snacks', slots: ['snack'], priceNzd: 5.5, tier: 'everyday', dietary: ['vegetarian', 'pescatarian'], effort: 'none', available: true, crowdPleaser: true },
  { sku: 'snk-popcorn', name: 'Microwave popcorn (5)', category: 'Snacks', slots: ['snack'], priceNzd: 3.8, tier: 'value', dietary: ['vegetarian', 'pescatarian'], effort: 'none', available: true, crowdPleaser: true },

  // ── Drinks ──────────────────────────────────────────────────────────────
  { sku: 'drk-milk-3l', name: 'Milk 3L', category: 'Eggs & dairy', slots: ['drink', 'breakfast'], priceNzd: 5.2, tier: 'everyday', dietary: ['vegetarian', 'pescatarian', 'contains_dairy'], effort: 'none', available: true },
  { sku: 'drk-juice-2l', name: 'Orange juice 2L', category: 'Drinks', slots: ['drink'], priceNzd: 4.5, tier: 'everyday', dietary: ['vegetarian', 'pescatarian'], effort: 'none', available: true, crowdPleaser: true },
  { sku: 'drk-sparkling-6', name: 'Sparkling water (6pk)', category: 'Drinks', slots: ['drink'], priceNzd: 6.0, tier: 'everyday', dietary: ['vegetarian', 'pescatarian'], effort: 'none', available: true },

  // ── Staples ─────────────────────────────────────────────────────────────
  { sku: 'stp-butter', name: 'Butter 500g', category: 'Eggs & dairy', slots: ['staple'], priceNzd: 6.5, tier: 'everyday', dietary: ['vegetarian', 'pescatarian', 'contains_dairy'], effort: 'none', available: true },
  { sku: 'stp-oil', name: 'Olive oil 500ml', category: 'Pantry', slots: ['staple'], priceNzd: 9.0, tier: 'everyday', dietary: ['vegetarian', 'pescatarian'], effort: 'none', available: true },
  { sku: 'stp-rice-2kg', name: 'Long grain rice 2kg', category: 'Pantry', slots: ['staple', 'dinner'], priceNzd: 6.8, tier: 'value', dietary: ['vegetarian', 'pescatarian'], effort: 'low', available: true },
  { sku: 'stp-onions', name: 'Onions 1.5kg', category: 'Produce', slots: ['staple'], priceNzd: 3.5, tier: 'value', dietary: ['vegetarian', 'pescatarian'], effort: 'none', available: true },
];

const BY_SKU = new Map(CATALOGUE.map((p) => [p.sku, p]));

export function productBySku(sku: string): CatalogueProduct | undefined {
  return BY_SKU.get(sku);
}

export function productsForSlot(slot: MealSlot): CatalogueProduct[] {
  return CATALOGUE.filter((p) => p.slots.includes(slot));
}

/**
 * Meal ideas assembled from catalogue SKUs. These are the illustrative recipes
 * the plan agent draws on; each declares the dietary tags it carries so the
 * planner can exclude on preference.
 */
export const MEAL_IDEAS: MealIdea[] = [
  {
    id: 'meal-tuna-pasta',
    name: 'Tuna pasta bake',
    slot: 'dinner',
    servesPeople: 5,
    effort: 'low',
    skus: ['din-tuna-pasta', 'din-pasta-1kg', 'lun-cheese-500'],
    dietary: ['pescatarian', 'contains_fish', 'contains_gluten', 'contains_dairy'],
    note: 'One tray, teen-friendly, minimal prep.',
  },
  {
    id: 'meal-fish-rice',
    name: 'Baked white fish with rice & salad',
    slot: 'dinner',
    servesPeople: 6,
    effort: 'medium',
    skus: ['din-white-fish', 'stp-rice-2kg', 'lun-salad-bag'],
    dietary: ['pescatarian', 'contains_fish'],
    note: 'Mild, shared platter style.',
  },
  {
    id: 'meal-veg-stirfry',
    name: 'Vegetable stir-fry with rice',
    slot: 'dinner',
    servesPeople: 6,
    effort: 'low',
    skus: ['din-veg-stirfry', 'stp-rice-2kg', 'stp-oil'],
    dietary: ['vegetarian', 'pescatarian'],
    note: 'Meat-free, quick, not spicy.',
  },
  {
    id: 'meal-diy-pizza',
    name: 'Build-your-own pizzas',
    slot: 'dinner',
    servesPeople: 7,
    effort: 'low',
    skus: ['din-pizza-bases-4', 'din-pasta-sauce', 'lun-cheese-500'],
    dietary: ['vegetarian', 'pescatarian', 'contains_gluten', 'contains_dairy'],
    note: 'Crowd favourite — bases can be unavailable (see resolution).',
  },
  {
    id: 'meal-curry-hot',
    name: 'Hot vegetable curry',
    slot: 'dinner',
    servesPeople: 6,
    effort: 'low',
    skus: ['din-curry-paste-hot', 'din-veg-stirfry', 'stp-rice-2kg'],
    dietary: ['vegetarian', 'pescatarian', 'spicy'],
    note: 'Spicy — excluded when someone avoids spice.',
  },
  {
    id: 'meal-big-breakfast',
    name: 'Weekend big breakfast',
    slot: 'breakfast',
    servesPeople: 7,
    effort: 'low',
    skus: ['brk-eggs-12', 'brk-bread-toast', 'lun-cheese-500'],
    dietary: ['vegetarian', 'pescatarian', 'contains_gluten', 'contains_dairy'],
    note: 'Eggs on toast for a crowd.',
  },
];

export function mealById(id: string): MealIdea | undefined {
  return MEAL_IDEAS.find((m) => m.id === id);
}
