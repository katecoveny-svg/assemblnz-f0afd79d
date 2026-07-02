/**
 * Demo magic-link crypto — edge-safe (Web Crypto only, no Node imports) so
 * the same primitives run in middleware and in server components/actions.
 *
 * Link shape: /for/[demo]-[recipient-shortname]-[token6]
 * The 6-char token IS the last slug segment: the first 6 hex chars of
 * HMAC-SHA256(prefix, DEMO_INVITE_SECRET) where prefix is everything before
 * the final dash. The middleware verifies this HMAC (constant-time) BEFORE
 * any DB lookup, so unauthenticated traffic can never turn the invite table
 * into a scan oracle.
 *
 * Browser grant: once a link verifies, we set a signed httpOnly cookie
 * `demo:slug.sig` (sig = full HMAC over `cookie:demo:slug`). The cookie
 * proves which invite this browser arrived on; revocation is still checked
 * live against the DB on every gated request — killing a row locks the
 * browser out immediately, no cache delay.
 */

export const INVITE_COOKIE = 'assembl_demo_invite';
export const INVITE_TOKEN_LENGTH = 6;

const encoder = new TextEncoder();

export function getInviteSecret(): string | null {
  const v = process.env.DEMO_INVITE_SECRET;
  return v && v.trim().length >= 16 ? v.trim() : null;
}

async function hmacHex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function sha256Hex(message: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(message));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Constant-time string equality (compares fixed-length digests/tokens). */
export function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = encoder.encode(a);
  const bb = encoder.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

/** The 6-char token for a slug prefix (`happy-tails-liana` → `a3f9b2`). */
export async function inviteToken(prefix: string, secret: string): Promise<string> {
  const mac = await hmacHex(`invite:${prefix}`, secret);
  return mac.slice(0, INVITE_TOKEN_LENGTH);
}

/** Full invite slug for a prefix: `${prefix}-${token6}`. */
export async function buildInviteSlug(prefix: string, secret: string): Promise<string> {
  return `${prefix}-${await inviteToken(prefix, secret)}`;
}

/**
 * Verify a presented slug's embedded token. Returns true only when the last
 * segment equals HMAC(prefix) — checked constant-time. Cheap enough to run
 * before any DB round trip.
 */
export async function verifyInviteSlug(slug: string, secret: string): Promise<boolean> {
  const cut = slug.lastIndexOf('-');
  if (cut <= 0 || cut === slug.length - 1) return false;
  const prefix = slug.slice(0, cut);
  const token = slug.slice(cut + 1);
  if (token.length !== INVITE_TOKEN_LENGTH) return false;
  return timingSafeEqualStr(token, await inviteToken(prefix, secret));
}

/** Signed cookie value binding this browser to one demo + one invite. */
export async function buildInviteCookieValue(
  demo: string,
  slug: string,
  secret: string,
): Promise<string> {
  const sig = await hmacHex(`cookie:${demo}:${slug}`, secret);
  return `${demo}:${slug}.${sig}`;
}

export type InviteCookiePayload = { demo: string; slug: string };

/** Parse + verify the invite cookie. Null on any mismatch — fail closed. */
export async function verifyInviteCookieValue(
  value: string | undefined,
  secret: string,
): Promise<InviteCookiePayload | null> {
  if (!value) return null;
  const dot = value.lastIndexOf('.');
  if (dot <= 0) return null;
  const body = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const colon = body.indexOf(':');
  if (colon <= 0) return null;
  const demo = body.slice(0, colon);
  const slug = body.slice(colon + 1);
  const expected = await hmacHex(`cookie:${demo}:${slug}`, secret);
  if (!timingSafeEqualStr(sig, expected)) return null;
  return { demo, slug };
}
