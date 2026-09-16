import type { BuilderJob, BuilderJobStatus } from './builder';
import type { AgentStatus } from './types';

/**
 * Durable Builder/Office jobs reuse the existing do_workspaces / do_agents /
 * do_receipts / do_job_events schema. BuilderJob lives in do_agents.spec.
 *
 * Receipt honesty rule: plan creation / job acceptance must never mint a
 * build_succeeded or proved receipt. Those require real execution evidence.
 */

export const OFFICE_BUILDER_PRIMITIVE = 'build' as const;
export const OFFICE_BUILDER_SPEC_KIND = 'builder_job' as const;

export type DoReceiptKind =
  | 'note'
  | 'job_accepted'
  | 'handoff_prepared'
  | 'event'
  | 'needs_you'
  | 'build_succeeded'
  | 'proved';

export type DurableJobEventKind =
  | 'job_saved'
  | 'job_reopened'
  | 'status_changed'
  | 'handoff_prepared'
  | 'receipt_recorded';

export type DurableJobRecord = {
  id: string;
  ownerId: string;
  workspaceId: string;
  title: string;
  status: BuilderJobStatus;
  officeStatus: AgentStatus;
  job: BuilderJob;
  models: Array<{ id: string; provider?: string; label?: string; costPerMTokensNzd?: number }>;
  executionBoundary: string;
  createdAt: string;
  updatedAt: string;
};

export type DurableReceipt = {
  id: string;
  ownerId: string;
  workspaceId: string;
  jobId: string | null;
  kind: DoReceiptKind;
  title: string;
  summary: string;
  evidence: Record<string, unknown>;
  idempotencyKey: string | null;
  createdAt: string;
};

export type DurableJobEvent = {
  id: string;
  ownerId: string;
  workspaceId: string;
  jobId: string | null;
  eventId: string;
  kind: string;
  detail: Record<string, unknown>;
  createdAt: string;
  replayed?: boolean;
};

export type SaveDurableBuilderJobInput = {
  ownerId: string;
  job: BuilderJob;
  models?: DurableJobRecord['models'];
  executionBoundary: string;
  /** Client idempotency key for the save/accept event + acceptance receipt. */
  idempotencyKey?: string;
  now?: string;
};

export type DurableJobDetail = {
  record: DurableJobRecord;
  receipts: DurableReceipt[];
  events: DurableJobEvent[];
};

const SUCCESS_RECEIPT_KINDS: ReadonlySet<DoReceiptKind> = new Set(['build_succeeded', 'proved']);

export function officeStatusForBuilder(status: BuilderJobStatus): AgentStatus {
  switch (status) {
    case 'needs_you':
      return 'needs_you';
    case 'proved':
    case 'ship_ready':
      return 'done';
    case 'planned':
    case 'ready':
    case 'working':
    default:
      return 'working';
  }
}

export function assertReceiptKindAllowed(
  kind: DoReceiptKind,
  context: { jobStatus: BuilderJobStatus; claimExecutionSuccess?: boolean },
): void {
  if (!SUCCESS_RECEIPT_KINDS.has(kind)) return;
  if (context.jobStatus === 'planned' || context.jobStatus === 'ready') {
    throw new Error('Cannot mint a successful build receipt for a planned job. Save accepts the plan only.');
  }
  if (!context.claimExecutionSuccess) {
    throw new Error('Successful build receipts require explicit execution evidence.');
  }
}

export function acceptanceReceiptForJob(
  job: BuilderJob,
  opts: { now?: string } = {},
): Pick<DurableReceipt, 'kind' | 'title' | 'summary' | 'evidence'> {
  assertReceiptKindAllowed('job_accepted', { jobStatus: job.status });
  return {
    kind: 'job_accepted',
    title: 'Builder job accepted',
    summary: 'Plan saved to your Office workspace. No build has started and no successful outcome is claimed.',
    evidence: {
      jobId: job.id,
      status: job.status,
      authority: job.authority,
      acceptedAt: opts.now ?? new Date().toISOString(),
      executionClaimed: false,
    },
  };
}

