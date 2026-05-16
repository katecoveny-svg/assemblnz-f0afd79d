import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { agentBySlug, agentChatId } from '@/lib/agents';
import { workflowById } from '@/lib/chat/workflows';
import { getKete } from '@/lib/kete';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type DemoRequest = {
  agentSlug?: string;
  workflowId?: string | null;
  message?: string;
};

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as DemoRequest;
  const agentSlug = String(body.agentSlug ?? '').trim();
  const message = String(body.message ?? '').trim();

  if (!agentSlug || !message) {
    return json({ error: 'Agent and message are required.' }, 400);
  }

  const agent = agentBySlug(agentSlug);
  if (!agent || agent.status !== 'live') {
    return json({ error: 'That agent is not available for live demo.' }, 404);
  }

  const kete = getKete(agent.kete);
  const workflow = workflowById(agent.kete, body.workflowId ?? null);
  const modelMessage = [
    'ASSEMBL PUBLIC AGENT DEMO',
    `Kete: ${kete.name} (${kete.slug})`,
    `Agent: ${agent.name} (${agentChatId(agent)})`,
    `Agent role: ${agent.role}`,
    `Agent expertise: ${agent.expertise ?? agent.oneLiner}`,
    `Relevant NZ legislation or standards: ${agent.legislation.join('; ')}`,
    workflow
      ? [
          '',
          'SELECTED WORKFLOW',
          `Workflow: ${workflow.title}`,
          `Outcome: ${workflow.outcome}`,
          `Client use: ${workflow.clientUse}`,
          `Agent sequence: ${workflow.agentSequence.join(' -> ')}`,
          `Named reviewer role: ${workflow.reviewerRole}`,
          `Evidence pack: ${workflow.evidencePack}`,
          `Citations to consider: ${workflow.citations.join('; ')}`,
        ].join('\n')
      : '',
    '',
    'Run the reply through assembl layers:',
    '1. Kahu: clarify intent, data sensitivity, missing facts, and risk.',
    '2. Iho: name the specialist path and any handoffs.',
    '3. Tā: produce the useful draft, checklist, comparison, or client note.',
    '4. Mahara: identify what should be remembered or watched.',
    '5. Mana: state the named human review gate before sending, filing, lodging, or relying on the output.',
    '',
    'Keep the answer demo-friendly: expert, concise, grounded in Aotearoa New Zealand, and clear about the evidence pack.',
    '',
    'Visitor message:',
    message,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return json({ error: 'Live agent demo is not configured on this deployment.' }, 500);
    }

    const service = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await service.functions.invoke<{
      response?: string;
      error?: string;
      agentUsed?: { code: string; name: string; pack: string; model: string };
      modelUsed?: string;
      complianceStatus?: unknown;
      tokensUsed?: unknown;
    }>('iho-router', {
      body: {
        message: modelMessage,
        agentId: agentChatId(agent),
        packId: kete.slug,
        mode: 'respond',
        modelHint: 'sonnet',
        context: {
          previousMessages: [],
          publicDemo: true,
          workflow: workflow
            ? {
                id: workflow.id,
                title: workflow.title,
                evidencePack: workflow.evidencePack,
                reviewerRole: workflow.reviewerRole,
              }
            : null,
        },
      },
    });

    if (error) {
      return json({ error: error.message || 'The live agent did not respond.' }, 502);
    }
    if (!data?.response || data.error) {
      return json({ error: data?.error || 'The live agent returned an empty response.' }, 502);
    }

    return json({
      response: data.response,
      agentUsed: data.agentUsed,
      modelUsed: data.modelUsed,
      complianceStatus: data.complianceStatus,
      tokensUsed: data.tokensUsed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown live agent error.';
    return json({ error: message }, 500);
  }
}
