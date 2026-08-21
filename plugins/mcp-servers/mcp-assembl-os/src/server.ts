import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { currentMcpAccessToken } from './request-context.js';

const TaskSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  priority: z.string(),
  risk: z.string().nullable(),
  assignedAgent: z.string().nullable(),
  updatedAt: z.string(),
});

const TaskDetailSchema = z.object({
  task: z.object({
    id: z.string(), tenant: z.string(), title: z.string(), description: z.string().nullable(),
    initiatedBy: z.string(), assignedAgent: z.string().nullable(), status: z.string(), priority: z.string(),
    risk: z.string().nullable(), linked: z.record(z.string(), z.unknown()),
    plan: z.record(z.string(), z.unknown()).nullable(), actionRequestId: z.string().nullable(),
    model: z.string().nullable(), outcome: z.string().nullable(), createdAt: z.string(), updatedAt: z.string(),
  }),
  events: z.array(z.object({
    id: z.string(), kind: z.string(), detail: z.record(z.string(), z.unknown()), at: z.string(),
  })),
});

const EvidenceSchema = z.object({
  id: z.string(), tenant: z.string(), taskId: z.string().nullable(), kind: z.string(), summary: z.string(),
  refs: z.record(z.string(), z.unknown()), approvedBy: z.string().nullable(), createdAt: z.string(),
});

type BridgeResult<T> = { ok: true; data: T } | { ok: false; error: string; issues?: unknown; requiredPermission?: string };

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function writesEnabled(): boolean {
  return process.env.ASSEMBL_MCP_WRITES_ENABLED === 'true';
}

async function callBridge<T>(operation: string, input: Record<string, unknown>): Promise<T> {
  const baseUrl = requireEnv('ASSEMBL_BASE_URL').replace(/\/$/, '');
  const token = currentMcpAccessToken();

  const response = await fetch(`${baseUrl}/api/mcp-bridge`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ operation, input }),
    signal: AbortSignal.timeout(15_000),
  });

  const result = (await response.json()) as BridgeResult<T>;
  if (!response.ok || !result.ok) {
    if (!result.ok && result.requiredPermission) {
      throw new Error(`${result.error}: requires ${result.requiredPermission}`);
    }
    const reason = result.ok ? `HTTP ${response.status}` : result.error;
    throw new Error(reason);
  }
  return result.data;
}

function textResult(message: string, structuredContent: Record<string, unknown>) {
  return { content: [{ type: 'text' as const, text: message }], structuredContent };
}

function errorResult(error: unknown) {
  return {
    isError: true,
    content: [{ type: 'text' as const, text: error instanceof Error ? error.message : 'Assembl MCP tool failed.' }],
  };
}

export function createAssemblMcpServer(): McpServer {
  const server = new McpServer(
    { name: 'assembl-os', version: '0.2.0' },
    {
      instructions:
        'Assembl MCP exposes the authenticated user’s permitted workspace work and proof. Workspace identity and permissions are resolved server-side from the OAuth bearer token. Read tools never change state. Write tools create only proposed internal work or pending approval requests; they do not send, publish, spend, delete, or directly mutate external systems.',
    },
  );

  server.registerTool(
    'list_work',
    {
      title: 'List Assembl work',
      description: 'Use this when the user wants to see current or recent work items in their authorised Assembl workspace.',
      inputSchema: z.object({ limit: z.number().int().min(1).max(50).default(20) }),
      outputSchema: z.object({ workspace: z.string(), tasks: z.array(TaskSummarySchema) }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ limit }) => {
      try {
        const data = await callBridge<{ workspace: string; tasks: z.infer<typeof TaskSummarySchema>[] }>('list_work', { limit });
        return textResult(`Found ${data.tasks.length} Assembl work item${data.tasks.length === 1 ? '' : 's'} in ${data.workspace}.`, data);
      } catch (error) { return errorResult(error); }
    },
  );

  server.registerTool(
    'get_work_item',
    {
      title: 'Inspect an Assembl work item',
      description: 'Use this when the user wants the details, plan, current state or activity history for one known Assembl work item.',
      inputSchema: z.object({ taskId: z.string().uuid() }),
      outputSchema: TaskDetailSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ taskId }) => {
      try {
        const data = await callBridge<z.infer<typeof TaskDetailSchema>>('get_work_item', { taskId });
        return textResult(`Work item ${data.task.title} is ${data.task.status}.`, data);
      } catch (error) { return errorResult(error); }
    },
  );

  server.registerTool(
    'read_proof',
    {
      title: 'Read Assembl proof',
      description: 'Use this when the user wants evidence showing what an Assembl agent did, which model or approval was involved, or proof attached to a work item. Omit taskId for recent workspace proof.',
      inputSchema: z.object({ taskId: z.string().uuid().optional(), limit: z.number().int().min(1).max(50).default(20) }),
      outputSchema: z.object({ evidence: z.array(EvidenceSchema) }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    },
    async ({ taskId, limit }) => {
      try {
        const data = await callBridge<{ evidence: z.infer<typeof EvidenceSchema>[] }>('read_proof', { taskId, limit });
        return textResult(`Found ${data.evidence.length} proof record${data.evidence.length === 1 ? '' : 's'}.`, data);
      } catch (error) { return errorResult(error); }
    },
  );

  server.registerTool(
    'create_work_item',
    {
      title: 'Create proposed Assembl work',
      description: 'Use this when the user explicitly asks to create or queue a new internal Assembl work item. This creates a proposed task only; it does not contact anyone or change an external system.',
      inputSchema: z.object({
        title: z.string().min(1).max(200), description: z.string().max(2000).optional(),
        priority: z.enum(['low', 'normal', 'high']).default('normal'),
      }),
      outputSchema: z.object({ taskId: z.string(), status: z.literal('proposed') }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false, idempotentHint: false },
    },
    async ({ title, description, priority }) => {
      if (!writesEnabled()) return errorResult(new Error('Assembl MCP writes are disabled in this deployment.'));
      try {
        const data = await callBridge<{ taskId: string; status: 'proposed' }>('create_work_item', { title, description, priority });
        return textResult(`Created proposed work item ${data.taskId}. Nothing external was changed.`, data);
      } catch (error) { return errorResult(error); }
    },
  );

  server.registerTool(
    'request_action_approval',
    {
      title: 'Request approval for an email draft',
      description: 'Use this when the user explicitly wants an email draft placed into the Assembl approval queue. This tool never sends the email. A human must review it before any dispatch can occur.',
      inputSchema: z.object({
        taskId: z.string().uuid().optional(), to: z.string().email().optional(), subject: z.string().min(1).max(200),
        body: z.string().min(1).max(5000), reason: z.string().min(1).max(1000),
      }),
      outputSchema: z.object({ actionRequestId: z.string(), taskId: z.string().nullable(), status: z.literal('pending') }),
      annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false, idempotentHint: false },
    },
    async ({ taskId, to, subject, body, reason }) => {
      if (!writesEnabled()) return errorResult(new Error('Assembl MCP writes are disabled in this deployment.'));
      try {
        const data = await callBridge<{ actionRequestId: string; taskId: string | null; status: 'pending' }>(
          'request_action_approval', { taskId, to, subject, body, reason },
        );
        return textResult(`Approval request ${data.actionRequestId} is pending. The email has not been sent.`, data);
      } catch (error) { return errorResult(error); }
    },
  );

  return server;
}
