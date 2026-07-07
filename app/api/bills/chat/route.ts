import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { ModelMessage } from 'ai';
import { resolveModelLadder, generateWithFallback } from '@/lib/ai/router';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import {
  providerPlans,
  savings,
  hiddenCosts,
  PROVIDER_PRICING_DISCLAIMER,
  CATEGORY_ORDER,
} from '@/lib/bills/data';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/bills/chat — the Assembl Bills advisor.
 *
 * Grounded in the NZ Provider DB + the savings/hidden-costs this household's
 * console already surfaced. Uses the existing Anthropic key via the shared
 * model ladder (no bespoke agent registration). DRAFT-MODE ONLY: the advisor
 * recommends and prepares; it never switches, cancels or pays. SPARK rule —
 * empower, don't replace.
 */
const BodySchema = z.object({
  message: z.string().trim().min(1).max(1000),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(4000) }))
    .max(16)
    .optional(),
});

function knowledgeBlock(): string {
  const byCat = CATEGORY_ORDER.map((cat) => {
    const plans = providerPlans.filter((p) => p.category === cat);
    if (!plans.length) return '';
    const lines = plans
      .map((p) => `- ${p.provider} · ${p.planName} — indicative ${p.indicativeMonthly}/mo — ${p.features.join('; ')}`)
      .join('\n');
    return `### ${cat}\n${lines}`;
  })
    .filter(Boolean)
    .join('\n\n');

  const found = savings
    .map((s) => `- ${s.category}: move from ${s.fromProvider} to ${s.toProvider} (${s.toPlan}) — ~$${s.annualSaving}/yr. Source: ${s.source}`)
    .join('\n');

  const hidden = hiddenCosts
    .map((h) => `- ${h.name}: ~$${h.annual}/yr — ${h.detail} Action: ${h.action}`)
    .join('\n');

  return `## NZ Provider list (indicative pricing — never quote as a live/exact rate)
${byCat}

## Savings this household's console already found
${found}

## Hidden costs already flagged
${hidden}`;
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }
  const { message } = parsed.data;
  const history = parsed.data.history ?? [];

  const system = `You are the Assembl Bills advisor — a calm, plain-English helper for New Zealand households and small businesses managing their bills (power, broadband, insurance, council rates, mobile, subscriptions).

## What you do
- Answer questions about switching, overpaying, hidden costs and savings, grounded ONLY in the provider list and findings below.
- Lead with the answer. Be warm, brief and specific. Use NZ spelling and context.
- When you name a cheaper option, give the indicative monthly figure AND say it must be confirmed on Powerswitch (powerswitch.org.nz, run by Consumer NZ) or the provider's own site.

## Format
- Write in plain, conversational text for a chat bubble. NO markdown: no "#" headings, no "**" bold, no tables. Keep to short paragraphs; if you list options, use simple "– " dashes. Keep the whole reply under ~140 words.

## Hard rules
- DRAFT-MODE ONLY. You never switch, cancel, refund or pay anything. You recommend and prepare; the household approves and acts. If someone asks you to "just switch it", explain that you'll queue it as a draft for them to approve — you don't act on their behalf.
- NEVER invent a specific live price, discount, or contract term that isn't in the list below. If you don't have it, say so and point to Powerswitch.
- Don't give regulated financial, tax, or legal advice. For KiwiSaver or mortgage specifics, suggest Sorted (sorted.org.nz) or a licensed adviser.
- End every answer with one line: "Sources: <comma-separated>" naming the providers and/or Powerswitch / Consumer NZ you relied on.

## Grounding
${knowledgeBlock()}

Note: ${PROVIDER_PRICING_DISCLAIMER}`;

  const ladder = resolveModelLadder(MODEL_TIER_TO_ANTHROPIC.mid, []);
  if (ladder.length === 0) {
    return NextResponse.json(
      { error: 'The advisor is offline (no model key configured). Set ANTHROPIC_API_KEY to enable it.' },
      { status: 503 },
    );
  }

  const messages: ModelMessage[] = [
    ...history.map((h) => ({ role: h.role, content: h.content }) as ModelMessage),
    { role: 'user', content: message } as ModelMessage,
  ];

  const result = await generateWithFallback({ ladder, system, messages, agentSlug: 'assembl-bills' });
  if (!result.ok) {
    return NextResponse.json({ error: 'The advisor could not answer just now — please try again.' }, { status: 502 });
  }

  // Surface a small set of source chips: any provider named in the reply, plus Powerswitch.
  const text = result.text;
  const named = new Set<string>();
  for (const p of providerPlans) {
    if (text.includes(p.provider)) named.add(p.provider);
  }
  const sources = ['Powerswitch (Consumer NZ)', ...Array.from(named).slice(0, 4)];

  return NextResponse.json({ response: text, sources });
}
