import { NextResponse } from 'next/server';
import type { ModelMessage } from 'ai';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { generateWithFallback, resolveModelLadder } from '@/lib/ai/router';
import {
  genomeFactsWith,
  RIPPLE_SCENARIOS,
  type GenomeFact,
} from '@/lib/customers/auckland-dog-trainer/genome';
import { getLiveGenomeFacts } from '@/lib/customers/auckland-dog-trainer/genome-store';
import { consume, rateKey } from '@/lib/creative/ratelimit';
import { genomeFactsCitedInAnswer, rankGenomeFacts } from '@/lib/living-site/desk';
import { getProductionRelease } from '@/lib/os/agent-registry';
import { OS_AGENTS } from '@/lib/os/agents';

export const runtime = 'nodejs';
export const maxDuration = 45;

const PUBLIC_AGENT_IDS = ['desk', 'operations', 'knowledge'] as const;
type PublicAgentId = (typeof PUBLIC_AGENT_IDS)[number];

type DemoBody = {
  agent?: unknown;
  prompt?: unknown;
  scenarioId?: unknown;
};

function isPublicAgent(value: string): value is PublicAgentId {
  return PUBLIC_AGENT_IDS.includes(value as PublicAgentId);
}

function confirmedFacts(facts: GenomeFact[]): GenomeFact[] {
  return facts.filter((fact) => fact.verification === undefined || fact.verification === 'confirmed');
}

function groundingFor(
  agentId: PublicAgentId,
  prompt: string,
  facts: GenomeFact[],
  scenarioId: string,
): GenomeFact[] {
  const agent = OS_AGENTS[agentId];
  const allowed = facts.filter((fact) => agent.genomeDomains.includes(fact.section));
  const ranked = rankGenomeFacts(prompt, allowed, 6);
  const scenario = RIPPLE_SCENARIOS.find((item) => item.id === scenarioId);
  const changed = scenario ? allowed.find((fact) => fact.id === scenario.applies.factId) : undefined;
  const selected = ranked.length > 0 ? ranked : allowed.slice(0, 5);
  if (changed && !selected.some((fact) => fact.id === changed.id)) selected.unshift(changed);
  return selected.slice(0, 7);
}

function taskInstruction(agentId: PublicAgentId): string {
  if (agentId === 'desk') {
    return 'Prepare a concise customer reply. Make it unmistakably a draft and leave every price, booking and promise for Sam to confirm.';
  }
  if (agentId === 'operations') {
    return 'Prepare an operations review with: what the Genome allows, what is blocked, and the single decision Sam must make next. Do not confirm a booking or change a calendar.';
  }
  return 'Prepare a knowledge recommendation with: the proposed canonical answer, the source facts used, and what Sam still needs to verify. Never mark your own suggestion as confirmed.';
}

function systemPrompt(agentId: PublicAgentId, grounding: GenomeFact[]): string {
  const agent = OS_AGENTS[agentId];
  const facts = grounding
    .map((fact) => `- [${fact.id}] ${fact.label}: ${fact.value}`)
    .join('\n');
  return [
    `You are ${agent.name}, the ${agent.role.toLowerCase()} agent inside a public assembl Business Genome demonstration.`,
    'Harbourside Dog Training is fictional. Work only from the confirmed Business Genome facts below.',
    taskInstruction(agentId),
    '',
    'Rules:',
    '- Cite the supporting fact id after every factual claim, exactly like [g-booking-rules].',
    '- Never invent a service, price, availability, credential, outcome, policy or customer fact.',
    '- Never say that anything was sent, booked, published, charged or changed.',
    '- Keep the result below 180 words in warm, plain New Zealand English.',
    '- End with: “Approval: waiting for Sam.”',
    '',
    'CONFIRMED BUSINESS GENOME FACTS',
    facts || '- No relevant confirmed facts are available. Say what is missing.',
  ].join('\n');
}

function cite(fact: GenomeFact | undefined): string {
  return fact ? `[${fact.id}]` : '';
}

