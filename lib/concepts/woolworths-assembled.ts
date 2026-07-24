/**
 * Woolworths concept — "assembled" grocery journey scenario engine
 * ----------------------------------------------------------------
 * The backbone of the private Woolworths / Everyday Rewards concept: a pure,
 * deterministic builder that turns a SCENARIO (the executive's "change one
 * thing" levers) into ONE `JourneyRun` off the shared `lib/journey/` engine.
 *
 * Both representations the brief requires — the customer experience and the
 * inside-the-journey view — read this single run, so they can never drift
 * (brief addition #3, "one shared run ID"). Change a lever and the whole run
 * (plan, basket, budget, approvals, proof) is rebuilt from the same engine —
 * nothing here is a hand-authored mock state.
 *
 * ILLUSTRATIVE only. The catalogue, prices and household are the fictional
 * "everyday, assembled" seed data; nothing is a live Woolworths integration
 * and no order is ever placed (baskets are approval-ready, `simulated`).
 */

import { everydayAssembledJourney } from '@/lib/journey/journeys/everyday-assembled';
import {
  answerContext,
  approveAction,
  completeContext,
  completeWait,
  currentPlan,
  detectExceptions,
  processRecommendation,
  proposeBasket,
  runResolution,
  startJourneyRun,
} from '@/lib/journey/runtime';
import { applyIntentResult } from '@/lib/journey/runtime';
import { summariseJourney } from '@/lib/journey/proof';
import type { GroceryIntent } from '@/lib/journey/services/intent';
import type { PlanResult } from '@/lib/journey/services/plan';
import type { JourneyProofSummary, JourneyRun } from '@/lib/journey/types';

/* ── Scenario (the "change one thing" levers) ──────────────────────────── */

export type Scenario = {
  /** Extra guests Jack brings — added to the base household. */
  extraGuests: number;
  /** Budget ceiling in NZD. */
  budgetNzd: number;
  /** One guest is gluten-free. */
  glutenFree: boolean;
  /** Nights catered for (a cancelled dinner drops this from 3 → 2). */
  nights: number;
};

/** The starting point — the fictional beach-house weekend, before any change. */
export const BASE_SCENARIO: Scenario = {
  extraGuests: 0,
  budgetNzd: 240,
  glutenFree: false,
  nights: 3,
};

export const SCENARIO_LEVERS = {
  guests: { min: 0, max: 4, label: 'Jack brings friends' },
  budget: { min: 150, max: 300, step: 10, label: 'Budget' },
  nights: { min: 2, max: 3, label: 'Nights catered' },
} as const;

const BASE_ADULTS = 2;
const BASE_TEENAGERS = 5;

/** Compose the structured intent for a scenario (bypasses the NL parser so the
 *  levers map exactly onto the plan). */
function intentFor(s: Scenario): GroceryIntent {
  const people = BASE_ADULTS + BASE_TEENAGERS + s.extraGuests;
  const dietaryNeeds = ['pescatarian', ...(s.glutenFree ? ['gluten-free'] : [])];
  return {
    occasion: 'weekend at the beach house',
    people,
    ageGroups: ['adult', 'teenager'],
    durationDays: s.nights,
    mealNeeds: ['easy dinners', 'snacks'],
    dietaryNeeds,
    avoid: ['spicy food'],
    priorities: ['easy preparation', 'teen-friendly'],
    budget: s.budgetNzd,
  };
}

/** A human sentence describing the scenario — shown as the stated intent. */
export function scenarioIntentSentence(s: Scenario): string {
  const guests = s.extraGuests > 0 ? ` Jack is bringing ${s.extraGuests} more, so ${BASE_ADULTS + BASE_TEENAGERS + s.extraGuests} of us in total.` : '';
  const gf = s.glutenFree ? ' One of them is gluten-free.' : '';
  return (
    `Food for the weekend at our beach house — ${BASE_TEENAGERS} teenagers and ${BASE_ADULTS} adults, ` +
    `${s.nights} nights, two are pescatarian, one hates spicy food. Easy dinners and plenty of snacks, ` +
    `around $${s.budgetNzd}.${guests}${gf}`
  );
}

/* ── The one shared run ─────────────────────────────────────────────────── */

export type ScenarioRun = {
  scenario: Scenario;
  run: JourneyRun;
  plan: PlanResult;
  proof: JourneyProofSummary;
  /** The agent-negotiation decision table, derived from the same run. */
  negotiation: NegotiationModel;
};

/** Deterministic, monotonic timestamps so the timeline is stable (no clock). */
function clock(startMs: number) {
  let t = startMs;
  return () => {
    t += 1000;
    return new Date(t).toISOString();
  };
}

