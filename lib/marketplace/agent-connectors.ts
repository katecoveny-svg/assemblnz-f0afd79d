/**
 * Connector abstraction — assembl uses a connector abstraction so agents can
 * request business actions without one bespoke API integration per app.
 *
 * This file is deliberately UI-truth only: it describes actions an agent can
 * be configured to request, and through which provider they would run. No
 * provider below is integrated yet — every action ships `needs_setup` or
 * `coming_soon`, and nothing may be marked `connected` until real plumbing
 * exists and has been verified. Every action that touches the outside world
 * requires human approval, matching the runtime's draft-mode contract.
 */

export type ToolConnectorProvider =
  | 'manual'
  | 'email'
  | 'webhook'
  | 'supabase'
  | 'pipedream_connect'
  | 'composio'
  | 'n8n'
  | 'zapier_embed'
  | 'make'
  | 'mcp'
  | 'custom';

export type AgentToolActionType =
  | 'send_email'
  | 'create_lead'
  | 'create_row'
  | 'book_calendar'
  | 'create_task'
  | 'send_sms'
  | 'handoff'
  | 'webhook'
  | 'mcp_tool';

export type AgentToolActionStatus = 'available' | 'connected' | 'needs_setup' | 'coming_soon';

export type AgentToolAction = {
  id: string;
  name: string;
  description: string;
  actionType: AgentToolActionType;
  provider: ToolConnectorProvider;
  status: AgentToolActionStatus;
  requiresHumanApproval: boolean;
};

/**
 * The action catalogue the Studio renders. Statuses are the honest state of
 * the platform today — configured with the assembl team during a pilot.
 */
export const TOOL_ACTION_CATALOGUE: AgentToolAction[] = [
  {
    id: 'send_email',
    name: 'send email',
    description: 'drafts the email; a named person approves before it sends.',
    actionType: 'send_email',
    provider: 'email',
    status: 'needs_setup',
    requiresHumanApproval: true,
  },
  {
    id: 'create_lead',
    name: 'create lead',
    description: 'captures a name, need and contact into your pipeline.',
    actionType: 'create_lead',
    provider: 'supabase',
    status: 'needs_setup',
    requiresHumanApproval: true,
  },
  {
    id: 'add_sheet_row',
    name: 'add to sheet',
    description: 'appends a row to a spreadsheet you choose.',
    actionType: 'create_row',
    provider: 'webhook',
    status: 'coming_soon',
    requiresHumanApproval: true,
  },
  {
    id: 'book_calendar',
    name: 'book calendar',
    description: 'proposes a time and holds it for your confirmation.',
    actionType: 'book_calendar',
    provider: 'webhook',
    status: 'coming_soon',
    requiresHumanApproval: true,
  },
  {
    id: 'create_task',
    name: 'create task',
    description: 'turns the conversation into a task with an owner and a date.',
    actionType: 'create_task',
    provider: 'supabase',
    status: 'needs_setup',
    requiresHumanApproval: true,
  },
  {
    id: 'send_sms',
    name: 'send SMS',
    description: 'drafts the text; approved before it leaves, usage costs visible.',
    actionType: 'send_sms',
    provider: 'manual',
    status: 'coming_soon',
    requiresHumanApproval: true,
  },
  {
    id: 'human_handoff',
    name: 'human handoff',
    description: 'summarises the conversation and hands it to a person.',
    actionType: 'handoff',
    provider: 'manual',
    status: 'available',
    requiresHumanApproval: false,
  },
  {
    id: 'webhook',
    name: 'webhook',
    description: 'posts a structured payload to an endpoint you control.',
    actionType: 'webhook',
    provider: 'webhook',
    status: 'needs_setup',
    requiresHumanApproval: true,
  },
  {
    id: 'connect_tools',
    name: 'connect business tools',
    description: 'one connector layer for the apps you already run — scoped per pilot.',
    actionType: 'mcp_tool',
    provider: 'mcp',
    status: 'coming_soon',
    requiresHumanApproval: true,
  },
];

export const TOOL_STATUS_LABELS: Record<AgentToolActionStatus, string> = {
  available: 'available',
  connected: 'connected',
  needs_setup: 'can be configured',
  coming_soon: 'coming soon',
};
