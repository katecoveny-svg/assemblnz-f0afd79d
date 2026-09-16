import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ owner: vi.fn(), accounts: vi.fn(), connect: vi.fn(), ready: vi.fn(), configured: vi.fn() }));
vi.mock('@/apps/do/services/owner', async original => ({ ...(await original<object>()), doOwner: mocks.owner }));
vi.mock('@/lib/connectors/pipedream', () => ({
  accountOwner: (a: { external_user_id?: string }) => a.external_user_id,
  doConnectorConfigured: mocks.ready, pipedreamConfigured: mocks.configured,
  listConnectedAccounts: mocks.accounts, connectDoGmail: mocks.connect,
  createConnectLink: mocks.connect, withAppFilter: vi.fn(),
}));
import { GET, POST } from './route';
const request = (app: string, origin = 'https://www.assembl.co.nz') => new Request('https://www.assembl.co.nz/api/do/connections', {
  method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify({ app, externalId: 'other-owner' }),
});
beforeEach(() => {
  vi.resetAllMocks(); mocks.owner.mockResolvedValue({ externalId: 'do:user:owner' });
  mocks.configured.mockReturnValue(true); mocks.ready.mockImplementation(app => app !== 'gmail');
  mocks.accounts.mockResolvedValue([]);
});
describe('DO connector authority and availability', () => {
  it('reports Gmail setup missing without misreporting all providers unavailable', async () => {
    const data = await (await GET()).json();
    expect(data.availability).toMatchObject({ gmail: false, hubspot: true });
  });
  it('blocks missing Gmail setup before minting an OAuth link', async () => {
    expect((await POST(request('gmail'))).status).toBe(503); expect(mocks.connect).not.toHaveBeenCalled();
  });
  it('does not expose other owners accounts', async () => {
    mocks.accounts.mockResolvedValue([{ external_user_id: 'other-owner', name: 'private mailbox' }]);
    expect((await (await GET()).json()).accounts).toEqual([]);
  });
  it('reports provider failure as unknown rather than disconnected', async () => {
    mocks.accounts.mockRejectedValue(new Error('provider unavailable'));
    expect((await (await GET()).json()).accountsAvailable).toBe(false);
  });
  it('uses authenticated owner, ignoring body owner injection', async () => {
    mocks.ready.mockReturnValue(true); mocks.connect.mockResolvedValue('https://example.test/connect');
    expect((await POST(request('gmail'))).status).toBe(200);
    expect(mocks.connect).toHaveBeenCalledWith('do:user:owner');
  });
  it('rejects foreign-origin connector requests', async () => {
    expect((await POST(request('gmail', 'https://attacker.test'))).status).toBe(403);
    expect(mocks.owner).not.toHaveBeenCalled();
  });
  it('rejects anonymous requests', async () => {
    mocks.owner.mockResolvedValue(null); expect((await POST(request('gmail'))).status).toBe(401);
  });
});
