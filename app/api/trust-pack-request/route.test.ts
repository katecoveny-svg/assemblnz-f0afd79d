import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ insert: vi.fn(), notify: vi.fn() }));
vi.mock('@/lib/supabase/service', () => ({ getServiceClient: () => ({ from: () => ({ insert: mocks.insert }) }) }));
vi.mock('@/lib/lead-capture', () => ({ notifyLead: mocks.notify, clientIpFromHeaders: () => null }));
import { POST } from './route';
const request = () => new Request('http://localhost/api/trust-pack-request', { method: 'POST', body: JSON.stringify({ name: 'Fictional reviewer', org: 'Example', role: 'Reviewer', intendedUse: 'Local test', ndaSigned: false }) });
beforeEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); mocks.insert.mockReset(); mocks.notify.mockReset(); mocks.insert.mockResolvedValue({ error: { message: 'Unavailable' } }); mocks.notify.mockResolvedValue(false); });
describe('confirmed trust request acceptance', () => {
  it('fails when no leg confirms receipt', async () => { expect((await POST(request())).status).toBe(503); });
  it('accepts a durable write despite failed notification', async () => { mocks.insert.mockResolvedValue({ error: null }); expect(await (await POST(request())).json()).toEqual({ ok: true, accepted: true }); });
  it('accepts confirmed email when persistence throws', async () => { mocks.insert.mockRejectedValue(new Error('Unavailable')); mocks.notify.mockResolvedValue(true); expect((await POST(request())).status).toBe(200); });
  it('rejects Slack non-2xx and network failure', async () => { vi.stubEnv('TRUST_SLACK_WEBHOOK_URL', 'https://example.invalid/mock'); const fetcher = vi.fn().mockResolvedValue(new Response('', { status: 500 })); vi.stubGlobal('fetch', fetcher); expect((await POST(request())).status).toBe(503); fetcher.mockRejectedValue(new Error('offline')); expect((await POST(request())).status).toBe(503); });
  it('accepts confirmed Slack independently', async () => { vi.stubEnv('TRUST_SLACK_WEBHOOK_URL', 'https://example.invalid/mock'); vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 200 }))); expect((await POST(request())).status).toBe(200); });
  it('does not deliver invalid requests', async () => { expect((await POST(new Request('http://localhost', { method: 'POST', body: '{}' }))).status).toBe(400); expect(mocks.notify).not.toHaveBeenCalled(); });
});
it('retains confirmed durable acceptance even if the notification adapter unexpectedly rejects', async () => {
 mocks.insert.mockResolvedValue({ error: null }); mocks.notify.mockRejectedValue(new Error('synthetic failure'));
 expect((await POST(request())).status).toBe(200);
});
it('rejects whitespace-only input without invoking any delivery path', async () => {
 const response=await POST(new Request('http://localhost', {method:'POST',body:JSON.stringify({name:' ',org:'Example',role:'Reviewer',intendedUse:'Test',ndaSigned:false})}));
 expect(response.status).toBe(400);expect(mocks.insert).not.toHaveBeenCalled();expect(mocks.notify).not.toHaveBeenCalled();
});
