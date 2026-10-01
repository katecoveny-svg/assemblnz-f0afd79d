import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/apps/do/services/owner', async (original) => ({ ...(await original<typeof import('@/apps/do/services/owner')>()), doOwner: vi.fn() }));
vi.mock('@/apps/do/shared/http', async (original) => ({ ...(await original<typeof import('@/apps/do/shared/http')>()), admitDoRequest: vi.fn() }));
vi.mock('@/lib/agents/chat-rate-limit', () => ({ chatClientIp: vi.fn(() => 'test-ip'), checkChatRateLimit: vi.fn() }));
vi.mock('@/apps/do/shared/preparation-server', () => ({ prepareDoDraft: vi.fn(), DoPreparationError: class extends Error {} }));
vi.mock('@/apps/do/personal/profile-service', () => ({ getPersonalDoProfile: vi.fn() }));
import { POST } from './route';
import { doOwner } from '@/apps/do/services/owner';
import { admitDoRequest } from '@/apps/do/shared/http';
import { checkChatRateLimit } from '@/lib/agents/chat-rate-limit';
import { prepareDoDraft } from '@/apps/do/shared/preparation-server';
import { getPersonalDoProfile } from '@/apps/do/personal/profile-service';
import { DEFAULT_PERSONAL_DO_PROFILE } from '@/apps/do/personal/profile';
const owner = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', externalId: 'do:user:a' };
const valid = { category: 'school', source: 'A school notice needing a checklist.', title: 'Trip', fields: { event: 'School trip', timing: 'Date not stated', gear: 'Hat', permission: 'Reply needed' }, providerConsentVersion: 'do-openai-typesafe-v1', consent: true };
const request = (body: unknown = valid, origin = 'https://www.assembl.co.nz') => new Request('https://www.assembl.co.nz/api/do/personal/life-admin/preparation', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(doOwner).mockResolvedValue(owner);
  vi.mocked(admitDoRequest).mockReturnValue(true);
  vi.mocked(checkChatRateLimit).mockResolvedValue({ allowed: true, scope: null });
  vi.mocked(getPersonalDoProfile).mockResolvedValue({ profile: DEFAULT_PERSONAL_DO_PROFILE, saved: false });
  vi.mocked(prepareDoDraft).mockResolvedValue({ text: 'Draft only', status: 'draft' } as Awaited<ReturnType<typeof prepareDoDraft>>);
});
describe('Life-admin provider preparation boundary', () => {
  it('rejects cross-origin calls before reading private identity or invoking providers', async () => {
    expect((await POST(request(valid, 'https://other.example'))).status).toBe(403);
    expect(doOwner).not.toHaveBeenCalled(); expect(prepareDoDraft).not.toHaveBeenCalled();
  });
  it('requires existing DO identity, never a new third-party account', async () => {
    vi.mocked(doOwner).mockResolvedValue(null);
    expect((await POST(request())).status).toBe(401);
    expect(prepareDoDraft).not.toHaveBeenCalled();
  });
  it('does not send without explicit consent or with unexpected identity fields', async () => {
    expect((await POST(request({ ...valid, consent: false }))).status).toBe(400);
    expect((await POST(request({ ...valid, ownerId: 'another' }))).status).toBe(400);
    expect(prepareDoDraft).not.toHaveBeenCalled();
  });
  it('blocks labelled secret content before provider transmission', async () => {
    expect((await POST(request({ ...valid, source: 'Passport number: NOT-A-REAL-NUMBER' }))).status).toBe(400);
    expect(prepareDoDraft).not.toHaveBeenCalled();
  });
  it('enforces rate controls without preparing a fallback fake draft', async () => {
    vi.mocked(admitDoRequest).mockReturnValue(false);
    expect((await POST(request())).status).toBe(429);
    expect(prepareDoDraft).not.toHaveBeenCalled();
  });
  it('checks the combined source limit rather than truncating approved context', async () => {
    expect((await POST(request({ ...valid, source: 'a'.repeat(12_000) }))).status).toBe(400);
    expect(prepareDoDraft).not.toHaveBeenCalled();
  });
  it('returns only draft evidence and private no-store headers', async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toEqual({ draft: { text: 'Draft only', status: 'draft' } });
    expect(prepareDoDraft).toHaveBeenCalledWith(expect.objectContaining({ task: 'plan', providerConsentVersion: 'do-openai-typesafe-v1', consent: true, sourceTitle: 'Trip', sourceUrl: '' }), expect.any(AbortSignal), undefined, expect.objectContaining({ ownerId: owner.id }));
  });
  it('uses only the verified owner profile as a bounded separate style hint', async () => {
    vi.mocked(getPersonalDoProfile).mockResolvedValue({ profile: { ...DEFAULT_PERSONAL_DO_PROFILE, displayName: 'Kea' }, saved: true });
    expect((await POST(request())).status).toBe(200);
    expect(getPersonalDoProfile).toHaveBeenCalledWith(owner.id);
    expect(prepareDoDraft).toHaveBeenCalledWith(expect.anything(), expect.any(AbortSignal), expect.stringContaining('Kea'), expect.objectContaining({ ownerId: owner.id }));
  });
  it('missing optional profile storage does not disable preparation', async () => {
    vi.mocked(getPersonalDoProfile).mockRejectedValue(new Error('missing table'));
    expect((await POST(request())).status).toBe(200);
  });
  it('surfaces provider failure without completion claims', async () => {
    vi.mocked(prepareDoDraft).mockRejectedValue(new Error('provider failed'));
    const response = await POST(request());
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'The draft could not be prepared. Your local checklist is unchanged.' });
  });
});
