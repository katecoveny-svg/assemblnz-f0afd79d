import { afterEach, describe, expect, it, beforeEach, vi } from 'vitest';

import { actionStubStore, hashArgs, resetActionStubStore } from '@/lib/do/action-stub';

import {
  BROWSER_RUNTIME_BOUNDARY,
  type BrowserRuntimeJob,
  type BrowserRuntimeReviewInput,
  approveBrowserRuntimePermit,
  createBrowserRuntimeJob,
  getBrowserRuntimeJob,
  listBrowserRuntimeJobs,
  lockBrowserRuntimeContext,
  mintBrowserRuntimeReceipt,
  produceBrowserRuntimeArtifact,
  proposeBrowserRuntimeNextStep,
  requestBrowserRuntimePermit,
  resetBrowserRuntimeJobs,
  seedInsurerCompareJob,
} from './browser-runtime';

const ownerA = 'owner-a';
const ownerB = 'owner-b';
const context = {
  url: 'https://example.invalid/claims', title: 'Synthetic claims help',
  pageText: 'Synthetic excess is $500. Not real customer data.', consent: true as const,
};
function displayedReview(job: BrowserRuntimeJob): BrowserRuntimeReviewInput {
  return { expected_permit_id: job.permit_id!, expected_review_generation: job.review_generation };
}
const steps = [
  { name: 'lock context', run: (id: string, owner: string) => lockBrowserRuntimeContext({ job_id: id, ...context }, owner) },
  { name: 'propose', run: proposeBrowserRuntimeNextStep },
  { name: 'request permit', run: requestBrowserRuntimePermit },
  { name: 'approve permit', run: approveBrowserRuntimePermit },
  { name: 'produce artifact', run: produceBrowserRuntimeArtifact },
  { name: 'mint receipt', run: mintBrowserRuntimeReceipt },
];

beforeEach(() => {
  resetActionStubStore();
  resetBrowserRuntimeJobs();
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('No network allowed in Browser Runtime preview tests'); }));
});

