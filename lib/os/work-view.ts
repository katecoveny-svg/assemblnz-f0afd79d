/**
 * Work & Proof view builder — turns os_tasks/os_evidence rows into the
 * calm, serialisable shape the ops console renders. Times are formatted
 * server-side (NZ) so client components can never hydration-mismatch,
 * and statuses become human words — never state-machine jargon.
 */
import 'server-only';
import { listEvidenceForTask, listRecentEvidence } from './evidence';
import { getTask, listTasks } from './tasks';
import type { TaskStatus } from './policy';

const whenFormat = new Intl.DateTimeFormat('en-NZ', {
  timeZone: 'Pacific/Auckland',
  day: 'numeric',
  month: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

/** Human words for each state — canon: never expose implementation. */
export const STATUS_LABELS: Record<TaskStatus, string> = {
  proposed: 'new',
  awaiting_context: 'needs a detail',
  awaiting_approval: 'waiting for your yes',
  ready: 'ready to go',
  running: 'in motion',
  blocked: 'stuck — needs you',
  completed: 'done · proven',
  failed: 'didn’t work — will retry',
  cancelled: 'set aside',
  requires_review: 'have a look',
};

export type WorkEventView = { kind: string; summary: string; when: string };
export type WorkEvidenceView = {
  kind: string;
  summary: string;
  approvedBy: string | null;
  when: string;
};

export type WorkTaskView = {
  id: string;
  title: string;
  statusLabel: string;
  status: TaskStatus;
  agent: string | null;
  risk: string | null;
  model: string | null;
  description: string | null;
  outcome: string | null;
  when: string;
  events: WorkEventView[];
  evidence: WorkEvidenceView[];
};

export type WorkView = {
  tasks: WorkTaskView[];
  proof: Array<WorkEvidenceView & { taskId: string | null }>;
};

function eventSummary(kind: string, detail: Record<string, unknown>): string {
  if (kind === 'status' && typeof detail.to === 'string') {
    const to = detail.to as TaskStatus;
    return STATUS_LABELS[to] ?? String(detail.to);
  }
  if (kind === 'created') return 'task opened';
  if (kind === 'plan') {
    const ids = Array.isArray(detail.groundedFactIds) ? detail.groundedFactIds.length : 0;
    return ids > 0 ? `grounded in ${ids} confirmed genome fact${ids === 1 ? '' : 's'}` : 'plan recorded';
  }
  if (kind === 'error') return 'something needed a second look';
  return kind;
}

/** The Work & Proof screen's data: recent tasks (with the newest few carrying
 *  their full activity + evidence) and the tenant's proof ledger. */
export async function loadWorkView(tenant: string, taskLimit = 12, detailLimit = 6): Promise<WorkView> {
  const [tasks, proof] = await Promise.all([
    listTasks(tenant, taskLimit),
    listRecentEvidence(tenant, 14),
  ]);

  const detailed = await Promise.all(
    tasks.slice(0, detailLimit).map(async (t) => {
      const [detail, evidence] = await Promise.all([getTask(t.id), listEvidenceForTask(t.id)]);
      return { id: t.id, events: detail?.events ?? [], evidence };
    }),
  );
  const detailById = new Map(detailed.map((d) => [d.id, d]));

  return {
    tasks: tasks.map((t) => {
      const d = detailById.get(t.id);
      return {
        id: t.id,
        title: t.title,
        status: t.status,
        statusLabel: STATUS_LABELS[t.status],
        agent: t.assignedAgent,
        risk: t.risk,
        model: t.model,
        description: t.description,
        outcome: t.outcome,
        when: whenFormat.format(new Date(t.createdAt)),
        events: (d?.events ?? []).map((e) => ({
          kind: e.kind,
          summary: eventSummary(e.kind, e.detail),
          when: whenFormat.format(new Date(e.at)),
        })),
        evidence: (d?.evidence ?? []).map((e) => ({
          kind: e.kind,
          summary: e.summary,
          approvedBy: e.approvedBy,
          when: whenFormat.format(new Date(e.createdAt)),
        })),
      };
    }),
    proof: proof.map((e) => ({
      kind: e.kind,
      summary: e.summary,
      approvedBy: e.approvedBy,
      when: whenFormat.format(new Date(e.createdAt)),
      taskId: e.taskId,
    })),
  };
}
