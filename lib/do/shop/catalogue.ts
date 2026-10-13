import type { Meal, Unit } from './preparation';

/** Everyday New Zealand dinners with explicit sample quantities. Our own recipe notes,
 * not dietary advice: quantities are per `baseServings` and scale by servings. Indicative
 * prices are rough NZD guides for budgeting only, never live retailer prices. */
export type Aisle = 'produce' | 'meat & seafood' | 'dairy & eggs' | 'bakery' | 'pantry' | 'frozen' | 'chilled';
export type CatalogueIngredient = { id: string; name: string; unit: Unit; aisle: Aisle; aliases: string[]; indicativeMinorPer: { amount: number; unit: Unit; priceMinor: number }; allergens: string[] };
export type CatalogueMeal = Meal & { tags: ('vegetarian' | 'quick' | 'family' | 'budget')[] };

export const INGREDIENTS: CatalogueIngredient[] = [
  { id: 'beef-mince', name: 'Beef mince', unit: 'g', aisle: 'meat & seafood', aliases: ['mince', 'beef mince', 'ground beef'], indicativeMinorPer: { amount: 500, unit: 'g', priceMinor: 1200 }, allergens: [] },
  { id: 'chicken-thigh', name: 'Chicken thighs', unit: 'g', aisle: 'meat & seafood', aliases: ['chicken', 'chicken thighs', 'chicken thigh'], indicativeMinorPer: { amount: 500, unit: 'g', priceMinor: 1100 }, allergens: [] },
  { id: 'hoki', name: 'Hoki fillets', unit: 'g', aisle: 'frozen', aliases: ['hoki', 'fish', 'fish fillets'], indicativeMinorPer: { amount: 500, unit: 'g', priceMinor: 1300 }, allergens: ['fish'] },
  { id: 'sausages', name: 'Sausages', unit: 'each', aisle: 'meat & seafood', aliases: ['sausages', 'sausage', 'snags'], indicativeMinorPer: { amount: 8, unit: 'each', priceMinor: 900 }, allergens: ['gluten'] },
  { id: 'pasta', name: 'Dried pasta', unit: 'g', aisle: 'pantry', aliases: ['pasta', 'spaghetti', 'penne'], indicativeMinorPer: { amount: 500, unit: 'g', priceMinor: 250 }, allergens: ['gluten'] },
  { id: 'rice', name: 'Rice', unit: 'g', aisle: 'pantry', aliases: ['rice', 'jasmine rice', 'basmati'], indicativeMinorPer: { amount: 1000, unit: 'g', priceMinor: 400 }, allergens: [] },
  { id: 'chickpeas', name: 'Chickpeas (canned, drained)', unit: 'g', aisle: 'pantry', aliases: ['chickpeas', 'chick peas'], indicativeMinorPer: { amount: 240, unit: 'g', priceMinor: 180 }, allergens: [] },
  { id: 'tomatoes-canned', name: 'Canned tomatoes', unit: 'g', aisle: 'pantry', aliases: ['canned tomatoes', 'tinned tomatoes', 'tomatoes'], indicativeMinorPer: { amount: 400, unit: 'g', priceMinor: 150 }, allergens: [] },
  { id: 'coconut-milk', name: 'Coconut milk', unit: 'ml', aisle: 'pantry', aliases: ['coconut milk', 'coconut cream'], indicativeMinorPer: { amount: 400, unit: 'ml', priceMinor: 250 }, allergens: [] },
  { id: 'curry-paste', name: 'Curry paste', unit: 'g', aisle: 'pantry', aliases: ['curry paste', 'curry'], indicativeMinorPer: { amount: 200, unit: 'g', priceMinor: 450 }, allergens: [] },
  { id: 'stir-fry-sauce', name: 'Stir-fry sauce', unit: 'ml', aisle: 'pantry', aliases: ['stir fry sauce', 'stir-fry sauce', 'soy sauce'], indicativeMinorPer: { amount: 250, unit: 'ml', priceMinor: 400 }, allergens: ['soy', 'gluten'] },
  { id: 'taco-kit', name: 'Nacho / taco seasoning', unit: 'g', aisle: 'pantry', aliases: ['taco seasoning', 'nacho seasoning', 'taco kit'], indicativeMinorPer: { amount: 35, unit: 'g', priceMinor: 250 }, allergens: [] },
  { id: 'corn-chips', name: 'Corn chips', unit: 'g', aisle: 'pantry', aliases: ['corn chips', 'nacho chips'], indicativeMinorPer: { amount: 300, unit: 'g', priceMinor: 400 }, allergens: [] },
  { id: 'bread', name: 'Bread (loaf)', unit: 'each', aisle: 'bakery', aliases: ['bread', 'loaf', 'toast'], indicativeMinorPer: { amount: 1, unit: 'each', priceMinor: 350 }, allergens: ['gluten'] },
  { id: 'cheese', name: 'Tasty cheese', unit: 'g', aisle: 'dairy & eggs', aliases: ['cheese', 'tasty cheese', 'cheddar'], indicativeMinorPer: { amount: 500, unit: 'g', priceMinor: 1100 }, allergens: ['milk'] },
  { id: 'milk', name: 'Milk', unit: 'ml', aisle: 'dairy & eggs', aliases: ['milk'], indicativeMinorPer: { amount: 2000, unit: 'ml', priceMinor: 450 }, allergens: ['milk'] },
  { id: 'butter', name: 'Butter', unit: 'g', aisle: 'dairy & eggs', aliases: ['butter'], indicativeMinorPer: { amount: 500, unit: 'g', priceMinor: 800 }, allergens: ['milk'] },
  { id: 'eggs', name: 'Eggs', unit: 'each', aisle: 'dairy & eggs', aliases: ['egg', 'eggs'], indicativeMinorPer: { amount: 12, unit: 'each', priceMinor: 1100 }, allergens: ['egg'] },
  { id: 'sour-cream', name: 'Sour cream', unit: 'ml', aisle: 'chilled', aliases: ['sour cream'], indicativeMinorPer: { amount: 250, unit: 'ml', priceMinor: 350 }, allergens: ['milk'] },
  { id: 'potatoes', name: 'Potatoes', unit: 'g', aisle: 'produce', aliases: ['potatoes', 'potato', 'spuds'], indicativeMinorPer: { amount: 2000, unit: 'g', priceMinor: 600 }, allergens: [] },
  { id: 'kumara', name: 'Kūmara', unit: 'g', aisle: 'produce', aliases: ['kumara', 'kūmara', 'sweet potato'], indicativeMinorPer: { amount: 1000, unit: 'g', priceMinor: 700 }, allergens: [] },
  { id: 'pumpkin', name: 'Pumpkin', unit: 'g', aisle: 'produce', aliases: ['pumpkin'], indicativeMinorPer: { amount: 1000, unit: 'g', priceMinor: 400 }, allergens: [] },
  { id: 'onions', name: 'Onions', unit: 'each', aisle: 'produce', aliases: ['onion', 'onions'], indicativeMinorPer: { amount: 5, unit: 'each', priceMinor: 350 }, allergens: [] },
  { id: 'garlic', name: 'Garlic', unit: 'each', aisle: 'produce', aliases: ['garlic'], indicativeMinorPer: { amount: 3, unit: 'each', priceMinor: 300 }, allergens: [] },
  { id: 'carrots', name: 'Carrots', unit: 'g', aisle: 'produce', aliases: ['carrot', 'carrots'], indicativeMinorPer: { amount: 1000, unit: 'g', priceMinor: 300 }, allergens: [] },
  { id: 'broccoli', name: 'Broccoli', unit: 'each', aisle: 'produce', aliases: ['broccoli'], indicativeMinorPer: { amount: 1, unit: 'each', priceMinor: 350 }, allergens: [] },
  { id: 'capsicum', name: 'Capsicum', unit: 'each', aisle: 'produce', aliases: ['capsicum', 'capsicums', 'pepper', 'bell pepper'], indicativeMinorPer: { amount: 1, unit: 'each', priceMinor: 250 }, allergens: [] },
  { id: 'aubergine', name: 'Aubergine', unit: 'each', aisle: 'produce', aliases: ['aubergine', 'aubergines', 'eggplant'], indicativeMinorPer: { amount: 1, unit: 'each', priceMinor: 400 }, allergens: [] },
  { id: 'lettuce', name: 'Lettuce', unit: 'each', aisle: 'produce', aliases: ['lettuce'], indicativeMinorPer: { amount: 1, unit: 'each', priceMinor: 350 }, allergens: [] },
  { id: 'tomatoes-fresh', name: 'Fresh tomatoes', unit: 'g', aisle: 'produce', aliases: ['fresh tomatoes', 'tomato'], indicativeMinorPer: { amount: 500, unit: 'g', priceMinor: 500 }, allergens: [] },
  { id: 'frozen-peas', name: 'Frozen peas', unit: 'g', aisle: 'frozen', aliases: ['peas', 'frozen peas'], indicativeMinorPer: { amount: 1000, unit: 'g', priceMinor: 400 }, allergens: [] },
  { id: 'frozen-veg', name: 'Frozen mixed vegetables', unit: 'g', aisle: 'frozen', aliases: ['frozen veg', 'frozen vegetables', 'mixed veg'], indicativeMinorPer: { amount: 1000, unit: 'g', priceMinor: 450 }, allergens: [] },
];
const g = (id: string, amount: number) => ({ id, name: INGREDIENTS.find(i => i.id === id)!.name, quantity: { amount, unit: INGREDIENTS.find(i => i.id === id)!.unit } });

