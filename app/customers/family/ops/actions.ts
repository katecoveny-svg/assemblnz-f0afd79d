'use server';

import { revalidatePath } from 'next/cache';
import { parseNewsletter } from '@/lib/family/parse';
import { saveProposed, decide, assignPickup, clearProposed, familyContext, listFamily, group, saveDrop } from '@/lib/family/store';
import { createActionRequest } from '@/lib/agents/action-requests';
import { parseDrop } from '@/lib/family/drop';
import { uploadAndScan, type FamilyUploadKind } from '@/lib/family/uploads';
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

/**
 * "Throw it in" — anyone in the whānau drops a quick note (typed or spoken →
 * transcribed) from any device. We route the intent to the right tab and file a
 * single PROPOSED item, attributed to whoever dropped it. Draft-only: it lands
 * in the week for Kate to approve; nothing is booked, paid or sent.
 */
export async function throwItInAction(formData: FormData) {
  const text = String(formData.get('text') ?? '').trim();
  const from = String(formData.get('from') ?? '').trim() || 'Someone';
  const channel = formData.get('channel') === 'voice' ? 'voice' : 'text';
  if (!text) return;
  const parsed = await parseDrop(text);
  await saveDrop({
    hub: HUB,
    kind: parsed.kind,
    title: parsed.title,
    when_label: parsed.when_label ?? null,
    person: parsed.person ?? null,
    location: parsed.location ?? null,
    from,
    raw: text,
    channel,
  });
  revalidatePath('/customers/family/ops');
}

/**
 * Upload a photo / PDF / short video from the Kitchen or Inbox drop-zones. The
 * file goes to the private per-tenant family-uploads bucket and is scanned by
 * the family-vision function; anything it reads lands as PROPOSED items with a
 * Trust A/B/C score for Kate to review. Draft-only, RLS-locked, purged after 30
 * days. No child data leaves the tenant.
 */
export async function uploadFamilyFileAction(formData: FormData) {
  const file = formData.get('file');
  const kind = String(formData.get('kind') ?? 'receipt') as FamilyUploadKind;
  const from = String(formData.get('from') ?? '').trim() || 'Someone';
  if (!(file instanceof File) || file.size === 0) return;
  const bytes = new Uint8Array(await file.arrayBuffer());
  await uploadAndScan({
    file: { bytes, name: file.name || 'upload', type: file.type || 'application/octet-stream' },
    kind,
    hub: HUB,
    uploadedBy: from,
  });
  revalidatePath('/customers/family/ops');
}

/**
 * "Want us to reach out about a Delivereasy integration?" — files a DRAFT
 * partner-intake note. Draft-only: nothing is sent to Delivereasy; it records
 * Kate's interest so she can follow up. (Delivereasy has no public consumer API
 * today — couriers are booked by hand until a partner deal lands.)
 */
export async function draftDelivereasyIntakeAction() {
  await createActionRequest({
    agentSlug: 'family-os',
    requestedBy: `family:${HUB}`,
    kind: 'email_draft',
    payload: {
      to: OWNER_EMAIL,
      subject: 'Delivereasy partner integration — reach out?',
      body: `Drafted a note to open a Delivereasy partner conversation: connect their courier network so "send a courier" books and tracks end-to-end from Family OS.\n\nThis is a DRAFT — nothing has been sent to Delivereasy. Approve it and we'll follow up on your behalf.`,
      reason: 'Delivereasy partner-integration intake (draft-only — not sent).',
    },
  });
  revalidatePath('/customers/family/ops');
}
