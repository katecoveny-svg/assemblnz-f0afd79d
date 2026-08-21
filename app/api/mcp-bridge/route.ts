import { z } from 'zod';
import { createActionRequest } from '@/lib/agents/action-requests';
import { authenticateMcpRequest, hasMcpPermission, type McpPermission } from '@/lib/mcp/auth';
import { addEvidence, listEvidenceForTask, listRecentEvidence } from '@/lib/os/evidence';
import { createTask, getTask, listTasks, updateTaskFields } from '@/lib/os/tasks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const baseSchema = z.object({
  operation: z.enum([
    'list_work',
    'get_work_item',
    'read_proof',
    'create_work_item',
    'request_action_approval',
  ]),
  input: z.record(z.string(), z.unknown()).default({}),
});

const listWorkSchema = z.object({
  limit: z.number().int().min(1).max(50).default(20),
});

const getWorkSchema = z.object({ taskId: z.string().uuid() });

const readProofSchema = z.object({
  taskId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

const createWorkSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
});

const requestApprovalSchema = z.object({
  taskId: z.string().uuid().optional(),
  to: z.string().email().optional(),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  reason: z.string().min(1).max(1000),
});

const REQUIRED_PERMISSION: Record<z.infer<typeof baseSchema>['operation'], McpPermission> = {
  list_work: 'work.read',
  get_work_item: 'work.read',
  read_proof: 'proof.read',
  create_work_item: 'work.create',
  request_action_approval: 'approval.request',
};

function json(status: number, body: unknown): Response {
  return Response.json(body, { status });
}

function writesEnabled(): boolean {
  return process.env.ASSEMBL_MCP_WRITES_ENABLED === 'true';
}

async function requireTenantTask(taskId: string, tenant: string) {
  const detail = await getTask(taskId);
  if (!detail || detail.task.tenant !== tenant) return null;
  return detail;
}

export async function POST(request: Request): Promise<Response> {
  const auth = await authenticateMcpRequest(request);
  if (!auth.ok) return json(auth.status, { ok: false, error: auth.error });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json(400, { ok: false, error: 'invalid_json' });
  }

  const parsed = baseSchema.safeParse(raw);
  if (!parsed.success) {
    return json(400, { ok: false, error: 'invalid_request', issues: parsed.error.issues });
  }

  const { operation, input } = parsed.data;
  const principal = auth.principal;
  const requiredPermission = REQUIRED_PERMISSION[operation];
  if (!hasMcpPermission(principal, requiredPermission)) {
    return json(403, { ok: false, error: 'mcp_permission_denied', requiredPermission });
  }

  if ((operation === 'create_work_item' || operation === 'request_action_approval') && !writesEnabled()) {
    return json(403, { ok: false, error: 'mcp_writes_disabled' });
  }

  const tenant = principal.tenant;
  const actor = principal.actor;
  const initiatedBy = `mcp:${principal.userId}`;
  const auditRefs = {
    source: 'mcp',
    actor,
    userId: principal.userId,
    clientId: principal.clientId,
    authMode: principal.authMode,
  };

  try {
    switch (operation) {
      case 'list_work': {
        const args = listWorkSchema.parse(input);
        const tasks = await listTasks(tenant, args.limit);
        return json(200, {
          ok: true,
          data: {
            workspace: tenant,
            tasks: tasks.map((task) => ({
              id: task.id,
              title: task.title,
              status: task.status,
              priority: task.priority,
              risk: task.risk,
              assignedAgent: task.assignedAgent,
              updatedAt: task.updatedAt,
            })),
          },
        });
      }

      case 'get_work_item': {
        const args = getWorkSchema.parse(input);
        const detail = await requireTenantTask(args.taskId, tenant);
        if (!detail) return json(404, { ok: false, error: 'work_item_not_found' });
        return json(200, { ok: true, data: detail });
      }

      case 'read_proof': {
        const args = readProofSchema.parse(input);
        if (args.taskId) {
          const detail = await requireTenantTask(args.taskId, tenant);
          if (!detail) return json(404, { ok: false, error: 'work_item_not_found' });
          const evidence = await listEvidenceForTask(args.taskId);
          return json(200, { ok: true, data: { evidence } });
        }
        const evidence = await listRecentEvidence(tenant, args.limit);
        return json(200, { ok: true, data: { evidence } });
      }

      case 'create_work_item': {
        const args = createWorkSchema.parse(input);
        const taskId = await createTask({
          tenant,
          title: args.title,
          description: args.description,
          initiatedBy,
          priority: args.priority,
          status: 'proposed',
          linked: { ...auditRefs },
        });
        if (!taskId) return json(503, { ok: false, error: 'work_item_unavailable' });
        await addEvidence({
          tenant,
          taskId,
          kind: 'note',
          summary: `Work item created through the Assembl MCP by ${actor}`,
          refs: auditRefs,
        });
        return json(200, { ok: true, data: { taskId, status: 'proposed' } });
      }

      case 'request_action_approval': {
        const args = requestApprovalSchema.parse(input);
        if (args.taskId) {
          const detail = await requireTenantTask(args.taskId, tenant);
          if (!detail) return json(404, { ok: false, error: 'work_item_not_found' });
        }

        const requestRow = await createActionRequest({
          agentSlug: 'chief',
          requestedBy: `mcp:${tenant}:${principal.userId}`,
          kind: 'email_draft',
          payload: {
            to: args.to,
            subject: args.subject,
            body: args.body,
            reason: args.reason,
          },
        });
        if (!requestRow) return json(503, { ok: false, error: 'approval_request_unavailable' });

        if (args.taskId) await updateTaskFields(args.taskId, { actionRequestId: requestRow.id });
        await addEvidence({
          tenant,
          taskId: args.taskId,
          kind: 'draft',
          summary: `Approval requested for email draft: ${args.subject}`,
          refs: { ...auditRefs, actionRequestId: requestRow.id },
        });

        return json(200, {
          ok: true,
          data: {
            actionRequestId: requestRow.id,
            taskId: args.taskId ?? null,
            status: 'pending',
          },
        });
      }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json(400, { ok: false, error: 'invalid_input', issues: error.issues });
    }
    return json(500, { ok: false, error: 'bridge_error' });
  }
}
