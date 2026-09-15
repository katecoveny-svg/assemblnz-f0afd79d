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
function identity(ip: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || ip === 'unknown') throw new DoTrialError('trial_unavailable');
  return 'do-network:' + createHmac('sha256', secret).update(`do-trial:${ip}`).digest('hex');
}
/** A database unique constraint arbitrates concurrent reservations across instances.
 * Network identity prevents clearing cookies from resetting the public trial.
 * Shared networks share the allowance. No raw address or source text is stored.
 */
export async function reserveDoTrial(ip: string) {
  try {
    const anonId = identity(ip);
    const db = getServiceClient();
    for (const slot of slots) {
      const id = crypto.randomUUID();
      const { error } = await db.from('agent_chat_sessions').insert({ id, anon_id: anonId, agent_slug: slot, free_message_count: 1 });
      if (!error) return { release: async () => { await db.from('agent_chat_sessions').delete().eq('id', id).eq('anon_id', anonId); } };
      if (error.code !== '23505') throw new DoTrialError('trial_unavailable');
    }
    throw new DoTrialError('trial_exhausted');
  } catch (e) { throw e instanceof DoTrialError ? e : new DoTrialError('trial_unavailable'); }
}
export async function readDoTrial(ip: string) {
  try {
    const { count, error } = await getServiceClient().from('agent_chat_sessions').select('id', { count: 'exact', head: true }).eq('anon_id', identity(ip)).in('agent_slug', slots);
    if (error) throw error;
    return { remaining: Math.max(0, DO_TRIAL_LIMIT - (count ?? 0)), limit: DO_TRIAL_LIMIT };
  } catch { throw new DoTrialError('trial_unavailable'); }
}
