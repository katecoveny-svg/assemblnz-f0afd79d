import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auditBeforeSend } from '../audit-before-send';
import { makeCtx } from './test-helpers';

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

function buildSupabaseMock(result: { data: unknown; error: unknown }) {
  const builder = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(result),
  };
  return {
    client: { from: vi.fn().mockReturnValue(builder) },
    builder,
  };
}

describe('audit_before_send', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('writes the audit row and returns the inserted id', async () => {
    const { client, builder } = buildSupabaseMock({
      data: { id: 'audit-row-uuid' },
      error: null,
    });
    const { createClient } = await import('@/lib/supabase/server');
    (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(client);

    const ctx = makeCtx({
      draftBody: 'Tēnā koe — pickup at 3pm sounds good.',
    });
    const r = await auditBeforeSend.run(ctx);

    expect(r.pass).toBe(true);
    expect(r.receiptAddition).toMatchObject({
      audit_log_id: 'audit-row-uuid',
      audit_before: { status: 'written', id: 'audit-row-uuid' },
    });
    expect(client.from).toHaveBeenCalledWith('assembl_audit_log');
    expect(builder.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'toro.send_approved',
        agent_slug: 'toro',
        tenant_id: ctx.tenantId,
        tool_input: expect.objectContaining({
          incoming_message: ctx.incomingMessage,
          draft_body: ctx.draftBody,
          conversation_id: ctx.conversationId,
        }),
      }),
    );
  });

  it('blocks the pipeline when the audit insert fails', async () => {
    const { client } = buildSupabaseMock({
      data: null,
      error: { message: 'permission denied for table assembl_audit_log' },
    });
    const { createClient } = await import('@/lib/supabase/server');
    (createClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(client);

    const ctx = makeCtx({ draftBody: 'attempt' });
    const r = await auditBeforeSend.run(ctx);

    expect(r.pass).toBe(false);
    expect(r.reason).toMatch(/audit_before_send/);
    expect(r.receiptAddition).toMatchObject({
      audit_before: { status: 'failed' },
    });
  });
});
