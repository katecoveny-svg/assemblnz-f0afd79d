import { createClient } from '@/lib/supabase/server';

/**
 * Owner gate for hidden/private agents (e.g. Echo). A hidden agent is resolvable
 * by slug so its route works, but only the owner — the signed-in user whose
 * email matches ECHO_OWNER_EMAIL — may load its chat or hit its API. Everyone
 * else is treated as if the agent does not exist.
 *
 * Defaults to Kate's account; override per-env with ECHO_OWNER_EMAIL.
 */
const OWNER_EMAIL = (process.env.ECHO_OWNER_EMAIL ?? 'assembl@assembl.co.nz').toLowerCase();

export async function canAccessHiddenAgent(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return !!user?.email && user.email.toLowerCase() === OWNER_EMAIL;
  } catch {
    return false;
  }
}
