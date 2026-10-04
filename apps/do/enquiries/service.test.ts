import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), send: vi.fn(), user: vi.fn() }));
vi.mock('@/lib/supabase/service', () => ({ getServiceClient: () => ({ rpc: mocks.rpc, auth: { admin: { getUserById: mocks.user } } }) }));
vi.mock('@/lib/admin/ensureAdmin', () => ({ isFounderAdminEmail: (email: string) => email === 'kate@assembl.co.nz' }));
vi.mock('@/lib/agent-email/send', () => ({ sendAgentEmail: mocks.send }));
import { approveEnquiry, prepareEnquiryFollowups, receiveEnquiry, requireEnquiryOwner } from './service';
import { enquiryFunnel, type EnquiryJob } from './contract';
const job = { id: 'job', owner_id: 'owner', revision: 'review-1', email: 'customer@example.invalid', subject: 'Reviewed subject', body: 'Reviewed body', status: 'sending' };
beforeEach(() => {
  vi.resetAllMocks(); vi.stubEnv('BREVO_API_KEY', 'test-only'); vi.stubEnv('DO_ENQUIRY_SEND_DISABLED', 'false');
  mocks.rpc.mockImplementation(async (name: string, input: Record<string, unknown>) => ({ data: { ...job, ...(input.p_action === 'finish' ? { status: 'sent' } : {}) }, error: null }));
  mocks.send.mockResolvedValue({ ok: true, agentEmail: 'front@assembl.co.nz', messageId: 'provider-receipt' });
});
describe('approved enquiry dispatch', () => {
  it('claims the reviewed revision, sends the stored payload, and saves the provider receipt', async () => {
    await approveEnquiry('owner', 'job', 'review-1');
    expect(mocks.rpc.mock.calls[0][1]).toEqual({ p_owner: 'owner', p_id: 'job', p_action: 'approve', p_input: { revision: 'review-1', source: 'owner' } });
    expect(mocks.send).toHaveBeenCalledWith({ agentSlug: 'front', agentName: 'assembl', toEmail: job.email, subject: job.subject, body: job.body, timeoutMs: 20_000 });
    expect(mocks.rpc.mock.calls[1][1].p_input).toMatchObject({ status: 'sent', providerId: 'provider-receipt', revision: 'review-1' });
    expect(mocks.rpc.mock.invocationCallOrder[0]).toBeLessThan(mocks.send.mock.invocationCallOrder[0]);
  });
  it('never sends when another approval won or the draft changed', async () => {
    mocks.rpc.mockResolvedValue({ error: { message: 'review_changed' }, data: null });
    await expect(approveEnquiry('owner', 'job', 'old')).rejects.toThrow('review_changed');
    expect(mocks.send).not.toHaveBeenCalled();
  });
  it('checks availability before claiming a job', async () => {
    vi.stubEnv('DO_ENQUIRY_SEND_DISABLED', 'true');
    await expect(approveEnquiry('owner', 'job', 'review-1')).rejects.toThrow('not configured');
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it.each([
    [{ ok: true, agentEmail: 'front@assembl.co.nz' }, 'uncertain'],
    [{ ok: false, error: 'timeout' }, 'uncertain'],
    [{ ok: false, error: 'rejected', definitiveRejection: true }, 'failed'],
  ])('does not claim success for an unconfirmed transport result', async (result, expected) => {
    mocks.send.mockResolvedValue(result);
    await approveEnquiry('owner', 'job', 'review-1');
    expect(mocks.rpc.mock.calls[1][1].p_input.status).toBe(expected);
    expect(mocks.send).toHaveBeenCalledTimes(1);
  });
  it('does not send again if storing the provider receipt fails', async () => {
    mocks.rpc.mockResolvedValueOnce({ data: job, error: null }).mockResolvedValueOnce({ data: null, error: { message: 'db_unavailable' } });
    await expect(approveEnquiry('owner', 'job', 'review-1')).rejects.toThrow('Refresh');
    expect(mocks.send).toHaveBeenCalledTimes(1);
  });
  it('scopes manual follow-up checks to the verified owner', async () => {
    await prepareEnquiryFollowups('owner');
    expect(mocks.rpc).toHaveBeenCalledWith('do_enquiry_followups', { p_limit: 20, p_owner: 'owner' });
  });
  it('uses a stable request hash and source namespace for duplicate events', async () => {
    const input = { requestId: 'id', name: 'Aroha', email: 'aroha@example.invalid', message: 'Can you help?' };
    await receiveEnquiry('owner', input, 'plugin'); await receiveEnquiry('owner', input, 'plugin');
    expect(mocks.rpc.mock.calls[0]).toEqual(mocks.rpc.mock.calls[1]);
    expect(mocks.rpc.mock.calls[0][1]).toMatchObject({ p_owner: 'owner', p_key: 'plugin:id' });
  });
  it('rejects unconfirmed, anonymous and non-founder accounts', async () => {
    for (const user of [{ email: 'kate@assembl.co.nz' }, { email: 'kate@assembl.co.nz', email_confirmed_at: 'now', is_anonymous: true }, { email: 'other@example.invalid', email_confirmed_at: 'now' }]) {
      mocks.user.mockResolvedValue({ data: { user }, error: null });
      await expect(requireEnquiryOwner('owner')).rejects.toThrow('private');
    }
    mocks.user.mockResolvedValue({ data: { user: { email: 'kate@assembl.co.nz', email_confirmed_at: 'now' } }, error: null });
    await expect(requireEnquiryOwner('owner')).resolves.toBeUndefined();
  });
  it('never counts drafts, ambiguous sends or follow-up jobs as completed funnel stages', () => {
    const rows = [{ parent_id: null, approved_at: 'now', sent_at: null }, { parent_id: null, approved_at: 'now', sent_at: 'now', answered_at: 'now' }, { parent_id: 'first', approved_at: 'now', sent_at: 'now', answered_at: 'now', booked_at: 'now' }] as EnquiryJob[];
    expect(enquiryFunnel(rows)).toEqual({ received: 2, approved: 2, sent: 1, answered: 1, booked: 0 });
  });
});
