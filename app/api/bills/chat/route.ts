import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { ModelMessage } from 'ai';
import { resolveModelLadder, generateWithFallback } from '@/lib/ai/router';
import { edgeLlm } from '@/lib/bills/llm';
import { MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { getServiceClient } from '@/lib/supabase/service';
import { getPriceBook, CATEGORY_LABEL } from '@/lib/bills/provider-prices';
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
 * POST /api/bills/chat — the assembl bills advisor.
 *
 * Grounded in the NZ Provider DB + the savings/hidden-costs this household's
 * console already surfaced. Uses the existing Anthropic key via the shared
 * model ladder (no bespoke agent registration). DRAFT-MODE ONLY: the advisor
 * recommends and prepares; it never switches, cancels or pays. SPARK rule —
 * empower, don't replace.
 */
const BodySchema = z.object({
  message: z.string().trim().min(1).max(1000),
  sessionId: z.string().trim().max(64).optional(),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(4000) }))
    .max(16)
    .optional(),
});

/** Live provider prices (from the scraped table) grouped for the prompt; falls
 *  back to the static list when the table is empty. */
async function livePricesBlock(): Promise<{ text: string; live: boolean }> {
  const book = await getPriceBook();
  if (book.live && book.plans.length) {
    const byCat = new Map<string, string[]>();
    for (const p of book.plans) {
      const line = `- ${p.provider} · ${p.planName} — ~$${p.monthlyCost ?? '?'}/mo (source ${p.sourceHost}, verified ${p.lastVerified.slice(0, 10)})`;
      const key = CATEGORY_LABEL[p.category] ?? p.category;
      byCat.set(key, [...(byCat.get(key) ?? []), line]);
    }
    const text = [...byCat.entries()].map(([cat, lines]) => `### ${cat}\n${lines.join('\n')}`).join('\n\n');
    return { text, live: true };
  }
  const byCat = CATEGORY_ORDER.map((cat) => {
    const plans = providerPlans.filter((p) => p.category === cat);
    if (!plans.length) return '';
    return `### ${cat}\n${plans.map((p) => `- ${p.provider} · ${p.planName} — indicative ${p.indicativeMonthly}/mo`).join('\n')}`;
  })
    .filter(Boolean)
    .join('\n\n');
  return { text: byCat, live: false };
}

/** The user's own bills, if any have been parsed this session (real spend). */
async function ingestedBillsBlock(sessionId?: string): Promise<string> {
  if (!sessionId) return '';
  try {
    const service = getServiceClient();
    const { data } = await service
      .from('assembl_bills_ingested')
      .select('provider, category, total_amount, due_date')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(12);
    if (!data || !data.length) return '';
    const lines = data
      .map((b) => `- ${b.provider ?? 'Unknown'} (${b.category ?? '?'}) — $${b.total_amount ?? '?'}${b.due_date ? `, due ${b.due_date}` : ''}`)
      .join('\n');
    return `\n\n## This user's own bills you have parsed (their ACTUAL current spend — use these to personalise)\n${lines}`;
  } catch {
    return '';
  }
}

function demoFindingsBlock(): string {
  const found = savings
    .map((s) => `- ${s.category}: move from ${s.fromProvider} to ${s.toProvider} (${s.toPlan}) — ~$${s.annualSaving}/yr. Source: ${s.source}`)
    .join('\n');

  const hidden = hiddenCosts
    .map((h) => `- ${h.name}: ~$${h.annual}/yr — ${h.detail} Action: ${h.action}`)
    .join('\n');

  return `## Savings this household's console already found
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

  const [prices, ownBills] = await Promise.all([
    livePricesBlock(),
    ingestedBillsBlock(parsed.data.sessionId),
  ]);

  const system = `You are the assembl bills advisor — a calm, plain-English helper for New Zealand households and small businesses managing their bills (power, broadband, insurance, council rates, mobile, subscriptions).

Current NZ market context: electricity prices are up ~12% year-on-year and council rates are rising ~15% across many regions (Consumer NZ). Only ~7% of households switched power last year (MBIE) — mostly because comparison is made too hard. Your job is to make the switch obvious and easy.

## What you do
- Answer questions about switching, overpaying, hidden costs and savings, grounded ONLY in the price book and findings below.
- If the user's OWN parsed bills are listed, use their actual spend: name their current provider + amount, then compare to the 3 cheapest alternatives in the same category from the price book, and give the yearly difference.
- Lead with the answer. Be warm, brief and specific. Use NZ spelling and context.
- When you name a cheaper option, give the monthly figure AND say it must be confirmed on Powerswitch (powerswitch.org.nz, run by Consumer NZ) or the provider's own site.

## Format
- Write in plain, conversational text for a chat bubble. NO markdown: no "#" headings, no "**" bold, no tables. Keep to short paragraphs; if you list options, use simple "– " dashes. Keep the whole reply under ~140 words.

## Hard rules
- DRAFT-MODE ONLY. You never switch, cancel, refund or pay anything. You recommend and prepare; the household approves and acts. If someone asks you to "just switch it", explain that you'll queue it as a draft for them to approve — you don't act on their behalf.
- NEVER invent a specific live price, discount, or contract term that isn't in the list below. If you don't have it, say so and point to Powerswitch.
- Don't give regulated financial, tax, or legal advice. For KiwiSaver or mortgage specifics, suggest Sorted (sorted.org.nz) or a licensed adviser.
- End every answer with one line: "Sources: <comma-separated>" naming the providers and/or Powerswitch / Consumer NZ you relied on.

## NZ provider price book (${prices.live ? 'LIVE — scraped from provider pages, each line cites its source + verified date' : 'indicative seed data'})
${prices.text}

## ${demoFindingsBlock()}${ownBills}

Note: ${PROVIDER_PRICING_DISCLAIMER}`;

  const ladder = resolveModelLadder(MODEL_TIER_TO_ANTHROPIC.mid, []);
  let text = '';
  if (ladder.length > 0) {
    const messages: ModelMessage[] = [
      ...history.map((h) => ({ role: h.role, content: h.content }) as ModelMessage),
      { role: 'user', content: message } as ModelMessage,
    ];
    const result = await generateWithFallback({ ladder, system, messages, agentSlug: 'assembl-bills' });
    if (result.ok) text = result.text;
  }
  if (!text) {
    // Platform edge LLM fallback — the advisor answers with the same grounding
    // even when no local model key is configured.
    const transcript = history
      .map((h) => `${h.role === 'user' ? 'User' : 'Advisor'}: ${h.content}`)
      .join('\n');
    const edge = await edgeLlm({
      system,
      message: transcript ? `${transcript}\nUser: ${message}` : message,
      maxTokens: 800,
    });
    if (edge) text = edge.text.trim();
  }
  if (!text) {
    return NextResponse.json({ error: 'The advisor could not answer just now — please try again.' }, { status: 502 });
  }

  // Surface a small set of source chips: any provider named in the reply, plus Powerswitch.
  const named = new Set<string>();
  for (const p of providerPlans) {
    if (text.includes(p.provider)) named.add(p.provider);
  }
  const sources = ['Powerswitch (Consumer NZ)', ...Array.from(named).slice(0, 4)];

  return NextResponse.json({ response: text, sources });
}
