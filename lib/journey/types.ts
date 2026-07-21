/**
 * assembl — agentic customer journey · core types
 * ------------------------------------------------
 * The one reusable journey object. Every surface reads these types:
 * the composer, the runtime, the customer interface, the evaluation suite and
 * the Proof dashboard. Nothing here is grocery-specific — the "everyday,
 * assembled" reference journey is one *configuration* of this model
 * (see `lib/journey/journeys/everyday-assembled.ts`). Energy, airlines, trades
 * and the rest reuse the same shapes; only the configuration changes.
 *
 * Enums are modelled as zod enums so the same value set validates agent output
 * at runtime and types the code at compile time — no drift between the two.
 */

import { z } from 'zod';

/* ────────────────────────────────────────────────────────────────────────
 * Enumerations
 * ──────────────────────────────────────────────────────────────────────── */

export const JOURNEY_STATUSES = [
  'draft',
  'testing',
  'shadow',
  'pilot',
  'live',
  'paused',
] as const;
export const JourneyStatusSchema = z.enum(JOURNEY_STATUSES);
export type JourneyStatus = z.infer<typeof JourneyStatusSchema>;

export const JOURNEY_STAGE_TYPES = [
  'entry',
  'intent',
  'context',
  'recommendation',
  'commitment',
  'action',
  'wait',
  'fulfilment',
  'resolution',
  'continuation',
] as const;
export const JourneyStageTypeSchema = z.enum(JOURNEY_STAGE_TYPES);
export type JourneyStageType = z.infer<typeof JourneyStageTypeSchema>;

/**
 * Authority ladder. Ordered least → most authority so it can be compared.
 * Maps onto the existing OS risk ladder (`lib/os/policy.ts`): everything at
 * `act_with_approval` or below never touches the outside world without a human
 * yes; `act_within_limits` / `autonomous_with_audit` are reserved for a future
 * connector era and are not exercised by any seed journey.
 */
export const AUTHORITY_LEVELS = [
  'observe',
  'draft',
  'recommend',
  'act_with_approval',
  'act_within_limits',
  'autonomous_with_audit',
] as const;
export const AuthorityLevelSchema = z.enum(AUTHORITY_LEVELS);
export type AuthorityLevel = z.infer<typeof AuthorityLevelSchema>;

/** Numeric rank for authority comparisons (higher = more authority). */
export function authorityRank(level: AuthorityLevel): number {
  return AUTHORITY_LEVELS.indexOf(level);
}

export const EXPERIENCE_SURFACES = [
  'web',
  'mobile',
  'chat',
  'voice',
  'email',
  'sms',
  'whatsapp',
  'staff_console',
] as const;
export const ExperienceSurfaceSchema = z.enum(EXPERIENCE_SURFACES);
export type ExperienceSurface = z.infer<typeof ExperienceSurfaceSchema>;

export const RISK_LEVELS = ['low', 'medium', 'high'] as const;
export const RiskLevelSchema = z.enum(RISK_LEVELS);
export type RiskLevel = z.infer<typeof RiskLevelSchema>;

/**
 * Honest status treatment. Credibility over cleverness: a surface never claims
 * more than this word allows. `simulated` and `completed` must never be
 * confused — a prepared basket is `simulated`, never `completed`.
 */
export const STATUS_TREATMENTS = [
  'live',
  'connected',
  'sandbox',
  'simulated',
  'proposed',
  'approval_required',
  'completed',
  'unavailable',
] as const;
export const StatusTreatmentSchema = z.enum(STATUS_TREATMENTS);
export type StatusTreatment = z.infer<typeof StatusTreatmentSchema>;

export const RUN_STATUSES = [
  'active',
  'waiting',
  'approval_required',
  'completed',
  'failed',
  'escalated',
] as const;
export const RunStatusSchema = z.enum(RUN_STATUSES);
export type RunStatus = z.infer<typeof RunStatusSchema>;

