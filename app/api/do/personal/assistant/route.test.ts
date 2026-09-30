import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/apps/do/services/owner', async original => ({ ...(await original<typeof import('@/apps/do/services/owner')>()), doOwner: vi.fn() }));
vi.mock('@/apps/do/shared/http', async original => ({ ...(await original<typeof import('@/apps/do/shared/http')>()), admitDoRequest: vi.fn() }));
vi.mock('@/lib/agents/chat-rate-limit', () => ({ chatClientIp: vi.fn(() => '192.0.2.5'), checkChatRateLimit: vi.fn() }));
vi.mock('@/apps/do/personal/assistant-server', () => ({ personalAssistantAvailability: vi.fn(), runPersonalAssistant: vi.fn() }));
import { doOwner } from '@/apps/do/services/owner';
import { admitDoRequest } from '@/apps/do/shared/http';
import { checkChatRateLimit } from '@/lib/agents/chat-rate-limit';
import { personalAssistantAvailability, runPersonalAssistant } from '@/apps/do/personal/assistant-server';
import { PilotError } from '@/lib/typesafe/core';
import { GET, POST } from './route';
const owner = { id: 'owner-a', externalId: 'do:user:owner-a' };
const ready = { signedIn: true, ready: true, reason: null, message: 'Configured.', model: 'gpt-6-astra', externalActions: false } as const;
const payload = { message: 'Please help with my house move.', consent: true };
const request = (body: unknown = payload, origin: string | null = 'https://www.assembl.co.nz') => new Request('https://www.assembl.co.nz/api/do/personal/assistant', { method: 'POST', headers: { 'content-type': 'application/json', ...(origin ? { origin } : {}) }, body: JSON.stringify(body) });
beforeEach(() => {
  vi.clearAllMocks(); vi.mocked(doOwner).mockResolvedValue(owner);
  vi.mocked(personalAssistantAvailability).mockReturnValue(ready);
  vi.mocked(admitDoRequest).mockReturnValue(true);
  vi.mocked(checkChatRateLimit).mockResolvedValue({ allowed: true, scope: null });
});
describe('Personal DO assistant route security', () => {
  it('GET is no-store, owner-scoped configuration only, with no generation', async () => {
    const response = await GET();
    expect(response.status).toBe(200); expect(await response.json()).toEqual(ready);
    expect(personalAssistantAvailability).toHaveBeenCalledWith(owner.id);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('vary')).toBe('Cookie, Origin');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(runPersonalAssistant).not.toHaveBeenCalled();
    vi.mocked(doOwner).mockResolvedValue(null);
    expect((await GET()).status).toBe(401); expect(personalAssistantAvailability).toHaveBeenLastCalledWith(null);
  });
  it('rejects foreign or missing origin before any owner/provider access', async () => {
    for (const origin of [null, 'https://attacker.example']) expect((await POST(request(payload, origin))).status).toBe(403);
    expect(doOwner).not.toHaveBeenCalled(); expect(runPersonalAssistant).not.toHaveBeenCalled();
  });
  it('rejects anonymous before parsing input or calling providers', async () => {
    vi.mocked(doOwner).mockResolvedValue(null);
    expect((await POST(request())).status).toBe(401);
    expect(runPersonalAssistant).not.toHaveBeenCalled(); expect(admitDoRequest).not.toHaveBeenCalled();
  });
  it('requires exact consent and rejects client-owned identity, provider and authority', async () => {
    for (const change of [{ consent: false }, { consent: undefined }, { ownerId: 'other' }, { provider: 'other' }, { model: 'other' }, { externalActions: true }, { tools: ['send_email'] }, { useSavedStyle: 'true' }]) expect((await POST(request({ ...payload, ...change }))).status).toBe(400);
    expect(runPersonalAssistant).not.toHaveBeenCalled();
  });
  it('bounds invalid JSON, bytes and text even without content length', async () => {
    for (const [body, contentType] of [['{', 'application/json'], [JSON.stringify(payload), 'text/plain'], [JSON.stringify({ ...payload, context: 'x'.repeat(64000) }), 'application/json']]) {
      const req = new Request('https://www.assembl.co.nz/api/do/personal/assistant', { method: 'POST', headers: { origin: 'https://www.assembl.co.nz', 'content-type': contentType }, body });
      expect((await POST(req)).status).toBe(400);
    }
    expect((await POST(request({ ...payload, context: 'x'.repeat(6001) }))).status).toBe(400);
    expect(runPersonalAssistant).not.toHaveBeenCalled();
  });
  it('preserves pilot allowlist and provider configuration gates before rate accounting', async () => {
    vi.mocked(personalAssistantAvailability).mockReturnValue({ ...ready, ready: false, reason: 'pilot_access_required' });
    expect((await POST(request())).status).toBe(403);
    vi.mocked(personalAssistantAvailability).mockReturnValue({ ...ready, ready: false, reason: 'astra_unavailable' });
    expect((await POST(request())).status).toBe(503);
    expect(runPersonalAssistant).not.toHaveBeenCalled(); expect(admitDoRequest).not.toHaveBeenCalled();
  });
  it('applies per-owner/IP and shared request limits before calling providers', async () => {
    vi.mocked(admitDoRequest).mockReturnValue(false);
    const response = await POST(request()); expect(response.status).toBe(429); expect(response.headers.get('retry-after')).toBe('60');
    expect(admitDoRequest).toHaveBeenCalledWith('personal-assistant:owner-a');
    expect(checkChatRateLimit).not.toHaveBeenCalled();
    vi.mocked(admitDoRequest).mockReturnValue(true); vi.mocked(checkChatRateLimit).mockResolvedValue({ allowed: false, scope: 'ip' });
    const shared = await POST(request()); expect(shared.status).toBe(429); expect(shared.headers.get('retry-after')).toBe('600');
    expect(runPersonalAssistant).not.toHaveBeenCalled();
  });
  it('binds a validated request and abort signal to the verified owner', async () => {
    vi.mocked(runPersonalAssistant).mockResolvedValue({ id: 'draft', reviewRequired: true, externalActions: false } as never);
    const req = request(); const response = await POST(req);
    expect(response.status).toBe(200);
    expect(runPersonalAssistant).toHaveBeenCalledWith({ ...payload, history: [], context: '', useSavedStyle: false }, owner.id, req.signal);
    expect(await response.json()).toMatchObject({ result: { externalActions: false } });
  });
  it('redacts unknown errors, and returns only deliberately safe domain messages', async () => {
    vi.mocked(runPersonalAssistant).mockRejectedValue(new Error('SECRET PRIVATE_PROVIDER_BODY'));
    const response = await POST(request()); expect(response.status).toBe(503); expect(JSON.stringify(await response.json())).not.toMatch(/SECRET|PRIVATE_PROVIDER_BODY/);
    vi.mocked(runPersonalAssistant).mockRejectedValue(new PilotError('provider_timeout', 502, 'TypeSafe timed out. No action was taken.'));
    expect((await POST(request())).status).toBe(502);
  });
});
