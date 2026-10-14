import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ owner: vi.fn(), require: vi.fn(), state: vi.fn(), approve: vi.fn(), receive: vi.fn(), transition: vi.fn(), eventOwner: vi.fn() }));
vi.mock('@/apps/do/services/owner', async original => ({ ...await original<typeof import('@/apps/do/services/owner')>(), doOwner: mocks.owner }));
vi.mock('@/apps/do/enquiries/service', () => ({
  EnquiryError: class extends Error { status = 403; }, requireEnquiryOwner: mocks.require, enquiryState: mocks.state,
  approveEnquiry: mocks.approve, receiveEnquiry: mocks.receive, transitionEnquiry: mocks.transition, enquiryEventOwner: mocks.eventOwner,
  rotateEnquiryConnection: vi.fn(), revokeEnquiryConnection: vi.fn(), prepareEnquiryFollowups: vi.fn(), enquiryPluginAccess: vi.fn(),
}));
import { GET, POST } from './route';
import { POST as event } from './events/route';
const owner = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const id = '11111111-1111-4111-8111-111111111111';
function request(body: unknown, headers: Record<string, string> = {}) { return new Request('https://www.assembl.co.nz/api/do/enquiries', { method: 'POST', headers: { origin: 'https://www.assembl.co.nz', 'content-type': 'application/json', 'x-do-workspace': owner, ...headers }, body: JSON.stringify(body) }); }
beforeEach(() => { vi.resetAllMocks(); mocks.owner.mockResolvedValue({ id: owner }); mocks.state.mockResolvedValue({ jobs: [] }); mocks.approve.mockResolvedValue({ id }); });
it('requires sign-in before reading private records', async () => { mocks.owner.mockResolvedValue(null); expect((await GET()).status).toBe(401); expect(mocks.state).not.toHaveBeenCalled(); });
it('requires same-origin and current workspace before approval', async () => {
  const p = { action: 'approve', id, revision: id, confirmSend: true };
  expect((await POST(request(p, { origin: 'https://evil.invalid' }))).status).toBe(403);
  expect((await POST(request(p, { 'x-do-workspace': 'another-account' }))).status).toBe(409);
  expect(mocks.approve).not.toHaveBeenCalled();
});
it('requires explicit send confirmation and validates input size', async () => {
  expect((await POST(request({ action: 'approve', id, revision: id }))).status).toBe(400);
  expect((await POST(request({ action: 'approve', id, revision: id, confirmSend: true, extra: 'x'.repeat(22000) }))).status).toBe(400);
  expect(mocks.approve).not.toHaveBeenCalled();
});
it('passes only the verified owner to the approval service', async () => {
  const r = await POST(request({ action: 'approve', id, revision: id, confirmSend: true, ownerId: 'attacker' }));
  expect(r.status).toBe(200); expect(mocks.approve).toHaveBeenCalledWith(owner, id, id);
  expect(r.headers.get('cache-control')).toBe('private, no-store');
});
it('event connections cannot approve or send', async () => {
  mocks.eventOwner.mockResolvedValue(owner);
  expect((await event(request({ event: 'approve', id, revision: id, confirmSend: true }))).status).toBe(400);
  expect(mocks.approve).not.toHaveBeenCalled(); expect(mocks.transition).not.toHaveBeenCalled();
});
it('requires evidence for a recorded reply or booking', async () => {
  mocks.eventOwner.mockResolvedValue(owner);
  expect((await event(request({ event: 'booked', id }))).status).toBe(400);
  expect(mocks.transition).not.toHaveBeenCalled();
});
it('scope for a webhook comes from its secret, never its body', async () => {
  mocks.eventOwner.mockResolvedValue(owner); mocks.transition.mockResolvedValue({ id, status: 'sent' });
  const r = await event(request({ event: 'answered', id, evidence: 'Inbound provider reference 123', ownerId: 'attacker' }));
  expect(r.status).toBe(200); expect(mocks.transition).toHaveBeenCalledWith(owner, id, 'answered', { evidence: 'Inbound provider reference 123', source: 'connected_system' });
});
