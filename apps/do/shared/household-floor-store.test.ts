import { describe, expect, it } from 'vitest';

import type { BrowserSeatPlaybook } from './browser-seat';
import { installHouseholdFloor } from './household-floor';
import { PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE } from './household-floor-templates';
import { MemoryHouseholdFloorRepo } from './household-floor-store';

const ownerA = 'owner-a';
const ownerB = 'owner-b';
const id = '11111111-1111-4111-8111-111111111111';
const collision = { name: 'HouseholdFloorOwnershipError', message: 'Household Floor id unavailable.' };

function makeFloor(displayName = 'A private floor') {
  return installHouseholdFloor({
    template: PUBLIC_HOUSEHOLD_FLOOR_TEMPLATE,
    id,
    now: '2026-09-16T07:00:00.000Z',
    personalisation: { displayName, accentColor: '#240B21', avatarMark: '⌂' },
  });
}

function makePlaybook(): BrowserSeatPlaybook {
  return {
    id: 'private-playbook', doId: id, label: 'Private notices',
    startUrl: 'https://example.invalid/notices', steps: ['Read notices'],
    createdAt: '2026-09-16T07:00:00.000Z', receiptIds: ['private-receipt'],
  };
}

describe('MemoryHouseholdFloorRepo ownership', () => {
  it.each(['sequential', 'concurrent'])('rejects another owner saving the same floor id (%s)', async (mode) => {
    const repo = new MemoryHouseholdFloorRepo();
    const floorA = makeFloor();
    const floorB = makeFloor('B private floor');

    if (mode === 'sequential') {
      await repo.save(ownerA, floorA);
      await expect(repo.save(ownerB, floorB)).rejects.toMatchObject(collision);
    } else {
      await Promise.all([
        expect(repo.save(ownerA, floorA)).resolves.toEqual(floorA),
        expect(repo.save(ownerB, floorB)).rejects.toMatchObject(collision),
      ]);
    }

    expect(await repo.getForOwner(ownerA, id)).toEqual(floorA);
    expect(await repo.listForOwner(ownerA)).toEqual([floorA]);
    expect(await repo.getForOwner(ownerB, id)).toBeNull();
    expect(await repo.listForOwner(ownerB)).toEqual([]);
  });

  it.each([undefined, null, ownerB])('hides owned floors from an unscoped or different-owner read (%s)', async (reader) => {
    const repo = new MemoryHouseholdFloorRepo();
    const floor = makeFloor();
    await repo.save(ownerA, floor);

    expect(Boolean(await repo.get(id, reader))).toBe(false);
    expect(await repo.getForOwner(ownerA, id)).toEqual(floor);
  });

  it.each([undefined, null, ownerB])('refuses receipt writes without the floor owner (%s)', async (writer) => {
    const repo = new MemoryHouseholdFloorRepo();
    const floor = makeFloor();
    const receipt = { ...floor.receipts[0], id: 'new-receipt' };
    await repo.save(ownerA, floor);

    expect(Boolean(await repo.appendReceipt(id, receipt, writer))).toBe(false);
    expect(await repo.getForOwner(ownerA, id)).toEqual(floor);
    const updated = await repo.appendReceipt(id, receipt, ownerA);
    expect(updated?.receipts[0]).toEqual(receipt);
  });

  it.each([undefined, null, ownerB])('hides playbooks from an unscoped or different-owner read (%s)', async (reader) => {
    const repo = new MemoryHouseholdFloorRepo();
    const playbook = makePlaybook();
    await repo.save(ownerA, makeFloor());
    await repo.savePlaybook(playbook, ownerA);

    expect(await repo.listPlaybooks(id, reader)).toEqual([]);
    expect(await repo.listPlaybooks(id, ownerA)).toEqual([playbook]);
  });

  it('keeps stored playbooks isolated from input and output object mutations', async () => {
    const repo = new MemoryHouseholdFloorRepo();
    const playbook = makePlaybook();
    const expected = structuredClone(playbook);
    await repo.save(ownerA, makeFloor());
    const saved = await repo.savePlaybook(playbook, ownerA);

    playbook.label = 'Mutated input';
    playbook.steps.push('Mutated input step');
    saved.receiptIds.push('Mutated return value');
    const listed = await repo.listPlaybooks(id, ownerA);
    expect(listed).toEqual([expected]);
    listed[0].steps.push('Mutated listing');
    expect(await repo.listPlaybooks(id, ownerA)).toEqual([expected]);
  });

  it('supports explicitly unowned local floors without letting a user claim them', async () => {
    const repo = new MemoryHouseholdFloorRepo();
    const floor = makeFloor();
    const receipt = { ...floor.receipts[0], id: 'local-receipt' };
    const playbook = makePlaybook();
    await repo.save(null, floor);
    expect(await repo.get(id)).toEqual(floor);
    expect((await repo.appendReceipt(id, receipt))?.receipts[0]).toEqual(receipt);
    await repo.savePlaybook(playbook);
    expect(await repo.listPlaybooks(id)).toEqual([playbook]);
    expect(await repo.listPlaybooks(id, null)).toEqual([playbook]);
    expect(await repo.listPlaybooks(id, ownerA)).toEqual([]);
    await expect(repo.save(ownerA, floor)).rejects.toMatchObject(collision);
    await expect(repo.savePlaybook(playbook, ownerA)).rejects.toMatchObject(collision);
    expect(await repo.listForOwner(ownerA)).toEqual([]);
  });

  it.each([undefined, null, ownerA])('refuses orphan playbooks when no floor has been saved (%s)', async (writer) => {
    const repo = new MemoryHouseholdFloorRepo();
    await expect(repo.savePlaybook(makePlaybook(), writer)).rejects.toMatchObject(collision);
    expect(await repo.listPlaybooks(id, writer)).toEqual([]);
  });

  it('clears owner bindings and playbooks before an id can be reused', async () => {
    const repo = new MemoryHouseholdFloorRepo();
    await repo.save(ownerA, makeFloor());
    await repo.savePlaybook(makePlaybook(), ownerA);
    repo.clear();
    await repo.save(ownerB, makeFloor('B private floor'));

    expect(await repo.listForOwner(ownerA)).toEqual([]);
    expect(await repo.getForOwner(ownerA, id)).toBeNull();
    expect(await repo.listPlaybooks(id, ownerB)).toEqual([]);
    expect(await repo.listPlaybooks(id, ownerA)).toEqual([]);
  });

  it.each([undefined, null, ownerB])('refuses playbook writes without the floor owner (%s)', async (writer) => {
    const repo = new MemoryHouseholdFloorRepo();
    const floor = makeFloor();
    const playbook = makePlaybook();
    await repo.save(ownerA, floor);

    await expect(repo.savePlaybook(playbook, writer)).rejects.toMatchObject(collision);
    expect(await repo.listPlaybooks(id, ownerA)).toEqual([]);
    await expect(repo.savePlaybook(playbook, ownerA)).resolves.toEqual(playbook);
    expect(await repo.listPlaybooks(id, ownerA)).toEqual([playbook]);
  });
});
