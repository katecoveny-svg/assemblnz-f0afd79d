import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/apps/do/personal/service', () => ({ personalWorkerMode: vi.fn(() => "worksheet"), personalWorkerConfigured: vi.fn(), runPersonal: vi.fn(), personalHeartbeat: vi.fn(), maintainPersonalResponsibilityStorage: vi.fn() }));
vi.mock('@/apps/do/personal/memory-maintenance-server', () => ({ maintainPersonalMemory: vi.fn() }));
vi.mock('@/apps/do/enquiries/service', () => ({ prepareEnquiryFollowups: vi.fn() }));
import { GET } from './route';
import { maintainPersonalResponsibilityStorage, personalHeartbeat, personalWorkerConfigured, runPersonal } from '@/apps/do/personal/service';
import { maintainPersonalMemory } from '@/apps/do/personal/memory-maintenance-server';
import { prepareEnquiryFollowups } from '@/apps/do/enquiries/service';
const request = () => new Request('https://www.assembl.co.nz/api/do/personal/cron', { headers: { authorization: 'Bearer fictional-test-only' } });
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv('CRON_SECRET', 'fictional-test-only'); vi.mocked(personalWorkerConfigured).mockReturnValue(false); vi.mocked(prepareEnquiryFollowups).mockResolvedValue(2); vi.mocked(maintainPersonalResponsibilityStorage).mockResolvedValue({ configured: false }); vi.mocked(maintainPersonalMemory).mockResolvedValue({ configured: false }); vi.mocked(personalHeartbeat).mockResolvedValue(undefined); });
afterEach(() => vi.unstubAllEnvs());
describe('Independent cron work while Personal grants are disabled', () => {
  it.each([false, true])('preserves enquiries and heartbeat with queued Personal responsibilities=%s', async queued => {
    vi.mocked(runPersonal).mockResolvedValue({ claimed: queued, published: queued });
    const response = await GET(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ claimed: 0, published: 0, followupsPrepared: 2, maintenance: { responsibilities: { configured: false }, memory: { configured: false } }, personal: { status: 'disabled', reason: 'provider_permission_renewal_required' } });
    expect(maintainPersonalResponsibilityStorage).toHaveBeenCalledOnce(); expect(maintainPersonalMemory).toHaveBeenCalledOnce();
    expect(runPersonal).not.toHaveBeenCalled(); expect(prepareEnquiryFollowups).toHaveBeenCalledOnce(); expect(personalHeartbeat).toHaveBeenCalledOnce();
  });
  it('auth failure cannot process enquiries, heartbeat or Personal work', async () => {
    expect((await GET(new Request('https://www.assembl.co.nz/api/do/personal/cron'))).status).toBe(401);
    expect(maintainPersonalResponsibilityStorage).not.toHaveBeenCalled(); expect(maintainPersonalMemory).not.toHaveBeenCalled();
    expect(prepareEnquiryFollowups).not.toHaveBeenCalled(); expect(personalHeartbeat).not.toHaveBeenCalled(); expect(runPersonal).not.toHaveBeenCalled();
  });
});


describe('Retention is isolated from optional cron work', () => {
  it.each(['enquiries', 'personal', 'heartbeat'])('runs both maintenance checks before %s fails', async failure => {
    if (failure === 'enquiries') vi.mocked(prepareEnquiryFollowups).mockRejectedValue(new Error('synthetic failure'));
    if (failure === 'personal') {
      vi.mocked(personalWorkerConfigured).mockReturnValue(true);
      vi.mocked(runPersonal).mockRejectedValue(new Error('synthetic failure'));
    }
    if (failure === 'heartbeat') vi.mocked(personalHeartbeat).mockRejectedValue(new Error('synthetic failure'));
    expect((await GET(request())).status).toBe(503);
    expect(maintainPersonalResponsibilityStorage).toHaveBeenCalledOnce();
    expect(maintainPersonalMemory).toHaveBeenCalledOnce();
    expect(vi.mocked(maintainPersonalMemory).mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(prepareEnquiryFollowups).mock.invocationCallOrder[0]);
  });
  it.each(['responsibilities', 'memory'])('isolates a failed %s maintenance check', async failure => {
    vi.mocked(failure === 'responsibilities' ? maintainPersonalResponsibilityStorage : maintainPersonalMemory).mockRejectedValue(new Error('synthetic failure'));
    const response = await GET(request());
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.maintenance[failure]).toEqual({ configured: true, failed: true });
    expect(maintainPersonalResponsibilityStorage).toHaveBeenCalledOnce();
    expect(maintainPersonalMemory).toHaveBeenCalledOnce();
    expect(prepareEnquiryFollowups).toHaveBeenCalledOnce();
  });
  it.each(['', 'incorrect-test-secret'])('cannot run maintenance with missing or mismatched secret', async secret => {
    vi.stubEnv('CRON_SECRET', secret);
    expect((await GET(request())).status).toBe(401);
    expect(maintainPersonalResponsibilityStorage).not.toHaveBeenCalled();
    expect(maintainPersonalMemory).not.toHaveBeenCalled();
    expect(prepareEnquiryFollowups).not.toHaveBeenCalled();
  });
});
