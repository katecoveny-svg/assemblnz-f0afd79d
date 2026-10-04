import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/apps/do/personal/service', () => ({ personalWorkerConfigured: vi.fn(), runPersonal: vi.fn(), personalHeartbeat: vi.fn() }));
vi.mock('@/apps/do/enquiries/service', () => ({ prepareEnquiryFollowups: vi.fn() }));
import { GET } from './route';
import { personalHeartbeat, personalWorkerConfigured, runPersonal } from '@/apps/do/personal/service';
import { prepareEnquiryFollowups } from '@/apps/do/enquiries/service';
const request = () => new Request('https://www.assembl.co.nz/api/do/personal/cron', { headers: { authorization: 'Bearer fictional-test-only' } });
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv('CRON_SECRET', 'fictional-test-only'); vi.mocked(personalWorkerConfigured).mockReturnValue(false); vi.mocked(prepareEnquiryFollowups).mockResolvedValue(2); vi.mocked(personalHeartbeat).mockResolvedValue(undefined); });
afterEach(() => vi.unstubAllEnvs());
describe('Independent cron work while Personal grants are disabled', () => {
  it.each([false, true])('preserves enquiries and heartbeat with queued Personal responsibilities=%s', async queued => {
    vi.mocked(runPersonal).mockResolvedValue({ claimed: queued, published: queued });
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ claimed: 0, published: 0, followupsPrepared: 2, personal: { status: 'disabled', reason: 'provider_permission_renewal_required' } });
    expect(runPersonal).not.toHaveBeenCalled(); expect(prepareEnquiryFollowups).toHaveBeenCalledOnce(); expect(personalHeartbeat).toHaveBeenCalledOnce();
  });
  it('auth failure cannot process enquiries, heartbeat or Personal work', async () => {
    expect((await GET(new Request('https://www.assembl.co.nz/api/do/personal/cron'))).status).toBe(401);
    expect(prepareEnquiryFollowups).not.toHaveBeenCalled(); expect(personalHeartbeat).not.toHaveBeenCalled(); expect(runPersonal).not.toHaveBeenCalled();
  });
});
