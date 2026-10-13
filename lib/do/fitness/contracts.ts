import { z } from 'zod';
import type { AgentSpec } from '@/apps/do/shared/types';
import { officeSnapshotFromAgents, type DoOfficeMessage } from '@/apps/do/shared/office';
import { fingerprint } from '@/lib/do/preparation/contracts';
import { consolidate, type Meal, type Unit } from '@/lib/do/shop/preparation';
import { FICTIONAL_STRONG_PROFILE, RECIPES } from '@/lib/health/strong/catalogue';
import { buildSession, buildTwelveWeekProgramme, recipeMatchesProfile, mealPlanIssues } from '@/lib/health/strong/engine';
import { ProfileSchema, TrainingLocationSchema, type Recipe } from '@/lib/health/strong/schema';

export const EQUIPMENT = ['mat', 'bench', 'adjustable dumbbells', 'long resistance band', 'low step', 'leg press', 'chest press', 'cable'] as const;
export const FitnessInputSchema = z.object({
  sample: z.literal(true), adult: z.literal(true),
  goal: z.enum(['build-muscle', 'mobility', 'healthy-ageing']),
  location: TrainingLocationSchema,
  equipment: z.array(z.enum(EQUIPMENT)).max(EQUIPMENT.length),
  minutes: z.union([z.literal(15), z.literal(20), z.literal(35)]),
  days: z.number().int().min(2).max(5),
  dietaryPattern: ProfileSchema.shape.dietaryPattern,
  allergens: ProfileSchema.shape.allergens.max(6),
  foodRequirement: z.enum(['none', 'allergy-or-medical', 'other-unsupported']),
  reviewed: z.literal(true),
}).strict();
export type FitnessInput = z.infer<typeof FitnessInputSchema>;
const ScopeSchema = z.literal('fitness-synthetic-session');
export const FitnessRequestSchema = z.object({
  version: z.literal(1), scope: ScopeSchema, from: z.literal('chief-do'), to: z.literal('fitness-do'),
  revision: z.number().int().positive(), input: FitnessInputSchema,
}).strict();
export type FitnessRequest = z.infer<typeof FitnessRequestSchema>;

export function prepareFitness(raw: unknown) {
  const request = FitnessRequestSchema.parse(raw);
  const input = request.input;
  // The donor profile is fictional. Nutrition targets are neither used nor exposed by this slice.
  const profile = { ...FICTIONAL_STRONG_PROFILE, goals: [input.goal], locations: [input.location], equipment: input.equipment, availableMinutes: input.minutes, trainingDays: input.days, dietaryPattern: input.dietaryPattern, allergens: input.allergens };
  const candidateSession = buildSession(profile, input.location);
  // No clinical clearance is created from an empty form; movements awaiting review are withheld.
  const session = { ...candidateSession, exercises: candidateSession.exercises.filter(item => item.clearance !== 'clinician-review' && (input.goal !== 'mobility' || ['core', 'mobility'].includes(item.exercise.movement))) };
  const foodBlocked = input.foodRequirement !== 'none' || input.allergens.length > 0;
  const meals = foodBlocked ? [] : RECIPES.filter(recipe => recipe.meal === 'dinner' && recipe.minutes <= 35 && recipeMatchesProfile(recipe, profile)).slice(0, 2);
  const blockers = [
    ...(!session.exercises.length ? ['No compatible movement in this sample catalogue. Review equipment or location.'] : []),
    ...(foodBlocked ? ['Meal suggestions withheld: this sample catalogue cannot verify allergy, medical or unsupported food requirements.'] : []),
    ...(!foodBlocked && !meals.length ? ['No sample dinner matches the reviewed food choices.'] : []),
  ];
  return { version: 1 as const, scope: request.scope, from: 'fitness-do' as const, to: 'chief-do' as const, revision: request.revision, digest: fingerprint(request), session, programme: buildTwelveWeekProgramme(input.days).slice(0, 4), meals, blockers };
}
export type FitnessResult = ReturnType<typeof prepareFitness>;

/** No unit casts or inferred mass/volume conversions. "g dry" and slices need a reviewed recipe definition. */
export function shopUnit(unit: string): Unit | null {
  switch (unit) {
    case 'g': case 'kg': case 'ml': case 'l': case 'each': return unit;
    case 'ea': return 'each';
    default: return null;
  }
}
export function recipeToShopMeal(recipe: Recipe): { meal: Meal | null; issues: string[] } {
  const ingredients: Meal['ingredients'] = [];
  const issues: string[] = [];
  for (const ingredient of recipe.ingredients) {
    const unit = shopUnit(ingredient.unit);
    if (!unit) { issues.push(`${ingredient.name}: unsupported unit “${ingredient.unit}”; review the recipe quantity before Shop.`); continue; }
    ingredients.push({ id: `strong:${ingredient.name.toLowerCase()}`, name: ingredient.name, quantity: { amount: ingredient.quantity, unit } });
  }
  return { meal: issues.length ? null : { id: recipe.id, name: recipe.name, baseServings: recipe.servings, ingredients }, issues };
}