export const JOURNEY_EVENT_TYPES = [
  'intent_received',
  'context_requested',
  'context_updated',
  'agent_started',
  'agent_completed',
  'tool_proposed',
  'approval_requested',
  'approval_granted',
  'approval_rejected',
  'action_completed',
  'wait_state_started',
  'stage_completed',
  'journey_completed',
  'journey_failed',
  'human_handoff',
] as const;
export const JourneyEventTypeSchema = z.enum(JOURNEY_EVENT_TYPES);
export type JourneyEventType = z.infer<typeof JourneyEventTypeSchema>;

export const PROPOSED_ACTION_STATUSES = [
  'proposed',
  'approved',
  'rejected',
  'executing',
  'completed',
  'failed',
] as const;
export const ProposedActionStatusSchema = z.enum(PROPOSED_ACTION_STATUSES);
export type ProposedActionStatus = z.infer<typeof ProposedActionStatusSchema>;

/* ────────────────────────────────────────────────────────────────────────
 * Journey definition (the composer's / configuration's shape)
 * ──────────────────────────────────────────────────────────────────────── */

export type JourneyEntryPoint = {
  id: string;
  surface: ExperienceSurface;
  label: string;
  /** Example intents shown to seed the natural-language entry field. */
  examplePrompts: string[];
};

export type CustomerContextField = {
  key: string;
  label: string;
  /** Why gathering this improves the outcome — shown to the customer. */
  rationale: string;
  /** How valuable this field is for the plan (drives question ranking). */
  importance: 'high' | 'medium' | 'low';
  kind: 'text' | 'number' | 'choice' | 'boolean';
  choices?: string[];
  required: boolean;
};

export type JourneyFailurePath = {
  id: string;
  label: string;
  /** Condition, in plain language, that triggers this failure path. */
  when: string;
  /** Stage the run moves to when this path fires. */
  toStageId: string;
};

export type JourneyStage = {
  id: string;
  journeyId: string;
  type: JourneyStageType;
  name: string;
  order: number;
  customerGoal: string;
  businessGoal: string;
  requiredContext: string[];
  optionalContext: string[];
  agentRoles: string[];
  availableActions: string[];
  authorityLevel: AuthorityLevel;
  experienceSurface: ExperienceSurface;
  successCriteria: string[];
  failurePaths: JourneyFailurePath[];
  nextStageIds: string[];
};

export type JourneyAgentAssignment = {
  /** Role id — resolves to a `JourneyAgentRole` in `lib/journey/agents.ts`. */
  roleId: string;
  stageIds: string[];
  authorityLevel: AuthorityLevel;
};

export type JourneyToolPermission = {
  /** Capability key — aligns with `lib/os/capabilities.ts` where connected. */
  capabilityKey: string;
  label: string;
  authorityRequired: AuthorityLevel;
  /** Honest wiring status. Seed journeys are `simulated` or `sandbox`. */
  status: StatusTreatment;
};

export type WaitStateModule = {
  id: string;
  stageId: string;
  /** Ordered, human-readable work steps revealed while the journey assembles. */
  steps: WaitStateStep[];
  /** Whether the customer can influence the journey during the wait. */
  interactive: boolean;
};

export type WaitStateStep = {
  id: string;
  label: string;
  /** What is actually being done — kept truthful, never decorative. */
  detail: string;
  /** Which agent role is doing this work. */
  agentRoleId: string;
};

export type HumanHandoffRule = {
  id: string;
  /** Plain-language trigger. */
  when: string;
  toRole: string;
  authorityLevel: AuthorityLevel;
};

export type JourneyMetric = {
  key: string;
  label: string;
  unit: 'minutes' | 'count' | 'percent' | 'nzd' | 'ratio';
  /** True when the value is estimated / simulated rather than measured. */
  estimated: boolean;
};

