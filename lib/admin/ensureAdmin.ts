import 'server-only';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getServiceClient } from '@/lib/supabase/service';

/**
 * Admin gate for the operator hub at /admin.
 *
 * Access is granted to:
 *   1. the founder mailboxes (code allowlist below — always works, even before
 *      the designated_admins migration has run),
 *   2. any ACTIVE row in `designated_admins` (by user_id or email — the
 *      v2-admin allowlist Kate manages from /admin/settings),
 *   3. legacy markers: `user_roles.role = 'admin'` or `profiles.is_admin`.
 *
 * Everyone else is bounced. Unauthenticated visitors go to the canon-styled
 * /admin/login (magic link + optional password).
 *
 * Pages under /admin then read with the service-role client (RLS bypass) ONLY
 * after this gate has proven authorisation — the established pattern documented
 * in lib/supabase/service.ts. RLS stays on for every table; nothing here weakens
 * a public policy.
 */

const ADMIN_EMAILS = new Set<string>([
  'assembl@assembl.co.nz',
  'kate@assembl.co.nz',
]);

export type AdminUser = {
  id: string;
  email: string;
};

/** True when the (already authenticated) user is on the designated_admins allowlist. */
async function isDesignatedAdmin(userId: string, email: string): Promise<boolean> {
  // Prefer the service client (table writes are service-role only, and this
  // read must not depend on the session's RLS visibility). Fall back to the
  // session client — the RLS policy lets a designated admin read their row.
  let client;
  try {
    client = getServiceClient();
  } catch {
    client = await createClient();
  }
  try {
    const { data, error } = await client
      .from('designated_admins')
      .select('email, user_id, active')
      .eq('active', true)
      .or(`user_id.eq.${userId},email.eq.${email}`)
      .limit(1);
    if (error) return false;
    const row = data?.[0];
    if (!row) return false;

    // Lazy back-fill: bind the auth user to their allowlist row on first sight
    // so future checks (and the RLS helper) match by user_id too.
    if (!row.user_id) {
      try {
        const svc = getServiceClient();
        await svc.from('designated_admins').update({ user_id: userId }).eq('email', row.email);
      } catch {
        // Best-effort only; email match keeps working regardless.
      }
    }
    return true;
  } catch {
    // Table not migrated in this environment yet — other checks still apply.
    return false;
  }
}

/**
 * The path the visitor actually requested, via the x-pathname header the
 * middleware stamps on every request. Falls back to /admin when the header
 * is missing (direct render outside middleware) or points somewhere the
 * login page would reject anyway (its guard only honours /admin paths).
 */
async function requestedAdminPath(): Promise<string> {
  try {
    const requested = (await headers()).get('x-pathname');
    if (requested && requested.startsWith('/admin') && !requested.startsWith('/admin/login')) {
      return requested;
    }
  } catch {
    // headers() unavailable (e.g. called from a context without a request).
  }
  return '/admin';
}

export async function ensureAdmin(redirectTo?: string): Promise<AdminUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const target = redirectTo ?? (await requestedAdminPath());
    redirect(`/admin/login?redirect=${encodeURIComponent(target)}`);
  }

  const email = user.email?.toLowerCase() ?? '';
  if (ADMIN_EMAILS.has(email)) {
    return { id: user.id, email };
  }

  // The DB allowlist — operators Kate adds without a deploy.
  if (await isDesignatedAdmin(user.id, email)) {
    return { id: user.id, email };
  }

  // Fall back to the legacy role/flag check.
  const [{ data: roleRow }, { data: profileRow }] = await Promise.all([
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  if (roleRow || profileRow?.is_admin === true) {
    return { id: user.id, email };
  }

  // Signed in but not an operator — send them to the public marketplace.
  redirect('/agents');
}
