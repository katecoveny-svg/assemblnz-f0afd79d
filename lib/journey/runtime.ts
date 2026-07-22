/**
 * assembl — journey runtime
 * -------------------------
 * Deterministic state management for a live `JourneyRun`. The runtime advances
 * a run through the journey's stages, calls the specialist services, emits a
 * timeline of events, creates `ProposedAction`s and enforces authority via the
 * shared risk ladder (`lib/os/policy.ts`). It is pure/deterministic and free of
 * server-only imports, so the same engine runs in tests and in the browser.
 *
 * The runtime never places a real order. Consequential actions are `simulated`
 * and always require a human yes before they resolve.
 */

import { classifyActionRisk, requiresApproval } from '@/lib/os/policy';
import type {
  CustomerJourney,
  JourneyEvent,
  JourneyEventType,
  JourneyRun,
  ProposedAction,
  RiskLevel,
  AuthorityLevel,
} from './types';
import { GROCERY_RULES } from './genome/grocery-genome';
import {
  GroceryIntentSchema,
  mockIntentService,
  type GroceryIntent,
  type IntentParseResult,
  type IntentService,
} from './services/intent';
import { nextContextQuestions, type ContextQuestion } from './services/context';
import { assemblePlan, applyResolutions, type AppliedResolutions, type PlanResult } from './services/plan';
import {
  resolveBudget,
  resolveUnavailableItems,
  type ResolutionOutcome,
} from './services/resolution';
import { dietaryExclusions } from './services/plan';
import { verifyAgentInvocation, verificationAllowsProgress } from './verification';

/** Map a journey action type onto an OS action kind for risk classification. */
const ACTION_KIND: Record<string, string> = {
  summarise_plan: 'summarise',
  assemble_basket: 'create_draft',
  apply_substitution: 'update_internal_record',
  remove_item: 'update_internal_record',
  save_household_preferences: 'update_internal_record',
  place_order: 'connector_action',
};

export type AuthorityDecision = {
  risk: RiskLevel;
  needsApproval: boolean;
  authorityRequired: AuthorityLevel;
};

/** Decide risk + whether a human yes is needed for a journey action type. */
export function decideAuthority(actionType: string): AuthorityDecision {
  const rule = GROCERY_RULES.approval.find((r) => r.actionType === actionType);
  const risk = classifyActionRisk(ACTION_KIND[actionType] ?? actionType);
  const needsApproval = rule ? rule.requiresApproval : requiresApproval(risk);
  return {
    risk,
    needsApproval,
    authorityRequired: needsApproval ? 'act_with_approval' : 'recommend',
  };
}

/* ── run construction ──────────────────────────────────────────────────── */

export type StartRunArgs = {
  journey: CustomerJourney;
  statedIntent: string;
  sessionId: string;
  runId?: string;
  now?: string;
};

function ts(now?: string): string {
  return now ?? new Date().toISOString();
}

function seq(run: JourneyRun): number {
  return run.timeline.length + 1;
}

function mkEvent(
  run: JourneyRun,
  type: JourneyEventType,
  summary: string,
  extra?: Partial<Pick<JourneyEvent, 'stageId' | 'agentId' | 'metadata'>>,
  now?: string,
): JourneyEvent {
  return {
    id: `${run.id}-evt-${seq(run)}`,
    runId: run.id,
    timestamp: ts(now),
    type,
    summary,
    stageId: extra?.stageId,
    agentId: extra?.agentId,
    metadata: extra?.metadata,
  };
}

export function startJourneyRun(args: StartRunArgs): JourneyRun {
  const runId = args.runId ?? `run-${args.sessionId}`;
  const now = ts(args.now);
  const base: JourneyRun = {
    id: runId,
    tenantId: args.journey.tenantId,
    journeyId: args.journey.id,
    sessionId: args.sessionId,
    currentStageId: 'entry',
    status: 'active',
    statedIntent: args.statedIntent,
    structuredIntent: {},
    customerContext: {},
    answeredContextKeys: [],
    timeline: [],
    proposedActions: [],
    evidence: [],
    metrics: [],
    verifications: [],
    startedAt: now,
  };
  base.timeline.push(
    mkEvent(base, 'intent_received', 'Customer told us what life looks like.', { stageId: 'entry' }, now),
  );
  return base;
}

/* ── stage 2: intent ──────────────────────────────────────────────────── */

/**
 * Apply an already-computed intent result to the run (structure it, record
 * evidence, advance to context). Kept separate from `processIntent` so a model
 * call can happen server-side and the deterministic state update can happen
 * anywhere.
 */