export type CustomerJourney = {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  objective: string;
  status: JourneyStatus;
  /** The one friction moment this journey improves — keeps it disciplined. */
  frictionMoment: string;
  entryPoints: JourneyEntryPoint[];
  stages: JourneyStage[];
  customerContextFields: CustomerContextField[];
  agentAssignments: JourneyAgentAssignment[];
  toolPermissions: JourneyToolPermission[];
  waitStateModules: WaitStateModule[];
  handoffRules: HumanHandoffRule[];
  metrics: JourneyMetric[];
  evaluationSuiteId?: string;
  createdAt: string;
  updatedAt: string;
};

/* ────────────────────────────────────────────────────────────────────────
 * Runtime (a live run of a journey)
 * ──────────────────────────────────────────────────────────────────────── */

export const EvidenceRecordSchema = z.object({
  id: z.string(),
  runId: z.string(),
  kind: z.enum(['genome_fact', 'business_rule', 'catalogue', 'calculation', 'assumption']),
  label: z.string(),
  detail: z.string(),
  /** Source reference — a genome fact id, rule id, or catalogue sku. */
  sourceRef: z.string().optional(),
  createdAt: z.string(),
});
export type EvidenceRecord = z.infer<typeof EvidenceRecordSchema>;

export const ProposedActionSchema = z.object({
  id: z.string(),
  runId: z.string(),
  stageId: z.string(),
  agentId: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string(),
  reason: z.string(),
  status: ProposedActionStatusSchema,
  riskLevel: RiskLevelSchema,
  authorityRequired: AuthorityLevelSchema,
  /** Honest treatment of what executing this action really does. */
  execution: StatusTreatmentSchema,
  payload: z.record(z.string(), z.unknown()),
  evidenceIds: z.array(z.string()),
  createdAt: z.string(),
  resolvedAt: z.string().optional(),
});
export type ProposedAction = z.infer<typeof ProposedActionSchema>;

export const JourneyEventSchema = z.object({
  id: z.string(),
  runId: z.string(),
  timestamp: z.string(),
  type: JourneyEventTypeSchema,
  stageId: z.string().optional(),
  agentId: z.string().optional(),
  summary: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type JourneyEvent = z.infer<typeof JourneyEventSchema>;

export type JourneyRunMetric = {
  key: string;
  label: string;
  value: number;
  unit: JourneyMetric['unit'];
  estimated: boolean;
};

export type JourneyRun = {
  id: string;
  tenantId: string;
  journeyId: string;
  customerId?: string;
  sessionId: string;
  currentStageId: string;
  status: RunStatus;
  statedIntent: string;
  structuredIntent: Record<string, unknown>;
  customerContext: Record<string, unknown>;
  /** Context questions answered vs still open. */
  answeredContextKeys: string[];
  timeline: JourneyEvent[];
  proposedActions: ProposedAction[];
  evidence: EvidenceRecord[];
  metrics: JourneyRunMetric[];
  startedAt: string;
  completedAt?: string;
};

/* ────────────────────────────────────────────────────────────────────────
 * Proof
 * ──────────────────────────────────────────────────────────────────────── */

export type JourneyProofSummary = {
  runId: string;
  journeyId: string;
  tenantId: string;
  completionStatus: RunStatus;
  stageCompletionRate: number;
  customerEffortEvents: number;
  contextQuestionsAsked: number;
  proposedActionCount: number;
  approvedActionCount: number;
  rejectedActionCount: number;
  humanInterventionCount: number;
  estimatedCustomerMinutesSaved?: number;
  estimatedStaffMinutesSaved?: number;
  policyChecksPassed: number;
  policyChecksFailed: number;
  budgetVarianceNzd?: number;
  preferenceAdherencePct?: number;
  assumptionsSurfaced: string[];
  unresolvedIssues: string[];
  limitations: string[];
  /** Every proof metric is estimated or simulated in the seed build. */
  estimatedOnly: boolean;
};
