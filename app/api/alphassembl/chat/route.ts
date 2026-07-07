import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { getServiceClient } from '@/lib/supabase/service';
import { clientIpFromHeaders } from '@/lib/lead-capture';
import {
  marketplaceAgentBySlug,
  MODEL_TIER_TO_ANTHROPIC,
} from '@/lib/marketplace/agents';
import { resolveModelLadder, generateWithFallback } from '@/lib/ai/router';
import type { ModelMessage } from 'ai';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/alphassembl/chat — Kaiako, the force-free trainer, grounded chat.
 *
 * Pipeline:
 *   1. Rate limit 50 messages / session / 24h (alphassembl_chat_log).
 *   2. Urgency pre-pass (cheap Haiku): routine | concerning | refer_to_professional.
 *   3. If refer_to_professional → skip RAG, return a calm safety reply + the
 *      referral directory (alphassembl_vets). Nothing is dispatched.
 *   4. Else → Tier A vector RAG over the P1 sources via the kaiako-rag edge
 *      function (match_knowledge_tier_a, scoped to 'kaiako'), inject as grounded
 *      context, generate with the locked Kaiako prompt, and return the reply
 *      with its Trust-tiered sources.
 */

const DAILY_LIMIT = 50;
const RAG_TOP_K = 6;

const BodySchema = z.object({
  message: z.string().trim().min(1).max(2000),
  sessionId: z.string().trim().min(6).max(64).optional(),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(6000) }))
    .max(20)
    .optional(),
});

type Urgency = 'routine' | 'concerning' | 'refer_to_professional';

function hashIp(ip: string | null): string {
  const salt = process.env.DEMO_INVITE_SECRET ?? 'alphassembl-salt';
  return createHash('sha256').update(`${salt}:${ip ?? 'unknown'}`).digest('hex').slice(0, 32);
}

