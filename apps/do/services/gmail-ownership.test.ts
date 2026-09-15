import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
let fetcher: ReturnType<typeof vi.fn>;
const owner = 'do:user:aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
beforeEach(() => { vi.resetModules(); vi.stubEnv('PIPEDREAM_CLIENT_ID', 'test'); vi.stubEnv('PIPEDREAM_CLIENT_SECRET', 'test'); vi.stubEnv('PIPEDREAM_PROJECT_ID', 'proj_test'); vi.stubEnv('DO_GMAIL_OAUTH_APP_ID', 'oa_test'); fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
function accounts(id: string, healthy = true) { fetcher.mockResolvedValueOnce(Response.json({ access_token: 'test', expires_in: 3600 })).mockResolvedValueOnce(Response.json({ data: [{ id: 'apn_test', external_user_id: id, app: { name_slug: 'gmail' }, healthy }] })); }
describe('Gmail owner isolation', () => {
  it('rejects shared demo ownership before network access', async () => { const { doGmailReader } = await import('@/lib/connectors/pipedream'); await expect(doGmailReader('demo')).rejects.toThrow(); expect(fetcher).not.toHaveBeenCalled(); });
  it('never uses another account owner or an unhealthy account', async () => { accounts('do:user:bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'); const { doGmailReader } = await import('@/lib/connectors/pipedream'); await expect(doGmailReader(owner)).rejects.toThrow('Connect Gmail'); expect(fetcher).toHaveBeenCalledTimes(2); });
  it('pins reads to me and GET, and rejects send/attachment/foreign URLs', async () => {
    accounts(owner); const { doGmailReader } = await import('@/lib/connectors/pipedream'); const read = await doGmailReader(owner);
    for (const path of ['https://evil.example', 'messages/send', 'messages/abc/attachments/xyz', '../other']) await expect(read(path)).rejects.toThrow();
    fetcher.mockResolvedValueOnce(Response.json({ messages: [] })); await read('messages?maxResults=20');
    const [url, options] = fetcher.mock.calls[2]; expect(options.method).toBe('GET'); expect(url).toContain('external_user_id=do%3Auser%3A');
    const target = String(url).split('/proxy/')[1].split('?')[0]; expect(Buffer.from(target, 'base64url').toString()).toBe('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20');
  });
  it('does not allow connections without a configured narrow OAuth client', async () => { vi.stubEnv('DO_GMAIL_OAUTH_APP_ID', ''); const { connectDoGmail } = await import('@/lib/connectors/pipedream'); await expect(connectDoGmail(owner)).rejects.toThrow(); expect(fetcher).not.toHaveBeenCalled(); });
});
