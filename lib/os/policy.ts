/**
 * Risk policy + task state machine — pure logic, no I/O.
 *
 * The operating system's safety rules (docs/AGENTIC-OS-ARCHITECTURE.md §B.6):
 * low-risk work happens automatically, medium-risk depends on tenant policy,
 * high-risk always waits for a human yes. This module owns the
 * classification and the legal task-state transitions; the DB stores live
 * in lib/os/tasks.ts and lib/os/evidence.ts.
 */

export type RiskLevel = 'low' | 'medium' | 'high';

/** Action kinds the OS understands, mapped to the brief's risk classes. */
const HIGH_RISK_ACTIONS = new Set([
  // anything that leaves the building or commits the business
  'email_draft', // external send once dispatched
  'webhook',
  'connector_action',
  'send_customer_email',
  'send_sms',
  'spend_money',
  'issue_refund',
  'change_pricing',
  'accept_agreement',
  'delete_record',
  'publish_public',
  'share_sensitive',
  'change_staff_access',
]);

const MEDIUM_RISK_ACTIONS = new Set([
  'create_draft',
  'create_task',
  'update_internal_record',
  'schedule_provisional_event',
  'send_internal_notification',
  'suggest_genome_fact',
]);

const LOW_RISK_ACTIONS = new Set([
  'summarise',
  'analyse',
  'draft_internal',
  'search_knowledge',
  'recommend',
  'organise_internal',
  'read_genome',
]);

/**
 * Classify an action kind. Unknown kinds are HIGH by default — an
 * unclassified action must never slip through as automatic.
 */
export function classifyActionRisk(kind: string): RiskLevel {
  const k = kind.trim().toLowerCase();
  if (LOW_RISK_ACTIONS.has(k)) return 'low';
  if (MEDIUM_RISK_ACTIONS.has(k)) return 'medium';
  if (HIGH_RISK_ACTIONS.has(k)) return 'high';
  return 'high';
}

/** Whether an action of this risk may run without explicit approval.
 *  Medium-risk automation is a tenant policy decision — the default is
 *  conservative (requires approval) until per-tenant policies exist. */
export function requiresApproval(risk: RiskLevel, tenantAllowsMedium = false): boolean {
  if (risk === 'low') return false;
  if (risk === 'medium') return !tenantAllowsMedium;
  return true;
}

/* ── task state machine ─────────────────────────────────────────────── */

export const TASK_STATUSES = [
  'proposed',
  'awaiting_context',
  'awaiting_approval',
  'ready',
  'running',
  'blocked',
  'completed',
  'failed',
  'cancelled',
  'requires_review',
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

const TASK_TRANSITIONS: Record<TaskStatus, readonly TaskStatus[]> = {
  proposed: ['awaiting_context', 'awaiting_approval', 'ready', 'cancelled'],
  awaiting_context: ['awaiting_approval', 'ready', 'blocked', 'cancelled'],
  awaiting_approval: ['ready', 'requires_review', 'cancelled'],
  ready: ['running', 'blocked', 'cancelled'],
  running: ['completed', 'failed', 'blocked', 'requires_review'],
  blocked: ['ready', 'failed', 'cancelled'],
  requires_review: ['ready', 'completed', 'cancelled'],
  completed: [],
  failed: ['ready'],
  cancelled: [],
};

export function isTaskStatus(value: string): value is TaskStatus {
  return (TASK_STATUSES as readonly string[]).includes(value);
}

/** Whether a task may move from one state to another. Terminal states
 *  (completed, cancelled) never transition; failed may be retried. */
export function canTransitionTask(from: TaskStatus, to: TaskStatus): boolean {
  return TASK_TRANSITIONS[from]?.includes(to) ?? false;
}
