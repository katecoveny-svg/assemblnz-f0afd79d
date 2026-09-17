import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Children, isValidElement, type ReactNode } from 'react';

const mocks = vi.hoisted(() => ({ owner: vi.fn(), useState: vi.fn() }));
// Shallow-render the real client handlers without a DOM or external server.
vi.mock('react', async original => ({
  ...(await original<object>()),
  useState: mocks.useState,
  useEffect: vi.fn(),
  useCallback: (callback: unknown) => callback,
}));
vi.mock('@/apps/do/services/owner', async original => ({
  ...(await original<object>()), doOwner: mocks.owner,
}));

import { type BrowserRuntimeJob, getBrowserRuntimeJob, resetBrowserRuntimeJobs } from '@/apps/do/shared/browser-runtime';
import { actionStubStore, resetActionStubStore } from '@/lib/do/action-stub';
import * as client from '@/app/do/browser/BrowserRuntimeClient';
import { GET, OPTIONS, POST } from './route';

const ownerA = { id: 'owner-a', externalId: 'do:user:owner-a' };
const ownerB = { id: 'owner-b', externalId: 'do:user:owner-b' };
const origin = 'https://www.assembl.co.nz';
const endpoint = `${origin}/api/do/browser-runtime`;
const context = {
  url: 'https://example.invalid/private', title: 'Synthetic private note',
  pageText: 'AUDIT_PRIVATE_CONTEXT_NOT_REAL_USER_DATA', consent: true,
};
let requestNumber = 0;
const externalFetch = vi.fn(() => { throw new Error('No network allowed in Browser Runtime preview tests'); });
function post(body: unknown, from: string | null = origin) {
  return new Request(endpoint, {
    method: 'POST',
    headers: {
      ...(from === null ? {} : { origin: from }),
      'content-type': 'application/json',
      'x-forwarded-for': `203.0.113.${++requestNumber}`,
    },
    body: JSON.stringify(body),
  });
}
const reviewActions = ['approve_permit', 'produce_artifact', 'receipt'];
function actionBody(action: string, job: BrowserRuntimeJob) {
  return {
    action, job_id: job.job_id,
    ...(action === 'lock_context' ? context : {}),
    ...(reviewActions.includes(action) ? {
      expected_permit_id: job.permit_id, expected_review_generation: job.review_generation,
    } : {}),
  };
}
async function advance(action: string, job: BrowserRuntimeJob): Promise<BrowserRuntimeJob> {
  const response = await POST(post(actionBody(action, job)));
  expect(response.status).toBe(200);
  return (await response.json()).job;
}
async function createJob(): Promise<BrowserRuntimeJob> {
  const response = await POST(post({ title: 'Private preview', objective: 'Write a synthetic email reply' }));
  expect(response.status).toBe(200);
  return (await response.json()).job;
}

beforeEach(() => {
  mocks.owner.mockReset().mockResolvedValue(ownerA);
  mocks.useState.mockReset();
  externalFetch.mockClear();
  resetBrowserRuntimeJobs();
  resetActionStubStore();
  vi.stubGlobal('fetch', externalFetch);
});
afterEach(() => {
  expect(externalFetch).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
});

