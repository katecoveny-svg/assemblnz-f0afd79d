import { describe, expect, it } from 'vitest';
import { FICTIONAL_STRONG_PROFILE, WEEK_MEAL_PLAN } from '@/lib/health/strong/catalogue';
import {
  buildSession,
  buildSessionCalendarFile,
  buildShoppingListText,
  buildTwelveWeekProgramme,
  compileShoppingList,
  findMealSwap,
  retailerHandoffUrl,
  totalDayNutrition,
} from '@/lib/health/strong/engine';

describe('Strong programme engine', () => {
  it('builds twelve progressive weeks with recovery checkpoints', () => {
    const programme = buildTwelveWeekProgramme(3);
    expect(programme).toHaveLength(12);
    expect(programme[3]).toMatchObject({ week: 4, phase: 'consolidate' });
    expect(programme[7]).toMatchObject({ week: 8, phase: 'recover' });
    expect(programme[11]).toMatchObject({ week: 12, phase: 'assess' });
  });

  it('replaces a restricted loaded hinge with a clear regression', () => {
    const profile = { ...FICTIONAL_STRONG_PROFILE, blockedTags: [...FICTIONAL_STRONG_PROFILE.blockedTags, 'loaded-hinge' as const] };
    const session = buildSession(profile, 'home', 35);
    expect(session.exercises.map((item) => item.exercise.id)).not.toContain('romanian-deadlift');
    expect(session.exercises.map((item) => item.exercise.id)).toContain('glute-bridge');
  });

  it('marks a clearance-required movement instead of declaring it safe', () => {
    const session = buildSession(FICTIONAL_STRONG_PROFILE, 'home', 35);
    const hinge = session.exercises.find((item) => item.exercise.id === 'romanian-deadlift');
    expect(hinge?.clearance).toBe('clinician-review');
  });

  it('exports the selected session duration to a tentative calendar event', () => {
    const session = buildSession(FICTIONAL_STRONG_PROFILE, 'home', 20);
    const calendar = buildSessionCalendarFile(session, '20260713');
    expect(calendar).toContain('DTSTART:20260713T073000');
    expect(calendar).toContain('DTEND:20260713T075000');
    expect(calendar).toContain('STATUS:TENTATIVE');
  });
});

describe('Strong meal and shopping engine', () => {
  it('calculates daily totals from stored recipes', () => {
    expect(totalDayNutrition(WEEK_MEAL_PLAN[0])).toEqual({ proteinGrams: 130, energyKcal: 1840, fibreGrams: 31 });
  });

  it('finds a deterministic vegetarian dinner swap', () => {
    expect(findMealSwap('beef-tacos', 'vegetarian', FICTIONAL_STRONG_PROFILE).id).toBe('lentil-pasta');
  });

  it('consolidates duplicate ingredients and produces a reviewable list', () => {
    const items = compileShoppingList(WEEK_MEAL_PLAN.slice(0, 2));
    const yoghurt = items.find((item) => item.name === 'Greek yoghurt');
    expect(yoghurt?.quantity).toBe(370);
    expect(buildShoppingListText(items)).toMatch(/Review quantities, allergens/i);
  });

  it('uses current retailer handoff routes without claiming cart access', () => {
    expect(retailerHandoffUrl('woolworths', 'Greek yoghurt')).toContain('woolworths.co.nz/shop/searchproducts?search=Greek%20yoghurt');
    expect(retailerHandoffUrl('woolworths')).toBe('https://www.woolworths.co.nz/shop');
    expect(retailerHandoffUrl('new-world', 'Greek yoghurt')).toBe('https://www.newworld.co.nz/shop');
  });
});
