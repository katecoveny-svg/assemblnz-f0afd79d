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
const OWNER_EMAIL = 'assembl@assembl.co.nz'; // Kate's loaded address — draft target for testing

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
