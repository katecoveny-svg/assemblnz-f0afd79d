import 'server-only';
import { createHash, randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { getServiceClient } from '@/lib/supabase/service';
import { clientIp } from '@/lib/vessel/rate-limit';
import {
  GATE_COOKIE_CAPTURED,
  GATE_COOKIE_ID,
  GATE_COOKIE_MAX_AGE,
  type GateTier,
  type SurfaceKind,
  limitFor,
} from '@/lib/gating/config';

export type GateVerdict = {
  allowed: boolean;
  remaining: number; // Infinity for paid
  limit: number; // Infinity for paid
  tier: GateTier;
  surface: string;
};

function identityHash(gid: string, ip: string): string {
  const salt =
    process.env.GATING_IP_HASH_SALT || process.env.VESSEL_IP_HASH_SALT || 'assembl-gate';
  return createHash('sha256').update(`${gid}|${ip}|${salt}`).digest('hex');
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Resolve (and lazily mint) the long-lived anonymous identity cookie, then read
 * the captured/paid state to decide the tier. Must run inside a Route Handler or
 * Server Action so the cookie jar is writable.
 */
async function resolveTier(paid: boolean): Promise<{ gid: string; tier: GateTier }> {
  const jar = await cookies();
  let gid = jar.get(GATE_COOKIE_ID)?.value;
  if (!gid) {
    gid = randomUUID();
    jar.set(GATE_COOKIE_ID, gid, {
      maxAge: GATE_COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });
  }
  if (paid) return { gid, tier: 'paid' };
  const captured = jar.get(GATE_COOKIE_CAPTURED)?.value === '1';
  return { gid, tier: captured ? 'email' : 'anon' };
}

async function currentCount(identity: string, surface: string): Promise<number> {
  const service = getServiceClient();
  const { data } = await service
    .from('assembl_usage_counters')
    .select('count')
    .eq('identity_hash', identity)
    .eq('surface', surface)
    .eq('window_date', todayUtc())
    .maybeSingle();
  return data?.count ?? 0;
}

/**
 * Check remaining quota WITHOUT consuming. Use to render the "X remaining"
 * counter or to gate a UI before the user acts.
 */
export async function peekGate(
  req: Request,
  kind: SurfaceKind,
  key: string,
  opts?: { paid?: boolean },
): Promise<GateVerdict> {
  const surface = `${kind}:${key}`;
  const { gid, tier } = await resolveTier(Boolean(opts?.paid));
  const limit = limitFor(kind, tier);
  if (!Number.isFinite(limit)) {
    return { allowed: true, remaining: Infinity, limit, tier, surface };
  }
  const current = await currentCount(identityHash(gid, clientIp(req.headers)), surface);
  return {
    allowed: current < limit,
    remaining: Math.max(0, limit - current),
    limit,
    tier,
    surface,
  };
}

/**
 * Check quota and, if allowed, consume one unit atomically. Returns the verdict
 * with the post-consume `remaining`. When `allowed` is false the caller should
 * return 402/429 and surface the email-capture modal.
 */
export async function gate(
  req: Request,
  kind: SurfaceKind,
  key: string,
  opts?: { paid?: boolean },
): Promise<GateVerdict> {
  const surface = `${kind}:${key}`;
  const { gid, tier } = await resolveTier(Boolean(opts?.paid));
  const limit = limitFor(kind, tier);
  if (!Number.isFinite(limit)) {
    return { allowed: true, remaining: Infinity, limit, tier, surface };
  }
  const identity = identityHash(gid, clientIp(req.headers));
  const current = await currentCount(identity, surface);
  if (current >= limit) {
    return { allowed: false, remaining: 0, limit, tier, surface };
  }
  const service = getServiceClient();
  const { data } = await service.rpc('assembl_bump_usage', {
    p_identity: identity,
    p_surface: surface,
  });
  const newCount = typeof data === 'number' ? data : current + 1;
  return {
    allowed: true,
    remaining: Math.max(0, limit - newCount),
    limit,
    tier,
    surface,
  };
}

/** Persist the email-captured flag (called by the capture route on success). */
export async function markCaptured(): Promise<void> {
  const jar = await cookies();
  jar.set(GATE_COOKIE_CAPTURED, '1', {
    maxAge: GATE_COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  });
}

/** Standard headers so clients can render the remaining counter. */
export function gateHeaders(verdict: GateVerdict): Record<string, string> {
  return {
    'X-Gate-Tier': verdict.tier,
    'X-Gate-Limit': Number.isFinite(verdict.limit) ? String(verdict.limit) : 'unlimited',
    'X-Gate-Remaining': Number.isFinite(verdict.remaining) ? String(verdict.remaining) : 'unlimited',
  };
}

/** 402 response body used when a gate blocks an anonymous/email visitor. */
export function gateBlockedResponse(verdict: GateVerdict) {
  return Response.json(
    {
      error: 'limit_reached',
      tier: verdict.tier,
      limit: verdict.limit,
      capture: verdict.tier === 'anon', // anon → prompt for email; email → must sign in / upgrade
      message:
        verdict.tier === 'anon'
          ? 'You’ve reached the free limit. Add your email to keep going.'
          : 'You’ve reached the daily limit. Sign in to a paid plan for unlimited use.',
    },
    { status: 402, headers: { ...gateHeaders(verdict), 'Cache-Control': 'no-store' } },
  );
}
