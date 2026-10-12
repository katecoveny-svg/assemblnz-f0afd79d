import { EvidenceRecordSchema, type EvidenceRecord, type JourneyRun, type ProposedActionStatus, type StatusTreatment } from '@/lib/journey/types';
/** Session-only, fictional preparation contracts shared by Shop and Travel. */
export type PreparationIdentity = { ownerId: string; taskId: string; revision: number };
export type Budget = { currency: 'NZD'; limitMinor: number; feeMinor: number | null };
export function budgetSummary(budget: Budget, lineMinor: number[]) {
  if (budget.currency !== 'NZD' || !Number.isSafeInteger(budget.limitMinor) || budget.limitMinor <= 0 || lineMinor.some(n => !Number.isSafeInteger(n) || n < 0) || (budget.feeMinor !== null && (!Number.isSafeInteger(budget.feeMinor) || budget.feeMinor < 0))) throw new Error('Valid NZD budget required');
  const estimatedMinor = lineMinor.reduce((a,b) => a+b, 0);
  if (!Number.isSafeInteger(estimatedMinor)) throw new Error('Budget amount exceeds supported range');
  const totalMinor = budget.feeMinor === null ? null : estimatedMinor + budget.feeMinor;
  return { estimatedMinor, totalMinor, exceedsBudget: (totalMinor ?? estimatedMinor) > budget.limitMinor, confirmedWithinBudget: totalMinor !== null && totalMinor <= budget.limitMinor };
}
export type PreparedReceipt = PreparationIdentity & { version: 1; runId: JourneyRun['id']; id: string; status: 'prepared'; reviewStatus: 'reviewed'; provenance: EvidenceRecord[]; externalAction: 'none'; preparedAt: string; fingerprint: string };
/** Canonical JSON projection: object key order must not invalidate equivalent evidence. */
export function fingerprint(value: unknown): string {
  const canonical = (item: unknown): unknown => {
    if (Array.isArray(item)) return item.map(canonical);
    if (item !== null && typeof item === 'object') return Object.fromEntries(Object.entries(item).sort(([a],[b]) => a.localeCompare(b)).map(([key, entry]) => [key, canonical(entry)]));
    return item;
  };
  return JSON.stringify(canonical(value));
}
export function receipt(identity: PreparationIdentity, reviewed: string | null, value: unknown, now: string, provenance: EvidenceRecord[] = []): PreparedReceipt {
  const digest = fingerprint(value);
  if (reviewed !== digest) throw new Error('Review the current revision first');
  return { ...identity, version: 1, runId: preparationRunId(identity), reviewStatus: 'reviewed', provenance: provenance.map(e => ({ ...e })), id: `${identity.ownerId}:${identity.taskId}:${identity.revision}`, status: 'prepared', externalAction: 'none', preparedAt: now, fingerprint: digest };
}
/** No programme rates, provider identifiers or real issuance are inferred. */
export type RewardOffer = {
  id: string; programme: 'fictional-demo'; sponsor: string; sponsorship: 'simulated';
  eligibility: string; terms: string; choices: readonly string[];
};
export type RewardEvent = { key: string; taskId: string; ownerId: string; offerId: string; choice: string; state: 'pending' | 'earned' | 'failed'; evidence: string; simulated: true };
export const demoReward: RewardOffer = { id: 'pantry-usefulness-v1', programme: 'fictional-demo', sponsor: 'Fictional Pantry Partner', sponsorship: 'simulated', eligibility: 'Fictional household; once per task; optional pantry-use checklist completed during genuine preparation.', terms: 'Demo acknowledgement only. No money, points, redemption or Everyday Rewards benefit. No agreed funding or issuance.', choices: ['Keep a demo acknowledgement', 'Gift a demo acknowledgement'] };
export function beginReward(identity: PreparationIdentity, offer: RewardOffer, choice: string, working: boolean, events: RewardEvent[]): RewardEvent[] {
  const key = `${identity.ownerId}:${identity.taskId}:${offer.id}`; // Revision/retry deliberately excluded.
  if (events.some(e => e.key === key)) return events;
  if (!working || !offer.choices.includes(choice)) throw new Error('Activity requires an active task and valid reward choice');
  return [...events, { key, taskId: identity.taskId, ownerId: identity.ownerId, offerId: offer.id, choice, state: 'pending', evidence: 'Optional pantry-use checklist recorded during preparation', simulated: true }];
}
export function settleRewards(events: RewardEvent[], identity: PreparationIdentity, succeeded: boolean): RewardEvent[] {
  return events.map(e => e.ownerId === identity.ownerId && e.taskId === identity.taskId && e.state === 'pending' ? { ...e, state: succeeded ? 'earned' : 'failed', evidence: succeeded ? 'Checklist recorded; fixture consolidation completed. Simulated acknowledgement only.' : 'Fixture preparation failed; no acknowledgement issued.' } : e);
}


