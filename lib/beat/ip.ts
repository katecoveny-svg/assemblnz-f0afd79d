/**
 * Salted, one-way IP hashing for Beat by assembl fraud detection.
 *
 * The trust contract is absolute: we NEVER store a raw IP. We store a salted
 * SHA-256 hash, used only for hourly caps and farm detection, and it cannot be
 * reversed. The salt lives in env BEAT_IP_SALT (server-only).
 *
 * If no salt is configured or no IP is present, we return null and simply don't
 * record an identifier — we never fall back to storing the raw value.
 */
import 'server-only';
import { createHash } from 'node:crypto';

export function hashIp(ip: string | null | undefined): string | null {
  const salt = process.env.BEAT_IP_SALT;
  if (!salt) {
    console.warn('[beat] BEAT_IP_SALT is not set — impressions will have no ip_hash.');
    return null;
  }
  if (!ip) return null;
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}

/** Best-effort client IP from standard proxy headers. */
export function clientIp(headers: Headers): string | null {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return headers.get('x-real-ip') ?? headers.get('cf-connecting-ip') ?? null;
}
