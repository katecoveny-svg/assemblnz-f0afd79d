import { gmailGrantSnapshot } from './pipedream-mail-grant';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const grantVerifier = vi.hoisted(() => vi.fn());
vi.mock('@/apps/do/mail/capability', async importOriginal => ({ ...await importOriginal<typeof import('@/apps/do/mail/capability')>(), verifyPersonalMailGrant: grantVerifier }));
const owner = 'do:user:11111111-1111-4111-8111-111111111111';
let fetcher: ReturnType<typeof vi.fn>;
const search = { accountId: 'second', terms: 'Example Clinic', days: 7 as const };
const grantFields = { dead: false, authorized_scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
  created_at: new Date(Date.now() - 120_000).toISOString(), updated_at: new Date(Date.now() - 60_000).toISOString(), expires_at: new Date(Date.now() + 300_000).toISOString() };
const rows = [{ ...grantFields, id: 'first', healthy: true, app: { name_slug: 'gmail' }, external_user_id: owner }, { ...grantFields, id: 'second', healthy: true, app: { name_slug: 'gmail' }, external_user_id: owner }];
beforeEach(() => { vi.resetModules(); vi.stubEnv('DO_PERSONAL_MAIL_READ_ENABLED', 'true'); grantVerifier.mockImplementation(async (externalOwner, accountId, signal) => { signal.throwIfAborted(); return gmailGrantSnapshot(rows.find(row => row.id === accountId), externalOwner, accountId, Date.now()); }); vi.stubEnv('PIPEDREAM_CLIENT_ID', 'synthetic'); vi.stubEnv('PIPEDREAM_CLIENT_SECRET', 'synthetic'); vi.stubEnv('PIPEDREAM_PROJECT_ID', 'proj_fixture'); vi.stubEnv('DO_GMAIL_OAUTH_APP_ID', 'oa_fixture'); fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
function setup(accounts = rows) { fetcher.mockResolvedValueOnce(Response.json({ access_token: 'synthetic', expires_in: 3600 })).mockResolvedValueOnce(Response.json({ data: accounts })); }
describe('mail transport allowlist', () => {
  it('blocks direct transport calls without verified scope evidence before any network request', async () => {
    grantVerifier.mockResolvedValue(null);
    const { doPersonalMailRead } = await import('./pipedream');
    await expect(doPersonalMailRead(owner, 'second', { kind: 'search', search }, new AbortController().signal)).rejects.toThrow('gmail_read_unverified');
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('pins account two and only a bounded GET to Gmail me/messages', async () => {
    setup(); fetcher.mockResolvedValueOnce(Response.json({ messages: [] }));
    const { doPersonalMailRead } = await import('./pipedream');
    await doPersonalMailRead(owner, 'second', { kind: 'search', search }, new AbortController().signal);
    const [url, options] = fetcher.mock.calls[2];
    expect(url).toContain('account_id=second'); expect(options).toMatchObject({ method: 'GET', redirect: 'error' });
    const upstream = new URL(Buffer.from(String(url).split('/proxy/')[1].split('?')[0], 'base64url').toString());
    expect(upstream.origin + upstream.pathname).toBe('https://gmail.googleapis.com/gmail/v1/users/me/messages');
    expect(upstream.searchParams.get('maxResults')).toBe('10');
    expect(upstream.searchParams.get('q')).toBe('"Example" "Clinic" newer_than:7d -in:spam -in:trash');
  });
  it('discards direct transport results if the grant changes during the proxy call', async () => {
    setup(); fetcher.mockImplementationOnce(async () => {
      grantVerifier.mockResolvedValue({ externalOwner: owner, accountId: 'second', provider: 'gmail',
        source: 'provider_grant_metadata', revision: 'b'.repeat(64),
        scopes: ['https://www.googleapis.com/auth/gmail.readonly'], checkedAt: Date.now(), expiresAt: Date.now() + 300_000 });
      return Response.json({ messages: [] });
    });
    const { doPersonalMailRead } = await import('./pipedream');
    await expect(doPersonalMailRead(owner, 'second', { kind: 'search', search }, new AbortController().signal)).rejects.toThrow('gmail_read_unverified');
  });
  it('rejects foreign or duplicate selected accounts without a proxy call', async () => {
    setup([rows[1], rows[1]]); const { doPersonalMailRead } = await import('./pipedream');
    await expect(doPersonalMailRead(owner, 'second', { kind: 'search', search }, new AbortController().signal)).rejects.toThrow('mail_account_unavailable');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
  it('bounds upstream bytes and suppresses expired-grant error bodies', async () => {
    setup(); fetcher.mockResolvedValueOnce(Response.json({ messages: [], ignored: 'x'.repeat(17_000) }));
    const { doPersonalMailRead } = await import('./pipedream');
    await expect(doPersonalMailRead(owner, 'second', { kind: 'search', search }, new AbortController().signal)).rejects.toThrow('mail_response_too_large');
    fetcher.mockResolvedValueOnce(Response.json({ data: rows })).mockResolvedValueOnce(new Response('private provider failure', { status: 401 }));
    await expect(doPersonalMailRead(owner, 'second', { kind: 'search', search }, new AbortController().signal)).rejects.toThrow('mail_provider_unavailable');
  });
  it('rejects cancelled calls and message path injection before a proxy request', async () => {
    const { doPersonalMailRead } = await import('./pipedream');
    const controller = new AbortController(); controller.abort();
    await expect(doPersonalMailRead(owner, 'second', { kind: 'search', search }, controller.signal)).rejects.toThrow();
    for (const id of ['../send', 'abc/attachments/one', 'abc?format=raw']) await expect(doPersonalMailRead(owner, 'second', { kind: 'message', messageId: id, full: true }, new AbortController().signal)).rejects.toThrow();
    expect(fetcher).not.toHaveBeenCalled();
  });
});
