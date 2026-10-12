import { describe, expect, it } from 'vitest';
import { declineRun, preparationRunId, prepareRun, reviewRun, runReceipt } from './contracts';
import type { EvidenceRecord } from '@/lib/journey/types';
const now = '2026-10-12T12:00:00Z';
for (const taskId of ['shop-session', 'travel-session']) describe(`${taskId} shared preparation envelope`, () => {
  const identity = { ownerId: 'fixture-owner', taskId, revision: 1 };
  const value = { taskId, revision: 1, content: 'sample' };
  const evidence: EvidenceRecord[] = [{ id: 'sample-source', runId: preparationRunId(identity), kind: 'assumption', label: 'Sample', detail: 'No provider connected', createdAt: now, sourceRef: 'fixture' }];
  it('uses journey evidence, IDs and action statuses with a prepared-only receipt', () => {
    const run = prepareRun(identity, value, evidence, null, now);
    expect(run).toMatchObject({ version: 1, runId: 'fixture-owner:' + taskId, status: 'prepared', actionStatus: 'proposed', execution: 'simulated' });
    expect(() => runReceipt(run, identity, value, now)).toThrow('Review');
    const reviewed = reviewRun(run, identity, value, true, now);
    expect(reviewed.actionStatus).toBe('approved');
    expect(runReceipt(reviewed, identity, value, now)).toMatchObject({ version: 1, runId: run.runId, status: 'prepared', reviewStatus: 'reviewed', provenance: evidence, externalAction: 'none' });
  });
  it('invalidates stale approval on content, revision and owner changes', () => {
    const reviewed = reviewRun(prepareRun(identity, value, evidence, null, now), identity, value, true, now);
    expect(() => runReceipt(reviewed, identity, { ...value, content: 'edited' }, now)).toThrow('changed');
    expect(() => runReceipt(reviewed, { ...identity, revision: 2 }, value, now)).toThrow('changed');
    expect(() => runReceipt(reviewed, { ...identity, ownerId: 'other' }, value, now)).toThrow('changed');
    const edited = prepareRun({ ...identity, revision: 2 }, { ...value, revision: 2 }, evidence, reviewed, now);
    expect(edited.status).toBe('prepared'); expect(edited.reviewedAt).toBeNull();
    expect(() => prepareRun(identity, { ...value, content: 'edited' }, evidence, reviewed, now)).toThrow('new revision');
  });
  it('cancels idempotently and repeated preparation never revives cancellation', () => {
    const run = prepareRun(identity, value, evidence, null, now);
    const cancelled = declineRun(reviewRun(run, identity, value, true, now));
    expect(cancelled).toMatchObject({ status: 'declined', actionStatus: 'rejected', reviewedAt: null });
    expect(declineRun(cancelled)).toBe(cancelled);
    expect(prepareRun(identity, value, evidence, cancelled, now)).toBe(cancelled);
    expect(() => runReceipt(cancelled, identity, value, now)).toThrow('cancelled');
    expect(() => reviewRun(cancelled, identity, value, true, now)).toThrow('cancelled');
  });
  it('returns the same record on duplicate preparation and rejects changed evidence/stale versions', () => {
    const run = prepareRun(identity, value, evidence, null, now);
    expect(prepareRun(identity, value, evidence, run, '2026-10-12T12:01:00Z')).toBe(run);
    expect(() => prepareRun(identity, value, [{ ...evidence[0], detail: 'changed' }], run, now)).toThrow('new revision');
    const next = prepareRun({ ...identity, revision: 2 }, value, evidence, run, now);
    expect(() => prepareRun(identity, value, evidence, next, now)).toThrow('Stale');
    expect(() => prepareRun(identity, value, [{ ...evidence[0], runId: 'different' }], null, now)).toThrow('another run');
  });
});
