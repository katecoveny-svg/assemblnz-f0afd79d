import { ContinuityError, changeTask, newTask, visibleTask, type Change, type PortableTask, type Save, type Scope } from './contract';
import { worksheetExecutor, type PortableExecutor } from './executor';

export interface PortableRepository {
  readonly storage: 'database' | 'fixture';
  list(owner: string, scope: Scope, now: string): Promise<PortableTask[]>;
  get(owner: string, scope: Scope, id: string, now: string): Promise<PortableTask | null>;
  save(owner: string, input: Save, now: string): Promise<PortableTask>;
  change(owner: string, input: Change, now: string, signal?: AbortSignal): Promise<PortableTask>;
}

/** Explicit browser/test fixture, never a production fallback. Shared backing lets
 * tests emulate two sessions without claiming real cross-device persistence. */
export class FixtureRepository implements PortableRepository {
  readonly storage = 'fixture' as const;
  private pending = new Map<string, Promise<PortableTask>>();
  constructor(private rows = new Map<string, PortableTask>(), private executor: PortableExecutor = worksheetExecutor) {}
  async list(owner: string, scope: Scope, now: string) {
    return [...this.rows.values()].filter(t => t.ownerId === owner && t.scope === scope).map(t => visibleTask(t, now));
  }
  async get(owner: string, scope: Scope, id: string, now: string) {
    const task = this.rows.get(id);
    return task?.ownerId === owner && task.scope === scope ? visibleTask(task, now) : null;
  }
  async save(owner: string, input: Save, now: string) {
    const candidate = newTask(owner, input, now);
    const previous = this.rows.get(input.id);
    if (previous) {
      if (previous.ownerId !== owner || previous.scope !== input.scope) throw new ContinuityError('not_found');
      if (previous.request !== candidate.request || JSON.stringify(previous.context) !== JSON.stringify(candidate.context))
        throw new ContinuityError('id_reused');
      return visibleTask(previous, now);
    }
    this.assertQuota(owner, candidate, now, true);
    this.rows.set(input.id, candidate);
    return structuredClone(candidate);
  }
  async change(owner: string, input: Change, now: string, signal?: AbortSignal) {
    const key = `${owner}:${input.scope}:${input.id}:${input.expectedRevision}`;
    if (input.action !== 'prepare') return this.apply(owner, input, now, signal);
    const prior = this.pending.get(key);
    if (prior) return prior;
    const operation = this.apply(owner, input, now, signal);
    this.pending.set(key, operation);
    try { return await operation; } finally { this.pending.delete(key); }
  }
  private async apply(owner: string, input: Change, now: string, signal?: AbortSignal) {
    const current = this.rows.get(input.id);
    if (!current || current.ownerId !== owner || current.scope !== input.scope) throw new ContinuityError('not_found');
    // Validate before passing any data to even an inert executor.
    if (input.action === 'prepare' && current.status !== 'needs_review') changeTask(current, input, now, '');
    let result: string | undefined;
    if (input.action === 'prepare' && current.status === 'waiting') result = await this.executor.prepare(structuredClone(current), signal);
    signal?.throwIfAborted();
    // Re-read after preparation: revocation or another device's edit wins.
    const latest = this.rows.get(input.id)!;
    const changed = changeTask(latest, input, now, result);
    this.assertQuota(owner, changed, now, false);
    this.rows.set(input.id, changed);
    return visibleTask(changed, now);
  }
  private assertQuota(owner: string, candidate: PortableTask, now: string, inserting: boolean) {
    const rows = [...this.rows.values()].filter(t => t.ownerId === owner);
    if (inserting && (rows.length >= 2048 || rows.filter(t => Date.parse(t.expiresAt) > Date.parse(now)).length >= 40))
      throw new ContinuityError('quota_exhausted');
    const bytes = (t: PortableTask) => new TextEncoder().encode(t.request + JSON.stringify(t.context) + (t.result || '')).byteLength + t.context.length * 20;
    if (rows.filter(t => t.id !== candidate.id).reduce((sum, t) => sum + bytes(t), 0) + bytes(candidate) > 262144)
      throw new ContinuityError('quota_exhausted');
  }
}
