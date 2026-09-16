import type { ActionStage, ActionStatus, RiskClass } from '@/lib/do/action-contract';

export type StageLogEntry = {
  stage: ActionStage;
  at: string;
  ok?: boolean;
  detail?: Record<string, unknown>;
};

export type ActionRunRecord = {
  action_id: string;
  prep_id: string;
  action_name: string;
  namespace: string;
  tenant_id: string;
  agent_id: string | null;
  owner_id: string | null;
  args: Record<string, unknown>;
  args_hash: string;
  idempotency_key: string | null;
  stage: ActionStage;
  status: ActionStatus;
  risk_class: RiskClass;
  result: unknown | null;
  verify: { passed: boolean; checks: string[] } | null;
  stage_log: StageLogEntry[];
  permit_id: string | null;
  receipt_id: string | null;
  wait_id: string | null;
  reached_execute: boolean;
  executed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PermitRecord = {
  permit_id: string;
  prep_id: string;
  action_id: string;
  tenant_id: string;
  scopes: string[];
  args_hash: string;
  max_uses: number;
  uses: number;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
};

export type ActionReceiptRecord = {
  receipt_id: string;
  action_id: string;
  permit_id: string | null;
  tenant_id: string;
  args_hash: string;
  result_digest: string;
  stage_log: StageLogEntry[];
  actor: { agent_id: string | null; tenant_id: string };
  payload: Record<string, unknown>;
  created_at: string;
};

export type WaitRecord = {
  wait_id: string;
  action_id: string;
  tenant_id: string;
  kind: string;
  status: 'pending' | 'resolved' | 'timed_out';
  timeout_at: string;
  resolved_at: string | null;
  result: unknown | null;
  created_at: string;
};

export type ActionCloudStore = {
  getRunByActionId(actionId: string): Promise<ActionRunRecord | null>;
  getRunByPrepId(prepId: string): Promise<ActionRunRecord | null>;
  getRunByIdempotency(
    tenantId: string,
    idempotencyKey: string,
  ): Promise<ActionRunRecord | null>;
  saveRun(run: ActionRunRecord): Promise<void>;
  listRuns(opts?: { tenantId?: string }): Promise<ActionRunRecord[]>;

  getPermit(permitId: string): Promise<PermitRecord | null>;
  savePermit(permit: PermitRecord): Promise<void>;

  getReceipt(receiptId: string): Promise<ActionReceiptRecord | null>;
  getReceiptByActionId(actionId: string): Promise<ActionReceiptRecord | null>;
  /** Append-only: never updates an existing receipt_id. */
  appendReceipt(receipt: ActionReceiptRecord): Promise<void>;

  getWait(waitId: string): Promise<WaitRecord | null>;
  saveWait(wait: WaitRecord): Promise<void>;
};
