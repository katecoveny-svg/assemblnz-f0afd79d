'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ensureAdmin } from '@/lib/admin/ensureAdmin';
import { TENANT_SLUGS } from '@/lib/customers/tenants';
import { createInvite, reinstateInvite, revokeInvite } from '@/lib/demo-invites/server';

/**
 * Demo magic-link server actions. Service-role writes only after
 * ensureAdmin(); demo_invites has RLS-with-no-policies so these actions
 * (plus the middleware) are the only code paths that touch it.
 */

export async function createInviteAction(formData: FormData) {
  await ensureAdmin();

  const demo = String(formData.get('demo') ?? '');
  const recipientName = String(formData.get('recipient_name') ?? '').trim();
  const recipientCompany = String(formData.get('recipient_company') ?? '').trim();
  const recipientEmail = String(formData.get('recipient_email') ?? '').trim();
  const notes = String(formData.get('notes') ?? '').trim();
  const greetingMode = formData.get('greeting_mode') === 'company' ? 'company' : 'name';

  if (!TENANT_SLUGS.includes(demo)) {
    redirect('/admin/invites?error=unknown-demo');
  }
  if (!recipientName || !recipientCompany) {
    redirect('/admin/invites?error=missing-fields');
  }

  let slug = '';
  try {
    const invite = await createInvite({
      demo,
      recipientName,
      recipientCompany,
      recipientEmail: recipientEmail || null,
      greetingMode,
      notes: notes || null,
    });
    slug = invite.slug;
  } catch {
    redirect('/admin/invites?error=create-failed');
  }

  revalidatePath('/admin/invites');
  redirect(`/admin/invites?created=${encodeURIComponent(slug)}`);
}

export async function revokeInviteAction(formData: FormData) {
  await ensureAdmin();
  const slug = String(formData.get('slug') ?? '');
  if (slug) await revokeInvite(slug);
  revalidatePath('/admin/invites');
}

export async function reinstateInviteAction(formData: FormData) {
  await ensureAdmin();
  const slug = String(formData.get('slug') ?? '');
  if (slug) await reinstateInvite(slug);
  revalidatePath('/admin/invites');
}
