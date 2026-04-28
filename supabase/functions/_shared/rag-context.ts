// ═══════════════════════════════════════════════════════════════
// rag-context.ts — Shared helper for grounding kete agents in the
// curated NZ regulation corpus. Calls the rag-retrieve edge function,
// formats a system-prompt block with strict citation rules, and returns
// the raw chunk metadata so a downstream Mana verifier can confirm
// the model actually cited what it was given.
//
// Usage from any agent edge function:
//   const rag = await fetchRagContext({ query, kete: ["MANAAKI"] });
//   if (rag.block) fullSystemPrompt += rag.block;
//   // … run model …
//   await verifyCitationsAgainst(rag.chunks, modelOutput);
// ═══════════════════════════════════════════════════════════════

export interface RagChunk {
  chunk_id: string;
  source: string;
  citation: string;
  tier: number;
  authority_weight: number;
  similarity: number;
  kete: string[];
  excerpt: string;
}

export interface RagContext {
  /** Markdown-formatted block to append to the system prompt, or "" if no chunks. */
  block: string;
  /** Confidence signal returned by rag-retrieve: high | medium | low | none. */
  confidence_signal: "high" | "medium" | "low" | "none";
  /** Raw chunks returned by the retriever — used by the citation verifier. */
  chunks: RagChunk[];
  /** True if the retriever was called and at least one chunk came back. */
  grounded: boolean;
}

const EMPTY: RagContext = { block: "", confidence_signal: "none", chunks: [], grounded: false };

/** Heuristic: is this question worth grounding? Cheap classifier, not a model. */
export function shouldGround(query: string): boolean {
  if (!query || query.length < 10) return false;
  const q = query.toLowerCase();
  // Triggers: legislation, compliance, "must I", "do I have to", regulators, common Acts
  const triggers = [
    /\b(act|regulation|standard|legislation|statute|section|clause|schedule)\b/,
    /\b(comply|compliance|legal|lawful|liab|breach|penalty|fine|prosecut)\b/,
    /\b(must|have to|required|mandatory|obligated|need to)\b/,
    /\b(food act|hswa|fair trading|cca|consumer guarantees|privacy|sale and supply|alcohol|building act|holidays act|employment|wages|hazard|notifiable)\b/,
    /\b(worksafe|mpi|mbie|fma|commerce commission|opc|nzta|customs|tenancy)\b/,
  ];
  return triggers.some((re) => re.test(q));
}

interface FetchOptions {
  query: string;
  kete?: string[];
  max_tier?: number;
  top_k?: number;
  /** Force grounding regardless of heuristic (e.g. compliance-only kete). */
  force?: boolean;
}

export async function fetchRagContext(opts: FetchOptions): Promise<RagContext> {
  if (!opts.force && !shouldGround(opts.query)) return EMPTY;

  const baseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!baseUrl || !serviceKey) return EMPTY;

  try {
    const res = await fetch(`${baseUrl}/functions/v1/rag-retrieve`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceKey}` },
      body: JSON.stringify({
        query: opts.query.slice(0, 4000),
        kete: opts.kete ?? null,
        max_tier: opts.max_tier ?? 3,
        top_k: opts.top_k ?? 6,
      }),
    });
    if (!res.ok) return EMPTY;
    const data = await res.json();
    if (!data?.ok || !Array.isArray(data.results) || data.results.length === 0) return EMPTY;

    const chunks: RagChunk[] = data.results;
    const lines = chunks.map((c, i) => {
      const tierLabel = c.tier === 1 ? "Primary law" : c.tier === 2 ? "Regulator" : c.tier === 3 ? "Sector body" : "Commentary";
      return `[${i + 1}] {chunk_id:${c.chunk_id}} ${c.source} — ${c.citation} (T${c.tier} ${tierLabel}, similarity ${c.similarity})\n${c.excerpt}`;
    });

    const block = `

[GROUNDED NZ REGULATION CONTEXT — confidence: ${data.confidence_signal}]
The following passages were retrieved from Assembl's curated NZ regulation corpus. They are the ONLY authoritative sources for legal/regulatory claims in this response.

CITATION RULES (mandatory):
1. When you make a regulatory or legal claim, immediately cite the source inline using the bracketed marker, e.g. "Food Act 2014 s 31 [1]".
2. After the body of your reply, include a "Sources" section listing each cited passage as: \`[n] Source — citation (chunk_id:<id>)\`.
3. If the retrieved passages do not cover the user's question, say so plainly ("the curated corpus does not cover this") rather than inventing a citation.
4. NEVER invent a section number, an Act name or a chunk_id. Use only what appears below.

PASSAGES:
${lines.join("\n\n")}
[END GROUNDED CONTEXT]
`;

    return {
      block,
      confidence_signal: (data.confidence_signal as RagContext["confidence_signal"]) ?? "none",
      chunks,
      grounded: true,
    };
  } catch (err) {
    console.warn("[rag-context] fetch failed:", (err as Error).message);
    return EMPTY;
  }
}

export interface CitationVerification {
  /** PASS = at least one cited chunk_id matches the retrieved set.
   *  FLAG = grounded context was provided but no citation found in output.
   *  FAIL = output cites a chunk_id that was NOT in the retrieved set (hallucinated). */
  status: "PASS" | "FLAG" | "FAIL" | "NOT_APPLICABLE";
  cited_chunk_ids: string[];
  hallucinated_chunk_ids: string[];
  retrieved_chunk_ids: string[];
  message: string;
}

/** Extracts {chunk_id:...} markers from model output and checks them against the retrieved set. */
export function verifyCitationsAgainst(chunks: RagChunk[], modelOutput: string): CitationVerification {
  const retrieved = chunks.map((c) => c.chunk_id);
  if (retrieved.length === 0) {
    return {
      status: "NOT_APPLICABLE", cited_chunk_ids: [], hallucinated_chunk_ids: [],
      retrieved_chunk_ids: [], message: "No grounded context was provided for this turn.",
    };
  }

  const markers = Array.from(modelOutput.matchAll(/chunk_id:\s*([a-f0-9-]{8,})/gi)).map((m) => m[1]);
  const cited = Array.from(new Set(markers));
  const hallucinated = cited.filter((id) => !retrieved.includes(id));

  if (cited.length === 0) {
    return {
      status: "FLAG", cited_chunk_ids: [], hallucinated_chunk_ids: [],
      retrieved_chunk_ids: retrieved,
      message: "Grounded context was provided but the response contains no chunk_id citations.",
    };
  }
  if (hallucinated.length > 0) {
    return {
      status: "FAIL", cited_chunk_ids: cited, hallucinated_chunk_ids: hallucinated,
      retrieved_chunk_ids: retrieved,
      message: `Response cites ${hallucinated.length} chunk_id(s) that were not in the retrieved set.`,
    };
  }
  return {
    status: "PASS", cited_chunk_ids: cited, hallucinated_chunk_ids: [],
    retrieved_chunk_ids: retrieved,
    message: `Response cites ${cited.length} chunk_id(s), all from the retrieved set.`,
  };
}
