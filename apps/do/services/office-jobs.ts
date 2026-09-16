import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { BuilderJob } from '@/apps/do/shared/builder';
import {
  OFFICE_BUILDER_PRIMITIVE,
  MemoryOfficeJobsRepo,
  acceptanceReceiptForJob,
  assertReceiptKindAllowed,
  builderSpecPayload,
  officeStatusForBuilder,
  parseBuilderSpec,
  type DoReceiptKind,
  type DurableJobDetail,
  type DurableJobEvent,
  type DurableJobRecord,
  type DurableReceipt,
  type SaveDurableBuilderJobInput,
} from '@/apps/do/shared/office-jobs';

/**
 * Owner-scoped durable Builder/Office jobs.
 * Uses authenticated Supabase client so RLS (owner_id = auth.uid()) is the boundary.
 * Falls back to an in-process memory repo only when the Office tables are unavailable
 * (local/dev without migration). Memory is not shared across instances.
 */

const globalStore = globalThis as typeof globalThis & {
  assemblOfficeJobsMemory?: MemoryOfficeJobsRepo;
};

function memoryRepo(): MemoryOfficeJobsRepo {
  return (globalStore.assemblOfficeJobsMemory ??= new MemoryOfficeJobsRepo());
}

type AgentRow = {
  id: string;
  owner_id: string;
  workspace_id: string;
  name: string;
  status: string;
  spec: unknown;
  created_at: string;
  updated_at: string;
};

type ReceiptRow = {
  id: string;
  owner_id: string;
  workspace_id: string;
  do_agent_id: string | null;
  kind: string;
  title: string;
  summary: string;
  evidence: Record<string, unknown> | null;
  idempotency_key: string | null;
  created_at: string;
};

type EventRow = {
  id: string;
  owner_id: string;
  workspace_id: string;
  do_agent_id: string | null;
  event_id: string;
  kind: string;
  detail: Record<string, unknown> | null;
  created_at: string;
};

