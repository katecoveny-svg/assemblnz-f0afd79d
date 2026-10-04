import { describe, expect, it } from 'vitest';
import { familyPreviewSchema, nextMemoryRecord, personalMemorySaveSchema } from './memory';
export const now = '2026-10-01T00:00:00Z';
export const save = { action: 'save' as const, id: '11111111-1111-4111-8111-111111111111', expectedRevision: 0, subject: 'self' as const, kind: 'routine' as const, text: 'I prefer fictional project reviews in the morning.', source: 'owner_entered' as const, observedAt: now, retentionDays: 7 as const, active: true, consent: true as const, noticeVersion: 1 as const, selfOnly: true as const, nonSensitive: true as const };
describe('optional memory', () => {
 it('requires consent and blocks third-party subjects and extra permissions', () => {
  for (const changed of [{ consent: false }, { subject: 'child' }, { sharedWith: ['supporter'] }]) expect(personalMemorySaveSchema.safeParse({ ...save, ...changed }).success).toBe(false);
 });
 it('serializes provenance/expiry without granting provider use', () => {
  expect(JSON.parse(JSON.stringify(nextMemoryRecord(save, null, now)))).toMatchObject({ revision: 1, source: 'owner_entered', consentedAt: now, expiresAt: '2026-10-08T00:00:00.000Z', use: 'owner_review_only' });
 });
 it('rejects stale retries and supports review, pause, delete', () => {
  const record = nextMemoryRecord(save, null, now)!;
  expect(() => nextMemoryRecord(save, record, now)).toThrow('memory_conflict');
  const paused = nextMemoryRecord({ action: 'pause', id: save.id, expectedRevision: 1 }, record, now)!;
  expect(paused.active).toBe(false);
  const reviewed = nextMemoryRecord({ action: 'review', id: save.id, expectedRevision: 2 }, paused, now)!;
  expect(reviewed.active).toBe(false);
  expect(nextMemoryRecord({ action: 'delete', id: save.id, expectedRevision: 3 }, reviewed, now)).toBeNull();
 });
 it('rejects future provenance and expired review', () => {
  expect(() => nextMemoryRecord({ ...save, observedAt: '2099-01-01T00:00:00Z' }, null, now)).toThrow();
  expect(() => nextMemoryRecord({ action: 'review', id: save.id, expectedRevision: 1 }, nextMemoryRecord(save, null, now), '2026-10-09T00:00:00Z')).toThrow('memory_expired');
 });
 it('distinguishes family roles with fictional aliases and no authority', () => {
  for (const relationship of ['child', 'adult', 'supporter']) expect(familyPreviewSchema.safeParse({ fictional: true, alias: 'Person 1', relationship, visibility: 'owner_only', authority: 'none' }).success).toBe(true);
  expect(familyPreviewSchema.safeParse({ fictional: false, alias: 'Person 1', relationship: 'child', visibility: 'family', authority: 'parent' }).success).toBe(false);
 });
});
