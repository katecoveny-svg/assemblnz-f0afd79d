import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ owner: vi.fn(), collect: vi.fn(), organise: vi.fn(), reserve: vi.fn(), release: vi.fn() }));
vi.mock('@/apps/do/services/owner', () => ({ doOwner: mocks.owner, privateDoHeaders: { 'Cache-Control': 'private, no-store' }, sameDoOrigin: (req: Request) => req.headers.get('origin') === new URL(req.url).origin }));
vi.mock('@/apps/do/services/family-server', () => ({ collectFamilyMail: mocks.collect, organiseFamilyMail: mocks.organise }));
vi.mock('@/apps/do/shared/trial', () => ({ reserveDoTrial: mocks.reserve, DoTrialError: class extends Error {} }));
vi.mock('@/apps/do/shared/http', () => ({ readDoJson: (req: Request) => req.json(), admitDoRequest: () => true }));
vi.mock('@/lib/agents/chat-rate-limit', () => ({ chatClientIp: () => 'test' }));
import { POST } from './route';
function request(origin = 'https://www.assembl.co.nz') { return new Request('https://www.assembl.co.nz/api/do/family', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ senders: ['office@school.example'], days: 14, consent: true }) }); }
beforeEach(() => { vi.clearAllMocks(); mocks.owner.mockResolvedValue({ id: 'mine', externalId: 'do:user:mine' }); mocks.reserve.mockResolvedValue({ release: mocks.release }); mocks.release.mockResolvedValue(undefined); });
describe('family request boundary', () => {
  it('rejects cross-origin requests and signed-out people before reading mail', async () => { expect((await POST(request('https://elsewhere.example'))).status).toBe(403); mocks.owner.mockResolvedValue(null); expect((await POST(request())).status).toBe(401); expect(mocks.collect).not.toHaveBeenCalled(); expect(mocks.reserve).not.toHaveBeenCalled(); });
  it('refunds an empty mailbox result without calling a model', async () => { mocks.collect.mockResolvedValue({ messages: [], moreAvailable: false }); const res = await POST(request()); expect((await res.json()).empty).toBe(true); expect(mocks.release).toHaveBeenCalledOnce(); expect(mocks.organise).not.toHaveBeenCalled(); });
  it('refunds provider failure and returns no private provider diagnostics', async () => { mocks.collect.mockRejectedValue(new Error('private message details')); const res = await POST(request()); expect(res.status).toBe(503); expect(await res.text()).not.toContain('private message details'); expect(mocks.release).toHaveBeenCalledOnce(); });
  it('returns only source metadata and quotes, not full emails', async () => {
    mocks.collect.mockResolvedValue({ messages: [{ id: 'abc', text: 'private full source', subject: 'Trip', from: 'office@school.example', date: 'Monday', truncated: false, hasAttachments: false }], moreAvailable: true }); mocks.organise.mockResolvedValue({ summary: 'Review trip', items: [], questions: [] });
    const res = await POST(request()); const body = await res.json(); expect(body.moreAvailable).toBe(true); expect(body.sources[0].text).toBeUndefined(); expect(body.stored).toBe(false); expect(mocks.release).not.toHaveBeenCalled(); expect(mocks.collect).toHaveBeenCalledWith('do:user:mine', ['office@school.example'], 14);
  });
});
