import type { DraftState } from '@/lib/toro/state-machine-types';

export type DraftAction =
  | 'approve'
  | 'edit'
  | 'reject'
  | 'defer'
  | 'needs_voice'
  | 'send_to_ledger';

export type InboxDraftActionMetadata = {
  title?: string;
  subject?: string;
  phase?: string;
  citations?: string[];
  sources?: string[];
  legislation?: string[];
  needs_operator_voice?: boolean;
  deferred_until?: string;
  ledger_ready?: boolean;
  reject_reason?: string;
  revisions?: DraftRevision[];
  reasoning_trace_id?: string;
  [key: string]: unknown;
};

export type DraftRevision = {
  body: string;
  edited_by: string;
  edited_at: string;
};

export type DraftActionContext = {
  draftId: string;
  tenantId: string;
  userId: string;
  agentCode: string;
  agentName: string;
  fromState: string;
  metadata?: InboxDraftActionMetadata | null;
};

export type DraftStatusUpdate = {
  status?: DraftState;
  reviewer_user_id?: string;
  reviewed_at?: string;
  draft_body?: string;
  send_error?: string | null;
  sent_at?: string | null;
  source_metadata?: InboxDraftActionMetadata;
};

export function buildApproveUpdate(
  context: DraftActionContext,
  now: string,
): DraftStatusUpdate {
  return {
    status: 'approved',
    reviewer_user_id: context.userId,
    reviewed_at: now,
    send_error: null,
    source_metadata: mergeDraftMetadata(context.metadata, {
      last_operator_action: 'approve',
      last_operator_action_at: now,
    }),
  };
}

export function buildEditUpdate(
  context: DraftActionContext,
  nextBody: string,
  now: string,
): DraftStatusUpdate {
  const previous = context.metadata ?? {};
  const revisions = [...(previous.revisions ?? [])];
  revisions.push({
    body: nextBody.trim(),
    edited_by: context.userId,
    edited_at: now,
  });

  return {
    status: 'reviewing',
    reviewer_user_id: context.userId,
    reviewed_at: now,
    draft_body: nextBody.trim(),
    source_metadata: mergeDraftMetadata(previous, {
      revisions,
      last_operator_action: 'edit',
      last_operator_action_at: now,
    }),
  };
}

export function buildRejectUpdate(
  context: DraftActionContext,
  reason: string,
  now: string,
): DraftStatusUpdate {
  return {
    status: 'rejected',
    reviewer_user_id: context.userId,
    reviewed_at: now,
    source_metadata: mergeDraftMetadata(context.metadata, {
      reject_reason: reason.trim(),
      last_operator_action: 'reject',
      last_operator_action_at: now,
    }),
  };
}

export function buildDeferUpdate(
  context: DraftActionContext,
  deferredUntil: string,
  now: string,
): DraftStatusUpdate {
  return {
    source_metadata: mergeDraftMetadata(context.metadata, {
      deferred_until: deferredUntil,
      last_operator_action: 'defer',
      last_operator_action_at: now,
    }),
  };
}

export function buildNeedsVoiceUpdate(
  context: DraftActionContext,
  now: string,
): DraftStatusUpdate {
  return {
    source_metadata: mergeDraftMetadata(context.metadata, {
      needs_operator_voice: true,
      last_operator_action: 'needs_voice',
      last_operator_action_at: now,
    }),
  };
}

export function buildSendToLedgerUpdate(
  context: DraftActionContext,
  now: string,
): DraftStatusUpdate {
  return {
    source_metadata: mergeDraftMetadata(context.metadata, {
      ledger_ready: true,
      last_operator_action: 'send_to_ledger',
      last_operator_action_at: now,
    }),
  };
}

export function mergeDraftMetadata(
  metadata: InboxDraftActionMetadata | null | undefined,
  patch: InboxDraftActionMetadata,
): InboxDraftActionMetadata {
  return {
    ...(metadata ?? {}),
    ...patch,
  };
}

export function buildTransitionRow({
  context,
  toState,
  reason,
  now,
  metadata,
}: {
  context: DraftActionContext;
  toState: string;
  reason: string;
  now: string;
  metadata?: Record<string, unknown>;
}) {
  return {
    draft_id: context.draftId,
    tenant_id: context.tenantId,
    from_state: context.fromState,
    to_state: toState,
    transitioned_by: context.userId,
    transitioned_at: now,
    reason,
    metadata: {
      reasoning_trace_id: context.metadata?.reasoning_trace_id ?? null,
      ...(metadata ?? {}),
    },
  };
}

export function buildAuditLogRow({
  context,
  action,
  response,
  error,
}: {
  context: DraftActionContext;
  action: DraftAction;
  response: string;
  error?: string | null;
}) {
  const reasoningTrace = context.metadata?.reasoning_trace_id ?? 'none';

  return {
    user_id: context.userId,
    tenant_id: context.tenantId,
    agent_code: context.agentCode,
    agent_name: context.agentName,
    pack_id: 'industry-pack',
    model_used: 'operator-inbox',
    input_tokens: 0,
    output_tokens: 0,
    total_tokens: 0,
    cost_nzd: 0,
    compliance_passed: !error,
    data_classification: 'CONFIDENTIAL',
    pii_detected: false,
    pii_masked: false,
    policies_checked: ['operator_inbox_review'],
    request_summary: `operator_inbox.${action} draft=${context.draftId} reasoning_trace=${reasoningTrace}`,
    response_summary: response,
    error_message: error ?? null,
    duration_ms: 0,
  };
}

export function nextDeferWindow(now = new Date()) {
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setHours(6, 0, 0, 0);
  return next.toISOString();
}