export function builderSpecPayload(input: {
  job: BuilderJob;
  models: DurableJobRecord['models'];
  executionBoundary: string;
}): Record<string, unknown> {
  return {
    kind: OFFICE_BUILDER_SPEC_KIND,
    builderJob: input.job,
    models: input.models,
    executionBoundary: input.executionBoundary,
  };
}

export function parseBuilderSpec(spec: unknown): {
  job: BuilderJob;
  models: DurableJobRecord['models'];
  executionBoundary: string;
} | null {
  if (!spec || typeof spec !== 'object') return null;
  const record = spec as Record<string, unknown>;
  if (record.kind !== OFFICE_BUILDER_SPEC_KIND) return null;
  const job = record.builderJob;
  if (!job || typeof job !== 'object') return null;
  const builderJob = job as BuilderJob;
  if (typeof builderJob.id !== 'string' || typeof builderJob.objective !== 'string') return null;
  return {
    job: builderJob,
    models: Array.isArray(record.models) ? (record.models as DurableJobRecord['models']) : [],
    executionBoundary:
      typeof record.executionBoundary === 'string'
        ? record.executionBoundary
        : 'Plan only. No repository changes are authorised.',
  };
}

/** In-memory owner-scoped repository used by unit tests and local fail-soft fallbacks. */
export class MemoryOfficeJobsRepo {
  private workspaces = new Map<string, { id: string; ownerId: string; name: string; kind: 'personal' | 'work' | 'client' }>();
  private jobs = new Map<string, DurableJobRecord>();
  private receipts = new Map<string, DurableReceipt>();
  private events = new Map<string, DurableJobEvent>();

  clear() {
    this.workspaces.clear();
    this.jobs.clear();
    this.receipts.clear();
    this.events.clear();
  }

  async ensurePersonalWorkspace(ownerId: string, now = new Date().toISOString()): Promise<string> {
    for (const workspace of this.workspaces.values()) {
      if (workspace.ownerId === ownerId && workspace.kind === 'personal') return workspace.id;
    }
    const id = crypto.randomUUID();
    this.workspaces.set(id, { id, ownerId, name: 'My DOs', kind: 'personal' });
    void now;
    return id;
  }

  async saveBuilderJob(input: SaveDurableBuilderJobInput): Promise<DurableJobDetail> {
    const now = input.now ?? new Date().toISOString();
    const workspaceId = await this.ensurePersonalWorkspace(input.ownerId, now);
    const existing = this.jobs.get(input.job.id);
    if (existing && existing.ownerId !== input.ownerId) {
      throw new Error('Job belongs to another owner.');
    }

    const record: DurableJobRecord = {
      id: input.job.id,
      ownerId: input.ownerId,
      workspaceId: existing?.workspaceId ?? workspaceId,
      title: input.job.title,
      status: input.job.status,
      officeStatus: officeStatusForBuilder(input.job.status),
      job: input.job,
      models: input.models ?? existing?.models ?? [],
      executionBoundary: input.executionBoundary,
      createdAt: existing?.createdAt ?? input.job.createdAt ?? now,
      updatedAt: now,
    };
    this.jobs.set(record.id, record);

    const eventKey = input.idempotencyKey ?? `job-saved:${record.id}:${now}`;
    const event = await this.recordEvent({
      ownerId: input.ownerId,
      workspaceId: record.workspaceId,
      jobId: record.id,
      eventId: eventKey,
      kind: 'job_saved',
      detail: {
        status: record.status,
        authority: record.job.authority,
        title: record.title,
      },
      now,
    });

    const receiptDraft = acceptanceReceiptForJob(input.job, { now });
    await this.recordReceipt({
      ownerId: input.ownerId,
      workspaceId: record.workspaceId,
      jobId: record.id,
      kind: receiptDraft.kind,
      title: receiptDraft.title,
      summary: receiptDraft.summary,
      evidence: receiptDraft.evidence,
      idempotencyKey: `receipt:job_accepted:${event.eventId}`,
      now,
      jobStatus: input.job.status,
    });

    const detail = await this.getJobDetail(input.ownerId, record.id);
    if (!detail) throw new Error('Saved job could not be reloaded.');
    if (event.replayed) {
      detail.events = detail.events.map((entry) => (
        entry.eventId === event.eventId ? { ...entry, replayed: true } : entry
      ));
    }
    return detail;
  }