export function applyIntentResult(
  run: JourneyRun,
  result: IntentParseResult,
  now?: string,
): JourneyRun {
  const next = clone(run);
  next.timeline.push(mkEvent(next, 'agent_started', 'Intent agent interpreting the request.', { stageId: 'intent', agentId: 'intent' }, now));
  next.structuredIntent = result.intent as unknown as Record<string, unknown>;
  next.timeline.push(
    mkEvent(next, 'agent_completed', `Structured intent ready (confidence ${(result.confidence * 100).toFixed(0)}%).`, {
      stageId: 'intent',
      agentId: 'intent',
      metadata: { confidence: result.confidence, uncertainties: result.uncertainties },
    }, now),
  );
  // Defensive: a malformed model result may not match the intent shape. Build
  // the evidence detail safely; verification below will reject invalid output.
  const i = result.intent as Partial<GroceryIntent> | undefined;
  next.evidence.push({
    id: `${run.id}-ev-intent`,
    runId: run.id,
    kind: 'assumption',
    label: 'Interpreted intent',
    detail: `${i?.people ?? '?'} people · ${i?.durationDays ?? '?'} days · avoid: ${(Array.isArray(i?.avoid) ? i!.avoid : []).join(', ') || 'none'}`,
    createdAt: ts(now),
  });
  // Verify the intent agent against its contract before proceeding.
  const ok = recordVerification(next, 'intent', next.statedIntent, next.structuredIntent, now);
  if (!ok) {
    next.status = 'failed';
    next.timeline.push(mkEvent(next, 'journey_failed', 'Intent verification failed — not proceeding.', { stageId: 'intent' }, now));
    return next;
  }
  next.currentStageId = 'context';
  next.timeline.push(mkEvent(next, 'stage_completed', 'Understood the intent.', { stageId: 'intent' }, now));
  return next;
}

/**
 * Structure the stated intent using the given service (default: the
 * deterministic mock), then apply it. Server code passes the model-backed
 * service; the same deterministic state update runs either way.
 */
export async function processIntent(
  run: JourneyRun,
  service: IntentService = mockIntentService,
  now?: string,
): Promise<JourneyRun> {
  const result = await service.parse(run.statedIntent);
  return applyIntentResult(run, result, now);
}

/* ── stage 3: context ─────────────────────────────────────────────────── */

export function pendingQuestions(run: JourneyRun, journey: CustomerJourney): ContextQuestion[] {
  const intent = currentIntent(run);
  if (!intent) return [];
  return nextContextQuestions({
    intent,
    fields: journey.customerContextFields,
    answeredKeys: run.answeredContextKeys,
    maxQuestions: GROCERY_RULES.maxQuestionsPerStep,
  });
}

export function answerContext(
  run: JourneyRun,
  answers: Record<string, unknown>,
  now?: string,
): JourneyRun {
  const next = clone(run);
  next.timeline.push(mkEvent(next, 'context_requested', 'Context agent asked the highest-value questions.', { stageId: 'context', agentId: 'context' }, now));
  for (const [key, value] of Object.entries(answers)) {
    next.customerContext[key] = value;
    if (!next.answeredContextKeys.includes(key)) next.answeredContextKeys.push(key);
  }
  next.timeline.push(
    mkEvent(next, 'context_updated', `Captured: ${Object.keys(answers).join(', ') || 'nothing new'}.`, { stageId: 'context', agentId: 'context', metadata: answers }, now),
  );
  return next;
}

export function completeContext(run: JourneyRun, now?: string): JourneyRun {
  const next = clone(run);
  next.currentStageId = 'recommendation';
  next.timeline.push(mkEvent(next, 'stage_completed', 'Asked only what mattered.', { stageId: 'context' }, now));
  return next;
}

/* ── stage 4–6: recommendation → commitment → action ──────────────────── */

/** Budget captured from context (number), if any. */
export function contextBudget(run: JourneyRun): number | null {
  const b = run.customerContext['budget'];
  return typeof b === 'number' && b > 0 ? b : null;
}

export function currentIntent(run: JourneyRun): GroceryIntent | null {
  const parsed = GroceryIntentSchema.safeParse(run.structuredIntent);
  return parsed.success ? parsed.data : null;
}

/** Resolutions the customer has approved this run (swaps / removals). */
export function appliedResolutions(run: JourneyRun): AppliedResolutions {
  const raw = run.customerContext['_appliedResolutions'] as Partial<AppliedResolutions> | undefined;
  return { swaps: raw?.swaps ?? {}, removed: raw?.removed ?? [] };
}

