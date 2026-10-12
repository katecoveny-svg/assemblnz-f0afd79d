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
export type PreparedReceipt = PreparationIdentity & { id: string; status: 'prepared'; externalAction: 'none'; preparedAt: string; fingerprint: string };
export function fingerprint(value: unknown): string { return JSON.stringify(value); }
export function receipt(identity: PreparationIdentity, reviewed: string | null, value: unknown, now: string): PreparedReceipt {
  const digest = fingerprint(value);
  if (reviewed !== digest) throw new Error('Review the current revision first');
  return { ...identity, id: `${identity.ownerId}:${identity.taskId}:${identity.revision}`, status: 'prepared', externalAction: 'none', preparedAt: now, fingerprint: digest };
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