  async listBuilderJobs(ownerId: string): Promise<DurableJobRecord[]> {
    return [...this.jobs.values()]
      .filter((job) => job.ownerId === ownerId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getJobDetail(ownerId: string, jobId: string): Promise<DurableJobDetail | null> {
    const record = this.jobs.get(jobId);
    if (!record || record.ownerId !== ownerId) return null;
    const receipts = [...this.receipts.values()]
      .filter((receipt) => receipt.ownerId === ownerId && receipt.jobId === jobId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const events = [...this.events.values()]
      .filter((event) => event.ownerId === ownerId && event.jobId === jobId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { record, receipts, events };
  }

  async recordEvent(input: {
    ownerId: string;
    workspaceId: string;
    jobId: string | null;
    eventId: string;
    kind: string;
    detail?: Record<string, unknown>;
    now?: string;
  }): Promise<DurableJobEvent> {
    const key = `${input.ownerId}:${input.eventId}`;
    const existing = this.events.get(key);
    if (existing) return { ...existing, replayed: true };

    if (input.jobId) {
      const job = this.jobs.get(input.jobId);
      if (!job || job.ownerId !== input.ownerId) throw new Error('Job not found for owner.');
    }

    const event: DurableJobEvent = {
      id: crypto.randomUUID(),
      ownerId: input.ownerId,
      workspaceId: input.workspaceId,
      jobId: input.jobId,
      eventId: input.eventId,
      kind: input.kind,
      detail: input.detail ?? {},
      createdAt: input.now ?? new Date().toISOString(),
      replayed: false,
    };
    this.events.set(key, event);
    return event;
  }

  async recordReceipt(input: {
    ownerId: string;
    workspaceId: string;
    jobId: string | null;
    kind: DoReceiptKind;
    title: string;
    summary: string;
    evidence?: Record<string, unknown>;
    idempotencyKey?: string;
    now?: string;
    jobStatus: BuilderJobStatus;
    claimExecutionSuccess?: boolean;
  }): Promise<DurableReceipt> {
    assertReceiptKindAllowed(input.kind, {
      jobStatus: input.jobStatus,
      claimExecutionSuccess: input.claimExecutionSuccess,
    });

    if (input.idempotencyKey) {
      for (const receipt of this.receipts.values()) {
        if (receipt.ownerId === input.ownerId && receipt.idempotencyKey === input.idempotencyKey) {
          return receipt;
        }
      }
    }

    if (input.jobId) {
      const job = this.jobs.get(input.jobId);
      if (!job || job.ownerId !== input.ownerId) throw new Error('Job not found for owner.');
    }

    const receipt: DurableReceipt = {
      id: crypto.randomUUID(),
      ownerId: input.ownerId,
      workspaceId: input.workspaceId,
      jobId: input.jobId,
      kind: input.kind,
      title: input.title,
      summary: input.summary,
      evidence: input.evidence ?? {},
      idempotencyKey: input.idempotencyKey ?? null,
      createdAt: input.now ?? new Date().toISOString(),
    };
    this.receipts.set(receipt.id, receipt);
    return receipt;
  }

  /** Test helper: attempt to read another owner's job (must fail closed). */
  peekRawJob(jobId: string): DurableJobRecord | undefined {
    return this.jobs.get(jobId);
  }
}
