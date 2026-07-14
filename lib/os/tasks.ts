/**
 * Task store — the operating system's unit of work.
 *
 * Tables `os_tasks` + `os_task_events` (migration 20260722091000), RLS
 * deny-all, service-role only. Every state change is validated against the
 * state machine in lib/os/policy.ts and logged as an event. Fail-soft: when
 * the database or keys are unavailable every function returns null/[] so
 * callers degrade gracefully (the established store contract in this repo).
 */
import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import { canTransitionTask, isTaskStatus, type RiskLevel, type TaskStatus } from './policy';

export type OsTask = {
  id: string;
  tenant: string;
  title: string;
  description: string | null;
  initiatedBy: string;
  assignedAgent: string | null;
  status: TaskStatus;
  priority: string;
  risk: RiskLevel | null;
  linked: Record<string, unknown>;
  plan: Record<string, unknown> | null;
  actionRequestId: string | null;
  model: string | null;
  outcome: string | null;
  createdAt: string;
  updatedAt: string;
};

type TaskRow = {
  id: string;
  tenant: string;
  title: string;
  description: string | null;
  initiated_by: string;
  assigned_agent: string | null;
  status: string;
  priority: string;
  risk: string | null;
  linked: Record<string, unknown> | null;
  plan: Record<string, unknown> | null;
  action_request_id: string | null;
  model: string | null;
  outcome: string | null;
  created_at: string;
  updated_at: string;
};

const TASK_COLUMNS =
  'id, tenant, title, description, initiated_by, assigned_agent, status, priority, risk, linked, plan, action_request_id, model, outcome, created_at, updated_at';

function rowToTask(row: TaskRow): OsTask {
  return {
    id: row.id,
    tenant: row.tenant,
    title: row.title,
    description: row.description,
    initiatedBy: row.initiated_by,
    assignedAgent: row.assigned_agent,
    status: isTaskStatus(row.status) ? row.status : 'requires_review',
    priority: row.priority,
    risk: (row.risk as RiskLevel | null) ?? null,
    linked: row.linked ?? {},
    plan: row.plan ?? null,
    actionRequestId: row.action_request_id,
    model: row.model,
    outcome: row.outcome,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export type CreateTaskInput = {
  tenant: string;
  title: string;
  description?: string;
  initiatedBy: string;
  assignedAgent?: string;
  status?: TaskStatus;
  priority?: string;
  risk?: RiskLevel;
  linked?: Record<string, unknown>;
  plan?: Record<string, unknown>;
  model?: string;
};

/** Create a task. Returns the task id, or null when the DB is unavailable. */
export async function createTask(input: CreateTaskInput): Promise<string | null> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('os_tasks')
      .insert({
        tenant: input.tenant,
        title: input.title.slice(0, 200),
        description: input.description?.slice(0, 2000) ?? null,
        initiated_by: input.initiatedBy,
        assigned_agent: input.assignedAgent ?? null,
        status: input.status ?? 'proposed',
        priority: input.priority ?? 'normal',
        risk: input.risk ?? null,
        linked: input.linked ?? {},
        plan: input.plan ?? null,
        model: input.model ?? null,
      })
      .select('id')
      .single();
    if (error || !data) return null;
    await addTaskEvent(data.id as string, 'created', {
      initiatedBy: input.initiatedBy,
      status: input.status ?? 'proposed',
    });
    return data.id as string;
  } catch {
    return null;
  }
}

/** Append an activity-log event. Best-effort — never throws. */
export async function addTaskEvent(
  taskId: string,
  kind: string,
  detail: Record<string, unknown> = {},
): Promise<void> {
  try {
    const supabase = getServiceClient();
    await supabase.from('os_task_events').insert({ task_id: taskId, kind, detail });
  } catch {
    /* fail-soft */
  }
}

export type TransitionResult =
  | { ok: true }
  | { ok: false; reason: 'not_found' | 'illegal_transition' | 'unavailable' };

/**
 * Move a task through the state machine. Illegal transitions are refused
 * and logged, never silently applied.
 */
export async function updateTaskStatus(
  taskId: string,
  to: TaskStatus,
  detail: Record<string, unknown> = {},
): Promise<TransitionResult> {
  try {
    const supabase = getServiceClient();
    const { data: current, error: readError } = await supabase
      .from('os_tasks')
      .select('status')
      .eq('id', taskId)
      .single();
    if (readError || !current) return { ok: false, reason: 'not_found' };
    const from = current.status as string;
    if (!isTaskStatus(from) || !canTransitionTask(from, to)) {
      await addTaskEvent(taskId, 'error', { refusedTransition: { from, to } });
      return { ok: false, reason: 'illegal_transition' };
    }
    const { error } = await supabase
      .from('os_tasks')
      .update({ status: to, updated_at: new Date().toISOString() })
      .eq('id', taskId);
    if (error) return { ok: false, reason: 'unavailable' };
    await addTaskEvent(taskId, 'status', { from, to, ...detail });
    return { ok: true };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

/** Attach fields to a task (plan, agent, model, action request, outcome). */
export async function updateTaskFields(
  taskId: string,
  fields: Partial<{
    assignedAgent: string;
    plan: Record<string, unknown>;
    actionRequestId: string;
    model: string;
    agentVersion: string;
    outcome: string;
    risk: RiskLevel;
  }>,
): Promise<boolean> {
  try {
    const supabase = getServiceClient();
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (fields.assignedAgent !== undefined) patch.assigned_agent = fields.assignedAgent;
    if (fields.plan !== undefined) patch.plan = fields.plan;
    if (fields.actionRequestId !== undefined) patch.action_request_id = fields.actionRequestId;
    if (fields.model !== undefined) patch.model = fields.model;
    if (fields.agentVersion !== undefined) patch.agent_version = fields.agentVersion;
    if (fields.outcome !== undefined) patch.outcome = fields.outcome.slice(0, 2000);
    if (fields.risk !== undefined) patch.risk = fields.risk;
    let { error } = await supabase.from('os_tasks').update(patch).eq('id', taskId);
    if (error && fields.agentVersion !== undefined) {
      // agent_version column may be pending (migration 20260722097000) —
      // never let governance metadata block the task update.
      delete patch.agent_version;
      ({ error } = await supabase.from('os_tasks').update(patch).eq('id', taskId));
    }
    return !error;
  } catch {
    return false;
  }
}

/** Recent tasks for a tenant (Work surface). [] when unavailable. */
export async function listTasks(tenant: string, limit = 20): Promise<OsTask[]> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('os_tasks')
      .select(TASK_COLUMNS)
      .eq('tenant', tenant)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return [];
    return (data as TaskRow[]).map(rowToTask);
  } catch {
    return [];
  }
}

export type TaskEvent = { id: string; kind: string; detail: Record<string, unknown>; at: string };

/** One task + its activity log (task detail view). */
export async function getTask(
  taskId: string,
): Promise<{ task: OsTask; events: TaskEvent[] } | null> {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('os_tasks')
      .select(TASK_COLUMNS)
      .eq('id', taskId)
      .single();
    if (error || !data) return null;
    const { data: events } = await supabase
      .from('os_task_events')
      .select('id, kind, detail, at')
      .eq('task_id', taskId)
      .order('at', { ascending: true })
      .limit(100);
    return {
      task: rowToTask(data as TaskRow),
      events: (events ?? []).map((e) => ({
        id: String(e.id),
        kind: e.kind,
        detail: (e.detail ?? {}) as Record<string, unknown>,
        at: e.at,
      })),
    };
  } catch {
    return null;
  }
}
