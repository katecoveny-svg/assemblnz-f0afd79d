import { describe, expect, it } from 'vitest';
import { createLifeAdminPlan } from './engine';
import { LIFE_ADMIN_EXAMPLES } from './examples';
import { checklistCloudSaveSchema, restoreCloudChecklists } from './cloud';
const plan = (id = '11111111-1111-4111-8111-111111111111') => createLifeAdminPlan({ category: 'school', source: 'School trip needs a raincoat and lunch.' }, { id, now: '2026-09-30T00:00:00.000Z' });
const save = { plans: [plan()], expectedRevision: 0, consent: true };
describe('private checklist collections', () => {
  it('requires fresh explicit consent and accepts valid NZ examples', () => {
    expect(checklistCloudSaveSchema.safeParse({ ...save, consent: false }).success).toBe(false);
    for (const example of LIFE_ADMIN_EXAMPLES) expect(checklistCloudSaveSchema.safeParse({ ...save, plans: [createLifeAdminPlan({ category: example.category, source: example.source })] }).success).toBe(true);
  });
  it('rejects forged owner, duplicate records, credentials and invalid revisions', () => {
    for (const bad of [{ ...save, ownerId: 'another' }, { ...save, plans: [plan(), plan()] }, { ...save, expectedRevision: -1 }, { ...save, plans: [{ ...plan(), source: { ...plan().source, text: 'password: secret-value' } }] }]) expect(checklistCloudSaveSchema.safeParse(bad).success).toBe(false);
  });
  it('merges unique records without losing local edits, and reports conflicts', () => {
    const local = { ...plan(), title: 'Edited on phone' };
    const other = plan('22222222-2222-4222-8222-222222222222');
    const restored = restoreCloudChecklists([local], [plan(), other]);
    expect(restored).toEqual({ plans: [local, other], added: 1, conflicts: 1 });
    expect(restoreCloudChecklists(restored.plans, [local, other]).added).toBe(0);
  });
  it('allows an explicit empty snapshot without resetting the revision', () => {
    expect(checklistCloudSaveSchema.parse({ plans: [], expectedRevision: 9, consent: true }).expectedRevision).toBe(9);
  });
});
