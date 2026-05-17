import 'server-only';
import { createHash } from 'node:crypto';
import { getServiceClient } from '@/lib/supabase/service';

/**
 * Public vessel generator rate limit.
 *
 * 5 generations per IP per day for anonymous (non-BYOK) calls. BYOK callers
 * are uncapped — they pay their own Fal.ai costs.
 *
 * "Day" is a 24-hour rolling window, not a calendar day — simpler reasoning
 * and avoids midnight-NZT bursts.
 *
 * IP is stored hashed (SHA-256 over IP + a per-deployment salt). The salt
 * lives in env (VESSEL_IP_HASH_SALT) so a hash dump can't be reversed to
 * raw IPs by an attacker who only has DB read.
 */
export const PUBLIC_DAILY_CAP = 5;
const WINDOW_HOURS = 24;

function hashIp(ip: string): string {
  const salt = process.env.VESSEL_IP_HASH_SALT ?? 'assembl-vessel-default-salt';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

/**
 * Best-effort caller-IP extraction. Vercel sets x-forwarded-for; in dev
 * we fall back to a stable string so local testing still works.
 */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

export type RateLimitVerdict = {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  ipHash: string;
};

export async function checkPublicRateLimit(ip: string): Promise<RateLimitVerdict> {
  const ipHash = hashIp(ip);
  const since = new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000).toISOString();

  let service: ReturnType<typeof getServiceClient>;
  try {
    service = getServiceClient();
  } catch {
    // If the service client is unavailable we fail open — better to let one
    // visitor generate than to block everyone with a misconfigured deploy.
    return { allowed: true, remaining: PUBLIC_DAILY_CAP, resetSeconds: 0, ipHash };
  }

  const { count, error } = await service
    .from('vessel_generations')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .eq('byok', false)
    .gte('created_at', since);

  if (error) {
    return { allowed: true, remaining: PUBLIC_DAILY_CAP, resetSeconds: 0, ipHash };
  }

  const used = count ?? 0;
  const remaining = Math.max(0, PUBLIC_DAILY_CAP - used);
  const allowed = used < PUBLIC_DAILY_CAP;

  return {
    allowed,
    remaining,
    resetSeconds: allowed ? 0 : WINDOW_HOURS * 60 * 60,
    ipHash,
  };
}

export function rateLimitedResponse(verdict: RateLimitVerdict) {
  return Response.json(
    {
      error: `Daily limit reached (${PUBLIC_DAILY_CAP} generations per day). Bring your own Fal.ai key to remove the cap.`,
      remaining: 0,
      resetSeconds: verdict.resetSeconds,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(verdict.resetSeconds),
        'X-RateLimit-Limit': String(PUBLIC_DAILY_CAP),
        'X-RateLimit-Remaining': '0',
      },
    },
  );
}
