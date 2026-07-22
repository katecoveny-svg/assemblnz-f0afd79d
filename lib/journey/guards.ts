/**
 * assembl — journey server-action guards
 * --------------------------------------
 * Server-side rate limiting + input validation for the public sandbox. Enforced
 * before any model/tool invocation. Kept dependency-free: the limiter is an
 * in-process rolling window keyed by a salted IP hash — which works in staging
 * without extra infrastructure but is PER-INSTANCE in serverless (not a
 * distributed guarantee). Documented as such; the shape lets a Redis/Upstash or
 * Supabase-backed limiter drop in later.
 */

import 'server-only';
import { createHash } from 'node:crypto';

// ── configurable limits (per environment) ────────────────────────────────────
const num = (v: string | undefined, d: number) => {
  const n = v ? Number.parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : d;
};
export const RATE_MAX = num(process.env.JOURNEY_RATE_MAX, 30); // actions / window / ip
export const RATE_WINDOW_MS = num(process.env.JOURNEY_RATE_WINDOW_SEC, 60) * 1000;
export const INTENT_MAX_CHARS = num(process.env.JOURNEY_INTENT_MAX_CHARS, 2000);
export const CONTEXT_MAX_BYTES = num(process.env.JOURNEY_CONTEXT_MAX_BYTES, 8_000);
export const RUN_PAYLOAD_MAX_BYTES = num(process.env.JOURNEY_RUN_MAX_BYTES, 400_000);
export const RUN_ID_MAX = 128;
const RUN_ID_RE = /^[A-Za-z0-9_-]{1,128}$/;

// ── in-process rolling-window limiter ────────────────────────────────────────
const hits = new Map<string, number[]>();

function ipHash(ip: string): string {
  const salt = process.env.JOURNEY_IP_HASH_SALT ?? 'assembl-journey-default-salt';
  return createHash('sha256').update(`journey:${salt}:${ip}`).digest('hex').slice(0, 16);
}

export function clientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return headers.get('x-real-ip')?.trim() || 'unknown';
}

export type RateVerdict = { allowed: boolean; remaining: number; retryAfterSec: number };

/** Rolling-window check. `bucket` separates action classes (e.g. 'intent'). */
export function checkRateLimit(ip: string, bucket: string): RateVerdict {
  const key = `${bucket}:${ipHash(ip)}`;
  const now = Date.now();
  const since = now - RATE_WINDOW_MS;
  const arr = (hits.get(key) ?? []).filter((t) => t > since);
  if (arr.length >= RATE_MAX) {
    const retryAfterSec = Math.max(1, Math.ceil((arr[0] + RATE_WINDOW_MS - now) / 1000));
    // Structured, non-sensitive log (hashed ip only).
    console.warn(JSON.stringify({ evt: 'journey.rate_limited', bucket, ipHash: key.split(':')[1], count: arr.length }));
    return { allowed: false, remaining: 0, retryAfterSec };
  }
  arr.push(now);
  hits.set(key, arr);
  return { allowed: true, remaining: Math.max(0, RATE_MAX - arr.length), retryAfterSec: 0 };
}

/** Test/maintenance helper. */
export function _resetRateLimit(): void {
  hits.clear();
}

// ── input validation ─────────────────────────────────────────────────────────
export type InputVerdict = { ok: true; value: string } | { ok: false; reason: 'empty' | 'too_large'; message: string };

export function validateIntentInput(raw: unknown): InputVerdict {
  if (typeof raw !== 'string') return { ok: false, reason: 'empty', message: 'Please describe what you need.' };
  const value = raw.trim();
  if (value.length === 0) return { ok: false, reason: 'empty', message: 'Please describe what you need.' };
  if (value.length > INTENT_MAX_CHARS) {
    return { ok: false, reason: 'too_large', message: `That’s a bit long — please keep it under ${INTENT_MAX_CHARS} characters.` };
  }
  return { ok: true, value };
}

export function validateRunId(raw: unknown): raw is string {
  return typeof raw === 'string' && raw.length <= RUN_ID_MAX && RUN_ID_RE.test(raw);
}

/** Byte size of a JSON-serialisable value (UTF-8). */
export function byteSize(value: unknown): number {
  try {
    return Buffer.byteLength(JSON.stringify(value ?? null), 'utf8');
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

export function withinBytes(value: unknown, max: number): boolean {
  return byteSize(value) <= max;
}
