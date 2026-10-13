import 'server-only';
import { z } from 'zod';

export const GMAIL_READ_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
const evidence = z.object({
  externalOwner: z.string(), accountId: z.string(), provider: z.literal('gmail'),
  source: z.literal('provider_grant_metadata'), scopes: z.array(z.string()).max(20),
  checkedAt: z.number().finite(), expiresAt: z.number().finite(),
}).strict();
export type MailGrantEvidence = z.infer<typeof evidence>;
export type MailGrantVerifier = (owner: string, account: string, signal: AbortSignal) => Promise<unknown>;

/** Only server-obtained grant metadata may enter this validator, never request/account claims. */
export function verifiedMailGrant(value: unknown, owner: string, account: string, now = Date.now()): boolean {
  const parsed = evidence.safeParse(value);
  if (!parsed.success) return false;
  const grant = parsed.data;
  const identity = new Set(['openid', 'profile', 'email', 'https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']);
  return grant.externalOwner === owner && grant.accountId === account &&
    grant.checkedAt <= now && now - grant.checkedAt <= 60_000 && grant.expiresAt > now &&
    grant.scopes.includes(GMAIL_READ_SCOPE) && grant.scopes.every(scope => scope === GMAIL_READ_SCOPE || identity.has(scope));
}

/** Current connector metadata has no authoritative account-specific scope/expiry proof.
 * Fail closed. No env toggle, healthy flag, custom-client ID or user claim can enable reads.
 * A future provider-backed verifier requires separate implementation and approval.
 */
export const verifyPersonalMailGrant: MailGrantVerifier = async (_owner, _account, signal) => {
  signal.throwIfAborted();
  return null;
};
