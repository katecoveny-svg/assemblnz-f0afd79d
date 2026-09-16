import {
  DEFAULT_PERMIT_TTL_SECONDS,
  argsHash,
  buildUniversalResponse,
  doError,
  resultDigest,
  type UniversalResponse,
} from '@/lib/do/action-contract';
import {
  demoEchoContract,
  isDemoEcho,
  qualifyActionName,
  runDemoEcho,
} from '@/lib/do/adapters/demo-echo';
import { getActionCloudStore } from './store';
import type {
  ActionReceiptRecord,
  ActionRunRecord,
  PermitRecord,
  StageLogEntry,
  WaitRecord,
} from './types';

function id(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function pushStage(run: ActionRunRecord, entry: StageLogEntry): void {
  run.stage_log = [...run.stage_log, entry];
  run.updated_at = entry.at;
}

function responseFromRun(
  run: ActionRunRecord,
  stage: ActionRunRecord['stage'],
  extras?: Partial<Parameters<typeof buildUniversalResponse>[0]>,
): UniversalResponse {
  return buildUniversalResponse({
    ok: extras?.ok ?? (run.status === 'succeeded' || run.status === 'accepted' || run.status === 'in_progress' || run.status === 'waiting'),
    stage,
    status: extras?.status ?? run.status,
    action_id: run.action_id,
    action_name: qualifyActionName(run.namespace, run.action_name),
    prep_id: run.prep_id,
    permit_id: run.permit_id,
    receipt_id: run.receipt_id,
    wait_id: run.wait_id,
    verify: run.verify,
    result: extras?.result !== undefined ? extras.result : run.result,
    errors: extras?.errors,
    risk_class: run.risk_class,
    idempotency_key: run.idempotency_key,
  });
}

export async function prepareAction(input: {
  action_name: string;
  namespace: string;
  args: Record<string, unknown>;
  idempotency_key?: string;
  tenant_id: string;
  agent_id?: string;
}): Promise<UniversalResponse> {
  const store = getActionCloudStore();
  const qualified = qualifyActionName(input.namespace, input.action_name);

  if (!isDemoEcho(input.action_name, input.namespace)) {
    return buildUniversalResponse({
      ok: false,
      stage: 'prepare',
      status: 'failed',
      action_name: qualified,
      errors: [
        doError('not_found', `Unknown action ${qualified}. Phase 1 supports demo.echo only.`, {
          details: { supported: ['demo.echo'] },
        }),
      ],
      idempotency_key: input.idempotency_key ?? null,
    });
  }

  if (typeof input.args.message !== 'string' || !input.args.message.trim()) {
    return buildUniversalResponse({
      ok: false,
      stage: 'prepare',
      status: 'failed',
      action_name: qualified,
      errors: [
        doError('validation_error', 'demo.echo requires args.message (non-empty string)'),
      ],
      risk_class: 'low',
      idempotency_key: input.idempotency_key ?? null,
    });
  }

  if (input.idempotency_key) {
    const existing = await store.getRunByIdempotency(input.tenant_id, input.idempotency_key);
    if (existing) {
      return responseFromRun(existing, 'prepare', {
        ok: true,
        status: existing.status === 'failed' ? 'failed' : 'accepted',
        result: {
          prep_id: existing.prep_id,
          args_hash: existing.args_hash,
          locked_args: existing.args,
          reused: true,
        },
      });
    }
  }

  const at = nowIso();
  const prep_id = id('prep');
  const action_id = id('act');
  const hash = argsHash(input.args);

  const run: ActionRunRecord = {
    action_id,
    prep_id,
    action_name: 'echo',
    namespace: 'demo',
    tenant_id: input.tenant_id,
    agent_id: input.agent_id ?? null,
    owner_id: null,
    args: input.args,
    args_hash: hash,
    idempotency_key: input.idempotency_key ?? null,
    stage: 'prepare',
    status: 'accepted',
    risk_class: demoEchoContract.action.risk_class,
    result: null,
    verify: null,
    stage_log: [{ stage: 'prepare', at, ok: true }],
    permit_id: null,
    receipt_id: null,
    wait_id: null,
    reached_execute: false,
    executed_at: null,
    created_at: at,
    updated_at: at,
  };

  await store.saveRun(run);

  return responseFromRun(run, 'prepare', {
    ok: true,
    status: 'accepted',
    result: {
      prep_id,
      args_hash: hash,
      locked_args: input.args,
      adapter: 'demo.echo',
    },
  });
}

export async function permitAction(input: {
  prep_id: string;
  scopes?: string[];
  ttl_seconds?: number;
  constraints?: { args_hash?: string; max_uses?: number };
}): Promise<UniversalResponse> {
  const store = getActionCloudStore();
  const run = await store.getRunByPrepId(input.prep_id);
  if (!run) {
    return buildUniversalResponse({
      ok: false,
      stage: 'permit',
      status: 'failed',
      prep_id: input.prep_id,
      errors: [doError('not_found', `Unknown prep_id ${input.prep_id}`)],
    });
  }

  if (input.constraints?.args_hash && input.constraints.args_hash !== run.args_hash) {
    return responseFromRun(run, 'permit', {
      ok: false,
      status: 'failed',
      errors: [
        doError('args_hash_mismatch', 'Permit constraints.args_hash does not match prepared args', {
          details: { expected: run.args_hash, got: input.constraints.args_hash },
        }),
      ],
    });
  }

  const ttl = input.ttl_seconds ?? DEFAULT_PERMIT_TTL_SECONDS;
  const at = nowIso();
  const expires = new Date(Date.now() + ttl * 1000).toISOString();
  const permit_id = id('prm');
  const scopes = input.scopes?.length
    ? input.scopes
    : [...demoEchoContract.permissions.scopes];

  const permit: PermitRecord = {
    permit_id,
    prep_id: run.prep_id,
    action_id: run.action_id,
    tenant_id: run.tenant_id,
    scopes,
    args_hash: run.args_hash,
    max_uses: input.constraints?.max_uses ?? 1,
    uses: 0,
    expires_at: expires,
    revoked_at: null,
    created_at: at,
  };

  await store.savePermit(permit);
  run.permit_id = permit_id;
  run.stage = 'permit';
  run.status = 'accepted';
  pushStage(run, { stage: 'permit', at, ok: true, detail: { expires_at: expires } });
  await store.saveRun(run);

  return responseFromRun(run, 'permit', {
    ok: true,
    status: 'accepted',
    result: {
      permit_id,
      expires_at: expires,
      scopes,
      constraints: {
        args_hash: run.args_hash,
        max_uses: permit.max_uses,
      },
      // Token format TBD — interop with OAuth agent delegation / AuthZEN; opaque id for Phase 1.
      token: { format: 'opaque_permit_id', value: permit_id, note: 'TBD protocol interop' },
    },
  });
}

export async function executeAction(input: {
  permit_id: string;
  prep_id: string;
  idempotency_key?: string;
  args?: Record<string, unknown>;
}): Promise<UniversalResponse> {
  const store = getActionCloudStore();
  const run = await store.getRunByPrepId(input.prep_id);
  if (!run) {
    return buildUniversalResponse({
      ok: false,
      stage: 'execute',
      status: 'failed',
      prep_id: input.prep_id,
      permit_id: input.permit_id,
      errors: [doError('not_found', `Unknown prep_id ${input.prep_id}`)],
    });
  }

  // Idempotency: same key after successful execute returns same action_id/result.
  if (input.idempotency_key) {
    const byKey = await store.getRunByIdempotency(run.tenant_id, input.idempotency_key);
    if (byKey?.reached_execute && byKey.status === 'succeeded') {
      return responseFromRun(byKey, 'execute', { ok: true, status: 'succeeded' });
    }
    // Also honour prepare-time idempotency key on the same run.
    if (
      run.idempotency_key === input.idempotency_key &&
      run.reached_execute &&
      run.status === 'succeeded'
    ) {
      return responseFromRun(run, 'execute', { ok: true, status: 'succeeded' });
    }
  }

  if (run.reached_execute && run.status === 'succeeded' && run.permit_id === input.permit_id) {
    return responseFromRun(run, 'execute', { ok: true, status: 'succeeded' });
  }

  const permit = await store.getPermit(input.permit_id);
  if (!permit || permit.prep_id !== run.prep_id) {
    return responseFromRun(run, 'execute', {
      ok: false,
      status: 'failed',
      errors: [doError('not_found', `Permit ${input.permit_id} not found for this prep`)],
    });
  }

  if (permit.revoked_at) {
    return responseFromRun(run, 'execute', {
      ok: false,
      status: 'failed',
      errors: [doError('permit_revoked', `Permit ${permit.permit_id} was revoked`)],
    });
  }

  if (Date.parse(permit.expires_at) <= Date.now()) {
    return responseFromRun(run, 'execute', {
      ok: false,
      status: 'failed',
      errors: [
        doError('permit_expired', `Permit ${permit.permit_id} expired before execute`, {
          details: { expires_at: permit.expires_at },
        }),
      ],
    });
  }

  if (permit.uses >= permit.max_uses) {
    return responseFromRun(run, 'execute', {
      ok: false,
      status: 'failed',
      errors: [doError('max_uses_exceeded', `Permit ${permit.permit_id} max_uses exceeded`)],
    });
  }

  // Hash mismatch: client-supplied args (if any) must match locked prep args_hash.
  if (input.args !== undefined) {
    const incomingHash = argsHash(input.args);
    if (incomingHash !== run.args_hash || incomingHash !== permit.args_hash) {
      return responseFromRun(run, 'execute', {
        ok: false,
        status: 'failed',
        errors: [
          doError('args_hash_mismatch', 'Execute args do not match prepared args_hash', {
            details: {
              prepared: run.args_hash,
              permit: permit.args_hash,
              incoming: incomingHash,
            },
          }),
        ],
      });
    }
  }

  // Locked args always win — recompute to defend against store tampering in tests.
  const lockedHash = argsHash(run.args);
  if (lockedHash !== run.args_hash || lockedHash !== permit.args_hash) {
    return responseFromRun(run, 'execute', {
      ok: false,
      status: 'failed',
      errors: [
        doError('args_hash_mismatch', 'Prepared args no longer match stored args_hash', {
          details: { prepared: run.args_hash, recomputed: lockedHash },
        }),
      ],
    });
  }

  const at = nowIso();
  const result = runDemoEcho(run.args);

  permit.uses += 1;
  await store.savePermit(permit);

  run.result = result;
  run.stage = 'execute';
  run.status = 'succeeded';
  run.reached_execute = true;
  run.executed_at = at;
  run.permit_id = permit.permit_id;
  if (input.idempotency_key && !run.idempotency_key) {
    run.idempotency_key = input.idempotency_key;
  }
  pushStage(run, { stage: 'execute', at, ok: true });
  await store.saveRun(run);

  return responseFromRun(run, 'execute', {
    ok: true,
    status: 'succeeded',
    result,
  });
}

export async function registerWait(input: {
  action_id: string;
  kind: string;
  timeout_seconds: number;
}): Promise<UniversalResponse> {
  const store = getActionCloudStore();
  const run = await store.getRunByActionId(input.action_id);
  if (!run) {
    return buildUniversalResponse({
      ok: false,
      stage: 'wait',
      status: 'failed',
      action_id: input.action_id,
      errors: [doError('not_found', `Unknown action_id ${input.action_id}`)],
    });
  }

  const at = nowIso();
  const wait_id = id('wait');
  const timeout_at = new Date(Date.now() + input.timeout_seconds * 1000).toISOString();
  const wait: WaitRecord = {
    wait_id,
    action_id: run.action_id,
    tenant_id: run.tenant_id,
    kind: input.kind,
    status: 'pending',
    timeout_at,
    resolved_at: null,
    result: null,
    created_at: at,
  };
  await store.saveWait(wait);

  run.wait_id = wait_id;
  run.stage = 'wait';
  run.status = 'waiting';
  pushStage(run, { stage: 'wait', at, ok: true, detail: { wait_id, kind: input.kind } });
  await store.saveRun(run);

  return responseFromRun(run, 'wait', {
    ok: true,
    status: 'waiting',
    wait_id,
    result: {
      wait_id,
      kind: input.kind,
      timeout_seconds: input.timeout_seconds,
      timeout_at,
      poll_url: `/api/do/action/wait/${wait_id}`,
    },
  });
}

export async function resolveWait(input: {
  wait_id: string;
  result?: unknown;
}): Promise<UniversalResponse> {
  const store = getActionCloudStore();
  const wait = await store.getWait(input.wait_id);
  if (!wait) {
    return buildUniversalResponse({
      ok: false,
      stage: 'wait',
      status: 'failed',
      wait_id: input.wait_id,
      errors: [doError('not_found', `Unknown wait_id ${input.wait_id}`)],
    });
  }

  const run = await store.getRunByActionId(wait.action_id);
  const at = nowIso();

  if (wait.status === 'pending' && Date.parse(wait.timeout_at) <= Date.now()) {
    wait.status = 'timed_out';
    wait.resolved_at = at;
    await store.saveWait(wait);
    if (run) {
      run.status = 'failed';
      pushStage(run, { stage: 'wait', at, ok: false, detail: { reason: 'timed_out' } });
      await store.saveRun(run);
    }
    return buildUniversalResponse({
      ok: false,
      stage: 'wait',
      status: 'failed',
      action_id: wait.action_id,
      wait_id: wait.wait_id,
      errors: [doError('wait_timed_out', `Wait ${wait.wait_id} timed out`)],
      risk_class: run?.risk_class ?? 'low',
    });
  }

  wait.status = 'resolved';
  wait.resolved_at = at;
  wait.result = input.result ?? { resolved: true };
  await store.saveWait(wait);

  if (run) {
    run.status = 'in_progress';
    run.stage = 'wait';
    pushStage(run, { stage: 'wait', at, ok: true, detail: { resolved: true } });
    await store.saveRun(run);
    return responseFromRun(run, 'wait', {
      ok: true,
      status: 'in_progress',
      result: { wait_id: wait.wait_id, status: wait.status, result: wait.result },
    });
  }

  return buildUniversalResponse({
    ok: true,
    stage: 'wait',
    status: 'succeeded',
    action_id: wait.action_id,
    wait_id: wait.wait_id,
    result: { wait_id: wait.wait_id, status: wait.status, result: wait.result },
  });
}

export async function getWait(waitId: string): Promise<UniversalResponse> {
  const store = getActionCloudStore();
  const wait = await store.getWait(waitId);
  if (!wait) {
    return buildUniversalResponse({
      ok: false,
      stage: 'wait',
      status: 'failed',
      wait_id: waitId,
      errors: [doError('not_found', `Unknown wait_id ${waitId}`)],
    });
  }

  // Lazy timeout.
  if (wait.status === 'pending' && Date.parse(wait.timeout_at) <= Date.now()) {
    return resolveWait({ wait_id: waitId });
  }

  const run = await store.getRunByActionId(wait.action_id);
  return buildUniversalResponse({
    ok: true,
    stage: 'wait',
    status: wait.status === 'resolved' ? 'succeeded' : wait.status === 'timed_out' ? 'failed' : 'waiting',
    action_id: wait.action_id,
    action_name: run ? qualifyActionName(run.namespace, run.action_name) : null,
    wait_id: wait.wait_id,
    prep_id: run?.prep_id ?? null,
    permit_id: run?.permit_id ?? null,
    receipt_id: run?.receipt_id ?? null,
    result: wait,
    risk_class: run?.risk_class ?? 'low',
    idempotency_key: run?.idempotency_key ?? null,
  });
}

export async function verifyAction(input: {
  action_id: string;
  checks: string[];
}): Promise<UniversalResponse> {
  const store = getActionCloudStore();
  const run = await store.getRunByActionId(input.action_id);
  if (!run) {
    return buildUniversalResponse({
      ok: false,
      stage: 'verify',
      status: 'failed',
      action_id: input.action_id,
      errors: [doError('not_found', `Unknown action_id ${input.action_id}`)],
    });
  }

  if (!run.reached_execute) {
    return responseFromRun(run, 'verify', {
      ok: false,
      status: 'failed',
      errors: [
        doError('verify_before_execute', 'Verify requires a successful execute first'),
      ],
    });
  }

  const checks = input.checks.length > 0 ? input.checks : ['result_present'];
  const failed: string[] = [];
  for (const check of checks) {
    if (check === 'result_present' && (run.result === null || run.result === undefined)) {
      failed.push(check);
    }
    if (check === 'echo_matches' && run.result && typeof run.result === 'object') {
      const echo = (run.result as { echo?: string }).echo;
      const message = typeof run.args.message === 'string' ? run.args.message : null;
      if (!echo || message === null || echo !== message) failed.push(check);
    }
  }

  const passed = failed.length === 0;
  const at = nowIso();
  run.verify = { passed, checks };
  run.stage = 'verify';
  run.status = passed ? 'succeeded' : 'failed';
  pushStage(run, { stage: 'verify', at, ok: passed, detail: { failed } });
  await store.saveRun(run);

  return responseFromRun(run, 'verify', {
    ok: passed,
    status: passed ? 'succeeded' : 'failed',
    verify: run.verify,
    errors: passed
      ? []
      : [doError('verify_failed', 'One or more verify checks failed', { details: { failed } })],
  });
}

export async function issueReceipt(input: {
  action_id: string;
}): Promise<UniversalResponse> {
  const store = getActionCloudStore();
  const run = await store.getRunByActionId(input.action_id);
  if (!run) {
    return buildUniversalResponse({
      ok: false,
      stage: 'receipt',
      status: 'failed',
      action_id: input.action_id,
      errors: [doError('not_found', `Unknown action_id ${input.action_id}`)],
    });
  }

  if (!run.reached_execute) {
    return responseFromRun(run, 'receipt', {
      ok: false,
      status: 'failed',
      errors: [
        doError('receipt_before_execute', 'Receipt is emitted only after execute (Phase 1 policy)'),
      ],
    });
  }

  const existing = await store.getReceiptByActionId(run.action_id);
  if (existing) {
    return responseFromRun(run, 'receipt', {
      ok: true,
      status: 'succeeded',
      receipt_id: existing.receipt_id,
      result: existing,
    });
  }

  const at = nowIso();
  const receipt_id = id('rcp');
  const receipt: ActionReceiptRecord = {
    receipt_id,
    action_id: run.action_id,
    permit_id: run.permit_id,
    tenant_id: run.tenant_id,
    args_hash: run.args_hash,
    result_digest: resultDigest(run.result),
    stage_log: run.stage_log,
    actor: { agent_id: run.agent_id, tenant_id: run.tenant_id },
    payload: {
      action_name: qualifyActionName(run.namespace, run.action_name),
      result: run.result,
      verify: run.verify,
    },
    created_at: at,
  };

  await store.appendReceipt(receipt);
  run.receipt_id = receipt_id;
  run.stage = 'receipt';
  if (run.status !== 'failed') run.status = 'succeeded';
  pushStage(run, { stage: 'receipt', at, ok: true });
  await store.saveRun(run);

  return responseFromRun(run, 'receipt', {
    ok: true,
    status: 'succeeded',
    receipt_id,
    result: receipt,
  });
}

export async function fetchReceipt(input: {
  action_id?: string;
  receipt_id?: string;
}): Promise<UniversalResponse> {
  const store = getActionCloudStore();
  let receipt: ActionReceiptRecord | null = null;
  if (input.receipt_id) {
    receipt = await store.getReceipt(input.receipt_id);
  } else if (input.action_id) {
    receipt = await store.getReceiptByActionId(input.action_id);
  }

  if (!receipt) {
    return buildUniversalResponse({
      ok: false,
      stage: 'receipt',
      status: 'failed',
      action_id: input.action_id ?? null,
      receipt_id: input.receipt_id ?? null,
      errors: [doError('not_found', 'Receipt not found')],
    });
  }

  const run = await store.getRunByActionId(receipt.action_id);
  return buildUniversalResponse({
    ok: true,
    stage: 'receipt',
    status: 'succeeded',
    action_id: receipt.action_id,
    action_name: run ? qualifyActionName(run.namespace, run.action_name) : null,
    prep_id: run?.prep_id ?? null,
    permit_id: receipt.permit_id,
    receipt_id: receipt.receipt_id,
    result: receipt,
    risk_class: run?.risk_class ?? 'low',
    idempotency_key: run?.idempotency_key ?? null,
  });
}

export async function stubStage(
  stage: 'discover' | 'inspect' | 'quote' | 'undo',
): Promise<UniversalResponse> {
  if (stage === 'discover') {
    return buildUniversalResponse({
      ok: true,
      stage: 'discover',
      status: 'succeeded',
      result: {
        actions: [
          {
            name: 'demo.echo',
            risk_class: 'low',
            adapter: 'demo.echo',
            contract: demoEchoContract,
          },
        ],
        note: 'Phase 1 catalogue — demo.echo only. Not live production Action Cloud.',
      },
    });
  }

  if (stage === 'inspect') {
    return buildUniversalResponse({
      ok: true,
      stage: 'inspect',
      status: 'succeeded',
      action_name: 'demo.echo',
      result: {
        contract: demoEchoContract,
        stages: ['prepare', 'permit', 'execute', 'wait', 'verify', 'receipt'],
      },
    });
  }

  return buildUniversalResponse({
    ok: false,
    stage,
    status: 'failed',
    errors: [
      doError('not_implemented', `${stage} is stubbed in Phase 1`, {
        retryable: false,
        details: { phase: 1 },
      }),
    ],
  });
}
