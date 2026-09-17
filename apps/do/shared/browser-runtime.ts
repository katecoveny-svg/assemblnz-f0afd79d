/**
 * DO Browser Runtime — owner-scoped, process-memory preview jobs.
 *
 * Extends browser-seat capture; does not invent a second extension.
 * Jobs can survive tab changes within one server process, not restarts or instances.
 * This is not durable storage or an external-action runtime.
 * No Firefox Smart Window / Mozilla embed claims.
 *
 * @see docs/do-action-cloud/DO_BROWSER_RUNTIME.md
 * @see docs/do-templates/DO-BROWSER-SEAT.md
 */

import { z } from 'zod';

import {
  executeUnderPermit,
  hashArgs,
  issuePermit,
  mintReceipt,
  prepareAction,
  stubId,
} from '@/lib/do/action-stub';

export const BROWSER_RUNTIME_BOUNDARY =
  'DO Browser Runtime preview · owner-scoped process-memory jobs, not durable storage. Jobs may be lost on restart or another server instance. Capture is consented read-only; artifacts and permits are demo stubs with no external effects. executionClaimed=false.';

export type BrowserRuntimeContextLock = {
  /** What DO can see — visible to the user. */
  url: string;
  title: string;
  pageTextChars: number;
  pageTextPreview: string;
  tabId?: number;
  lockedAt: string;
  consent: true;
};

export type BrowserRuntimeArtifactKind = 'draft_email' | 'note' | 'form_prep';

export type BrowserRuntimeArtifact = {
  kind: BrowserRuntimeArtifactKind;
  title: string;
  body: string;
  created_at: string;
};

export type BrowserRuntimeJobStatus =
  | 'open'
  | 'context_locked'
  | 'proposed'
  | 'permit_pending'
  | 'permitted'
  | 'artifact_ready'
  | 'receipted'
  | 'cancelled';

export type BrowserRuntimeJob = {
  job_id: string;
  /** Advanced on every context lock or proposal, even at the same time/content. */
  review_generation: number;
  title: string;
  objective: string;
  status: BrowserRuntimeJobStatus;
  /** Model-neutral — any model may propose; DO authorises. */
  model_placeholder: string;
  context?: BrowserRuntimeContextLock;
  proposal?: {
    summary: string;
    next_step: string;
    artifact_kind: BrowserRuntimeArtifactKind;
  };
  prep_id?: string;
  permit_id?: string;
  action_id?: string;
  receipt_id?: string;
  artifact?: BrowserRuntimeArtifact;
  created_at: string;
  updated_at: string;
  /** Across tabs only while the same server process holds this preview. Not durable. */
  survives_tab_change: true;
  mode: 'demo_stub';
  boundary: string;
};

export const browserRuntimeCreateInput = z
  .object({
    title: z.string().trim().min(3).max(120),
    objective: z.string().trim().min(3).max(800),
    model_placeholder: z.string().trim().min(2).max(80).optional(),
  })
  .strict();

export const browserRuntimeJobId = z.string().regex(/^brj_[a-f0-9]{12}$/);

/** The exact review displayed to the caller, never substituted with current state. */
export const browserRuntimeReviewInput = z.object({
  expected_permit_id: z.string().regex(/^prm_[a-f0-9]{12}$/),
  expected_review_generation: z.number().int().nonnegative(),
}).strict();

export type BrowserRuntimeReviewInput = z.infer<typeof browserRuntimeReviewInput>;

export const browserRuntimeContextInput = z
  .object({
    job_id: browserRuntimeJobId,
    url: z.string().url().max(2000),
    title: z.string().trim().min(1).max(200),
    pageText: z.string().trim().min(1).max(12_000),
    tabId: z.number().int().positive().optional(),
    consent: z.literal(true),
  })
  .strict();

export type BrowserRuntimeCreateInput = z.infer<typeof browserRuntimeCreateInput>;
export type BrowserRuntimeContextInput = z.infer<typeof browserRuntimeContextInput>;

// Ownership is server-side metadata, never part of the client job payload.
type StoredJob = { ownerId: string; job: BrowserRuntimeJob };
type Store = Map<string, StoredJob>;

const globalStore = globalThis as typeof globalThis & {
  __assemblBrowserRuntimeJobs?: Store;
};

function jobs(): Store {
  if (!globalStore.__assemblBrowserRuntimeJobs) {
    globalStore.__assemblBrowserRuntimeJobs = new Map();
  }
  return globalStore.__assemblBrowserRuntimeJobs;
}

export function resetBrowserRuntimeJobs() {
  jobs().clear();
}

function requireOwner(ownerId: string) {
  if (typeof ownerId !== 'string' || !ownerId.trim()) throw new Error('Owner required');
}

export class BrowserRuntimeJobNotFoundError extends Error {
  constructor() { super('Unknown browser runtime job'); }
}

export class BrowserRuntimeReviewConflictError extends Error {
  constructor() { super('Review changed. Reopen the job, review the current context and Permit, then decide again.'); }
}

