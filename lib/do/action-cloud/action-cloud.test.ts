import { beforeEach, describe, expect, it } from 'vitest';

import { argsHash, canonicalizeJson, computeVerifiedActionRate, validateUniversalResponse } from '@/lib/do/action-contract';
import {
  _resetActionCloudStoreForTests,
  executeAction,
  fetchReceipt,
  getActionCloudStore,
  issueReceipt,
  permitAction,
  prepareAction,
  registerWait,
  resolveWait,
  verifyAction,
} from '@/lib/do/action-cloud';

describe('action-contract hash', () => {
  it('canonicalizes with sorted keys', () => {
    expect(canonicalizeJson({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
    expect(argsHash({ b: 1, a: 2 })).toBe(argsHash({ a: 2, b: 1 }));
    expect(argsHash({ message: 'hi' })).toMatch(/^sha256:[a-f0-9]{64}$/);
  });
});

describe('demo.echo lifecycle', () => {
  beforeEach(() => {
    _resetActionCloudStoreForTests();
  });

  async function prepareHappy(idempotency_key?: string) {
    return prepareAction({
      action_name: 'echo',
      namespace: 'demo',
      args: { message: 'kia ora' },
      tenant_id: 'ten_test',
      agent_id: 'agt_test',
      idempotency_key,
    });
  }

  it('rejects hash mismatch on execute', async () => {
    const prep = await prepareHappy();
    expect(prep.ok).toBe(true);
    const permit = await permitAction({ prep_id: prep.prep_id! });
    expect(permit.ok).toBe(true);

    const bad = await executeAction({
      prep_id: prep.prep_id!,
      permit_id: permit.permit_id!,
      args: { message: 'tampered' },
    });
    expect(bad.ok).toBe(false);
    expect(bad.errors[0]?.code).toBe('args_hash_mismatch');
    const validated = validateUniversalResponse(bad);
    expect(validated.ok).toBe(true);
  });

  it('rejects expired permit', async () => {
    const prep = await prepareHappy();
    const permit = await permitAction({ prep_id: prep.prep_id!, ttl_seconds: 30 });
    expect(permit.ok).toBe(true);

    const store = getActionCloudStore();
    const record = await store.getPermit(permit.permit_id!);
    expect(record).toBeTruthy();
    record!.expires_at = new Date(Date.now() - 1000).toISOString();
    await store.savePermit(record!);

    const exec = await executeAction({
      prep_id: prep.prep_id!,
      permit_id: permit.permit_id!,
    });
    expect(exec.ok).toBe(false);
    expect(exec.errors[0]?.code).toBe('permit_expired');
  });

  it('idempotency key returns same action_id', async () => {
    const key = 'idem_lifecycle_same_01';
    const prep1 = await prepareHappy(key);
    const prep2 = await prepareHappy(key);
    expect(prep1.action_id).toBe(prep2.action_id);
    expect(prep1.prep_id).toBe(prep2.prep_id);
    expect((prep2.result as { reused?: boolean }).reused).toBe(true);

    const permit = await permitAction({ prep_id: prep1.prep_id! });
    const exec1 = await executeAction({
      prep_id: prep1.prep_id!,
      permit_id: permit.permit_id!,
      idempotency_key: key,
    });
    expect(exec1.ok).toBe(true);
    const exec2 = await executeAction({
      prep_id: prep1.prep_id!,
      permit_id: permit.permit_id!,
      idempotency_key: key,
    });
    expect(exec2.ok).toBe(true);
    expect(exec2.action_id).toBe(exec1.action_id);
    expect(exec2.result).toEqual(exec1.result);
  });

  it('receipt only after execute', async () => {
    const prep = await prepareHappy('idem_receipt_gate_01');
    const early = await issueReceipt({ action_id: prep.action_id! });
    expect(early.ok).toBe(false);
    expect(early.errors[0]?.code).toBe('receipt_before_execute');

    const permit = await permitAction({ prep_id: prep.prep_id! });
    const exec = await executeAction({
      prep_id: prep.prep_id!,
      permit_id: permit.permit_id!,
    });
    expect(exec.ok).toBe(true);

    const receipt = await issueReceipt({ action_id: prep.action_id! });
    expect(receipt.ok).toBe(true);
    expect(receipt.receipt_id).toMatch(/^rcp_/);

    const fetched = await fetchReceipt({ action_id: prep.action_id! });
    expect(fetched.ok).toBe(true);
    expect(fetched.receipt_id).toBe(receipt.receipt_id);

    const verify = await verifyAction({
      action_id: prep.action_id!,
      checks: ['result_present', 'echo_matches'],
    });
    expect(verify.ok).toBe(true);
    expect(verify.verify?.passed).toBe(true);
  });

  it('wait register and resolve', async () => {
    const prep = await prepareHappy();
    const permit = await permitAction({ prep_id: prep.prep_id! });
    await executeAction({ prep_id: prep.prep_id!, permit_id: permit.permit_id! });

    const wait = await registerWait({
      action_id: prep.action_id!,
      kind: 'external_confirmation',
      timeout_seconds: 60,
    });
    expect(wait.ok).toBe(true);
    expect(wait.status).toBe('waiting');
    expect(wait.wait_id).toMatch(/^wait_/);

    const resolved = await resolveWait({
      wait_id: wait.wait_id!,
      result: { confirmed: true },
    });
    expect(resolved.ok).toBe(true);
    expect((resolved.result as { status: string }).status).toBe('resolved');
  });

  it('computes VAR after verify+receipt', async () => {
    const prep = await prepareHappy('idem_var_01');
    const permit = await permitAction({ prep_id: prep.prep_id! });
    await executeAction({ prep_id: prep.prep_id!, permit_id: permit.permit_id! });
    await verifyAction({ action_id: prep.action_id!, checks: ['result_present'] });
    await issueReceipt({ action_id: prep.action_id! });

    const store = getActionCloudStore();
    const runs = await store.listRuns({ tenantId: 'ten_test' });
    const varResult = computeVerifiedActionRate(
      runs.map((r) => ({
        reached_execute: r.reached_execute,
        verify_passed: Boolean(r.verify?.passed),
        receipt_issued: Boolean(r.receipt_id),
        executed_at: r.executed_at,
        tenant_id: r.tenant_id,
      })),
      { tenantId: 'ten_test', windowDays: 'all' },
    );
    expect(varResult.denominator).toBe(1);
    expect(varResult.numerator).toBe(1);
    expect(varResult.var).toBe(1);
  });
});
