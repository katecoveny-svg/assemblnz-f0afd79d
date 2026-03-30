// ═══════════════════════════════════════════════
// ASSEMBL — Direct Gemini Provider (bypasses Lovable AI Gateway)
// Used for features that need direct Google API access (e.g. Live API tokens)
// ═══════════════════════════════════════════════

const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

export const GEMINI_MODELS = {
  "gemini-2.5-flash": "gemini-2.5-flash",
  "gemini-3-flash": "gemini-3-flash-preview",
  "gemini-2.5-pro": "gemini-2.5-pro",
  "gemini-live-flash": "gemini-3.1-flash-live-preview",
} as const;

export type GeminiModelKey = keyof typeof GEMINI_MODELS;

function getApiKey(): string {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) throw new Error("GEMINI_API_KEY is not configured");
  return key;
}

/**
 * Send a text chat message to Gemini directly (non-streaming).
 */
export async function chatWithGemini(
  modelKey: GeminiModelKey,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const apiKey = getApiKey();
  const modelId = GEMINI_MODELS[modelKey];

  const geminiContents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const resp = await fetch(
    `${GEMINI_API_BASE}/models/${modelId}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiContents,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 4096,
        },
      }),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Gemini API error [${resp.status}]: ${errText}`);
  }

  const data = await resp.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

/**
 * Stream a text chat response from Gemini directly.
 */
export async function streamChatWithGemini(
  modelKey: GeminiModelKey,
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  options?: { temperature?: number; maxTokens?: number }
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = getApiKey();
  const modelId = GEMINI_MODELS[modelKey];

  const geminiContents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const resp = await fetch(
    `${GEMINI_API_BASE}/models/${modelId}:streamGenerateContent?key=${apiKey}&alt=sse`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiContents,
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          maxOutputTokens: options?.maxTokens ?? 4096,
        },
      }),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Gemini streaming error [${resp.status}]: ${errText}`);
  }

  // Transform Gemini SSE into OpenAI-compatible SSE for the frontend
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const reader = resp.body!.getReader();

  return new ReadableStream({
    async pull(controller) {
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr || jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              // Emit in OpenAI-compatible format
              const chunk = {
                choices: [{ delta: { content: text }, index: 0 }],
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            }
          } catch { /* skip malformed */ }
        }
      }
    },
  });
}

/**
 * Generate an ephemeral token for Gemini Live API (client-side usage).
 * This allows the browser to connect directly to Gemini Live without exposing the API key.
 */
export async function getGeminiLiveEphemeralToken(): Promise<{ token: string; uri: string }> {
  const apiKey = getApiKey();
  const model = "gemini-3.1-flash-live-preview";

  const resp = await fetch(
    `${GEMINI_API_BASE}/models/${model}:generateEphemeralToken?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        config: {
          responseModalities: ["AUDIO"],
        },
      }),
    }
  );

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error(`Ephemeral token error [${resp.status}]: ${errText}`);
  }

  const data = await resp.json();
  return {
    token: data.token,
    uri: data.uri || `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`,
  };
}
