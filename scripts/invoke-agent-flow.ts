/**
 * scripts/invoke-agent-flow.ts
 * --------------------------------------------------------------------------
 * Smoke test for the ambient-agent-loop + mcp-chat flow.
 *
 * Usage:
 *   ASSEMBL_USER_JWT=<jwt> npx tsx scripts/invoke-agent-flow.ts --health
 *   ASSEMBL_USER_JWT=<jwt> npx tsx scripts/invoke-agent-flow.ts --smoke
 *   ASSEMBL_USER_JWT=<jwt> npx tsx scripts/invoke-agent-flow.ts --loop
 *
 * Flags:
 *   --health  GET /ambient-agent-loop?health → returns last run summary
 *   --smoke   POST a tiny chat to mcp-chat AND poke the loop, then read back
 *             the agent_thoughts rows that were just created
 *   --loop    POST to /ambient-agent-loop manually (requires admin JWT)
 *
 * Required env:
 *   ASSEMBL_USER_JWT — a valid Supabase access_token (signed-in browser session)
 *
 * Optional env (defaults baked in):
 *   ASSEMBL_SUPABASE_URL  — defaults to project URL
 *   ASSEMBL_AGENT_ID      — defaults to "iho"
 */

const SUPABASE_URL =
  process.env.ASSEMBL_SUPABASE_URL ??
  "https://ssaxxdkxzrvkdjsanhei.supabase.co";

const ANON_KEY =
  process.env.ASSEMBL_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzYXh4ZGt4enJ2a2Rqc2FuaGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MTcxODMsImV4cCI6MjA4OTM5MzE4M30.T4_NNdke3hFbPJcWvu_vx7Dn-M6HJp7GLJj5e5DlESI";

const AGENT_ID = process.env.ASSEMBL_AGENT_ID ?? "iho";
const JWT = process.env.ASSEMBL_USER_JWT;

const args = new Set(process.argv.slice(2));
const wantHealth = args.has("--health");
const wantSmoke = args.has("--smoke");
const wantLoop = args.has("--loop");

if (!wantHealth && !wantSmoke && !wantLoop) {
  console.error("Usage: --health | --smoke | --loop");
  process.exit(1);
}

function ensureJwt(): string {
  if (!JWT) {
    console.error(
      "ERROR: ASSEMBL_USER_JWT is required. Paste your access_token from a signed-in session.",
    );
    process.exit(1);
  }
  return JWT;
}

async function callHealth() {
  const url = `${SUPABASE_URL}/functions/v1/ambient-agent-loop?health=1`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${ANON_KEY}`, apikey: ANON_KEY },
  });
  const body = await res.text();
  console.log(`[health] HTTP ${res.status}`);
  console.log(body);
}

async function callLoopManual() {
  const jwt = ensureJwt();
  const url = `${SUPABASE_URL}/functions/v1/ambient-agent-loop`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      apikey: ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });
  const body = await res.text();
  console.log(`[loop] HTTP ${res.status}`);
  console.log(body);
  return res.ok;
}

async function callChatSmoke(): Promise<boolean> {
  const jwt = ensureJwt();
  const url = `${SUPABASE_URL}/functions/v1/mcp-chat`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      apikey: ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      agentId: AGENT_ID,
      messages: [{ role: "user", content: "Reply with one word: pong" }],
    }),
  });

  if (!res.ok || !res.body) {
    console.error(`[chat] HTTP ${res.status}`);
    console.error(await res.text());
    return false;
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let collected = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    collected += dec.decode(value, { stream: true });
  }
  console.log(`[chat] HTTP ${res.status} — ${collected.length} bytes streamed`);
  // Print the first delta we can find for sanity
  const firstDelta = collected
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.startsWith("data: ") && l !== "data: [DONE]");
  if (firstDelta) console.log(`[chat] first chunk: ${firstDelta.slice(0, 160)}`);
  return true;
}

async function readBackThoughts() {
  const jwt = ensureJwt();
  // PostgREST query — RLS scopes to the current user automatically.
  const url = `${SUPABASE_URL}/rest/v1/agent_thoughts?select=stage,thought,outcome,severity,created_at&order=created_at.desc&limit=10`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      apikey: ANON_KEY,
    },
  });
  const body = await res.text();
  console.log(`[thoughts] HTTP ${res.status}`);
  console.log(body);
}

(async () => {
  if (wantHealth) await callHealth();

  if (wantSmoke) {
    const chatOk = await callChatSmoke();
    if (!chatOk) process.exit(2);
    // Give the fire-and-forget thought inserts a moment to land
    await new Promise((r) => setTimeout(r, 1500));
    await readBackThoughts();
  }

  if (wantLoop) {
    const ok = await callLoopManual();
    if (!ok) process.exit(3);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
