import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MemoryOfficeJobsRepo } from '@/apps/do/shared/office-jobs';
import { createBuilderJob } from '@/apps/do/shared/builder';

const ownerA = { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', externalId: 'do:user:aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' };
const ownerB = { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', externalId: 'do:user:bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' };
const repo = new MemoryOfficeJobsRepo();

vi.mock('@/apps/do/services/owner', () => ({
  doOwner: vi.fn(),
  privateDoHeaders: { 'Cache-Control': 'private, no-store', Vary: 'Cookie', 'X-Content-Type-Options': 'nosniff' },
}));

vi.mock('@/apps/do/shared/http', () => ({
  allowedDoOrigin: (req: Request) => {
    const origin = req.headers.get('origin');
    if (!origin) return null;
    try {
      return origin === new URL(req.url).origin ? origin : null;
    } catch {
      return null;
    }
  },
}));

vi.mock('@/apps/do/services/office-jobs', () => ({
  saveOwnerBuilderJob: (input: Parameters<MemoryOfficeJobsRepo['saveBuilderJob']>[0]) => repo.saveBuilderJob(input),
  listOwnerBuilderJobs: (ownerId: string) => repo.listBuilderJobs(ownerId),
  getOwnerBuilderJob: (ownerId: string, jobId: string) => repo.getJobDetail(ownerId, jobId),
  recordOwnerJobEvent: (input: Parameters<MemoryOfficeJobsRepo['recordEvent']>[0]) => repo.recordEvent(input),
}));

import { doOwner } from '@/apps/do/services/owner';
import { GET as getJobs, POST as postJobs } from './route';
import { GET as getJob } from './[id]/route';

function jobPayload(id = '11111111-1111-4111-8111-111111111111') {
  const job = createBuilderJob({
    objective: 'Persist Builder jobs with owner receipts.',
    risk: 'low',
    quality: 'economy',
    authority: 'plan_only',
    capabilities: ['coding', 'reasoning'],
  }, { ladder: [], rationale: [] }, { id, now: '2026-09-16T04:00:00.000Z' });
  return {
    job,
    models: [],
    executionBoundary: 'Plan only. No repository changes are authorised.',
    idempotencyKey: `builder-save:${id}`,
  };
}

function postRequest(body: unknown, origin = 'https://www.assembl.co.nz') {
  return new Request('https://www.assembl.co.nz/api/do/builder/jobs', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function getRequest(path = 'https://www.assembl.co.nz/api/do/builder/jobs') {
  return new Request(path, {
    method: 'GET',
    headers: { origin: 'https://www.assembl.co.nz' },
  });
}

describe('Builder durable jobs API', () => {
  beforeEach(() => {
    repo.clear();
    vi.mocked(doOwner).mockReset();
  });

  it('requires auth and same-origin for save', async () => {
    vi.mocked(doOwner).mockResolvedValue(null);
    expect((await postJobs(postRequest(jobPayload()))).status).toBe(401);
    vi.mocked(doOwner).mockResolvedValue(ownerA);
    expect((await postJobs(postRequest(jobPayload(), 'https://evil.example'))).status).toBe(403);
  });

  it('saves, lists, and reopens for the owning account only', async () => {
    vi.mocked(doOwner).mockResolvedValue(ownerA);
    const payload = jobPayload();
    const saved = await postJobs(postRequest(payload));
    expect(saved.status).toBe(200);
    const body = await saved.json();
    expect(body).toMatchObject({ durable: false, storage: 'process-memory' });
    expect(body.receipt.summary).toMatch(/process.memory.*preview/i);
    expect(body.receipt.kind).toBe('job_accepted');
    expect(body.receipt.evidence.executionClaimed).toBe(false);
    expect(body.job.status).toBe('planned');

    const listed = await getJobs(getRequest());
    expect(listed.status).toBe(200);
    const listBody = await listed.json();
    expect(listBody.jobs).toHaveLength(1);
    expect(listBody.jobs[0]).toMatchObject({ durable: false, storage: 'process-memory' });
    expect(listBody.jobs[0].job.id).toBe(payload.job.id);

    const opened = await getJob(getRequest(`https://www.assembl.co.nz/api/do/builder/jobs/${payload.job.id}`), {
      params: Promise.resolve({ id: payload.job.id }),
    });
    expect(opened.status).toBe(200);
    const openBody = await opened.json();
    expect(openBody).toMatchObject({ durable: false, storage: 'process-memory' });
    expect(openBody.receipts[0].kind).toBe('job_accepted');

    vi.mocked(doOwner).mockResolvedValue(ownerB);
    const leakedList = await getJobs(getRequest());
    expect((await leakedList.json()).jobs).toEqual([]);
    const leakedOpen = await getJob(getRequest(`https://www.assembl.co.nz/api/do/builder/jobs/${payload.job.id}`), {
      params: Promise.resolve({ id: payload.job.id }),
    });
    expect(leakedOpen.status).toBe(404);
  });

  it('is idempotent on repeated save with the same key', async () => {
    vi.mocked(doOwner).mockResolvedValue(ownerA);
    const payload = jobPayload('33333333-3333-4333-8333-333333333333');
    const first = await (await postJobs(postRequest(payload))).json();
    const second = await (await postJobs(postRequest(payload))).json();
    expect(second.receipt.id).toBe(first.receipt.id);
    expect(second.events.some((event: { replayed?: boolean }) => event.replayed)).toBe(true);
  });
});
