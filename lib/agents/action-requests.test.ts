import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only', () => ({}));
const m = vi.hoisted(() => ({ service: vi.fn(), single: vi.fn(), eq: vi.fn(), update: vi.fn(), receipt: vi.fn(), run: vi.fn() }));
vi.mock('@/lib/supabase/service', () => ({ getServiceClient: m.service }));
vi.mock('@/lib/agents/receipts', () => ({ writeActionReceipt: m.receipt }));
vi.mock('@/lib/connectors/pipedream', () => ({ pipedreamConfigured: () => true, runConnectorAction: m.run }));
import { decideActionRequest } from './action-requests';
const row = { id: 'review-1', kind: 'connector_action', agent_slug: 'flux', status: 'pending', payload: { action: 'create_email_draft', app: 'microsoft_outlook', externalUserId: 'tenant:mine', data: {} } };
beforeEach(() => { vi.clearAllMocks(); vi.stubEnv('ACTION_DISPATCH_ENABLED', 'true'); const chain = { select: vi.fn(), eq: m.eq, maybeSingle: m.single, update: m.update }; chain.select.mockReturnValue(chain); m.eq.mockReturnValue(chain); m.update.mockReturnValue(chain); m.service.mockReturnValue({ from: () => chain }); m.single.mockResolvedValueOnce({ data: row }); m.run.mockResolvedValue({ ok: true, detail: {} }); });
afterEach(() => vi.unstubAllEnvs());
describe('operator approval dispatch gate', () => {
  it('does not dispatch or record approval when another operator already claimed the row', async () => { m.single.mockResolvedValueOnce({ data: null, error: null }); await decideActionRequest('review-1', 'approved', 'operator-a'); expect(m.eq).toHaveBeenCalledWith('status', 'pending'); expect(m.run).not.toHaveBeenCalled(); expect(m.receipt).not.toHaveBeenCalled(); });
  it('does not dispatch after the approval write fails', async () => { m.single.mockResolvedValueOnce({ data: null, error: { message: 'unavailable' } }); await decideActionRequest('review-1', 'approved', 'operator-a'); expect(m.run).not.toHaveBeenCalled(); });
  it('keeps an approval on file without execution when dispatch is disabled', async () => { vi.stubEnv('ACTION_DISPATCH_ENABLED', 'false'); m.single.mockResolvedValueOnce({ data: { id: row.id }, error: null }); await decideActionRequest(row.id, 'approved', 'operator-a'); expect(m.receipt).toHaveBeenCalledWith(expect.objectContaining({ stage: 'approved', reviewer: 'operator-a' })); expect(m.run).not.toHaveBeenCalled(); });
  it('dispatches the unchanged connector payload only after a successful claim and enabled execution', async () => { m.single.mockResolvedValueOnce({ data: { id: row.id }, error: null }); await decideActionRequest(row.id, 'approved', 'operator-a'); expect(m.run).toHaveBeenCalledExactlyOnceWith({ externalUserId: row.payload.externalUserId, action: 'create_email_draft', app: 'microsoft_outlook', data: {} }); });
});