export const FoodReviewSchema = z.object({
  scope: ScopeSchema, revision: z.number().int().positive(), resultDigest: z.string().min(1).max(4000),
  recipeIds: z.array(z.string().min(1).max(80)).min(1).max(2).refine(ids => new Set(ids).size === ids.length),
  servings: z.number().int().min(1).max(4), reviewed: z.literal(true),
}).strict();

/** Rebuild from the reviewed request; a caller cannot inject a meal or health fields into Shop. */
export function prepareFoodHandoff(rawRequest: unknown, rawReview: unknown) {
  const request = FitnessRequestSchema.parse(rawRequest), review = FoodReviewSchema.parse(rawReview);
  const result = prepareFitness(request);
  if (review.scope !== request.scope || review.revision !== request.revision || review.resultDigest !== result.digest) throw new Error('The draft changed. Review the food choices again.');
  const selected = review.recipeIds.map(id => result.meals.find(meal => meal.id === id));
  if (selected.some(meal => !meal)) throw new Error('Only meals in the current reviewed draft can go to Shop.');
  const meals: Meal[] = [];
  for (const recipe of selected) {
    if (!recipe) throw new Error('Unknown recipe');
    // Recheck every selected meal, including any future swap path, at the boundary.
    const issues = mealPlanIssues([{ day: 'Reviewed food', recipeIds: [recipe.id, recipe.id, recipe.id, recipe.id] }], request.input);
    const conversion = recipeToShopMeal(recipe);
    if (issues.length || conversion.issues.length || !conversion.meal) throw new Error([...issues, ...conversion.issues].join(' '));
    meals.push(conversion.meal);
  }
  const choices = meals.map(meal => ({ mealId: meal.id, servings: review.servings, occurrences: 1 }));
  return { version: 1 as const, scope: review.scope, from: 'fitness-do' as const, to: 'shop-do' as const, revision: review.revision,
    meals, choices, requirements: consolidate(choices, meals, []),
    foodConstraints: { dietaryPattern: request.input.dietaryPattern, excludedAllergens: [...request.input.allergens] },
    status: 'ingredients-for-review' as const,
  };
}
export type FoodHandoff = ReturnType<typeof prepareFoodHandoff>;

/** Existing portable AgentSpec and Office projections, never saved to the global store. */
export function fitnessOffice(now: string, result: FitnessResult | null, food: FoodHandoff | null) {
  const specs: AgentSpec[] = ['chief-do', 'fitness-do', 'shop-do'].map((id, index) => ({
    id, name: ['DO', 'Fitness', 'Shop'][index], primitive: 'prepare', demo: true,
    watches: [], looks_for: [], can_do_without_asking: [],
    must_ask_before: ['Prepare from reviewed inputs', 'Hand reviewed food choices to Shop'],
    never: ['Store health records', 'Infer medical clearance', 'Connect providers', 'Buy or send'],
    brief: ['Coordinate this sample task', 'Prepare movement and sample dinners', 'Review only approved food quantities'][index],
    status: 'needs_you', createdAt: now, updatedAt: now, pendingApprovals: [],
    lastNote: index === 1 && result ? 'Sample draft prepared' : index === 2 && food ? 'Ingredients received for review' : 'Waiting for review',
  }));
  const office = officeSnapshotFromAgents(specs, { workspaceId: 'fitness-synthetic-session', workspaceName: 'DO Fitness sample' });
  const messages: DoOfficeMessage[] = [];
  if (result) messages.push({ id: `fitness:${result.revision}`, workspaceId: office.workspaces[0].id, fromIdentityId: 'agent:fitness-do', toIdentityId: 'agent:chief-do', kind: 'update', summary: 'Reviewed sample inputs produced a draft; no external action.', createdAt: now });
  if (food) messages.push({ id: `food:${food.revision}`, workspaceId: office.workspaces[0].id, fromIdentityId: 'agent:fitness-do', toIdentityId: 'agent:shop-do', kind: 'handoff', summary: 'Only reviewed food choices and quantities received.', createdAt: now });
  return { ...office, inbox: messages };
}
