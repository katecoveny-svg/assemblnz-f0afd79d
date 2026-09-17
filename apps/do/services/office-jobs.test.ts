import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ db: vi.fn(), owner: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createClient: mocks.db }));
vi.mock('@/apps/do/services/owner', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/apps/do/services/owner')>(), doOwner: mocks.owner,
}));

import { createBuilderJob } from '@/apps/do/shared/builder';
import { GET, POST } from '@/app/api/do/builder/jobs/route';
import { GET as reopen } from '@/app/api/do/builder/jobs/[id]/route';
import { builderSpecPayload, OfficeStorageUnavailableError } from '@/apps/do/shared/office-jobs';
import { getOwnerBuilderJob, listOwnerBuilderJobs, recordOwnerJobEvent, recordOwnerReceipt } from './office-jobs';

const ownerId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const jobId = '11111111-1111-4111-8111-111111111111';
const job = createBuilderJob({
  objective: 'Save a bounded plan for review.', risk: 'low', quality: 'economy',
  authority: 'plan_only', capabilities: ['coding'],
}, { ladder: [], rationale: [] }, { id: jobId, now: '2026-09-17T00:00:00.000Z' });
const input = { ownerId, job, models: [], executionBoundary: 'Plan only. No repository changes are authorised.', idempotencyKey: 'storage-test-save' };

