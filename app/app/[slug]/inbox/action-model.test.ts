import { describe, expect, it } from 'vitest';
import {
  buildApproveUpdate,
  buildAuditLogRow,
  buildEditUpdate,
  buildRejectUpdate,
  buildTransitionRow,
  nextDeferWindow,
  type DraftActionContext,
} from './action-model';

const context: DraftActionContext = {
  draftId: 'draft-1',
  tenantId: 'tenant-1',
  userId: 'user-1',
  agentCode: 'ledger',
  agentName: 'Ledger',
  fromState: 'pending_approval',
  metadata: {
    title: 'Invoice follow-up',
    phase: 'ledger',
    reasoning_trace_id: 'trace-123',
  },
};

describe('operator inbox approval flow model', () => {
  it('builds an approval status patch and transition with reasoning trace metadata', () => {
    const now = '2026-05-15T18:00:00.000Z';
    const update = buildApproveUpdate(context, now);
    const transition = buildTransitionRow({
      context,
      toState: 'approved',
      reason: 'approved_and_send_queued',
      now,
    });

    expect(update).toMatchObject({
      status: 'approved',
      reviewer_user_id: 'user-1',
      reviewed_at: now,
      send_error: null,
    });
    expect(update.source_metadata).toMatchObject({
      title: 'Invoice follow-up',
      last_operator_action: 'approve',
    });
    expect(transition).toMatchObject({
      draft_id: 'draft-1',
      tenant_id: 'tenant-1',
      from_state: 'pending_approval',
      to_state: 'approved',
    });
    expect(transition.metadata).toMatchObject({ reasoning_trace_id: 'trace-123' });
  });

  it('writes audit rows against audit_log with the reasoning trace reference', () => {
    const row = buildAuditLogRow({
      context,
      action: 'approve',
      response: 'Draft approved and send queued.',
    });

    expect(row).toMatchObject({
      user_id: 'user-1',
      tenant_id: 'tenant-1',
      agent_code: 'ledger',
      agent_name: 'Ledger',
      pack_id: 'industry-pack',
      model_used: 'operator-inbox',
      compliance_passed: true,
    });
    expect(row.request_summary).toContain('reasoning_trace=trace-123');
  });

  it('preserves prior metadata when saving revisions and reject reasons', () => {
    const now = '2026-05-15T18:05:00.000Z';
    const edit = buildEditUpdate(context, 'Updated draft body', now);
    const reject = buildRejectUpdate(context, 'Wrong customer', now);

    expect(edit.status).toBe('reviewing');
    expect(edit.source_metadata?.revisions).toEqual([
      {
        body: 'Updated draft body',
        edited_by: 'user-1',
        edited_at: now,
      },
    ]);
    expect(edit.source_metadata?.reasoning_trace_id).toBe('trace-123');
    expect(reject.status).toBe('rejected');
    expect(reject.source_metadata).toMatchObject({
      reject_reason: 'Wrong customer',
      title: 'Invoice follow-up',
    });
  });

  it('defers to the next 6am review window', () => {
    const deferredUntil = new Date(nextDeferWindow(new Date(2026, 4, 15, 8, 15)));
    expect(deferredUntil.getDate()).toBe(16);
    expect(deferredUntil.getHours()).toBe(6);
    expect(deferredUntil.getMinutes()).toBe(0);
  });
});
