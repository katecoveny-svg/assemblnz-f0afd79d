import 'server-only';
import { createHmac } from 'node:crypto';
import { getServiceClient } from '@/lib/supabase/service';

/** Anonymous / public sandbox only. Override with DO_TRIAL_LIMIT (1–20). */
export function doAnonTrialLimit(): number {
  const raw = process.env.DO_TRIAL_LIMIT;
  const parsed = raw ? Number(raw) : 3;
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 20) return 3;
  return Math.floor(parsed);
}

/** @deprecated Prefer doAnonTrialLimit() — kept for import compatibility. */
export const DO_TRIAL_LIMIT = 3;

function trialSlots(limit = doAnonTrialLimit()): string[] {
  return Array.from({ length: limit }, (_, index) => `do-trial-${index + 1}`);
}

export class DoTrialError extends Error {
  constructor(public code: 'trial_exhausted' | 'trial_unavailable') {
    super(
      code === 'trial_exhausted'
        ? 'Your free DO sandbox tasks on this network are used. Sign in for unlimited prepare, or enquire to continue.'
        : 'The free-task allowance cannot be checked right now. Please try again later.',
    );
  }
}

export type ReserveDoTrialOptions = {
  /**
   * Signed-in DO owner id. When set, the network trial is bypassed —
   * Assembl users get unlimited prepare. Anonymous callers keep the
   * shared per-network sandbox quota (DO_TRIAL_LIMIT, default 3).
   */
  signedInOwnerId?: string | null;
};

function identity(ip: string) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || ip === 'unknown') throw new DoTrialError('trial_unavailable');
  return 'do-network:' + createHmac('sha256', secret).update(`do-trial:${ip}`).digest('hex');
}

/**
 * Product rule:
 * - Public / anonymous sandbox → N free tasks per network IP (default 3)
 * - Signed-in Assembl DO owner → unlimited (skip reserve)
 *
 * Ops mid-demo reset (optional):
 *   DELETE FROM agent_chat_sessions
 *   WHERE anon_id = 'do-network:<hmac>' AND agent_slug LIKE 'do-trial-%';
 * Identity is HMAC of IP with service role — never store raw IPs.
 */
export async function reserveDoTrial(ip: string, opts: ReserveDoTrialOptions = {}) {
  if (opts.signedInOwnerId) {
    return {
      release: async () => {},
      bypassed: true as const,
      reason: 'signed_in_owner' as const,
    };
  }
  const limit = doAnonTrialLimit();
  try {
    const anonId = identity(ip);
    const db = getServiceClient();
    for (const slot of trialSlots(limit)) {
      const id = crypto.randomUUID();
      const { error } = await db.from('agent_chat_sessions').insert({
        id,
        anon_id: anonId,
        agent_slug: slot,
        free_message_count: 1,
      });
      if (!error) {
        return {
          release: async () => {
            await db.from('agent_chat_sessions').delete().eq('id', id).eq('anon_id', anonId);
          },
          bypassed: false as const,
        };
      }
      if (error.code !== '23505') throw new DoTrialError('trial_unavailable');
    }
    throw new DoTrialError('trial_exhausted');
  } catch (e) {
    throw e instanceof DoTrialError ? e : new DoTrialError('trial_unavailable');
  }
}

export async function readDoTrial(ip: string, opts: ReserveDoTrialOptions = {}) {
  const limit = doAnonTrialLimit();
  if (opts.signedInOwnerId) {
    return {
      remaining: null as number | null,
      limit,
      bypassed: true as const,
      mode: 'signed_in_unlimited' as const,
    };
  }
  try {
    const { count, error } = await getServiceClient()
      .from('agent_chat_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('anon_id', identity(ip))
      .in('agent_slug', trialSlots(limit));
    if (error) throw error;
    return {
      remaining: Math.max(0, limit - (count ?? 0)),
      limit,
      bypassed: false as const,
      mode: 'anon_sandbox' as const,
    };
  } catch {
    throw new DoTrialError('trial_unavailable');
  }
}
