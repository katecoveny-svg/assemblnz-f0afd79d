import { NextResponse } from 'next/server';
import type { ModelMessage } from 'ai';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { generateWithFallback, resolveModelLadder } from '@/lib/ai/router';
import { getGenomeFactsFor } from '@/lib/customers/auckland-dog-trainer/genome-store';
import { consume, rateKey } from '@/lib/creative/ratelimit';
import { deterministicDeskAnswer } from '@/lib/living-site/desk';
import { getInstall, INSTALL_TENANT_RE } from '@/lib/living-site/install-store';
import { SAMPLE_VERTICALS } from '@/lib/living-site/verticals';

export const runtime = 'nodejs';
export const maxDuration = 45;

async function resolveDesk(tenant: string) {
  const sample = SAMPLE_VERTICALS.find((item) => item.tenant === tenant);
  if (sample) {
    const { facts, live } = await getGenomeFactsFor(sample.tenant, sample.fallbackFacts);
    return { v: sample, facts, live };
  }
  if (INSTALL_TENANT_RE.test(tenant)) {
    const install = await getInstall(tenant.slice('install-'.length));
    if (install) return { v: install.v, facts: install.facts, live: true };
  }
  return null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { tenant?: unknown; question?: unknown } | null;
  const tenant = typeof body?.tenant === 'string' ? body.tenant.trim() : '';
  const question = typeof body?.question === 'string' ? body.question.trim() : '';
  if (!tenant || !question || question.length > 2000) {
    return NextResponse.json({ error: 'Tenant and a question of up to 2,000 characters are required.' }, { status: 400 });
  }

  const desk = await resolveDesk(tenant);
  if (!desk) return NextResponse.json({ error: 'Living Site desk not found.' }, { status: 404 });
  const rate = await consume(rateKey(request), 'living-site-desk');
  if (!rate.ok) return NextResponse.json({ error: 'Desk limit reached. Try again in an hour.' }, { status: 429 });

  const fallback = deterministicDeskAnswer({
    question,
    facts: desk.facts,
    businessName: desk.v.businessName,
    owner: desk.v.owner,
  });
  const factsText = desk.facts.map((fact) => `[${fact.id}] ${fact.section} · ${fact.label}: ${fact.value}`).join('\n');
  const ladder = resolveModelLadder(MODEL_TIER_TO_ANTHROPIC.mid, [
    'gemini-2.5-flash',
    'groq:llama-3.3-70b-versatile',
  ]);
  const system = `You are the resident voice and chat desk for ${desk.v.businessName}, a fictional ${desk.v.industryLabel} sample Living Site.

You answer only from the Business Genome below. Never invent a price, testimonial, availability, credential, outcome or policy. If the answer is missing, say so and offer to draft a question for ${desk.v.owner}.

You may explain how to request a time, but you never confirm a booking, take payment, send an email, publish content or commit the business. Every answer is a draft for ${desk.v.owner}'s review. Use warm, plain NZ English and keep the response concise.

BUSINESS GENOME (${desk.live ? 'live database' : 'sample fallback'}):
${factsText}`;
  const messages: ModelMessage[] = [{ role: 'user', content: question }];
  const generated = await generateWithFallback({
    ladder,
    system,
    messages,
    agentSlug: `living-site-${tenant}`,
  });
  const selected = fallback.facts.map((fact) => ({ id: fact.id, label: fact.label, section: fact.section }));
  if (!generated.ok) {
    return NextResponse.json({ answer: fallback.answer, sources: selected, mode: 'genome-rules' });
  }
  return NextResponse.json({
    answer: generated.text,
    sources: selected,
    mode: generated.rung.isPrimary ? 'primary-model' : 'fallback-model',
  });
}
