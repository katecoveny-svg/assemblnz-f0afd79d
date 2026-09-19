import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ client: vi.fn(), receipt: vi.fn(), insert: vi.fn(), eq: vi.fn(), single: vi.fn(), maybeSingle: vi.fn() }));
vi.mock('@/lib/supabase/service', () => ({ getServiceClient: mocks.client }));
vi.mock('@/lib/agents/receipts', () => ({ writeActionReceipt: mocks.receipt }));
import { createActionRequest } from './action-requests';
const input = { requestId: '9e0fe4cd-ec85-4622-87dd-9de6a2931738', agentSlug: 'meeting-do', requestedBy: 'owner-a', kind: 'email_draft' as const, payload: { to: 'test@example.com', subject: 'Review', body: 'Exact draft', reason: 'Reviewed' } };
beforeEach(() => {
  vi.resetAllMocks(); const chain = { insert: mocks.insert, select: vi.fn(), eq: mocks.eq, single: mocks.single, maybeSingle: mocks.maybeSingle };
  chain.select.mockReturnValue(chain); mocks.insert.mockReturnValue(chain); mocks.eq.mockReturnValue(chain); mocks.client.mockReturnValue({ from: () => chain });
});
describe('retry-safe action preparation', () => {
  it('reuses an identical request after a conflict without another receipt', async () => {
    mocks.single.mockResolvedValue({ data: null, error: { code: '23505' } });
    mocks.maybeSingle.mockResolvedValue({ data: { id: input.requestId, payload: { body: 'Exact draft', reason: 'Reviewed', subject: 'Review', to: 'test@example.com' } }, error: null });
    expect(await createActionRequest(input)).toEqual({ id: input.requestId });
    expect(mocks.eq).toHaveBeenCalledWith('requested_by', 'owner-a'); expect(mocks.eq).toHaveBeenCalledWith('kind', 'email_draft'); expect(mocks.receipt).not.toHaveBeenCalled();
  });
  it('refuses a changed recipient under the same request ID', async () => {
    mocks.single.mockResolvedValue({ data: null, error: { code: '23505' } }); mocks.maybeSingle.mockResolvedValue({ data: { id: input.requestId, payload: { ...input.payload, to: 'other@example.com' } }, error: null });
    expect(await createActionRequest(input)).toBeNull(); expect(mocks.receipt).not.toHaveBeenCalled();
  });
  it('inserts and receipts an ordinary first request once', async () => {
    mocks.single.mockResolvedValue({ data: { id: input.requestId }, error: null }); expect(await createActionRequest(input)).toEqual({ id: input.requestId });
    expect(mocks.receipt).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ requestId: input.requestId, stage: 'requested' })); expect(mocks.maybeSingle).not.toHaveBeenCalled();
  });
});
