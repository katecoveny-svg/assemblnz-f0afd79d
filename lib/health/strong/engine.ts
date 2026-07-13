import { EXERCISES, RECIPES } from '@/lib/health/strong/catalogue';
import type {
  Exercise,
  ExercisePrescription,
  MealPlanDay,
  ProgrammeWeek,
  Recipe,
  SessionPlan,
  ShoppingItem,
  StrongProfile,
  TrainingLocation,
} from '@/lib/health/strong/schema';

const EXERCISE_BY_ID = new Map(EXERCISES.map((exercise) => [exercise.id, exercise]));
const RECIPE_BY_ID = new Map(RECIPES.map((recipe) => [recipe.id, recipe]));

const LOCATION_EXERCISES: Record<TrainingLocation, string[]> = {
  home: ['goblet-squat', 'incline-push-up', 'one-arm-row', 'romanian-deadlift', 'band-pulldown', 'bird-dog', 'farmer-carry'],
  gym: ['leg-press', 'chest-press', 'seated-row', 'romanian-deadlift', 'pallof-press', 'farmer-carry'],
  pilates: ['step-up', 'glute-bridge', 'band-pulldown', 'side-lying-leg', 'bird-dog', 'breathing-reset'],
};

const FALLBACK_EXERCISE: Partial<Record<Exercise['movement'], string>> = {
  squat: 'step-up',
  push: 'incline-push-up',
  pull: 'one-arm-row',
  hinge: 'glute-bridge',
  core: 'bird-dog',
  mobility: 'breathing-reset',
};

function getExercise(id: string): Exercise {
  const exercise = EXERCISE_BY_ID.get(id);
  if (!exercise) throw new Error(`Unknown exercise: ${id}`);
  return exercise;
}

function prescribeExercise(exercise: Exercise, profile: StrongProfile, sets: number): ExercisePrescription | null {
  const blocked = exercise.restrictionTags.some((tag) => profile.blockedTags.includes(tag));
  if (blocked) return null;
  const needsReview = exercise.restrictionTags.some((tag) => profile.clearanceRequiredTags.includes(tag));
  return {
    exercise,
    sets,
    reps: exercise.movement === 'carry' ? '30–40 sec' : exercise.movement === 'mobility' ? '5 slow breaths' : '8–12',
    restSeconds: exercise.movement === 'core' || exercise.movement === 'mobility' ? 30 : 75,
    clearance: needsReview ? 'clinician-review' : 'clear',
  };
}

export function buildSession(profile: StrongProfile, location: TrainingLocation, minutes = profile.availableMinutes): SessionPlan {
  const sets = minutes <= 20 ? 2 : 3;
  const maximumExercises = minutes <= 20 ? 4 : minutes <= 35 ? 6 : 7;
  const prescriptions: ExercisePrescription[] = [];

  for (const id of LOCATION_EXERCISES[location]) {
    const exercise = getExercise(id);
    const prescription = prescribeExercise(exercise, profile, sets);
    if (prescription) {
      prescriptions.push(prescription);
    } else {
      const fallbackId = FALLBACK_EXERCISE[exercise.movement];
      if (fallbackId && !prescriptions.some((item) => item.exercise.id === fallbackId)) {
        const fallback = prescribeExercise(getExercise(fallbackId), profile, sets);
        if (fallback) prescriptions.push(fallback);
      }
    }
    if (prescriptions.length >= maximumExercises) break;
  }

  return {
    id: `strong-${location}-${minutes}`,
    title: location === 'pilates' ? 'Pilates movement and recovery' : `Full-body strength · ${location}`,
    location,
    minutes,
    intent: location === 'pilates'
      ? 'Supports movement quality and recovery alongside two weekly strength sessions.'
      : 'Progress the main movement patterns with stable, repeatable technique.',
    exercises: prescriptions,
    safetyNote: 'Uses the sample profile’s entered restrictions. It does not decide medical safety or replace clinical clearance.',
  };
}

export function buildTwelveWeekProgramme(trainingDays: number): ProgrammeWeek[] {
  return Array.from({ length: 12 }, (_, index) => {
    const week = index + 1;
    if (week <= 3) return { week, phase: 'foundation', focus: 'Technique and repeatable routines', sessions: trainingDays, sets: 2 + (week > 1 ? 1 : 0), repRange: '8–12' };
    if (week === 4) return { week, phase: 'consolidate', focus: 'Lower volume and technique review', sessions: Math.max(2, trainingDays - 1), sets: 2, repRange: '8–10' };
    if (week <= 7) return { week, phase: 'build', focus: 'Progress reps, then the smallest load', sessions: trainingDays, sets: 3, repRange: week === 7 ? '6–10' : '8–12' };
    if (week === 8) return { week, phase: 'recover', focus: 'Recovery week and movement check', sessions: 2, sets: 2, repRange: '8 easy' };
    if (week <= 11) return { week, phase: 'progress', focus: 'Strength and muscle-building progression', sessions: trainingDays, sets: week === 11 ? 4 : 3, repRange: '6–10' };
    return { week, phase: 'assess', focus: 'Technique, strength markers and next programme', sessions: 2, sets: 2, repRange: 'quality reps' };
  });
}