/**
 * Build the complete run for a scenario by driving the shared runtime through
 * every stage. Pure and deterministic — same scenario in, same run out.
 */
export function buildScenarioRun(scenario: Scenario): ScenarioRun {
  const tick = clock(Date.UTC(2026, 6, 22, 9, 0, 0));
  const journey = everydayAssembledJourney;
  const sessionId = `wlw-${scenario.extraGuests}-${scenario.budgetNzd}-${scenario.glutenFree ? 'gf' : 'std'}-${scenario.nights}`;

  let run = startJourneyRun({
    journey,
    statedIntent: scenarioIntentSentence(scenario),
    sessionId,
    runId: `run-${sessionId}`,
    now: tick(),
  });

  // Structured intent — injected directly so the levers drive the plan exactly.
  run = applyIntentResult(
    run,
    { intent: intentFor(scenario), confidence: 0.92, uncertainties: [] },
    tick(),
  );

  // Context — the two useful questions answered.
  run = answerContext(run, { budget: scenario.budgetNzd, fulfilment: 'Click-and-collect' }, tick());
  run = completeContext(run, tick());

  // Recommendation → basket proposal → approval → wait → fulfilment.
  run = processRecommendation(run, tick());
  run = proposeBasket(run, tick());
  const basketAction = run.proposedActions.find((a) => a.type === 'assemble_basket' && a.status === 'proposed');
  if (basketAction) run = approveAction(run, basketAction.id, tick());
  run = completeWait(run, tick());

  // Resolution — surface and resolve any live exception (stockout / over budget).
  const exceptions = detectExceptions(run);
  for (const issue of exceptions) {
    const res = runResolution(run, issue, tick());
    run = res.run;
    // Approve the first proposed swap/removal so the basket reassembles honestly.
    const fix = run.proposedActions.find(
      (a) => a.stageId === 'resolution' && a.status === 'proposed',
    );
    if (fix) run = approveAction(run, fix.id, tick());
  }

  const plan = currentPlan(run)!;
  const proof = summariseJourney(run, journey);
  const negotiation = buildNegotiation(scenario, plan);

  return { scenario, run, plan, proof, negotiation };
}

/* ── Agent negotiation (derived from the same run) ─────────────────────── */

export type NegotiationVoice = {
  agent: string;
  role: string;
  position: string;
  figure?: string;
};

export type NegotiationModel = {
  voices: NegotiationVoice[];
  resolution: string;
  finalTotalNzd: number;
  withinBudget: boolean;
  /** Honest treatment — this decision table is modelled, not measured. */
  treatment: 'simulated';
};

/**
 * Derive the specialist-agent negotiation from the plan + budget. Not a
 * separate mock: every figure comes from the same computed plan the customer
 * sees. Presented as a modelled decision table (brief §5).
 */
function buildNegotiation(scenario: Scenario, plan: PlanResult): NegotiationModel {
  const voices: NegotiationVoice[] = [
    {
      agent: 'Basket',
      role: 'Best-fit assembly',
      position: `Assembled ${plan.basket.length} lines that cover the meals and snacks.`,
      figure: `$${plan.estimatedTotalNzd.toFixed(0)}`,
    },
    {
      agent: 'Budget',
      role: 'Keeps the total honest',
      position: plan.withinBudget
        ? `Total sits within the $${scenario.budgetNzd} ceiling.`
        : `Best-fit is $${plan.overBudgetByNzd.toFixed(0)} over the $${scenario.budgetNzd} ceiling.`,
      figure: `$${scenario.budgetNzd}`,
    },
    {
      agent: 'Preference',
      role: 'Protects the hard constraints',
      position: `Keep it pescatarian, no spicy dishes${scenario.glutenFree ? ', gluten-free for one guest' : ''}. Do not drop a shared dinner.`,
    },
  ];

  const swaps = plan.valueOpportunities.slice(0, 2);
  const resolution = plan.withinBudget
    ? swaps.length
      ? `Held every hard constraint; lined up ${swaps.length} value swap${swaps.length > 1 ? 's' : ''} in reserve. Total within budget at $${plan.estimatedTotalNzd.toFixed(0)}.`
      : `Held every hard constraint. Total within budget at $${plan.estimatedTotalNzd.toFixed(0)}.`
    : `Proposed ${swaps.length || 'value'} swap${swaps.length === 1 ? '' : 's'} on premium lines to close the gap, preserving all dietary rules and every dinner.`;

  voices.push({
    agent: 'Resolution',
    role: 'Assembles the final call',
    position: resolution,
    figure: `$${plan.estimatedTotalNzd.toFixed(0)}`,
  });

  return {
    voices,
    resolution,
    finalTotalNzd: plan.estimatedTotalNzd,
    withinBudget: plan.withinBudget,
    treatment: 'simulated',
  };
}
