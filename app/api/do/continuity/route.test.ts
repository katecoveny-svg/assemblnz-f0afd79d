import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ owner: vi.fn(), client: vi.fn() }));
vi.mock('@/apps/do/services/owner', () => ({ doOwner: mocks.owner,
  privateDoHeaders: { 'Cache-Control': 'private, no-store', Vary: 'Cookie' },
  sameDoOrigin: (r: Request) => r.headers.get('origin') === new URL(r.url).origin }));
vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.client }));
import { GET, POST } from './route';
import { CONTINUITY_VERSION } from '@/apps/do/continuity/contract';
const payload = { action: 'save', id: '10000000-0000-4000-8000-000000000001', scope: 'personal',
  request: 'Fictional picnic request', context: [], consent: true, consentVersion: CONTINUITY_VERSION };
const post = (body: unknown, origin = 'https://assembl.nz') => new Request('https://assembl.nz/api/do/continuity', {
  method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'X-DO-Workspace': 'owner' }, body: JSON.stringify(body) });
beforeEach(() => { vi.clearAllMocks(); mocks.owner.mockResolvedValue({ id: 'owner' }); });
it('requires owner verification and denies hostile origins before processing', async () => {
  mocks.owner.mockResolvedValue(null);
  expect((await GET(new Request('https://assembl.nz/api/do/continuity'))).status).toBe(401);
  expect((await POST(post(payload))).status).toBe(401);
  expect((await POST(post(payload, 'https://evil.example'))).status).toBe(403);
  expect((await GET(new Request('https://assembl.nz/api/do/continuity', { headers: { Origin: 'https://evil.example' } }))).status).toBe(403);
});
it('closed activation reports unavailable, private/no-store and no false save', async () => {
  for (const response of [await GET(new Request('https://assembl.nz/api/do/continuity')), await POST(post(payload))]) {
    expect(response.status).toBe(503); expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(await response.json()).toMatchObject({ error: 'storage_unavailable', durable: false });
  }
  expect(mocks.client).not.toHaveBeenCalled();
});
it('rejects invalid scope, unselected memory and fabricated authority', async () => {
  expect((await GET(new Request('https://assembl.nz/api/do/continuity?scope=someone-else'))).status).toBe(400);
  for (const extra of [{ memoryRecords: ['secret'] }, { ownerId: 'other' }, { status: 'sent' }, { consent: false }])
    expect((await POST(post({ ...payload, ...extra }))).status).toBe(400);
});
it('does not transfer an old-owner form into a newly signed-in workspace', async () => {
  mocks.owner.mockResolvedValue({ id: 'new-owner' });
  const response = await POST(post(payload));
  expect(response.status).toBe(409);
  expect(await response.json()).toMatchObject({ error: 'workspace_changed', durable: false });
  expect(mocks.client).not.toHaveBeenCalled();
});
