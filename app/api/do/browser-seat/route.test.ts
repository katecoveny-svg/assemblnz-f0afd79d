import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { repo } = vi.hoisted(() => ({
  repo: {
    clear: () => undefined as void,
  } as {
    clear: () => void;
    savePlaybook?: (playbook: unknown, ownerId?: string | null) => Promise<unknown>;
    getForOwner?: (ownerId: string, floorId: string) => Promise<unknown>;
    save?: (ownerId: string | null, floor: unknown) => Promise<unknown>;
  },
}));

vi.mock('@/apps/do/services/owner', () => ({
  doOwner: vi.fn(),
  privateDoHeaders: { 'Cache-Control': 'private, no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff' },
}));

vi.mock('@/apps/do/shared/http', () => ({
  allowedDoOrigin: (req: Request) => {
    const origin = req.headers.get('origin');
    if (!origin) return null;
    try {
      return origin === new URL(req.url).origin ? origin : null;
    } catch {
      return null;
    }
  },
  admitDoRequest: () => true,
  readDoJson: async (req: Request) => req.json(),
}));

vi.mock('@/lib/agents/chat-rate-limit', () => ({
  chatClientIp: () => '127.0.0.1',
}));

vi.mock('@/apps/do/shared/household-floor-store', async () => {
  const actual = await vi.importActual<typeof import('@/apps/do/shared/household-floor-store')>(
    '@/apps/do/shared/household-floor-store',
  );
  const impl = new actual.MemoryHouseholdFloorRepo();
  repo.clear = () => impl.clear();
  repo.savePlaybook = (playbook, ownerId) => impl.savePlaybook(playbook as never, ownerId);
  repo.getForOwner = (ownerId: string, floorId: string) => impl.getForOwner(ownerId, floorId);
  repo.save = (ownerId, floor) => impl.save(ownerId, floor as never);
  return {
    ...actual,
    householdFloorMemory: impl,
  };
});

import { doOwner } from '@/apps/do/services/owner';
import { POST } from './route';
import { HouseholdFloorOwnershipError, householdFloorMemory } from '@/apps/do/shared/household-floor-store';
import { installHouseholdFloor } from '@/apps/do/shared/household-floor';
import { PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE } from '@/apps/do/shared/household-floor-templates';

