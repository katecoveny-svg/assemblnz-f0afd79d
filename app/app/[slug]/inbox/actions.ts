'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { agentBySlug } from '@/lib/agents';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';
import {
  buildApproveUpdate,
  buildAuditLogRow,
  buildDeferUpdate,
  buildEditUpdate,
  buildNeedsVoiceUpdate,
  buildRejectUpdate,
  buildSendToLedgerUpdate,
  buildTransitionRow,
  nextDeferWindow,
  type DraftAction,
  type DraftActionContext,
  type DraftStatusUpdate,
  type InboxDraftActionMetadata,
} from './action-model';

type Tenant = {
  id: string;
  name: string;
  slug: string;
};

type DraftRow = {
  id: string;
  tenant_id: string;
  status: string;
  draft_body: string;
  contact_identifier: string | null;
  contact_name: string | null;
  created_by_agent: string;
  source_metadata: InboxDraftActionMetadata | null;
};

export type InboxActionResult = {
  ok: boolean;
  message: string;
};

export async function approveDraftAction(
  slug: string,
  draftId: string,
): Promise<InboxActionResult> {
  return mutateDraft(slug, draftId, 'approve', async ({ context, draft, now }) => {
    const update = buildApproveUpdate(context, now);
    const sendResult = await sendApprovedDraft(draft);

    if (!sendResult.ok) {
      update.send_error = sendResult.message;
    }

    return {
      update,
      transitionTo: 'approved',
      transitionReason: sendResult.ok ? 'approved_and_send_queued' : 'approved_send_failed',
      auditResponse: sendResult.ok
        ? 'Draft approved and send queued.'
        : `Draft approved; send failed: ${sendResult.message}`,
      auditError: sendResult.ok ? null : sendResult.message,
    };
  });
}

export async function approveSelectedAction(
  slug: string,
  draftIds: string[],
): Promise<InboxActionResult> {
  const ids = uniqueIds(draftIds);
  if (ids.length === 0) return { ok: false, message: 'Select at least one draft.' };

  const results = await Promise.all(ids.map((id) => approveDraftAction(slug, id)));
  const approved = results.filter((result) => result.ok).length;
  return {
    ok: approved > 0,
    message: `${approved}/${ids.length} drafts approved.`,
  };
}

export async function saveDraftRevisionAction(
  slug: string,
  draftId: string,
  body: string,
): Promise<InboxActionResult> {
  const trimmed = body.trim();
  if (trimmed.length < 2) {
    return { ok: false, message: 'Draft body cannot be empty.' };
  }
  if (trimmed.length > 6000) {
    return { ok: false, message: 'Draft body is too long for this review surface.' };
  }

  return mutateDraft(slug, draftId, 'edit', async ({ context, now }) => ({
    update: buildEditUpdate(context, trimmed, now),
    transitionTo: 'reviewing',
    transitionReason: 'operator_edited_draft',
    auditResponse: 'Draft revision saved for review.',
  }));
}

export async function rejectDraftAction(
  slug: string,
  draftId: string,
  reason: string,
): Promise<InboxActionResult> {
  const trimmed = reason.trim();
  if (trimmed.length < 2) {
    return { ok: false, message: 'Add a short rejection reason.' };
  }

  return mutateDraft(slug, draftId, 'reject', async ({ context, now }) => ({
    update: buildRejectUpdate(context, trimmed, now),
    transitionTo: 'rejected',
    transitionReason: trimmed,
    auditResponse: 'Draft rejected with operator reason.',
  }));
}

export async function deferDraftAction(
  slug: string,
  draftId: string,
): Promise<InboxActionResult> {
  return mutateDraft(slug, draftId, 'defer', async ({ context, now }) => ({
    update: buildDeferUpdate(context, nextDeferWindow(new Date(now)), now),
    transitionTo: context.fromState,
    transitionReason: 'operator_deferred_until_next_briefing',
    auditResponse: 'Draft deferred to the next briefing window.',
  }));
}

export async function markNeedsVoiceAction(
  slug: string,
  draftIds: string[],
): Promise<InboxActionResult> {
  const ids = uniqueIds(draftIds);
  if (ids.length === 0) return { ok: false, message: 'Select at least one draft.' };

  const results = await Promise.all(
    ids.map((draftId) =>
      mutateDraft(slug, draftId, 'needs_voice', async ({ context, now }) => ({
        update: buildNeedsVoiceUpdate(context, now),
        transitionTo: context.fromState,
        transitionReason: 'operator_marked_needs_voice',
        auditResponse: 'Draft marked as needing operator voice.',
      })),
    ),
  );
  const updated = results.filter((result) => result.ok).length;
  return { ok: updated > 0, message: `${updated}/${ids.length} drafts marked.` };
}

