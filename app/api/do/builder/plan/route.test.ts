import { describe, expect, it } from 'vitest';
import { POST } from './route';
function request(body: unknown, origin = 'https://www.assembl.co.nz') {
  return new Request('https://www.assembl.co.nz/api/do/builder/plan', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
}
describe('Builder DO planning', () => {
  it('creates a usable bounded job without pretending it executed', async () => {
    const response = await POST(request({ objective: 'Build a meeting task review screen', authority: 'plan_only', risk: 'low', needsVision: false, needsBrowser: false }));
    expect(response.status).toBe(200);
    const { job, executionBoundary } = await response.json();
    expect(job.status).toBe('planned'); expect(job.authority).toBe('plan_only');
    expect(job.definitionOfDone.length).toBeGreaterThan(0); expect(job.proof.length).toBeGreaterThan(0);
    expect(job.capabilities).not.toContain('vision'); expect(executionBoundary).toContain('No repository changes');
  });
  it('rejects empty objectives', async () => { expect((await POST(request({ objective: '' }))).status).toBe(400); });
  it('rejects foreign-origin job requests', async () => { expect((await POST(request({ objective: 'Build a page' }, 'https://other.test'))).status).toBe(403); });
});