export const MEALS: CatalogueMeal[] = [
  { id: 'mince-pasta', name: 'Mince and veg pasta', baseServings: 4, tags: ['family', 'budget'], ingredients: [g('beef-mince', 500), g('pasta', 400), g('tomatoes-canned', 800), g('onions', 1), g('garlic', 1), g('carrots', 200), g('cheese', 100)] },
  { id: 'chicken-stir-fry', name: 'Chicken stir-fry with rice', baseServings: 4, tags: ['quick', 'family'], ingredients: [g('chicken-thigh', 600), g('rice', 300), g('stir-fry-sauce', 120), g('broccoli', 1), g('capsicum', 1), g('carrots', 200), g('garlic', 1)] },
  { id: 'hoki-kumara', name: 'Hoki with kūmara wedges and peas', baseServings: 4, tags: ['family'], ingredients: [g('hoki', 600), g('kumara', 1000), g('frozen-peas', 400), g('butter', 40)] },
  { id: 'chickpea-curry', name: 'Chickpea and vegetable curry with rice', baseServings: 4, tags: ['vegetarian', 'budget'], ingredients: [g('chickpeas', 480), g('coconut-milk', 400), g('curry-paste', 60), g('rice', 300), g('onions', 1), g('frozen-veg', 500), g('tomatoes-canned', 400)] },
  { id: 'sausages-mash', name: 'Sausages, mash and peas', baseServings: 4, tags: ['quick', 'budget', 'family'], ingredients: [g('sausages', 8), g('potatoes', 1000), g('frozen-peas', 400), g('milk', 100), g('butter', 40), g('onions', 1)] },
  { id: 'pumpkin-soup', name: 'Pumpkin soup with bread', baseServings: 4, tags: ['vegetarian', 'budget'], ingredients: [g('pumpkin', 1200), g('onions', 1), g('garlic', 1), g('milk', 200), g('bread', 1), g('butter', 30)] },
  { id: 'beef-nachos', name: 'Beef nachos', baseServings: 4, tags: ['quick', 'family'], ingredients: [g('beef-mince', 500), g('taco-kit', 35), g('corn-chips', 300), g('cheese', 150), g('sour-cream', 125), g('lettuce', 1), g('tomatoes-fresh', 250)] },
  { id: 'aubergine-pasta', name: 'Tomato and aubergine pasta', baseServings: 4, tags: ['vegetarian', 'quick'], ingredients: [g('aubergine', 2), g('pasta', 400), g('tomatoes-canned', 800), g('garlic', 1), g('onions', 1), g('cheese', 80)] },
];

export function ingredientById(id: string): CatalogueIngredient | undefined { return INGREDIENTS.find(i => i.id === id); }
export function ingredientByName(name: string): CatalogueIngredient | undefined {
  const key = name.trim().toLowerCase().replace(/\s+/g, ' ');
  return INGREDIENTS.find(i => i.name.toLowerCase() === key || i.aliases.includes(key));
}
export const AISLE_ORDER: Aisle[] = ['produce', 'meat & seafood', 'chilled', 'dairy & eggs', 'bakery', 'pantry', 'frozen'];
