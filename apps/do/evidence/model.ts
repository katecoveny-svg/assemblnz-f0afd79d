import { z } from 'zod';
import type { DoEvidence } from '../shared/pipeline';
import type { EvidenceSource } from '@/lib/pursuit/public-contract';

const text = z.string().trim().min(1).max(4000);
// Draft fields preserve whitespace and may be temporarily empty while editing.
const draftText = z.string().max(4000);
const timestamp = z.string().datetime();
export const snapshotSchema = z.object({
  id: z.string().uuid(), sourceId: text, label: text,
  url: z.string().url().refine(v => { const u = new URL(v); return u.hostname.endsWith('.invalid') && u.protocol === 'https:' && !u.username && !u.password && !u.port; }),
  observedAt: timestamp, expiresAt: timestamp, text,
  permission: z.literal('synthetic'), topic: text, value: text,
}).strict().refine(s => Date.parse(s.expiresAt) > Date.parse(s.observedAt), 'Expiry must follow observation');
export type Snapshot = z.infer<typeof snapshotSchema>;
export const statementSchema = z.object({
  id: text, kind: z.enum(['quotation', 'fact', 'inference', 'assumption', 'proposed_decision']),
  text: draftText, citations: z.array(z.string().uuid()).max(20),
}).strict();
export const briefSchema = z.object({
  title: text, statements: z.array(statementSchema).min(1).max(30), nextAction: draftText,
  commitments: z.array(z.object({ id: text, action: draftText, proposedOwner: draftText, proposedDeadline: draftText }).strict()).max(20),
}).strict();
export type Brief = z.infer<typeof briefSchema>;
export type Actor = { id: string; name: string; mode: 'test' | 'authenticated' };
export type Receipt = {
  id: string; revision: number; reviewedAt: string; reviewer: Actor;
  action: 'approve' | 'decline'; identityAssurance: 'test-only'; externalAction: 'none';
  brief: Brief; evidence: DoEvidence; sourceVersions: Snapshot[]; currentSourceVersionIds: string[];
  decisionStatus: 'test-approved' | 'declined';
  confirmedCommitmentIds: string[]; unresolvedCommitments: Brief['commitments'];
};
export type ReviewState = {
  id: string; ownerId: string; reviewerId: string; revision: number;
  versions: Snapshot[]; brief: Brief; review?: Receipt; receipts: Receipt[];
};
export function latestSources(state: Pick<ReviewState, 'versions'>): Snapshot[] {
  return [...new Map(state.versions.map(s => [s.sourceId, s])).values()];
}
export function issues(state: ReviewState, now: string): string[] {
  const latest = latestSources(state);
  const errors: string[] = [];
  if (!timestamp.safeParse(now).success) errors.push('Invalid review time. Reload before reviewing.');
  if (!state.brief.nextAction.trim()) errors.push('Enter a proposed next action before approval.');
  if (state.brief.commitments.some(c => !c.action.trim() || !c.proposedOwner.trim() || !c.proposedDeadline.trim())) errors.push('Complete the proposed commitment fields before approval.');
  for (const s of latest) {
    if (Date.parse(s.expiresAt) <= Date.parse(now)) errors.push(`Stale source: ${s.label}. Load a fresh observation.`);
    if (Date.parse(s.observedAt) > Date.parse(now)) errors.push(`Future observation: ${s.label}. Check the source timestamp.`);
  }
  for (let i = 0; i < latest.length; i++) for (const other of latest.slice(i + 1)) {
    if (latest[i].topic === other.topic && latest[i].value !== other.value) errors.push(`Conflicting sources for ${other.topic}. Resolve with a new source observation before review.`);
  }
  const ids = new Set(latest.map(s => s.id));
  for (const statement of state.brief.statements) {
    if (!statement.text.trim()) errors.push(`Complete the ${statement.kind} statement before approval.`);
    if (statement.citations.some(id => !ids.has(id))) errors.push(`Outdated citation: ${statement.id}. Rebuild the brief against current versions.`);
    if (['quotation', 'fact'].includes(statement.kind)) {
      if (!statement.citations.length) errors.push(`Missing evidence: ${statement.id}.`);
      // In this bounded draft, factual statements must be verbatim source-supported.
      if (!statement.citations.some(id => latest.find(s => s.id === id)?.text.includes(statement.text))) errors.push(`Unsupported quotation or fact: ${statement.id}.`);
    }
  }
  return [...new Set(errors)];
}
function authorize(state: ReviewState, actor: Actor, revision: number) {
  if (actor.mode !== 'test') throw new Error('Production approval is unavailable. This workspace supports test reviewers only.');
  if (actor.id !== state.ownerId) throw new Error('This review belongs to a different owner.');
  if (state.revision !== revision) throw new Error('Revision conflict. Reload the current brief before retrying.');
}
export function ingest(state: ReviewState, input: unknown, actor: Actor, revision: number, now: string): { state: ReviewState; change: string } {
  authorize(state, actor, revision);
  timestamp.parse(now);
  if (state.versions.length >= 100) throw new Error('This session has reached 100 observations. Download receipts and reset the example.');
  const source = snapshotSchema.parse(input);
  if (Date.parse(source.observedAt) > Date.parse(now)) throw new Error('Observation cannot be in the future.');
  if (state.versions.some(s => s.id === source.id)) throw new Error('Source version ID already exists.');
  const previous = latestSources(state).find(s => s.sourceId === source.sourceId);
  if (previous && Date.parse(source.observedAt) <= Date.parse(previous.observedAt)) throw new Error('Out-of-order observation. Keep the latest source version.');
  const normalize = (v: string) => v.replace(/\s+/g, ' ').trim();
  const duplicate = previous && normalize(previous.text) === normalize(source.text) && previous.value === source.value && previous.topic === source.topic;
  return { state: { ...state, revision: state.revision + 1, versions: [...state.versions, source], review: undefined }, change: duplicate ? 'Duplicate content; observation refreshed. Review invalidated.' : 'Meaningful source change. Recheck the brief; review invalidated.' };
}
export function editBrief(state: ReviewState, input: unknown, actor: Actor, revision: number): ReviewState {
  authorize(state, actor, revision);
  const brief = briefSchema.parse(input);
  if (new Set(brief.commitments.map(c => c.id)).size !== brief.commitments.length) throw new Error('Duplicate commitment IDs.');
  return { ...state, brief, revision: state.revision + 1, review: undefined };
}
export function review(state: ReviewState, actor: Actor, revision: number, action: 'approve' | 'decline', confirmedCommitmentIds: string[], now: string): ReviewState {
  authorize(state, actor, revision);
  timestamp.parse(now);
  if (action !== 'approve' && action !== 'decline') throw new Error('Choose approval or decline.');
  if (actor.id !== state.reviewerId || !actor.name.trim()) throw new Error('The named reviewer must review this brief.');
  if (state.review) throw new Error('This revision has already been reviewed.');
  if (action === 'approve' && issues(state, now).length) throw new Error(issues(state, now).join(' '));
  if (action === 'decline' && confirmedCommitmentIds.length) throw new Error('Declined commitments cannot be confirmed.');
  if (confirmedCommitmentIds.some(id => !state.brief.commitments.some(c => c.id === id))) throw new Error('Unknown commitment.');
  const current = latestSources(state);
  // Declines can reference superseded evidence: retain every observed version.
  const sources = state.versions;
  const receipt: Receipt = structuredClone({
    id: crypto.randomUUID(), revision, reviewedAt: now, reviewer: actor, action,
    identityAssurance: 'test-only', externalAction: 'none', brief: state.brief,
    evidence: { id: crypto.randomUUID(), agentId: state.id, summary: state.brief.title, why: state.brief.nextAction, createdAt: now,
      sources: sources.map(s => ({ id: s.id, kind: 'fixture', label: s.label, url: s.url, excerpt: s.text, capturedAt: s.observedAt })) },
    sourceVersions: sources, currentSourceVersionIds: current.map(s => s.id), decisionStatus: action === 'approve' ? 'test-approved' : 'declined', confirmedCommitmentIds,
    unresolvedCommitments: state.brief.commitments.filter(c => !confirmedCommitmentIds.includes(c.id)),
  } satisfies Receipt);
  return { ...state, review: receipt, receipts: [...state.receipts, receipt] };
}
/** Metadata projection for Pursuit; never presented as a live research result. */
export function pursuitProvenance(source: Snapshot): EvidenceSource {
  return { url: source.url, title: source.label, retrievedAt: source.observedAt, expiresAt: source.expiresAt };
}
export function exportReceipt(receipt: Receipt): string {
  return JSON.stringify({ schemaVersion: 1, integrity: 'Versioned snapshot; not signed or tamper-proof', ...receipt }, null, 2);
}
