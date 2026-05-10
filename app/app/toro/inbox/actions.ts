'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { transitionDraft } from '@/lib/toro/state-machine';

interface ActionResult {
  ok: boolean;
  reason?: string;
}

/**
 * Resolve the current authenticated user. Returns null when unauthenticated;
 * the caller surfaces a user-friendly error string.
 */
async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function markReviewingAction(draftId: string): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, reason: 'not authenticated' };

  const result = await transitionDraft({
    draftId,
    toState: 'reviewing',
    userId,
    reason: 'opened_in_inbox',
  });

  if (result.ok) revalidatePath('/app/toro/inbox');
  return result.ok ? { ok: true } : { ok: false, reason: result.error };
}

export async function approveDraftAction(draftId: string): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, reason: 'not authenticated' };

  // Move pending → reviewing → approved → sent. The state machine guards
  // every step and refuses if the user tries to skip.
  const supabase = await createClient();
  const { data: current } = await supabase
    .from('toro_drafts')
    .select('status')
    .eq('id', draftId)
    .maybeSingle();

  if (current?.status === 'pending_approval') {
    const intoReviewing = await transitionDraft({
      draftId,
      toState: 'reviewing',
      userId,
      reason: 'approve_action_auto_review',
    });
    if (!intoReviewing.ok) return { ok: false, reason: intoReviewing.error };
  }

  const approved = await transitionDraft({
    draftId,
    toState: 'approved',
    userId,
    reason: 'inbox_approve_button',
  });

  revalidatePath('/app/toro/inbox');
  return approved.ok ? { ok: true } : { ok: false, reason: approved.error };
}

export async function editAndApproveDraftAction(
  draftId: string,
  newBody: string,
): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, reason: 'not authenticated' };

  const supabase = await createClient();
  const { data: current } = await supabase
    .from('toro_drafts')
    .select('status')
    .eq('id', draftId)
    .maybeSingle();

  if (current?.status === 'pending_approval') {
    const intoReviewing = await transitionDraft({
      draftId,
      toState: 'reviewing',
      userId,
      reason: 'edit_action_auto_review',
    });
    if (!intoReviewing.ok) return { ok: false, reason: intoReviewing.error };
  }

  const edited = await transitionDraft({
    draftId,
    toState: 'edited_then_approved',
    userId,
    newBody,
    reason: 'inbox_edit_and_approve',
  });

  revalidatePath('/app/toro/inbox');
  return edited.ok ? { ok: true } : { ok: false, reason: edited.error };
}

export async function rejectDraftAction(draftId: string): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, reason: 'not authenticated' };

  const supabase = await createClient();
  const { data: current } = await supabase
    .from('toro_drafts')
    .select('status')
    .eq('id', draftId)
    .maybeSingle();

  if (current?.status === 'pending_approval') {
    const intoReviewing = await transitionDraft({
      draftId,
      toState: 'reviewing',
      userId,
      reason: 'reject_action_auto_review',
    });
    if (!intoReviewing.ok) return { ok: false, reason: intoReviewing.error };
  }

  const rejected = await transitionDraft({
    draftId,
    toState: 'rejected',
    userId,
    reason: 'inbox_reject_button',
  });

  revalidatePath('/app/toro/inbox');
  return rejected.ok ? { ok: true } : { ok: false, reason: rejected.error };
}

export async function retrySendAction(draftId: string): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, reason: 'not authenticated' };

  const retried = await transitionDraft({
    draftId,
    toState: 'approved',
    userId,
    reason: 'inbox_send_retry',
  });

  revalidatePath('/app/toro/inbox');
  return retried.ok ? { ok: true } : { ok: false, reason: retried.error };
}
