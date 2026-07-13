import type { Exercise, MealPlanDay, Recipe, StrongProfile } from '@/lib/health/strong/schema';

export const FICTIONAL_STRONG_PROFILE: StrongProfile = {
  id: 'strong-sample-sam',
  displayName: 'Sam',
  sample: true,
  ageBand: '35-44',
  goals: ['build-muscle', 'maintain-weight'],
  experience: 'beginner',
  trainingDays: 3,
  availableMinutes: 35,
  locations: ['home', 'gym', 'pilates'],
  equipment: ['adjustable dumbbells', 'bench', 'long resistance band', 'mat'],
  blockedTags: ['loaded-spinal-flexion'],
  clearanceRequiredTags: ['loaded-hinge'],
  nutritionTargets: { proteinGrams: 100, energyKcal: 1900, source: 'sample-onboarding' },
  dietaryPattern: 'omnivore',
  allergens: [],
};

export const EXERCISES: Exercise[] = [
  {
    id: 'goblet-squat', name: 'Goblet squat', locations: ['home', 'gym'], movement: 'squat',
    equipment: ['dumbbell'], restrictionTags: ['deep-knee-flexion'],
    coachingCue: 'Brace gently, sit between the hips, and stop inside the approved range.',
    progression: 'Add one rep before adding load.', regression: 'Sit-to-stand from a bench.',
  },
  {
    id: 'leg-press', name: 'Supported leg press', locations: ['gym'], movement: 'squat',
    equipment: ['leg press'], restrictionTags: ['deep-knee-flexion'],
    coachingCue: 'Keep the pelvis supported and use the clinician-approved depth.',
    progression: 'Add the smallest plate after all reps feel steady.', regression: 'Shorten the range.',
  },
  {
    id: 'step-up', name: 'Low step-up', locations: ['home', 'gym', 'pilates'], movement: 'squat',
    equipment: ['low step'], restrictionTags: [],
    coachingCue: 'Drive through the whole foot and keep the pelvis level.',
    progression: 'Raise the step slightly or add light load.', regression: 'Use a lower step and support.',
  },
  {
    id: 'incline-push-up', name: 'Incline push-up', locations: ['home', 'gym'], movement: 'push',
    equipment: ['bench'], restrictionTags: [],
    coachingCue: 'Keep ribs stacked and move as one unit.',
    progression: 'Lower the hand position.', regression: 'Use a wall.',
  },
  {
    id: 'chest-press', name: 'Supported chest press', locations: ['gym'], movement: 'push',
    equipment: ['chest press'], restrictionTags: [],
    coachingCue: 'Keep the back supported and finish with soft elbows.',
    progression: 'Add one plate after the top rep range.', regression: 'Reduce the load.',
  },
  {
    id: 'one-arm-row', name: 'Bench-supported one-arm row', locations: ['home', 'gym'], movement: 'pull',
    equipment: ['dumbbell', 'bench'], restrictionTags: [],
    coachingCue: 'Support the torso and draw the elbow towards the back pocket.',
    progression: 'Add reps, then load.', regression: 'Use a resistance band.',
  },
  {
    id: 'seated-row', name: 'Seated cable row', locations: ['gym'], movement: 'pull',
    equipment: ['cable'], restrictionTags: [],
    coachingCue: 'Stay tall and finish without rocking backwards.',
    progression: 'Pause for one second at the finish.', regression: 'Use a lighter pin.',
  },
  {
    id: 'band-pulldown', name: 'Band pulldown', locations: ['home', 'pilates'], movement: 'pull',
    equipment: ['long resistance band'], restrictionTags: ['overhead-load'],
    coachingCue: 'Keep the ribs quiet and pull the elbows towards the sides.',
    progression: 'Use a stronger band.', regression: 'Use a lighter band or seated row.',
  },
  {
    id: 'glute-bridge', name: 'Glute bridge', locations: ['home', 'gym', 'pilates'], movement: 'hinge',
    equipment: ['mat'], restrictionTags: [],
    coachingCue: 'Exhale, brace lightly, and lift from the hips without arching.',
    progression: 'Add a pause or light load.', regression: 'Reduce the range.',
  },
  {
    id: 'romanian-deadlift', name: 'Dumbbell Romanian deadlift', locations: ['home', 'gym'], movement: 'hinge',
    equipment: ['dumbbells'], restrictionTags: ['loaded-hinge'],
    coachingCue: 'Only use a clinician-cleared hinge; keep the load close and range controlled.',
    progression: 'Add load only after technique review.', regression: 'Use a glute bridge.',
  },
  {
    id: 'bird-dog', name: 'Bird dog', locations: ['home', 'gym', 'pilates'], movement: 'core',
    equipment: ['mat'], restrictionTags: [],
    coachingCue: 'Reach long without rotating or arching.',
    progression: 'Add a longer pause.', regression: 'Move one limb at a time.',
  },
  {
    id: 'pallof-press', name: 'Pallof press', locations: ['home', 'gym'], movement: 'core',
    equipment: ['band or cable'], restrictionTags: [],
    coachingCue: 'Stay tall and resist rotation as the hands move away.',
    progression: 'Step farther from the anchor.', regression: 'Use less resistance.',
  },
  {
    id: 'side-lying-leg', name: 'Side-lying leg series', locations: ['pilates', 'home'], movement: 'core',
    equipment: ['mat'], restrictionTags: [],
    coachingCue: 'Keep the trunk still and make the movement small and controlled.',
    progression: 'Add a mini band.', regression: 'Reduce the range.',
  },
  {
    id: 'farmer-carry', name: 'Farmer carry', locations: ['home', 'gym'], movement: 'carry',
    equipment: ['dumbbells'], restrictionTags: [],
    coachingCue: 'Walk tall with quiet ribs and even steps.',
    progression: 'Add five seconds before load.', regression: 'Carry one light weight with support nearby.',
  },
  {
    id: 'breathing-reset', name: 'Breathing and mobility reset', locations: ['home', 'gym', 'pilates'], movement: 'mobility',
    equipment: ['mat'], restrictionTags: [],
    coachingCue: 'Use a comfortable range and finish feeling better than you started.',
    progression: 'Add one slow round.', regression: 'Shorten the session.',
  },
];

