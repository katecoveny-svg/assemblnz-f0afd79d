import { describe, expect, it, beforeEach } from 'vitest';

import {
  ACTION_STUB_BOUNDARY,
  executeUnderPermit,
  getPrepared,
  hashArgs,
  issuePermit,
  mintReceipt,
  prepareAction,
  resetActionStubStore,
} from './index';

describe('DO action stub lifecycle', () => {
  beforeEach(() => {
    resetActionStubStore();
  });

  it('locks args at prepare and rejects hash mismatch on execute', () => {
    const prepared = prepareAction({
      action_name: 'loyalty.redeem_offer',
      title: 'Redeem loyalty offer',
      args: { offer_id: 'off_demo_1', basket_id: 'bsk_1' },
      idempotency_key: 'idem_hash_test',
      now: '2026-09-16T10:00:00.000Z',
    });
    expect(prepared.args_hash).toBe(hashArgs(prepared.args));
    expect(prepared.mode).toBe('demo_stub');

    const permit = issuePermit({
      prep_id: prepared.prep_id,
      now: '2026-09-16T10:00:00.000Z',
    });

  // Mutate store prep args_hash to simulate tampering after permit issued
  const stored = getPrepared(prepared.prep_id);
  expect(stored).toBeTruthy();
  if (stored) stored.args_hash = 'sha256:tampered';
  expect(() =>
    executeUnderPermit({
      permit_id: permit.permit_id,
      prep_id: prepared.prep_id,
      idempotency_key: 'idem_hash_test_exec',
      now: '2026-09-16T10:01:00.000Z',
    }),
  ).toThrow(/args_hash mismatch/);
  });

  it('runs prepare → permit → execute → receipt as simulated only', () => {
    const prepared = prepareAction({
      action_name: 'commerce.add_to_order',
      title: 'Add basket to order (stub)',
      args: { line_count: 4, total_nzd: 42.5 },
      idempotency_key: 'idem_happy',
      risk_class: 'medium',
      now: '2026-09-16T11:00:00.000Z',
    });
    const permit = issuePermit({
      prep_id: prepared.prep_id,
      ttl_seconds: 900,
      now: '2026-09-16T11:00:00.000Z',
    });
    const executed = executeUnderPermit({
      permit_id: permit.permit_id,
      prep_id: prepared.prep_id,
      idempotency_key: 'idem_happy_exec',
      result: { order_stub_id: 'ord_demo_1' },
      now: '2026-09-16T11:00:30.000Z',
    });
    expect(executed.executionClaimed).toBe(false);
    expect(executed.status).toBe('simulated');

    const receipt = mintReceipt({
      action_id: executed.action_id,
      summary: 'Simulated add-to-order under permit',
      sponsor_report: {
        sponsored: true,
        label: 'Sponsored journey step · demo grocery',
        vertical: 'grocery_loyalty_demo',
      },
      now: '2026-09-16T11:00:31.000Z',
    });
    expect(receipt.boundary).toBe(ACTION_STUB_BOUNDARY);
    expect(receipt.mode).toBe('demo_stub');
    expect(receipt.sponsor_report?.sponsored).toBe(true);
  });

  it('rejects expired permits', () => {
    const prepared = prepareAction({
      action_name: 'loyalty.redeem_offer',
      title: 'Redeem',
      args: { offer_id: 'x' },
      idempotency_key: 'idem_exp',
      now: '2026-09-16T12:00:00.000Z',
    });
    const permit = issuePermit({
      prep_id: prepared.prep_id,
      ttl_seconds: 60,
      now: '2026-09-16T12:00:00.000Z',
    });
    expect(() =>
      executeUnderPermit({
        permit_id: permit.permit_id,
        prep_id: prepared.prep_id,
        idempotency_key: 'idem_exp_exec',
        now: '2026-09-16T12:05:00.000Z',
      }),
    ).toThrow(/expired/i);
  });
});
