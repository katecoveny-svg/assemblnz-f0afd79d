import 'server-only';
import { createHash, randomBytes } from 'node:crypto';
import { GOOGLE_FREE_BUSY_SCOPE } from './google';
/** Preparation only: no redirect, token exchange, persistence or provider call. */
export function prepareGoogleOAuth(ownerId: string, browserBinding: string, now: number) {
  if (!ownerId || browserBinding.length < 32 || !Number.isFinite(now)) throw new Error('Verified owner/browser binding required');
  const state = randomBytes(32).toString('base64url');
  const verifier = randomBytes(32).toString('base64url');
  const nonce = randomBytes(32).toString('base64url');
  const hash = (value: string) => createHash('sha256').update(value).digest('base64url');
  return {
    browser: { state, nonce, codeChallenge: hash(verifier), codeChallengeMethod: 'S256' as const, scopes: ['openid', 'email', GOOGLE_FREE_BUSY_SCOPE] },
    // Persist privately in an encrypted vault; never expose this record to a browser.
    privateRecord: { ownerId, browserBindingHash: hash(browserBinding), stateHash: hash(state), nonceHash: hash(nonce), verifier, provider: 'google' as const, expiresAt: new Date(now + 600000).toISOString() },
  };
}
