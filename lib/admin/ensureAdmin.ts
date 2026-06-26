import 'server-only';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Admin gate for the operator hub at /admin.
 *
 * Access is granted to the founder mailbox (assembl@assembl.co.nz) OR any user
 * carrying an admin marker — either the legacy `user_roles.role = 'admin'` row
 * or an `is_admin = true` flag on their profile. Everyone else is bounced.
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

export async function ensureAdmin(redirectTo = '/admin'): Promise<AdminUser> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  const email = user.email?.toLowerCase() ?? '';
  if (ADMIN_EMAILS.has(email)) {
    return { id: user.id, email };
  }

  // Fall back to a role/flag check for any future operators.
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
