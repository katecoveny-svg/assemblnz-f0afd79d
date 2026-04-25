#!/usr/bin/env -S npx tsx
/* eslint-disable no-console */
/**
 * invoke-agent-flow.ts — headless runner for the Assembl agent stack.
 *
 * Proves the full chat → context → response loop works end-to-end against
 * the deployed Supabase project, without the React UI. Designed to run
 * locally (sandbox can't reach the supabase host) or from CI.
 *
 * Modes:
 *   --single   : one agent, one prompt (default; lowest cost)
 *   --smoke    : all 7 industry kete + Tōro with a kete-specific prompt
 *   --health   : just hit /mcp-chat with a ping; reports HTTP status only
 *
 * Auth: requires a real user JWT. Two ways to provide it:
 *   1. Set ASSEMBL_USER_JWT env var (paste from `await session?.access_token`
 *      in browser DevTools while signed in, or print it from the Supabase
 *      dashboard).
 *   2. Set ASSEMBL_USER_EMAIL + ASSEMBL_USER_PASSWORD; the runner will
 *      sign in via the anon key + password grant and use the resulting
 *      access_token. Requires email auth enabled.
 *
 * Reads SUPABASE_URL + SUPABASE_ANON_KEY (or VITE_SUPABASE_URL +
 * VITE_SUPABASE_PUBLISHABLE_KEY) from the local .env automatically.
 *
 * Usage:
 *   npx tsx scripts/invoke-agent-flow.ts --single manaaki "Do I need a food control plan for my cafe?"
 *   npx tsx scripts/invoke-agent-flow.ts --smoke
 *   npx tsx scripts/invoke-agent-flow.ts --health
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// ---------------------------------------------------------------------------
// .env loader (no dotenv dependency — keep this script self-contained)
// ---------------------------------------------------------------------------
function loadDotEnv(path = resolve(process.cwd(), ".env")): void {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = value;
  }
}
loadDotEnv();

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("✖ Missing SUPABASE_URL / SUPABASE_ANON_KEY (or VITE_ equivalents) in env or .env");
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------
async function getJwt(): Promise<string> {
  if (process.env.ASSEMBL_USER_JWT) return process.env.ASSEMBL_USER_JWT;
  const email = process.env.ASSEMBL_USER_EMAIL;
  const password = process.env.ASSEMBL_USER_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "No user JWT available. Set ASSEMBL_USER_JWT, or ASSEMBL_USER_EMAIL + ASSEMBL_USER_PASSWORD.",
    );
  }
  const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(`Auth failed (${r.status}): ${body.slice(0, 200)}`);
  }
  const j = (await r.json()) as { access_token?: string };
  if (!j.access_token) throw new Error("Auth response missing access_token");
  return j.access_token;
}

// ---------------------------------------------------------------------------
// Stream parser — consumes SSE chunks and assembles the assistant reply
// ---------------------------------------------------------------------------
interface ChatResult {
  agentId: string;
  status: number;
  toolset?: string;
  kbHits?: number;
  memoryHits?: number;
  durationMs: number;
  text: string;
  error?: string;
}

async function chat(
  jwt: string,
  agentId: string,
  prompt: string,
): Promise<ChatResult> {
  const start = Date.now();
  const r = await fetch(`${SUPABASE_URL}/functions/v1/mcp-chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      agentId,
      messages: [{ role: "user", content: prompt }],
      params: { max_tokens: 512 },
    }),
  });

  const toolset = r.headers.get("X-Assembl-Toolset") ?? undefined;
  const kbHits = Number(r.headers.get("X-Assembl-Kb-Hits") ?? "0");
  const memoryHits = Number(r.headers.get("X-Assembl-Memory-Hits") ?? "0");

  if (!r.ok || !r.body) {
    const body = await r.text().catch(() => "");
    return {
      agentId,
      status: r.status,
      durationMs: Date.now() - start,
      text: "",
      toolset,
      kbHits,
      memoryHits,
      error: body.slice(0, 400),
    };
  }

  const reader = r.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let assembled = "";
  let manaPatch: string | null = null;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, nl);
      buffer = buffer.slice(nl + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") continue;
      try {
        const obj = JSON.parse(json) as {
          choices?: { delta?: { content?: string } }[];
          assembl_mana_patch?: { final_content?: string };
        };
        const delta = obj.choices?.[0]?.delta?.content;
        if (typeof delta === "string") assembled += delta;
        if (obj.assembl_mana_patch?.final_content) manaPatch = obj.assembl_mana_patch.final_content;
      } catch {
        // partial json — ignore
      }
    }
  }

  return {
    agentId,
    status: r.status,
    durationMs: Date.now() - start,
    text: manaPatch ?? assembled,
    toolset,
    kbHits,
    memoryHits,
  };
}

// ---------------------------------------------------------------------------
// Reporters
// ---------------------------------------------------------------------------
function fmt(result: ChatResult): string {
  const ok = result.status === 200 ? "✓" : "✖";
  const head = `${ok} ${result.agentId.padEnd(10)} ${result.status} ${String(result.durationMs).padStart(5)}ms`;
  const tail = result.error
    ? ` ERROR: ${result.error}`
    : ` [kb=${result.kbHits} mem=${result.memoryHits} toolset=${result.toolset ?? "?"}] reply: ${result.text.slice(0, 140).replace(/\s+/g, " ")}${result.text.length > 140 ? "…" : ""}`;
  return head + tail;
}

// ---------------------------------------------------------------------------
// Modes
// ---------------------------------------------------------------------------
const SMOKE_PROMPTS: Record<string, string> = {
  manaaki:  "Do I need a food control plan for my Wellington cafe? Cite the relevant Act.",
  waihanga: "What LBP licence class is required for restricted residential roof work? Cite the regs.",
  auaha:    "Draft a 30-word LinkedIn post announcing our new sustainable packaging line.",
  arataki:  "What are the WoF re-test requirements after a fail? Cite the rule.",
  pikau:    "What HS code applies to dried mānuka honey exports under HS 0409?",
  pakihi:   "Summarise the key supplier obligations under the CCA 2002 in three bullets.",
  toro:     "Help me plan dinner for a busy school night with leftover roast lamb.",
};

async function runSingle(jwt: string, agentId: string, prompt: string): Promise<void> {
  const r = await chat(jwt, agentId, prompt);
  console.log(fmt(r));
  if (r.text) {
    console.log("\n--- assistant reply ---");
    console.log(r.text);
  }
  process.exit(r.status === 200 ? 0 : 1);
}

async function runSmoke(jwt: string): Promise<void> {
  console.log(`\n=== Assembl smoke suite (${Object.keys(SMOKE_PROMPTS).length} agents) ===`);
  console.log(`Target: ${SUPABASE_URL}\n`);
  const results: ChatResult[] = [];
  for (const [agentId, prompt] of Object.entries(SMOKE_PROMPTS)) {
    const r = await chat(jwt, agentId, prompt);
    console.log(fmt(r));
    results.push(r);
  }
  const ok = results.filter((r) => r.status === 200).length;
  const kb = results.reduce((sum, r) => sum + (r.kbHits ?? 0), 0);
  const mem = results.reduce((sum, r) => sum + (r.memoryHits ?? 0), 0);
  const avgMs = Math.round(results.reduce((sum, r) => sum + r.durationMs, 0) / results.length);
  console.log(`\n=== ${ok}/${results.length} OK · avg ${avgMs}ms · ${kb} kb hits · ${mem} memory hits ===`);
  process.exit(ok === results.length ? 0 : 1);
}

async function runHealth(): Promise<void> {
  // No auth — just confirms the function is deployed and routes (will 401)
  const r = await fetch(`${SUPABASE_URL}/functions/v1/mcp-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
    body: JSON.stringify({ agentId: "manaaki", messages: [{ role: "user", content: "ping" }] }),
  });
  const body = await r.text().catch(() => "");
  console.log(`/mcp-chat health: HTTP ${r.status}`);
  console.log(`response: ${body.slice(0, 240)}`);
  // 401 means deployed and rejecting unauth — that's healthy. 404 means missing.
  process.exit(r.status === 401 || r.status === 200 ? 0 : 1);
}

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const mode = args[0] ?? "--single";

  if (mode === "--health") return runHealth();

  const jwt = await getJwt();

  if (mode === "--smoke") return runSmoke(jwt);

  if (mode === "--single") {
    const agentId = args[1] ?? "manaaki";
    const prompt = args.slice(2).join(" ") || "Hello, can you confirm you're connected to live knowledge?";
    return runSingle(jwt, agentId, prompt);
  }

  console.error(`Unknown mode: ${mode}`);
  console.error("Usage: invoke-agent-flow.ts [--single <agentId> <prompt> | --smoke | --health]");
  process.exit(2);
}

main().catch((e) => {
  console.error("FATAL:", e instanceof Error ? e.message : e);
  process.exit(1);
});
