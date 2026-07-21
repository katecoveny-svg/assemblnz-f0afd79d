import { describe, expect, it } from 'vitest';

import { everydayAssembledJourney, SEED_HOUSEHOLD, EVERYDAY_ASSEMBLED_ID } from './journeys/everyday-assembled';
import { GROCERY_TENANT, GROCERY_RULES } from './genome/grocery-genome';
import {
  parseGroceryIntent,
  mockIntentService,
  liveIntentService,
  GroceryIntentSchema,
  type GroceryIntent,
} from './services/intent';
import { nextContextQuestions, deriveKnownContextKeys } from './services/context';
import { assemblePlan, dietaryExclusions, type BasketItem } from './services/plan';
import { resolveUnavailableItems, resolveBudget } from './services/resolution';
import { productBySku } from './catalogue';
import {
  startJourneyRun,
  processIntent,
  answerContext,
  completeContext,
  processRecommendation,
  proposeBasket,
  approveAction,
  rejectAction,
  detectExceptions,
  runResolution,
  decideAuthority,
  currentPlan,
} from './runtime';
import { summariseJourney } from './proof';
import { InMemoryJourneyRepository, JourneyAccessError } from './repository';
import { getJourneyGenomeContext } from './genome-context';
import { STATUS_META } from './status';

const NOW = '2026-07-21T10:00:00.000Z';

function seedIntent(): GroceryIntent {
  return parseGroceryIntent(SEED_HOUSEHOLD.statedIntent).intent;
}

describe('1. natural-language intent maps to structured intent', () => {
  it('extracts people, diet, avoidances, meals and duration', () => {
    const { intent, confidence } = parseGroceryIntent(SEED_HOUSEHOLD.statedIntent);
    expect(intent.ageGroups).toContain('teenager');
    expect(intent.people).toBe(5);
    expect(intent.dietaryNeeds).toContain('pescatarian');
    expect(intent.avoid).toContain('spicy food');
    expect(intent.mealNeeds).toEqual(expect.arrayContaining(['easy dinners', 'snacks']));
    expect(intent.durationDays).toBe(3);
    expect(confidence).toBeGreaterThan(0.6);
    // Output validates against the schema.
    expect(GroceryIntentSchema.safeParse(intent).success).toBe(true);
  });
});

describe('2. missing context is detected', () => {
  it('asks for budget and fulfilment when the intent omits them', () => {
    const intent = seedIntent();
    const questions = nextContextQuestions({
      intent,
      fields: everydayAssembledJourney.customerContextFields,
      answeredKeys: [],
      maxQuestions: GROCERY_RULES.maxQuestionsPerStep,
    });
    const keys = questions.map((q) => q.key);
    expect(keys).toContain('budget');
    expect(questions.length).toBeLessThanOrEqual(GROCERY_RULES.maxQuestionsPerStep);
  });
});

describe('3. unnecessary questions are not asked', () => {
  it('never asks about budget once it is known', () => {
    const intent = { ...seedIntent(), budget: 250 };
    expect(deriveKnownContextKeys(intent)).toContain('budget');
    const questions = nextContextQuestions({
      intent,
      fields: everydayAssembledJourney.customerContextFields,
      answeredKeys: [],
      maxQuestions: 999,
    });
    expect(questions.map((q) => q.key)).not.toContain('budget');
    // Also not re-asked once answered explicitly.
    const answered = nextContextQuestions({
      intent: seedIntent(),
      fields: everydayAssembledJourney.customerContextFields,
      answeredKeys: ['budget', 'fulfilment'],
      maxQuestions: 999,
    });
    expect(answered.map((q) => q.key)).not.toContain('fulfilment');
  });
});

describe('4. basket respects dietary exclusions', () => {
  it('excludes spicy meals for someone who avoids spice and never includes meat for pescatarians', () => {
    const intent = seedIntent();
    const excl = dietaryExclusions(intent);
    expect(excl.has('spicy')).toBe(true);
    expect(excl.has('contains_meat')).toBe(true);

    const plan = assemblePlan(intent);
    for (const meal of plan.meals) {
      expect(meal.dietary).not.toContain('spicy');
    }
    for (const item of plan.basket) {
      const product = productBySku(item.sku)!;
      expect(product.dietary).not.toContain('spicy');
      expect(product.dietary).not.toContain('contains_meat');
    }
    expect(plan.excludedForDiet.join(' ')).toMatch(/curry|spic/i);
  });
});

describe('5. basket flags budget excess', () => {
  it('marks a basket over a low budget as not within budget', () => {
    const plan = assemblePlan(seedIntent(), 10);
    expect(plan.budgetCeilingNzd).toBe(10);
    expect(plan.withinBudget).toBe(false);
    expect(plan.overBudgetByNzd).toBeGreaterThan(0);
  });

  it('keeps a generous budget within budget', () => {
    const plan = assemblePlan(seedIntent(), 500);
    expect(plan.withinBudget).toBe(true);
  });
});

