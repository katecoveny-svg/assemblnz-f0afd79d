'use server';

import { revalidatePath } from 'next/cache';
import { parseNewsletter } from '@/lib/family/parse';
import { saveProposed, decide, assignPickup, clearProposed, familyContext, listFamily, group } from '@/lib/family/store';
import { createActionRequest } from '@/lib/agents/action-requests';
import { SAMPLE_NEWSLETTER } from '@/lib/family/sample';

/**
 * Family OS server actions. These POST to the /customers/family route, so the
 * demo gate (basic-auth / invite in middleware) already protects them — a
 * public caller can't trigger a parse. Everything the agent produces lands as
 * PROPOSED; these actions are the human approving.
 */

const HUB = 'demo';
const OWNER_EMAIL = 'kateharland@outlook.co.nz'; // Kate's personal inbox — the family digest is personal (assembl@assembl.co.nz is the work address)

export async function parseNewsletterAction(formData: FormData) {
  const text = String(formData.get('newsletter') ?? '').trim() || SAMPLE_NEWSLETTER;
  const ctx = await familyContext(HUB);
  await clearProposed(HUB, 'newsletter'); // fresh parse
  const week = await parseNewsletter(text, ctx);
  if (week) await saveProposed(HUB, 'newsletter', week);
  revalidatePath('/customers/family/ops');
}

export async function loadSampleAction() {
  const ctx = await familyContext(HUB);
  await clearProposed(HUB, 'newsletter');
  const week = await parseNewsletter(SAMPLE_NEWSLETTER, ctx);
  if (week) await saveProposed(HUB, 'newsletter', week);
  revalidatePath('/customers/family/ops');
}

export async function approveAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (id) await decide(id, 'approved');
  revalidatePath('/customers/family/ops');
}

export async function dismissAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  if (id) await decide(id, 'dismissed');
  revalidatePath('/customers/family/ops');
}

export async function assignPickupAction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const who = String(formData.get('who') ?? '').trim();
  const field = formData.get('field') === 'backup' ? 'backup' : 'assigned';
  if (id && who) await assignPickup(id, field, who);
  revalidatePath('/customers/family/ops');
}

export async function clearAllProposedAction() {
  await clearProposed(HUB);
  revalidatePath('/customers/family/ops');
}

/**
 * "Email me this week" — drafts the family brief to the owner's inbox via the
 * existing action-request queue (draft-only; nothing sends until an operator
 * approves it on /admin/approvals AND dispatch is enabled). Uses Kate's loaded
 * address for testing.
 */
export async function emailDigestAction() {
  const items = group(await listFamily(HUB));
  const line = (label: string, xs: string[]) => (xs.length ? `${label}:\n${xs.map((x) => `- ${x}`).join('\n')}\n\n` : '');
  const body =
    `Kia ora — here's the family week your Family OS put together (all drafts, nothing sent):\n\n` +
    line('This week', items.events.map((e) => `${e.title}${e.when_label ? ` (${e.when_label})` : ''}`)) +
    line('Needs doing', items.tasks.map((t) => t.title)) +
    line('Pickups', items.pickups.map((p) => `${p.title}${p.when_label ? ` — ${p.when_label}` : ''}`)) +
    line('Shopping', items.shopping.map((s) => s.title)) +
    line('Waiting on you', items.approvals.map((a) => a.title)) +
    `— drafted by assembl Family OS. Approve the bits you want and I'll turn them into calendar events, lists and reminders.`;
  await createActionRequest({
    agentSlug: 'family-os',
    requestedBy: `family:${HUB}`,
    kind: 'email_draft',
    payload: { to: OWNER_EMAIL, subject: 'Your family week — drafted', body, reason: 'Weekly family brief drafted from the newsletter (draft-only).' },
  });
  revalidatePath('/customers/family/ops');
}

/**
 * "Queue" a grocery basket for pickup or Uber Direct delivery — DRAFT ONLY.
 * Files a pending request in the approval queue; nothing is bought, paid or
 * dispatched (ACTION_DISPATCH_ENABLED stays off, and there's no real Woolworths
 * ordering integration — see the integration brief). The Uber Direct leg is the
 * only part that could go live today.
 */
export async function draftGroceryOrderAction(formData: FormData) {
  const mode = formData.get('mode') === 'delivery' ? 'delivery' : 'pickup';
  const how = mode === 'delivery'
    ? 'Uber Direct delivery — courier collects from Countdown Mangawhai and drops to the door'
    : 'Click & Collect pickup at Woolworths Mangawhai';
  await createActionRequest({
    agentSlug: 'family-os',
    requestedBy: `family:${HUB}`,
    kind: 'email_draft',
    payload: {
      to: OWNER_EMAIL,
      subject: `Grocery basket queued (${mode}) — please review`,
      body: `Kia ora — your Family OS has a grocery basket ready to ${mode}.\n\nHow: ${how}.\nBasket: your usual + tonight's missing items (~$96 before Everyday Rewards).\n\nThis is a DRAFT. Nothing is bought, paid or sent. Approve it and I'll hand the list off; the checkout stays with you.`,
      reason: `Grocery basket queued for ${mode} (draft-only — no order placed).`,
    },
  });
  revalidatePath('/customers/family/ops');
}

/**
 * Release the kids' weekly allowance (Tōro) — DRAFT ONLY. Files a pending
 * approval; no real money moves. Dispatch is off and there is no payments
 * integration wired — this records the parent's intent for review.
 */
export async function draftAllowanceAction(formData: FormData) {
  const amount = String(formData.get('amount') ?? '').trim() || '17.00';
  await createActionRequest({
    agentSlug: 'toro',
    requestedBy: `family:${HUB}`,
    kind: 'email_draft',
    payload: {
      to: OWNER_EMAIL,
      subject: `Weekly allowance ready to release — $${amount}`,
      body: `Tōro has this week's allowance ready: $${amount} across Mila and Jack, for the chores marked done.\n\nThis is a DRAFT for your approval. No money moves on its own — releasing records your yes; the transfer stays with you.`,
      reason: `Weekly allowance payout drafted ($${amount}) — draft-only, no funds moved.`,
    },
  });
  revalidatePath('/customers/family/ops');
}
