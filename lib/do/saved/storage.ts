import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { recordSchema, SavedError, type SavedRecord, type SavedStore } from './durable';

const columns = 'owner_id,id,revision,content,deleted,created_at,updated_at';
function record(raw: unknown, owner: string, id?: string): SavedRecord {
  if (!raw || typeof raw !== 'object') throw new SavedError('unavailable');
  const row = raw as Record<string, unknown>;
  const stamp = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : '';
  const parsed = recordSchema.safeParse({ ownerId: row.owner_id, id: row.id, revision: row.revision,
    content: row.content, deleted: row.deleted, createdAt: stamp(row.created_at), updatedAt: stamp(row.updated_at) });
  if (!parsed.success || parsed.data.ownerId !== owner || (id && parsed.data.id !== id)) throw new SavedError('unavailable');
  return parsed.data;
}
function failure(error: { code?: string; message?: string }) {
  if (error.code === '23505') return new SavedError('conflict');
  if (error.message?.includes('saved_quota')) return new SavedError('quota');
  return new SavedError('unavailable');
}
/** Cookie-scoped client only. Owner predicates complement database RLS; no service key. */
export class PostgresSavedStore implements SavedStore {
  constructor(private db: SupabaseClient) {}
  async list(ownerId: string): Promise<SavedRecord[]> {
    const { data, error } = await this.db.from('do_saved_items').select(columns)
      .eq('owner_id', ownerId).eq('deleted', false).order('updated_at', { ascending: false }).limit(81);
    if (error) throw failure(error);
    if (!Array.isArray(data) || data.length > 80) throw new SavedError('unavailable');
    return data.map(row => record(row, ownerId));
  }
  async read(ownerId: string, id: string): Promise<SavedRecord | null> {
    const { data, error } = await this.db.from('do_saved_items').select(columns).eq('owner_id', ownerId).eq('id', id).maybeSingle();
    if (error) throw failure(error);
    return data === null ? null : record(data, ownerId, id);
  }
  async compareAndSwap(ownerId: string, id: string, expectedRevision: number, next: SavedRecord): Promise<SavedRecord | null> {
    if (next.ownerId !== ownerId || next.id !== id || next.revision !== expectedRevision + 1) throw new SavedError('unavailable');
    const table = this.db.from('do_saved_items');
    const query = expectedRevision === 0
      ? table.insert({ owner_id: ownerId, id, revision: 1, content: next.content, deleted: false, consent_version: 'do-saved-v1' })
      : table.update({ revision: next.revision, content: next.content, deleted: next.deleted })
        .eq('owner_id', ownerId).eq('id', id).eq('revision', expectedRevision).eq('deleted', false);
    const { data, error } = await query.select(columns).maybeSingle();
    if (error) throw failure(error);
    if (data === null) return null;
    const saved = record(data, ownerId, id);
    if (saved.revision !== next.revision || saved.deleted !== next.deleted || JSON.stringify(saved.content) !== JSON.stringify(next.content))
      throw new SavedError('unavailable');
    return saved;
  }
}
