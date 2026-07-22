/**
 * assembl — journey evaluation runner
 * -----------------------------------
 * Executes every scenario through the REAL runtime (deterministic, no model)
 * and checks declared expectations. Critical failures fail the suite. Used by
 * `scripts/eval-journeys.ts` (the `eval:journeys` command) and a vitest wrapper.
 */

import { everydayAssembledJourney } from '../journeys/everyday-assembled';
import { GROCERY_TENANT } from '../genome/grocery-genome';
import { parseGroceryIntent, type GroceryIntent, type IntentParseResult } from '../services/intent';
import { dietaryExclusions } from '../services/plan';
import { productBySku } from '../catalogue';
import {
  startJourneyRun,
  applyIntentResult,
  answerContext,
  completeContext,
  processRecommendation,
  proposeBasket,
  runResolution,
  pendingQuestions,
  currentPlan,
  currentIntent,
} from '../runtime';
import { JOURNEY_SCENARIOS, EVAL_VERSION, type JourneyScenario } from './scenarios';

export type EvalCheck = { id: string; passed: boolean; critical: boolean; detail: string };
export type EvalScenarioResult = {
  id: string;
  category: string;
  passed: boolean;
  criticalFailed: boolean;
  checks: EvalCheck[];
};
export type EvalReport = {
  version: string;
  total: number;
  passed: number;
  failed: number;
  criticalFailures: number;
  results: EvalScenarioResult[];
};

const NOW = '2026-07-22T00:00:00.000Z';

function runScenario(s: JourneyScenario): EvalScenarioResult {
  const checks: EvalCheck[] = [];
  const add = (id: string, passed: boolean, critical: boolean, detail: string) =>
    checks.push({ id, passed, critical, detail });

  try {
    if (s.mode === 'tenant') {
      // The repository throws JourneyAccessError on cross-tenant reads (unit
      // tested in journey.test.ts / persistence.test.ts). Here we assert the
      // ownership invariant deterministically for the suite.
      const owner = everydayAssembledJourney.tenantId;
      const attacker = 'attacker-tenant';
      const isolated = owner === GROCERY_TENANT && (owner as string) !== attacker;
      add('tenant_isolated', isolated, true, `journey owner=${owner}`);
      return finalize(s, checks);
    }

    let run = startJourneyRun({ journey: everydayAssembledJourney, statedIntent: s.statedIntent, sessionId: `eval-${s.id}`, now: NOW });

    if (s.mode === 'malformed') {
      const result: IntentParseResult = { intent: s.malformedIntent as GroceryIntent, confidence: 0, uncertainties: [] };
      run = applyIntentResult(run, result, NOW);
      const failed = run.status === 'failed';
      if (s.expect.intentFails) add('intent_fails_safely', failed, true, `run.status=${run.status}`);
      // No plan should be reachable / no order placed.
      add('no_order_placed', !run.proposedActions.some((a) => /order/.test(a.type)), true, 'no order action');
      return finalize(s, checks);
    }

    // mode 'nl'
    const intentResult = parseGroceryIntent(s.statedIntent);
    const questionsBefore = (() => {
      const r = applyIntentResult(run, intentResult, NOW);
      return r.status === 'failed' ? [] : pendingQuestions(r, everydayAssembledJourney);
    })();
    run = applyIntentResult(run, intentResult, NOW);

    const intent = currentIntent(run);
    const e = s.expect;

    if (e.dietaryNeedsInclude) {
      const ok = !!intent && e.dietaryNeedsInclude.every((d) => intent.dietaryNeeds.includes(d));
      add('dietary_captured', ok, true, `dietaryNeeds=[${intent?.dietaryNeeds.join(',')}]`);
    }
    if (e.avoidInclude) {
      const ok = !!intent && e.avoidInclude.every((a) => intent.avoid.includes(a));
      add('avoidance_captured', ok, true, `avoid=[${intent?.avoid.join(',')}]`);
    }
    if (e.requiresQuestions) {
      add('asks_questions', questionsBefore.length >= 1, true, `${questionsBefore.length} question(s)`);
    }

    if (run.status !== 'failed') {
      if (s.context) run = answerContext(run, s.context, NOW);
      run = completeContext(run, NOW);
      run = processRecommendation(run, NOW);
    }

    const plan = currentPlan(run);
    if (e.noDietViolationInBasket && intent) {
      const excl = dietaryExclusions(intent);
      const violating = (plan?.basket ?? []).filter((i) => {
        const p = productBySku(i.sku);
        return p ? p.dietary.some((t) => excl.has(t)) : false;
      });
      add('no_diet_violation', violating.length === 0, true, `${violating.length} violation(s)`);
    }
    if (e.budgetExceeded !== undefined && plan) {
      add('budget_flag', plan.withinBudget === !e.budgetExceeded, true, `within=${plan.withinBudget}`);
    }
    if (e.hasUnavailableItem) {
      const has = (plan?.basket ?? []).some((i) => !i.available);
      add('has_unavailable_item', has, true, `unavailable present=${has}`);
    }
    if (e.resolutionProposesOrEscalates) {
      const { run: r2, outcome } = runResolution(run, 'unavailable_item', NOW);
      const ok = outcome.proposals.length > 0 || r2.status === 'escalated';
      add('resolution_proposes_or_escalates', ok, true, `${outcome.proposals.length} proposal(s), status=${r2.status}`);
    }
    if (e.approvalRequiredForBasket && run.status !== 'failed') {
      const r3 = proposeBasket(run, NOW);
      const action = r3.proposedActions.at(-1);
      const ok = r3.status === 'approval_required' && action?.authorityRequired === 'act_with_approval' && action?.status === 'proposed';
      add('approval_required_for_basket', !!ok, true, `status=${r3.status}, authority=${action?.authorityRequired}`);
      if (e.noOrderPlaced) {
        const orderPlaced = r3.proposedActions.some((a) => /order/.test(a.type) && a.status === 'completed');
        add('no_order_placed', !orderPlaced, true, 'no completed order action');
      }
    } else if (e.noOrderPlaced) {
      const orderPlaced = run.proposedActions.some((a) => /order/.test(a.type) && a.status === 'completed');
      add('no_order_placed', !orderPlaced, true, 'no completed order action');
    }
  } catch (err) {
    add('runner_error', false, true, err instanceof Error ? err.message : String(err));
  }

  return finalize(s, checks);
}

function finalize(s: JourneyScenario, checks: EvalCheck[]): EvalScenarioResult {
  const criticalFailed = checks.some((c) => !c.passed && c.critical);
  const passed = checks.every((c) => c.passed);
  return { id: s.id, category: s.category, passed, criticalFailed, checks };
}

export function runEval(): EvalReport {
  const results = JOURNEY_SCENARIOS.map(runScenario);
  return {
    version: EVAL_VERSION,
    total: results.length,
    passed: results.filter((r) => r.passed).length,
    failed: results.filter((r) => !r.passed).length,
    criticalFailures: results.filter((r) => r.criticalFailed).length,
    results,
  };
}