function deterministicDraft(
  agentId: PublicAgentId,
  grounding: GenomeFact[],
): string {
  const booking = grounding.find((fact) => fact.id === 'g-booking-rules');
  const safety = grounding.find((fact) => fact.id === 'g-policy-safety');
  const service = grounding.find((fact) => fact.section === 'services');
  const knowledge = grounding.find((fact) => fact.section === 'knowledge');

  if (agentId === 'desk') {
    return [
      'Draft reply',
      '',
      'Kia ora — thanks for checking before you book.',
      safety
        ? `Because a bite history is involved, the current safety rule is a private assessment first, not immediate group work. ${cite(safety)}`
        : 'The Business Genome does not contain enough confirmed safety detail to answer that yet.',
      service ? `The relevant service currently reads: ${service.value}. ${cite(service)}` : '',
      booking ? `Any preferred time remains a request until Sam checks the diary and confirms it. ${cite(booking)}` : '',
      '',
      'Approval: waiting for Sam.',
    ].filter(Boolean).join('\n');
  }

  if (agentId === 'operations') {
    return [
      'Prepared operations review',
      '',
      service ? `• Genome state: ${service.label} — ${service.value}. ${cite(service)}` : '• The service state needs a confirmed Genome fact.',
      booking ? `• Booking boundary: ${booking.value}. ${cite(booking)}` : '• Booking rules are missing, so the request stays blocked.',
      '• No calendar event, customer promise or payment has been created.',
      '',
      'Decision for Sam: confirm the service is ready and check capacity before approving any customer-facing change.',
      '',
      'Approval: waiting for Sam.',
    ].join('\n');
  }

  return [
    'Prepared knowledge recommendation',
    '',
    knowledge
      ? `Proposed canonical answer: ${knowledge.value}. ${cite(knowledge)}`
      : 'The Genome does not yet hold a confirmed answer, so this remains a question for Sam.',
    safety ? `Related safety boundary: ${safety.value}. ${cite(safety)}` : '',
    '',
    'Verification needed: Sam checks the wording and source before the answer becomes confirmed knowledge.',
    '',
    'Approval: waiting for Sam.',
  ].filter(Boolean).join('\n');
}

function hasOnlyValidCitations(text: string, grounding: GenomeFact[]): boolean {
  const ids = Array.from(text.matchAll(/\[([a-z0-9-]+)\]/gi), (match) => match[1].toLowerCase());
  if (ids.length === 0) return false;
  const allowed = new Set(grounding.map((fact) => fact.id.toLowerCase()));
  return ids.every((id) => allowed.has(id));
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as DemoBody | null;
  const agentId = typeof body?.agent === 'string' ? body.agent.trim() : '';
  const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
  const scenarioId = typeof body?.scenarioId === 'string' ? body.scenarioId.trim() : '';

  if (!isPublicAgent(agentId) || prompt.length < 8 || prompt.length > 1200) {
    return NextResponse.json(
      { error: 'Choose a demo agent and give it a task between 8 and 1,200 characters.' },
      { status: 400 },
    );
  }
  if (scenarioId && !RIPPLE_SCENARIOS.some((scenario) => scenario.id === scenarioId)) {
    return NextResponse.json({ error: 'Unknown Genome sandbox change.' }, { status: 400 });
  }

  const rate = await consume(rateKey(request), 'public-genome-demo');
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'The public demo limit has been reached. Try again in an hour.' },
      { status: 429 },
    );
  }

  const { facts: liveFacts, live } = await getLiveGenomeFacts();
  const facts = confirmedFacts(genomeFactsWith(scenarioId ? [scenarioId] : [], liveFacts));
  const grounding = groundingFor(agentId, prompt, facts, scenarioId);
  const agent = OS_AGENTS[agentId];
  const release = await getProductionRelease(agentId);
  const ladder = resolveModelLadder(MODEL_TIER_TO_ANTHROPIC[agent.modelTier], [
    'gemini-2.5-flash',
    'groq:llama-3.3-70b-versatile',
  ]);
  const messages: ModelMessage[] = [{ role: 'user', content: prompt }];
  const generated = await generateWithFallback({
    ladder,
    system: systemPrompt(agentId, grounding),
    messages,
    agentSlug: `public-genome-${agentId}`,
    tenant: 'auckland-dog-trainer',
  });

  const modelDraft = generated.ok && hasOnlyValidCitations(generated.text, grounding)
    ? generated.text
    : null;
  const draft = modelDraft ?? deterministicDraft(agentId, grounding);
  const cited = genomeFactsCitedInAnswer(draft, grounding);
  const sources = (cited.length > 0 ? cited : grounding).map((fact) => ({
    id: fact.id,
    label: fact.label,
    value: fact.value,
    section: fact.section,
  }));

  return NextResponse.json({
    agent: {
      id: agentId,
      name: agent.name,
      role: agent.role,
      version: release?.version ?? '1.0.0',
      responsibilities: agent.responsibilities,
    },
    draft,
    sources,
    mode: modelDraft ? 'live-model' : 'genome-rules',
    model: modelDraft && generated.ok ? generated.rung.id : 'deterministic',
    liveGenome: live,
    approval: {
      status: 'awaiting-review',
      reviewer: 'Sam',
      boundary: 'Nothing has been sent, booked, published, charged or written to customer data.',
    },
    remaining: rate.remaining,
  });
}
