import { hashArgs, stubId } from './hash';
import { actionStubStore } from './store';
import {
  ACTION_STUB_BOUNDARY,
  type ActionRiskClass,
  type ExecuteResult,
  type PermitRecord,
  type PreparedAction,
  type ReceiptRecord,
} from './types';

export type PrepareInput = {
  action_name: string;
  namespace?: string;
  title: string;
  args: Record<string, unknown>;
  idempotency_key: string;
  risk_class?: ActionRiskClass;
  tenant_id?: string;
  agent_id?: string;
  now?: string;
};

export type PermitInput = {
  prep_id: string;
  scopes?: string[];
  ttl_seconds?: number;
  max_uses?: number;
  now?: string;
};

export type ExecuteInput = {
  permit_id: string;
  prep_id: string;
  idempotency_key: string;
  /** Simulated adapter payload. */
  result?: Record<string, unknown>;
  now?: string;
};

export type ReceiptInput = {
  action_id: string;
  summary: string;
  evidence?: Array<{ kind: string; value: string }>;
  sponsor_report?: ReceiptRecord['sponsor_report'];
  now?: string;
};

function nowIso(now?: string): string {
  return now ?? new Date().toISOString();
}

export function prepareAction(input: PrepareInput): PreparedAction {
  const s = actionStubStore();
  const existingPrepId = s.prepareIdempotency.get(input.idempotency_key);
  if (existingPrepId) {
    const existing = s.prepared.get(existingPrepId);
    if (existing) return existing;
  }

  const prepared: PreparedAction = {
    prep_id: stubId('prep'),
    action_name: input.action_name,
    namespace: input.namespace ?? 'demo.stub',
    title: input.title,
    args: input.args,
    args_hash: hashArgs(input.args),
    idempotency_key: input.idempotency_key,
    risk_class: input.risk_class ?? 'medium',
    tenant_id: input.tenant_id ?? 'ten_demo',
    agent_id: input.agent_id ?? 'agt_demo',
    created_at: nowIso(input.now),
    mode: 'demo_stub',
  };
  s.prepared.set(prepared.prep_id, prepared);
  s.prepareIdempotency.set(input.idempotency_key, prepared.prep_id);
  return prepared;
}

export function issuePermit(input: PermitInput): PermitRecord {
  const s = actionStubStore();
  const prepared = s.prepared.get(input.prep_id);
  if (!prepared) {
    throw new Error(`Unknown prep_id: ${input.prep_id}`);
  }
  const ttl = input.ttl_seconds ?? 900;
  const created = nowIso(input.now);
  const expires = new Date(new Date(created).getTime() + ttl * 1000).toISOString();
  const permit: PermitRecord = {
    permit_id: stubId('prm'),
    prep_id: prepared.prep_id,
    scopes: input.scopes ?? [`action:${prepared.action_name}`],
    args_hash: prepared.args_hash,
    ttl_seconds: ttl,
    max_uses: input.max_uses ?? 1,
    uses: 0,
    expires_at: expires,
    created_at: created,
    revoked: false,
    mode: 'demo_stub',
  };
  s.permits.set(permit.permit_id, permit);
  return permit;
}

export function executeUnderPermit(input: ExecuteInput): ExecuteResult {
  const s = actionStubStore();
  const existingActionId = s.executeIdempotency.get(input.idempotency_key);
  if (existingActionId) {
    const prior = s.executes.get(existingActionId);
    if (prior) return prior;
  }

  const permit = s.permits.get(input.permit_id);
  if (!permit) throw new Error(`Unknown permit_id: ${input.permit_id}`);
  if (permit.revoked) throw new Error('Permit revoked');
  if (permit.prep_id !== input.prep_id) throw new Error('prep_id mismatch');

  const prepared = s.prepared.get(input.prep_id);
  if (!prepared) throw new Error(`Unknown prep_id: ${input.prep_id}`);
  if (permit.args_hash !== prepared.args_hash) {
    throw new Error('args_hash mismatch — execute rejected');
  }

  const at = nowIso(input.now);
  if (new Date(at).getTime() > new Date(permit.expires_at).getTime()) {
    throw new Error('Permit expired');
  }
  if (permit.uses >= permit.max_uses) {
    throw new Error('Permit max_uses exhausted');
  }

  permit.uses += 1;
  const action_id = stubId('act');
  const result: ExecuteResult = {
    action_id,
    prep_id: prepared.prep_id,
    permit_id: permit.permit_id,
    status: 'simulated',
    result: input.result ?? { ok: true, note: 'Simulated adapter — no external side effect' },
    executed_at: at,
    executionClaimed: false,
    mode: 'demo_stub',
  };
  s.executes.set(action_id, result);
  s.executeIdempotency.set(input.idempotency_key, action_id);
  return result;
}

export function mintReceipt(input: ReceiptInput): ReceiptRecord {
  const s = actionStubStore();
  const execute = s.executes.get(input.action_id);
  if (!execute) throw new Error(`Unknown action_id: ${input.action_id}`);
  const prepared = s.prepared.get(execute.prep_id);
  if (!prepared) throw new Error('Prepared action missing for receipt');

  const receipt: ReceiptRecord = {
    receipt_id: stubId('rcpt'),
    action_id: execute.action_id,
    prep_id: execute.prep_id,
    permit_id: execute.permit_id,
    action_name: prepared.action_name,
    args_hash: prepared.args_hash,
    outcome: 'simulated_ok',
    summary: input.summary,
    created_at: nowIso(input.now),
    evidence: input.evidence ?? [
      { kind: 'mode', value: 'demo_stub' },
      { kind: 'executionClaimed', value: 'false' },
    ],
    sponsor_report: input.sponsor_report,
    mode: 'demo_stub',
    boundary: ACTION_STUB_BOUNDARY,
  };
  s.receipts.set(receipt.receipt_id, receipt);
  return receipt;
}

export function getPrepared(prep_id: string): PreparedAction | undefined {
  return actionStubStore().prepared.get(prep_id);
}

export function getPermit(permit_id: string): PermitRecord | undefined {
  return actionStubStore().permits.get(permit_id);
}

export function getReceipt(receipt_id: string): ReceiptRecord | undefined {
  return actionStubStore().receipts.get(receipt_id);
}
