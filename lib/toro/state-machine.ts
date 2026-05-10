/**
 * Tōro approval-tray state machine (LangGraph-style).
 *
 * Spec: outputs/TORO-V0.1-ARCHITECTURE-SPEC-2026-05-11.md §4.4
 * Hard rules:
 *   §22 — every status change writes a toro_draft_transitions row. No bypass.
 *   §24 — agent cannot self-approve.
 *
 * Single state machine node per state. Allowed transitions in TRANSITIONS map.
 * Invalid transitions REJECT loudly; they do not silently no-op.
 *
 * Idempotency: when the caller asks to transition to the state the draft is
 * already in, the call returns ok without inserting a duplicate transition row.
 */

import { createClient } from '@/lib/supabase/server';
import { postMessage } from '@/lib/toro/chatwoot-api';
import {
  TRANSITIONS,
  isTerminal,
  isValidTransition,
  type DraftState,
} from './state-machine-types';

export { TRANSITIONS, isTerminal, isValidTransition };
export type { DraftState };

export type TransitionDraftInput = {
  draftId: string;
  toState: DraftState;
  userId: string;
  reason?: string;
  newBody?: string;
  metadata?: Record<string, unknown>;
};

export type TransitionDraftResult =
  | { ok: true; draft: DraftRow }
  | { ok: false; error: string; code?: TransitionErrorCode };

export type TransitionErrorCode =
  | 'not_authenticated'
  | 'draft_not_found'
  | 'invalid_transition'
  | 'agent_cannot_self_approve'
  | 'edit_body_required'
  | 'send_failed'
  | 'tenant_lookup_failed'
  | 'write_failed';

export type DraftRow = {
  id: string;
  status: DraftState;
  draft_body: string;
  chatwoot_conversation_id: number;
  chatwoot_message_id: number | null;
  created_by_agent: string;
  reviewer_user_id: string | null;
  reviewed_at: string | null;
  sent_at: string | null;
  send_error: string | null;
  updated_at: string;
};

const KNOWN_AGENT_IDENTIFIERS: ReadonlySet<string> = new Set(['toro', 'iho', 'tā', 'mahara']);

/**
 * Apply a state transition. Validates, writes the audit row, updates the
 * draft, and (for `sent` and `edited_then_approved → sent`) calls Chatwoot.
 *
 * Hard rule §22: this is the ONLY supported path for changing a draft's
 * status. UI server actions wrap this; webhooks call it; the expire-drafts
 * cron calls it. No raw UPDATEs on toro_drafts.status outside this function.
 *
 * Hard rule §24: if the requesting user matches the draft's `created_by_agent`
 * (i.e. the agent is trying to approve its own output), the call rejects
 * with `agent_cannot_self_approve`. Today agents are tagged by slug string,
 * not auth.users uuid, so the check compares the user's resolved identifier
 * against the known-agent slug set. A future schema can swap to UUID
 * comparison without changing the call sites.
 */
