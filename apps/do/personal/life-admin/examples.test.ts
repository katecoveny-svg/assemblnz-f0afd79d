import { describe, expect, it } from 'vitest';
import { LIFE_ADMIN_EXAMPLES } from './examples';
import { createLifeAdminPlan, lifeAdminLane } from './engine';

describe('visual Personal DO examples', () => {
  it.each(LIFE_ADMIN_EXAMPLES)('$id uses a real local checklist with an explicit fictional source', example => {
    const plan = createLifeAdminPlan({ source: example.source, category: example.category, title: example.title, method: 'pasted-text' });
    expect(plan.source.text).toContain('FICTIONAL EXAMPLE');
    expect(plan.title).toMatch(/^Example:/);
    expect(plan.category).toBe(example.category);
    expect(plan.tasks.length).toBeGreaterThan(0);
    expect(plan.tasks.every(task => task.status !== 'done')).toBe(true);
    expect(lifeAdminLane(plan)).toBe('needs-you');
    expect(plan.generated).toBeFalsy();
    expect(plan.reviewedAt).toBeFalsy();
  });
});
