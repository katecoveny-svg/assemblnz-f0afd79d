'use server';

import { revalidatePath } from 'next/cache';
import { ensureAdmin } from '@/lib/admin/ensureAdmin';
import { getServiceClient } from '@/lib/supabase/service';

/**
 * Content-approval server actions. AI-generated content lands in
 * content_approvals as 'pending' (migration 20260703100000) and only ships once
 * approved here. Service-role writes only after ensureAdmin(); RLS stays on
 * (admin-scoped read, no client write policies).
 */

async function review(formData: FormData, status: 'approved' | 'rejected') {
  const admin = await ensureAdmin();

  const id = String(formData.get('id') ?? '');
  const note = String(formData.get('note') ?? '').trim();
  if (!id) return;

  try {
    const sb = getServiceClient();
    await sb
      .from('content_approvals')
      .update({
        status,
        reviewed_by: admin.email,
        reviewed_at: new Date().toISOString(),
        review_note: note || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  } catch {
    // Fail soft before the migration lands.
  }

  revalidatePath('/admin/approvals');
}

export async function approveContent(formData: FormData) {
  await review(formData, 'approved');
}

export async function rejectContent(formData: FormData) {
  await review(formData, 'rejected');
}

// ── Agent action requests (the first real action path) ─────────────────────
// Same human gate, different queue: agents file email drafts / webhook posts
// into agent_action_requests, and only an operator's yes moves them on.
// Dispatch is additionally env-gated (ACTION_DISPATCH_ENABLED) inside
// decideActionRequest, so approving here records the decision without
// sending anything until Kate deliberately flips that flag.

export async function approveAgentAction(formData: FormData) {
  const admin = await ensureAdmin();
  const id = String(formData.get('id') ?? '');
  const note = String(formData.get('note') ?? '').trim();
  if (!id) return;
  try {
    const { decideActionRequest } = await import('@/lib/agents/action-requests');
    await decideActionRequest(id, 'approved', admin.email, note || undefined);
  } catch {
    // Fail soft — the row simply stays pending.
  }
  revalidatePath('/admin/approvals');
}

export async function rejectAgentAction(formData: FormData) {
  const admin = await ensureAdmin();
  const id = String(formData.get('id') ?? '');
  const note = String(formData.get('note') ?? '').trim();
  if (!id) return;
  try {
    const { decideActionRequest } = await import('@/lib/agents/action-requests');
    await decideActionRequest(id, 'rejected', admin.email, note || undefined);
  } catch {
    // Fail soft.
  }
  revalidatePath('/admin/approvals');
}

// ── SPARK generated tools ──────────────────────────────────────────────────
// Tools the public built at /spark land as 'draft' in spark_tools. They only ever
// show a draft ribbon until approved here. Nothing is dispatched — the tool is
// stored HTML — so approval simply clears it out of the draft state.

export async function approveSparkTool(formData: FormData) {
  const admin = await ensureAdmin();
  const slug = String(formData.get('slug') ?? '');
  const note = String(formData.get('note') ?? '').trim();
  if (!slug) return;
  try {
    const { decideSparkTool } = await import('@/lib/spark/store');
    await decideSparkTool(slug, 'approved', admin.email, note || undefined);
  } catch {
    // Fail soft — the row stays draft.
  }
  revalidatePath('/admin/approvals');
}

export async function rejectSparkTool(formData: FormData) {
  const admin = await ensureAdmin();
  const slug = String(formData.get('slug') ?? '');
  const note = String(formData.get('note') ?? '').trim();
  if (!slug) return;
  try {
    const { decideSparkTool } = await import('@/lib/spark/store');
    await decideSparkTool(slug, 'rejected', admin.email, note || undefined);
  } catch {
    // Fail soft.
  }
  revalidatePath('/admin/approvals');
}

// ── SPARK winter series ────────────────────────────────────────────────────
// Kate's Tuesday control: pull a "Build One Thing" episode's four platform posts
// into content_approvals as pending drafts. Idempotent per (date, platform).
// Files drafts only — nothing dispatches; ACTION_DISPATCH_ENABLED stays OFF.

export async function ingestWinterSeries(formData: FormData) {
  await ensureAdmin();
  const date = String(formData.get('date') ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  try {
    const { ingestWinterEpisode } = await import('@/lib/spark/winter-series');
    await ingestWinterEpisode(date, 'admin:winter-series');
  } catch {
    // Fail soft — nothing queued, the page just re-renders.
  }
  revalidatePath('/admin/approvals');
}

/** Send a reviewed item back to pending (undo). */
export async function reopenContent(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get('id') ?? '');
  if (!id) return;

  try {
    const sb = getServiceClient();
    await sb
      .from('content_approvals')
      .update({
        status: 'pending',
        reviewed_by: null,
        reviewed_at: null,
        review_note: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  } catch {
    // Fail soft.
  }

  revalidatePath('/admin/approvals');
}
