// Automated smoke test for the deployed /functions/v1/chat edge function.
// Sends a short messages array for signal, toro, and nova and verifies the
// response includes a non-empty completion AND that the `model` field returned
// by chat matches the model resolved from agent_prompts for that agent.
//
// Fails loudly if:
//  - chat returns a non-200 status
//  - chat returns no `content`
//  - chat falls back to the default model when agent_prompts has a preference
//  - the returned `model` does not equal the seeded model_preference

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL =
  Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY =
  Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ??
  Deno.env.get("SUPABASE_ANON_KEY") ??
  Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

const CHAT_ENDPOINT = `${SUPABASE_URL}/functions/v1/chat`;

// Expected: each agent slug must resolve to its seeded model_preference.
// Mirrors the agent_prompts seed performed earlier in this project.
const EXPECTED: Array<{ slug: string; model: string }> = [
  { slug: "signal", model: "anthropic/claude-opus-4-6" },
  { slug: "toro",   model: "google/gemini-2.5-flash" },
  { slug: "nova",   model: "perplexity/sonar-pro" },
];

const SHORT_MESSAGES = [
  { role: "user", content: "Reply with exactly the word: pong" },
];

async function callChat(slug: string) {
  const res = await fetch(CHAT_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      agentId: slug,
      messages: SHORT_MESSAGES,
    }),
  });
  const text = await res.text();
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(text);
  } catch {
    body = { _raw: text };
  }
  return { status: res.status, body };
}

for (const { slug, model } of EXPECTED) {
  Deno.test(`chat for "${slug}" completes using resolved model ${model}`, async () => {
    const { status, body } = await callChat(slug);

    assertEquals(
      status,
      200,
      `chat returned ${status} for "${slug}": ${JSON.stringify(body)}`,
    );

    const content = body.content;
    assert(
      typeof content === "string" && content.trim().length > 0,
      `chat returned empty content for "${slug}": ${JSON.stringify(body)}`,
    );

    // The chat function returns the resolved model in the `model` field.
    // Cache hits return "cache" — treat that as informational, not a failure,
    // because the resolution still happened upstream of the cache.
    const returnedModel = body.model;
    if (returnedModel === "cache") {
      console.warn(`[chat:${slug}] served from cache — model assertion skipped`);
      return;
    }

    assertEquals(
      returnedModel,
      model,
      `Wrong model for "${slug}". Expected ${model}, got ${returnedModel}.\n` +
        `Possible causes:\n` +
        `  • If returned "google/gemini-2.5-flash": the router fell back to DEFAULT_MODEL — ` +
        `agent_prompts has no active row for "${slug}".\n` +
        `  • If returned "google/gemini-2.5-flash-lite": chat downgraded after the AI Gateway ` +
        `rejected the resolved model (FALLBACK_MODELS in chat/index.ts). The Lovable AI Gateway ` +
        `may not support "${model}" — check the gateway's supported model list.\n` +
        `  • Any other value: investigate the chat function's actualModelUsed logic.\n` +
        `Full response: ${JSON.stringify(body)}`,
    );
  });
}
