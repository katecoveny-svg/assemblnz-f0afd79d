import { afterEach, describe, expect, it, vi } from 'vitest';
import { GMAIL_READ_SCOPE, verifiedMailGrant } from '@/apps/do/mail/capability';
import { createPipedreamMailGrantVerifier } from './pipedream-mail-grant';

const owner = 'do:user:11111111-1111-4111-8111-111111111111';
const other = 'do:user:22222222-2222-4222-8222-222222222222';
const now = Date.parse('2026-10-14T12:00:00Z');
const row = { id: 'apn_second', external_id: owner, app: { name_slug: 'gmail' },
  healthy: true, dead: false, error: null, authorized_scopes: [GMAIL_READ_SCOPE],
  created_at: '2026-10-01T00:00:00Z', updated_at: '2026-10-14T11:00:00Z', expires_at: '2026-10-14T13:00:00Z' };
function fixture(rows: unknown = [{ ...row, id: 'apn_first' }, row, { ...row, id: 'apn_outlook', app: { name_slug: 'microsoft_outlook' } }]) {
  const ports = { configured: vi.fn().mockReturnValue(true), accounts: vi.fn().mockResolvedValue(rows),
    retrieve: vi.fn().mockResolvedValue(row), now: vi.fn().mockReturnValue(now) };
  return { ports, verify: createPipedreamMailGrantVerifier(ports) };
}
const signal = () => new AbortController().signal;
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('authoritative Pipedream Gmail grant metadata', () => {
  it('binds only the explicit second Gmail account and preserves actual expiry', async () => {
    const { ports, verify } = fixture();
    const result = await verify(owner, row.id, signal());
    expect(verifiedMailGrant(result, owner, row.id, now)).toBe(true);
    expect(result).toMatchObject({ accountId: row.id, externalOwner: owner, expiresAt: Date.parse(row.expires_at), checkedAt: now });
    expect(ports.retrieve).toHaveBeenCalledExactlyOnceWith(owner, row.id, expect.any(AbortSignal));
    expect(ports.accounts).toHaveBeenCalledTimes(2);
  });
  it.each([
    ['revoked', { dead: true }], ['unhealthy', { healthy: false }], ['unknown health', { healthy: undefined }],
    ['missing dead status', { dead: undefined }], ['provider error', { error: 'synthetic' }],
    ['expired', { expires_at: '2026-10-14T12:00:00Z' }], ['missing expiry', { expires_at: undefined }],
    ['invalid expiry', { expires_at: 'tomorrow' }], ['missing scopes', { authorized_scopes: undefined }],
    ['empty scopes', { authorized_scopes: [] }], ['broad scopes', { authorized_scopes: [GMAIL_READ_SCOPE, 'https://mail.google.com/'] }],
    ['send', { authorized_scopes: [GMAIL_READ_SCOPE, 'https://www.googleapis.com/auth/gmail.send'] }],
    ['contacts', { authorized_scopes: [GMAIL_READ_SCOPE, 'https://www.googleapis.com/auth/contacts.readonly'] }],
    ['wrong owner', { external_id: other }], ['conflicting owner', { external_user_id: other }],
    ['missing owner', { external_id: undefined }], ['wrong provider', { app: { name_slug: 'microsoft_outlook' } }],
    ['missing revision', { updated_at: undefined }], ['future revision', { updated_at: '2026-10-15T00:00:00Z' }],
    ['credential response', { credentials: { oauth_access_token: 'synthetic-only' } }],
    ['app configured scopes only', { authorized_scopes: undefined, app: { name_slug: 'gmail', scope_profiles: [{ name: 'read_only', scopes: [GMAIL_READ_SCOPE] }] } }],
  ])('denies %s without retrieving a credential or mailbox', async (_label, change) => {
    const { ports, verify } = fixture([{ ...row, ...change }]);
    expect(await verify(owner, row.id, signal())).toBeNull();
    expect(ports.retrieve).not.toHaveBeenCalled();
  });
  it('rejects duplicate IDs even if one duplicate belongs to a different owner', async () => {
    const { verify } = fixture([row, { ...row, external_id: other }]);
    expect(await verify(owner, row.id, signal())).toBeNull();
  });
  it('does not borrow scopes from another connected account', async () => {
    const { verify } = fixture([{ ...row, id: 'apn_first' }, { ...row, authorized_scopes: [] }]);
    expect(await verify(owner, row.id, signal())).toBeNull();
  });
  it.each(['id', 'owner', 'scope', 'revision', 'expiry'])('rejects a changed %s in the exact-account response', async kind => {
    const { ports, verify } = fixture();
    const changes = { id: { id: 'apn_first' }, owner: { external_id: other }, scope: { authorized_scopes: [] },
      revision: { updated_at: '2026-10-14T11:30:00Z' }, expiry: { expires_at: '2026-10-14T14:00:00Z' } };
    ports.retrieve.mockResolvedValue({ ...row, ...changes[kind as keyof typeof changes] });
    expect(await verify(owner, row.id, signal())).toBeNull();
    expect(ports.accounts).toHaveBeenCalledTimes(1);
  });
  it.each(['reconnect', 'revoke', 'remove', 'duplicate'])('rejects %s during metadata retrieval', async kind => {
    const { ports, verify } = fixture();
    const changed = kind === 'reconnect' ? [{ ...row, updated_at: '2026-10-14T11:30:00Z' }] :
      kind === 'revoke' ? [{ ...row, dead: true }] : kind === 'duplicate' ? [row, row] : [];
    ports.accounts.mockResolvedValueOnce([row]).mockResolvedValueOnce(changed);
    expect(await verify(owner, row.id, signal())).toBeNull();
  });
  it('rejects late, cancelled and unavailable metadata without leaking errors', async () => {
    const late = fixture(); late.ports.now.mockReturnValueOnce(now).mockReturnValue(now + 60_001);
    expect(await late.verify(owner, row.id, signal())).toBeNull();
    const cancelled = fixture(); const controller = new AbortController();
    cancelled.ports.retrieve.mockImplementation(async () => { controller.abort(); return row; });
    await expect(cancelled.verify(owner, row.id, controller.signal)).rejects.toThrow();
    const unavailable = fixture(); unavailable.ports.retrieve.mockRejectedValue(new Error('private provider detail'));
    expect(await unavailable.verify(owner, row.id, signal())).toBeNull();
  });
  it('rejects malformed owners/accounts before any metadata request', async () => {
    const { ports, verify } = fixture();
    for (const badOwner of ['tenant:example', 'do:user:not-a-uuid', other + '/']) expect(await verify(badOwner, row.id, signal())).toBeNull();
    expect(await verify(owner, '../credentials', signal())).toBeNull();
    expect(ports.accounts).not.toHaveBeenCalled();
  });
  it('wires the production verifier to fixed bounded metadata GETs with credentials excluded', async () => {
    vi.resetModules();
    for (const key of ['PIPEDREAM_CLIENT_ID', 'PIPEDREAM_CLIENT_SECRET', 'PIPEDREAM_PROJECT_ID', 'DO_GMAIL_OAUTH_APP_ID']) vi.stubEnv(key, 'synthetic');
    const liveTime = Date.now();
    const fresh = { ...row, expires_at: new Date(liveTime + 300_000).toISOString(), created_at: new Date(liveTime - 120_000).toISOString(), updated_at: new Date(liveTime - 60_000).toISOString() };
    const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ access_token: 'synthetic', expires_in: 3600 }))
      .mockResolvedValueOnce(Response.json({ data: [fresh] })).mockResolvedValueOnce(Response.json(fresh))
      .mockResolvedValueOnce(Response.json({ data: [fresh] }));
    vi.stubGlobal('fetch', fetcher);
    const { verifyPersonalMailGrant } = await import('@/apps/do/mail/capability');
    expect(verifiedMailGrant(await verifyPersonalMailGrant(owner, row.id, signal()), owner, row.id)).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(4);
    for (const [url, options] of fetcher.mock.calls.slice(1)) {
      expect(String(url)).toContain('include_credentials=false');
      expect(String(url)).not.toContain('/proxy/');
      expect(options).toMatchObject({ method: 'GET', redirect: 'error' });
    }
    expect(fetcher.mock.calls[2][0]).toBe('https://api.pipedream.com/v1/connect/synthetic/accounts/apn_second?include_credentials=false');
  });
});
