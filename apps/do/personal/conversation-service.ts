import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import { conversationMutationSchema, conversationRecordSchema, nextConversationRecord, type ConversationMutation, type ConversationRecord } from './conversation';

export class ConversationConflict extends Error {}
export function conversationStorageConfigured() { return process.env.DO_PERSONAL_CONVERSATIONS_ENABLED === 'true'; }
function storageOwner(ownerId: string) {
  if (!ownerId || !conversationStorageConfigured()) throw new Error('Kept conversations are unavailable.');
}
function storageFailure() { return new Error('Conversation storage unavailable. No change was confirmed.'); }
// Service-role operations always bind the server-verified owner. Nothing here calls a provider.
export async function loadConversations(ownerId: string): Promise<ConversationRecord[]> {
  storageOwner(ownerId);
  const db = getServiceClient();
  const { error: purgeError } = await db.rpc('do_personal_conversation_purge', { p_owner: ownerId });
  if (purgeError) throw storageFailure();
  const { data, error } = await db.from('do_personal_conversations').select('record').eq('owner_id', ownerId);
  if (error || !data) throw storageFailure();
  const now = Date.now();
  return data.filter(row => row.record !== null).map(row => conversationRecordSchema.parse(row.record))
    .filter(record => Date.parse(record.expiresAt) > now)
    .sort((x, y) => Date.parse(y.updatedAt) - Date.parse(x.updatedAt));
}
export async function mutateConversation(ownerId: string, raw: ConversationMutation): Promise<ConversationRecord | null> {
  storageOwner(ownerId);
  const input = conversationMutationSchema.parse(raw);
  const db = getServiceClient();
  const { data, error } = await db.from('do_personal_conversations').select('record,revision').eq('owner_id', ownerId).eq('id', input.id).maybeSingle();
  if (error) throw storageFailure();
  if (data && (!data.record || data.revision !== input.expectedRevision)) throw new ConversationConflict();
  const current = data ? conversationRecordSchema.parse(data.record) : null;
  let record: ConversationRecord | null;
  try { record = nextConversationRecord(input, current, new Date().toISOString()); }
  catch (cause) { if (cause instanceof Error && cause.message === 'conversation_conflict') throw new ConversationConflict(); throw cause; }
  const { data: saved, error: saveError } = await db.rpc('do_personal_conversation_change', {
    p_owner: ownerId, p_id: input.id, p_expected_revision: input.expectedRevision, p_record: record,
  });
  if (saveError?.message.includes('conversation_conflict')) throw new ConversationConflict();
  if (!saveError && saved === false) throw new ConversationConflict();
  if (saveError || saved !== true) throw storageFailure();
  return record;
}
