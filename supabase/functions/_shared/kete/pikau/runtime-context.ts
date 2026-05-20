// ═══════════════════════════════════════════════════════════════
// Kete runtime context builder.
//
// Called from iho-router for every chat request that resolves to a kete
// pack. Builds authoritative runtime context appended to the system
// prompt before the model call:
//
//   1. PĪKAU TARIFF LOOKUP — keyword-matched HS code entries from a curated
//      ~80-line NZ Working Tariff extract (consumer-goods bias). Used
//      so the model never has to invent HS codes for the demo
//      categories Aironaut Customs typically handles. Pīkau only.
//
//   2. KNOWLEDGE BASE — top-K retrieved chunks from kb_doc_chunks,
//      filtered to sources tagged with the agent pack via the
//      existing match_kb_knowledge RPC (Gemini 768-dim embeddings).
//      The model is instructed to cite documents by title.
//
// Design notes
// ────────────
// • This module is intentionally NOT a tool-call layer. The router does
//   a single pre-flight context injection, then dispatches to the
//   model normally. Reversible: pull the call from iho-router and the
//   chat reverts to the existing prompt-only behaviour.
// • Pīkau tariff matching is keyword-substring, not LLM-based. Fast and
//   predictable for the demo. Confidence is tracked so the prompt can
//   warn the model not to over-claim on partial matches.
// • RAG is best-effort. If embedding fails or the RPC returns nothing,
//   we omit the block silently rather than block the whole response.
// ═══════════════════════════════════════════════════════════════

import tariffData from "./tariff-codes.json" with { type: "json" };
import { embedText } from "../../embed.ts";

type TariffEntry = {
  hs_code: string;
  description: string;
  duty_general: string;
  duty_preferences: Record<string, string>;
  biosecurity_flag: string | null;
  keywords: string[];
  notes: string;
};

type KbChunk = {
  document_id: string;
  title: string;
  url: string | null;
  snippet: string;
  source_name: string | null;
  published_at: string | null;
  similarity: number;
  authority_tier?: number | null;
  authority_weight?: number | null;
  weighted_score?: number | null;
};

interface BuildOptions {
  sb: {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<{
      data: KbChunk[] | null;
      error: unknown;
    }>;
  };
  agentPack: string;
  message: string;
  geminiKey: string | null;
  /** Top-K chunks to retrieve. Default 4. */
  ragTopK?: number;
  /** Minimum cosine similarity for chunks. Default 0.55. */
  ragMinSimilarity?: number;
}

/** Public entry point. Returns the runtime-context string (possibly empty). */
export async function buildKeteRuntimeContext(
  opts: BuildOptions,
): Promise<{ block: string; tariffHits: number; ragHits: number }> {
  const pack = opts.agentPack.trim().toLowerCase();
  const tariffMatches = pack === "pikau" ? matchTariff(opts.message) : [];
  const tariffBlock = tariffMatches.length > 0 ? formatTariffBlock(tariffMatches) : "";

  const ragChunks = await retrieveRagChunks(opts);
  const ragBlock = ragChunks.length > 0 ? formatRagBlock(pack, ragChunks) : "";

  const guardrail = buildGuardrail(pack, Boolean(tariffBlock), Boolean(ragBlock));

  return {
    block: guardrail + [tariffBlock, ragBlock].filter(Boolean).join("\n\n"),
    tariffHits: tariffMatches.length,
    ragHits: ragChunks.length,
  };
}

export async function buildPikauRuntimeContext(
  opts: Omit<BuildOptions, "agentPack">,
): Promise<{ block: string; tariffHits: number; ragHits: number }> {
  return buildKeteRuntimeContext({ ...opts, agentPack: "pikau" });
}

function buildGuardrail(pack: string, hasTariffBlock: boolean, hasRagBlock: boolean): string {
  if (!hasTariffBlock && !hasRagBlock) return "";

  const lines = [
    "═══ RUNTIME CONTEXT — authoritative for this turn ═══",
  ];

  if (hasTariffBlock) {
    lines.push(
      "A Pīkau tariff block was injected from the curated NZ Working Tariff extract. Treat HS codes, duty rates, FTA preferences, and biosecurity flags in that block as authoritative for this turn.",
    );
  }

  if (hasRagBlock) {
    lines.push(
      `A ${pack} knowledge-base block was injected from live and curated sources. Cite knowledge-base items by **Document title**. Prefer primary/regulator sources and more recent \`published_at\` dates when entries differ.`,
    );
  }

  lines.push(
    "If the user query falls outside the injected context, say so explicitly. Do not invent citations, rates, statutory sections, or regulator positions.",
    "",
  );

  return lines.join("\n");
}

