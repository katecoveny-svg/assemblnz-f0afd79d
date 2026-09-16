/**
 * DO Browser Runtime — persistent jobs above browser chrome.
 *
 * Extends browser-seat capture; does not invent a second extension.
 * Jobs survive tab changes via DO store (not browser memory alone).
 * No Firefox Smart Window / Mozilla embed claims.
 *
 * @see docs/do-action-cloud/DO_BROWSER_RUNTIME.md
 * @see docs/do-templates/DO-BROWSER-SEAT.md
 */

import { z } from 'zod';

import {
  executeUnderPermit,
  issuePermit,
  mintReceipt,
  prepareAction,
  stubId,
} from '@/lib/do/action-stub';

export const BROWSER_RUNTIME_BOUNDARY =
  'DO Browser Runtime prototype · persistent jobs in DO Wait-style store. Not a page-summarising sidebar. Not Firefox Smart Window. Capture is consented read-only; actions produce artifacts under Permit. executionClaimed=false until Action Core.';

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
  /** Survives tab changes — stored in DO, not only the tab. */
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

export const browserRuntimeContextInput = z
  .object({
    job_id: z.string().trim().min(8).max(80),
    url: z.string().url().max(2000),
    title: z.string().trim().min(1).max(200),
    pageText: z.string().trim().min(1).max(12_000),
    tabId: z.number().int().positive().optional(),
    consent: z.literal(true),
  })
  .strict();

export type BrowserRuntimeCreateInput = z.infer<typeof browserRuntimeCreateInput>;
export type BrowserRuntimeContextInput = z.infer<typeof browserRuntimeContextInput>;

type Store = Map<string, BrowserRuntimeJob>;

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

export function listBrowserRuntimeJobs(): BrowserRuntimeJob[] {
  return [...jobs().values()].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

export function getBrowserRuntimeJob(job_id: string): BrowserRuntimeJob | undefined {
  return jobs().get(job_id);
}

function save(job: BrowserRuntimeJob): BrowserRuntimeJob {
  const next = { ...job, updated_at: new Date().toISOString() };
  jobs().set(next.job_id, next);
  return next;
}

export function createBrowserRuntimeJob(input: BrowserRuntimeCreateInput): BrowserRuntimeJob {
  const parsed = browserRuntimeCreateInput.parse(input);
  const now = new Date().toISOString();
  const job: BrowserRuntimeJob = {
    job_id: stubId('brj'),
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
  jobs().set(job.job_id, job);
  return job;
}

export function lockBrowserRuntimeContext(input: BrowserRuntimeContextInput): BrowserRuntimeJob {
  const parsed = browserRuntimeContextInput.parse(input);
  const job = jobs().get(parsed.job_id);
  if (!job) throw new Error(`Unknown job: ${parsed.job_id}`);

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
    context,
    status: 'context_locked',
  });
}

/** Propose next step from locked context — deterministic stub, not an LLM call. */
export function proposeBrowserRuntimeNextStep(job_id: string): BrowserRuntimeJob {
  const job = jobs().get(job_id);
  if (!job) throw new Error(`Unknown job: ${job_id}`);
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

  return save({ ...job, proposal, status: 'proposed' });
}

export function requestBrowserRuntimePermit(job_id: string): BrowserRuntimeJob {
  const job = jobs().get(job_id);
  if (!job?.proposal || !job.context) {
    throw new Error('Proposal + context required before permit');
  }

  const prepared = prepareAction({
    action_name: 'browser.produce_artifact',
    namespace: 'demo.browser_runtime',
    title: `Produce ${job.proposal.artifact_kind} artifact`,
    args: {
      job_id: job.job_id,
      artifact_kind: job.proposal.artifact_kind,
      url: job.context.url,
      args_preview: job.context.pageTextPreview.slice(0, 120),
    },
    idempotency_key: `browser-runtime:${job.job_id}:prepare`,
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
    status: 'permit_pending',
  });
}

export function approveBrowserRuntimePermit(job_id: string): BrowserRuntimeJob {
  const job = jobs().get(job_id);
  if (!job?.permit_id) throw new Error('No permit');
  if (job.status !== 'permit_pending') throw new Error('Permit not pending');
  return save({ ...job, status: 'permitted' });
}

export function produceBrowserRuntimeArtifact(job_id: string): BrowserRuntimeJob {
  const job = jobs().get(job_id);
  if (!job?.proposal || !job.context || !job.permit_id || !job.prep_id) {
    throw new Error('Permit + proposal required');
  }
  if (job.status !== 'permitted') throw new Error('Approve permit before producing artifact');

  const executed = executeUnderPermit({
    permit_id: job.permit_id,
    prep_id: job.prep_id,
    idempotency_key: `browser-runtime:${job.job_id}:execute`,
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
  });
}

export function mintBrowserRuntimeReceipt(job_id: string): BrowserRuntimeJob {
  const job = jobs().get(job_id);
  if (!job?.action_id || !job.artifact) throw new Error('Artifact required before receipt');

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

  return save({ ...job, receipt_id: receipt.receipt_id, status: 'receipted' });
}

/** Seed demo job matching DEMOS.md §4 — compare insurers' excess. */
export function seedInsurerCompareJob(): BrowserRuntimeJob {
  return createBrowserRuntimeJob({
    title: 'Compare three insurers’ excess',
    objective:
      'Compare excess figures across three insurer pages as a persistent DO job that survives tab changes; finish with a note artifact.',
    model_placeholder: 'model-neutral · proposer TBD',
  });
}
