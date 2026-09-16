/**
 * In-memory Household Floor repository for tests + fail-soft local API.
 * Browser demo primarily uses device localStorage; this backs authenticated paths.
 */

import type { HouseholdFloorInstance, HouseholdFloorReceipt } from './household-floor';
import type { BrowserSeatPlaybook } from './browser-seat';

export class MemoryHouseholdFloorRepo {
  private floors = new Map<string, HouseholdFloorInstance>();
  private byOwner = new Map<string, Set<string>>();
  private playbooks = new Map<string, BrowserSeatPlaybook[]>();

  clear() {
    this.floors.clear();
    this.byOwner.clear();
    this.playbooks.clear();
  }

  async save(ownerId: string | null, floor: HouseholdFloorInstance): Promise<HouseholdFloorInstance> {
    this.floors.set(floor.id, structuredClone(floor));
    if (ownerId) {
      const set = this.byOwner.get(ownerId) ?? new Set<string>();
      set.add(floor.id);
      this.byOwner.set(ownerId, set);
    }
    return structuredClone(floor);
  }

  async get(floorId: string): Promise<HouseholdFloorInstance | null> {
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
    return this.get(floorId);
  }

  async appendReceipt(
    floorId: string,
    receipt: HouseholdFloorReceipt,
  ): Promise<HouseholdFloorInstance | null> {
    const floor = this.floors.get(floorId);
    if (!floor) return null;
    floor.receipts = [receipt, ...floor.receipts].slice(0, 40);
    floor.updatedAt = receipt.createdAt;
    this.floors.set(floorId, floor);
    return structuredClone(floor);
  }

  async savePlaybook(playbook: BrowserSeatPlaybook): Promise<BrowserSeatPlaybook> {
    const list = this.playbooks.get(playbook.doId) ?? [];
    list.unshift(playbook);
    this.playbooks.set(playbook.doId, list.slice(0, 20));
    return structuredClone(playbook);
  }

  async listPlaybooks(doId: string): Promise<BrowserSeatPlaybook[]> {
    return structuredClone(this.playbooks.get(doId) ?? []);
  }
}

/** Process-local singleton for route fail-soft when Supabase wiring is absent. */
export const householdFloorMemory = new MemoryHouseholdFloorRepo();
