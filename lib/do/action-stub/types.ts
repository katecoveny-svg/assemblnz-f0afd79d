/**
 * Local Action Contract stubs for DO prototypes.
 *
 * TODO(action-core): Swap these shapes to live `/api/do/action/*` handlers
 * once Phase 1 Action Core lands (see docs/do-action-cloud/ACTION_CONTRACT_SPEC.md).
 * Field names intentionally mirror the canonical contract so UI can stay put.
 */

export const ACTION_STUB_CONTRACT_VERSION = '0.1.0-stub' as const;

export type ActionRiskClass = 'low' | 'medium' | 'high' | 'critical';

export type ActionStage =
  | 'prepare'
  | 'permit'
  | 'execute'
  | 'receipt'
  | 'undo';

export type ActionStubStatus =
  | 'proposed'
  | 'prepared'
  | 'permit_required'
  | 'permitted'
  | 'simulated'
  | 'denied'
  | 'receipted';

export type PreparedAction = {
  prep_id: string;
  action_name: string;
  namespace: string;
  title: string;
  args: Record<string, unknown>;
  args_hash: string;
  idempotency_key: string;
  risk_class: ActionRiskClass;
  tenant_id: string;
  agent_id: string;
  created_at: string;
  /** Honest label — never claim live Action Cloud. */
  mode: 'demo_stub';
};

export type PermitRecord = {
  permit_id: string;
  prep_id: string;
  scopes: string[];
  args_hash: string;
  ttl_seconds: number;
  max_uses: number;
  uses: number;
  expires_at: string;
  created_at: string;
  revoked: boolean;
  mode: 'demo_stub';
};

export type ExecuteResult = {
  action_id: string;
  prep_id: string;
  permit_id: string;
  status: 'simulated';
  result: Record<string, unknown>;
  executed_at: string;
  /** Always false for stubs — no external side effect. */
  executionClaimed: false;
  mode: 'demo_stub';
};

export type ReceiptRecord = {
  receipt_id: string;
  action_id: string;
  prep_id: string;
  permit_id: string;
  action_name: string;
  args_hash: string;
  outcome: 'simulated_ok' | 'denied' | 'expired';
  summary: string;
  created_at: string;
  evidence: Array<{ kind: string; value: string }>;
  sponsor_report?: {
    sponsored: boolean;
    label: string;
    vertical: string;
  };
  mode: 'demo_stub';
  /** Hard honesty stamp. */
  boundary: string;
};

export const ACTION_STUB_BOUNDARY =
  'DEMO STUB · prepare/permit/execute are local only. No live Action Cloud, no partner API, no OpenAI Ads. Swap to /api/do/action/* when Phase 1 lands.';
