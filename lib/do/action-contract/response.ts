import { CONTRACT_VERSION } from './constants';
import type { ActionStage, ActionStatus, RiskClass } from './constants';
import {
  universalResponseSchema,
  type DoError,
  type UniversalResponse,
} from './schemas';

export type BuildResponseInput = {
  ok: boolean;
  stage: ActionStage;
  status: ActionStatus;
  action_id?: string | null;
  action_name?: string | null;
  prep_id?: string | null;
  permit_id?: string | null;
  receipt_id?: string | null;
  wait_id?: string | null;
  verify?: { passed: boolean; checks: string[] } | null;
  result?: unknown;
  errors?: DoError[];
  risk_class?: RiskClass;
  risk_flags?: string[];
  idempotency_key?: string | null;
  request_id?: string;
};

function newRequestId(): string {
  return `req_${crypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
}

export function buildUniversalResponse(input: BuildResponseInput): UniversalResponse {
  const response: UniversalResponse = {
    ok: input.ok,
    action_id: input.action_id ?? null,
    action_name: input.action_name ?? null,
    stage: input.stage,
    status: input.status,
    prep_id: input.prep_id ?? null,
    permit_id: input.permit_id ?? null,
    receipt_id: input.receipt_id ?? null,
    wait_id: input.wait_id ?? null,
    verify: input.verify ?? null,
    result: input.result ?? null,
    errors: input.errors ?? [],
    risk: {
      class: input.risk_class ?? 'low',
      flags: input.risk_flags ?? [],
    },
    meta: {
      contract_version: CONTRACT_VERSION,
      idempotency_key: input.idempotency_key ?? null,
      request_id: input.request_id ?? newRequestId(),
      server_time: new Date().toISOString(),
    },
  };
  return universalResponseSchema.parse(response);
}

export function doError(
  code: string,
  message: string,
  opts?: { retryable?: boolean; details?: Record<string, unknown> },
): DoError {
  return {
    code,
    message,
    retryable: opts?.retryable ?? false,
    details: opts?.details ?? {},
  };
}

export function httpStatusForErrors(errors: DoError[]): number {
  if (errors.length === 0) return 200;
  const code = errors[0]?.code ?? '';
  if (code === 'validation_error') return 400;
  if (code === 'not_found') return 404;
  if (code === 'permit_expired' || code === 'permit_revoked' || code === 'args_hash_mismatch') {
    return 403;
  }
  if (code === 'idempotency_conflict') return 409;
  if (code === 'receipt_before_execute' || code === 'max_uses_exceeded') return 409;
  if (code === 'not_implemented') return 501;
  return 400;
}