async function classifyUrgency(message: string): Promise<Urgency> {
  // Cheap, fast classifier. Uses the current Haiku tier (kept in sync with the
  // marketplace model map) so it stays on a model the account actually serves.
  const ladder = resolveModelLadder(MODEL_TIER_TO_ANTHROPIC.cheap, []);
  if (ladder.length === 0) return 'routine';
  const system = `You classify a NZ dog owner's message into exactly one urgency level for a force-free dog-training assistant. Reply with ONLY one word: routine, concerning, or refer_to_professional.
- routine: general training question, normal puppy or dog behaviour.
- concerning: needs careful staged advice (mild resource guarding, moderate reactivity, escalating arousal).
- refer_to_professional: a bite that made contact, aggression toward people or animals, self-injury, severe anxiety/panic, or a suspected medical cause.`;
  const res = await generateWithFallback({
    ladder,
    system,
    messages: [{ role: 'user', content: `Message: "${message}"` }],
    agentSlug: 'kaiako',
  });
  if (!res.ok) return 'routine';
  const word = res.text.toLowerCase();
  if (word.includes('refer_to_professional') || word.includes('refer to professional')) return 'refer_to_professional';
  if (word.includes('concerning')) return 'concerning';
  return 'routine';
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
  const sessionId = parsed.data.sessionId ?? `anon-${hashIp(clientIpFromHeaders(req.headers))}`;
  const history = parsed.data.history ?? [];

  const agent = marketplaceAgentBySlug('kaiako');
  if (!agent) {
    return NextResponse.json({ error: 'Trainer unavailable' }, { status: 500 });
  }

  let service: ReturnType<typeof getServiceClient>;
  try {
    service = getServiceClient();
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  const ipHash = hashIp(clientIpFromHeaders(req.headers));

  // 1 · Rate limit — 50 user messages per session per rolling 24h.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await service
    .from('alphassembl_chat_log')
    .select('id', { count: 'exact', head: true })
    .eq('session_id', sessionId)
    .eq('role', 'user')
    .gte('created_at', since);
  if ((count ?? 0) >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: `You've reached today's limit of ${DAILY_LIMIT} messages. Come back tomorrow — Kaiako will be here.` },
      { status: 429 },
    );
  }

  // 2 · Urgency pre-pass.
  const urgency = await classifyUrgency(message);
  await service.from('alphassembl_chat_log').insert({ session_id: sessionId, ip_hash: ipHash, role: 'user', urgency, message });

  // 3 · Refer path — skip RAG, return safety message + directory.
  if (urgency === 'refer_to_professional') {
    const { data: vets } = await service
      .from('alphassembl_vets')
      .select('name, region, service, phone, website, placeholder')
      .order('sort', { ascending: true })
      .limit(5);
    const response = `This is past what I should coach over chat, and getting the right in-person help early is the safest, kindest thing for your dog.\n\nPlease speak to your vet or a certified force-free behaviourist now — a vet can also rule out pain or a medical cause. Keep everyone safe in the meantime: give your dog space, avoid the trigger, and don't punish warning signs like growling.\n\nI've pulled some places to start below.\n\nTrust: A · Sources: SPCA New Zealand, IAABC`;
    await service.from('alphassembl_chat_log').insert({ session_id: sessionId, ip_hash: ipHash, role: 'assistant', urgency, message: response });
    return NextResponse.json({
      urgency,
      refer_to_vet: true,
      response,
      sources: [{ name: 'SPCA New Zealand — advice', url: 'https://www.spca.nz/advice', tier: 'A' }],
      vets: vets ?? [],
    });
  }

  // 4 · Grounded answer — Tier A VECTOR RAG via the kaiako-rag edge function
  // (embeds the query + runs match_knowledge_tier_a where the Gemini key lives,
  // scoped to sources 'kaiako' depends on). Fails soft to no grounding.
  let knowledgeBlock =
    '(No grounding passages matched this question — answer from your force-free training knowledge, say plainly where you are not citing a source, and never invent a citation.)';
  let ragSources: { name: string; url: string | null; tier: string }[] = [];
  try {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (base) {
      const r = await fetch(`${base}/functions/v1/kaiako-rag`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'retrieve', query: message, top_k: RAG_TOP_K }),
      });
      if (r.ok) {
        const data = (await r.json()) as {
          context?: string;
          sources?: Array<{ title: string; tier?: string; pointer?: string | null }>;
        };
        if (data.context && data.context.trim()) knowledgeBlock = data.context;
        ragSources = (data.sources ?? []).map((s) => ({ name: s.title, url: s.pointer ?? null, tier: s.tier ?? 'A' }));
      }
    }
  } catch {
    /* fail soft — Kaiako answers from force-free knowledge and says so */
  }

  const system = `${agent.systemPrompt}

## Retrieved knowledge (ground your answer in these; cite by name and carry the Trust tier)
${knowledgeBlock}

## Reply rules
- Keep it warm, NZ, and doable. Lead with the answer.
- End with exactly one line: "Trust: <A|B|C> · Sources: <comma-separated source names you used>". Use the LOWEST tier you leaned on.
- If the urgency of this message is "concerning", add a short line noting a hands-on professional would help.`;

  const ladder = resolveModelLadder(MODEL_TIER_TO_ANTHROPIC[agent.modelTier], agent.fallbackModels);
  if (ladder.length === 0) {
    return NextResponse.json({ error: 'Trainer is offline (no model configured).' }, { status: 503 });
  }

  const messages: ModelMessage[] = [
    ...history.map((h) => ({ role: h.role, content: h.content }) as ModelMessage),
    { role: 'user', content: message } as ModelMessage,
  ];

  const result = await generateWithFallback({ ladder, system, messages, agentSlug: 'kaiako' });
  if (!result.ok) {
    return NextResponse.json({ error: 'Kaiako could not answer just now — please try again.' }, { status: 502 });
  }

  // Sources for the panel — the edge function already dedupes by source name.
  const sources = ragSources;

  await service
    .from('alphassembl_chat_log')
    .insert({ session_id: sessionId, ip_hash: ipHash, role: 'assistant', urgency, message: result.text });

  return NextResponse.json({
    urgency,
    refer_to_vet: false,
    response: result.text,
    sources,
    model: result.rung.isPrimary ? 'primary' : result.rung.label,
  });
}
