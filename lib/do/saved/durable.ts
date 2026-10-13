import 'server-only';
import { z } from 'zod';
import { saveIntentSchema, type SaveIntent } from './save-intent';

const uuid = z.string().uuid();
export const recordSchema = z.object({
  ownerId: uuid, id: uuid, revision: z.number().int().positive(),
  content: saveIntentSchema.nullable(), deleted: z.boolean(),
  createdAt: z.string().datetime(), updatedAt: z.string().datetime(),
}).strict().refine(value => value.deleted === (value.content === null), 'Deleted content must be erased.');
export type SavedRecord = z.infer<typeof recordSchema>;
/** Port must implement atomic CAS and tombstones; no in-memory production fallback. */
export interface SavedStore {
  read(ownerId: string, id: string): Promise<unknown | null>;
  compareAndSwap(ownerId: string, id: string, expectedRevision: number, next: SavedRecord): Promise<boolean>;
}
export class SavedError extends Error {
  constructor(public code: 'owner_changed' | 'not_found' | 'conflict' | 'deleted' | 'unavailable') { super(code); }
}
/** Inactive server adapter. authenticatedOwner must come from doOwner(), never request JSON. */
export class SavedRepository {
  constructor(private store: SavedStore, private authenticatedOwner: string) { uuid.parse(authenticatedOwner); }
  private owner(expectedOwner: string) {
    if (expectedOwner !== this.authenticatedOwner) throw new SavedError('owner_changed');
    return this.authenticatedOwner;
  }
  async get(expectedOwner: string, id: string): Promise<SavedRecord | null> {
    const owner = this.owner(expectedOwner); uuid.parse(id);
    const raw = await this.store.read(owner, id);
    if (!raw) return null;
    const parsed = recordSchema.safeParse(raw);
    if (!parsed.success || parsed.data.ownerId !== owner || parsed.data.id !== id) throw new SavedError('unavailable');
    return parsed.data;
  }
  async save(expectedOwner: string, id: string, expectedRevision: number, content: SaveIntent, now: string) {
    const ownerId = this.owner(expectedOwner); uuid.parse(id); z.number().int().nonnegative().parse(expectedRevision);
    const parsed = saveIntentSchema.parse(content);
    // Persistent image bytes require their own owner-only blob adapter + consent. Closed until then.
    if (parsed.kind === 'image') throw new SavedError('unavailable');
    const old = await this.get(ownerId, id);
    if (old?.deleted) throw new SavedError('deleted');
    if ((old?.revision ?? 0) !== expectedRevision) throw new SavedError('conflict');
    const next = recordSchema.parse({ ownerId, id, revision: expectedRevision + 1, content: parsed, deleted: false, createdAt: old?.createdAt ?? now, updatedAt: now });
    if (!await this.store.compareAndSwap(ownerId, id, expectedRevision, next)) throw new SavedError('conflict');
    return next;
  }
  async remove(expectedOwner: string, id: string, expectedRevision: number, now: string) {
    const ownerId = this.owner(expectedOwner); const old = await this.get(ownerId, id);
    if (!old) throw new SavedError('not_found');
    if (old.revision !== expectedRevision) throw new SavedError('conflict');
    if (old.deleted) return old;
    const next = recordSchema.parse({ ...old, content: null, deleted: true, revision: old.revision + 1, updatedAt: now });
    if (!await this.store.compareAndSwap(ownerId, id, expectedRevision, next)) throw new SavedError('conflict');
    return next;
  }
}
