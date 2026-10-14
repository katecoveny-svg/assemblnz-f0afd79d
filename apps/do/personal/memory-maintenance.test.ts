import { expect, it, vi } from 'vitest';
import { memoryPurgeHealth, runMemoryPurge } from './memory-maintenance';
it('bounds every batch and exits when the queue drains', async () => {
 const batch = vi.fn().mockResolvedValueOnce(100).mockResolvedValueOnce(7);
 expect(await runMemoryPurge(batch)).toMatchObject({ status: 'completed', batches: 2, purged: 107 });
 expect(batch.mock.calls).toEqual([[100],[100]]);
});
it('bounds sustained backlog to three calls and never calls providers', async () => {
 const batch = vi.fn().mockResolvedValue(100);
 expect(await runMemoryPurge(batch)).toMatchObject({ status: 'backlog', batches: 3, purged: 300 });
 expect(batch).toHaveBeenCalledTimes(3);
});
it('does not retry uncertain failure or claim its content was deleted', async () => {
 const batch = vi.fn().mockResolvedValueOnce(100).mockRejectedValueOnce(new Error('timeout'));
 expect(await runMemoryPurge(batch)).toMatchObject({ status: 'failed', batches: 1, purged: 100 });
 expect(batch).toHaveBeenCalledTimes(2);
});
it('stops starting new batches after the elapsed-time budget', async () => {
 let now = 0; const batch = vi.fn(async () => { now = 15_000; return 100; });
 expect(await runMemoryPurge(batch, () => now)).toMatchObject({ status: 'deadline', batches: 1 });
 expect(batch).toHaveBeenCalledOnce();
});
it('rejects impossible batch receipts', async () => {
 expect(await runMemoryPurge(async () => 101)).toMatchObject({ status: 'failed', purged: 0 });
});
it('health fails closed for stale checks, backlog, failure and overdue expiry', () => {
 const now = Date.parse('2026-10-01T00:00:00Z');
 const health = { lastAttemptAt: new Date(now).toISOString(), lastCompletedAt: new Date(now).toISOString(), status: 'completed' as const, purged: 0, sampledOverdue: 0, oldestOverdueAt: null };
 expect(memoryPurgeHealth(health, now).ready).toBe(true);
 expect(memoryPurgeHealth({ ...health,lastAttemptAt:null },now).ready).toBe(false);
 expect(memoryPurgeHealth({ ...health,status:'failed' },now).ready).toBe(false);
 expect(memoryPurgeHealth({ ...health,sampledOverdue:1 },now).ready).toBe(false);
 expect(memoryPurgeHealth({ ...health,oldestOverdueAt:new Date(now-76*60000).toISOString() },now).ready).toBe(false);
});
