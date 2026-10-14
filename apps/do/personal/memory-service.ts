import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import { personalMemoryMutationSchema, personalMemoryRecordSchema, nextMemoryRecord, type PersonalMemoryMutation } from './memory';

export class MemoryConflict extends Error {}
export function memoryStorageConfigured() { return process.env.DO_PERSONAL_MEMORY_ENABLED === 'true'; }
function storageOwner(ownerId: string) {
  if (!ownerId || !memoryStorageConfigured()) throw new Error('Optional account memory is unavailable.');
}
function storageFailure() { return new Error('Memory storage unavailable. No change was confirmed.'); }
// Service-role operations must always bind the server-verified owner. No provider calls here.
export async function loadPersonalMemory(ownerId: string) {
  storageOwner(ownerId);
  const db = getServiceClient();
  const { error: purgeError } = await db.rpc('do_personal_memory_purge', { p_owner: ownerId });
  if (purgeError) throw storageFailure();
  const { data, error } = await db.from('do_personal_memory').select('record').eq('owner_id', ownerId);
  if (error || !data) throw storageFailure();
  const now = Date.now();
  return data.filter(row => row.record !== null).map(row => personalMemoryRecordSchema.parse(row.record)).filter(record => Date.parse(record.expiresAt) > now);
}
export async function mutatePersonalMemory(ownerId: string, raw: PersonalMemoryMutation) {
  storageOwner(ownerId);
  const input = personalMemoryMutationSchema.parse(raw);
  const db = getServiceClient();
  const { data, error } = await db.from('do_personal_memory').select('record,revision').eq('owner_id', ownerId).eq('id', input.id).maybeSingle();
  if (error) throw storageFailure();
  // Content-free tombstones prevent delayed creates/edits resurrecting deleted context.
  if (data && (!data.record || data.revision !== input.expectedRevision)) throw new MemoryConflict();
  const current = data ? personalMemoryRecordSchema.parse(data.record) : null;
  let record;
  try { record = nextMemoryRecord(input, current, new Date().toISOString()); }
  catch (error) { if (error instanceof Error && error.message === 'memory_conflict') throw new MemoryConflict(); throw error; }
  const { data: saved, error: saveError } = await db.rpc('do_personal_memory_change', {
    p_owner: ownerId, p_id: input.id, p_expected_revision: input.expectedRevision, p_record: record,
  });
  if (saveError?.message.includes('memory_conflict')) throw new MemoryConflict();
  if (!saveError && saved === false) throw new MemoryConflict();
  if (saveError || saved !== true) throw storageFailure();
  return record;
}
