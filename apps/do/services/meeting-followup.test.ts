import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ client: vi.fn(), create: vi.fn(), eq: vi.fn(), single: vi.fn() }));
vi.mock('@/lib/supabase/service', () => ({ getServiceClient: mocks.client }));
vi.mock('@/lib/agents/action-requests', () => ({ createActionRequest: mocks.create }));
import { meetingRequestId, queueMeetingFollowup, readMeetingFollowup } from './meeting-followup';
const input = { requestId: '9e0fe4cd-ec85-4622-87dd-9de6a2931738', to: 'reviewer@example.com', subject: 'Reviewed', body: 'Draft', notes: 'Reviewed source notes', approved: true as const };
beforeEach(() => {
  vi.resetAllMocks(); const chain = { select: vi.fn(), eq: mocks.eq, maybeSingle: mocks.single };
  chain.select.mockReturnValue(chain); mocks.eq.mockReturnValue(chain); mocks.client.mockReturnValue({ from: () => chain }); mocks.create.mockResolvedValue({ id: 'saved' });
  mocks.single.mockResolvedValue({ data: { id: 'saved', status: 'pending', created_at: '2026-09-19T00:00:00Z', payload: { meetingSourceHash: 'hash', to: 'private@example.com', body: 'private' } }, error: null });
});
describe('meeting approval persistence', () => {
  it('uses stable owner-scoped IDs and the existing queue, not an executor', async () => {
    expect(meetingRequestId('a', input.requestId)).toBe(meetingRequestId('a', input.requestId)); expect(meetingRequestId('a', input.requestId)).not.toBe(meetingRequestId('b', input.requestId));
    await queueMeetingFollowup('owner-a', input);
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ requestedBy: 'owner-a', kind: 'email_draft', requestId: meetingRequestId('owner-a', input.requestId), payload: expect.objectContaining({ to: input.to, body: input.body, meetingSourceHash: expect.stringMatching(/^[a-f0-9]{64}$/) }) }));
  });
  it('scopes service-role reads and returns only receipt fields', async () => {
    const receipt = await readMeetingFollowup('owner-a', input.requestId);
    expect(mocks.eq).toHaveBeenCalledWith('requested_by', 'owner-a'); expect(mocks.eq).toHaveBeenCalledWith('agent_slug', 'meeting-do'); expect(mocks.eq).toHaveBeenCalledWith('kind', 'email_draft');
    expect(JSON.stringify(receipt)).not.toContain('private');
  });
  it('never downgrades database failure to a local success claim', async () => {
    mocks.create.mockResolvedValue(null); await expect(queueMeetingFollowup('owner-a', input)).rejects.toThrow('could not be confirmed');
    mocks.single.mockResolvedValue({ data: null, error: new Error('database unavailable') }); await expect(readMeetingFollowup('owner-a', input.requestId)).rejects.toThrow('unavailable');
  });
});
