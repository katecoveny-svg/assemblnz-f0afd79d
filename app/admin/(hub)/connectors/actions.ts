'use server';

import { revalidatePath } from 'next/cache';
import { ensureAdmin } from '@/lib/admin/ensureAdmin';
import {
  createConnectLink,
  pipedreamConfigured,
  revokeExternalUser,
  withAppFilter,
} from '@/lib/connectors/pipedream';
import { EXTERNAL_USER_ID_RE } from '@/lib/connectors/pilots';
import { writeConnectorAdminReceipt } from '@/lib/agents/receipts';
import { createActionRequest } from '@/lib/agents/action-requests';

/**
 * /admin/connectors server actions. Service-side Pipedream calls only after
 * ensureAdmin(); every mint and revoke writes a mana receipt (issuer
 * `action-path`). The connect_link_url carries a live token — it travels
 * straight back to the operator's browser and is never logged, thrown, or
 * put in a receipt (only its expiry timestamp is).
 */

export type MintResult =
  | { ok: true; url: string; expiresAt: string | null }
  | { ok: false; error: string };

export async function mintConnectLinkAction(input: {
  externalUserId: string;
  app?: string | null;
}): Promise<MintResult> {
  const admin = await ensureAdmin();

  const externalUserId = input.externalUserId.trim().toLowerCase();
  if (!EXTERNAL_USER_ID_RE.test(externalUserId)) {
    return { ok: false, error: 'Use agent:<slug> or tenant:<slug> (lowercase letters, digits, hyphens).' };
  }
  if (!pipedreamConfigured()) {
    return { ok: false, error: 'Pipedream Connect is not configured in this environment.' };
  }

  const app = input.app?.trim() || null;
  try {
    const link = await createConnectLink(externalUserId);
    writeConnectorAdminReceipt({
      action: 'connect_link_minted',
      externalUserId,
      operator: admin.email,
      expiresAt: link.expires_at ?? null,
      appFilter: app,
    });
    revalidatePath('/admin/connectors');
    return { ok: true, url: withAppFilter(link.connect_link_url, app), expiresAt: link.expires_at ?? null };
  } catch {
    // Deliberately generic: Pipedream error strings can echo request URLs.
    return { ok: false, error: 'Pipedream did not return a link — check /admin/health and try again.' };
  }
}

export async function revokeConnectionAction(formData: FormData): Promise<void> {
  const admin = await ensureAdmin();

  const externalUserId = String(formData.get('external_user_id') ?? '').trim().toLowerCase();
  if (!EXTERNAL_USER_ID_RE.test(externalUserId) || !pipedreamConfigured()) return;

  try {
    await revokeExternalUser(externalUserId);
    writeConnectorAdminReceipt({
      action: 'connection_revoked',
      externalUserId,
      operator: admin.email,
    });
  } catch {
    // Fail soft — the table simply still shows the connection.
  }
  revalidatePath('/admin/connectors');
}

export type QueueEmailResult = { ok: boolean; error?: string };

/**
 * "Send via email" — draft-mode always. Files an email_draft into
 * agent_action_requests (the existing Brevo pipeline), so it waits on
 * /admin/approvals like every other outbound word. Nothing sends here, and
 * even an approve only dispatches once ACTION_DISPATCH_ENABLED=true.
 */
export async function queueConnectEmailAction(input: {
  externalUserId: string;
  url: string;
  to?: string;
}): Promise<QueueEmailResult> {
  const admin = await ensureAdmin();

  const externalUserId = input.externalUserId.trim().toLowerCase();
  if (!EXTERNAL_USER_ID_RE.test(externalUserId)) return { ok: false, error: 'Invalid external user id.' };
  if (!input.url.startsWith('https://pipedream.com/')) return { ok: false, error: 'Not a Pipedream Connect link.' };

  const created = await createActionRequest({
    agentSlug: 'connectors',
    requestedBy: admin.email,
    kind: 'email_draft',
    payload: {
      to: input.to?.trim() || undefined,
      subject: 'Connect your tools to assembl',
      body: [
        'Kia ora,',
        '',
        'Here is your secure link to connect your account to assembl:',
        '',
        input.url,
        '',
        'You authorise on Pipedream’s hosted page — we never see your password or credentials, and you can disconnect at any time.',
        '',
        'Any questions, just reply to this email.',
        '',
        '— the assembl team',
      ].join('\n'),
      reason: `Operator-minted Connect link for ${externalUserId} (drafted from /admin/connectors)`,
    },
  });

  if (!created) return { ok: false, error: 'Could not file the draft — is agent_action_requests live here?' };
  revalidatePath('/admin/approvals');
  return { ok: true };
}
