import { beforeEach, describe, expect, it } from 'vitest';

import { createBuilderJob } from './builder';
import {
  MemoryOfficeJobsRepo,
  acceptanceReceiptForJob,
  assertReceiptKindAllowed,
} from './office-jobs';

const ownerA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const ownerB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

function sampleJob(id = '11111111-1111-4111-8111-111111111111') {
  return createBuilderJob({
    objective: 'Wire durable Builder jobs into Office with honest receipts.',
    risk: 'medium',
    quality: 'balanced',
    authority: 'prepare_pr',
    capabilities: ['reasoning', 'coding', 'tool_use', 'structured_output'],
  }, {
    ladder: ['claude-sonnet-4-6'],
    rationale: ['coding'],
  }, { id, now: '2026-09-16T03:00:00.000Z' });
}

describe('Durable Office Builder jobs', () => {
  let repo: MemoryOfficeJobsRepo;

  beforeEach(() => {
    repo = new MemoryOfficeJobsRepo();
  });

  it('saves an owner-scoped job with a job_accepted receipt, not a fabricated success', async () => {
    const job = sampleJob();
    const detail = await repo.saveBuilderJob({
      ownerId: ownerA,
      job,
      executionBoundary: 'An execution harness may branch, build, test and prepare a PR, but must not merge or deploy.',
      idempotencyKey: 'builder-save:11111111-1111-4111-8111-111111111111',
      models: [{ id: 'claude-sonnet-4-6', provider: 'anthropic' }],
      now: '2026-09-16T03:01:00.000Z',
    });

    expect(detail.record.ownerId).toBe(ownerA);
    expect(detail.record.status).toBe('planned');
    expect(detail.record.officeStatus).toBe('working');
    expect(detail.receipts).toHaveLength(1);
    expect(detail.receipts[0]?.kind).toBe('job_accepted');
    expect(detail.receipts[0]?.evidence.executionClaimed).toBe(false);
    expect(detail.receipts.some((receipt) => receipt.kind === 'build_succeeded' || receipt.kind === 'proved')).toBe(false);
    expect(detail.events[0]?.kind).toBe('job_saved');
  });

  it('replays idempotent save events and receipts without duplicating rows', async () => {
    const job = sampleJob();
    const key = 'builder-save:same-key';
    const first = await repo.saveBuilderJob({
      ownerId: ownerA,
      job,
      executionBoundary: 'Plan only. No repository changes are authorised.',
      idempotencyKey: key,
      now: '2026-09-16T03:02:00.000Z',
    });
    const second = await repo.saveBuilderJob({
      ownerId: ownerA,
      job,
      executionBoundary: 'Plan only. No repository changes are authorised.',
      idempotencyKey: key,
      now: '2026-09-16T03:03:00.000Z',
    });

    expect(second.events).toHaveLength(1);
    expect(second.events[0]?.eventId).toBe(key);
    expect(second.events[0]?.replayed).toBe(true);
    expect(second.receipts).toHaveLength(1);
    expect(second.receipts[0]?.id).toBe(first.receipts[0]?.id);
  });

  it('refreshes an owned job and never leaks another account’s jobs', async () => {
    const jobA = sampleJob('11111111-1111-4111-8111-111111111111');
    const jobB = sampleJob('22222222-2222-4222-8222-222222222222');
    await repo.saveBuilderJob({
      ownerId: ownerA,
      job: jobA,
      executionBoundary: 'Plan only. No repository changes are authorised.',
      idempotencyKey: 'save-a',
    });
    await repo.saveBuilderJob({
      ownerId: ownerB,
      job: jobB,
      executionBoundary: 'Plan only. No repository changes are authorised.',
      idempotencyKey: 'save-b',
    });

    const listedA = await repo.listBuilderJobs(ownerA);
    const listedB = await repo.listBuilderJobs(ownerB);
    expect(listedA.map((row) => row.id)).toEqual([jobA.id]);
    expect(listedB.map((row) => row.id)).toEqual([jobB.id]);

    expect(await repo.getJobDetail(ownerA, jobB.id)).toBeNull();
    expect(await repo.getJobDetail(ownerB, jobA.id)).toBeNull();

    const refreshed = await repo.getJobDetail(ownerA, jobA.id);
    expect(refreshed?.record.job.objective).toContain('durable Builder jobs');
    expect(refreshed?.receipts[0]?.kind).toBe('job_accepted');
  });

  it('refuses cross-account overwrite and fabricated success receipts on plan-only jobs', async () => {
    const job = sampleJob();
    await repo.saveBuilderJob({
      ownerId: ownerA,
      job,
      executionBoundary: 'Plan only. No repository changes are authorised.',
      idempotencyKey: 'owner-a-save',
    });

    await expect(repo.saveBuilderJob({
      ownerId: ownerB,
      job,
      executionBoundary: 'Plan only. No repository changes are authorised.',
      idempotencyKey: 'owner-b-steal',
    })).rejects.toThrow(/another owner/i);

    expect(() => assertReceiptKindAllowed('build_succeeded', { jobStatus: 'planned' })).toThrow(/planned job/i);
    expect(() => acceptanceReceiptForJob({ ...job, status: 'planned' })).not.toThrow();
    expect(() => assertReceiptKindAllowed('proved', {
      jobStatus: 'working',
      claimExecutionSuccess: false,
    })).toThrow(/execution evidence/i);
  });
});
