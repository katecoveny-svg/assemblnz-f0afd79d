import { describe, expect, it } from 'vitest';
import { createLifeAdminPlan, createPetRoutine } from './engine';
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
  it('refreshes untouched copies and follows remote removal', () => {
    const before = plan();
    const remote = { ...before, title: 'Updated on another device' };
    expect(restoreCloudChecklists([before], [remote], [before]).plans).toEqual([remote]);
    expect(restoreCloudChecklists([before], [], [before]).plans).toEqual([]);
  });
  it('preserves dirty edits against concurrent edits and removals', () => {
    const before = plan();
    const local = { ...before, title: 'My unsaved edit' };
    const remote = { ...before, title: 'Other device edit' };
    expect(restoreCloudChecklists([local], [remote], [before])).toEqual({ plans: [local], added: 0, conflicts: 1 });
    expect(restoreCloudChecklists([local], [], [before])).toEqual({ plans: [local], added: 0, conflicts: 1 });
  });
  it('does not resurrect local removals and accepts new remote records', () => {
    const before = plan();
    const other = plan('22222222-2222-4222-8222-222222222222');
    expect(restoreCloudChecklists([], [before, other], [before])).toEqual({ plans: [other], added: 1, conflicts: 0 });
  });
  it('preserves session-only routines during account refresh', () => {
    const pet = createPetRoutine({ nickname: 'Fictional cat', routine: 'Put the toy in its basket.', days: ['Monday'] });
    expect(restoreCloudChecklists([pet], [plan()], []).plans).toEqual([pet, plan()]);
  });

});
