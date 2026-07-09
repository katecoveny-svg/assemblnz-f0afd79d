import 'server-only';

/**
 * Platform LLM fallback for assembl bills (and other demo surfaces).
 *
 * When no local model key (ANTHROPIC_API_KEY) is present, extraction and
 * advice route through the deployed `public-chat-llm` Supabase edge function,
 * which holds its own provider keys (Gemini via the platform gateway) and
 * supports image/PDF attachments — the same secrets-in-Supabase pattern the
 * Auaha image pipeline uses. Fails soft: returns null so callers can drop to
 * their next rung.
 */

const EDGE_MODEL_LABEL = 'public-chat-llm edge · gemini-2.5-flash';

export function edgeLlmConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
  );
}

export async function edgeLlm(opts: {
  system: string;
  message: string;
  imageDataUrl?: string;
  maxTokens?: number;
}): Promise<{ text: string; model: string } | null> {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!base || !key) return null;
  try {
    const res = await fetch(`${base}/functions/v1/public-chat-llm`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        kete: 'toro',
        systemPromptOverride: opts.system,
        message: opts.message,
        imageDataUrl: opts.imageDataUrl,
        maxTokens: Math.min(opts.maxTokens ?? 1500, 4000),
      }),
    });
    if (!res.ok) return null;
    const d = (await res.json()) as { response?: string; model?: string };
    if (!d.response) return null;
    return { text: d.response, model: d.model ?? EDGE_MODEL_LABEL };
  } catch {
    return null;
  }
}

/** Strip markdown fences the model sometimes wraps JSON in. */
export function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
}
