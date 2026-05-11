/**
 * Audit-log writer used by the manual-capture flow + the Stripe webhook.
 *
 * Best-effort: if assembl_audit_log hasn't been deployed yet on the
 * target environment (Day 7 not landed), we log a console warning and
 * return null instead of throwing. Production environments will always
 * have the table; this graceful degradation exists so dev branches and
 * fresh Supabase projects don't trip on the audit gate.
 */
import 'server-only';
import { createServiceClient } from './supabase-service';

export interface WriteAuditRowInput {
  tenantId: string;
  action: string;
  userId?: string;
  agent_slug?: string;
  subagent_slug?: string;
  tool_input?: Record<string, unknown>;
  tool_output?: Record<string, unknown>;
}

export async function writeAuditRow(
  input: WriteAuditRowInput,
): Promise<string | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('assembl_audit_log')
    .insert({
      tenant_id: input.tenantId,
      agent_slug: input.agent_slug ?? 'toro',
      subagent_slug: input.subagent_slug ?? null,
      action: input.action,
      user_id: input.userId ?? null,
      tool_input: input.tool_input ?? {},
      tool_output: input.tool_output ?? {},
    })
    .select('id')
    .single();

  if (error || !data) {
    if (isMissingTable(error)) {
      // eslint-disable-next-line no-console
      console.warn(
        `writeAuditRow: assembl_audit_log table not present — action ${input.action} not recorded`,
      );
      return null;
    }
    // eslint-disable-next-line no-console
    console.error(`writeAuditRow: ${error?.message ?? 'unknown error'}`);
    return null;
  }

  return (data as { id: string }).id;
}

function isMissingTable(error: { code?: string; message?: string } | null | undefined): boolean {
  if (!error) return false;
  if (error.code === '42P01') return true;
  const m = (error.message ?? '').toLowerCase();
  return m.includes('does not exist') || m.includes('could not find the table');
}
