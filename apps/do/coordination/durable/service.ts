import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { commandSchema, type CoordinationCommand } from './contract';
export class CoordinationUnavailable extends Error {}
/** Session-bound authenticated client only. No service-role bypass or process-memory fallback. */
export async function coordinationSnapshot() {
  const db = await createClient();
  const { data, error } = await db.rpc('do_ea_snapshot');
  if (error || !data || typeof data !== 'object') throw new CoordinationUnavailable('Coordination storage unavailable.');
  return data;
}
export async function coordinationCommand(input: CoordinationCommand) {
  const checked = commandSchema.parse(input);
  const db = await createClient();
  const { data, error } = await db.rpc('do_ea_command', { p_command: checked });
  if (error) {
    if (error.message.includes('ea_conflict')) return { error: 'revision_conflict' };
    if (error.message.includes('ea_replay')) return { error: 'replay_rejected' };
    if (error.message.includes('ea_scope')) return { error: 'scope_denied' };
    if (error.message.includes('ea_quota')) return { error: 'quota_exceeded' };
    if (error.message.includes('ea_invalid')) return { error: 'invalid_command' };
    throw new CoordinationUnavailable('Coordination save could not be confirmed.');
  }
  if (!data || typeof data !== 'object') throw new CoordinationUnavailable('Coordination result unavailable.');
  return data;
}
