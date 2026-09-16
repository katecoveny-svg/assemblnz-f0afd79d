/**
 * In-memory Action stub store for prototypes.
 * TODO(action-core): replace with Supabase-backed permits/receipts tables.
 */

import type {
  ExecuteResult,
  PermitRecord,
  PreparedAction,
  ReceiptRecord,
} from './types';

type Store = {
  prepared: Map<string, PreparedAction>;
  permits: Map<string, PermitRecord>;
  executes: Map<string, ExecuteResult>;
  receipts: Map<string, ReceiptRecord>;
  /** prepare idempotency_key → prep_id */
  prepareIdempotency: Map<string, string>;
  /** execute idempotency_key → action_id */
  executeIdempotency: Map<string, string>;
};

const globalStore = globalThis as typeof globalThis & {
  __assemblDoActionStubStore?: Store;
};

function store(): Store {
  if (!globalStore.__assemblDoActionStubStore) {
    globalStore.__assemblDoActionStubStore = {
      prepared: new Map(),
      permits: new Map(),
      executes: new Map(),
      receipts: new Map(),
      prepareIdempotency: new Map(),
      executeIdempotency: new Map(),
    };
  }
  return globalStore.__assemblDoActionStubStore;
}

export function actionStubStore() {
  return store();
}

export function resetActionStubStore() {
  const s = store();
  s.prepared.clear();
  s.permits.clear();
  s.executes.clear();
  s.receipts.clear();
  s.prepareIdempotency.clear();
  s.executeIdempotency.clear();
}
