// ═══════════════════════════════════════════════════════════════
// Shared embedding helper — calls Google Generative Language API
// directly (Lovable AI Gateway does not currently support embeddings).
// Returns 768-dim vectors so existing pgvector schemas keep working.
// Requires GEMINI_API_KEY in env.
// ═══════════════════════════════════════════════════════════════

const GEMINI_EMBED_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

export async function embedText(
  input: string,
  apiKey: string,
  dim = 768,
): Promise<number[] | null> {
  if (!input || !apiKey) return null;
  try {
    const r = await fetch(`${GEMINI_EMBED_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text: input.slice(0, 8000) }] },
        outputDimensionality: dim,
      }),
    });
    if (!r.ok) {
      console.error("[embed] failed", r.status, await r.text().catch(() => ""));
      return null;
    }
    const j = await r.json();
    const vec = j?.embedding?.values;
    return Array.isArray(vec) ? vec : null;
  } catch (err) {
    console.error("[embed] exception", (err as Error).message);
    return null;
  }
}