/**
 * Recompute the current plan deterministically from intent + context budget,
 * then apply any approved resolutions so the basket reflects the customer's
 * actual decisions.
 */
export function currentPlan(run: JourneyRun): PlanResult | null {
  const intent = currentIntent(run);
  if (!intent) return null;
  return applyResolutions(assemblePlan(intent, contextBudget(run)), appliedResolutions(run));
}

export function processRecommendation(run: JourneyRun, now?: string): JourneyRun {
  const next = clone(run);
  const plan = currentPlan(next);
  if (!plan) {
    next.status = 'failed';
    next.timeline.push(mkEvent(next, 'journey_failed', 'Could not interpret the request well enough to plan.', { stageId: 'recommendation' }, now));
    return next;
  }
  next.timeline.push(mkEvent(next, 'agent_started', 'Plan agent assembling meals and basket.', { stageId: 'recommendation', agentId: 'plan' }, now));

  // Evidence: every assumption + dietary exclusion becomes a record.
  for (const a of plan.assumptions) {
    next.evidence.push({ id: `${run.id}-ev-asm-${next.evidence.length}`, runId: run.id, kind: 'assumption', label: 'Assumption', detail: a, createdAt: ts(now) });
  }
  for (const x of plan.excludedForDiet) {
    next.evidence.push({ id: `${run.id}-ev-diet-${next.evidence.length}`, runId: run.id, kind: 'business_rule', label: 'Dietary exclusion', detail: x, sourceRef: 'rec-dietary-strict', createdAt: ts(now) });
  }
  next.timeline.push(
    mkEvent(next, 'agent_completed', `Plan ready: ${plan.meals.length} meals, ${plan.basket.length} basket lines, about $${plan.estimatedTotalNzd.toFixed(2)}.`, {
      stageId: 'recommendation',
      agentId: 'plan',
      metadata: { estimatedTotalNzd: plan.estimatedTotalNzd, withinBudget: plan.withinBudget },
    }, now),
  );
  // Verify the plan agent (dietary respected, budget flag consistent).
  const planOk = recordVerification(next, 'plan', currentIntent(next), plan, now);
  if (!planOk) {
    next.status = 'failed';
    next.timeline.push(mkEvent(next, 'journey_failed', 'Plan verification failed — not proceeding to commitment.', { stageId: 'recommendation' }, now));
    return next;
  }
  next.currentStageId = 'commitment';
  next.timeline.push(mkEvent(next, 'stage_completed', 'Assembled the plan.', { stageId: 'recommendation' }, now));
  return next;
}

/** Stage 6: create the approval-required "assemble basket" action. */
export function proposeBasket(run: JourneyRun, now?: string): JourneyRun {
  const next = clone(run);
  const plan = currentPlan(next);
  if (!plan) return next;
  // Verify the basket agent before proposing an approval-required action.
  const basketOutput = plan.basket.map((i) => ({ sku: i.sku, quantity: i.quantity, lineTotalNzd: i.lineTotalNzd }));
  const basketOk = recordVerification(next, 'basket', plan, basketOutput, now);
  if (!basketOk) {
    next.status = 'failed';
    next.timeline.push(mkEvent(next, 'journey_failed', 'Basket verification failed — no action proposed.', { stageId: 'action', agentId: 'basket' }, now));
    return next;
  }
  const decision = decideAuthority('assemble_basket');
  next.currentStageId = 'action';
  const action = mkAction(next, {
    stageId: 'action',
    agentId: 'basket',
    type: 'assemble_basket',
    title: 'Assemble this basket',
    description: `${plan.basket.length} items grouped by category, about $${plan.estimatedTotalNzd.toFixed(2)} (indicative).`,
    reason: 'You confirmed the plan; this prepares the basket. Nothing is ordered.',
    decision,
    execution: 'simulated',
    payload: { estimatedTotalNzd: plan.estimatedTotalNzd, lineCount: plan.basket.length },
    evidenceIds: next.evidence.map((e) => e.id),
  }, now);
  next.proposedActions.push(action);
  next.status = 'approval_required';
  next.timeline.push(mkEvent(next, 'tool_proposed', 'Basket agent prepared a basket for your approval.', { stageId: 'action', agentId: 'basket' }, now));
  next.timeline.push(mkEvent(next, 'approval_requested', 'Approval requested: assemble basket.', { stageId: 'action', agentId: 'basket' }, now));
  return next;
}

/* ── approvals ─────────────────────────────────────────────────────────── */

