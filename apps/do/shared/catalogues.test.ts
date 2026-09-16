import { describe, expect, it } from 'vitest';
import { DO_CAPABILITY_CATALOGUE, CONNECTABLE_DO_APPS } from './capability-catalogue';
import { SPATIAL_TOOLS } from './spatial-tools';
describe('DO catalogue release boundaries', () => {
  it('keeps every connector mutation explicitly approval-gated', () => {
    for (const key of ['crm_lead', 'sheets_write', 'slack_post', 'notion_write', 'task_create']) {
      expect(DO_CAPABILITY_CATALOGUE.find(c => c.key === key)?.authority).toBe('approval_required');
    }
    expect(CONNECTABLE_DO_APPS.has('arbitrary_http')).toBe(false);
    expect(CONNECTABLE_DO_APPS.has('gmail')).toBe(true);
    expect(CONNECTABLE_DO_APPS.has('slack')).toBe(true);
  });
  it('does not promote experimental spatial or video pipelines', () => {
    for (const key of ['gaussian_splats', 'video_generation']) expect(DO_CAPABILITY_CATALOGUE.find(c => c.key === key)?.status).toBe('preview');
    expect(SPATIAL_TOOLS.find(t => t.id === 'spatialgen')?.status).toBe('research_only');
    expect(SPATIAL_TOOLS.filter(t => t.status === 'production').map(t => t.id)).toEqual(['three-r3f']);
  });
});
