export const MEMORY_PURGE_BATCH_SIZE = 100;
export const MEMORY_PURGE_MAX_BATCHES = 3;
export const MEMORY_PURGE_BUDGET_MS = 15_000;
export type MemoryPurgeOutcome = {
  status: 'completed' | 'backlog' | 'deadline' | 'failed';
  batches: number; purged: number; startedAt: string; finishedAt: string;
};
/** Bounded cleanup of context bodies only. No provider work, owner IDs or context in monitoring. */
export async function runMemoryPurge(
  batch: (limit: number) => Promise<number>,
  clock: () => number = Date.now,
): Promise<MemoryPurgeOutcome> {
  const start = clock(); let batches = 0, purged = 0;
  const outcome = (status: MemoryPurgeOutcome['status']): MemoryPurgeOutcome => ({
    status, batches, purged, startedAt: new Date(start).toISOString(), finishedAt: new Date(clock()).toISOString(),
  });
  for (let i = 0; i < MEMORY_PURGE_MAX_BATCHES; i++) {
    if (clock() - start >= MEMORY_PURGE_BUDGET_MS) return outcome('deadline');
    try {
      const count = await batch(MEMORY_PURGE_BATCH_SIZE);
      if (!Number.isInteger(count) || count < 0 || count > MEMORY_PURGE_BATCH_SIZE) return outcome('failed');
      batches++; purged += count;
      if (count < MEMORY_PURGE_BATCH_SIZE) return outcome('completed');
    } catch { return outcome('failed'); }
  }
  return outcome('backlog');
}
export type MemoryPurgeHealth = {
  lastAttemptAt: string | null; lastCompletedAt: string | null;
  status: MemoryPurgeOutcome['status'] | null; purged: number;
  sampledOverdue: number; oldestOverdueAt: string | null;
};
export function memoryPurgeHealth(health: MemoryPurgeHealth, now = Date.now()) {
  const attempted = health.lastAttemptAt ? Date.parse(health.lastAttemptAt) : NaN;
  const completed = health.lastCompletedAt ? Date.parse(health.lastCompletedAt) : NaN;
  const oldest = health.oldestOverdueAt ? Date.parse(health.oldestOverdueAt) : NaN;
  if (!health.status || (health.status === 'completed' && (!Number.isFinite(completed) || completed > now)) || !Number.isFinite(attempted) || attempted > now || now - attempted > 90 * 60_000)
    return { ready: false, status: 'unverified' as const, detail: 'Cleanup has no recent valid check. Keep optional memory inactive.' };
  if (health.status === 'failed' || health.status === 'deadline' || (Number.isFinite(oldest) && now - oldest > 75 * 60_000))
    return { ready: false, status: 'delayed' as const, detail: 'Cleanup failed or overdue content exceeded the target. Pause new collection and investigate.' };
  if (health.sampledOverdue > 0 || health.status === 'backlog')
    return { ready: false, status: 'backlog' as const, detail: 'Expired content remains queued for cleanup. This check is not a deletion receipt.' };
  return { ready: true, status: 'checked' as const, detail: 'Recent cleanup found no overdue active content. Backup erasure is not verified.' };
}
