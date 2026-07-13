/**
 * Evidence store — what proves the work happened.
 *
 * Table `os_evidence` (migration 20260722091000), RLS deny-all,
 * service-role only. Evidence records attach to tasks and reference the
 * existing ledgers (agent_action_requests, mana_receipts) rather than
 * replacing them. Fail-soft like every store in this repo.
 */
import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';

export type EvidenceKind =
  | 'draft'
  | 'approval'
  | 'dispatch'
  | 'model_call'
  | 'record_change'
  | 'note';

export type EvidenceInput = {
  tenant: string;
  taskId?: string;
  kind: EvidenceKind;
  summary: string;
  refs?: Record<string, unknown>;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  approvedBy?: string;
};

export type EvidenceRecord = {
  id: string;
  tenant: string;
  taskId: string | null;
  kind: EvidenceKind;
  summary: string;
  refs: Record<string, unknown>;
  approvedBy: string | null;
  createdAt: string;
};

/** Write one evidence record. Returns its id, or null when unavailable. */
export async function addEvidence(input: EvidenceInput): Promise<string | null> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('os_evidence')
      .insert({
        tenant: input.tenant,
        task_id: input.taskId ?? null,
        kind: input.kind,
        summary: input.summary.slice(0, 1000),
        refs: input.refs ?? {},
        before_state: input.beforeState ?? null,
        after_state: input.afterState ?? null,
        approved_by: input.approvedBy ?? null,
      })
      .select('id')
      .single();
    if (error || !data) return null;
    return data.id as string;
  } catch {
    return null;
  }
}

type EvidenceRow = {
  id: string;
  tenant: string;
  task_id: string | null;
  kind: string;
  summary: string;
  refs: Record<string, unknown> | null;
  approved_by: string | null;
  created_at: string;
};

function rowToRecord(row: EvidenceRow): EvidenceRecord {
  return {
    id: row.id,
    tenant: row.tenant,
    taskId: row.task_id,
    kind: row.kind as EvidenceKind,
    summary: row.summary,
    refs: row.refs ?? {},
    approvedBy: row.approved_by,
    createdAt: row.created_at,
  };
}

/** All evidence for one task, oldest first. */
export async function listEvidenceForTask(taskId: string): Promise<EvidenceRecord[]> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('os_evidence')
      .select('id, tenant, task_id, kind, summary, refs, approved_by, created_at')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true })
      .limit(100);
    if (error || !data) return [];
    return (data as EvidenceRow[]).map(rowToRecord);
  } catch {
    return [];
  }
}

/** Recent evidence for a tenant (Proof surface), newest first. */
export async function listRecentEvidence(tenant: string, limit = 20): Promise<EvidenceRecord[]> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('os_evidence')
      .select('id, tenant, task_id, kind, summary, refs, approved_by, created_at')
      .eq('tenant', tenant)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as EvidenceRow[]).map(rowToRecord);
  } catch {
    return [];
  }
}