function saveRequest() {
  return new Request('https://www.assembl.co.nz/api/do/builder/jobs', {
    method: 'POST', headers: { origin: 'https://www.assembl.co.nz', 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
}

type QueryResult = { table: string; data: unknown; error: unknown };
function databaseSequence(results: QueryResult[]) {
  mocks.db.mockResolvedValue({ from: (table: string) => {
    const query: Record<string, unknown> = {};
    const result = () => {
      const next = results.shift();
      expect(next?.table).toBe(table);
      return Promise.resolve({ data: next?.data, error: next?.error });
    };
    for (const name of ['select', 'eq', 'order', 'limit', 'insert', 'update']) query[name] = () => query;
    query.maybeSingle = query.single = result;
    query.then = (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) => result().then(resolve, reject);
    return query;
  } });
}
const agentRow = { id: jobId, owner_id: ownerId, workspace_id: jobId, name: job.title, status: 'working',
  spec: builderSpecPayload(input), created_at: job.createdAt, updated_at: job.createdAt };

describe('Office database adapter storage contract', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Network disabled in storage tests'); }));
    mocks.db.mockReset();
    mocks.owner.mockResolvedValue({ id: ownerId, externalId: `do:user:${ownerId}` });
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it('reports database provenance only after database save and complete reload succeed', async () => {
    const eventRow = { id: jobId, owner_id: ownerId, workspace_id: jobId, do_agent_id: jobId, event_id: input.idempotencyKey, kind: 'job_saved', detail: {}, created_at: job.createdAt };
    const receiptRow = { ...eventRow, kind: 'job_accepted', title: 'Plan accepted', summary: 'Plan only', evidence: { executionClaimed: false }, idempotency_key: 'receipt-test' };
    databaseSequence([
      { table: 'do_workspaces', data: { id: jobId }, error: null },
      { table: 'do_agents', data: null, error: null },
      { table: 'do_agents', data: agentRow, error: null },
      { table: 'do_job_events', data: null, error: null },
      { table: 'do_job_events', data: eventRow, error: null },
      { table: 'do_receipts', data: null, error: null },
      { table: 'do_receipts', data: receiptRow, error: null },
      { table: 'do_agents', data: agentRow, error: null },
      { table: 'do_receipts', data: [receiptRow], error: null },
      { table: 'do_job_events', data: [eventRow], error: null },
    ]);
    const response = await POST(saveRequest());
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ durable: true, storage: 'database', receipt: { kind: 'job_accepted' } });
    databaseSequence([{ table: 'do_agents', data: [agentRow], error: null }]);
    expect(await (await GET(new Request('https://www.assembl.co.nz/api/do/builder/jobs'))).json()).toMatchObject({ jobs: [{ durable: true, storage: 'database' }] });
  });

  it.each(['workspace lookup', 'job lookup', 'receipt lookup', 'event lookup', 'receipt reload', 'event reload'])(
    'does not ignore unavailable storage during %s', async (seam) => {
      const error = { code: 'PGRST205', message: 'synthetic-private-detail' };
      if (seam === 'workspace lookup' || seam === 'job lookup') {
        databaseSequence(seam === 'workspace lookup'
          ? [{ table: 'do_workspaces', data: null, error }]
          : [{ table: 'do_workspaces', data: { id: jobId }, error: null }, { table: 'do_agents', data: null, error }]);
        expect((await POST(saveRequest())).status).toBe(503);
      } else if (seam === 'receipt lookup') {
        databaseSequence([{ table: 'do_receipts', data: null, error }]);
        await expect(recordOwnerReceipt({ ownerId, workspaceId: jobId, jobId, kind: 'job_accepted', title: 'Plan', summary: 'Plan only', jobStatus: 'planned', idempotencyKey: 'receipt-test' })).rejects.toBeInstanceOf(OfficeStorageUnavailableError);
      } else if (seam === 'event lookup') {
        databaseSequence([{ table: 'do_job_events', data: null, error }]);
        await expect(recordOwnerJobEvent({ ownerId, workspaceId: jobId, jobId, kind: 'job_saved', eventId: 'event-test' })).rejects.toBeInstanceOf(OfficeStorageUnavailableError);
      } else {
        databaseSequence([
          { table: 'do_agents', data: agentRow, error: null },
          { table: 'do_receipts', data: null, error: seam === 'receipt reload' ? error : null },
          { table: 'do_job_events', data: null, error: seam === 'event reload' ? error : null },
        ]);
        expect((await reopen(new Request(`https://www.assembl.co.nz/api/do/builder/jobs/${jobId}`), { params: Promise.resolve({ id: jobId }) })).status).toBe(503);
      }
    },
  );

  it.each([
    { code: 'PGRST205', message: "Could not find the table 'public.do_workspaces' in the schema cache" },
    { code: '42P01', message: 'synthetic-private-detail' },
    { code: 'PGRST204', message: 'synthetic-private-detail' },
    { code: '42703', message: 'synthetic-private-detail' },
    { message: 'relation do_agents does not exist: synthetic-private-detail' },
  ])('fails closed across save/list/reopen and receipt/event writes on unavailable schema: %j', async (error) => {
    const result = { data: null, error };
    const query: Record<string, unknown> = {};
    for (const name of ['select', 'eq', 'order', 'limit', 'insert', 'update']) query[name] = () => query;
    query.maybeSingle = query.single = async () => result;
    query.then = Promise.resolve(result).then.bind(Promise.resolve(result));
    mocks.db.mockResolvedValue({ from: () => query });

    for (const operation of [() => POST(saveRequest()), () => GET(new Request('https://www.assembl.co.nz/api/do/builder/jobs')),
      () => reopen(new Request(`https://www.assembl.co.nz/api/do/builder/jobs/${jobId}`), { params: Promise.resolve({ id: jobId }) })]) {
      const response = await operation();
      expect(response.status).toBe(503);
      const body = await response.json();
      expect(body).toMatchObject({ error: 'storage_unavailable', durable: false, storage: 'unavailable' });
      expect(JSON.stringify(body)).not.toContain('synthetic-private-detail');
    }
    for (const operation of [
      () => listOwnerBuilderJobs(ownerId), () => getOwnerBuilderJob(ownerId, jobId),
      () => recordOwnerJobEvent({ ownerId, workspaceId: jobId, jobId, eventId: 'event-test', kind: 'job_saved' }),
      () => recordOwnerReceipt({ ownerId, workspaceId: jobId, jobId, kind: 'job_accepted', title: 'Plan', summary: 'Plan only', jobStatus: 'planned', idempotencyKey: 'receipt-test' }),
    ]) await expect(operation()).rejects.toBeInstanceOf(OfficeStorageUnavailableError);
  });

  it.each([new Error('synthetic-private-detail'), { code: '42501', message: 'synthetic-private-detail' }])('does not expose unexpected database errors to the caller', async (error) => {
    mocks.db.mockRejectedValue(error);
    const response = await POST(saveRequest());
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'save_failed', message: 'Could not save Builder job.' });
  });

  it('returns safe 503, not an accepted memory receipt, when durable storage is unconfigured', async () => {
    mocks.db.mockRejectedValue(new Error('Missing NEXT_PUBLIC_SUPABASE_URL synthetic-private-detail'));
    const response = await POST(saveRequest());
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toMatchObject({ error: 'storage_unavailable', durable: false, storage: 'unavailable' });
    expect(body.receipt).toBeUndefined();
    expect(body.message).toMatch(/durable.*unavailable/i);
    expect(body.nextAction).toMatch(/retry/i);
    expect(JSON.stringify(body)).not.toContain('synthetic-private-detail');
  });
});
