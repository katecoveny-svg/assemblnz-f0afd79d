import { describe, expect, it, beforeEach } from 'vitest';

import { resetActionStubStore } from '@/lib/do/action-stub';

import {
  BROWSER_RUNTIME_BOUNDARY,
  approveBrowserRuntimePermit,
  createBrowserRuntimeJob,
  lockBrowserRuntimeContext,
  mintBrowserRuntimeReceipt,
  produceBrowserRuntimeArtifact,
  proposeBrowserRuntimeNextStep,
  requestBrowserRuntimePermit,
  resetBrowserRuntimeJobs,
  seedInsurerCompareJob,
} from './browser-runtime';

describe('DO Browser Runtime jobs', () => {
  beforeEach(() => {
    resetActionStubStore();
    resetBrowserRuntimeJobs();
  });

  it('creates a persistent job that survives tab changes', () => {
    const job = seedInsurerCompareJob();
    expect(job.survives_tab_change).toBe(true);
    expect(job.boundary).toBe(BROWSER_RUNTIME_BOUNDARY);
    expect(job.model_placeholder).toMatch(/model-neutral/i);
    expect(job.mode).toBe('demo_stub');
  });

  it('locks context → propose → permit → artifact → receipt', () => {
    let job = createBrowserRuntimeJob({
      title: 'Draft reply from page',
      objective: 'Write an email reply from the visible page',
    });
    job = lockBrowserRuntimeContext({
      job_id: job.job_id,
      url: 'https://example.com/claims',
      title: 'Claims help',
      pageText: 'Excess is $500 for comprehensive. Contact us to proceed.',
      consent: true,
      tabId: 42,
    });
    expect(job.status).toBe('context_locked');
    expect(job.context?.pageTextChars).toBeGreaterThan(10);

    job = proposeBrowserRuntimeNextStep(job.job_id);
    expect(job.proposal?.artifact_kind).toBe('draft_email');

    job = requestBrowserRuntimePermit(job.job_id);
    expect(job.status).toBe('permit_pending');
    job = approveBrowserRuntimePermit(job.job_id);
    job = produceBrowserRuntimeArtifact(job.job_id);
    expect(job.status).toBe('artifact_ready');
    expect(job.artifact?.body).toMatch(/Draft only/i);

    job = mintBrowserRuntimeReceipt(job.job_id);
    expect(job.status).toBe('receipted');
    expect(job.receipt_id).toMatch(/^rcpt_/);
  });

  it('requires consent literal true to lock context', () => {
    const job = createBrowserRuntimeJob({
      title: 'Compare excess',
      objective: 'Compare insurer excess',
    });
    expect(() =>
      lockBrowserRuntimeContext({
        job_id: job.job_id,
        url: 'https://example.com',
        title: 'x',
        pageText: 'hello world page',
        // @ts-expect-error intentional
        consent: false,
      }),
    ).toThrow();
  });
});
