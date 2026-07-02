/**
 * Shared-secret verification for the /api/identity/* inbound webhooks.
 *
 * TNZ and Brevo dashboards only take a URL (no custom signing), so the secret
 * rides either in an `x-identity-webhook-secret` header (preferred where the
 * provider supports custom headers) or a `?secret=` query param baked into the
 * webhook URL pasted into the provider dashboard.
 *
 * Fail closed: if IDENTITY_WEBHOOK_SECRET is unset, every request is rejected.
 * Comparison is constant-time (sha256 digests so lengths always match).
 */

import 'server-only';
import { createHash, timingSafeEqual } from 'node:crypto';

const HEADER = 'x-identity-webhook-secret';

function digest(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

export function verifyIdentityWebhookSecret(req: Request): boolean {
  const expected = process.env.IDENTITY_WEBHOOK_SECRET;
  if (!expected) return false; // fail closed — set the env before wiring providers

  const fromHeader = req.headers.get(HEADER);
  let fromQuery: string | null = null;
  try {
    fromQuery = new URL(req.url).searchParams.get('secret');
  } catch {
    fromQuery = null;
  }
  const provided = fromHeader ?? fromQuery;
  if (!provided) return false;

  return timingSafeEqual(digest(provided), digest(expected));
}
