// Rate limit: 20 generations per hour per user (HARD constraint).
// Supabase-backed when configured (survives across serverless instances); falls back to
// an in-memory sliding window otherwise, so it still enforces in dev / single-instance.

import "server-only";
import { getServiceClient } from "@/lib/supabase/service";

export const HOURLY_LIMIT = 20;
const WINDOW_MS = 60 * 60 * 1000;

/** Stable-ish per-user key from the request: invite/session cookie, else forwarded IP. */
export function rateKey(req: Request): string {
  const cookie = req.headers.get("cookie") ?? "";
  const uid = /(?:^|;\s*)creative_uid=([^;]+)/.exec(cookie)?.[1];
  if (uid) return `uid:${decodeURIComponent(uid)}`;
  const invite = /(?:^|;\s*)assembl_demo_invite=([^;]+)/.exec(cookie)?.[1];
  if (invite) return `inv:${invite.slice(0, 24)}`;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon";
  return `ip:${ip}`;
}

const memory = new Map<string, number[]>();

function memHit(key: string): { ok: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const hits = (memory.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= HOURLY_LIMIT) {
    const resetMs = WINDOW_MS - (now - hits[0]);
    memory.set(key, hits);
    return { ok: false, remaining: 0, resetMs };
  }
  hits.push(now);
  memory.set(key, hits);
  return { ok: true, remaining: HOURLY_LIMIT - hits.length, resetMs: WINDOW_MS };
}

export interface RateResult {
  ok: boolean;
  remaining: number;
  limit: number;
  resetMs: number;
}

/** Check-and-record one generation for `key`. Returns whether it's allowed. */
export async function consume(key: string, kind: string): Promise<RateResult> {
  // Try Supabase first for cross-instance correctness.
  try {
    const sb = getServiceClient();
    const sinceIso = new Date(Date.now() - WINDOW_MS).toISOString();
    const { count, error } = await sb
      .from("auaha_generations")
      .select("id", { count: "exact", head: true })
      .eq("rate_key", key)
      .gte("created_at", sinceIso);
    if (!error && typeof count === "number") {
      if (count >= HOURLY_LIMIT) {
        return { ok: false, remaining: 0, limit: HOURLY_LIMIT, resetMs: WINDOW_MS };
      }
      await sb.from("auaha_generations").insert({ rate_key: key, kind });
      return { ok: true, remaining: HOURLY_LIMIT - count - 1, limit: HOURLY_LIMIT, resetMs: WINDOW_MS };
    }
  } catch {
    /* Supabase not configured or table absent — fall through to memory. */
  }
  const m = memHit(key);
  return { ok: m.ok, remaining: m.remaining, limit: HOURLY_LIMIT, resetMs: m.resetMs };
}
