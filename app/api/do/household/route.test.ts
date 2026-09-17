import { AsyncLocalStorage } from 'node:async_hooks';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/apps/do/services/owner', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/apps/do/services/owner')>(), doOwner: vi.fn(),
}));

import { doOwner } from '@/apps/do/services/owner';
import { HouseholdFloorOwnershipError, householdFloorMemory } from '@/apps/do/shared/household-floor-store';
import { GET, POST } from './route';

const ownerA = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', externalId: 'do:user:a' };
const ownerB = { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', externalId: 'do:user:b' };
const id = '11111111-1111-4111-8111-111111111111';
function request(body: unknown) {
  return new Request('https://www.assembl.co.nz/api/do/household', {
    method: 'POST', headers: { origin: 'https://www.assembl.co.nz', 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
}

const install = () => POST(request({ templateId: 'public_household_floor', id }));

describe('Household preview storage contract', () => {
  afterEach(() => vi.restoreAllMocks());

  beforeEach(() => {
    householdFloorMemory.clear();
    vi.mocked(doOwner).mockReset();
    vi.mocked(doOwner).mockResolvedValue(ownerA);
  });

  it('returns an unstored preview when signed out, without claiming device persistence', async () => {
    vi.mocked(doOwner).mockResolvedValue(null);
    const body = await (await install()).json();
    expect(body).toMatchObject({ durable: false, storage: 'none', stored: false, preview: true });
    expect(body.storageMessage).toMatch(/not stored/i);
    expect(body.floor.receipts[0].summary).toMatch(/preview/i);
    expect(body.floor.receipts[0].summary).not.toMatch(/installed on this device/i);
    expect(await householdFloorMemory.get(id)).toBeNull();
  });

  it.each([false, true])('reports the actual process storage on tick with persist=%s', async (persist) => {
    const { floor } = await (await install()).json();
    const response = await POST(request({ action: 'tick', floor, persist }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ durable: false, storage: persist ? 'process-memory' : 'none', stored: persist, preview: true });
  });

  it('does not let another owner install over or persist a tick to an existing floor', async () => {
    const { floor } = await (await install()).json();
    vi.mocked(doOwner).mockResolvedValue(ownerB);
    const collision = await install();
    expect(collision.status).toBe(409);
    expect(collision.headers.get('cache-control')).toBe('private, no-store');
    const body = await collision.json();
    expect(body).toMatchObject({ error: 'floor_id_unavailable', message: 'Install with a new Household Floor id.', stored: false, storage: 'none', durable: false });
    expect(body).not.toHaveProperty('floor');
    const response = await POST(request({ action: 'tick', floor, persist: true }));
    expect(response.status).toBe(404);
    expect(await householdFloorMemory.getForOwner(ownerB.id, id)).toBeNull();
    expect(await householdFloorMemory.getForOwner(ownerA.id, id)).toEqual(floor);
  });

  it('allows only one concurrent route install of the same id, with a request-bound owner', async () => {
    const owners = [ownerA, ownerB];
    const ownerContext = new AsyncLocalStorage<typeof ownerA>();
    vi.mocked(doOwner).mockImplementation(async () => ownerContext.getStore() ?? null);

    const responses = await Promise.all(owners.map((owner) => ownerContext.run(owner, () => POST(request({
      templateId: 'public_household_floor', id, personalisation: { displayName: owner.externalId },
    })))));
    expect(responses.map((response) => response.status).sort()).toEqual([200, 409]);
    const winner = responses.findIndex((response) => response.status === 200);
    const loser = responses.findIndex((response) => response.status === 409);
    const { floor } = await responses[winner].json();
    expect(floor.personalisation.displayName).toBe(owners[winner].externalId);
    expect(await responses[loser].json()).toMatchObject({ error: 'floor_id_unavailable', stored: false });
    expect(await householdFloorMemory.listForOwner(owners[winner].id)).toEqual([floor]);
    expect(await householdFloorMemory.listForOwner(owners[loser].id)).toEqual([]);
    expect(await householdFloorMemory.getForOwner(owners[loser].id, id)).toBeNull();
  });

  it('maps a repository ownership conflict during tick persistence to a private 409', async () => {
    const { floor } = await (await install()).json();
    vi.spyOn(householdFloorMemory, 'save').mockRejectedValueOnce(new HouseholdFloorOwnershipError());

    const response = await POST(request({ action: 'tick', floor, persist: true, forceScheduleId: 'evening-board' }));
    expect(response.status).toBe(409);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    const body = await response.json();
    expect(body).toMatchObject({ error: 'floor_id_unavailable', message: 'Install with a new Household Floor id.', stored: false, storage: 'none', durable: false });
    expect(body).not.toHaveProperty('floor');
    expect(await householdFloorMemory.getForOwner(ownerA.id, id)).toEqual(floor);
  });

  it.each(['install', 'tick'])('does not disguise unexpected %s storage errors as ownership conflicts', async (action) => {
    const { floor } = await (await install()).json();
    const error = new Error('Unexpected storage failure');
    vi.spyOn(householdFloorMemory, 'save').mockRejectedValueOnce(error);
    await expect(POST(request({ action, templateId: 'public_household_floor', id, floor, persist: true }))).rejects.toBe(error);
  });

  it('requires sign-in for a requested server tick save', async () => {
    const { floor } = await (await install()).json();
    vi.mocked(doOwner).mockResolvedValue(null);
    expect((await POST(request({ action: 'tick', floor, persist: true }))).status).toBe(401);
  });

  it('labels signed-in install and list as process-memory previews, lost on reset', async () => {
    const response = await install();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ durable: false, storage: 'process-memory', preview: true, stored: true });
    expect(body.storageMessage).toMatch(/process.memory.*preview/i);
    const listed = await GET(new Request('https://www.assembl.co.nz/api/do/household'));
    expect(await listed.json()).toMatchObject({ durable: false, storage: 'process-memory', preview: true, floors: [{ id, durable: false, storage: 'process-memory' }] });
    expect(await householdFloorMemory.getForOwner(ownerA.id, id)).not.toBeNull();
    householdFloorMemory.clear();
    expect(await householdFloorMemory.getForOwner(ownerA.id, id)).toBeNull();
  });
});
