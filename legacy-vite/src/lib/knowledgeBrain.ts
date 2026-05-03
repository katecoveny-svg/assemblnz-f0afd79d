// ═══════════════════════════════════════════════════════════════
// knowledgeBrain — agent-facing helper. Embeds a question via the
// Lovable AI Gateway, calls match_kb_knowledge, and returns the
// top citation snippets ready to inject into a system prompt.
//
// Use from any agent edge function:
//   const ctx = await getLiveContext("min wage today?", "pakihi");
//   const groundedPrompt = `CURRENT VERIFIED SOURCES:\n${formatContext(ctx)}\n\n${basePrompt}`;
// ═══════════════════════════════════════════════════════════════

import { supabase } from "@/integrations/supabase/client";

export interface LiveContextSnippet {
  document_id: string;
  title: string;
  url: string | null;
  snippet: string;
  source_name: string;
  published_at: string | null;
  similarity: number;
}

/** Embed a query via the Lovable AI Gateway (browser-safe via edge function preferred). */
async function embedQuery(question: string, lovableKey: string): Promise<number[] | null> {
  const r = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: { Authorization: `Bearer ${lovableKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "google/text-embedding-004", input: question }),
  });
  if (!r.ok) return null;
  const j = await r.json();
  return j?.data?.[0]?.embedding ?? null;
}

/**
 * Browser-safe wrapper: invokes a small edge function that does the
 * embed + RPC and returns the results. (Avoids exposing LOVABLE_API_KEY.)
 */
export async function getLiveContext(question: string, agentPack?: string, topK = 6): Promise<LiveContextSnippet[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.functions.invoke as any)("kb-context", {
    body: { question, agent_pack: agentPack ?? null, top_k: topK },
  });
  if (error) {
    console.warn("[knowledgeBrain] getLiveContext failed:", error.message);
    return [];
  }
  return (data?.snippets ?? []) as LiveContextSnippet[];
}

/** Format snippets for injection into a system prompt. */
export function formatContext(snippets: LiveContextSnippet[]): string {
  if (!snippets.length) return "(no fresh sources matched this query)";
  return snippets.map((s, i) => {
    const date = s.published_at ? new Date(s.published_at).toISOString().slice(0, 10) : "n/d";
    return `[${i + 1}] ${s.title} — ${s.source_name} (${date})\n${s.snippet}\n${s.url ? `→ ${s.url}` : ""}`;
  }).join("\n\n---\n\n");
}

/** Server-side variant (for use inside edge functions). Accepts a Supabase admin client. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getLiveContextServer(question: string, agentPack: string | null, admin: any, lovableKey: string, topK = 6): Promise<LiveContextSnippet[]> {
  const vec = await embedQuery(question, lovableKey);
  if (!vec) return [];
  const { data, error } = await admin.rpc("match_kb_knowledge", {
    query_embedding: vec, agent_pack: agentPack, top_k: topK,
  });
  if (error) {
    console.warn("[knowledgeBrain] match_kb_knowledge failed:", error.message);
    return [];
  }
  return (data ?? []) as LiveContextSnippet[];
}
