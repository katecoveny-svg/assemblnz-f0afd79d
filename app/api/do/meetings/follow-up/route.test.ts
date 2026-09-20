import { beforeEach, describe, expect, it, vi } from 'vitest';
const calls = vi.hoisted(() => ({ owner: vi.fn(), rate: vi.fn(), queue: vi.fn(), read: vi.fn() }));
vi.mock('@/apps/do/services/owner', async original => ({ ...(await original<object>()), doOwner: calls.owner }));
vi.mock('@/lib/agents/chat-rate-limit', () => ({ checkChatRateLimit: calls.rate }));
vi.mock('@/apps/do/services/meeting-followup', () => ({ queueMeetingFollowup: calls.queue, readMeetingFollowup: calls.read }));
import { GET, POST } from './route';
const input = { requestId: '9e0fe4cd-ec85-4622-87dd-9de6a2931738', to: 'reviewer@example.com', subject: 'Reviewed next steps', body: 'Please review.', notes: 'Agreed to prepare the brief.', approved: true };
const url = 'https://www.assembl.co.nz/api/do/meetings/follow-up';
const request = (body: unknown = input, origin = 'https://www.assembl.co.nz') => new Request(url, { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
beforeEach(() => { vi.resetAllMocks(); calls.owner.mockResolvedValue({ id: 'owner-a' }); calls.rate.mockResolvedValue({ allowed: true }); calls.queue.mockResolvedValue({ id: 'saved-request', status: 'pending' }); });
describe('meeting follow-up boundary', () => {
  it('requires same-origin, authenticated ownership and explicit review', async () => {
    expect((await POST(request(input, 'https://attacker.test'))).status).toBe(403);
    expect((await POST(request({ ...input, approved: false }))).status).toBe(400);
    expect((await POST(request({ ...input, ownerId: 'owner-b' }))).status).toBe(400);
    calls.owner.mockResolvedValue(null); expect((await POST(request())).status).toBe(401); expect(calls.queue).not.toHaveBeenCalled();
  });
  it('uses server identity and returns pending rather than send success', async () => {
    const response = await POST(request()); expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ receipt: { id: 'saved-request', status: 'pending' } });
    expect(calls.queue).toHaveBeenCalledExactlyOnceWith('owner-a', input); expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it('bounds chunked bodies and refuses rate-limited writes', async () => {
    expect((await POST(request({ ...input, notes: 'x'.repeat(65_000) }))).status).toBe(413);
    calls.rate.mockResolvedValue({ allowed: false }); expect((await POST(request())).status).toBe(429); expect(calls.queue).not.toHaveBeenCalled();
  });
  it('redacts failures and never invents saved requests', async () => {
    calls.queue.mockRejectedValue(new Error('secret database detail'));
    const response = await POST(request()); expect(response.status).toBe(503); expect(await response.text()).not.toContain('secret');
  });
  it('scopes receipt checks to the owner and hides absent requests', async () => {
    calls.read.mockResolvedValue(null); expect((await GET(new Request(`${url}?requestId=${input.requestId}`))).status).toBe(404);
    expect(calls.read).toHaveBeenCalledWith('owner-a', input.requestId);
    calls.owner.mockResolvedValue(null); expect((await GET(new Request(`${url}?requestId=${input.requestId}`))).status).toBe(401);
  });
});
