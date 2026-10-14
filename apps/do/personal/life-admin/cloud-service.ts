import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import { checklistCloudSaveSchema, checklistCloudStateSchema, type ChecklistCloudSave } from './cloud';

export class ChecklistConflict extends Error {}
export async function loadCloudChecklists(ownerId: string) {
  const { data, error } = await getServiceClient().from('do_personal_checklists')
    .select('plans,revision,updated_at').eq('owner_id', ownerId).maybeSingle();
  if (error) throw new Error('Checklist storage unavailable.');
  return checklistCloudStateSchema.parse(data
    ? { plans: data.plans, revision: data.revision, savedAt: data.updated_at }
    : { plans: [], revision: 0, savedAt: null });
}
export async function saveCloudChecklists(ownerId: string, raw: ChecklistCloudSave) {
  const input = checklistCloudSaveSchema.parse(raw);
  const { data, error } = await getServiceClient().rpc('do_personal_save_checklists', {
    p_owner: ownerId, p_plans: input.plans, p_expected_revision: input.expectedRevision,
  });
  if (error?.message?.includes('checklist_conflict')) throw new ChecklistConflict();
  if (error || !data) throw new Error('Checklist storage unavailable.');
  return checklistCloudStateSchema.parse(data);
}
