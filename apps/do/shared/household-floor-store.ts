/**
 * In-memory Household Floor repository for tests + fail-soft local API.
 * Browser demo primarily uses device localStorage; this backs authenticated paths.
 */

import type { HouseholdFloorInstance, HouseholdFloorReceipt } from './household-floor';
import type { BrowserSeatPlaybook } from './browser-seat';

export class HouseholdFloorOwnershipError extends Error {
  constructor() {
    super('Household Floor id unavailable.');
    this.name = 'HouseholdFloorOwnershipError';
  }
}

export class MemoryHouseholdFloorRepo {
  private floors = new Map<string, HouseholdFloorInstance>();
  private owners = new Map<string, string | null>();
  private byOwner = new Map<string, Set<string>>();
  private playbooks = new Map<string, BrowserSeatPlaybook[]>();

  clear() {
    this.floors.clear();
    this.owners.clear();
    this.byOwner.clear();
    this.playbooks.clear();
  }

  async save(ownerId: string | null, floor: HouseholdFloorInstance): Promise<HouseholdFloorInstance> {
    // Check and assign in the same synchronous turn, before any await or mutation.
    // null is an explicit local/test owner, never a floor that a user may claim.
    if (this.owners.has(floor.id) && this.owners.get(floor.id) !== ownerId) {
      throw new HouseholdFloorOwnershipError();
    }
    const saved = structuredClone(floor);
    this.owners.set(floor.id, ownerId);
    this.floors.set(floor.id, saved);
    if (ownerId) {
      const set = this.byOwner.get(ownerId) ?? new Set<string>();
      set.add(floor.id);
      this.byOwner.set(ownerId, set);
    }
    return structuredClone(floor);
  }

  /** Omitting the owner is supported only for explicitly unowned local/test floors. */
  async get(floorId: string, ownerId: string | null = null): Promise<HouseholdFloorInstance | null> {
    if (this.owners.get(floorId) !== ownerId) return null;
    const floor = this.floors.get(floorId);
    return floor ? structuredClone(floor) : null;
  }

  async listForOwner(ownerId: string): Promise<HouseholdFloorInstance[]> {
    const ids = this.byOwner.get(ownerId);
    if (!ids) return [];
    return [...ids]
      .map((id) => this.floors.get(id))
      .filter((floor): floor is HouseholdFloorInstance => Boolean(floor))
      .map((floor) => structuredClone(floor))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getForOwner(ownerId: string, floorId: string): Promise<HouseholdFloorInstance | null> {
    const ids = this.byOwner.get(ownerId);
    if (!ids?.has(floorId)) return null;
    return this.get(floorId, ownerId);
  }

  async appendReceipt(
    floorId: string,
    receipt: HouseholdFloorReceipt,
    ownerId: string | null = null,
  ): Promise<HouseholdFloorInstance | null> {
    if (this.owners.get(floorId) !== ownerId) return null;
    const floor = this.floors.get(floorId);
    if (!floor) return null;
    floor.receipts = [receipt, ...floor.receipts].slice(0, 40);
    floor.updatedAt = receipt.createdAt;
    this.floors.set(floorId, floor);
    return structuredClone(floor);
  }

  /** Playbooks inherit their floor's owner; null only permits an explicitly unowned floor. */
  async savePlaybook(playbook: BrowserSeatPlaybook, ownerId: string | null = null): Promise<BrowserSeatPlaybook> {
    if (this.owners.get(playbook.doId) !== ownerId) throw new HouseholdFloorOwnershipError();
    const list = this.playbooks.get(playbook.doId) ?? [];
    list.unshift(structuredClone(playbook));
    this.playbooks.set(playbook.doId, list.slice(0, 20));
    return structuredClone(playbook);
  }

  async listPlaybooks(doId: string, ownerId: string | null = null): Promise<BrowserSeatPlaybook[]> {
    if (this.owners.get(doId) !== ownerId) return [];
    return structuredClone(this.playbooks.get(doId) ?? []);
  }
}

/** Process-local singleton for route fail-soft when Supabase wiring is absent. */
export const householdFloorMemory = new MemoryHouseholdFloorRepo();
