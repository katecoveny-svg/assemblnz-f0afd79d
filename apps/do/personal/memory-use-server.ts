import 'server-only';
import { type MemoryUseScope, type ProviderMemoryBundle, validateMemorySnapshot } from './memory-use';

/** Adapter must query by authenticated owner + exact scope in one consistent snapshot.
 * No live adapter is installed. This contract cannot enable providers or background jobs.
 */
export interface ProviderMemoryStore {
  readSnapshot(input: { ownerId: string; scope: MemoryUseScope; consentId: string }): Promise<{ consent: unknown; records: unknown[] }>;
  scopeIsCurrent(input: { ownerId: string; scope: MemoryUseScope }): Promise<boolean>;
}
export class MemoryUseError extends Error {
  constructor(public readonly code: 'memory_use_unavailable' | 'memory_use_denied' | 'memory_use_changed') { super(code); }
}
export type MemoryUseClock = () => string;
export async function readProviderMemory(store: ProviderMemoryStore | null, ownerId: string, scope: MemoryUseScope, consentId: string, clock: MemoryUseClock = () => new Date().toISOString()): Promise<ProviderMemoryBundle> {
 try {
  if (!store || !ownerId || !(await store.scopeIsCurrent({ ownerId, scope }))) throw new Error('memory_use_unavailable');
  const snapshot = await store.readSnapshot({ ownerId, scope, consentId });
  if (!(await store.scopeIsCurrent({ ownerId, scope }))) throw new Error('memory_use_changed');
  const bundle = validateMemorySnapshot(ownerId, scope, snapshot.consent, snapshot.records, clock());
  if (bundle.references.some(item => item.consentId !== consentId)) throw new Error('memory_use_denied');
  return bundle;
 } catch (error) {
  if (error instanceof MemoryUseError) throw error;
  const code = error instanceof Error && ['memory_use_denied', 'memory_use_changed', 'memory_use_unavailable'].includes(error.message) ? error.message as MemoryUseError['code'] : 'memory_use_unavailable';
  throw new MemoryUseError(code);
 }
}
/** Call immediately before each provider dispatch and again before keeping its output.
 * Fresh consent revision + record revisions + scope checks discard revoked/edited work.
 * Provider orchestration still needs its independent budget, request consent and policy gate.
 */
export async function recheckProviderMemory(store: ProviderMemoryStore | null, ownerId: string, scope: MemoryUseScope, previous: ProviderMemoryBundle, clock: MemoryUseClock = () => new Date().toISOString()): Promise<ProviderMemoryBundle> {
  if (!previous.references.length) throw new MemoryUseError('memory_use_denied');
  const fresh = await readProviderMemory(store, ownerId, scope, previous.references[0].consentId, clock);
  if (JSON.stringify(fresh) !== JSON.stringify(previous)) throw new MemoryUseError('memory_use_changed');
  return fresh;
}