export function approveAction(run: JourneyRun, actionId: string, now?: string): JourneyRun {
  const next = clone(run);
  const action = next.proposedActions.find((a) => a.id === actionId);
  if (!action || action.status !== 'proposed') return next;
  action.status = 'completed';
  action.resolvedAt = ts(now);
  next.timeline.push(mkEvent(next, 'approval_granted', `Approved: ${action.title}.`, { stageId: action.stageId, agentId: action.agentId }, now));
  next.timeline.push(mkEvent(next, 'action_completed', `${action.title} — prepared (simulated).`, { stageId: action.stageId, agentId: action.agentId }, now));
  // Advance out of approval gate.
  if (action.type === 'assemble_basket') {
    next.status = 'waiting';
    next.currentStageId = 'wait';
    next.timeline.push(mkEvent(next, 'wait_state_started', 'Assembling — showing the work.', { stageId: 'wait', agentId: 'wait-state' }, now));
  } else if (action.type === 'apply_substitution' || action.type === 'remove_item') {
    // Persist the approved resolution so the derived plan reflects it.
    const cur = appliedResolutions(next);
    const swaps = { ...cur.swaps };
    const removed = [...cur.removed];
    const from = action.payload?.fromSku as string | undefined;
    const to = action.payload?.toSku as string | undefined;
    if (action.type === 'apply_substitution' && from && to) swaps[from] = to;
    if (action.type === 'remove_item' && from) removed.push(from);
    next.customerContext['_appliedResolutions'] = { swaps, removed };
    next.status = 'active';
  } else {
    next.status = 'active';
  }
  return next;
}

export function rejectAction(run: JourneyRun, actionId: string, now?: string): JourneyRun {
  const next = clone(run);
  const action = next.proposedActions.find((a) => a.id === actionId);
  if (!action || action.status !== 'proposed') return next;
  action.status = 'rejected';
  action.resolvedAt = ts(now);
  next.status = 'active';
  next.timeline.push(mkEvent(next, 'approval_rejected', `Rejected: ${action.title}. Nothing was prepared.`, { stageId: action.stageId, agentId: action.agentId }, now));
  return next;
}

/* ── stage 7–8: wait → fulfilment ─────────────────────────────────────── */

export function completeWait(run: JourneyRun, now?: string): JourneyRun {
  const next = clone(run);
  next.currentStageId = 'fulfilment';
  next.status = 'active';
  next.timeline.push(mkEvent(next, 'stage_completed', 'Assembled — basket ready to review.', { stageId: 'wait' }, now));
  return next;
}

/* ── stage 9: resolution (exceptions) ─────────────────────────────────── */

export type JourneyException = 'unavailable_item' | 'budget_exceeded';

export function detectExceptions(run: JourneyRun): JourneyException[] {
  const plan = currentPlan(run);
  if (!plan) return [];
  const out: JourneyException[] = [];
  if (plan.basket.some((i) => !i.available)) out.push('unavailable_item');
  if (!plan.withinBudget) out.push('budget_exceeded');
  return out;
}

export function runResolution(run: JourneyRun, issue: JourneyException, now?: string): { run: JourneyRun; outcome: ResolutionOutcome } {
  const next = clone(run);
  const plan = currentPlan(next);
  const intent = currentIntent(next);
  next.currentStageId = 'resolution';
  next.timeline.push(mkEvent(next, 'agent_started', `Resolution agent handling: ${issue.replace('_', ' ')}.`, { stageId: 'resolution', agentId: 'resolution' }, now));

  let outcome: ResolutionOutcome;
  if (!plan || !intent) {
    outcome = { issue, resolvable: false, proposals: [], summary: 'No plan to resolve.', requiresApproval: false };
  } else if (issue === 'unavailable_item') {
    outcome = resolveUnavailableItems(plan.basket, dietaryExclusions(intent));
  } else {
    outcome = resolveBudget(plan);
  }

  // Turn resolution proposals into approval-required actions or an escalation.
  for (const p of outcome.proposals) {
    if (p.kind === 'escalate') {
      next.status = 'escalated';
      next.timeline.push(mkEvent(next, 'human_handoff', p.reason, { stageId: 'resolution', agentId: 'resolution' }, now));
      continue;
    }
    const decision = decideAuthority('apply_substitution');
    next.proposedActions.push(
      mkAction(next, {
        stageId: 'resolution',
        agentId: 'resolution',
        type: p.kind === 'remove' ? 'remove_item' : 'apply_substitution',
        title: p.kind === 'remove' ? 'Remove item' : 'Swap to available item',
        description: p.reason,
        reason: outcome.summary,
        decision,
        execution: 'proposed',
        payload: { fromSku: p.fromSku, toSku: p.toSku, estimatedDeltaNzd: p.estimatedDeltaNzd },
        evidenceIds: [],
      }, now),
    );
  }
  if (outcome.proposals.some((p) => p.kind !== 'escalate')) {
    next.status = 'approval_required';
    next.timeline.push(mkEvent(next, 'approval_requested', `Approval requested: ${outcome.summary}`, { stageId: 'resolution', agentId: 'resolution' }, now));
  }
  next.evidence.push({ id: `${run.id}-ev-res-${next.evidence.length}`, runId: run.id, kind: 'calculation', label: 'Resolution', detail: outcome.summary, createdAt: ts(now) });
  const basketOutput = (plan?.basket ?? []).map((i) => ({ sku: i.sku, quantity: i.quantity, lineTotalNzd: i.lineTotalNzd }));
  recordVerification(next, 'resolution', basketOutput, outcome, now);
  return { run: next, outcome };
}