export function listBrowserRuntimeJobs(ownerId: string): BrowserRuntimeJob[] {
  requireOwner(ownerId);
  return [...jobs().values()]
    // Old unowned records left in a hot process are not adopted by any owner.
    .filter(record => record.ownerId === ownerId)
    .map(record => record.job)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function getBrowserRuntimeJob(job_id: string, ownerId: string): BrowserRuntimeJob | undefined {
  requireOwner(ownerId);
  const record = jobs().get(job_id);
  return record?.ownerId === ownerId ? record.job : undefined;
}

function requireJob(job_id: string, ownerId: string): BrowserRuntimeJob {
  const job = getBrowserRuntimeJob(job_id, ownerId);
  if (!job) throw new BrowserRuntimeJobNotFoundError();
  return job;
}

function requireReviewedJob(job_id: string, ownerId: string, expected: BrowserRuntimeReviewInput): BrowserRuntimeJob {
  // Authorise the owner before checking review identity. Validation and mutation
  // stay synchronous within this process-memory store; do not insert an await.
  const job = requireJob(job_id, ownerId);
  const parsed = browserRuntimeReviewInput.parse(expected);
  if (job.permit_id !== parsed.expected_permit_id || job.review_generation !== parsed.expected_review_generation) {
    throw new BrowserRuntimeReviewConflictError();
  }
  return job;
}

function save(job: BrowserRuntimeJob, ownerId: string): BrowserRuntimeJob {
  requireJob(job.job_id, ownerId);
  const next = { ...job, updated_at: new Date().toISOString() };
  jobs().set(next.job_id, { ownerId, job: next });
  return next;
}

export function createBrowserRuntimeJob(input: BrowserRuntimeCreateInput, ownerId: string): BrowserRuntimeJob {
  requireOwner(ownerId);
  const parsed = browserRuntimeCreateInput.parse(input);
  const now = new Date().toISOString();
  const job: BrowserRuntimeJob = {
    job_id: stubId('brj'),
    review_generation: 0,
    title: parsed.title,
    objective: parsed.objective,
    status: 'open',
    model_placeholder: parsed.model_placeholder ?? 'model-neutral · any proposer',
    created_at: now,
    updated_at: now,
    survives_tab_change: true,
    mode: 'demo_stub',
    boundary: BROWSER_RUNTIME_BOUNDARY,
  };
  jobs().set(job.job_id, { ownerId, job });
  return job;
}

export function lockBrowserRuntimeContext(input: BrowserRuntimeContextInput, ownerId: string): BrowserRuntimeJob {
  requireOwner(ownerId);
  const parsed = browserRuntimeContextInput.parse(input);
  const job = requireJob(parsed.job_id, ownerId);

  const context: BrowserRuntimeContextLock = {
    url: parsed.url,
    title: parsed.title,
    pageTextChars: parsed.pageText.length,
    pageTextPreview: parsed.pageText.slice(0, 280),
    tabId: parsed.tabId,
    lockedAt: new Date().toISOString(),
    consent: true,
  };

  return save({
    ...job,
    review_generation: (job.review_generation ?? 0) + 1,
    context,
    proposal: undefined,
    prep_id: undefined,
    permit_id: undefined,
    action_id: undefined,
    artifact: undefined,
    receipt_id: undefined,
    status: 'context_locked',
  }, ownerId);
}

/** Propose next step from locked context — deterministic stub, not an LLM call. */
export function proposeBrowserRuntimeNextStep(job_id: string, ownerId: string): BrowserRuntimeJob {
  const job = requireJob(job_id, ownerId);
  if (!job.context) throw new Error('Lock context before proposing');

  const host = (() => {
    try {
      return new URL(job.context.url).hostname;
    } catch {
      return 'page';
    }
  })();

  const artifact_kind: BrowserRuntimeArtifactKind = /insur|excess|quote/i.test(job.objective)
    ? 'note'
    : /email|reply|write/i.test(job.objective)
      ? 'draft_email'
      : 'form_prep';

  const proposal = {
    summary: `From ${host}: ${job.context.title}`,
    next_step:
      artifact_kind === 'draft_email'
        ? 'Draft a reply using only visible page context under Permit.'
        : artifact_kind === 'note'
          ? 'Produce a comparison note artifact (not a chat dump).'
          : 'Prepare form fields as an artifact — never submit.',
    artifact_kind,
  };

  return save({
    ...job,
    review_generation: (job.review_generation ?? 0) + 1,
    proposal,
    prep_id: undefined,
    permit_id: undefined,
    action_id: undefined,
    artifact: undefined,
    receipt_id: undefined,
    status: 'proposed',
  }, ownerId);
}

export function requestBrowserRuntimePermit(job_id: string, ownerId: string): BrowserRuntimeJob {
  const job = requireJob(job_id, ownerId);
  if (!job?.proposal || !job.context) {
    throw new Error('Proposal + context required before permit');
  }

  // Bind proof to the whole retained review, not just the short display preview.
  const args = {
    job_id: job.job_id,
    review_generation: job.review_generation,
    artifact_kind: job.proposal.artifact_kind,
    url: job.context.url,
    args_preview: job.context.pageTextPreview.slice(0, 120),
    context: { ...job.context },
    proposal: { ...job.proposal },
  };
  const prepared = prepareAction({
    action_name: 'browser.produce_artifact',
    namespace: 'demo.browser_runtime',
    title: `Produce ${job.proposal.artifact_kind} artifact`,
    args,
    idempotency_key: `browser-runtime:${job.job_id}:prepare:${hashArgs(args)}`,
    risk_class: 'low',
    agent_id: 'agt_browser_runtime',
  });
  const permit = issuePermit({
    prep_id: prepared.prep_id,
    scopes: ['action:browser.produce_artifact'],
    ttl_seconds: 900,
  });

  return save({
    ...job,
    prep_id: prepared.prep_id,
    permit_id: permit.permit_id,
    action_id: undefined,
    artifact: undefined,
    receipt_id: undefined,
    status: 'permit_pending',
  }, ownerId);
}

export function approveBrowserRuntimePermit(job_id: string, ownerId: string, expected: BrowserRuntimeReviewInput): BrowserRuntimeJob {
  const job = requireReviewedJob(job_id, ownerId, expected);
  if (!job?.permit_id) throw new Error('No permit');
  if (job.status !== 'permit_pending') throw new Error('Permit not pending');
  return save({ ...job, status: 'permitted' }, ownerId);
}

export function produceBrowserRuntimeArtifact(job_id: string, ownerId: string, expected: BrowserRuntimeReviewInput): BrowserRuntimeJob {
  const job = requireReviewedJob(job_id, ownerId, expected);
  if (!job?.proposal || !job.context || !job.permit_id || !job.prep_id) {
    throw new Error('Permit + proposal required');
  }
  if (job.status !== 'permitted') throw new Error('Approve permit before producing artifact');

  const executed = executeUnderPermit({
    permit_id: job.permit_id,
    prep_id: job.prep_id,
    idempotency_key: `browser-runtime:${job.job_id}:${job.prep_id}:${job.permit_id}:execute`,
    result: { artifact: true },
  });

  const artifact: BrowserRuntimeArtifact = {
    kind: job.proposal.artifact_kind,
    title:
      job.proposal.artifact_kind === 'draft_email'
        ? `Draft · ${job.context.title}`
        : job.proposal.artifact_kind === 'note'
          ? `Note · ${job.title}`
          : `Form prep · ${job.context.title}`,
    body:
      job.proposal.artifact_kind === 'draft_email'
        ? `Subject: Re: ${job.context.title}\n\nKia ora,\n\nBased on the visible page at ${job.context.url} (${job.context.pageTextChars} chars locked with consent):\n\n${job.context.pageTextPreview}\n\n—\nDraft only · DO did not send this.`
        : job.proposal.artifact_kind === 'note'
          ? `# ${job.title}\n\nObjective: ${job.objective}\nSource: ${job.context.url}\n\n## Locked context preview\n${job.context.pageTextPreview}\n\n## Next step\n${job.proposal.next_step}\n\n_Artifact · not a chat transcript._`
          : `Form prep for ${job.context.title}\nURL: ${job.context.url}\n\nSuggested fields (not submitted):\n- Reference: ${job.job_id}\n- Notes: ${job.objective}\n\nDO never submits forms from Browser Runtime v0.`,
    created_at: new Date().toISOString(),
  };

  return save({
    ...job,
    action_id: executed.action_id,
    artifact,
    status: 'artifact_ready',
  }, ownerId);
}

export function mintBrowserRuntimeReceipt(job_id: string, ownerId: string, expected: BrowserRuntimeReviewInput): BrowserRuntimeJob {
  const job = requireReviewedJob(job_id, ownerId, expected);
  if (!job?.action_id || !job.artifact) throw new Error('Artifact required before receipt');
  if (job.status !== 'artifact_ready' && job.status !== 'receipted') {
    throw new Error('Artifact not ready for receipt');
  }
  if (job.status === 'receipted' && job.receipt_id) return job;

  const receipt = mintReceipt({
    action_id: job.action_id,
    summary: `Browser Runtime artifact (${job.artifact.kind}) for job ${job.job_id}`,
    evidence: [
      { kind: 'job_id', value: job.job_id },
      { kind: 'url', value: job.context?.url ?? '' },
      { kind: 'artifact_kind', value: job.artifact.kind },
      { kind: 'survives_tab_change', value: 'true' },
      { kind: 'executionClaimed', value: 'false' },
    ],
  });

  return save({ ...job, receipt_id: receipt.receipt_id, status: 'receipted' }, ownerId);
}

/** Seed demo job matching DEMOS.md §4 — compare insurers' excess. */
export function seedInsurerCompareJob(ownerId: string): BrowserRuntimeJob {
  return createBrowserRuntimeJob({
    title: 'Compare three insurers’ excess',
    objective:
      'Compare excess figures across three insurer pages as a persistent DO job that survives tab changes; finish with a note artifact.',
    model_placeholder: 'model-neutral · proposer TBD',
  }, ownerId);
}
