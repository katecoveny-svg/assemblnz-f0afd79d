/**
 * predeploy-validate-agents.ts
 *
 * Pre-deploy gate. Fails CI (exit 1) if any of the following are true for
 * the active agents in the live database:
 *
 *   1. Pack/name collision     — two or more rows share lower(agent_name).
 *                                The model router resolves agents by slug,
 *                                so duplicates are non-deterministic.
 *   2. Unprefixed model_pref   — `model_preference` is set but does not match
 *                                the router's PREFIX_MAP (must be either a
 *                                fully qualified "<provider>/<model>" or a
 *                                known short alias like "gpt-5-mini").
 *   3. Missing agent_status    — an active agent has no row in agent_status,
 *                                which leaves the live status indicator and
 *                                maintenance message unable to render.
 *
 * Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the environment.
 * Service role is needed so we can bypass RLS for a global view.
 *
 * Usage:
 *   npx tsx scripts/predeploy-validate-agents.ts
 *   # or via package.json: "predeploy": "tsx scripts/predeploy-validate-agents.ts"
 */

import { createClient } from "@supabase/supabase-js";

// ─── Known short aliases (mirror supabase/functions/_shared/model-router.ts) ──
const KNOWN_PREFIXES = new Set([
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-3.1-pro-preview",
  "gemini-3-flash-preview",
  "gemini-2.5-flash-lite",
  "gemini-2.5-flash-image",
  "gpt-5",
  "gpt-5-mini",
  "gpt-5-nano",
  "gpt-5.2",
  "claude-sonnet-4-5",
]);

const VALID_PROVIDERS = new Set(["google", "openai", "anthropic", "perplexity"]);

interface AgentRow {
  id: string;
  agent_name: string;
  display_name: string;
  pack: string;
  is_active: boolean | null;
  model_preference: string | null;
}

interface StatusRow {
  agent_id: string;
}

// ─── Env ─────────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "❌ predeploy-validate-agents: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment.",
  );
  process.exit(2);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ─── Validators ──────────────────────────────────────────────────────────────
function findCollisions(agents: AgentRow[]): Array<{ slug: string; rows: AgentRow[] }> {
  const groups = new Map<string, AgentRow[]>();
  for (const a of agents) {
    if (!a.is_active) continue;
    const slug = a.agent_name.trim().toLowerCase();
    if (!groups.has(slug)) groups.set(slug, []);
    groups.get(slug)!.push(a);
  }
  return Array.from(groups.entries())
    .filter(([, rows]) => rows.length > 1)
    .map(([slug, rows]) => ({ slug, rows }));
}

function findUnprefixedModels(agents: AgentRow[]): AgentRow[] {
  return agents.filter((a) => {
    if (!a.is_active) return false;
    const m = a.model_preference;
    if (!m) return false; // null is fine — router falls back to DEFAULT_MODEL
    if (m.includes("/")) {
      const provider = m.split("/")[0];
      return !VALID_PROVIDERS.has(provider);
    }
    return !KNOWN_PREFIXES.has(m);
  });
}

function findMissingStatus(agents: AgentRow[], statuses: Set<string>): AgentRow[] {
  return agents.filter((a) => a.is_active && !statuses.has(a.agent_name));
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log("🔍 Pre-deploy validation: agent_prompts + agent_status\n");

  const [{ data: agents, error: agentsErr }, { data: statusRows, error: statusErr }] =
    await Promise.all([
      supabase
        .from("agent_prompts")
        .select("id, agent_name, display_name, pack, is_active, model_preference"),
      supabase.from("agent_status").select("agent_id"),
    ]);

  if (agentsErr) {
    console.error(`❌ Failed to read agent_prompts: ${agentsErr.message}`);
    process.exit(2);
  }
  if (statusErr) {
    console.error(`❌ Failed to read agent_status: ${statusErr.message}`);
    process.exit(2);
  }

  const allAgents = (agents ?? []) as AgentRow[];
  const activeAgents = allAgents.filter((a) => a.is_active);
  const statusSet = new Set((statusRows ?? []).map((r: StatusRow) => r.agent_id));

  console.log(
    `   Inspecting ${activeAgents.length} active agents (${allAgents.length} total) and ${statusSet.size} status rows.\n`,
  );

  const collisions = findCollisions(allAgents);
  const unprefixed = findUnprefixedModels(allAgents);
  const missingStatus = findMissingStatus(allAgents, statusSet);

  let failed = false;

  // Check 1 — Collisions
  if (collisions.length === 0) {
    console.log("✅ [1/3] No active pack/name collisions.");
  } else {
    failed = true;
    console.error(`❌ [1/3] ${collisions.length} active pack/name collision(s):`);
    for (const c of collisions) {
      console.error(`     • ${c.slug}`);
      for (const r of c.rows) {
        console.error(`         pack=${r.pack}  display=${r.display_name}  id=${r.id}`);
      }
    }
  }

  // Check 2 — Unprefixed models
  if (unprefixed.length === 0) {
    console.log("✅ [2/3] All active model_preference values resolve through the router.");
  } else {
    failed = true;
    console.error(
      `❌ [2/3] ${unprefixed.length} active agent(s) with unrecognised model_preference:`,
    );
    for (const a of unprefixed) {
      console.error(
        `     • ${a.pack}/${a.agent_name}  →  "${a.model_preference}"  (not in PREFIX_MAP and missing valid provider/)`,
      );
    }
  }

  // Check 3 — Missing status
  if (missingStatus.length === 0) {
    console.log("✅ [3/3] Every active agent has a row in agent_status.");
  } else {
    failed = true;
    console.error(
      `❌ [3/3] ${missingStatus.length} active agent(s) missing an agent_status row:`,
    );
    for (const a of missingStatus) {
      console.error(`     • ${a.pack}/${a.agent_name}  (id=${a.id})`);
    }
  }

  console.log();
  if (failed) {
    console.error(
      "✖ Pre-deploy validation FAILED. Fix the issues above (use /admin/agent-inspector) and rerun.",
    );
    process.exit(1);
  }
  console.log("✓ Pre-deploy validation PASSED.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Unexpected error in predeploy-validate-agents:", err);
  process.exit(2);
});
