// Automated smoke test for the deployed model-router edge function.
// Calls POST /functions/v1/model-router with three known agent slugs and
// asserts each returns its expected model_preference. Fails loudly if the
// agent_prompts seed drifts or the router stops resolving correctly.

import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL") ?? Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY =
  Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") ??
  Deno.env.get("SUPABASE_ANON_KEY") ??
  Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

const ENDPOINT = `${SUPABASE_URL}/functions/v1/model-router`;

const EXPECTED: Array<{ slug: string; model: string }> = [
  { slug: "signal", model: "anthropic/claude-opus-4-6" },
  { slug: "toro",   model: "google/gemini-2.5-flash" },
  { slug: "nova",   model: "perplexity/sonar-pro" },
];

async function callRouter(slug: string) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "apikey": SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ slug }),
  });
  const body = await res.json();
  return { status: res.status, body };
}

for (const { slug, model } of EXPECTED) {
  Deno.test(`model-router resolves "${slug}" to ${model}`, async () => {
    const { status, body } = await callRouter(slug);
    assertEquals(status, 200, `expected 200, got ${status}: ${JSON.stringify(body)}`);
    assertEquals(body.ok, true, `router returned ok=false: ${JSON.stringify(body)}`);
    assertEquals(
      body.resolved_model,
      model,
      `wrong model for "${slug}". Expected ${model}, got ${body.resolved_model}. Full response: ${JSON.stringify(body)}`,
    );
    assertEquals(
      body.is_fallback,
      false,
      `router fell back for "${slug}" — agent_prompts row may be missing or inactive: ${JSON.stringify(body)}`,
    );
    assertEquals(
      body.agent_name,
      slug,
      `agent_name mismatch for "${slug}": ${JSON.stringify(body)}`,
    );
  });
}
