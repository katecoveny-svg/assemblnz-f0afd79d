import 'server-only';

import type {
  ActionCloudStore,
  ActionReceiptRecord,
  ActionRunRecord,
  PermitRecord,
  WaitRecord,
} from './types';

declare global {
  // eslint-disable-next-line no-var
  var __assemblDoActionCloudMemoryStore: MemoryActionCloudStore | undefined;
}

class MemoryActionCloudStore implements ActionCloudStore {
  runsByActionId = new Map<string, ActionRunRecord>();
  runsByPrepId = new Map<string, ActionRunRecord>();
  runsByIdempotency = new Map<string, ActionRunRecord>();
  permits = new Map<string, PermitRecord>();
  receiptsById = new Map<string, ActionReceiptRecord>();
  receiptsByActionId = new Map<string, ActionReceiptRecord>();
  waits = new Map<string, WaitRecord>();

  async getRunByActionId(actionId: string) {
    return this.runsByActionId.get(actionId) ?? null;
  }

  async getRunByPrepId(prepId: string) {
    return this.runsByPrepId.get(prepId) ?? null;
  }

  async getRunByIdempotency(tenantId: string, idempotencyKey: string) {
    return this.runsByIdempotency.get(`${tenantId}:${idempotencyKey}`) ?? null;
  }

  async saveRun(run: ActionRunRecord) {
    this.runsByActionId.set(run.action_id, run);
    this.runsByPrepId.set(run.prep_id, run);
    if (run.idempotency_key) {
      this.runsByIdempotency.set(`${run.tenant_id}:${run.idempotency_key}`, run);
    }
  }

  async listRuns(opts?: { tenantId?: string }) {
    const all = [...this.runsByActionId.values()];
    if (!opts?.tenantId) return all;
    return all.filter((r) => r.tenant_id === opts.tenantId);
  }

  async getPermit(permitId: string) {
    return this.permits.get(permitId) ?? null;
  }

  async savePermit(permit: PermitRecord) {
    this.permits.set(permit.permit_id, permit);
  }

  async getReceipt(receiptId: string) {
    return this.receiptsById.get(receiptId) ?? null;
  }

  async getReceiptByActionId(actionId: string) {
    return this.receiptsByActionId.get(actionId) ?? null;
  }

  async appendReceipt(receipt: ActionReceiptRecord) {
    if (this.receiptsById.has(receipt.receipt_id)) {
      throw new Error(`append-only violation: receipt ${receipt.receipt_id} already exists`);
    }
    this.receiptsById.set(receipt.receipt_id, receipt);
    this.receiptsByActionId.set(receipt.action_id, receipt);
  }

  async getWait(waitId: string) {
    return this.waits.get(waitId) ?? null;
  }

  async saveWait(wait: WaitRecord) {
    this.waits.set(wait.wait_id, wait);
  }

  reset() {
    this.runsByActionId.clear();
    this.runsByPrepId.clear();
    this.runsByIdempotency.clear();
    this.permits.clear();
    this.receiptsById.clear();
    this.receiptsByActionId.clear();
    this.waits.clear();
  }
}

function memoryStore(): MemoryActionCloudStore {
  if (!globalThis.__assemblDoActionCloudMemoryStore) {
    globalThis.__assemblDoActionCloudMemoryStore = new MemoryActionCloudStore();
  }
  return globalThis.__assemblDoActionCloudMemoryStore;
}

/**
 * Phase 1 uses an in-process memory store (same dual-path idea as assembl tool keys).
 * Supabase tables exist for durable deploy; wire service-role persistence in a later phase
 * when Action Cloud exits "not live production" status.
 */
export function getActionCloudStore(): ActionCloudStore {
  return memoryStore();
}

/** Test helper — clears the process memory store. */
export function _resetActionCloudStoreForTests(): void {
  memoryStore().reset();
}
