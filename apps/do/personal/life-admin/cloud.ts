import { z } from 'zod';
import { hasLifeAdminSecretLabel, lifeAdminPlanSchema, type LifeAdminPlan } from './engine';

export const CHECKLIST_CLOUD_LIMIT = 500_000;
export const checklistCloudSaveSchema = z.object({
  plans: z.array(lifeAdminPlanSchema).max(30),
  expectedRevision: z.number().int().min(0).max(2_000_000_000),
  consent: z.literal(true),
}).strict().superRefine((input, ctx) => {
  if (new Set(input.plans.map(plan => plan.id)).size !== input.plans.length)
    ctx.addIssue({ code: 'custom', message: 'Each checklist must have a unique ID.' });
  const text = JSON.stringify(input.plans);
  if (new TextEncoder().encode(text).length > CHECKLIST_CLOUD_LIMIT)
    ctx.addIssue({ code: 'custom', message: 'This collection is too large. Download a copy and keep fewer checklists.' });
  if (hasLifeAdminSecretLabel(text))
    ctx.addIssue({ code: 'custom', message: 'Remove passwords, identity numbers and payment details before saving.' });
});
export type ChecklistCloudSave = z.infer<typeof checklistCloudSaveSchema>;
export const checklistCloudStateSchema = z.object({
  plans: z.array(lifeAdminPlanSchema).max(30),
  revision: z.number().int().min(0),
  savedAt: z.string().datetime({ offset: true }).nullable(),
}).strict();
export type ChecklistCloudState = z.infer<typeof checklistCloudStateSchema>;

/** Explicit restore never overwrites an open edit with an older cloud snapshot. */
export function restoreCloudChecklists(local: LifeAdminPlan[], saved: LifeAdminPlan[]) {
  const ids = new Set(local.map(plan => plan.id));
  const additions = saved.filter(plan => !ids.has(plan.id));
  if (local.length + additions.length > 30) throw new Error('Opening this collection would exceed 30 checklists.');
  const conflicts = saved.filter(plan => {
    const current = local.find(item => item.id === plan.id);
    return current && JSON.stringify(current) !== JSON.stringify(plan);
  }).length;
  return { plans: [...local, ...additions], added: additions.length, conflicts };
}
