/**
 * audit.before_send — write the audit-log row that anchors the
 * Mana Receipt's `audit_log_id` field.
 *
 * Phase: before_send. Fires after a tenant member has approved the
 * draft and immediately before the Chatwoot API call. We capture
 * the input/output shape that was approved so the receipt can be
 * regenerated against the immutable audit row.
 *
 * Returns the inserted audit row's id as a `receiptAddition` keyed
 * `audit_log_id` so downstream Mana Receipt assembly can reference
 * it (canon §7.5; Mana Receipts spec, audit_log_id FK).
 *
 * Hard rule: this filter never modifies the draft. If the audit
 * write fails, returns pass=false with the DB error in `reason`
 * — the canon's "no draft sends without audit" gate.
 */
import type { Filter, FilterContext, FilterResult } from './types';
import { createClient } from '@/lib/supabase/server';

export const auditBeforeSend: Filter = {
  name: 'audit_before_send',
  phase: 'before_send',
  async run(ctx: FilterContext): Promise<FilterResult> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('assembl_audit_log')
      .insert({
        tenant_id: ctx.tenantId,
        agent_slug: ctx.pluginSlug,
        subagent_slug: ctx.skillSlug ?? null,
        action: 'toro.send_approved',
        tool_input: {
          incoming_message: ctx.incomingMessage,
          draft_body: ctx.draftBody ?? null,
          conversation_id: ctx.conversationId,
        },
        tool_output: { status: 'pending' },
      })
      .select('id')
      .single();

    if (error || !data) {
      return {
        pass: false,
        reason: `audit_before_send: db insert failed — ${error?.message ?? 'no data returned'}`,
        receiptAddition: { audit_before: { status: 'failed', error: error?.message ?? null } },
      };
    }

    const auditLogId = (data as { id: string }).id;
    return {
      pass: true,
      receiptAddition: {
        audit_log_id: auditLogId,
        audit_before: { status: 'written', id: auditLogId },
      },
    };
  },
};
