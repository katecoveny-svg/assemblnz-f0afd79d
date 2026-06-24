import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod';
import { marketplaceAgentBySlug, MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { FALLBACK_DISCLOSURE, pickRung, resolveModelLadder } from '@/lib/ai/router';
import { recordModelFallback } from '@/lib/ai/fallback-log';
import { MARITIME_KNOWLEDGE, marineWeatherTool } from '@/lib/agents/maritime-knowledge';
import { WHANAU_KNOWLEDGE, isFamilyAgent } from '@/lib/agents/whanau-knowledge';
import { CLINICAL_NOTE_KNOWLEDGE } from '@/lib/agents/clinical-notes';
import { CREATIVE_KNOWLEDGE, creativeTools, generateImageTool, IMAGE_RENDER_KNOWLEDGE } from '@/lib/agents/creative';
import { VOICE_RECEPTIONIST_KNOWLEDGE, isVoiceAgent } from '@/lib/voice/agent-voice';
import { handoffPromptBlock } from '@/lib/agents/handoffs';
import { FREE_MESSAGE_LIMIT } from '@/lib/billing/agent-pricing';
import { getEntitlementStatus, incrementFreeUsage } from '@/lib/billing/agent-entitlement';
import { resolveChatIdentity, ANON_COOKIE, anonCookieOptions } from '@/lib/billing/chat-identity';

export const maxDuration = 60;

/** Build a Set-Cookie header string from our anon cookie options. */
function anonSetCookie(value: string): string {
  const o = anonCookieOptions();
  const parts = [`${ANON_COOKIE}=${value}`, `Path=${o.path}`, `Max-Age=${o.maxAge}`, `SameSite=Lax`];
  if (o.httpOnly) parts.push('HttpOnly');
  if (o.secure) parts.push('Secure');
  return parts.join('; ');
}

/**
 * Per-agent streaming chat endpoint (Vercel AI SDK).
 *
 * The system prompt is resolved SERVER-SIDE from the marketplace registry and
 * never trusted from the request body — the browser only ever sends the user's
 * messages. The model is chosen from the agent's model tier.
 *
 * Free tier: the first 3 messages per agent are free (counted per signed-in
 * user or anonymous device). After that the route returns 402 with a paywall
 * payload. A paid install (per-agent / bundle / all-access) lifts the limit.
 *
 * NZ knowledge tools (Gazette / PCO Legislation / Beehive) are scaffolded here
 * as stubs. They expose the shape the model can call, but return a "not yet
 * wired" placeholder. Real retrieval (pgvector embeddings + live source wiring)
 * lands in a follow-up task.
 */

/**
 * Live NZ knowledge search — grounds agents in assembl's Industry Knowledge
 * Base (legislation, regulations, official guidance, government sources) via the
 * deployed `ikb-search` edge function, which embeds the query (Gemini, 768-dim)
 * and runs the `search_industry_kb` pgvector RPC. Returns real ranked snippets
 * with titles + URLs for the agent to cite. Fails safe: on any problem it tells
 * the agent to answer from general knowledge and flag that the live source was
 * not checked.
 */
const nzKnowledgeTools = {
  searchNZKnowledge: tool({
    description:
      "Search assembl's New Zealand knowledge base (legislation, regulations, standards, official government guidance) for grounding. Use whenever the answer turns on NZ law, a statutory reference, compliance, entitlements, or official guidance. Returns real source snippets with titles and URLs — cite the ones you use, with their retrieval date.",
    inputSchema: z.object({
      query: z.string().describe('The NZ legal / regulatory / government question or topic to look up'),
    }),
    execute: async ({ query }) => {
      const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!base || !key) {
        return {
          status: 'unavailable',
          note: 'The NZ knowledge base is not reachable right now. Answer from general knowledge and clearly say it was not checked against the live source.',
        };
      }
      try {
        const res = await fetch(`${base}/functions/v1/ikb-search`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${key}`, apikey: key, 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, limit: 6, minSimilarity: 0.2 }),
        });
        if (!res.ok) {
          return {
            status: 'error',
            note: `Live source search failed (${res.status}). Answer from general knowledge and flag that it was not verified against the live source.`,
          };
        }
        const data = (await res.json()) as {
          hits?: Array<{ doc_title?: string; source_url?: string; chunk_text?: string; similarity?: number; tier?: number }>;
        };
        const hits = (data.hits ?? []).slice(0, 6).map((h) => ({
          title: h.doc_title ?? 'NZ source',
          url: h.source_url ?? null,
          snippet: (h.chunk_text ?? '').slice(0, 700),
          similarity: typeof h.similarity === 'number' ? Number(h.similarity.toFixed(3)) : undefined,
        }));
        if (hits.length === 0) {
          return {
            status: 'no_results',
            note: 'Nothing close in the NZ knowledge base. Answer from general knowledge and flag that it was not found in the live source.',
          };
        }
        return { status: 'ok', hits, retrievedAt: new Date().toISOString().slice(0, 10) };
      } catch (e) {
        return {
          status: 'error',
          note: `NZ knowledge search error: ${e instanceof Error ? e.message : 'unknown'}. Answer from general knowledge and flag that it was not verified.`,
        };
      }
    },
  }),
};

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = marketplaceAgentBySlug(slug);

  if (!agent) {
    return Response.json({ error: 'Unknown agent.' }, { status: 404 });
  }

  // Resolve the free-fallback ladder: the tier primary (Claude) then Gemini →
  // Groq → Ollama, filtered to whatever credentials are configured. If the
  // primary's key is missing but a fallback's is set, the agent still answers.
  const primaryModelId = MODEL_TIER_TO_ANTHROPIC[agent.modelTier];
  const ladder = resolveModelLadder(primaryModelId, agent.fallbackModels);
  const rung = pickRung(ladder);

  if (!rung) {
    return Response.json(
      {
        error:
          'Chat is not configured yet — set ANTHROPIC_API_KEY (primary) or a fallback key (GEMINI_API_KEY / GROQ_API_KEY / OLLAMA_BASE_URL). See .env.local.example.',
      },
      { status: 503 },
    );
  }

  let body: { messages?: UIMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // ── Free-tier gate ────────────────────────────────────────────────────────
  // Entitled (paid) callers skip the limit. Otherwise this user/device gets
  // FREE_MESSAGE_LIMIT messages on this agent, then the paywall.
  const { identity, setAnonId } = await resolveChatIdentity();
  const status = await getEntitlementStatus(identity, slug);
  if (!status.entitled && status.remaining <= 0) {
    return Response.json(
      {
        error: 'free_limit_reached',
        paywall: true,
        agentSlug: slug,
        freeLimit: FREE_MESSAGE_LIMIT,
        message: `You've used your ${FREE_MESSAGE_LIMIT} free messages with ${agent.name}. Subscribe to keep going.`,
      },
      { status: 402 },
    );
  }
  if (!status.entitled) {
    await incrementFreeUsage(identity, slug);
  }

  const messages = body.messages ?? [];
  const modelMessages = await convertToModelMessages(messages);

  // When the primary is unavailable and we're starting on a fallback rung, the
  // agent self-discloses and we log the selection-time fallback.
  const baseSystem = rung.isPrimary ? agent.systemPrompt : `${agent.systemPrompt}\n\n${FALLBACK_DISCLOSURE}`;
  if (!rung.isPrimary) {
    void recordModelFallback({
      agentSlug: agent.slug,
      primaryModel: primaryModelId,
      fallbackModel: rung.id,
      reason: 'primary provider not configured; started on fallback',
    });
  }

  // Flagship deep-port augmentation: append the ported knowledge block for the
  // agent's family, add any extra tools it needs, and end with its cross-agent
  // handoff hints. All additive to the locked v2.0 system prompt — never a
  // rewrite. (Maritime: deep MNZ knowledge + a live keyless Open-Meteo Marine
  // sea-state tool. Family: the Tōro whānau-navigator workflows + safety gates.
  // Care Scribe: the SOAP/ICD clinical-note layer. Creative Studio: the Auaha
  // pipeline + creative-gen tools. Voice CS: the after-hours receptionist block.)
  const isMaritime = ['maritime-brief', 'tide-weather', 'catch-log'].includes(agent.slug);
  const isCreative = agent.slug === 'creative-studio';
  // Real image generation for every creative-category agent (Prism, Auaha,
  // Creative Studio, Social Manager) — calls the generate-image edge function.
  const canMakeImages = agent.category === 'creative';

  const tools = {
    ...nzKnowledgeTools,
    ...(isMaritime ? { marineWeather: marineWeatherTool } : {}),
    ...(isCreative ? creativeTools : {}),
    ...(canMakeImages ? { generateImage: generateImageTool } : {}),
  };

  const knowledgeBlocks: string[] = [];
  if (isMaritime) knowledgeBlocks.push(MARITIME_KNOWLEDGE);
  if (isFamilyAgent(agent.slug)) knowledgeBlocks.push(WHANAU_KNOWLEDGE);
  if (agent.slug === 'care-scribe') knowledgeBlocks.push(CLINICAL_NOTE_KNOWLEDGE);
  if (isCreative) knowledgeBlocks.push(CREATIVE_KNOWLEDGE);
  if (canMakeImages) knowledgeBlocks.push(IMAGE_RENDER_KNOWLEDGE);
  if (isVoiceAgent(agent.slug)) knowledgeBlocks.push(VOICE_RECEPTIONIST_KNOWLEDGE);

  const handoffBlock = handoffPromptBlock(agent.slug);
  if (handoffBlock) knowledgeBlocks.push(handoffBlock);

  const system = knowledgeBlocks.length
    ? [baseSystem, ...knowledgeBlocks].join('\n\n')
    : baseSystem;

  const result = streamText({
    model: rung.model,
    system,
    messages: modelMessages,
    tools,
    // Allow a couple of tool round-trips before the final answer.
    stopWhen: stepCountIs(4),
    // Mid-stream provider error: log it as a fallback signal (best-effort). True
    // mid-stream model failover is a follow-up; selection-time fallback above
    // already covers the common "primary key absent / provider down at start".
    onError: ({ error }) => {
      void recordModelFallback({
        agentSlug: agent.slug,
        primaryModel: rung.id,
        fallbackModel: ladder[1]?.id ?? null,
        reason: error instanceof Error ? error.message : String(error),
      });
    },
  });

  return result.toUIMessageStreamResponse(
    setAnonId ? { headers: { 'Set-Cookie': anonSetCookie(setAnonId) } } : undefined,
  );
}
