import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod';
import { marketplaceAgentBySlug, MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';
import { FALLBACK_DISCLOSURE, pickRung, resolveModelLadder } from '@/lib/ai/router';
import { recordModelFallback } from '@/lib/ai/fallback-log';
import { checkDemoQuota, paywallPayload, spendDemoMessage } from '@/lib/billing/demo-mode';
import { MARITIME_KNOWLEDGE, marineWeatherTool } from '@/lib/agents/maritime-knowledge';

export const maxDuration = 30;

/**
 * Per-agent streaming chat endpoint (Vercel AI SDK).
 *
 * The system prompt is resolved SERVER-SIDE from the marketplace registry and
 * never trusted from the request body — the browser only ever sends the user's
 * messages. The model is chosen from the agent's model tier.
 *
 * NZ knowledge tools (Gazette / PCO Legislation / Beehive) are scaffolded here
 * as stubs. They expose the shape the model can call, but return a "not yet
 * wired" placeholder. Real retrieval (pgvector embeddings + live source wiring)
 * lands in a follow-up task.
 */

const nzKnowledgeTools = {
  searchGazette: tool({
    description:
      'Search the New Zealand Gazette for official notices (appointments, regulations, authorisations). Use for "has anything been gazetted about…" questions.',
    inputSchema: z.object({
      query: z.string().describe('What to search the NZ Gazette for'),
    }),
    execute: async ({ query }) => ({
      status: 'stub',
      note: 'Live NZ Gazette search is not wired up yet (follow-up task). Answer from general knowledge and clearly flag that this was not checked against the live Gazette.',
      query,
    }),
  }),
  searchLegislation: tool({
    description:
      'Look up current New Zealand legislation via the PCO Legislation source (Acts, regulations, sections). Use to confirm a specific statutory reference.',
    inputSchema: z.object({
      query: z.string().describe('Act, regulation, or section to look up'),
    }),
    execute: async ({ query }) => ({
      status: 'stub',
      note: 'Live PCO Legislation lookup is not wired up yet (follow-up task). Cite the relevant Act from general knowledge but flag that it was not verified against the live source.',
      query,
    }),
  }),
  searchBeehive: tool({
    description:
      'Search Beehive.govt.nz for recent New Zealand Government announcements and ministerial releases.',
    inputSchema: z.object({
      query: z.string().describe('What government announcement to search for'),
    }),
    execute: async ({ query }) => ({
      status: 'stub',
      note: 'Live Beehive search is not wired up yet (follow-up task). Flag that the live source was not checked.',
      query,
    }),
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

  // Demo-mode metering — N free answers per agent, then the paywall (HTTP 402).
  // Fail-open: any metering hiccup never blocks a genuine user.
  const quota = checkDemoQuota(req, slug);
  if (!quota.allowed) {
    return Response.json(paywallPayload(agent.name, slug, quota.limit), { status: 402 });
  }

  let body: { messages?: UIMessage[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
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

  // Maritime agents get the deep maritime knowledge block + a live (keyless
  // Open-Meteo Marine) sea-state tool on top of the NZ knowledge stubs;
  // everyone else just gets the stubs and their own (possibly fallback-disclosed)
  // system prompt.
  const isMaritime = agent.category === 'maritime';
  const tools = isMaritime
    ? { ...nzKnowledgeTools, marineWeather: marineWeatherTool }
    : nzKnowledgeTools;
  const system = isMaritime ? `${baseSystem}\n\n${MARITIME_KNOWLEDGE}` : baseSystem;

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

  // Count this answer against the agent's free allowance and refresh the meter
  // cookie on the streaming response.
  const setCookie = spendDemoMessage(req, slug);
  return result.toUIMessageStreamResponse(
    setCookie ? { headers: { 'Set-Cookie': setCookie } } : undefined,
  );
}
