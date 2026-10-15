import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ owner: vi.fn(), readiness: vi.fn(), read: vi.fn(), admit: vi.fn() }));
vi.mock('@/apps/do/services/owner', () => ({ doOwner: mocks.owner, sameDoOrigin: (req: Request) => req.headers.get('origin') === new URL(req.url).origin, privateDoHeaders: { 'Cache-Control': 'private, no-store', Vary: 'Cookie' } }));
vi.mock('@/apps/do/shared/http', async importOriginal => ({ ...await importOriginal<typeof import('@/apps/do/shared/http')>(), admitDoRequest: mocks.admit }));
vi.mock('@/apps/do/mail/server', () => ({ mailReadiness: mocks.readiness, readMail: mocks.read, MailError: class extends Error {} }));
import { GET, POST } from './route';
import { MAIL_READ_CONSENT } from '@/apps/do/mail/contract';
const owner = { id: '11111111-1111-4111-8111-111111111111', externalId: 'do:user:11111111-1111-4111-8111-111111111111' };
const input = { ownerId: owner.id, requestId: '33333333-3333-4333-8333-333333333333', consentVersion: MAIL_READ_CONSENT, search: { accountId: 'gmail_two', terms: 'Example Clinic', days: 7 }, operation: 'search', messageIds: [] };
const req = (body: unknown = input, origin = 'https://do.example.invalid') => new Request('https://do.example.invalid/api/do/mail', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
beforeEach(() => { vi.clearAllMocks(); mocks.owner.mockResolvedValue(owner); mocks.admit.mockReturnValue(true); mocks.read.mockResolvedValue({ status: 'review' }); mocks.readiness.mockResolvedValue({ ownerId: owner.id, metadataOnly: true, accounts: [] }); });
describe('mail HTTP authority boundary', () => {
  it('GET is metadata-only and private, with a final owner recheck', async () => {
    const response = await GET(new Request('https://do.example.invalid/api/do/mail'));
    expect(await response.json()).toMatchObject({ metadataOnly: true });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(mocks.read).not.toHaveBeenCalled(); expect(mocks.owner).toHaveBeenCalledTimes(2);
  });
  it('rejects caller-selected metadata owner queries before provider access', async () => {
    expect((await GET(new Request('https://do.example.invalid/api/do/mail?ownerId=other'))).status).toBe(400);
    expect(mocks.readiness).not.toHaveBeenCalled();
  });
  it('discards metadata cancelled during the final owner recheck', async () => {
    const controller = new AbortController();
    mocks.owner.mockResolvedValueOnce(owner).mockImplementationOnce(async () => { controller.abort(); return owner; });
    const response = await GET(new Request('https://do.example.invalid/api/do/mail', { signal: controller.signal }));
    expect(response.status).toBe(503); expect(await response.text()).not.toContain(owner.id);
  });
  it('rejects a metadata response after owner switch', async () => {
    mocks.owner.mockResolvedValueOnce(owner).mockResolvedValueOnce(null);
    expect((await GET(new Request('https://do.example.invalid/api/do/mail'))).status).toBe(409);
  });
  it('rejects unauthenticated, cross-origin and stale owner requests before mail', async () => {
    expect((await POST(req(input, 'https://other.invalid'))).status).toBe(403);
    mocks.owner.mockResolvedValueOnce(null); expect((await POST(req())).status).toBe(401);
    expect((await POST(req({ ...input, ownerId: '22222222-2222-4222-8222-222222222222' }))).status).toBe(409);
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it('requires task consent and rejects oversized/unknown inputs', async () => {
    expect((await POST(req({ ...input, consentVersion: null }))).status).toBe(400);
    expect((await POST(req({ ...input, url: 'https://attacker.invalid' }))).status).toBe(400);
    expect((await POST(req({ padding: 'x'.repeat(5000) }))).status).toBe(400);
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it('uses owner-based request admission and never echoes provider failures', async () => {
    mocks.admit.mockReturnValueOnce(false); expect((await POST(req())).status).toBe(429);
    expect(mocks.admit).toHaveBeenCalledWith(`mail-read:${owner.id}`);
    mocks.read.mockRejectedValueOnce(new Error('secret-token and private body'));
    const response = await POST(req()); expect(response.status).toBe(503);
    expect(await response.text()).not.toMatch(/secret-token|private body/);
  });
});
