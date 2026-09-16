import 'server-only';
import { createHmac } from 'node:crypto';
import { getServiceClient } from '@/lib/supabase/service';

export const DO_TRIAL_LIMIT = 3;
const slots = ['do-trial-1', 'do-trial-2', 'do-trial-3'];
export class DoTrialError extends Error {
  constructor(public code: 'trial_exhausted' | 'trial_unavailable') {
    super(code === 'trial_exhausted' ? 'Your three free DO tasks are used. Enquire to continue.' : 'The free-task allowance cannot be checked right now. Please try again later.');
  }
}

export type ReserveDoTrialOptions = {
  /**
   * Signed-in DO owner id. When set, the network trial is bypassed so demos
   * and connected workflows (Gmail, Household Floor) are not blocked by the
   * anonymous 3-task IP allowance. Anonymous / signed-out callers still use
   * the shared network quota.
   */
  signedInOwnerId?: string | null;
};

function identity(ip: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || ip === 'unknown') throw new DoTrialError('trial_unavailable');
  return 'do-network:' + createHmac('sha256', secret).update(`do-trial:${ip}`).digest('hex');
}

/** A database unique constraint arbitrates concurrent reservations across instances.
 * Network identity prevents clearing cookies from resetting the public trial.
 * Shared networks share the allowance. No raw address or source text is stored.
 * Signed-in owners bypass the anonymous network quota (still rate-limited elsewhere).
 */
export async function reserveDoTrial(ip: string, opts: ReserveDoTrialOptions = {}) {
  if (opts.signedInOwnerId) {
    return {
      release: async () => {},
      bypassed: true as const,
      reason: 'signed_in_owner' as const,
    };
  }
  try {
    const anonId = identity(ip);
    const db = getServiceClient();
    for (const slot of slots) {
      const id = crypto.randomUUID();
      const { error } = await db.from('agent_chat_sessions').insert({ id, anon_id: anonId, agent_slug: slot, free_message_count: 1 });
      if (!error) return { release: async () => { await db.from('agent_chat_sessions').delete().eq('id', id).eq('anon_id', anonId); }, bypassed: false as const };
      if (error.code !== '23505') throw new DoTrialError('trial_unavailable');
    }
    throw new DoTrialError('trial_exhausted');
  } catch (e) { throw e instanceof DoTrialError ? e : new DoTrialError('trial_unavailable'); }
}

export async function readDoTrial(ip: string, opts: ReserveDoTrialOptions = {}) {
  if (opts.signedInOwnerId) {
    return { remaining: null as number | null, limit: DO_TRIAL_LIMIT, bypassed: true as const };
  }
  try {
    const { count, error } = await getServiceClient().from('agent_chat_sessions').select('id', { count: 'exact', head: true }).eq('anon_id', identity(ip)).in('agent_slug', slots);
    if (error) throw error;
    return { remaining: Math.max(0, DO_TRIAL_LIMIT - (count ?? 0)), limit: DO_TRIAL_LIMIT, bypassed: false as const };
  } catch { throw new DoTrialError('trial_unavailable'); }
}