describe('Browser Runtime owner boundary', () => {
  it('submits the displayed review from the client and refreshes stale tab A without automatically approving tab B', async () => {
    let job = await createJob();
    for (const step of ['lock_context', 'propose', 'request_permit']) job = await advance(step, job);
    const tabA = await (await GET(new Request(`${endpoint}?job_id=${job.job_id}`))).json();
    for (const step of ['lock_context', 'propose', 'request_permit']) job = await advance(step, job);
    const tabB = structuredClone(job);
    const proof = structuredClone(actionStubStore());
    const sent: Record<string, unknown>[] = [];
    // This fetch bridge calls the actual in-process route, never the network.
    vi.stubGlobal('fetch', vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/do/browser-runtime' && init?.method === 'POST') {
        const body = JSON.parse(init.body as string);
        sent.push(body);
        return POST(post(body));
      }
      if (url === '/api/do/browser-runtime' || url === `/api/do/browser-runtime?job_id=${job.job_id}`) {
        return GET(new Request(`${origin}${url}`));
      }
      throw new Error(`Unexpected client request: ${url}`);
    }));
    const state: unknown[] = [[tabA.job], tabA.job, tabA.prepared, tabA.permit, null, false, '', 'Preview', 'Write a note'];
    let cursor = 0;
    mocks.useState.mockImplementation(() => {
      const index = cursor++;
      return [state[index], (value: unknown) => { state[index] = value; }];
    });
    function button(node: ReactNode, label: string): { onClick: () => Promise<void>; disabled: boolean } | undefined {
      for (const child of Children.toArray(node)) {
        if (!isValidElement<{ children?: ReactNode; onClick: () => Promise<void>; disabled: boolean }>(child)) continue;
        if (child.type === 'button' && child.props.children === label) return child.props;
        const found = button(child.props.children, label);
        if (found) return found;
      }
    }
    function renderButton(label: string) {
      cursor = 0;
      const found = button(client.BrowserRuntimeClient(), label);
      expect(found).toBeDefined();
      expect(found!.disabled).toBe(false);
      return found!;
    }

    await renderButton('Approve Permit').onClick();
    expect(sent).toEqual([actionBody('approve_permit', tabA.job)]);
    expect(getBrowserRuntimeJob(job.job_id, ownerA.id)).toEqual(tabB);
    expect(actionStubStore()).toEqual(proof);
    expect(state[1]).toEqual(tabB);
    expect(state[6]).toContain('Review changed');

    // Only a fresh explicit decision can approve the newly displayed review.
    await renderButton('Approve Permit').onClick();
    expect(sent[1]).toEqual(actionBody('approve_permit', tabB));
    await renderButton('Produce artifact').onClick();
    expect(sent[2]).toEqual(actionBody('produce_artifact', tabB));
    await renderButton('Mint receipt').onClick();
    expect(sent[3]).toEqual(actionBody('receipt', tabB));
    expect(getBrowserRuntimeJob(job.job_id, ownerA.id)?.status).toBe('receipted');
  });

  it('surfaces denied API responses to the preview client instead of treating them as jobs', async () => {
    expect(client.browserRuntimeResponseError).toEqual(expect.any(Function));
    mocks.owner.mockResolvedValue(null);
    const response = await GET(new Request(endpoint));
    expect(client.browserRuntimeResponseError(response, await response.json())).toBe('Sign in to use Browser Runtime preview.');
    expect(client.browserRuntimeResponseError({ ok: false }, {})).toBe('Browser Runtime request failed.');
    expect(client.browserRuntimeResponseError({ ok: true }, { jobs: [] })).toBeNull();
  });

  it.each(reviewActions.flatMap(action => [
    { action, replacement: 'new context' },
    { action, replacement: 'replacement permit' },
  ]))('rejects tab As $action after tab Bs $replacement without changing job or proof', async ({ action, replacement }) => {
    let job = await createJob();
    const steps = ['lock_context', 'propose', 'request_permit', ...reviewActions];
    const stop = steps.indexOf(action);
    for (const step of steps.slice(0, stop)) job = await advance(step, job);
    const tabA = actionBody(action, job);
    if (replacement === 'new context') {
      const response = await POST(post({ action: 'lock_context', job_id: job.job_id, ...context, pageText: 'Tab B context.' }));
      expect(response.status).toBe(200);
      job = (await response.json()).job;
      job = await advance('propose', job);
    }
    for (const step of steps.slice(2, stop)) job = await advance(step, job);
    const before = structuredClone(getBrowserRuntimeJob(job.job_id, ownerA.id));
    const proof = structuredClone(actionStubStore());

    const denied = await POST(post(tabA));
    expect(denied.status).toBe(409);
    const error = await denied.json();
    expect(error).toMatchObject({ error: 'stale_review', message: expect.stringContaining('Review changed') });
    expect(client.browserRuntimeResponseError(denied, error)).toContain('review the current context');
    expect(getBrowserRuntimeJob(job.job_id, ownerA.id)).toEqual(before);
    expect(actionStubStore()).toEqual(proof);
    job = await advance(action, job);
    expect(job.permit_id).not.toBe(tabA.expected_permit_id);
    if (action === 'produce_artifact') {
      expect(actionStubStore().executes.get(job.action_id!)).toMatchObject({ permit_id: job.permit_id, executionClaimed: false });
    }
    if (action === 'receipt') {
      expect(actionStubStore().receipts.get(job.receipt_id!)).toMatchObject({ permit_id: job.permit_id, action_id: job.action_id });
      const receipted = structuredClone(job);
      const receiptedProof = structuredClone(actionStubStore());
      expect((await POST(post(tabA))).status).toBe(409);
      expect(await advance(action, job)).toEqual(receipted);
      expect(actionStubStore()).toEqual(receiptedProof);
    }
  });

  it.each(reviewActions)('rejects missing/malformed identities and an independently stale generation for %s', async action => {
    let job = await createJob();
    const steps = ['lock_context', 'propose', 'request_permit', ...reviewActions];
    for (const step of steps.slice(0, steps.indexOf(action))) job = await advance(step, job);
    const valid = actionBody(action, job);
    const before = structuredClone(getBrowserRuntimeJob(job.job_id, ownerA.id));
    const proof = structuredClone(actionStubStore());
    for (const body of [
      { action, job_id: job.job_id },
      { ...valid, expected_permit_id: undefined },
      { ...valid, expected_review_generation: undefined },
      { ...valid, expected_permit_id: null },
      { ...valid, expected_permit_id: 42 },
      { ...valid, expected_permit_id: '' },
      { ...valid, expected_permit_id: 'not-a-permit' },
      { ...valid, expected_review_generation: null },
      { ...valid, expected_review_generation: String(job.review_generation) },
      { ...valid, expected_review_generation: -1 },
      { ...valid, expected_review_generation: 1.5 },
    ]) {
      const response = await POST(post(body));
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({ error: 'invalid_input' });
      expect(getBrowserRuntimeJob(job.job_id, ownerA.id)).toEqual(before);
      expect(actionStubStore()).toEqual(proof);
    }
    const stale = await POST(post({ ...valid, expected_review_generation: job.review_generation + 1 }));
    expect(stale.status).toBe(409);
    expect(await stale.json()).toMatchObject({ error: 'stale_review' });
    expect(getBrowserRuntimeJob(job.job_id, ownerA.id)).toEqual(before);
    expect(actionStubStore()).toEqual(proof);
    await advance(action, job);
  });

  it('labels list storage as process-memory preview, not durable execution', async () => {
    const body = await (await GET(new Request(endpoint))).json();
    expect(body.honesty).toMatch(/process.memory/i);
    expect(body.honesty).toMatch(/not durable/i);
    expect(body.boundary).toContain('executionClaimed=false');
  });

  it.each(['', ' ', 'invalid-id', 'x'.repeat(81), 'brj_123456789abc&job_id=brj_abcdef123456'])(
    'rejects invalid GET job_id %s rather than listing jobs', async id => {
      await createJob();
      const response = await GET(new Request(`${endpoint}?job_id=${id}`));
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({ error: 'invalid_job_id' });
    },
  );

  it.each(['lock_context', 'propose', 'request_permit', 'approve_permit', 'produce_artifact', 'receipt'])(
    'validates missing/invalid IDs for %s and hides unknown jobs', async action => {
      for (const job_id of [undefined, null, 42, '', ' ', 'invalid-id', 'x'.repeat(81)]) {
        const response = await POST(post({ action, job_id, ...(action === 'lock_context' ? context : {}) }));
        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({ error: 'invalid_job_id' });
      }
      const unknown = await POST(post({
        action, job_id: 'brj_123456789abc', ...(action === 'lock_context' ? context : {}),
        ...(reviewActions.includes(action) ? { expected_permit_id: 'prm_123456789abc', expected_review_generation: 2 } : {}),
      }));
      expect(unknown.status).toBe(404);
      expect(await unknown.json()).toEqual({ error: 'job_not_found', message: 'Unknown browser runtime job' });
    },
  );

  it.each([null, [], 42, 'not an object'].map(body => ({ body })))(
    'rejects non-object JSON $body without throwing', async ({ body }) => {
      const response = await POST(post(body));
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({ error: 'invalid_input' });
    },
  );

  it('rejects client owner metadata on creation', async () => {
    const response = await POST(post({ title: 'Private job', objective: 'Write a note', ownerId: ownerB.id }));
    expect(response.status).toBe(400);
    expect((await (await GET(new Request(endpoint))).json()).jobs).toEqual([]);
  });

  it('isolates list/get and ignores client ownership when seeding', async () => {
    const a = await createJob();
    await POST(post({ action: 'lock_context', job_id: a.job_id, ...context }));
    mocks.owner.mockResolvedValue(ownerB);
    const seeded = await POST(post({ action: 'seed_insurer_compare', ownerId: ownerA.id }));
    expect(seeded.status).toBe(200);
    const b = (await seeded.json()).job;
    const list = await (await GET(new Request(`${endpoint}?ownerId=${ownerA.id}`))).json();
    expect(list.jobs.map((job: { job_id: string }) => job.job_id)).toEqual([b.job_id]);
    const denied = await GET(new Request(`${endpoint}?job_id=${a.job_id}&ownerId=${ownerA.id}`));
    expect(denied.status).toBe(404);
    expect(await denied.json()).toEqual({ error: 'job_not_found', message: 'Unknown browser runtime job' });
  });

  it.each(['lock_context', 'propose', 'request_permit', 'approve_permit', 'produce_artifact', 'receipt'])(
    'denies owner B %s on owner As job without changing it', async action => {
      let a = await createJob();
      const steps = ['lock_context', 'propose', 'request_permit', 'approve_permit', 'produce_artifact', 'receipt'];
      for (const step of steps.slice(0, steps.indexOf(action))) {
        a = await advance(step, a);
      }
      const before = await (await GET(new Request(`${endpoint}?job_id=${a.job_id}`))).json();
      mocks.owner.mockResolvedValue(ownerB);
      const response = await POST(post(actionBody(action, a)));
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: 'job_not_found', message: 'Unknown browser runtime job' });
      mocks.owner.mockResolvedValue(ownerA);
      expect(await (await GET(new Request(`${endpoint}?job_id=${a.job_id}`))).json()).toEqual(before);
      const own = await POST(post(actionBody(action, a)));
      expect(own.status).toBe(200);
      const packed = await own.json();
      expect(Object.keys(packed).sort()).toEqual(['boundary', 'job', 'permit', 'prepared', 'receipt']);
      if (action === 'receipt') expect(packed.receipt.outcome).toBe('simulated_ok');
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it.each([null, 'https://attacker.invalid', 'chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'])(
    'rejects mutation and preflight from %s before resolving identity', async from => {
      const request = post({ action: 'seed_insurer_compare' }, from);
      expect((await POST(request)).status).toBe(403);
      expect((await OPTIONS(request)).status).toBe(403);
      expect(mocks.owner).not.toHaveBeenCalled();
    },
  );

  it('does not grant extension CORS access to private responses', async () => {
    const response = await GET(new Request(endpoint, { headers: { origin: 'chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' } }));
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('vary')).toContain('Cookie');
  });

  it('allows same-origin web preflight', async () => {
    expect((await OPTIONS(post({}))).status).toBe(204);
  });

  it.each(['list', 'get', 'create', 'seed_insurer_compare', 'lock_context', 'propose', 'request_permit', 'approve_permit', 'produce_artifact', 'receipt'])(
    'denies anonymous %s without disclosing or changing captured context', async action => {
      const job = await createJob();
      expect((await POST(post({ action: 'lock_context', job_id: job.job_id, ...context }))).status).toBe(200);
      mocks.owner.mockResolvedValue(null);
      const response = action === 'list' ? await GET(new Request(endpoint))
        : action === 'get' ? await GET(new Request(`${endpoint}?job_id=${job.job_id}`))
          : await POST(post({ action, job_id: job.job_id, ...context }));
      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({ error: 'sign_in_required', message: 'Sign in to use Browser Runtime preview.' });
      mocks.owner.mockResolvedValue(ownerA);
      const own = await (await GET(new Request(`${endpoint}?job_id=${job.job_id}`))).json();
      expect(own.job.status).toBe('context_locked');
      expect(own.job.context.pageTextPreview).toBe(context.pageText);
    },
  );
});
