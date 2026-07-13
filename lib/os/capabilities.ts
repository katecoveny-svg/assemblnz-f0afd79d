/**
 * Capability registry — agents request capabilities, never vendors.
 *
 * (docs/AGENTIC-OS-ARCHITECTURE.md §B.3, brief §7.) An agent asks for
 * `send_customer_email`; the registry answers how that resolves TODAY,
 * honestly: through the approval-gated action-request path, or not at all
 * ('not_connected' — the connector catalogue in lib/marketplace/
 * agent-connectors.ts is UI-truth and nothing there is live yet).
 * No capability ever resolves to a direct external side effect.
 *
 * Pure logic — no I/O — so the resolver is unit-testable and safe in any
 * bundle.
 */
import { classifyActionRisk, requiresApproval, type RiskLevel } from './policy';

/** How a capability actually executes today. */
export type CapabilityResolution =
  | 'action_request' // files an agent_action_requests row; operator approves; dispatch env-gated
  | 'internal' // writes internal OS records only (tasks, evidence, suggestions)
  | 'not_connected'; // declared, but no live integration resolves it yet

export type Capability = {
  key: string;
  description: string;
  /** The action kind fed to classifyActionRisk — one risk source of truth. */
  actionKind: string;
  resolution: CapabilityResolution;
  /** The action-request kind used when resolution is 'action_request'. */
  requestKind?: 'email_draft' | 'webhook' | 'connector_action';
};

export const CAPABILITIES: readonly Capability[] = [
  {
    key: 'send_customer_email',
    description: 'Draft an email to a customer; a named operator approves every send.',
    actionKind: 'send_customer_email',
    resolution: 'action_request',
    requestKind: 'email_draft',
  },
  {
    key: 'post_webhook',
    description: 'Propose a webhook call to an external system.',
    actionKind: 'webhook',
    resolution: 'action_request',
    requestKind: 'webhook',
  },
  {
    key: 'update_customer_record',
    description: 'Propose a change to a connected CRM record.',
    actionKind: 'connector_action',
    resolution: 'action_request',
    requestKind: 'connector_action',
  },
  {
    key: 'create_task',
    description: 'Open a task in the operating system.',
    actionKind: 'create_task',
    resolution: 'internal',
  },
  {
    key: 'suggest_genome_fact',
    description: 'Suggest a new business fact — never confirmed without a human.',
    actionKind: 'suggest_genome_fact',
    resolution: 'internal',
  },
  {
    key: 'read_genome',
    description: 'Read the Business Genome (commitments from confirmed facts only).',
    actionKind: 'read_genome',
    resolution: 'internal',
  },
  {
    key: 'search_knowledge',
    description: 'Search the business’s connected knowledge.',
    actionKind: 'search_knowledge',
    resolution: 'internal',
  },
  {
    key: 'create_calendar_event',
    description: 'Create a calendar event in a connected calendar.',
    actionKind: 'schedule_provisional_event',
    resolution: 'not_connected',
  },
  {
    key: 'retrieve_invoice',
    description: 'Fetch an invoice from connected accounting software.',
    actionKind: 'update_internal_record',
    resolution: 'not_connected',
  },
  {
    key: 'schedule_staff_member',
    description: 'Propose a roster change.',
    actionKind: 'update_internal_record',
    resolution: 'not_connected',
  },
] as const;

export type ResolvedCapability = Capability & {
  risk: RiskLevel;
  needsApproval: boolean;
  available: boolean;
};

/** Resolve one capability: metadata + risk + honest availability. Unknown
 *  capabilities resolve unavailable at HIGH risk — never a silent yes. */
export function resolveCapability(key: string, tenantAllowsMedium = false): ResolvedCapability {
  const cap =
    CAPABILITIES.find((c) => c.key === key.trim().toLowerCase()) ??
    ({
      key: key.trim().toLowerCase(),
      description: 'Unknown capability',
      actionKind: key,
      resolution: 'not_connected',
    } satisfies Capability);
  const risk = classifyActionRisk(cap.actionKind);
  return {
    ...cap,
    risk,
    needsApproval: requiresApproval(risk, tenantAllowsMedium),
    available: cap.resolution !== 'not_connected',
  };
}
