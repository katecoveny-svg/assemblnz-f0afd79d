import { expect, it, vi } from 'vitest';
import { GMAIL_READ_SCOPE, verifiedMailGrant, verifyPersonalMailGrant } from './capability';
const owner = 'do:user:11111111-1111-4111-8111-111111111111';
const now = 100_000;
const grant = { externalOwner: owner, accountId: 'gmail_two', provider: 'gmail', source: 'provider_grant_metadata', revision: 'a'.repeat(64), scopes: [GMAIL_READ_SCOPE], checkedAt: now, expiresAt: now + 60_000 };
it('validates bounded account-specific read-only evidence from a server verifier', () => {
  expect(verifiedMailGrant(grant, owner, 'gmail_two', now)).toBe(true);
  for (const override of [
    { revision: undefined }, { revision: 'not-a-revision' }, { externalOwner: 'foreign' }, { accountId: 'gmail_one' }, { provider: 'microsoft_outlook' },
    { source: 'healthy_account' }, { scopes: [] }, { scopes: [GMAIL_READ_SCOPE, 'https://www.googleapis.com/auth/gmail.send'] },
    { scopes: [GMAIL_READ_SCOPE, 'https://www.googleapis.com/auth/contacts.readonly'] },
    { scopes: ['https://mail.google.com/'] }, { checkedAt: now - 60_001 }, { checkedAt: now + 1 }, { expiresAt: now },
  ]) expect(verifiedMailGrant({ ...grant, ...override }, owner, 'gmail_two', now)).toBe(false);
});
it('production verifier returns no capability without provider configuration', async () => {
  vi.stubEnv('PIPEDREAM_CLIENT_ID', '');
  const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
  try {
    expect(await verifyPersonalMailGrant(owner, 'gmail_two', new AbortController().signal)).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  } finally { vi.unstubAllEnvs(); vi.unstubAllGlobals(); }
});
