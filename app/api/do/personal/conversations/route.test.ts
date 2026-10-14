import { beforeEach, expect, it, vi } from 'vitest';
vi.mock('@/apps/do/services/owner', () => ({ doOwner: vi.fn(), sameDoOrigin: vi.fn(), privateDoHeaders: { 'Cache-Control': 'private, no-store' } }));
vi.mock('@/apps/do/personal/conversation-service', () => ({ loadConversations: vi.fn(), mutateConversation: vi.fn(), ConversationConflict: class extends Error {} }));
import { doOwner, sameDoOrigin } from '@/apps/do/services/owner';
import { loadConversations, mutateConversation, ConversationConflict } from '@/apps/do/personal/conversation-service';
import { GET, POST } from './route';
const input = { action: 'forget', id: '11111111-1111-4111-8111-111111111111', expectedRevision: 1 };
const request = (body: unknown = input, workspace = 'owner-a') => new Request('https://example.test/api/do/personal/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-DO-Workspace': workspace }, body: JSON.stringify(body) });
beforeEach(() => { vi.resetAllMocks(); vi.mocked(doOwner).mockResolvedValue({ id: 'owner-a', externalId: 'do:user:owner-a' }); vi.mocked(sameDoOrigin).mockReturnValue(true); });
it('guests get an empty, unsaved contract and cannot write', async () => {
  vi.mocked(doOwner).mockResolvedValue(null);
  expect(await (await GET()).json()).toMatchObject({ records: [], storage: 'none', saved: false });
  expect(loadConversations).not.toHaveBeenCalled();
  expect((await POST(request())).status).toBe(401);
});
it('rejects foreign origins and stale workspaces before any mutation', async () => {
  vi.mocked(sameDoOrigin).mockReturnValue(false);
  expect((await POST(request())).status).toBe(403);
  vi.mocked(sameDoOrigin).mockReturnValue(true);
  expect((await POST(request(input, 'owner-b'))).status).toBe(409);
  expect(mutateConversation).not.toHaveBeenCalled();
});
it('strict schema drops client owner overrides and authority fields', async () => {
  expect((await POST(request({ ...input, ownerId: 'owner-b' }))).status).toBe(400);
  expect(mutateConversation).not.toHaveBeenCalled();
});
it('uses the verified owner and reports cross-device conflicts', async () => {
  vi.mocked(mutateConversation).mockRejectedValue(new ConversationConflict());
  expect((await POST(request())).status).toBe(409);
  expect(mutateConversation).toHaveBeenCalledWith('owner-a', input);
});
it('an unconfigured deployment fails closed with a private, uncached response', async () => {
  vi.mocked(loadConversations).mockRejectedValue(new Error('missing table'));
  const response = await GET();
  expect(response.status).toBe(503);
  expect(response.headers.get('Cache-Control')).toBe('private, no-store');
  expect(await response.json()).toMatchObject({ storage: 'unavailable', saved: false });
});