/* ── stage 10: continuation ───────────────────────────────────────────── */

export function proposeSavePreferences(run: JourneyRun, now?: string): JourneyRun {
  const next = clone(run);
  next.currentStageId = 'continuation';
  const decision = decideAuthority('save_household_preferences');
  next.proposedActions.push(
    mkAction(next, {
      stageId: 'continuation',
      agentId: 'basket',
      type: 'save_household_preferences',
      title: 'Save household preferences',
      description: 'Remember this household’s size, dietary needs and what to avoid for next time.',
      reason: 'Saving is your choice — you can edit or remove it any time.',
      decision,
      execution: 'proposed',
      payload: { context: next.customerContext, intent: next.structuredIntent },
      evidenceIds: [],
    }, now),
  );
  next.status = 'approval_required';
  next.timeline.push(mkEvent(next, 'approval_requested', 'Approval requested: save household preferences.', { stageId: 'continuation', agentId: 'basket' }, now));
  return next;
}

export function completeJourney(run: JourneyRun, now?: string): JourneyRun {
  const next = clone(run);
  next.status = 'completed';
  next.completedAt = ts(now);
  next.timeline.push(mkEvent(next, 'journey_completed', 'Journey complete.', { stageId: next.currentStageId }, now));
  return next;
}

/* ── helpers ───────────────────────────────────────────────────────────── */

type MkActionInput = {
  stageId: string;
  agentId: string;
  type: string;
  title: string;
  description: string;
  reason: string;
  decision: AuthorityDecision;
  execution: ProposedAction['execution'];
  payload: Record<string, unknown>;
  evidenceIds: string[];
};

function mkAction(run: JourneyRun, input: MkActionInput, now?: string): ProposedAction {
  return {
    id: `${run.id}-act-${run.proposedActions.length + 1}`,
    runId: run.id,
    stageId: input.stageId,
    agentId: input.agentId,
    type: input.type,
    title: input.title,
    description: input.description,
    reason: input.reason,
    status: 'proposed',
    riskLevel: input.decision.risk,
    authorityRequired: input.decision.authorityRequired,
    execution: input.execution,
    payload: input.payload,
    evidenceIds: input.evidenceIds,
    createdAt: ts(now),
  };
}

/** Structured deep-ish clone that keeps the run immutable between steps. */
function clone(run: JourneyRun): JourneyRun {
  return {
    ...run,
    structuredIntent: { ...run.structuredIntent },
    customerContext: { ...run.customerContext },
    answeredContextKeys: [...run.answeredContextKeys],
    timeline: run.timeline.map((e) => ({ ...e })),
    proposedActions: run.proposedActions.map((a) => ({ ...a })),
    evidence: run.evidence.map((e) => ({ ...e })),
    metrics: run.metrics.map((m) => ({ ...m })),
    verifications: run.verifications.map((v) => ({ ...v })),
  };
}

/** Record an agent verification on the run and return whether to proceed. */
function recordVerification(
  run: JourneyRun,
  agentId: string,
  input: unknown,
  output: unknown,
  now?: string,
): boolean {
  const result = verifyAgentInvocation({
    invocationId: `${run.id}-inv-${run.verifications.length + 1}`,
    agentId,
    input,
    output,
    now,
  });
  run.verifications.push(result);
  run.timeline.push(
    mkEvent(
      run,
      'agent_completed',
      `Verification ${result.status} for ${agentId} (${result.checks.filter((c) => c.passed).length}/${result.checks.length} checks).`,
      { agentId, metadata: { verification: result.status, invocationId: result.invocationId } },
      now,
    ),
  );
  return verificationAllowsProgress(result);
}