export async function sendToLedgerAction(
  slug: string,
  draftIds: string[],
): Promise<InboxActionResult> {
  const ids = uniqueIds(draftIds);
  if (ids.length === 0) return { ok: false, message: 'Select at least one draft.' };

  const results = await Promise.all(
    ids.map((draftId) =>
      mutateDraft(slug, draftId, 'send_to_ledger', async ({ context, now }) => ({
        update: buildSendToLedgerUpdate(context, now),
        transitionTo: context.fromState,
        transitionReason: 'operator_sent_to_ledger_queue',
        auditResponse: 'Draft flagged for ledger follow-up.',
      })),
    ),
  );
  const updated = results.filter((result) => result.ok).length;
  return { ok: updated > 0, message: `${updated}/${ids.length} drafts sent to ledger.` };
}

async function mutateDraft(
  slug: string,
  draftId: string,
  action: DraftAction,
  build: (input: {
    tenant: Tenant;
    draft: DraftRow;
    context: DraftActionContext;
    now: string;
  }) => Promise<{
    update: DraftStatusUpdate;
    transitionTo: string;
    transitionReason: string;
    auditResponse: string;
    auditError?: string | null;
  }>,
): Promise<InboxActionResult> {
  const { tenant, userId, service } = await requireTenantAccess(slug);
  const { data: draft } = await service
    .from('toro_drafts')
    .select('id,tenant_id,status,draft_body,contact_identifier,contact_name,created_by_agent,source_metadata')
    .eq('id', draftId)
    .eq('tenant_id', tenant.id)
    .maybeSingle();

  if (!draft) return { ok: false, message: 'Draft not found.' };

  const currentDraft = draft as DraftRow;
  const agent = agentBySlug(currentDraft.created_by_agent.toLowerCase());
  const now = new Date().toISOString();
  const context: DraftActionContext = {
    draftId: currentDraft.id,
    tenantId: tenant.id,
    userId,
    agentCode: currentDraft.created_by_agent,
    agentName: agent?.name ?? currentDraft.created_by_agent,
    fromState: currentDraft.status,
    metadata: currentDraft.source_metadata ?? {},
  };

  const result = await build({ tenant, draft: currentDraft, context, now });
  const { error: updateError } = await service
    .from('toro_drafts')
    .update(result.update)
    .eq('id', currentDraft.id)
    .eq('tenant_id', tenant.id);

  if (updateError) {
    await writeAuditLog(context, action, `Draft update failed: ${updateError.message}`, updateError.message);
    return { ok: false, message: updateError.message };
  }

  await service.from('toro_draft_transitions').insert(
    buildTransitionRow({
      context,
      toState: result.transitionTo,
      reason: result.transitionReason,
      now,
      metadata: {
        action,
      },
    }),
  );

  await writeAuditLog(context, action, result.auditResponse, result.auditError);
  revalidatePath(`/app/${slug}/inbox`);
  return { ok: !result.auditError, message: result.auditResponse };
}

async function requireTenantAccess(slug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=${encodeURIComponent(`/app/${slug}/inbox`)}`);

  const service = getServiceClient();
  const { data: tenant } = await service
    .from('tenants')
    .select('id,name,slug')
    .eq('slug', slug)
    .maybeSingle();

  if (!tenant) throw new Error('Tenant not found.');

  const [{ data: member }, { data: admin }] = await Promise.all([
    service
      .from('tenant_members')
      .select('role')
      .eq('tenant_id', tenant.id)
      .eq('user_id', user.id)
      .maybeSingle(),
    service.from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle(),
  ]);

  if (!member && !admin) throw new Error('You do not have access to this tenant.');

  return {
    tenant: tenant as Tenant,
    userId: user.id,
    service,
  };
}

async function writeAuditLog(
  context: DraftActionContext,
  action: DraftAction,
  response: string,
  error?: string | null,
) {
  const service = getServiceClient();
  await service.from('audit_log').insert(
    buildAuditLogRow({
      context,
      action,
      response,
      error,
    }),
  );
}

async function sendApprovedDraft(draft: DraftRow): Promise<{ ok: boolean; message: string }> {
  const recipient = draft.contact_identifier?.trim();
  if (!recipient) {
    return { ok: true, message: 'No recipient on draft; approval recorded only.' };
  }

  if (recipient.includes('@')) {
    const service = getServiceClient();
    const { error } = await service.rpc('enqueue_email', {
      queue_name: 'transactional',
      payload: {
        to: recipient,
        subject: draft.source_metadata?.subject ?? draft.source_metadata?.title ?? 'A message from Assembl',
        html: draft.draft_body.replace(/\n/g, '<br />'),
        text: draft.draft_body,
        metadata: {
          draft_id: draft.id,
          tenant_id: draft.tenant_id,
          source: 'operator-inbox',
        },
      },
    });

    if (error) return { ok: false, message: error.message };
    return { ok: true, message: 'Email queued.' };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return { ok: false, message: 'Missing Supabase function configuration.' };
  }

  try {
    const response = await fetch(`${url}/functions/v1/tnz-send`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        channel: 'sms',
        to: recipient,
        message: draft.draft_body,
        agentId: draft.created_by_agent,
      }),
    });

    if (!response.ok) {
      return { ok: false, message: `tnz-send returned ${response.status}` };
    }
    return { ok: true, message: 'SMS queued.' };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Unknown send failure.',
    };
  }
}

function uniqueIds(ids: string[]) {
  return [...new Set(ids.filter((id) => typeof id === 'string' && id.length > 0))];
}