export const RECIPES: Recipe[] = [
  {
    id: 'berry-protein-oats', name: 'Berry protein oats', meal: 'breakfast', tags: ['fast', 'high-protein', 'vegetarian'],
    minutes: 8, servings: 1, proteinGrams: 32, energyKcal: 460, fibreGrams: 9, allergens: ['dairy', 'gluten'],
    ingredients: [
      { name: 'rolled oats', quantity: 60, unit: 'g', aisle: 'Pantry' },
      { name: 'Greek yoghurt', quantity: 170, unit: 'g', aisle: 'Dairy & chilled' },
      { name: 'vanilla protein powder', quantity: 25, unit: 'g', aisle: 'Pantry' },
      { name: 'frozen berries', quantity: 100, unit: 'g', aisle: 'Frozen' },
    ],
  },
  {
    id: 'eggs-cottage-toast', name: 'Eggs, cottage cheese and toast', meal: 'breakfast', tags: ['fast', 'high-protein', 'vegetarian'],
    minutes: 10, servings: 1, proteinGrams: 31, energyKcal: 440, fibreGrams: 5, allergens: ['dairy', 'egg', 'gluten'],
    ingredients: [
      { name: 'eggs', quantity: 2, unit: 'ea', aisle: 'Dairy & chilled' },
      { name: 'cottage cheese', quantity: 120, unit: 'g', aisle: 'Dairy & chilled' },
      { name: 'wholegrain bread', quantity: 2, unit: 'slices', aisle: 'Bakery' },
      { name: 'spinach', quantity: 50, unit: 'g', aisle: 'Produce' },
    ],
  },
  {
    id: 'smoothie-bowl', name: 'No-cook smoothie bowl', meal: 'breakfast', tags: ['fast', 'no-cook', 'high-protein', 'vegetarian'],
    minutes: 5, servings: 1, proteinGrams: 29, energyKcal: 410, fibreGrams: 8, allergens: ['dairy'],
    ingredients: [
      { name: 'Greek yoghurt', quantity: 200, unit: 'g', aisle: 'Dairy & chilled' },
      { name: 'banana', quantity: 1, unit: 'ea', aisle: 'Produce' },
      { name: 'vanilla protein powder', quantity: 20, unit: 'g', aisle: 'Pantry' },
      { name: 'frozen berries', quantity: 120, unit: 'g', aisle: 'Frozen' },
    ],
  },
  {
    id: 'chicken-avocado-wrap', name: 'Chicken and avocado wrap', meal: 'lunch', tags: ['fast', 'family', 'high-protein'],
    minutes: 12, servings: 1, proteinGrams: 38, energyKcal: 520, fibreGrams: 9, allergens: ['gluten'],
    ingredients: [
      { name: 'chicken breast', quantity: 150, unit: 'g', aisle: 'Meat & seafood' },
      { name: 'wholegrain wrap', quantity: 1, unit: 'ea', aisle: 'Bakery' },
      { name: 'avocado', quantity: 0.5, unit: 'ea', aisle: 'Produce' },
      { name: 'mixed leaves', quantity: 50, unit: 'g', aisle: 'Produce' },
      { name: 'tomato', quantity: 1, unit: 'ea', aisle: 'Produce' },
    ],
  },
  {
    id: 'tuna-rice-bowl', name: 'Tuna, edamame and rice bowl', meal: 'lunch', tags: ['fast', 'high-protein', 'pescatarian'],
    minutes: 15, servings: 1, proteinGrams: 37, energyKcal: 505, fibreGrams: 8, allergens: ['fish', 'soy'],
    ingredients: [
      { name: 'canned tuna', quantity: 185, unit: 'g', aisle: 'Pantry' },
      { name: 'brown rice', quantity: 90, unit: 'g dry', aisle: 'Pantry' },
      { name: 'frozen edamame', quantity: 100, unit: 'g', aisle: 'Frozen' },
      { name: 'cucumber', quantity: 0.5, unit: 'ea', aisle: 'Produce' },
    ],
  },
  {
    id: 'tofu-crunch-bowl', name: 'Tofu crunch bowl', meal: 'lunch', tags: ['vegetarian', 'family', 'high-protein'],
    minutes: 20, servings: 1, proteinGrams: 30, energyKcal: 510, fibreGrams: 10, allergens: ['soy'],
    ingredients: [
      { name: 'firm tofu', quantity: 200, unit: 'g', aisle: 'Dairy & chilled' },
      { name: 'brown rice', quantity: 80, unit: 'g dry', aisle: 'Pantry' },
      { name: 'carrot', quantity: 1, unit: 'ea', aisle: 'Produce' },
      { name: 'red cabbage', quantity: 120, unit: 'g', aisle: 'Produce' },
    ],
  },
  {
    id: 'yoghurt-fruit', name: 'Greek yoghurt and kiwifruit', meal: 'snack', tags: ['fast', 'no-cook', 'high-protein', 'vegetarian'],
    minutes: 3, servings: 1, proteinGrams: 20, energyKcal: 240, fibreGrams: 4, allergens: ['dairy'],
    ingredients: [
      { name: 'Greek yoghurt', quantity: 200, unit: 'g', aisle: 'Dairy & chilled' },
      { name: 'kiwifruit', quantity: 2, unit: 'ea', aisle: 'Produce' },
    ],
  },
  {
    id: 'cottage-apple', name: 'Cottage cheese and apple', meal: 'snack', tags: ['fast', 'no-cook', 'high-protein', 'vegetarian'],
    minutes: 3, servings: 1, proteinGrams: 22, energyKcal: 250, fibreGrams: 5, allergens: ['dairy'],
    ingredients: [
      { name: 'cottage cheese', quantity: 180, unit: 'g', aisle: 'Dairy & chilled' },
      { name: 'apple', quantity: 1, unit: 'ea', aisle: 'Produce' },
    ],
  },
  {
    id: 'salmon-kumara', name: 'Salmon, roast kūmara and greens', meal: 'dinner', tags: ['family', 'high-protein', 'pescatarian'],
    minutes: 35, servings: 1, proteinGrams: 42, energyKcal: 640, fibreGrams: 10, allergens: ['fish'],
    ingredients: [
      { name: 'salmon fillet', quantity: 180, unit: 'g', aisle: 'Meat & seafood' },
      { name: 'kūmara', quantity: 250, unit: 'g', aisle: 'Produce' },
      { name: 'broccoli', quantity: 180, unit: 'g', aisle: 'Produce' },
      { name: 'olive oil', quantity: 15, unit: 'ml', aisle: 'Pantry' },
    ],
  },
  {
    id: 'beef-tacos', name: 'Lean beef tacos', meal: 'dinner', tags: ['fast', 'family', 'high-protein'],
    minutes: 25, servings: 1, proteinGrams: 40, energyKcal: 620, fibreGrams: 9, allergens: ['gluten'],
    ingredients: [
      { name: 'lean beef mince', quantity: 180, unit: 'g', aisle: 'Meat & seafood' },
      { name: 'wholegrain tortillas', quantity: 3, unit: 'ea', aisle: 'Bakery' },
      { name: 'black beans', quantity: 100, unit: 'g', aisle: 'Pantry' },
      { name: 'tomato', quantity: 1, unit: 'ea', aisle: 'Produce' },
      { name: 'lettuce', quantity: 80, unit: 'g', aisle: 'Produce' },
    ],
  },
  {
    id: 'chicken-tray-bake', name: 'Chicken and winter vegetable tray bake', meal: 'dinner', tags: ['family', 'high-protein'],
    minutes: 40, servings: 1, proteinGrams: 43, energyKcal: 610, fibreGrams: 11, allergens: [],
    ingredients: [
      { name: 'chicken breast', quantity: 180, unit: 'g', aisle: 'Meat & seafood' },
      { name: 'potatoes', quantity: 250, unit: 'g', aisle: 'Produce' },
      { name: 'carrot', quantity: 2, unit: 'ea', aisle: 'Produce' },
      { name: 'broccoli', quantity: 150, unit: 'g', aisle: 'Produce' },
      { name: 'olive oil', quantity: 15, unit: 'ml', aisle: 'Pantry' },
    ],
  },
  {
    id: 'lentil-pasta', name: 'Tomato lentil pasta', meal: 'dinner', tags: ['fast', 'family', 'vegetarian'],
    minutes: 25, servings: 1, proteinGrams: 31, energyKcal: 590, fibreGrams: 15, allergens: ['gluten'],
    ingredients: [
      { name: 'wholegrain pasta', quantity: 100, unit: 'g dry', aisle: 'Pantry' },
      { name: 'canned lentils', quantity: 180, unit: 'g', aisle: 'Pantry' },
      { name: 'tomato passata', quantity: 200, unit: 'ml', aisle: 'Pantry' },
      { name: 'spinach', quantity: 80, unit: 'g', aisle: 'Produce' },
    ],
  },
];

