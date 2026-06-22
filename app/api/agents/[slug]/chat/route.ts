import { anthropic } from '@ai-sdk/anthropic';
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai';
import { z } from 'zod';
import { marketplaceAgentBySlug, MODEL_TIER_TO_ANTHROPIC } from '@/lib/marketplace/agents';

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

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      {
        error:
          'Chat is not configured yet — set ANTHROPIC_API_KEY in the environment (see .env.local.example).',
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

  const messages = body.messages ?? [];
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: anthropic(MODEL_TIER_TO_ANTHROPIC[agent.modelTier]),
    system: agent.systemPrompt,
    messages: modelMessages,
    tools: nzKnowledgeTools,
    // Allow a couple of tool round-trips before the final answer.
    stopWhen: stepCountIs(4),
  });

  return result.toUIMessageStreamResponse();
}
