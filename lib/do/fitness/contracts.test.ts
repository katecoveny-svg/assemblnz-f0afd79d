import { describe, expect, it } from 'vitest';
import { EXERCISES, FICTIONAL_STRONG_PROFILE, RECIPES, WEEK_MEAL_PLAN } from '@/lib/health/strong/catalogue';
import { buildSession, findMealSwap, isExerciseCompatible, mealPlanIssues } from '@/lib/health/strong/engine';
import { FitnessRequestSchema, fitnessOffice, prepareFitness, prepareFoodHandoff, recipeToShopMeal, shopUnit, type FitnessRequest } from './contracts';
import { ManualMedicationRecordSchema } from './manual-record';

const request: FitnessRequest = { version: 1, scope: 'fitness-synthetic-session', from: 'chief-do', to: 'fitness-do', revision: 1, input: { sample: true, adult: true, reviewed: true, goal: 'build-muscle', location: 'home', equipment: ['mat', 'bench', 'adjustable dumbbells'], minutes: 20, days: 3, dietaryPattern: 'omnivore', allergens: [], foodRequirement: 'none' } };
function review() { const result = prepareFitness(request); return { scope: request.scope, revision: 1, resultDigest: result.digest, recipeIds: ['salmon-kumara'], servings: 2, reviewed: true }; }

describe('Strong donor safety', () => {
  it('checks location and all equipment, including fallback movements', () => {
    for (const location of ['home', 'gym', 'pilates'] as const) {
      for (const equipment of [[], ['mat'], ['bench'], ['adjustable dumbbells'], ['cable']]) {
        const profile = { ...FICTIONAL_STRONG_PROFILE, equipment, blockedTags: ['loaded-hinge' as const, 'deep-knee-flexion' as const] };
        const session = buildSession(profile, location);
        expect(session.exercises.every(item => isExerciseCompatible(item.exercise, profile, location))).toBe(true);
        expect(new Set(session.exercises.map(item => item.exercise.id)).size).toBe(session.exercises.length);
        expect(session.exercises.some(item => item.exercise.restrictionTags.some(tag => profile.blockedTags.includes(tag as 'loaded-hinge')))).toBe(false);
      }
    }
    expect(buildSession({ ...FICTIONAL_STRONG_PROFILE, locations: ['home'] }, 'gym').exercises).toEqual([]);
    expect(isExerciseCompatible(EXERCISES.find(item => item.id === 'one-arm-row')!, { equipment: ['dumbbell'], locations: ['home'] }, 'home')).toBe(false);
  });
  it('does not return an unsafe original when no meal swap is possible', () => {
    expect(findMealSwap('yoghurt-fruit', 'faster', { ...FICTIONAL_STRONG_PROFILE, allergens: ['dairy'] })).toBeNull();
    expect(mealPlanIssues(WEEK_MEAL_PLAN, { ...FICTIONAL_STRONG_PROFILE, allergens: ['dairy'] }).length).toBeGreaterThan(7);
  });
});

describe('chief → Fitness → Shop sample boundary', () => {
  it('rejects unreviewed, nonadult, account, medication and extra inputs', () => {
    for (const patch of [{ reviewed: false }, { adult: false }, { medication: 'synthetic' }, { minutes: 500 }, { sample: false }]) {
      expect(FitnessRequestSchema.safeParse({ ...request, input: { ...request.input, ...patch } }).success).toBe(false);
    }
    expect(FitnessRequestSchema.safeParse({ ...request, ownerId: 'forged' }).success).toBe(false);
    expect(FitnessRequestSchema.safeParse({ ...request, scope: 'real-account' }).success).toBe(false);
  });
  it('withholds review-required movement and all food for unverified medical or allergy constraints', () => {
    const result = prepareFitness(request);
    expect(result.session.exercises.some(item => item.clearance === 'clinician-review')).toBe(false);
    for (const input of [{ ...request.input, allergens: ['fish'] }, { ...request.input, foodRequirement: 'allergy-or-medical' }, { ...request.input, foodRequirement: 'other-unsupported' }]) {
      expect(prepareFitness({ ...request, input }).meals).toEqual([]);
    }
    expect(JSON.stringify(result)).not.toContain('nutritionTargets');
  });
  it('uses Shop consolidation and allows only food fields across the handoff', () => {
    const handoff = prepareFoodHandoff(request, review());
    expect(handoff.requirements.find(item => item.name === 'salmon fillet')?.required).toBe(360);
    expect(Object.keys(handoff).sort()).toEqual(['version', 'scope', 'from', 'to', 'revision', 'meals', 'choices', 'requirements', 'foodConstraints', 'status'].sort());
    for (const field of ['goal', 'session', 'programme', 'medication', 'nutritionTargets', 'activity']) expect(handoff).not.toHaveProperty(field);
    expect(() => prepareFoodHandoff(request, { ...review(), medication: 'synthetic' })).toThrow();
  });
  it('invalidates stale food review and rejects injected or duplicate recipes', () => {
    expect(() => prepareFoodHandoff({ ...request, revision: 2 }, review())).toThrow(/changed/);
    expect(() => prepareFoodHandoff({ ...request, input: { ...request.input, dietaryPattern: 'vegetarian' } }, review())).toThrow(/changed/);
    expect(() => prepareFoodHandoff(request, { ...review(), recipeIds: ['eggs-cottage-toast'] })).toThrow(/Only meals/);
    expect(() => prepareFoodHandoff(request, { ...review(), recipeIds: ['salmon-kumara', 'salmon-kumara'] })).toThrow();
    expect(() => prepareFoodHandoff(request, { ...review(), reviewed: false })).toThrow();
  });
  it('reports unsupported units without assuming a conversion', () => {
    expect(shopUnit('ea')).toBe('each'); expect(shopUnit('g dry')).toBeNull(); expect(shopUnit('slices')).toBeNull();
    expect(recipeToShopMeal(RECIPES.find(recipe => recipe.id === 'lentil-pasta')!).meal).toBeNull();
    const vegetarian = { ...request, input: { ...request.input, dietaryPattern: 'vegetarian' } };
    const result = prepareFitness(vegetarian);
    expect(() => prepareFoodHandoff(vegetarian, { ...review(), resultDigest: result.digest, recipeIds: ['lentil-pasta'] })).toThrow(/unsupported unit/);
  });
  it('projects portable AgentSpecs through Office without claiming autonomous work', () => {
    const office = fitnessOffice('2026-10-14T00:00:00Z', prepareFitness(request), null);
    expect(office.members).toHaveLength(3);
    expect(office.members.every(member => member.identity.agentId && member.identity.emailState === 'none')).toBe(true);
    expect(office.inbox[0].toIdentityId).toBe('agent:chief-do');
  });
});

it('stages an exact manual record and rejects dosing automation or extra advice fields', () => {
  const record = { sample: true, source: 'user-entered', reviewed: true, medicineLabel: 'Fictional medicine', recordedAt: '2026-10-14T00:00:00Z', amountAsEntered: '0.50', unitAsEntered: 'mg', action: 'record-only' };
  expect(ManualMedicationRecordSchema.parse(record).amountAsEntered).toBe('0.50');
  for (const patch of [{ action: 'increase-dose' }, { nextDose: '1' }, { amountAsEntered: '-1' }, { source: 'inferred' }, { recordedAt: 'yesterday' }]) expect(ManualMedicationRecordSchema.safeParse({ ...record, ...patch }).success).toBe(false);
});
