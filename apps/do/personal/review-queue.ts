import type { PersonalState, PersonalRun } from './contract';
import { personalWorkerHealth } from './worker-health';

/** Projection of existing durable jobs; review is acknowledgement, never action authority. */
export function personalReviewQueue(state: PersonalState, now = Date.now()) {
  return {
    worker: personalWorkerHealth(state.worker, now),
    responsibilities: state.responsibilities.map(item => ({
      id: item.id, revision: item.revision, nextRunAt: item.next_run_at,
      status: !item.active ? 'paused' : Date.parse(item.consent_until) <= now ? 'permission_expired' : 'scheduled',
      preparationRule: 'daily_saved_notes', permissionExpiresAt: item.consent_until,
    })),
    items: state.runs.map(run => ({
      id: run.id, responsibilityId: run.responsibility_id, revision: run.revision,
      status: run.status, receipt: receiptState(run),
      requiresReview: run.status === 'needs_review', preparedAt: run.finished_at,
      evidence: run.evidence, externalAction: 'none' as const,
    })),
  };
}
function receiptState(run: PersonalRun) {
  if (run.status === 'failed') return 'preparation_failed';
  if (run.status === 'cancelled') return 'cancelled';
  if (run.status === 'running') return 'pending';
  if (!run.output || !run.finished_at) return 'incomplete';
  return run.status === 'reviewed' ? 'acknowledged_draft' : 'prepared_draft';
}
