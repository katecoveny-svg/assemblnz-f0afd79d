import { type Brief, type ReviewState, type Snapshot, latestSources } from './model';
export const TEST_REVIEWER = { id: 'test-reviewer-robin', name: 'Robin — fictional test reviewer', mode: 'test' as const };
export function source(kind: 'research' | 'meeting', now: string, text?: string): Snapshot {
  return { id: crypto.randomUUID(), sourceId: kind, label: kind === 'research' ? 'Fictional Harbour Research Fund notice' : 'Fictional Harbour Institute discussion',
    url: `https://harbour-institute.invalid/${kind}`, observedAt: now, expiresAt: new Date(Date.parse(now) + 86400000).toISOString(),
    text: text ?? (kind === 'research' ? 'The fictional research workshop accepts expressions of interest until 30 November 2026.' : 'Robin: We could prepare a workshop outline. Alex might draft it by Friday, but we have not agreed an owner or date.'),
    permission: 'synthetic', topic: kind === 'research' ? 'workshop deadline' : 'workshop planning', value: 'baseline' };
}
export function buildBrief(state: Pick<ReviewState, 'versions'>, kind: 'research' | 'meeting'): Brief {
  const current = latestSources(state)[0];
  return { title: kind === 'research' ? 'Should we investigate the workshop?' : 'Workshop planning — decision brief',
    statements: [
      { id: 'source-quote', kind: 'quotation', text: current.text, citations: [current.id] },
      ...(kind === 'meeting' ? state.versions.filter(s => s.sourceId === 'research').slice(-1).map(s => ({ id: 'pre-meeting', kind: 'fact' as const, text: s.text, citations: [s.id] })) : []),
      { id: 'interpretation', kind: 'inference', text: 'Preparing an outline could help the team assess the workshop.', citations: [current.id] },
      { id: 'assumption', kind: 'assumption', text: 'Staff availability has not been checked.', citations: [] },
      { id: 'decision', kind: 'proposed_decision', text: 'Prepare an internal workshop outline for discussion.', citations: [current.id] },
    ], nextAction: 'Review the source and decide whether to prepare an internal outline. No submission or message is authorised.',
    commitments: kind === 'meeting' ? [{ id: 'outline', action: 'Prepare a workshop outline', proposedOwner: 'Alex (fictional)', proposedDeadline: 'Friday — exact date unconfirmed' }] : [] };
}
export function example(kind: 'research' | 'meeting', now: string): ReviewState {
  const versions = [source(kind, now)];
  if (kind === 'meeting') versions.push({ ...source('research', now), topic: 'pre-meeting context', label: 'Fictional pre-meeting workshop notice' });
  return { id: `evidence-${kind}`, ownerId: TEST_REVIEWER.id, reviewerId: TEST_REVIEWER.id, revision: 1, versions, brief: buildBrief({ versions }, kind), receipts: [] };
}
