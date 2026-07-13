/**
 * Orchestrator — the intake step of the operating system.
 *
 * First vertical slice (docs/AGENTIC-OS-ARCHITECTURE.md §E): a new enquiry
 * becomes a task with visible execution states. The orchestrator classifies
 * the work, reads genome context (confirmed facts only for anything the
 * business could be held to), selects the model through the one provider
 * ladder, drafts the reply, files it through the existing human-approval
 * gate, and writes evidence for every step.
 *
 * Nothing here sends anything. The draft lands as a pending
 * agent_action_requests row exactly like every other proposed action —
 * dispatch stays behind the operator approval AND ACTION_DISPATCH_ENABLED.
 * Fail-soft throughout: the public enquiry flow must never break because
 * the OS layer is unavailable.
 */
import 'server-only';
import { generateWithFallback, resolveModelLadder } from '@/lib/ai/router';
import { createActionRequest } from '@/lib/agents/action-requests';
import {
  GENOME_TENANT,
  getGenomeFactsFor,
} from '@/lib/customers/auckland-dog-trainer/genome-store';
import type { GenomeFact } from '@/lib/customers/auckland-dog-trainer/genome';
import { deterministicDeskAnswer, rankGenomeFacts } from '@/lib/living-site/desk';
import { getInstall } from '@/lib/living-site/install-store';
import { SAMPLE_VERTICALS } from '@/lib/living-site/verticals';
import { OS_AGENTS } from './agents';
import { resolveCapability } from './capabilities';
import { addEvidence } from './evidence';
import { addTaskEvent, createTask, updateTaskFields, updateTaskStatus } from './tasks';

const DESK_AGENT = OS_AGENTS.desk.id;
const PRIMARY_MODEL = 'claude-sonnet-4-6';
const FALLBACKS = ['gemini-2.5-flash', 'groq:llama-3.3-70b-versatile', 'ollama:llama3.3'] as const;

type BusinessContext = {
  tenant: string;
  businessName: string;
  owner: string;
  facts: GenomeFact[];
};

/** Resolve who the enquiry is for: a sample vertical, an install, or the
 *  flagship. Null only when an install tenant's genome cannot be read. */
async function resolveBusiness(tenant: string | undefined): Promise<BusinessContext | null> {
  const t = tenant ?? GENOME_TENANT;
  const vertical = SAMPLE_VERTICALS.find((v) => v.tenant === t);
  if (vertical) {
    const { facts } = await getGenomeFactsFor(t, vertical.fallbackFacts);
    return { tenant: t, businessName: vertical.businessName, owner: vertical.owner, facts };
  }
  if (t.startsWith('install-')) {
    const install = await getInstall(t.slice('install-'.length));
    if (!install) return null;
    return {
      tenant: t,
      businessName: install.v.businessName,
      owner: install.v.owner,
      facts: install.facts,
    };
  }
  return null;
}

/** Facts an agent may ground commitments in: confirmed (or legacy rows,
 *  which predate provenance and were seeded/owner-written). */
function confirmedFacts(facts: GenomeFact[]): GenomeFact[] {
  return facts.filter((f) => f.verification === undefined || f.verification === 'confirmed');
}

function draftSystemPrompt(ctx: BusinessContext, grounding: GenomeFact[]): string {
  const factLines = grounding
    .map((f) => `- [${f.id}] ${f.label}: ${f.value}`)
    .join('\n');
  return [
    `You draft enquiry replies for ${ctx.businessName}. The owner is ${ctx.owner}.`,
    'Write a warm, plain-spoken reply to the enquiry below — never shouty, no jargon.',
    'You may ONLY state prices, availability, policies or commitments that appear in',
    'these confirmed Business Genome facts (cite fact ids in square brackets):',
    factLines || '- (no matching facts — say so honestly and ask a clarifying question)',
    '',
    'Rules:',
    `- This is a DRAFT for ${ctx.owner} to review. Never promise a booking, price`,
    '  or timeframe that is not in the facts above.',
    `- End with one short line noting ${ctx.owner} will confirm the details.`,
    '- 120 words or fewer. No subject line, no signature block.',
  ].join('\n');
}

export type IntakeInput = {
  tenant?: string;
  name: string;
  email: string;
  detail?: string;
  message: string;
};

export type IntakeResult = { taskId: string; status: string } | null;

/**
 * Enquiry → task → agent + model → genome-grounded draft → approval gate →
 * evidence. Returns the task id, or null when the OS layer is unavailable
 * (the enquiry itself has already been stored by the caller either way).
 */
