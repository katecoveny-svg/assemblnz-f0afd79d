import { ContinuityError, mutationSchema, scopeSchema, taskSchema, type Change, type PortableTask, type Save, type Scope } from './contract';
import type { PortableRepository } from './repository';

export interface ContinuityRpc {
  rpc(name: 'do_continuity_read' | 'do_continuity_mutate', args: Record<string, unknown>): PromiseLike<{ data: unknown; error: { message: string } | null }>;
}

/** Reviewed-proposal adapter. Construct only with a verified owner's cookie-based
 * client. SQL obtains auth.uid(); never uses a service key or trusts owner input.
 * No in-memory fallback and no client-supplied clock/result accepted by the RPC. */
export class DurableRepository implements PortableRepository {
  readonly storage = 'database' as const;
  constructor(private db: ContinuityRpc, private verifiedOwner: string) {}
  private assertOwner(owner: string) { if (owner !== this.verifiedOwner) throw new ContinuityError('not_found'); }
  private async call(name: 'do_continuity_read' | 'do_continuity_mutate', args: Record<string, unknown>) {
    const { data, error } = await this.db.rpc(name, args);
    if (error) {
      const code = ['conflict', 'not_found', 'permission_expired', 'stopped', 'id_reused', 'quota_exhausted'].find(c => error.message.includes(`continuity_${c}`));
      throw new ContinuityError((code as ConstructorParameters<typeof ContinuityError>[0]) || 'storage_unavailable');
    }
    if (data === null || data === undefined) throw new ContinuityError('storage_unavailable');
    return data;
  }
  async list(owner: string, scope: Scope, _now: string): Promise<PortableTask[]> {
    this.assertOwner(owner);
    const data = await this.call('do_continuity_read', { p_scope: scopeSchema.parse(scope), p_id: null });
    if (!Array.isArray(data)) throw new ContinuityError('storage_unavailable');
    return data.map(t => this.parseOwned(t, owner, scope));
  }
  async get(owner: string, scope: Scope, id: string, now: string) {
    this.assertOwner(owner);
    const tasks = await this.call('do_continuity_read', { p_scope: scopeSchema.parse(scope), p_id: id });
    if (!Array.isArray(tasks) || tasks.length > 1) throw new ContinuityError('storage_unavailable');
    return tasks.length ? this.parseOwned(tasks[0], owner, scope) : null;
  }
  private parseOwned(raw: unknown, owner: string, scope: Scope) {
    const parsed = taskSchema.safeParse(raw);
    if (!parsed.success || parsed.data.ownerId !== owner || parsed.data.scope !== scope) throw new ContinuityError('storage_unavailable');
    return parsed.data;
  }
  async save(owner: string, input: Save, _now: string) { return this.mutate(owner, input); }
  async change(owner: string, input: Change, _now: string) { return this.mutate(owner, input); }
  private async mutate(owner: string, input: Save | Change) {
    this.assertOwner(owner);
    const parsed = mutationSchema.parse(input);
    return this.parseOwned(await this.call('do_continuity_mutate', { p_input: parsed }), owner, parsed.scope);
  }
}
