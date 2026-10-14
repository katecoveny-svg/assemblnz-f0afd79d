import { describe, expect, it } from 'vitest';
import { PET_DAYS } from './templates';
import { createLifeAdminPlan, createPetRoutine, lifeAdminPack, lifeAdminPlanSchema, lifeAdminPreparationBrief, lifeAdminPreparationSchema, parseLifeAdminStore, reviewLifeAdminPlan, serialiseLifeAdminStore, transitionLifeAdminTask, updateLifeAdminField } from './engine';
import { checklistCloudSaveSchema, checklistCloudStateSchema } from './cloud';
import { DO_TEXT_PROVIDER_CONSENT_VERSION } from '../../shared/provider-consent';
const owner = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const input = { nickname: 'Demo pet', routine: '  Put the blue toy in its basket.\nKeep this wording.  ', days: ['Sunday', 'Monday'] as ('Sunday' | 'Monday')[] };
const make = () => createPetRoutine(input);
describe('session-only Pet routines', () => {
  it('preserves supplied wording and creates only explicit days in deterministic order', () => {
    const plan = make();
    expect(PET_DAYS).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    expect(plan.tasks.map(task => task.key)).toEqual(['Monday', 'Sunday']);
    expect(plan.tasks.every(task => task.detail === input.routine && task.followUpOn === null && task.waitingFor === '')).toBe(true);
    expect(plan.source.text).toBe(input.routine);
    expect(plan.fields.Tuesday).toBe('');
    expect(lifeAdminPack(plan)).toContain(input.routine);
  });
  it('exports empty Pet days distinctly while preserving wording and required-field placeholders', () => {
    const plan = make();
    const pack = lifeAdminPack(plan);
    for (const day of PET_DAYS) {
      expect(pack).toContain(`${day}: ${plan.fields[day] || 'No routine supplied for this day'}`);
    }
    expect(pack).not.toContain('[Still needed]');
    expect(lifeAdminPack(updateLifeAdminField(plan, 'Tuesday', '   '))).toContain('Tuesday: No routine supplied for this day');
    expect(pack).toContain(`Monday: ${input.routine}`);
    expect(pack).toContain(`Sunday: ${input.routine}`);
    expect(lifeAdminPack(updateLifeAdminField(plan, 'nickname', ''))).toContain('Pet nickname: [Still needed]');
    const school = createLifeAdminPlan({category: 'school', source: 'A supplied notice without additional details.'});
    expect(lifeAdminPack(school)).toContain('[Still needed]');
    expect(lifeAdminPack(school)).not.toContain('No routine supplied for this day');
  });
  it('rejects empty, ambiguous and duplicate days without inventing a schedule', () => {
    for (const bad of [{...input, days: []}, {...input, days: ['weekdays']}, {...input, days: ['Monday', 'Monday']}, {...input, routine: '   '}, {...input, nickname: ''}]) expect(() => createPetRoutine(bad as typeof input)).toThrow();
  });
  it('review is idempotent and never records completion', () => {
    const plan = make(); const once = reviewLifeAdminPlan(plan); const twice = reviewLifeAdminPlan(once);
    expect(twice.tasks.map(task => task.id)).toEqual(plan.tasks.map(task => task.id));
    expect(twice.tasks.every(task => task.status === 'todo' && task.evidence === null)).toBe(true);
    expect(() => transitionLifeAdminTask(plan, plan.tasks[0].id, {status:'done',note:'Owner recorded this.'})).toThrow();
    const done = transitionLifeAdminTask(twice, twice.tasks[0].id, {status:'done',note:'Owner recorded this.'});
    expect(done.tasks[0].evidence?.kind).toBe('user-recorded');
    const edited = updateLifeAdminField(done, 'Monday', 'A changed supplied routine.');
    expect(edited.reviewedAt).toBeNull(); expect(edited.tasks[0].status).toBe('needs_review'); expect(edited.tasks[0].evidence).toBeNull();
  });
  it('rejects provider drafting and every browser/cloud persistence boundary', () => {
    const plan = make();
    expect(lifeAdminPreparationSchema.safeParse({category:'pets',source:plan.source.text,title:plan.title,fields:plan.fields,consent:true,providerConsentVersion:DO_TEXT_PROVIDER_CONSENT_VERSION}).success).toBe(false);
    expect(() => lifeAdminPreparationBrief('pets')).toThrow();
    expect(() => serialiseLifeAdminStore([plan],owner)).toThrow();
    expect(() => parseLifeAdminStore(JSON.stringify({version:1,ownerScope:owner,plans:[plan],savedAt:new Date().toISOString()}),owner)).toThrow();
    expect(checklistCloudSaveSchema.safeParse({plans:[plan],expectedRevision:0,consent:true}).success).toBe(false);
    expect(checklistCloudStateSchema.safeParse({plans:[plan],revision:0,savedAt:null}).success).toBe(false);
  });
  it('rejects fabricated task wording and review-as-completion evidence', () => {
    const plan = make();
    expect(lifeAdminPlanSchema.safeParse({...plan,tasks:plan.tasks.map(task=>({...task,detail:'Invented instructions'}))}).success).toBe(false);
    expect(lifeAdminPlanSchema.safeParse({...plan,tasks:plan.tasks.map(task=>({...task,status:'done',evidence:{kind:'review',at:plan.updatedAt,note:'Reviewed only',url:''}}))}).success).toBe(false);
  });
});
