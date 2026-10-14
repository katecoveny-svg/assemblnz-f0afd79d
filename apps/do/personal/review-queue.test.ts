import { expect, it } from 'vitest';
import { personalReviewQueue } from './review-queue';
import type { PersonalState } from './contract';
it('projects restored receipts honestly without claiming external execution', () => {
 const state = { responsibilities: [], runs: ['running', 'needs_review', 'reviewed', 'failed', 'cancelled'].map((status, index) => ({ id: String(index), responsibility_id: 'task', revision: 1, status, output: 'Fictional draft', evidence: {}, started_at: '2026-10-01T00:00:00Z', finished_at: status === 'running' ? null : '2026-10-01T00:01:00Z' })), worker: { configured: true, lastSeenAt: null } } as PersonalState;
 const queue = personalReviewQueue(JSON.parse(JSON.stringify(state)));
 expect(queue.worker.ready).toBe(false);
 expect(queue.items.map(item => item.receipt)).toEqual(['pending', 'prepared_draft', 'acknowledged_draft', 'preparation_failed', 'cancelled']);
 expect(queue.items.every(item => item.externalAction === 'none')).toBe(true);
});
