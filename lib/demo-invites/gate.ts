/**
 * Demo-gate helpers shared between middleware and API routes.
 *
 * Two jobs:
 *   1. A hub-wide access pass — one signed link (`/demo-pass/<token>`) that
 *      grants the WHOLE demo host, not a single tenant. The token is the full
 *      HMAC of a fixed label under DEMO_INVITE_SECRET, so it's unguessable and
 *      rotates with the secret. It sets the same invite cookie the per-tenant
 *      links use, but with the `__hub__` marker that inviteCookieAllows honours
 *      for every scope.
 *   2. requestHasDemoGrant() — does an inbound request already carry a valid
 *      demo grant (shared basic-auth OR a signed invite/hub cookie)? The chat
 *      API is deliberately exempt from the basic-auth wall so embedded widgets
 *      work; this lets the API tell a genuine gated-demo viewer apart from
 *      anonymous public traffic, so pilot chat can run unmetered without
 *      opening a free-chat bypass on the open web.
 *
 * Edge-safe: Web Crypto only, no Node imports.
 */
import {
  INVITE_COOKIE,
  getInviteSecret,
  sha256Hex,
  timingSafeEqualStr,
  verifyInviteCookieValue,
} from '@/lib/demo-invites/crypto';

/** Cookie `demo` marker meaning "the whole demo host", not one tenant. */
export const HUB_DEMO_MARKER = '__hub__';

const HUB_LABEL = 'hub-access:v1';

async function hmacHex(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** The hub pass token (full HMAC — unguessable). Null if no secret set. */
export async function hubToken(): Promise<string | null> {
  const secret = getInviteSecret();
  if (!secret) return null;
  return hmacHex(HUB_LABEL, secret);
}

/** Constant-time verify of a presented hub token. */
export async function verifyHubToken(token: string): Promise<boolean> {
  const secret = getInviteSecret();
  if (!secret) return false;
  const expected = await hmacHex(HUB_LABEL, secret);
  return timingSafeEqualStr(token, expected);
}

/** Read one cookie value out of a raw Cookie header. */
function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return undefined;
}

/** SHA-256 constant-time equality over two strings. */
async function digestsEqual(a: string, b: string): Promise<boolean> {
  const [da, db] = await Promise.all([sha256Hex(a), sha256Hex(b)]);
  return timingSafeEqualStr(da, db);
}

/**
 * True when the request already holds a valid demo grant: the shared
 * basic-auth credential (browsers re-send it on same-origin API calls) OR a
 * signed invite/hub cookie. Used to run pilot chat unmetered for genuine
 * gated-demo viewers while public traffic stays metered.
 */
export async function requestHasDemoGrant(req: Request): Promise<boolean> {
  const secret = getInviteSecret();

  // 1. Signed invite / hub cookie.
  if (secret) {
    const cookie = readCookie(req.headers.get('cookie'), INVITE_COOKIE);
    const payload = await verifyInviteCookieValue(cookie, secret);
    if (payload) return true;
  }

  // 2. Shared basic-auth credential.
  const expectedUser = process.env.DEMO_BASIC_AUTH_USER;
  const expectedPassword = process.env.DEMO_BASIC_AUTH_PASSWORD;
  if (!expectedUser || !expectedPassword) return false;
  const header = req.headers.get('authorization') ?? '';
  if (!header.startsWith('Basic ')) return false;
  let decoded = '';
  try {
    decoded = atob(header.slice(6).trim());
  } catch {
    return false;
  }
  const sep = decoded.indexOf(':');
  if (sep < 0) return false;
  const [userOk, passOk] = await Promise.all([
    digestsEqual(decoded.slice(0, sep), expectedUser),
    digestsEqual(decoded.slice(sep + 1), expectedPassword),
  ]);
  return userOk && passOk;
}