describe('6. unavailable item triggers resolution', () => {
  it('proposes an available substitute for an out-of-stock item', () => {
    const pizza = productBySku('din-pizza-bases-4')!;
    expect(pizza.available).toBe(false);
    const basket: BasketItem[] = [
      {
        sku: pizza.sku,
        name: pizza.name,
        quantity: 2,
        unitPriceNzd: pizza.priceNzd,
        lineTotalNzd: pizza.priceNzd * 2,
        tier: pizza.tier,
        category: pizza.category,
        forMeals: ['meal-diy-pizza'],
        available: false,
      },
    ];
    const outcome = resolveUnavailableItems(basket, dietaryExclusions(seedIntent()));
    expect(outcome.issue).toBe('unavailable_item');
    expect(outcome.resolvable).toBe(true);
    expect(outcome.requiresApproval).toBe(true);
    const swap = outcome.proposals.find((p) => p.kind === 'swap');
    expect(swap?.toSku).toBe('din-pizza-bases-frozen');
  });

  it('the reference plan naturally includes an out-of-stock item', () => {
    const plan = assemblePlan(seedIntent(), 300);
    expect(plan.basket.some((i) => !i.available)).toBe(true);
  });

  it('resolves a budget-exceeded plan or escalates honestly', () => {
    const plan = assemblePlan(seedIntent(), 20);
    const outcome = resolveBudget(plan);
    expect(outcome.issue).toBe('budget_exceeded');
    expect(outcome.proposals.length).toBeGreaterThan(0);
  });
});

describe('7. consequential actions require approval', () => {
  it('gates assemble_basket behind human approval, but not a summary', () => {
    expect(decideAuthority('assemble_basket').needsApproval).toBe(true);
    expect(decideAuthority('assemble_basket').authorityRequired).toBe('act_with_approval');
    expect(decideAuthority('summarise_plan').needsApproval).toBe(false);

    let run = startJourneyRun({ journey: everydayAssembledJourney, statedIntent: SEED_HOUSEHOLD.statedIntent, sessionId: 's7', now: NOW });
    run = proposeBasketAfterFlow(run);
    expect(run.status).toBe('approval_required');
    const action = run.proposedActions.at(-1)!;
    expect(action.authorityRequired).toBe('act_with_approval');
    expect(action.status).toBe('proposed');
  });
});

describe('8. rejected action does not execute', () => {
  it('leaves nothing completed when the customer rejects', () => {
    let run = startJourneyRun({ journey: everydayAssembledJourney, statedIntent: SEED_HOUSEHOLD.statedIntent, sessionId: 's8', now: NOW });
    run = proposeBasketAfterFlow(run);
    const action = run.proposedActions.at(-1)!;
    run = rejectAction(run, action.id, NOW);
    const rejected = run.proposedActions.find((a) => a.id === action.id)!;
    expect(rejected.status).toBe('rejected');
    expect(run.timeline.some((e) => e.type === 'action_completed')).toBe(false);
    expect(run.timeline.some((e) => e.type === 'approval_rejected')).toBe(true);
  });
});

describe('9. proof summary reflects journey events', () => {
  it('counts stages, actions, approvals and surfaces assumptions', async () => {
    let run = startJourneyRun({ journey: everydayAssembledJourney, statedIntent: SEED_HOUSEHOLD.statedIntent, sessionId: 's9', now: NOW });
    run = await processIntent(run, mockIntentService, NOW);
    run = answerContext(run, { budget: 300, fulfilment: 'Delivery' }, NOW);
    run = completeContext(run, NOW);
    run = processRecommendation(run, NOW);
    run = proposeBasket(run, NOW);
    const action = run.proposedActions.at(-1)!;
    run = approveAction(run, action.id, NOW);

    const proof = summariseJourney(run, everydayAssembledJourney);
    expect(proof.runId).toBe(run.id);
    expect(proof.proposedActionCount).toBeGreaterThanOrEqual(1);
    expect(proof.approvedActionCount).toBe(1);
    expect(proof.contextQuestionsAsked).toBe(2);
    expect(proof.stageCompletionRate).toBeGreaterThan(0);
    expect(proof.assumptionsSurfaced.length).toBeGreaterThan(0);
    expect(proof.estimatedOnly).toBe(true);
    expect(proof.policyChecksFailed).toBe(0);
  });
});

describe('10. tenant isolation', () => {
  it('one tenant cannot access another tenant’s journey', async () => {
    const repo = new InMemoryJourneyRepository();
    const owned = await repo.getJourney(GROCERY_TENANT, EVERYDAY_ASSEMBLED_ID);
    expect(owned?.id).toBe(EVERYDAY_ASSEMBLED_ID);
    await expect(repo.getJourney('some-other-tenant', EVERYDAY_ASSEMBLED_ID)).rejects.toBeInstanceOf(JourneyAccessError);
  });

  it('cannot save a run under a mismatched tenant', async () => {
    const repo = new InMemoryJourneyRepository();
    const run = startJourneyRun({ journey: everydayAssembledJourney, statedIntent: 'x', sessionId: 's10', now: NOW });
    await expect(repo.saveRun({ ...run, tenantId: 'attacker' })).rejects.toBeInstanceOf(JourneyAccessError);
  });
});