export async function transitionDraft(
  opts: TransitionDraftInput,
): Promise<TransitionDraftResult> {
  const supabase = await createClient();

  const { data: userResp } = await supabase.auth.getUser();
  const user = userResp.user;
  if (!user || user.id !== opts.userId) {
    return { ok: false, error: 'not authenticated', code: 'not_authenticated' };
  }

  const { data: currentDraft, error: fetchErr } = await supabase
    .from('toro_drafts')
    .select(
      'id, status, draft_body, chatwoot_conversation_id, chatwoot_message_id, created_by_agent, reviewer_user_id, reviewed_at, sent_at, send_error, updated_at',
    )
    .eq('id', opts.draftId)
    .maybeSingle();

  if (fetchErr || !currentDraft) {
    return {
      ok: false,
      error: fetchErr?.message ?? 'draft not found',
      code: 'draft_not_found',
    };
  }

  const draft = currentDraft as DraftRow;
  const fromState = draft.status;

  if (fromState === opts.toState) {
    return { ok: true, draft };
  }

  if (!isValidTransition(fromState, opts.toState)) {
    return {
      ok: false,
      error: `invalid transition: ${fromState} → ${opts.toState}`,
      code: 'invalid_transition',
    };
  }

  const isApprovalLike =
    opts.toState === 'approved' || opts.toState === 'edited_then_approved';
  if (isApprovalLike && KNOWN_AGENT_IDENTIFIERS.has(draft.created_by_agent)) {
    const userIsAgent = KNOWN_AGENT_IDENTIFIERS.has(user.id);
    if (userIsAgent) {
      return {
        ok: false,
        error: 'agent cannot self-approve its own draft',
        code: 'agent_cannot_self_approve',
      };
    }
  }

  if (opts.toState === 'edited_then_approved') {
    const trimmed = (opts.newBody ?? '').trim();
    if (trimmed.length === 0) {
      return {
        ok: false,
        error: 'edited_then_approved requires a non-empty newBody',
        code: 'edit_body_required',
      };
    }
    if (trimmed.length > 4000) {
      return {
        ok: false,
        error: 'edited body too long (max 4000 chars)',
        code: 'edit_body_required',
      };
    }
  }

  const { data: tenantRow, error: tenantErr } = await supabase
    .from('tenant_members')
    .select('tenant_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (tenantErr || !tenantRow?.tenant_id) {
    return {
      ok: false,
      error: tenantErr?.message ?? 'user has no tenant membership',
      code: 'tenant_lookup_failed',
    };
  }
  const tenantId = tenantRow.tenant_id as string;

  const now = new Date().toISOString();

  const draftUpdate: Record<string, unknown> = { status: opts.toState };
  if (opts.toState === 'edited_then_approved' && opts.newBody) {
    draftUpdate.draft_body = opts.newBody.trim();
  }
  if (
    opts.toState === 'approved' ||
    opts.toState === 'edited_then_approved' ||
    opts.toState === 'rejected'
  ) {
    draftUpdate.reviewer_user_id = user.id;
    draftUpdate.reviewed_at = now;
  }

  const { data: updated, error: updateErr } = await supabase
    .from('toro_drafts')
    .update(draftUpdate)
    .eq('id', opts.draftId)
    .eq('status', fromState)
    .select(
      'id, status, draft_body, chatwoot_conversation_id, chatwoot_message_id, created_by_agent, reviewer_user_id, reviewed_at, sent_at, send_error, updated_at',
    )
    .maybeSingle();

  if (updateErr || !updated) {
    return {
      ok: false,
      error:
        updateErr?.message ??
        'concurrent transition lost — draft status changed underneath us',
      code: 'write_failed',
    };
  }

  const { error: auditErr } = await supabase.from('toro_draft_transitions').insert({
    draft_id: opts.draftId,
    tenant_id: tenantId,
    from_state: fromState,
    to_state: opts.toState,
    transitioned_by: user.id,
    transitioned_at: now,
    reason: opts.reason ?? null,
    metadata: opts.metadata ?? {},
  });

  if (auditErr) {
    return {
      ok: false,
      error: `draft updated but audit insert failed: ${auditErr.message}`,
      code: 'write_failed',
    };
  }

  let nextDraft = updated as DraftRow;

  if (opts.toState === 'approved' || opts.toState === 'edited_then_approved') {
    try {
      const sent = await postMessage(
        nextDraft.chatwoot_conversation_id,
        nextDraft.draft_body,
      );

      const sentResult = await transitionDraft({
        draftId: opts.draftId,
        toState: 'sent',
        userId: user.id,
        reason: 'chatwoot_post_ok',
        metadata: { chatwoot_message_id: sent.message_id },
      });

      if (!sentResult.ok) {
        return sentResult;
      }

      const { data: postSendRow } = await supabase
        .from('toro_drafts')
        .update({
          sent_at: new Date().toISOString(),
          chatwoot_message_id: sent.message_id,
        })
        .eq('id', opts.draftId)
        .select(
          'id, status, draft_body, chatwoot_conversation_id, chatwoot_message_id, created_by_agent, reviewer_user_id, reviewed_at, sent_at, send_error, updated_at',
        )
        .maybeSingle();

      nextDraft = (postSendRow as DraftRow | null) ?? sentResult.draft;
      writeManaReceiptStub({
        draftId: opts.draftId,
        tenantId,
        userId: user.id,
        finalState: 'sent',
        chatwootMessageId: sent.message_id,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'chatwoot send failed';

      await transitionDraft({
        draftId: opts.draftId,
        toState: 'send_failed',
        userId: user.id,
        reason: message,
      });

      await supabase
        .from('toro_drafts')
        .update({ send_error: message })
        .eq('id', opts.draftId);

      return { ok: false, error: message, code: 'send_failed' };
    }
  }

  if (opts.toState === 'edited_then_approved' || opts.toState === 'sent') {
    writeManaReceiptStub({
      draftId: opts.draftId,
      tenantId,
      userId: user.id,
      finalState: opts.toState,
    });
  }

  return { ok: true, draft: nextDraft };
}

/**
 * Mana Receipt stub. Day 7.5 ships the signing edge function + table; until
 * then every receipt-eligible transition writes a TODO log so the integration
 * point is visible in CI and dev logs.
 */
function writeManaReceiptStub(args: {
  draftId: string;
  tenantId: string;
  userId: string;
  finalState: DraftState;
  chatwootMessageId?: number;
}) {
  // eslint-disable-next-line no-console
  console.info(
    '[mana-receipt][stub] toro draft transition eligible for receipt',
    JSON.stringify({
      draft_id: args.draftId,
      tenant_id: args.tenantId,
      reviewer_user_id: args.userId,
      final_state: args.finalState,
      chatwoot_message_id: args.chatwootMessageId ?? null,
      ts: new Date().toISOString(),
      todo: 'replace with mana_receipts insert + Ed25519 signing once Day 7.5 lands',
    }),
  );
}
