import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ generate: vi.fn(), reserve: vi.fn(), release: vi.fn() }));
vi.mock('@/lib/creative/generate', () => ({ generateImages: mocks.generate }));
vi.mock('@/apps/do/shared/trial', () => ({ reserveDoTrial: mocks.reserve, DoTrialError: class extends Error {} }));
vi.mock('@/lib/agents/chat-rate-limit', () => ({ chatClientIp: () => crypto.randomUUID() }));
import { POST } from './route';
const make = (extra = {}, origin = 'https://www.assembl.co.nz') => new Request('https://www.assembl.co.nz/api/do/image', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: 'Silver fish over dark plum water', consent: true, ...extra }) });
beforeEach(() => { vi.clearAllMocks(); mocks.release.mockResolvedValue(undefined); mocks.reserve.mockResolvedValue({ release: mocks.release }); mocks.generate.mockResolvedValue({ images: ['data:image/png;base64,test'], model: 'test' }); });
describe('DO image task', () => {
  it('checks consent and origin before reserving or generating', async () => {
    expect((await POST(make({ consent: false }))).status).toBe(400);
    expect((await POST(make({}, 'https://foreign.example'))).status).toBe(403);
    expect(mocks.reserve).not.toHaveBeenCalled(); expect(mocks.generate).not.toHaveBeenCalled();
  });
  it('blocks an exhausted trial before invoking the image provider', async () => {
    mocks.reserve.mockRejectedValue({ code: 'trial_exhausted', message: 'Enquire to continue' });
    expect((await POST(make())).status).toBe(402); expect(mocks.generate).not.toHaveBeenCalled();
  });
  it('generates just one image and retains its reservation on success', async () => {
    expect((await POST(make())).status).toBe(200);
    expect(mocks.generate).toHaveBeenCalledWith('Silver fish over dark plum water', expect.objectContaining({ count: 1, aspectRatio: '1:1', signal: expect.any(AbortSignal) }));
    expect(mocks.release).not.toHaveBeenCalled();
  });
  it('refunds provider failures without exposing raw errors', async () => {
    mocks.generate.mockRejectedValue(new Error('private provider detail'));
    const response = await POST(make()); expect(response.status).toBe(503);
    expect(await response.text()).not.toContain('private provider detail'); expect(mocks.release).toHaveBeenCalledOnce();
  });
});
