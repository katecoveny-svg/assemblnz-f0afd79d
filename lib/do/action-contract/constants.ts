/** Action Contract spec version (see docs/do-action-cloud/ACTION_CONTRACT_SPEC.md). */
export const CONTRACT_VERSION = '0.1.0' as const;

export const RISK_CLASSES = ['low', 'medium', 'high', 'critical'] as const;
export type RiskClass = (typeof RISK_CLASSES)[number];

export const ACTION_STAGES = [
  'discover',
  'inspect',
  'quote',
  'prepare',
  'permit',
  'execute',
  'wait',
  'verify',
  'receipt',
  'undo',
  'escalate',
] as const;
export type ActionStage = (typeof ACTION_STAGES)[number];

export const ACTION_STATUSES = [
  'accepted',
  'in_progress',
  'waiting',
  'succeeded',
  'failed',
  'cancelled',
  'escalated',
  'undone',
] as const;
export type ActionStatus = (typeof ACTION_STATUSES)[number];

export const DEMO_ECHO_ACTION = {
  name: 'echo',
  namespace: 'demo',
  version: '1',
  title: 'Echo (demo)',
  description: 'Phase 1 mock adapter — locks args, permits, echoes, receipts.',
  risk_class: 'low' as const,
  idempotent: true,
  undoable: false,
  transports: ['rest'] as const,
};

/** Default permit TTL for demo.echo (15 minutes). */
export const DEFAULT_PERMIT_TTL_SECONDS = 900;
