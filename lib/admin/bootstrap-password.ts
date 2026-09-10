/**
 * One-time founder password bootstrap for the operator hub.
 *
 * When magic-link SMTP is down and no password exists yet, Kate needs a way
 * onto /admin without putting secrets in git. This path:
 *
 *   1. Requires OPERATOR_BOOTSTRAP_SECRET in server env (never committed).
 *   2. Accepts only FOUNDER_ADMIN_EMAILS (assembl@ / kate@).
 *   3. Uses the service-role Auth Admin API to set (or create+set) the password.
 *
 * Prefer Supabase Studio → Authentication → Users → set password when the
 * secret is not configured — that is the lowest-risk path. This code path is
 * for the demo host when Studio is awkward and the env secret is already set.
 *
 * Server-only. No passwords are stored in the repo.
 */

import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';
import { getServiceClient } from '@/lib/supabase/service';
import { FOUNDER_ADMIN_EMAILS, isFounderAdminEmail } from '@/lib/admin/ensureAdmin';
import {
  BOOTSTRAP_MIN_PASSWORD,
  BOOTSTRAP_SECRET_ENV,
  type BootstrapPasswordResult,
} from '@/lib/admin/bootstrap-password-types';

export {
  BOOTSTRAP_SECRET_ENV,
  type BootstrapPasswordResult,
} from '@/lib/admin/bootstrap-password-types';

function timingSafeEqualString(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function bootstrapSecretConfigured(): boolean {
  return Boolean(process.env[BOOTSTRAP_SECRET_ENV]?.trim());
}

export function founderEmailsForUi(): readonly string[] {
  return FOUNDER_ADMIN_EMAILS;
}

/**
 * Set a founder password via service role. Never logs the password.
 */
export async function bootstrapFounderPassword(opts: {
  secret: string;
  email: string;
  password: string;
  confirm: string;
}): Promise<BootstrapPasswordResult> {
  const expected = process.env[BOOTSTRAP_SECRET_ENV]?.trim();
  if (!expected) {
    return {
      ok: false,
      error:
        'OPERATOR_BOOTSTRAP_SECRET is not set on the server. Set it in Vercel (demo) or use Supabase Studio → Authentication → Users → set password.',
    };
  }

  const supplied = opts.secret;
  if (!supplied || !timingSafeEqualString(supplied, expected)) {
    return { ok: false, error: 'Bootstrap secret did not match.' };
  }

  const email = opts.email.trim().toLowerCase();
  if (!isFounderAdminEmail(email)) {
    return {
      ok: false,
      error: `Only founder mailboxes may use this path (${FOUNDER_ADMIN_EMAILS.join(', ')}).`,
    };
  }

  if (!opts.password || opts.password.length < BOOTSTRAP_MIN_PASSWORD) {
    return {
      ok: false,
      error: `Use at least ${BOOTSTRAP_MIN_PASSWORD} characters for the password.`,
    };
  }
  if (opts.password !== opts.confirm) {
    return { ok: false, error: 'The two passwords do not match.' };
  }

  let service;
  try {
    service = getServiceClient();
  } catch {
    return {
      ok: false,
      error: 'Service role is not configured — cannot set a password from the app.',
    };
  }

  // Find existing auth user by email (paginate — founder inboxes are early users).
  let existingId: string | null = null;
  for (let page = 1; page <= 5; page++) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      return { ok: false, error: `Could not look up users: ${error.message}` };
    }
    const hit = data.users.find((u) => (u.email ?? '').toLowerCase() === email);
    if (hit) {
      existingId = hit.id;
      break;
    }
    if (data.users.length < 200) break;
  }

  if (existingId) {
    const { error } = await service.auth.admin.updateUserById(existingId, {
      password: opts.password,
      email_confirm: true,
    });
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true, created: false };
  }

  const { error } = await service.auth.admin.createUser({
    email,
    password: opts.password,
    email_confirm: true,
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true, created: true };
}