export function recipesForDay(day: MealPlanDay): Recipe[] {
  return day.recipeIds.map((id) => {
    const recipe = RECIPE_BY_ID.get(id);
    if (!recipe) throw new Error(`Unknown recipe: ${id}`);
    return recipe;
  });
}

export function totalDayNutrition(day: MealPlanDay) {
  return recipesForDay(day).reduce(
    (total, recipe) => ({
      proteinGrams: total.proteinGrams + recipe.proteinGrams,
      energyKcal: total.energyKcal + recipe.energyKcal,
      fibreGrams: total.fibreGrams + recipe.fibreGrams,
    }),
    { proteinGrams: 0, energyKcal: 0, fibreGrams: 0 },
  );
}

export type SwapMode = 'faster' | 'higher-protein' | 'vegetarian' | 'family';

export function findMealSwap(currentRecipeId: string, mode: SwapMode, profile: StrongProfile): Recipe {
  const current = RECIPE_BY_ID.get(currentRecipeId);
  if (!current) throw new Error(`Unknown recipe: ${currentRecipeId}`);
  const candidates = RECIPES.filter((recipe) => {
    if (recipe.id === current.id || recipe.meal !== current.meal) return false;
    if (recipe.allergens.some((allergen) => profile.allergens.includes(allergen))) return false;
    if (profile.dietaryPattern === 'vegetarian' && !recipe.tags.includes('vegetarian')) return false;
    if (profile.dietaryPattern === 'pescatarian' && !recipe.tags.includes('vegetarian') && !recipe.tags.includes('pescatarian')) return false;
    if (mode === 'faster') return recipe.minutes < current.minutes;
    if (mode === 'higher-protein') return recipe.proteinGrams > current.proteinGrams;
    if (mode === 'vegetarian') return recipe.tags.includes('vegetarian');
    return recipe.tags.includes('family');
  });
  return candidates.sort((a, b) => b.proteinGrams - a.proteinGrams || a.minutes - b.minutes)[0] ?? current;
}

export function replaceMeal(day: MealPlanDay, currentRecipeId: string, replacementId: string): MealPlanDay {
  return {
    ...day,
    recipeIds: day.recipeIds.map((id) => (id === currentRecipeId ? replacementId : id)) as MealPlanDay['recipeIds'],
  };
}

export function compileShoppingList(days: MealPlanDay[]): ShoppingItem[] {
  const compiled = new Map<string, ShoppingItem>();
  for (const day of days) {
    for (const recipe of recipesForDay(day)) {
      for (const ingredient of recipe.ingredients) {
        const key = `${ingredient.aisle}|${ingredient.name.toLowerCase()}|${ingredient.unit}`;
        const existing = compiled.get(key);
        compiled.set(key, existing
          ? { ...existing, quantity: Number((existing.quantity + ingredient.quantity).toFixed(2)), recipeCount: existing.recipeCount + 1 }
          : { ...ingredient, recipeCount: 1 });
      }
    }
  }
  return [...compiled.values()].sort((a, b) => a.aisle.localeCompare(b.aisle) || a.name.localeCompare(b.name));
}

export type Retailer = 'woolworths' | 'new-world';

export function retailerHandoffUrl(retailer: Retailer, itemName?: string): string {
  if (retailer === 'woolworths') {
    return itemName
      ? `https://www.woolworths.co.nz/shop/searchproducts?search=${encodeURIComponent(itemName)}`
      : 'https://www.woolworths.co.nz/shop';
  }
  return 'https://www.newworld.co.nz/shop';
}

export function buildShoppingListText(items: ShoppingItem[]): string {
  let currentAisle = '';
  const lines: string[] = ['Strong sample shopping list', ''];
  for (const item of items) {
    if (item.aisle !== currentAisle) {
      currentAisle = item.aisle;
      lines.push(currentAisle);
    }
    lines.push(`- ${item.name}: ${item.quantity} ${item.unit}`);
  }
  lines.push('', 'Review quantities, allergens, availability and prices in the retailer app before buying.');
  return lines.join('\n');
}

export function buildSessionCalendarFile(
  session: SessionPlan,
  date = new Intl.DateTimeFormat('en-CA').format(new Date()).replaceAll('-', ''),
): string {
  const startMinutes = 7 * 60 + 30;
  const endMinutes = startMinutes + session.minutes;
  const endTime = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}${String(endMinutes % 60).padStart(2, '0')}00`;
  const description = `${session.intent}\\n${session.exercises.map((item) => `${item.exercise.name}: ${item.sets} x ${item.reps}`).join('\\n')}`;
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//assembl//Strong sample//EN',
    'BEGIN:VEVENT', `UID:${session.id}-${date}@assembl.co.nz`, `DTSTART:${date}T073000`, `DTEND:${date}T${endTime}`,
    `SUMMARY:${session.title}`, `DESCRIPTION:${description}`, 'STATUS:TENTATIVE', 'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}