const ownerA = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', externalId: 'do:user:a' };
const ownerB = { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', externalId: 'do:user:b' };
const doId = '11111111-1111-4111-8111-111111111111';
const capture = { doId, sessionKey: `do-browser-seat:${doId}`, consent: true, consentScope: 'session',
  url: 'https://example.invalid/preview', title: 'Synthetic capture', pageText: 'Synthetic context', learnMode: true, playbookLabel: 'Review notices' };
const seedFloor = () => householdFloorMemory.save(ownerA.id, installHouseholdFloor({ template: PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE, id: doId }));

function postRequest(body: unknown, origin = 'https://www.assembl.co.nz') {
  return new Request('https://www.assembl.co.nz/api/do/browser-seat', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('Browser seat API', () => {
  afterEach(() => vi.restoreAllMocks());

  beforeEach(() => {
    repo.clear();
    vi.mocked(doOwner).mockReset();
    vi.mocked(doOwner).mockResolvedValue(null);
  });

  it('requires consent and matching session key', async () => {
    const missingConsent = await POST(postRequest({
      doId: '11111111-1111-4111-8111-111111111111',
      sessionKey: 'do-browser-seat:11111111-1111-4111-8111-111111111111',
      consent: false,
      consentScope: 'domain',
      url: 'https://demo-college.bridge.school.nz/notices',
      title: 'Notices',
      pageText: 'Hello',
    }));
    expect(missingConsent.status).toBe(400);

    const badKey = await POST(postRequest({
      doId: '11111111-1111-4111-8111-111111111111',
      sessionKey: 'do-browser-seat:other',
      consent: true,
      consentScope: 'domain',
      url: 'https://demo-college.bridge.school.nz/notices',
      title: 'Notices',
      pageText: 'Hello notices',
    }));
    expect(badKey.status).toBe(400);
  });

  it('returns only an unstored review receipt when consented capture has no authenticated owner', async () => {
    const response = await POST(postRequest({
      doId: '11111111-1111-4111-8111-111111111111',
      sessionKey: 'do-browser-seat:11111111-1111-4111-8111-111111111111',
      consent: true,
      consentScope: 'domain',
      url: 'https://demo-college.bridge.school.nz/notices',
      title: 'Notices',
      pageText: 'Athletics Friday. Bring water bottle.',
      learnMode: true,
      playbookLabel: 'open college notices',
    }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.receipt.url).toContain('demo-college.bridge.school.nz');
    expect(body.honesty).toMatch(/No form was submitted/i);
    expect(body.playbook).toBeNull();
    expect(body).toMatchObject({ stored: false, durable: false, storage: 'none', preview: true, playbookStored: false, attachment: { status: 'detached', reason: 'auth_required' } });
    expect(body.honesty).toMatch(/not stored/i);
    expect(body.honesty).not.toContain('Capture stored');
    expect(body.nextAction).toMatch(/sign in.*Household Floor/i);
    expect(await householdFloorMemory.listPlaybooks(doId)).toEqual([]);
  });

  it('attaches to the signed-in owning floor only as a process-memory preview', async () => {
    await seedFloor();
    vi.mocked(doOwner).mockResolvedValue(ownerA);
    const response = await POST(postRequest(capture));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.stored).toBe(true);
    expect(body).toMatchObject({ durable: false, storage: 'process-memory', preview: true, playbookStored: true, attachment: { status: 'attached', floorId: doId } });
    expect(body.honesty).toMatch(/process.memory.*preview/i);
    expect(body.nextAction).toMatch(/review/i);
    const storedFloor = await householdFloorMemory.getForOwner(ownerA.id, doId);
    expect(storedFloor?.receipts[0].id).toBe(body.receipt.id);
    expect(storedFloor?.receipts[0].evidence).toMatchObject({ storage: 'process-memory', durable: false });
    expect((await householdFloorMemory.listPlaybooks(doId, ownerA.id))[0].id).toBe(body.playbook.id);
    expect(await householdFloorMemory.listPlaybooks(doId)).toEqual([]);
    expect(await householdFloorMemory.listPlaybooks(doId, ownerB.id)).toEqual([]);
    householdFloorMemory.clear();
    expect(await householdFloorMemory.getForOwner(ownerA.id, doId)).toBeNull();
    expect(await householdFloorMemory.listPlaybooks(doId)).toEqual([]);
  });

  it.each(['save', 'savePlaybook'] as const)('maps %s ownership conflicts to a private, generic 409', async (method) => {
    await seedFloor();
    vi.mocked(doOwner).mockResolvedValue(ownerA);
    vi.spyOn(householdFloorMemory, method).mockRejectedValueOnce(new HouseholdFloorOwnershipError());

    const response = await POST(postRequest(capture));
    expect(response.status).toBe(409);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toEqual({ error: 'floor_id_unavailable', message: 'Install with a new Household Floor id.' });
  });

  it.each(['save', 'savePlaybook'] as const)('does not disguise unexpected %s errors as ownership conflicts', async (method) => {
    await seedFloor();
    vi.mocked(doOwner).mockResolvedValue(ownerA);
    const error = new Error('Unexpected storage failure');
    vi.spyOn(householdFloorMemory, method).mockRejectedValueOnce(error);
    await expect(POST(postRequest(capture))).rejects.toBe(error);
  });

  it.each(['missing', 'other-owner', 'reset'])('does not store a receipt or playbook without the owning floor (%s)', async (state) => {
    if (state !== 'missing') await seedFloor();
    if (state === 'reset') householdFloorMemory.clear();
    vi.mocked(doOwner).mockResolvedValue(state === 'other-owner' ? ownerB : ownerA);
    const response = await POST(postRequest(capture));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.stored).toBe(false);
    expect(body).toMatchObject({ floor: null, playbook: null, durable: false, storage: 'none', attachment: { status: 'detached', reason: 'floor_not_found' } });
    expect(body.honesty).not.toContain('Capture stored');
    expect(body.nextAction).toMatch(/Household Floor/i);
    expect(await householdFloorMemory.listPlaybooks(doId)).toEqual([]);
    if (state === 'other-owner') expect((await householdFloorMemory.getForOwner(ownerA.id, doId))?.receipts.some((receipt) => receipt.kind === 'browser_seat')).toBe(false);
  });

  it('requires session consent for non-catalog hosts', async () => {
    const response = await POST(postRequest({
      doId: '11111111-1111-4111-8111-111111111111',
      sessionKey: 'do-browser-seat:11111111-1111-4111-8111-111111111111',
      consent: true,
      consentScope: 'domain',
      url: 'https://example.com/page',
      title: 'Example',
      pageText: 'Hello world page text',
    }));
    expect(response.status).toBe(400);
  });
});
