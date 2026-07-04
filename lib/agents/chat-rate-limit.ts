/**
 * Marketplace chat rate limit — per IP per agent, plus a per-IP global cap.
 *
 * Mirrors lib/vessel/rate-limit.ts: rolling window, salted SHA-256 IP hash,
 * fail-open when the service client is unavailable (a misconfigured deploy
 * should degrade to "no limit", never to "nobody can chat"). The free-message
 * entitlement gate is the spend control; this is the flood control.
 */
import 'server-only';
import { createHash } from 'node:crypto';
import { getServiceClient } from '@/lib/supabase/service';

export const PER_AGENT_CAP = 20; // messages / IP / agent / window
export const GLOBAL_CAP = 60; // messages / IP / window (all agents)
const WINDOW_MINUTES = 10;

function hashIp(ip: string): string {
  const salt = process.env.VESSEL_IP_HASH_SALT ?? 'assembl-vessel-default-salt';
  return createHash('sha256').update(`chat:${salt}:${ip}`).digest('hex');
}

export function chatClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headers.get('x-real-ip')?.trim() ?? 'unknown';
}

export type ChatRateVerdict = { allowed: boolean; scope: 'agent' | 'ip' | null };

export async function checkChatRateLimit(ip: string, agentSlug: string): Promise<ChatRateVerdict> {
  const ipHash = hashIp(ip);
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

  let service: ReturnType<typeof getServiceClient>;
  try {
    service = getServiceClient();
  } catch {
    return { allowed: true, scope: null };
  }

  try {
    const [agentCount, ipCount] = await Promise.all([
      service
        .from('agent_chat_requests')
        .select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .eq('agent_slug', agentSlug)
        .gte('created_at', since),
      service
        .from('agent_chat_requests')
        .select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', since),
    ]);
    if ((ipCount.count ?? 0) >= GLOBAL_CAP) return { allowed: false, scope: 'ip' };
    if ((agentCount.count ?? 0) >= PER_AGENT_CAP) return { allowed: false, scope: 'agent' };

    // Record this request (best-effort — a failed insert must not block chat).
    // NB: supabase-js builders only execute when awaited/then'd; a bare `void`
    // would silently never run the insert.
    service
      .from('agent_chat_requests')
      .insert({ ip_hash: ipHash, agent_slug: agentSlug })
      .then(
        () => {},
        () => {},
      );
    return { allowed: true, scope: null };
  } catch {
    return { allowed: true, scope: null };
  }
}
