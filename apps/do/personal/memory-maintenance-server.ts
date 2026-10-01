import 'server-only';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase/service';
import { runMemoryPurge, type MemoryPurgeHealth } from './memory-maintenance';
const healthSchema = z.object({
  lastAttemptAt: z.string().datetime({ offset: true }).nullable(),
  lastCompletedAt: z.string().datetime({ offset: true }).nullable(),
  status: z.enum(['completed', 'backlog', 'deadline', 'failed']).nullable(),
  purged: z.number().int().min(0).max(300),
  sampledOverdue: z.number().int().min(0).max(1001),
  oldestOverdueAt: z.string().datetime({ offset: true }).nullable(),
}).strict();
// Trusted maintenance caller only; not exposed as a user endpoint or registered cron.
// Separately gated so cleanup can remain enabled after collection is paused.
export async function maintainPersonalMemory() {
  if (process.env.DO_PERSONAL_MEMORY_PURGE_ENABLED !== 'true') return { configured: false as const };
  const db = getServiceClient();
  const outcome = await runMemoryPurge(async limit => {
    const { data, error } = await db.rpc('do_personal_memory_expire_batch', { p_limit: limit }).abortSignal(AbortSignal.timeout(5000));
    if (error || !Number.isInteger(data)) throw new Error('cleanup_unavailable');
    return data as number;
  });
  // A timed-out request may still commit. Counts represent confirmed responses only.
  const { error } = await db.rpc('do_personal_memory_record_maintenance', {
    p_status: outcome.status, p_purged: outcome.purged, p_started: outcome.startedAt,
  }).abortSignal(AbortSignal.timeout(2000));
  if (error) throw new Error('Memory cleanup monitoring unavailable.');
  return { configured: true as const, outcome };
}
export async function getPersonalMemoryPurgeHealth(): Promise<MemoryPurgeHealth> {
  const { data, error } = await getServiceClient().rpc('do_personal_memory_maintenance_health').abortSignal(AbortSignal.timeout(2000));
  if (error) throw new Error('Memory cleanup monitoring unavailable.');
  return healthSchema.parse(data);
}