/** An adapter to existing journey IDs/evidence/action statuses, not another journey runtime. */
export type PreparationRun = PreparationIdentity & {
  version: 1;
  runId: JourneyRun['id'];
  status: 'prepared' | 'reviewed' | 'declined';
  actionStatus: Extract<ProposedActionStatus, 'proposed' | 'approved' | 'rejected'>;
  execution: Extract<StatusTreatment, 'simulated'>;
  fingerprint: string;
  provenance: EvidenceRecord[];
  preparedAt: string;
  reviewedAt: string | null;
};
export function preparationRunId(identity: PreparationIdentity): JourneyRun['id'] {
  for (const id of [identity.ownerId, identity.taskId]) if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) throw new Error('Invalid fixture identity');
  if (!Number.isInteger(identity.revision) || identity.revision < 1) throw new Error('Invalid preparation revision');
  return `${identity.ownerId}:${identity.taskId}`;
}
export function prepareRun(identity: PreparationIdentity, value: unknown, provenance: EvidenceRecord[], previous: PreparationRun | null, now: string): PreparationRun {
  const runId = preparationRunId(identity), digest = fingerprint(value);
  if (!Number.isFinite(Date.parse(now))) throw new Error('Invalid preparation time');
  if (previous && previous.runId === runId) {
    if (identity.revision < previous.revision) throw new Error('Stale preparation revision');
    if (identity.revision === previous.revision) {
      if (digest !== previous.fingerprint || fingerprint(provenance) !== fingerprint(previous.provenance)) throw new Error('Material changes require a new revision');
      return previous; // Repeated preparation preserves review and cancellation.
    }
  }
  const sources = EvidenceRecordSchema.array().parse(provenance);
  if (sources.some(e => e.runId !== runId)) throw new Error('Evidence belongs to another run');
  return { ...identity, version: 1, runId, status: 'prepared', actionStatus: 'proposed', execution: 'simulated', fingerprint: digest, provenance: sources, preparedAt: now, reviewedAt: null };
}
function assertCurrent(run: PreparationRun, identity: PreparationIdentity, value: unknown) {
  if (preparationRunId(identity) !== run.runId || identity.revision !== run.revision || fingerprint(value) !== run.fingerprint) throw new Error('Preparation changed; review the current revision');
  if (run.status === 'declined') throw new Error('Preparation cancelled');
}
export function reviewRun(run: PreparationRun, identity: PreparationIdentity, value: unknown, reviewed: boolean, now: string): PreparationRun {
  assertCurrent(run, identity, value);
  if (!Number.isFinite(Date.parse(now))) throw new Error('Invalid review time');
  return { ...run, status: reviewed ? 'reviewed' : 'prepared', actionStatus: reviewed ? 'approved' : 'proposed', reviewedAt: reviewed ? now : null };
}
export function declineRun(run: PreparationRun): PreparationRun {
  if (run.status === 'declined') return run;
  return { ...run, status: 'declined', actionStatus: 'rejected', reviewedAt: null };
}
export function runReceipt(run: PreparationRun, identity: PreparationIdentity, value: unknown, now: string): PreparedReceipt {
  assertCurrent(run, identity, value);
  if (run.status !== 'reviewed') throw new Error('Review the current revision first');
  return receipt(identity, run.fingerprint, value, now, run.provenance);
}
