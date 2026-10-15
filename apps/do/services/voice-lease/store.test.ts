import { beforeEach, expect, it, vi } from 'vitest';
const db = vi.hoisted(() => ({ row: null as null | { version: number; state: unknown }, fail: false, conflict: false }));
vi.mock('@/lib/supabase/service', () => ({ getServiceClient: () => ({
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: structuredClone(db.row), error: db.fail ? {} : null }) }) }) }),
  rpc: async (_name: string, args: {p_version:number;p_state:unknown}) => {
    if (db.fail) return { error: {} };
    if (db.conflict || (db.row?.version ?? 0) !== args.p_version) return { data: false };
    db.row = { version: args.p_version + 1, state: structuredClone(args.p_state) }; return { data: true };
  },
}) }));
import { durableVoiceLeaseStore } from './store';
beforeEach(() => { db.row = null; db.fail = false; db.conflict = false; });
it('CAS retries concurrent writes without lost updates', async () => {
  const store = durableVoiceLeaseStore();
  await Promise.all([1, 2, 3].map(() => store.transact('owner', s => { s.quotes.push({} as never); })));
  expect((db.row!.state as {quotes:unknown[]}).quotes).toHaveLength(3);
  expect(db.row!.version).toBe(3);
});
it('missing storage and persistent contention fail closed', async () => {
  db.fail = true;
  await expect(durableVoiceLeaseStore().transact('owner', () => 1)).rejects.toMatchObject({ code: 'lease_store_unavailable' });
  db.fail = false; db.conflict = true;
  await expect(durableVoiceLeaseStore().transact('owner', () => 1)).rejects.toMatchObject({ code: 'lease_conflict' });
});
