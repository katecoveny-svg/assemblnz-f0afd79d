import { z } from 'zod';

export const TrainingLocationSchema = z.enum(['home', 'gym', 'pilates']);
export type TrainingLocation = z.infer<typeof TrainingLocationSchema>;

export const RestrictionTagSchema = z.enum([
  'loaded-hinge',
  'loaded-spinal-flexion',
  'impact',
  'overhead-load',
  'deep-knee-flexion',
]);
export type RestrictionTag = z.infer<typeof RestrictionTagSchema>;

export const ProfileSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  sample: z.literal(true),
  ageBand: z.enum(['18-24', '25-34', '35-44', '45-54', '55-64', '65+']),
  goals: z.array(z.enum(['build-muscle', 'maintain-weight', 'healthy-ageing', 'mobility'])).min(1),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  trainingDays: z.number().int().min(2).max(5),
  availableMinutes: z.number().int().min(15).max(75),
  locations: z.array(TrainingLocationSchema).min(1),
  equipment: z.array(z.string().min(1)),
  blockedTags: z.array(RestrictionTagSchema),
  clearanceRequiredTags: z.array(RestrictionTagSchema),
  nutritionTargets: z.object({
    proteinGrams: z.number().positive(),
    energyKcal: z.number().positive(),
    source: z.literal('sample-onboarding'),
  }),
  dietaryPattern: z.enum(['omnivore', 'vegetarian', 'pescatarian']),
  allergens: z.array(z.enum(['dairy', 'egg', 'fish', 'gluten', 'nuts', 'soy'])),
});
export type StrongProfile = z.infer<typeof ProfileSchema>;

export const ExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  locations: z.array(TrainingLocationSchema).min(1),
  movement: z.enum(['squat', 'push', 'pull', 'hinge', 'carry', 'core', 'mobility']),
  equipment: z.array(z.string().min(1)),
  restrictionTags: z.array(RestrictionTagSchema),
  coachingCue: z.string().min(1),
  progression: z.string().min(1),
  regression: z.string().min(1),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

export const IngredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive(),
  unit: z.string().min(1),
  aisle: z.enum(['Produce', 'Bakery', 'Meat & seafood', 'Dairy & chilled', 'Pantry', 'Frozen']),
});
export type Ingredient = z.infer<typeof IngredientSchema>;

export const RecipeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  meal: z.enum(['breakfast', 'lunch', 'snack', 'dinner']),
  tags: z.array(z.enum(['fast', 'family', 'high-protein', 'vegetarian', 'pescatarian', 'no-cook'])),
  minutes: z.number().int().positive(),
  servings: z.number().int().positive(),
  proteinGrams: z.number().positive(),
  energyKcal: z.number().positive(),
  fibreGrams: z.number().nonnegative(),
  allergens: z.array(z.enum(['dairy', 'egg', 'fish', 'gluten', 'nuts', 'soy'])),
  ingredients: z.array(IngredientSchema).min(1),
});
export type Recipe = z.infer<typeof RecipeSchema>;

export type ExercisePrescription = {
  exercise: Exercise;
  sets: number;
  reps: string;
  restSeconds: number;
  clearance: 'clear' | 'clinician-review';
};

export type SessionPlan = {
  id: string;
  title: string;
  location: TrainingLocation;
  minutes: number;
  intent: string;
  exercises: ExercisePrescription[];
  safetyNote: string;
};

export type ProgrammeWeek = {
  week: number;
  phase: 'foundation' | 'consolidate' | 'build' | 'recover' | 'progress' | 'assess';
  focus: string;
  sessions: number;
  sets: number;
  repRange: string;
};

export type MealPlanDay = {
  day: string;
  recipeIds: [string, string, string, string];
};

export type ShoppingItem = Ingredient & {
  recipeCount: number;
};
