import { describe, expect, it } from 'vitest';

import { BUILDERDOO_CANONICAL_CONTEXT, createBuilderJob } from './builder';

describe('Builderdoo job contract', () => {
  it('keeps the canonical Assembl context and provider route separate from the job identity', () => {
    const job = createBuilderJob({
      objective: 'Build a visual DO Office usage rail.',
      risk: 'medium',
      quality: 'balanced',
      authority: 'prepare_pr',
      capabilities: ['reasoning', 'coding', 'vision', 'tool_use', 'structured_output'],
    }, {
      ladder: ['claude-sonnet-5', 'grok-4.6'],
      rationale: ['capability fit'],
    }, { id: 'job-1', now: '2026-09-16T00:00:00.000Z' });

    expect(job.id).toBe('job-1');
    expect(job.contextFiles).toEqual([...BUILDERDOO_CANONICAL_CONTEXT]);
    expect(job.route.ladder).toEqual(['claude-sonnet-5', 'grok-4.6']);
    expect(job.authority).toBe('prepare_pr');
    expect(job.definitionOfDone.some((item) => item.includes('visual evidence'))).toBe(true);
  });

  it('rejects objectives that are too vague to build safely', () => {
    expect(() => createBuilderJob({
      objective: 'fix it',
      risk: 'low',
      quality: 'economy',
      authority: 'plan_only',
      capabilities: ['coding'],
    }, { ladder: [], rationale: [] })).toThrow(/too short/i);
  });
});
