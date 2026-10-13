import { describe, expect, it } from 'vitest';
import { personalMemoryMutationSchema, personalMemoryRecordSchema, nextMemoryRecord, type PersonalMemoryRecord } from './memory';
import { changeMemoryMutation, daysUntil, draftFromRecord, saveMemoryMutation, sortMemory, toObservedAt } from './memory-page';

const now = '2026-10-13T09:00:00.000Z';
const record: PersonalMemoryRecord = personalMemoryRecordSchema.parse({
  id: '11111111-1111-4111-8111-111111111111', subject: 'self', kind: 'routine', text: 'Fictional Tuesday review.', source: 'owner_entered',
  observedAt: '2026-10-10T23:59:59.000Z', retentionDays: 30, active: true, revision: 2, consentedAt: now, reviewedAt: now, updatedAt: now,
  expiresAt: '2026-11-12T09:00:00.000Z', noticeVersion: 1, use: 'owner_review_only',
});

describe('memory page helpers', () => {
  it('builds a valid create mutation that the server contract accepts', () => {
    const mutation = saveMemoryMutation(record.id, { kind: 'preference', text: '  Plain replies.  ', observedAt: '2026-10-12', retentionDays: 7 }, null);
    expect(personalMemoryMutationSchema.safeParse(mutation).success).toBe(true);
    expect(mutation).toMatchObject({ action: 'save', expectedRevision: 0, text: 'Plain replies.', active: true });
    const created = nextMemoryRecord(mutation, null, now);
    expect(created?.revision).toBe(1);
  });
  it('edits carry the current revision so a stale device cannot overwrite', () => {
    const mutation = saveMemoryMutation(record.id, draftFromRecord(record), record);
    expect(mutation).toMatchObject({ action: 'save', expectedRevision: 2 });
    expect(() => nextMemoryRecord(mutation, { ...record, revision: 3 }, now)).toThrow('memory_conflict');
  });
  it('pause, review and delete are revision-bound', () => {
    for (const action of ['review', 'pause', 'delete'] as const) {
      const mutation = changeMemoryMutation(action, record);
      expect(personalMemoryMutationSchema.safeParse(mutation).success).toBe(true);
      expect(mutation.expectedRevision).toBe(2);
    }
    expect(nextMemoryRecord(changeMemoryMutation('pause', record), record, now)?.active).toBe(false);
    expect(nextMemoryRecord(changeMemoryMutation('delete', record), record, now)).toBeNull();
  });
  it('observed day never lands in the future and tolerates bad input', () => {
    const clock = new Date('2026-10-13T09:00:00.000Z');
    expect(toObservedAt('2026-10-10', clock)).toBe('2026-10-10T23:59:59.000Z');
    expect(toObservedAt('2026-10-13', clock)).toBe(clock.toISOString());
    expect(toObservedAt('not a day', clock)).toBe(clock.toISOString());
  });
  it('sorts active notes first, newest first, and counts remaining days', () => {
    const paused = { ...record, id: '22222222-2222-4222-8222-222222222222', active: false, updatedAt: '2026-10-13T10:00:00.000Z' };
    expect(sortMemory([paused, record]).map(item => item.id)).toEqual([record.id, paused.id]);
    expect(daysUntil(record.expiresAt, new Date(now))).toBe(30);
  });
});
