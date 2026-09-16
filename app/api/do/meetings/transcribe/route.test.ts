import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const calls = vi.hoisted(() => ({ owner: vi.fn(), rate: vi.fn() }));
vi.mock('@/apps/do/services/owner', async original => ({ ...(await original<object>()), doOwner: calls.owner }));
vi.mock('@/lib/agents/chat-rate-limit', () => ({ checkChatRateLimit: calls.rate }));
import { POST } from './route';
function request(consent = true, origin = 'https://www.assembl.co.nz') {
  const form = new FormData(); form.set('audio', new Blob(['synthetic audio'], { type: 'audio/webm' }), 'test.webm');
  form.set('consent', String(consent));
  return new Request('https://www.assembl.co.nz/api/do/meetings/transcribe', { method: 'POST', headers: { origin }, body: form });
}
beforeEach(() => { vi.stubEnv('DEEPGRAM_API_KEY', 'test-placeholder'); calls.owner.mockResolvedValue({ id: 'owner' }); calls.rate.mockResolvedValue({ allowed: true }); vi.stubGlobal('fetch', vi.fn()); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
describe('meeting audio boundary', () => {
  it('blocks cross-origin audio', async () => { expect((await POST(request(true, 'https://other.test'))).status).toBe(403); expect(fetch).not.toHaveBeenCalled(); });
  it('requires sign-in', async () => { calls.owner.mockResolvedValue(null); expect((await POST(request())).status).toBe(401); expect(fetch).not.toHaveBeenCalled(); });
  it('requires explicit upload consent', async () => { expect((await POST(request(false))).status).toBe(400); expect(fetch).not.toHaveBeenCalled(); });
  it('returns setup-needed without pretending to transcribe', async () => { vi.stubEnv('DEEPGRAM_API_KEY', ''); expect((await POST(request())).status).toBe(503); });
  it('returns transcript for review and no completed delegation', async () => {
    vi.mocked(fetch).mockResolvedValue(Response.json({ results: { channels: [{ alternatives: [{ transcript: 'Alex will prepare the draft.' }] }] } }));
    const data = await (await POST(request())).json(); expect(data).toEqual({ transcript: 'Alex will prepare the draft.', provider: 'Deepgram', status: 'review_required' });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('does not leak provider errors', async () => { vi.mocked(fetch).mockResolvedValue(new Response('sensitive upstream detail', { status: 500 })); const response = await POST(request()); expect(response.status).toBe(502); expect(await response.text()).not.toContain('sensitive'); });
});
