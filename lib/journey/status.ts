/**
 * assembl — honest status treatments
 * ----------------------------------
 * One reusable vocabulary for what a thing actually is. `simulated` and
 * `completed` are never interchangeable: a prepared basket is `simulated`; only
 * something genuinely done is `completed`. The UI reads `tone` for colour and
 * `label`/`description` for copy — no surface invents its own status words.
 */

import type { StatusTreatment } from './types';

export type StatusTone = 'neutral' | 'positive' | 'caution' | 'info';

export type StatusMeta = {
  label: string;
  description: string;
  tone: StatusTone;
};

export const STATUS_META: Record<StatusTreatment, StatusMeta> = {
  live: { label: 'Live', description: 'Connected to a real system and operating.', tone: 'positive' },
  connected: { label: 'Connected', description: 'A real connection exists but is not live in this run.', tone: 'info' },
  sandbox: { label: 'Sandbox', description: 'Running against safe, non-production data.', tone: 'info' },
  simulated: { label: 'Simulated', description: 'Prepared and shown, but not actually carried out.', tone: 'caution' },
  proposed: { label: 'Proposed', description: 'Suggested for your review — not yet approved.', tone: 'caution' },
  approval_required: { label: 'Approval required', description: 'Waiting on your yes before anything happens.', tone: 'caution' },
  completed: { label: 'Completed', description: 'Genuinely done.', tone: 'positive' },
  unavailable: { label: 'Unavailable', description: 'Not connected — cannot run in this demo.', tone: 'neutral' },
};

export function statusMeta(status: StatusTreatment): StatusMeta {
  return STATUS_META[status];
}
