/**
 * Admin reply → send an agent email back to a customer.
 *
 * Token-gated (same stopgap pattern as /admin/leads). The token is checked
 * against AGENT_EMAIL_ADMIN_TOKEN, falling back to LEADS_VIEW_TOKEN so the
 * existing admin token keeps working.
 *
 * POST { threadId, body, subject? } with header x-admin-token.
 */
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/service';
import { sendAgentEmail } from '@/lib/agent-email/send';
import { marketplaceAgentBySlug } from '@/lib/marketplace/agents';

export const dynamic = 'force-dynamic';

function adminTokenOk(req: Request): boolean {
  const expected = process.env.AGENT_EMAIL_ADMIN_TOKEN || process.env.LEADS_VIEW_TOKEN || '';
  if (!expected) return false;
  const got = req.headers.get('x-admin-token') ?? '';
  return got === expected;
}

export async function POST(req: Request) {
  if (!adminTokenOk(req)) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 401 });
  }

  let payload: { threadId?: string; body?: string; subject?: string };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const threadId = payload.threadId?.trim();
  const body = payload.body?.trim();
  if (!threadId || !body) {
    return NextResponse.json({ error: 'threadId and body are required' }, { status: 400 });
  }

  const supabase = getServiceClient();
  const { data: thread, error } = await supabase
    .from('agent_email_threads')
    .select('id, agent_slug, customer_email, subject')
    .eq('id', threadId)
    .maybeSingle();

  if (error || !thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
  }

  const agent = marketplaceAgentBySlug(thread.agent_slug);
  const agentName = agent?.name ?? thread.agent_slug;
  const subject = payload.subject?.trim() || (thread.subject ? `Re: ${thread.subject}` : `Reply from ${agentName}`);

  const result = await sendAgentEmail({
    agentSlug: thread.agent_slug,
    agentName,
    toEmail: thread.customer_email,
    subject,
    body,
    threadId: thread.id,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true, from: result.agentEmail });
}
