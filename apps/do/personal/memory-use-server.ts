import 'server-only';
import { type MemoryUseScope, type ProviderMemoryBundle, validateMemorySnapshot } from './memory-use';

/** Adapter must query by authenticated owner + exact scope in one consistent snapshot.
 * No live adapter is installed. This contract cannot enable providers or background jobs.
 */
export interface ProviderMemoryStore {
  readSnapshot(input: { ownerId: string; scope: MemoryUseScope; consentId: string }): Promise<{ consent: unknown; records: unknown[] }>;
  scopeIsCurrent(input: { ownerId: string; scope: MemoryUseScope }): Promise<boolean>;
}
export async function readProviderMemory(store: ProviderMemoryStore | null, ownerId: string, scope: MemoryUseScope, consentId: string, now: string): Promise<ProviderMemoryBundle> {
  if (!store || !ownerId || !(await store.scopeIsCurrent({ ownerId, scope }))) throw new Error('memory_use_unavailable');
  const snapshot = await store.readSnapshot({ ownerId, scope, consentId });
  const bundle = validateMemorySnapshot(ownerId, scope, snapshot.consent, snapshot.records, now);
  if (bundle.references.some(item => item.consentId !== consentId)) throw new Error('memory_use_denied');
  if (!(await store.scopeIsCurrent({ ownerId, scope }))) throw new Error('memory_use_changed');
  return bundle;
}
/** Call immediately before each provider dispatch and again before keeping its output.
 * Fresh consent revision + record revisions + scope checks discard revoked/edited work.
 * Provider orchestration still needs its independent budget, request consent and policy gate.
 */
export async function recheckProviderMemory(store: ProviderMemoryStore | null, ownerId: string, scope: MemoryUseScope, previous: ProviderMemoryBundle, now: string): Promise<ProviderMemoryBundle> {
  if (!previous.references.length) throw new Error('memory_use_denied');
  const fresh = await readProviderMemory(store, ownerId, scope, previous.references[0].consentId, now);
  if (JSON.stringify(fresh) !== JSON.stringify(previous)) throw new Error('memory_use_changed');
  return fresh;
}