afterEach(() => {
  expect(fetch).not.toHaveBeenCalled();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('DO Browser Runtime jobs', () => {
  it('creates a preview job that survives tab changes within the process', () => {
    const job = seedInsurerCompareJob(ownerA);
    expect(job.survives_tab_change).toBe(true);
    expect(job.boundary).toBe(BROWSER_RUNTIME_BOUNDARY);
    expect(job.boundary).toMatch(/process.memory/i);
    expect(job.boundary).toMatch(/not durable/i);
    expect(job.model_placeholder).toMatch(/model-neutral/i);
    expect(job.mode).toBe('demo_stub');
    resetBrowserRuntimeJobs();
    expect(getBrowserRuntimeJob(job.job_id, ownerA)).toBeUndefined();
  });

  it('locks context → propose → permit → artifact → receipt', () => {
    let job = createBrowserRuntimeJob({
      title: 'Draft reply from page',
      objective: 'Write an email reply from the visible page',
    }, ownerA);
    job = lockBrowserRuntimeContext({ job_id: job.job_id, ...context, tabId: 42 }, ownerA);
    expect(job.status).toBe('context_locked');
    expect(job.context?.pageTextChars).toBeGreaterThan(10);
    job = proposeBrowserRuntimeNextStep(job.job_id, ownerA);
    expect(job.proposal?.artifact_kind).toBe('draft_email');
    job = requestBrowserRuntimePermit(job.job_id, ownerA);
    expect(job.status).toBe('permit_pending');
    job = approveBrowserRuntimePermit(job.job_id, ownerA, displayedReview(job));
    job = produceBrowserRuntimeArtifact(job.job_id, ownerA, displayedReview(job));
    expect(job.status).toBe('artifact_ready');
    expect(job.artifact?.body).toMatch(/Draft only/i);
    job = mintBrowserRuntimeReceipt(job.job_id, ownerA, displayedReview(job));
    expect(job.status).toBe('receipted');
    expect(job.receipt_id).toMatch(/^rcpt_/);
    expect(actionStubStore().executes.get(job.action_id!)?.executionClaimed).toBe(false);
  });

  it('clears the previous review when context is relocked', () => {
    let job = seedInsurerCompareJob(ownerA);
    for (const step of steps) job = step.run(job.job_id, ownerA, displayedReview(job));
    expect(job.status).toBe('receipted');
    const completed = structuredClone(job);
    const beforeActions = structuredClone(actionStubStore());
    const nextContext = {
      ...context, url: 'https://example.invalid/second-insurer',
      title: 'Second synthetic insurer', pageText: 'Synthetic excess is $750.',
    };

    job = lockBrowserRuntimeContext({ job_id: job.job_id, ...nextContext }, ownerA);
    expect(job.status).toBe('context_locked');
    expect(job.context?.url).toBe(nextContext.url);
    for (const field of ['proposal', 'prep_id', 'permit_id', 'action_id', 'artifact', 'receipt_id'] as const) {
      expect.soft(job[field], field).toBeUndefined();
    }
    expect.soft(() => requestBrowserRuntimePermit(job.job_id, ownerA)).toThrow();
    expect.soft(() => approveBrowserRuntimePermit(job.job_id, ownerA, displayedReview(job))).toThrow();
    expect.soft(() => produceBrowserRuntimeArtifact(job.job_id, ownerA, displayedReview(job))).toThrow();
    expect.soft(() => mintBrowserRuntimeReceipt(job.job_id, ownerA, displayedReview(job))).toThrow();
    expect.soft(actionStubStore()).toEqual(beforeActions);
    expect(completed.context?.url).toBe(context.url);
  });

  it.each([
    { status: 'permitted', completedSteps: 4 },
    { status: 'artifact_ready', completedSteps: 5 },
    { status: 'receipted', completedSteps: 6 },
  ])('invalidates the $status review when the proposal is regenerated', ({ status, completedSteps }) => {
    let job = seedInsurerCompareJob(ownerA);
    for (const step of steps.slice(0, completedSteps)) job = step.run(job.job_id, ownerA, displayedReview(job));
    expect(job.status).toBe(status);
    const locked = job.context;
    const beforeActions = structuredClone(actionStubStore());

    job = proposeBrowserRuntimeNextStep(job.job_id, ownerA);
    expect(job.status).toBe('proposed');
    expect(job.context).toEqual(locked);
    expect(job.proposal).toBeDefined();
    for (const field of ['prep_id', 'permit_id', 'action_id', 'artifact', 'receipt_id'] as const) {
      expect.soft(job[field], field).toBeUndefined();
    }
    expect(() => approveBrowserRuntimePermit(job.job_id, ownerA, displayedReview(job))).toThrow();
    expect(() => produceBrowserRuntimeArtifact(job.job_id, ownerA, displayedReview(job))).toThrow();
    expect.soft(() => mintBrowserRuntimeReceipt(job.job_id, ownerA, displayedReview(job))).toThrow();
    expect.soft(actionStubStore()).toEqual(beforeActions);
  });

  it.each([
    { name: 'a changed URL', change: { url: 'https://example.invalid/second-insurer' } },
    { name: 'the same URL and first 120 characters', change: { pageText: `${'Synthetic comparison. '.repeat(7)}Updated excess $750.` } },
    { name: 'identical relocked context', change: {} },
    { name: 'an unchanged regenerated proposal', change: null },
  ])('binds each renewed review to fresh stub proof for $name', ({ change }) => {
    // Same-clock transitions must not reuse an earlier review's cached stub records.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-17T00:00:00Z'));
    const initialContext = { ...context, pageText: `${'Synthetic comparison. '.repeat(7)}Initial excess $500.` };
    let job = seedInsurerCompareJob(ownerA);
    job = lockBrowserRuntimeContext({ job_id: job.job_id, ...initialContext }, ownerA);
    for (const step of steps.slice(1)) job = step.run(job.job_id, ownerA, displayedReview(job));

    for (let review = 0; review < 2; review++) {
      const previous = structuredClone(job);
      const previousPrepared = structuredClone(actionStubStore().prepared.get(job.prep_id!)!);
      const previousReceipt = structuredClone(actionStubStore().receipts.get(job.receipt_id!)!);
      if (change !== null) {
        job = lockBrowserRuntimeContext({ job_id: job.job_id, ...initialContext, ...change }, ownerA);
      }
      job = proposeBrowserRuntimeNextStep(job.job_id, ownerA);
      expect(() => produceBrowserRuntimeArtifact(job.job_id, ownerA, displayedReview(job))).toThrow();
      expect(() => mintBrowserRuntimeReceipt(job.job_id, ownerA, displayedReview(job))).toThrow();
      job = requestBrowserRuntimePermit(job.job_id, ownerA);
      const prepared = actionStubStore().prepared.get(job.prep_id!)!;
      expect.soft(job.prep_id).not.toBe(previous.prep_id);
      expect.soft(prepared.args).toMatchObject({
        job_id: job.job_id, url: job.context!.url,
        args_preview: job.context!.pageTextPreview.slice(0, 120),
        context: job.context, proposal: job.proposal,
      });
      expect(prepared.args_hash).toBe(hashArgs(prepared.args));
      expect.soft(prepared.args_hash).not.toBe(previousPrepared.args_hash);
      // Retrying prepare without changing the review is still idempotent.
      job = requestBrowserRuntimePermit(job.job_id, ownerA);
      expect(job.prep_id).toBe(prepared.prep_id);
      expect(() => produceBrowserRuntimeArtifact(job.job_id, ownerA, displayedReview(job))).toThrow();
      expect(() => mintBrowserRuntimeReceipt(job.job_id, ownerA, displayedReview(job))).toThrow();
      job = approveBrowserRuntimePermit(job.job_id, ownerA, displayedReview(job));
      job = produceBrowserRuntimeArtifact(job.job_id, ownerA, displayedReview(job));
      expect.soft(job.action_id).not.toBe(previous.action_id);
      expect.soft(actionStubStore().executes.get(job.action_id!)).toMatchObject({
        prep_id: job.prep_id, permit_id: job.permit_id, executionClaimed: false,
      });
      expect.soft(actionStubStore().permits.get(job.permit_id!)).toMatchObject({
        prep_id: prepared.prep_id, args_hash: prepared.args_hash, uses: 1,
      });
      expect(job.artifact?.body).toContain(job.context!.pageTextPreview);
      job = mintBrowserRuntimeReceipt(job.job_id, ownerA, displayedReview(job));
      expect(job.status).toBe('receipted');
      expect(job.receipt_id).not.toBe(previous.receipt_id);
      expect.soft(actionStubStore().receipts.get(job.receipt_id!)).toMatchObject({
        action_id: job.action_id, prep_id: job.prep_id, permit_id: job.permit_id,
        args_hash: prepared.args_hash, outcome: 'simulated_ok',
        evidence: expect.arrayContaining([{ kind: 'url', value: job.context!.url }]),
      });
      expect(actionStubStore().prepared.get(previous.prep_id!)).toEqual(previousPrepared);
      expect(actionStubStore().receipts.get(previous.receipt_id!)).toEqual(previousReceipt);
    }
  });

  it.each(['open', 'context_locked', 'proposed', 'permit_pending', 'permitted', 'cancelled'] as const)(
    'refuses receipts in %s even if stale artifact references remain', status => {
      let job = seedInsurerCompareJob(ownerA);
      for (const step of steps.slice(0, -1)) job = step.run(job.job_id, ownerA, displayedReview(job));
      // Simulate a stale process-memory snapshot: field presence is not authority.
      job.status = status;
      const before = structuredClone(job);
      const beforeActions = structuredClone(actionStubStore());

      expect(() => mintBrowserRuntimeReceipt(job.job_id, ownerA, displayedReview(job))).toThrow('Artifact not ready for receipt');
      expect(getBrowserRuntimeJob(job.job_id, ownerA)).toEqual(before);
      expect(actionStubStore()).toEqual(beforeActions);
    },
  );

  it('returns the existing receipt on retry without minting or changing proof', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-17T00:00:00Z'));
    let job = seedInsurerCompareJob(ownerA);
    for (const step of steps) job = step.run(job.job_id, ownerA, displayedReview(job));
    const completed = structuredClone(job);
    const beforeActions = structuredClone(actionStubStore());

    vi.advanceTimersByTime(1000);
    job = mintBrowserRuntimeReceipt(job.job_id, ownerA, displayedReview(job));
    expect(job).toEqual(completed);
    expect(actionStubStore()).toEqual(beforeActions);
  });

  it('reuses preparation but clears completed proof when requesting another permit for the same review', () => {
    let job = seedInsurerCompareJob(ownerA);
    for (const step of steps) job = step.run(job.job_id, ownerA, displayedReview(job));
    const completed = structuredClone(job);
    const previousReceipt = structuredClone(actionStubStore().receipts.get(job.receipt_id!)!);

    job = requestBrowserRuntimePermit(job.job_id, ownerA);
    expect(job.prep_id).toBe(completed.prep_id);
    expect(job.review_generation).toBe(completed.review_generation);
    expect(job.permit_id).not.toBe(completed.permit_id);
    for (const field of ['action_id', 'artifact', 'receipt_id'] as const) {
      expect.soft(job[field], field).toBeUndefined();
    }
    expect(() => mintBrowserRuntimeReceipt(job.job_id, ownerA, displayedReview(job))).toThrow();
    job = approveBrowserRuntimePermit(job.job_id, ownerA, displayedReview(job));
    expect(() => mintBrowserRuntimeReceipt(job.job_id, ownerA, displayedReview(job))).toThrow();
    job = produceBrowserRuntimeArtifact(job.job_id, ownerA, displayedReview(job));
    expect(job.action_id).not.toBe(completed.action_id);
    expect(actionStubStore().executes.get(job.action_id!)).toMatchObject({
      prep_id: job.prep_id, permit_id: job.permit_id, executionClaimed: false,
    });
    expect(actionStubStore().permits.get(job.permit_id!)?.uses).toBe(1);
    job = mintBrowserRuntimeReceipt(job.job_id, ownerA, displayedReview(job));
    expect(job.receipt_id).not.toBe(completed.receipt_id);
    expect(actionStubStore().receipts.get(job.receipt_id!)).toMatchObject({
      action_id: job.action_id, prep_id: job.prep_id, permit_id: job.permit_id,
    });
    expect(actionStubStore().receipts.get(completed.receipt_id!)).toEqual(previousReceipt);
  });

  it.each(['new context', 'replacement permit'] as const)(
    'rejects tab As approval after tab B requests a permit for %s', replacement => {
      let job = seedInsurerCompareJob(ownerA);
      for (const step of steps.slice(0, 3)) job = step.run(job.job_id, ownerA, displayedReview(job));
      // Tab A retains exactly the identities displayed alongside its review.
      const tabA = {
        expected_permit_id: job.permit_id!,
        expected_review_generation: job.review_generation,
      };
      if (replacement === 'new context') {
        job = lockBrowserRuntimeContext({ job_id: job.job_id, ...context, pageText: 'Tab B replacement context.' }, ownerA);
        job = proposeBrowserRuntimeNextStep(job.job_id, ownerA);
      }
      job = requestBrowserRuntimePermit(job.job_id, ownerA);
      const before = structuredClone(job);
      const beforeActions = structuredClone(actionStubStore());

      expect(() => approveBrowserRuntimePermit(job.job_id, ownerA, tabA)).toThrow('Review changed');
      expect(getBrowserRuntimeJob(job.job_id, ownerA)).toEqual(before);
      expect(actionStubStore()).toEqual(beforeActions);
      job = approveBrowserRuntimePermit(job.job_id, ownerA, {
        expected_permit_id: job.permit_id!, expected_review_generation: job.review_generation,
      });
      expect(job.status).toBe('permitted');
    },
  );

  it.each([
    { name: 'production after new context', run: produceBrowserRuntimeArtifact, completedSteps: 4, relock: true },
    { name: 'production after a replacement permit', run: produceBrowserRuntimeArtifact, completedSteps: 4, relock: false },
    { name: 'receipt after new context', run: mintBrowserRuntimeReceipt, completedSteps: 5, relock: true },
    { name: 'receipt after a replacement permit', run: mintBrowserRuntimeReceipt, completedSteps: 5, relock: false },
  ])('rejects tab As stale $name', ({ run, completedSteps, relock }) => {
    let job = seedInsurerCompareJob(ownerA);
    for (const step of steps.slice(0, completedSteps)) job = step.run(job.job_id, ownerA, displayedReview(job));
    const tabA = displayedReview(job);
    if (relock) {
      job = lockBrowserRuntimeContext({ job_id: job.job_id, ...context, pageText: 'Tab B replacement context.' }, ownerA);
      job = proposeBrowserRuntimeNextStep(job.job_id, ownerA);
    }
    for (const step of steps.slice(2, completedSteps)) job = step.run(job.job_id, ownerA, displayedReview(job));
    const before = structuredClone(job);
    const beforeActions = structuredClone(actionStubStore());

    expect(() => run(job.job_id, ownerA, tabA)).toThrow('Review changed');
    expect(getBrowserRuntimeJob(job.job_id, ownerA)).toEqual(before);
    expect(actionStubStore()).toEqual(beforeActions);
    job = run(job.job_id, ownerA, displayedReview(job));
    expect(actionStubStore().executes.get(job.action_id!)).toMatchObject({
      permit_id: job.permit_id, prep_id: job.prep_id, executionClaimed: false,
    });
    expect(actionStubStore().permits.get(job.permit_id!)?.uses).toBe(1);
    if (completedSteps === 5) {
      expect(actionStubStore().receipts.get(job.receipt_id!)).toMatchObject({
        permit_id: job.permit_id, prep_id: job.prep_id, action_id: job.action_id,
      });
      const receipted = structuredClone(job);
      const receiptedActions = structuredClone(actionStubStore());
      // An idempotent receipt return must still validate the displayed review.
      expect(() => run(job.job_id, ownerA, tabA)).toThrow('Review changed');
      expect(getBrowserRuntimeJob(job.job_id, ownerA)).toEqual(receipted);
      expect(actionStubStore()).toEqual(receiptedActions);
    }
  });

  it.each(steps.slice(3).map((step, index) => ({ ...step, completedSteps: index + 3 })))(
    'requires both well-formed displayed identities before $name', ({ run, completedSteps }) => {
      let job = seedInsurerCompareJob(ownerA);
      for (const step of steps.slice(0, completedSteps)) job = step.run(job.job_id, ownerA, displayedReview(job));
      const valid = displayedReview(job);
      const before = structuredClone(job);
      const beforeActions = structuredClone(actionStubStore());
      for (const invalid of [
        undefined, null, {},
        { expected_permit_id: valid.expected_permit_id },
        { expected_review_generation: valid.expected_review_generation },
        { ...valid, expected_permit_id: null },
        { ...valid, expected_permit_id: 'not-a-permit' },
        { ...valid, expected_review_generation: String(valid.expected_review_generation) },
        { ...valid, expected_review_generation: -1 },
        { ...valid, expected_review_generation: 1.5 },
      ]) {
        expect(() => run(job.job_id, ownerA, invalid as BrowserRuntimeReviewInput)).toThrow();
        expect(getBrowserRuntimeJob(job.job_id, ownerA)).toEqual(before);
        expect(actionStubStore()).toEqual(beforeActions);
      }
      // @ts-expect-error Legacy job-ID-only calls are deliberately unsupported.
      expect(() => run(job.job_id, ownerA)).toThrow();
      // The generation is independently required even with the exact current permit.
      expect(() => run(job.job_id, ownerA, {
        ...valid, expected_review_generation: valid.expected_review_generation + 1,
      })).toThrow('Review changed');
      expect(getBrowserRuntimeJob(job.job_id, ownerA)).toEqual(before);
      expect(actionStubStore()).toEqual(beforeActions);
      expect(run(job.job_id, ownerA, valid)).toBeDefined();
    },
  );

  it('requires consent literal true to lock context', () => {
    const job = seedInsurerCompareJob(ownerA);
    expect(() => lockBrowserRuntimeContext({
      job_id: job.job_id, ...context,
      // @ts-expect-error intentional invalid consent
      consent: false,
    }, ownerA)).toThrow();
  });

  it('lists only the authenticated owners jobs', () => {
    const a = seedInsurerCompareJob(ownerA);
    const b = seedInsurerCompareJob(ownerB);
    expect(listBrowserRuntimeJobs(ownerA)).toEqual([a]);
    expect(listBrowserRuntimeJobs(ownerB)).toEqual([b]);
  });

  it('hides another owners job even with its exact ID', () => {
    const a = seedInsurerCompareJob(ownerA);
    expect(getBrowserRuntimeJob(a.job_id, ownerB)).toBeUndefined();
    expect(getBrowserRuntimeJob(a.job_id, ownerA)).toEqual(a);
  });

  it.each(['', ' ', undefined, null])('requires an owner for list/get/create/seed (%s)', owner => {
    const a = seedInsurerCompareJob(ownerA);
    expect(() => listBrowserRuntimeJobs(owner as string)).toThrow('Owner required');
    expect(() => getBrowserRuntimeJob(a.job_id, owner as string)).toThrow('Owner required');
    expect(() => createBrowserRuntimeJob({ title: 'Private fixture', objective: 'Prepare a note' }, owner as string)).toThrow('Owner required');
    expect(() => seedInsurerCompareJob(owner as string)).toThrow('Owner required');
  });

  it.each(steps.map((step, index) => ({ ...step, index })))(
    'owner B cannot $name on owner As job', ({ run, index }) => {
      let job = seedInsurerCompareJob(ownerA);
      for (const step of steps.slice(0, index)) job = step.run(job.job_id, ownerA, displayedReview(job));
      const before = structuredClone(job);
      const beforeActions = structuredClone(actionStubStore());
      expect(() => run(job.job_id, ownerB, displayedReview(job))).toThrow('Unknown browser runtime job');
      expect(getBrowserRuntimeJob(job.job_id, ownerA)).toEqual(before);
      expect(actionStubStore()).toEqual(beforeActions);
      expect(run(job.job_id, ownerA, displayedReview(job))).toBeDefined();
    },
  );

  it.each(steps.map((step, index) => ({ ...step, index })))(
    'an anonymous helper call cannot $name', ({ run, index }) => {
      let job = seedInsurerCompareJob(ownerA);
      for (const step of steps.slice(0, index)) job = step.run(job.job_id, ownerA, displayedReview(job));
      expect(() => run(job.job_id, '', displayedReview(job))).toThrow('Owner required');
    },
  );

  it('never adopts old unowned process-memory records', () => {
    const legacy = seedInsurerCompareJob(ownerA);
    resetBrowserRuntimeJobs();
    const store = (globalThis as typeof globalThis & { __assemblBrowserRuntimeJobs: Map<string, unknown> }).__assemblBrowserRuntimeJobs;
    store.set(legacy.job_id, legacy);
    for (const owner of [ownerA, ownerB]) {
      expect(listBrowserRuntimeJobs(owner)).toEqual([]);
      expect(getBrowserRuntimeJob(legacy.job_id, owner)).toBeUndefined();
      for (const step of steps) expect(() => step.run(legacy.job_id, owner, displayedReview(legacy))).toThrow('Unknown browser runtime job');
    }
  });
});
