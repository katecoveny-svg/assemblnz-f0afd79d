import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('@/apps/do/services/owner', () => ({ doOwner: vi.fn(), privateDoHeaders: { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }, sameDoOrigin: (r: Request) => r.headers.get('origin') === new URL(r.url).origin }));
import { doOwner } from '@/apps/do/services/owner';
import { GET, POST } from './route';
const url = 'https://www.assembl.co.nz/api/do/browser-actions';
const req = (body: unknown, origin = 'https://www.assembl.co.nz') => new Request(url, { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
describe('browser action boundary', () => {
  beforeEach(() => vi.mocked(doOwner).mockResolvedValue({ id: 'owner', externalId: 'do:user:owner' }));
  it('requires a verified owner for status and mutations', async () => { vi.mocked(doOwner).mockResolvedValue(null); expect((await GET()).status).toBe(401); expect((await POST(req({}))).status).toBe(401); });
  it('does not grant an extension token or cross-origin authority', async () => { expect((await POST(req({}, 'chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'))).status).toBe(403); });
  it('returns no-store unavailable status for every surface', async () => { const r = await GET(); expect(r.headers.get('Cache-Control')).toBe('private, no-store'); expect(await r.json()).toMatchObject({ state: 'unavailable', canMutateCart: false, persistence: 'not_configured' }); });
  it('rejects malformed and unknown actions', async () => { expect((await POST(req({ action: 'checkout' }))).status).toBe(400); });
  it('keeps valid requests closed without configured pairing/storage', async () => { expect((await POST(req({ action: 'revoke', connectionId: '11111111-1111-4111-8111-111111111111' }))).status).toBe(503); });
});
