/**
 * assembl — private-concept access control
 * ----------------------------------------
 * "Unlisted" is not private (brief §4). Flagship concepts are reached only with
 * a valid access token (a magic link / cookie), checked SERVER-SIDE.
 *
 * Production path: signed HMAC tokens with an embedded expiry, keyed by
 * `CONCEPT_MAGIC_SECRET`. Revoke by rotating that secret (invalidates all
 * outstanding links) — a per-token deny-list is the documented next step.
 *
 * Staging path (no secret configured): a single documented dev key
 * (`CONCEPT_DEV_KEY`, default `assembl-preview`) so the concept is shareable in a
 * preview without shipping a real secret — clearly weaker, and logged as such.
 */

import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

export const CONCEPT_COOKIE = 'assembl_concept_access';

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Mint a signed, expiring magic-link token for a concept. Requires a secret. */
export function mintConceptToken(slug: string, ttlDays = 30, now = Date.now()): string | null {
  const secret = process.env.CONCEPT_MAGIC_SECRET;
  if (!secret) return null;
  const exp = now + ttlDays * 24 * 60 * 60 * 1000;
  const payload = `${slug}.${exp}`;
  return `${b64url(payload)}.${sign(payload, secret)}`;
}

export type AccessResult = { ok: boolean; reason: 'valid' | 'dev' | 'missing' | 'invalid' | 'expired' };

/** Verify a provided token for a concept, server-side. */
export function verifyConceptAccess(slug: string, token: string | undefined, now = Date.now()): AccessResult {
  if (!token) return { ok: false, reason: 'missing' };

  const secret = process.env.CONCEPT_MAGIC_SECRET;
  if (!secret) {
    // Staging/dev boundary — documented, weaker than a signed link.
    const devKey = process.env.CONCEPT_DEV_KEY ?? 'assembl-preview';
    if (safeEqual(token, devKey)) return { ok: true, reason: 'dev' };
    return { ok: false, reason: 'invalid' };
  }

  const parts = token.split('.');
  if (parts.length !== 2) return { ok: false, reason: 'invalid' };
  let payload: string;
  try {
    payload = Buffer.from(parts[0], 'base64url').toString('utf8');
  } catch {
    return { ok: false, reason: 'invalid' };
  }
  const [tokenSlug, expStr] = payload.split('.');
  if (tokenSlug !== slug) return { ok: false, reason: 'invalid' };
  if (!safeEqual(parts[1], sign(payload, secret))) return { ok: false, reason: 'invalid' };
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < now) return { ok: false, reason: 'expired' };
  return { ok: true, reason: 'valid' };
}

/** Whether real signed protection is configured (vs the dev key). */
export function conceptProtectionConfigured(): boolean {
  return Boolean(process.env.CONCEPT_MAGIC_SECRET);
}