// ───────────────────────────────────────────────────────────────
// Tariff matching
// ───────────────────────────────────────────────────────────────

/**
 * Escape regex metacharacters in a keyword before composing a RegExp.
 * Keywords are operator-curated so this is belt-and-braces, not a trust
 * boundary — but it lets phrases like "wi-fi access point" or
 * "hs code" tokenise safely without being interpreted as regex.
 */
function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchTariff(message: string): TariffEntry[] {
  const lc = message.toLowerCase();
  const entries = (tariffData as { entries: TariffEntry[] }).entries;
  const scored: Array<{ entry: TariffEntry; score: number }> = [];

  for (const entry of entries) {
    let score = 0;
    for (const kw of entry.keywords) {
      // Word-boundary match. Raw substring matching would let short
      // keywords like "ic" or "hat" match inside "specific", "that",
      // etc., injecting a totally unrelated tariff line as authoritative
      // context. Using \b on both sides of the keyword forces token
      // alignment for ASCII keywords (sufficient for this dataset).
      const re = new RegExp(`\\b${escapeRegex(kw.toLowerCase())}\\b`, "i");
      if (re.test(lc)) {
        // Longer keywords are more specific → higher score.
        score += kw.length >= 6 ? 3 : 1;
      }
    }
    // Direct HS code mention in the user's message — strongest signal.
    if (lc.includes(entry.hs_code.toLowerCase())) {
      score += 10;
    }
    if (score > 0) scored.push({ entry, score });
  }

  scored.sort((a, b) => b.score - a.score);
  // Cap at 4 to keep injected context tight and avoid swamping the prompt.
  return scored.slice(0, 4).map((s) => s.entry);
}

function formatTariffBlock(matches: TariffEntry[]): string {
  const lines: string[] = [
    "## TARIFF LOOKUP — NZ Working Tariff Document (HS 2022)",
    "_Source: New Zealand Customs Service. Use these HS codes and rates verbatim; do not paraphrase or round duty rates._",
    "",
  ];
  for (const m of matches) {
    const preferences = Object.entries(m.duty_preferences)
      .map(([fta, rate]) => `${fta}: ${rate}`)
      .join(" · ");
    lines.push(`**HS ${m.hs_code}** — ${m.description}`);
    lines.push(`• General duty: ${m.duty_general}`);
    if (preferences) lines.push(`• Preferences: ${preferences}`);
    if (m.biosecurity_flag) lines.push(`• Biosecurity: ${m.biosecurity_flag}`);
    if (m.notes) lines.push(`• Notes: ${m.notes}`);
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}

// ───────────────────────────────────────────────────────────────
// RAG retrieval
// ───────────────────────────────────────────────────────────────

async function retrieveRagChunks(opts: BuildOptions): Promise<KbChunk[]> {
  if (!opts.geminiKey) return [];
  const embedding = await embedText(opts.message, opts.geminiKey);
  if (!embedding) return [];

  const topK = opts.ragTopK ?? 4;
  const minSim = opts.ragMinSimilarity ?? 0.55;

  try {
    const { data, error } = await opts.sb.rpc("match_kb_knowledge", {
      query_embedding: embedding,
      agent_pack: opts.agentPack.trim().toLowerCase(),
      top_k: topK,
    });
    if (error || !data) return [];
    return data.filter((c) => c.similarity >= minSim);
  } catch (err) {
    console.error(`[${opts.agentPack}-rag] rpc failed`, (err as Error).message);
    return [];
  }
}

function formatRagBlock(pack: string, chunks: KbChunk[]): string {
  const lines: string[] = [
    `## KNOWLEDGE BASE — ${pack} live and curated corpus`,
    "_Cite items by **Document title**. Do not paste long verbatim quotes — paraphrase and reference. If two entries conflict, prefer the more recent `published_at`._",
    "",
  ];
  for (const c of chunks) {
    const sim = (c.similarity * 100).toFixed(0);
    const authority = c.authority_tier ? ` · T${c.authority_tier}` : "";
    lines.push(`**${c.title}** — _${c.source_name ?? "internal"}_ (relevance ${sim}%${authority})`);
    lines.push(c.snippet.trim().slice(0, 800));
    if (c.url) lines.push(`Source: ${c.url}`);
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}