function rowToRecord(row: AgentRow): DurableJobRecord | null {
  const parsed = parseBuilderSpec(row.spec);
  if (!parsed) return null;
  return {
    id: row.id,
    ownerId: row.owner_id,
    workspaceId: row.workspace_id,
    title: row.name,
    status: parsed.job.status,
    officeStatus: officeStatusForBuilder(parsed.job.status),
    job: { ...parsed.job, id: row.id },
    models: parsed.models,
    executionBoundary: parsed.executionBoundary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function receiptFromRow(row: ReceiptRow): DurableReceipt {
  return {
    id: row.id,
    ownerId: row.owner_id,
    workspaceId: row.workspace_id,
    jobId: row.do_agent_id,
    kind: row.kind as DoReceiptKind,
    title: row.title,
    summary: row.summary,
    evidence: row.evidence ?? {},
    idempotencyKey: row.idempotency_key,
    createdAt: row.created_at,
  };
}

function eventFromRow(row: EventRow, replayed = false): DurableJobEvent {
  return {
    id: row.id,
    ownerId: row.owner_id,
    workspaceId: row.workspace_id,
    jobId: row.do_agent_id,
    eventId: row.event_id,
    kind: row.kind,
    detail: row.detail ?? {},
    createdAt: row.created_at,
    replayed,
  };
}

async function db() {
  return createClient();
}

async function ensurePersonalWorkspace(ownerId: string): Promise<string> {
  const supabase = await db();
  const { data: existing } = await supabase
    .from('do_workspaces')
    .select('id')
    .eq('owner_id', ownerId)
    .eq('kind', 'personal')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (existing?.id) return existing.id as string;

  const { data, error } = await supabase
    .from('do_workspaces')
    .insert({ owner_id: ownerId, name: 'My DOs', kind: 'personal' })
    .select('id')
    .single();
  if (error || !data?.id) throw error ?? new Error('Could not create Office workspace.');
  return data.id as string;
}

async function useMemoryFallback(error: unknown): Promise<boolean> {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return /do_workspaces|do_agents|do_receipts|do_job_events|schema cache|does not exist|Could not find the table/i.test(message)
    || message.includes('Missing NEXT_PUBLIC_SUPABASE');
}

export async function saveOwnerBuilderJob(input: SaveDurableBuilderJobInput): Promise<DurableJobDetail> {
  try {
    const supabase = await db();
    const now = input.now ?? new Date().toISOString();
    const workspaceId = await ensurePersonalWorkspace(input.ownerId);
    const officeStatus = officeStatusForBuilder(input.job.status);
    const spec = builderSpecPayload({
      job: { ...input.job, id: input.job.id },
      models: input.models ?? [],
      executionBoundary: input.executionBoundary,
    });

    const { data: existing } = await supabase
      .from('do_agents')
      .select('id, owner_id, workspace_id, created_at')
      .eq('id', input.job.id)
      .maybeSingle();

    if (existing && existing.owner_id !== input.ownerId) {
      throw new Error('Job belongs to another owner.');
    }

    const payload = {
      id: input.job.id,
      owner_id: input.ownerId,
      workspace_id: existing?.workspace_id ?? workspaceId,
      name: input.job.title.slice(0, 120),
      primitive: OFFICE_BUILDER_PRIMITIVE,
      status: officeStatus,
      spec,
      updated_at: now,
    };

    const { data: row, error } = existing
      ? await supabase.from('do_agents').update(payload).eq('id', input.job.id).eq('owner_id', input.ownerId).select('*').single()
      : await supabase.from('do_agents').insert({ ...payload, created_at: input.job.createdAt || now }).select('*').single();

    if (error || !row) throw error ?? new Error('Could not save Builder job.');

    const eventId = input.idempotencyKey ?? `job-saved:${input.job.id}:${now}`;
    const savedEvent = await recordOwnerJobEvent({
      ownerId: input.ownerId,
      workspaceId: row.workspace_id as string,
      jobId: row.id as string,
      eventId,
      kind: 'job_saved',
      detail: { status: input.job.status, authority: input.job.authority, title: input.job.title },
      now,
    });

    const draft = acceptanceReceiptForJob(input.job, { now });
    await recordOwnerReceipt({
      ownerId: input.ownerId,
      workspaceId: row.workspace_id as string,
      jobId: row.id as string,
      kind: draft.kind,
      title: draft.title,
      summary: draft.summary,
      evidence: draft.evidence,
      idempotencyKey: `receipt:job_accepted:${eventId}`,
      now,
      jobStatus: input.job.status,
    });

    const detail = await getOwnerBuilderJob(input.ownerId, row.id as string);
    if (!detail) throw new Error('Saved job could not be reloaded.');
    if (savedEvent.replayed) {
      detail.events = detail.events.map((entry) => (
        entry.eventId === savedEvent.eventId ? { ...entry, replayed: true } : entry
      ));
    }
    return detail;
  } catch (error) {
    if (await useMemoryFallback(error)) {
      return memoryRepo().saveBuilderJob(input);
    }
    throw error;
  }
}

export async function listOwnerBuilderJobs(ownerId: string): Promise<DurableJobRecord[]> {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('do_agents')
      .select('id, owner_id, workspace_id, name, status, spec, created_at, updated_at')
      .eq('owner_id', ownerId)
      .eq('primitive', OFFICE_BUILDER_PRIMITIVE)
      .order('updated_at', { ascending: false })
      .limit(40);
    if (error) throw error;
    return (data as AgentRow[] | null)?.map(rowToRecord).filter((row): row is DurableJobRecord => Boolean(row)) ?? [];
  } catch (error) {
    if (await useMemoryFallback(error)) {
      return memoryRepo().listBuilderJobs(ownerId);
    }
    throw error;
  }
}

export async function getOwnerBuilderJob(ownerId: string, jobId: string): Promise<DurableJobDetail | null> {
  try {
    const supabase = await db();
    const { data, error } = await supabase
      .from('do_agents')
      .select('id, owner_id, workspace_id, name, status, spec, created_at, updated_at')
      .eq('id', jobId)
      .eq('owner_id', ownerId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const record = rowToRecord(data as AgentRow);
    if (!record) return null;

    const [{ data: receipts }, { data: events }] = await Promise.all([
      supabase
        .from('do_receipts')
        .select('id, owner_id, workspace_id, do_agent_id, kind, title, summary, evidence, idempotency_key, created_at')
        .eq('owner_id', ownerId)
        .eq('do_agent_id', jobId)
        .order('created_at', { ascending: false })
        .limit(40),
      supabase
        .from('do_job_events')
        .select('id, owner_id, workspace_id, do_agent_id, event_id, kind, detail, created_at')
        .eq('owner_id', ownerId)
        .eq('do_agent_id', jobId)
        .order('created_at', { ascending: false })
        .limit(80),
    ]);

    return {
      record,
      receipts: ((receipts as ReceiptRow[] | null) ?? []).map(receiptFromRow),
      events: ((events as EventRow[] | null) ?? []).map((row) => eventFromRow(row)),
    };
  } catch (error) {
    if (await useMemoryFallback(error)) {
      return memoryRepo().getJobDetail(ownerId, jobId);
    }
    throw error;
  }
}

export async function recordOwnerJobEvent(input: {
  ownerId: string;
  workspaceId: string;
  jobId: string | null;
  eventId: string;
  kind: string;
  detail?: Record<string, unknown>;
  now?: string;
}): Promise<DurableJobEvent> {
  try {
    const supabase = await db();
    const { data: existing } = await supabase
      .from('do_job_events')
      .select('id, owner_id, workspace_id, do_agent_id, event_id, kind, detail, created_at')
      .eq('owner_id', input.ownerId)
      .eq('event_id', input.eventId)
      .maybeSingle();
    if (existing) return eventFromRow(existing as EventRow, true);

    const { data, error } = await supabase
      .from('do_job_events')
      .insert({
        owner_id: input.ownerId,
        workspace_id: input.workspaceId,
        do_agent_id: input.jobId,
        event_id: input.eventId,
        kind: input.kind.slice(0, 64),
        detail: input.detail ?? {},
        created_at: input.now ?? new Date().toISOString(),
      })
      .select('id, owner_id, workspace_id, do_agent_id, event_id, kind, detail, created_at')
      .single();
    if (error || !data) throw error ?? new Error('Could not record job event.');
    return eventFromRow(data as EventRow, false);
  } catch (error) {
    if (await useMemoryFallback(error)) {
      return memoryRepo().recordEvent(input);
    }
    throw error;
  }
}

export async function recordOwnerReceipt(input: {
  ownerId: string;
  workspaceId: string;
  jobId: string | null;
  kind: DoReceiptKind;
  title: string;
  summary: string;
  evidence?: Record<string, unknown>;
  idempotencyKey?: string;
  now?: string;
  jobStatus: BuilderJob['status'];
  claimExecutionSuccess?: boolean;
}): Promise<DurableReceipt> {
  assertReceiptKindAllowed(input.kind, {
    jobStatus: input.jobStatus,
    claimExecutionSuccess: input.claimExecutionSuccess,
  });

  try {
    const supabase = await db();
    if (input.idempotencyKey) {
      const { data: existing } = await supabase
        .from('do_receipts')
        .select('id, owner_id, workspace_id, do_agent_id, kind, title, summary, evidence, idempotency_key, created_at')
        .eq('owner_id', input.ownerId)
        .eq('idempotency_key', input.idempotencyKey)
        .maybeSingle();
      if (existing) return receiptFromRow(existing as ReceiptRow);
    }

    const { data, error } = await supabase
      .from('do_receipts')
      .insert({
        owner_id: input.ownerId,
        workspace_id: input.workspaceId,
        do_agent_id: input.jobId,
        kind: input.kind,
        title: input.title.slice(0, 200),
        summary: input.summary.slice(0, 2000),
        evidence: input.evidence ?? {},
        idempotency_key: input.idempotencyKey ?? null,
        created_at: input.now ?? new Date().toISOString(),
      })
      .select('id, owner_id, workspace_id, do_agent_id, kind, title, summary, evidence, idempotency_key, created_at')
      .single();
    if (error || !data) throw error ?? new Error('Could not record receipt.');
    return receiptFromRow(data as ReceiptRow);
  } catch (error) {
    if (await useMemoryFallback(error)) {
      return memoryRepo().recordReceipt(input);
    }
    throw error;
  }
}

/** Test-only access to the process memory fallback. */
export function __officeJobsMemoryForTests(): MemoryOfficeJobsRepo {
  return memoryRepo();
}