export const WEEK_MEAL_PLAN: MealPlanDay[] = [
  { day: 'Monday', recipeIds: ['berry-protein-oats', 'chicken-avocado-wrap', 'yoghurt-fruit', 'beef-tacos'] },
  { day: 'Tuesday', recipeIds: ['eggs-cottage-toast', 'tuna-rice-bowl', 'cottage-apple', 'salmon-kumara'] },
  { day: 'Wednesday', recipeIds: ['smoothie-bowl', 'tofu-crunch-bowl', 'yoghurt-fruit', 'chicken-tray-bake'] },
  { day: 'Thursday', recipeIds: ['berry-protein-oats', 'chicken-avocado-wrap', 'cottage-apple', 'lentil-pasta'] },
  { day: 'Friday', recipeIds: ['eggs-cottage-toast', 'tuna-rice-bowl', 'yoghurt-fruit', 'beef-tacos'] },
  { day: 'Saturday', recipeIds: ['smoothie-bowl', 'tofu-crunch-bowl', 'cottage-apple', 'salmon-kumara'] },
  { day: 'Sunday', recipeIds: ['berry-protein-oats', 'chicken-avocado-wrap', 'yoghurt-fruit', 'chicken-tray-bake'] },
];

export const STRONG_AGENTS = [
  { id: 'plan', name: 'Plan', job: 'Builds the 12-week progression from approved inputs.', status: 'wired' },
  { id: 'move', name: 'Move', job: 'Swaps gym, home and Pilates sessions without losing the weekly intent.', status: 'wired' },
  { id: 'fuel', name: 'Fuel', job: 'Selects structured recipes against the entered targets and dietary rules.', status: 'wired' },
  { id: 'shop', name: 'Shop', job: 'Consolidates ingredients and prepares retailer handoffs.', status: 'wired' },
  { id: 'swap', name: 'Swap', job: 'Replaces meals by speed, protein, family fit or dietary pattern.', status: 'wired' },
  { id: 'recover', name: 'Recover', job: 'Uses the approved recovery rules to choose a lower-load option.', status: 'preview' },
  { id: 'check', name: 'Check', job: 'Applies deterministic restriction and allergen gates before display.', status: 'wired' },
  { id: 'progress', name: 'Progress', job: 'Prepares the weekly review and proposes the next progression.', status: 'preview' },
] as const;
