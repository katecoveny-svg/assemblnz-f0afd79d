/**
 * Agent action requests — the first real action path.
 *
 * Chat tools call createActionRequest() to propose a business action (an
 * email draft, a webhook post). The row lands 'pending'; /admin/approvals is
 * the human gate. Approval records the decision; actual DISPATCH additionally
 * requires ACTION_DISPATCH_ENABLED=true in the environment, so turning real
 * sending on is a deliberate operator step, never a side effect of a deploy.
 *
 * Fail-safe posture matches the rest of the runtime: a storage failure never
 * breaks chat — the tool reports it couldn't file the request and the agent
 * says so honestly.
 */
import 'server-only';
import { getServiceClient } from '@/lib/supabase/service';
import { writeActionReceipt } from '@/lib/agents/receipts';
import { runConnectorAction, pipedreamConfigured } from '@/lib/connectors/pipedream';

export type ActionKind = 'email_draft' | 'webhook' | 'connector_action';
export type ActionStatus = 'pending' | 'approved' | 'dispatched' | 'rejected' | 'failed';

export type EmailDraftPayload = {
  to?: string;
  subject: string;
  body: string;
  reason: string;
};

export type WebhookPayload = {
  url: string;
  payload: Record<string, unknown>;
  reason: string;
};

/** A business action to run against the customer's OWN connected account. */
export type ConnectorActionPayload = {
  action: 'create_lead' | 'add_sheet_row';
  app: string; // e.g. 'google_sheets', 'hubspot'
  /** connected-account owner — convention `tenant:<slug>`, set at connect time */
  externalUserId: string;
  data: Record<string, unknown>;
  reason: string;
};

export type ActionRequestRow = {
  id: string;
  agent_slug: string;
  requested_by: string;
  kind: ActionKind;
  payload: EmailDraftPayload | WebhookPayload | ConnectorActionPayload;
  status: ActionStatus;
  reviewer: string | null;
  review_note: string | null;
  decided_at: string | null;
  dispatch_result: Record<string, unknown> | null;
  created_at: string;
};

export function dispatchEnabled(): boolean {
  return process.env.ACTION_DISPATCH_ENABLED === 'true';
}

export async function createActionRequest(input: {
  agentSlug: string;
  requestedBy: string;
  kind: ActionKind;
  payload: EmailDraftPayload | WebhookPayload | ConnectorActionPayload;
}): Promise<{ id: string } | null> {
  try {
    const sb = getServiceClient();
    const { data, error } = await sb
      .from('agent_action_requests')
      .insert({
        agent_slug: input.agentSlug,
        requested_by: input.requestedBy,
        kind: input.kind,
        payload: input.payload,
      })
      .select('id')
      .single();
    if (error || !data) return null;
    writeActionReceipt({
      agent: input.agentSlug,
      action: input.kind,
      requestId: data.id,
      stage: 'requested',
      reviewer: null,
    });
    return { id: data.id };
  } catch {
    return null;
  }
}

export async function listActionRequests(status?: ActionStatus | 'all'): Promise<ActionRequestRow[]> {
  try {
    const sb = getServiceClient();
    let q = sb
      .from('agent_action_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (status && status !== 'all') q = q.eq('status', status);
    const { data, error } = await q;
    if (error) return [];
    return (data ?? []) as ActionRequestRow[];
  } catch {
    return [];
  }
}

export async function countPendingActions(): Promise<number> {
  try {
    const sb = getServiceClient();
    const { count } = await sb
      .from('agent_action_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');
    return count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Record the operator's decision. On approval with dispatch enabled, the
 * action is actually carried out and the row moves to 'dispatched' (or
 * 'failed'); with dispatch disabled (the default) it rests at 'approved' —
 * the human yes is on file, nothing has left the building.
 */
export async function decideActionRequest(
  id: string,
  decision: 'approved' | 'rejected',
  reviewer: string,
  note?: string,
): Promise<void> {
  const sb = getServiceClient();
  const { data: row } = await sb
    .from('agent_action_requests')
    .select('*')
    .eq('id', id)
    .eq('status', 'pending')
    .maybeSingle();
  if (!row) return;

  await sb
    .from('agent_action_requests')
    .update({
      status: decision,
      reviewer,
      review_note: note || null,
      decided_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  writeActionReceipt({
    agent: row.agent_slug,
    action: row.kind,
    requestId: id,
    stage: decision,
    reviewer,
  });

  if (decision === 'approved' && dispatchEnabled()) {
    await dispatchAction(row as ActionRequestRow, reviewer);
  }
}

/**
 * Carry out an approved action. Webhooks POST to the requested https URL;
 * email drafts send through Brevo to the draft's recipient. Only reachable
 * when an operator has approved AND ACTION_DISPATCH_ENABLED=true.
 */
async function dispatchAction(row: ActionRequestRow, reviewer: string): Promise<void> {
  const sb = getServiceClient();
  let result: Record<string, unknown>;
  let ok = false;

  try {
    if (row.kind === 'connector_action') {
      const p = row.payload as ConnectorActionPayload;
      if (!pipedreamConfigured()) {
        throw new Error('connector layer not configured (PIPEDREAM_* env missing) — see docs/PIPEDREAM-CONNECT-SETUP.md');
      }
      const run = await runConnectorAction({
        externalUserId: p.externalUserId,
        action: p.action,
        app: p.app,
        data: p.data,
      });
      ok = run.ok;
      result = run.detail;
    } else if (row.kind === 'webhook') {
      const p = row.payload as WebhookPayload;
      const url = new URL(p.url);
      // https only, and never into private/loopback space.
      const blockedHost = /^(localhost|127\.|10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|0\.|\[::1\])/i;
      if (url.protocol !== 'https:' || blockedHost.test(url.hostname)) {
        throw new Error('webhook target must be a public https URL');
      }
      const res = await fetch(p.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Assembl-Action': row.id },
        body: JSON.stringify({ reason: p.reason, payload: p.payload, approved_by: reviewer }),
        signal: AbortSignal.timeout(10_000),
      });
      ok = res.ok;
      result = { http_status: res.status };
    } else {
      const p = row.payload as EmailDraftPayload;
      const key = process.env.BREVO_API_KEY;
      if (!key) throw new Error('BREVO_API_KEY not configured');
      if (!p.to) throw new Error('email draft has no recipient');
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: { name: 'assembl', email: 'assembl@assembl.co.nz' },
          to: [{ email: p.to }],
          subject: p.subject,
          textContent: `${p.body}\n\n— drafted by an assembl agent, reviewed and approved by ${reviewer}`,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      ok = res.ok;
      result = { http_status: res.status };
    }
  } catch (e) {
    result = { error: e instanceof Error ? e.message : 'unknown' };
  }

  await sb
    .from('agent_action_requests')
    .update({
      status: ok ? 'dispatched' : 'failed',
      dispatch_result: result,
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.id);

  writeActionReceipt({
    agent: row.agent_slug,
    action: row.kind,
    requestId: row.id,
    stage: ok ? 'dispatched' : 'failed',
    reviewer,
  });
}