export async function intakeEnquiry(input: IntakeInput): Promise<IntakeResult> {
  try {
    // The agent requests a capability, never a vendor — the registry
    // answers with the resolution path, risk and approval requirement.
    const capability = resolveCapability('send_customer_email');
    const risk = capability.risk;
    const plan = {
      steps: [
        'classify the enquiry',
        'read confirmed genome context',
        'draft a reply with the desk agent',
        'file the draft for approval — nothing sends without a yes',
        'record evidence',
      ],
      capability: capability.key,
      resolution: capability.resolution,
      risk,
    };

    const taskId = await createTask({
      tenant: input.tenant ?? GENOME_TENANT,
      title: `Reply to ${input.name}`,
      description: [input.detail, input.message].filter(Boolean).join(' — ').slice(0, 1000),
      initiatedBy: 'system:enquiry',
      assignedAgent: DESK_AGENT,
      risk,
      linked: { email: input.email, name: input.name, source: 'living-site-enquiry' },
      plan,
    });
    if (!taskId) return null;

    const ctx = await resolveBusiness(input.tenant);
    if (!ctx) {
      await updateTaskStatus(taskId, 'awaiting_context', { reason: 'unknown tenant' });
      return { taskId, status: 'awaiting_context' };
    }

    const grounded = confirmedFacts(ctx.facts);
    const ranked = rankGenomeFacts(`${input.detail ?? ''} ${input.message}`, grounded, 6);
    const grounding = ranked.length > 0 ? ranked : grounded.slice(0, 4);
    await addTaskEvent(taskId, 'plan', {
      agent: DESK_AGENT,
      groundedFactIds: grounding.map((f) => f.id),
    });

    // One provider abstraction for the whole OS: the router's ladder.
    const ladder = resolveModelLadder(PRIMARY_MODEL, FALLBACKS);
    const question = [
      `Enquiry from ${input.name}${input.detail ? ` (${input.detail})` : ''}:`,
      input.message,
    ].join('\n');

    let draft: string;
    let modelUsed: string;
    if (ladder.length > 0) {
      const result = await generateWithFallback({
        ladder,
        system: draftSystemPrompt(ctx, grounding),
        messages: [{ role: 'user', content: question }],
        agentSlug: DESK_AGENT,
      });
      if (result.ok) {
        draft = result.text;
        modelUsed = result.rung.id;
      } else {
        const det = deterministicDeskAnswer({
          question,
          facts: grounded,
          businessName: ctx.businessName,
          owner: ctx.owner,
        });
        draft = det.answer;
        modelUsed = 'deterministic';
      }
    } else {
      const det = deterministicDeskAnswer({
        question,
        facts: grounded,
        businessName: ctx.businessName,
        owner: ctx.owner,
      });
      draft = det.answer;
      modelUsed = 'deterministic';
    }

    await addEvidence({
      tenant: ctx.tenant,
      taskId,
      kind: 'model_call',
      summary: `Draft written by ${modelUsed} for the ${DESK_AGENT} agent`,
      refs: { model: modelUsed, groundedFactIds: grounding.map((f) => f.id) },
    });

    // The existing human gate: a pending action request. Dispatch stays
    // behind operator approval AND ACTION_DISPATCH_ENABLED.
    const request = await createActionRequest({
      agentSlug: DESK_AGENT,
      requestedBy: `system:enquiry:${ctx.tenant}`,
      kind: 'email_draft',
      payload: {
        to: input.email,
        subject: `Re: your enquiry to ${ctx.businessName}`,
        body: draft,
        reason: `New enquiry from ${input.name} — reply drafted from ${grounding.length} confirmed genome facts. ${ctx.owner} must approve before anything sends.`,
      },
    });

    await updateTaskFields(taskId, {
      model: modelUsed,
      ...(request ? { actionRequestId: request.id } : {}),
    });

    await addEvidence({
      tenant: ctx.tenant,
      taskId,
      kind: 'draft',
      summary: draft.slice(0, 400),
      refs: request ? { actionRequestId: request.id, risk } : { risk },
    });

    if (!request) {
      await updateTaskStatus(taskId, 'blocked', { reason: 'could not file the approval request' });
      return { taskId, status: 'blocked' };
    }

    const status = capability.needsApproval ? 'awaiting_approval' : 'ready';
    await updateTaskStatus(taskId, status, { actionRequestId: request.id });
    return { taskId, status };
  } catch {
    return null;
  }
}

/**
 * Close the loop when an operator decides the filed action: the task moves
 * through the state machine and the decision becomes evidence. Call after
 * decideActionRequest succeeds.
 */
export async function onActionDecided(input: {
  actionRequestId: string;
  decision: 'approved' | 'rejected';
  reviewer: string;
  tenant?: string;
}): Promise<void> {
  try {
    const { getServiceClient } = await import('@/lib/supabase/service');
    const supabase = getServiceClient();
    const { data } = await supabase
      .from('os_tasks')
      .select('id, tenant, status')
      .eq('action_request_id', input.actionRequestId)
      .limit(1);
    const task = data?.[0];
    if (!task) return;

    await addEvidence({
      tenant: task.tenant as string,
      taskId: task.id as string,
      kind: 'approval',
      summary:
        input.decision === 'approved'
          ? 'Draft approved by a named operator'
          : 'Draft rejected by a named operator',
      refs: { actionRequestId: input.actionRequestId, decision: input.decision },
      approvedBy: input.reviewer,
    });

    if (input.decision === 'approved') {
      // approved → ready → running → completed, each step on the record
      await updateTaskStatus(task.id as string, 'ready', { by: input.reviewer });
      await updateTaskStatus(task.id as string, 'running', { step: 'record outcome' });
      await updateTaskFields(task.id as string, {
        outcome: 'Reply approved. Sending stays gated by ACTION_DISPATCH_ENABLED.',
      });
      await updateTaskStatus(task.id as string, 'completed', { by: input.reviewer });
    } else {
      await updateTaskFields(task.id as string, { outcome: 'Draft rejected by the operator.' });
      await updateTaskStatus(task.id as string, 'cancelled', { by: input.reviewer });
    }
  } catch {
    /* fail-soft — the decision itself already succeeded */
  }
}
