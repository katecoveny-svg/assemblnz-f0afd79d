'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { transitionDraft } from '@/lib/toro/state-machine';
import { captureApprovedPaymentIntent } from '@/lib/stripe/manual-capture';

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

/**
 * Combined action used by the "confirm payment & send" button on a draft
 * that has a linked PaymentIntent in `requires_capture` state. Captures
 * the PI (charges the card) BEFORE running the approve flow, so a
 * failed capture stops the send. Per canon hard rule #34 the capture
 * is the explicit-user-tap moment; the prior PI creation merely
 * authorised the card.
 */
export async function confirmPaymentAndApproveAction(
  draftId: string,
): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, reason: 'not authenticated' };

  const supabase = await createClient();
  const { data: pi, error: piError } = await supabase
    .from('toro_payment_intents')
    .select('stripe_payment_intent_id, status')
    .eq('draft_id', draftId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (piError) return { ok: false, reason: piError.message };
  if (!pi) return { ok: false, reason: 'no payment intent linked to this draft' };
  const intent = pi as { stripe_payment_intent_id: string; status: string };
  if (intent.status !== 'requires_capture') {
    return {
      ok: false,
      reason: `payment intent is in state "${intent.status}", expected "requires_capture"`,
    };
  }

  try {
    await captureApprovedPaymentIntent(intent.stripe_payment_intent_id, userId);
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : 'capture failed' };
  }

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
      reason: 'confirm_payment_auto_review',
    });
    if (!intoReviewing.ok) return { ok: false, reason: intoReviewing.error };
  }

  const approved = await transitionDraft({
    draftId,
    toState: 'approved',
    userId,
    reason: 'inbox_confirm_payment_button',
  });

  revalidatePath('/app/toro/inbox');
  return approved.ok ? { ok: true } : { ok: false, reason: approved.error };
}
