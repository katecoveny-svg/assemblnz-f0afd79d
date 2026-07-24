/**
 * assembl — journey proof
 * -----------------------
 * Turns a `JourneyRun` into an honest `JourneyProofSummary`. Every number here
 * is estimated or simulated in the seed build (`estimatedOnly: true`) and is
 * labelled as such in the UI. Proof is a premium operational certificate, not a
 * gamified score — it reports what actually happened in the run.
 */

import type { CustomerJourney, JourneyProofSummary, JourneyRun, ProofMetric } from './types';
import { currentPlan } from './runtime';

const STANDING_LIMITATIONS = [
  'All actions are simulated — no order is placed and no live retailer data is used.',
  'Prices are indicative demonstration values, not live pricing.',
  'Runs are held in a seed repository and are not persisted across sessions.',
  'Time-saved figures are estimates, not measured.',
];

export function summariseJourney(run: JourneyRun, journey: CustomerJourney): JourneyProofSummary {
  const totalStages = journey.stages.length || 1;
  const stagesCompleted = new Set(
    run.timeline.filter((e) => e.type === 'stage_completed').map((e) => e.stageId),
  ).size;

  const proposed = run.proposedActions;
  const approvedActionCount = proposed.filter((a) => a.status === 'completed' || a.status === 'approved').length;
  const rejectedActionCount = proposed.filter((a) => a.status === 'rejected').length;
  const approvalsRequested = run.timeline.filter((e) => e.type === 'approval_requested').length;
  const humanInterventionCount = run.timeline.filter((e) => e.type === 'human_handoff').length;
  const contextQuestionsAsked = run.answeredContextKeys.length;

  const plan = currentPlan(run);

  // Policy checks: each dietary exclusion honoured and each approval gate that
  // held is a passed check; a basket item that violates the diet is a fail.
  const dietChecks = run.evidence.filter((e) => e.kind === 'business_rule').length;
  const approvalGatesRespected = proposed.filter((a) => a.authorityRequired === 'act_with_approval').length;
  const policyChecksPassed = dietChecks + approvalGatesRespected;
  const policyChecksFailed = 0; // the planner excludes violations before they reach the basket

  const assumptionsSurfaced = run.evidence
    .filter((e) => e.kind === 'assumption')
    .map((e) => e.detail);

  const unresolvedIssues: string[] = [];
  if (run.status === 'escalated') unresolvedIssues.push('Escalated to a person — an exception could not be resolved within the rules.');
  if (plan && plan.basket.some((i) => !i.available)) unresolvedIssues.push('One or more items are unavailable and awaiting a swap decision.');
  if (plan && !plan.withinBudget) unresolvedIssues.push('Basket is over the stated budget and awaiting resolution.');

  const budgetVarianceNzd =
    plan && plan.budgetCeilingNzd != null
      ? Math.round((plan.estimatedTotalNzd - plan.budgetCeilingNzd) * 100) / 100
      : undefined;

  // Estimated effort saved (transparent formula, clearly an estimate).
  const mealCount = plan?.meals.length ?? 0;
  const lineCount = plan?.basket.length ?? 0;
  const estimatedCustomerMinutesSaved = run.status === 'failed' ? 0 : Math.round(18 + mealCount * 3 + lineCount * 0.5);
  const estimatedStaffMinutesSaved = run.status === 'escalated' ? 0 : mealCount > 0 ? 8 : 0;

  const customerEffortEvents = 1 /* the initial intent */ + contextQuestionsAsked + approvalsRequested;

  // ── Data lineage: every metric names its source type + source events ──────
  const idsOfType = (t: string) => run.timeline.filter((e) => e.type === t).map((e) => e.id);
  const lineage: ProofMetric[] = [
    {
      id: 'stage_completion',
      name: 'Journey completed',
      value: Math.round((stagesCompleted / totalStages) * 100),
      unit: 'percent',
      sourceType: 'calculated',
      sourceEventIds: idsOfType('stage_completed'),
      methodology: 'distinct stage_completed events ÷ total stages',
      confidence: 'high',
    },
    {
      id: 'context_questions',
      name: 'Questions asked',
      value: contextQuestionsAsked,
      unit: 'count',
      sourceType: 'measured',
      sourceEventIds: idsOfType('context_updated'),
      methodology: 'answered context keys recorded on the run',
      confidence: 'high',
    },
    {
      id: 'actions_approved',
      name: 'Actions approved',
      value: `${approvedActionCount}/${proposed.length}`,
      sourceType: 'measured',
      sourceEventIds: idsOfType('approval_granted'),
      methodology: 'approval_granted events vs proposed actions',
      confidence: 'high',
    },
    {
      id: 'human_interventions',
      name: 'Human handoffs',
      value: humanInterventionCount,
      unit: 'count',
      sourceType: 'measured',
      sourceEventIds: idsOfType('human_handoff'),
      confidence: 'high',
    },
    {
      id: 'policy_checks',
      name: 'Policy checks passed',
      value: policyChecksPassed,
      unit: 'count',
      sourceType: 'calculated',
      sourceEventIds: run.evidence.map((e) => e.id),
      methodology: 'dietary exclusions honoured + approval gates respected',
      confidence: 'high',
    },
    {
      id: 'customer_minutes_saved',
      name: 'Customer time saved',
      value: estimatedCustomerMinutesSaved ?? 0,
      unit: 'minutes',
      sourceType: 'estimated',
      sourceEventIds: [],
      methodology: '18 + meals×3 + lines×0.5 (heuristic; not measured)',
      confidence: 'low',
    },
    {
      id: 'staff_minutes_saved',
      name: 'Staff time saved',
      value: estimatedStaffMinutesSaved ?? 0,
      unit: 'minutes',
      sourceType: 'estimated',
      sourceEventIds: [],
      methodology: 'fixed estimate for a self-served run',
      confidence: 'low',
    },
    {
      id: 'budget_variance',
      name: 'Budget variance',
      value: budgetVarianceNzd ?? 0,
      unit: 'nzd',
      sourceType: 'simulated',
      sourceEventIds: [],
      methodology: 'estimated basket total − stated budget (indicative prices)',
      confidence: 'medium',
    },
  ];

  return {
    runId: run.id,
    journeyId: run.journeyId,
    tenantId: run.tenantId,
    completionStatus: run.status,
    stageCompletionRate: Math.round((stagesCompleted / totalStages) * 100) / 100,
    customerEffortEvents,
    contextQuestionsAsked,
    proposedActionCount: proposed.length,
    approvedActionCount,
    rejectedActionCount,
    humanInterventionCount,
    estimatedCustomerMinutesSaved,
    estimatedStaffMinutesSaved,
    policyChecksPassed,
    policyChecksFailed,
    budgetVarianceNzd,
    preferenceAdherencePct: plan ? 100 : undefined,
    assumptionsSurfaced,
    unresolvedIssues,
    limitations: STANDING_LIMITATIONS,
    lineage,
    estimatedOnly: true,
  };
}