describe('11. model / mock service returning invalid data fails safe', () => {
  it('falls back to an explicitly-uncertain intent rather than throwing', async () => {
    const badService = liveIntentService(async () => ({ not: 'a valid intent' }));
    const result = await badService.parse('anything');
    expect(result.confidence).toBe(0);
    expect(result.uncertainties.length).toBeGreaterThan(0);
    expect(GroceryIntentSchema.safeParse(result.intent).success).toBe(true);
  });

  it('the mock service always returns schema-valid output', async () => {
    const result = await mockIntentService.parse(SEED_HOUSEHOLD.statedIntent);
    expect(GroceryIntentSchema.safeParse(result.intent).success).toBe(true);
  });
});

describe('12. simulated and real statuses are never confused', () => {
  it('a prepared basket is simulated, never completed', () => {
    let run = startJourneyRun({ journey: everydayAssembledJourney, statedIntent: SEED_HOUSEHOLD.statedIntent, sessionId: 's12', now: NOW });
    run = proposeBasketAfterFlow(run);
    const action = run.proposedActions.at(-1)!;
    expect(action.execution).toBe('simulated');
    expect(action.execution).not.toBe('completed');
  });

  it('status vocabulary keeps simulated and completed distinct', () => {
    expect(STATUS_META.simulated.label).not.toBe(STATUS_META.completed.label);
    expect(STATUS_META.simulated.tone).toBe('caution');
    expect(STATUS_META.completed.tone).toBe('positive');
  });
});

describe('genome context is stage-scoped', () => {
  it('returns only the facts a stage needs, not the whole genome', async () => {
    const ctx = await getJourneyGenomeContext({
      tenantId: GROCERY_TENANT,
      journeyId: EVERYDAY_ASSEMBLED_ID,
      stageId: 'recommendation',
      stageType: 'recommendation',
    });
    expect(ctx.facts.length).toBeGreaterThan(0);
    expect(ctx.facts.length).toBeLessThan(6);
    expect(ctx.recommendationRules.length).toBeGreaterThan(0);
    // An entry stage should not receive the dietary knowledge fact.
    const entry = await getJourneyGenomeContext({
      tenantId: GROCERY_TENANT,
      journeyId: EVERYDAY_ASSEMBLED_ID,
      stageId: 'entry',
      stageType: 'entry',
    });
    expect(entry.facts.some((f) => f.id === 'grc-knowledge-dietary')).toBe(false);
  });
});

describe('end-to-end exception loop', () => {
  it('detects a budget exception and produces resolution proposals', async () => {
    let run = startJourneyRun({ journey: everydayAssembledJourney, statedIntent: SEED_HOUSEHOLD.statedIntent, sessionId: 'e2e', now: NOW });
    run = await processIntent(run, mockIntentService, NOW);
    run = answerContext(run, { budget: 25 }, NOW);
    run = completeContext(run, NOW);
    run = processRecommendation(run, NOW);
    const plan = currentPlan(run)!;
    expect(plan.withinBudget).toBe(false);
    const exceptions = detectExceptions(run);
    expect(exceptions).toContain('budget_exceeded');
    const { run: resolved, outcome } = runResolution(run, 'budget_exceeded', NOW);
    expect(outcome.proposals.length).toBeGreaterThan(0);
    expect(['approval_required', 'escalated']).toContain(resolved.status);
  });
});

describe('approved resolution genuinely clears the exception', () => {
  it('swapping the out-of-stock item removes it from the basket and unresolved list', async () => {
    let run = startJourneyRun({ journey: everydayAssembledJourney, statedIntent: SEED_HOUSEHOLD.statedIntent, sessionId: 'res', now: NOW });
    run = await processIntent(run, mockIntentService, NOW);
    run = answerContext(run, { budget: 300 }, NOW);
    run = completeContext(run, NOW);
    run = processRecommendation(run, NOW);
    expect(detectExceptions(run)).toContain('unavailable_item');
    const { run: r2 } = runResolution(run, 'unavailable_item', NOW);
    const swap = r2.proposedActions.find((a) => a.type === 'apply_substitution')!;
    const r3 = approveAction(r2, swap.id, NOW);
    expect(detectExceptions(r3)).not.toContain('unavailable_item');
    expect(currentPlan(r3)!.basket.every((i) => i.available)).toBe(true);
    const proof = summariseJourney(r3, everydayAssembledJourney);
    expect(proof.unresolvedIssues.join(' ')).not.toMatch(/unavailable/i);
  });
});

/** Drive a fresh run through to the basket proposal (sync helper for tests). */
function proposeBasketAfterFlow(run: ReturnType<typeof startJourneyRun>) {
  // Synchronous path: parse intent inline so the helper stays non-async.
  const parsed = parseGroceryIntent(run.statedIntent).intent;
  let r = { ...run, structuredIntent: parsed as unknown as Record<string, unknown>, currentStageId: 'context' as string };
  r = answerContext(r, { budget: 300 }, NOW);
  r = completeContext(r, NOW);
  r = processRecommendation(r, NOW);
  r = proposeBasket(r, NOW);
  return r;
}
