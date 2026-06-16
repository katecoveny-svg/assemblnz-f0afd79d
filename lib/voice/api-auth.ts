/**
 * Shared-secret check for the voice webhook surface.
 *
 * ElevenLabs server tools and the post-call webhook are configured to send a
 * secret header; we compare it (constant-time) to VOICE_WEBHOOK_SECRET. If the
 * env var is unset we allow the request through but flag it — that's the local
 * dev posture; prod MUST set the secret (enforced in the deploy checklist).
 */
import { timingSafeEqual } from 'node:crypto';

const HEADER = 'x-voice-secret';

export function checkWebhookSecret(req: Request): { ok: boolean; dev: boolean } {
  const expected = process.env.VOICE_WEBHOOK_SECRET;
  if (!expected) return { ok: true, dev: true };
  const got = req.headers.get(HEADER) ?? '';
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  const ok = a.length === b.length && timingSafeEqual(a, b);
  return { ok, dev: false };
}

/** JSON 401 helper. */
export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: 'unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
