/**
 * Shared NZ knowledge search for agent chat surfaces.
 *
 * Read-only cite mode: embeds the query (Gemini 768-dim) and retrieves from
 * `match_kb_knowledge` via citeFromPCO. Fails open with an honest note when
 * credentials or the KB are unavailable — never invents a citation.
 *
 * Used by signed-in `/api/agents/[slug]/chat` and the public homepage phone
 * (`/api/home/agent`) for flagship specialists.
 */

import { tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { citeFromPCO, type SupabaseRpcClient } from '@/lib/government/types';

export type NZKnowledgeResult =
  | {
      status: 'ok';
      sources: Array<{
        title: string;
        url: string | null;
        snippet: string;
        similarity?: number;
      }>;
      retrievedAt: string;
    }
  | { status: 'unavailable' | 'error' | 'no_results'; note: string };

export async function searchNZKnowledge(query: string): Promise<NZKnowledgeResult> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!base || !serviceKey || !geminiKey) {
    return {
      status: 'unavailable',
      note: 'The NZ knowledge base is not reachable right now. Answer from general knowledge and clearly say it was not checked against the live source.',
    };
  }
  try {
    const er = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: query.slice(0, 8000) }] },
          outputDimensionality: 768,
        }),
      },
    );
    if (!er.ok) {
      return {
        status: 'error',
        note: 'Could not search the live source right now. Answer from general knowledge and flag it was not verified.',
      };
    }
    const ej = (await er.json()) as { embedding?: { values?: number[] } };
    const embedding = ej.embedding?.values;
    if (!Array.isArray(embedding) || embedding.length === 0) {
      return {
        status: 'error',
        note: 'The live source search returned no embedding. Answer from general knowledge and flag it was not verified.',
      };
    }
    const supabase = createClient(base, serviceKey) as unknown as SupabaseRpcClient;
    const citations = await citeFromPCO(supabase, embedding, null, 6);
    if (!citations.length) {
      return {
        status: 'no_results',
        note: 'Nothing close in the live NZ knowledge base. Answer from general knowledge and flag that it was not found in the live source.',
      };
    }
    return {
      status: 'ok',
      sources: citations.map((c) => ({
        title: c.title,
        url: c.url,
        snippet: c.snippet.slice(0, 700),
        similarity: Number.isFinite(c.similarity) ? Number(c.similarity.toFixed(3)) : undefined,
      })),
      retrievedAt: new Date().toISOString().slice(0, 10),
    };
  } catch (e) {
    return {
      status: 'error',
      note: `NZ knowledge search error: ${e instanceof Error ? e.message : 'unknown'}. Answer from general knowledge and flag that it was not verified.`,
    };
  }
}

export const searchNZKnowledgeTool = tool({
  description:
    "Search assembl's New Zealand knowledge base (legislation, regulations, standards, official government guidance) for grounding. Use whenever the answer turns on NZ law, a statutory reference, compliance, entitlements, or official guidance. Returns real source snippets with titles and URLs — cite the ones you use, with their retrieval date. Read-only: never claim you filed, lodged, sent or saved anything.",
  inputSchema: z.object({
    query: z
      .string()
      .describe('The NZ legal / regulatory / government question or topic to look up'),
  }),
  execute: async ({ query }) => searchNZKnowledge(query),
});

export const nzKnowledgeTools = {
  searchNZKnowledge: searchNZKnowledgeTool,
};

/**
 * Homepage phone flagships that may call searchNZKnowledge in cite-only mode.
 * Keep this list short — each call costs an embedding + model step.
 */
export const HOME_PHONE_KNOWLEDGE_SLUGS = new Set([
  'arai',
  'kaupapa',
  'pikau',
  'auaha',
  'arataki',
  'prism',
  'gateway',
]);
