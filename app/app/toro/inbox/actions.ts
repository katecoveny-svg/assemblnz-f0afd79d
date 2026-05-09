'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { postMessage } from '@/lib/toro/chatwoot-api';

interface ActionResult {
  ok: boolean;
  reason?: string;
}

async function loadDraft(draftId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, reason: 'not authenticated' as const };

  const { data, error } = await supabase
    .from('toro_drafts')
    .select(
      'id, chatwoot_conversation_id, draft_body, status',
    )
    .eq('id', draftId)
    .single();

  if (error || !data) {
    return { ok: false as const, reason: error?.message ?? 'draft not found' };
  }
  return { ok: true as const, supabase, user, draft: data };
}

export async function approveDraftAction(draftId: string): Promise<ActionResult> {
  const loaded = await loadDraft(draftId);
  if (!loaded.ok) return loaded;
  const { supabase, user, draft } = loaded;

  if (draft.status !== 'pending_approval') {
    return { ok: false, reason: `cannot approve — current status is ${draft.status}` };
  }

  const now = new Date().toISOString();
  await supabase
    .from('toro_drafts')
    .update({
      status: 'approved',
      reviewer_user_id: user.id,
      reviewed_at: now,
    })
    .eq('id', draftId);

  try {
    const sent = await postMessage(draft.chatwoot_conversation_id, draft.draft_body);
    await supabase
      .from('toro_drafts')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        chatwoot_message_id: sent.message_id,
      })
      .eq('id', draftId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'send failed';
    await supabase
      .from('toro_drafts')
      .update({ status: 'failed', send_error: message })
      .eq('id', draftId);
    return { ok: false, reason: message };
  }

  revalidatePath('/app/toro/inbox');
  return { ok: true };
}

export async function editAndApproveDraftAction(
  draftId: string,
  newBody: string,
): Promise<ActionResult> {
  const trimmed = newBody.trim();
  if (trimmed.length === 0) {
    return { ok: false, reason: 'edited body cannot be empty' };
  }
  if (trimmed.length > 4000) {
    return { ok: false, reason: 'edited body too long (max 4000 chars)' };
  }

  const loaded = await loadDraft(draftId);
  if (!loaded.ok) return loaded;
  const { supabase, user, draft } = loaded;

  if (draft.status !== 'pending_approval') {
    return { ok: false, reason: `cannot edit — current status is ${draft.status}` };
  }

  const now = new Date().toISOString();
  await supabase
    .from('toro_drafts')
    .update({
      draft_body: trimmed,
      status: 'edited_then_approved',
      reviewer_user_id: user.id,
      reviewed_at: now,
    })
    .eq('id', draftId);

  try {
    const sent = await postMessage(draft.chatwoot_conversation_id, trimmed);
    await supabase
      .from('toro_drafts')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        chatwoot_message_id: sent.message_id,
      })
      .eq('id', draftId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'send failed';
    await supabase
      .from('toro_drafts')
      .update({ status: 'failed', send_error: message })
      .eq('id', draftId);
    return { ok: false, reason: message };
  }

  revalidatePath('/app/toro/inbox');
  return { ok: true };
}

export async function rejectDraftAction(draftId: string): Promise<ActionResult> {
  const loaded = await loadDraft(draftId);
  if (!loaded.ok) return loaded;
  const { supabase, user, draft } = loaded;

  if (draft.status !== 'pending_approval') {
    return { ok: false, reason: `cannot reject — current status is ${draft.status}` };
  }

  await supabase
    .from('toro_drafts')
    .update({
      status: 'rejected',
      reviewer_user_id: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', draftId);

  revalidatePath('/app/toro/inbox');
  return { ok: true };
}
