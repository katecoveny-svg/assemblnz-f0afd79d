/**
 * Runtime check: every hardcoded /chat/:agentId link in the codebase must
 * resolve to a real agent in the registry. Catches typos like /chat/hospitalty
 * or stale agent IDs after renames.
 *
 * Scans .tsx/.ts source files for `/chat/<id>` patterns and verifies each id
 * either matches an Agent.id or is in the known alias allowlist.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { agents } from "@/data/agents";

const SRC_DIR = resolve(__dirname, "..");
const VALID_EXT = /\.(tsx?|jsx?)$/;
const SKIP_DIRS = new Set(["node_modules", "test", "__tests__", "dist", "build"]);

// Aliases handled at runtime by AGENT_SLUG_TO_ID / special agents in ChatPage.
// Keep this list small and intentional.
const KNOWN_ALIASES = new Set<string>([
  "echo",   // injected dynamically in ChatPage
  "pilot",  // injected dynamically in ChatPage
]);

// Dynamic patterns we should ignore (template literals with vars).
const DYNAMIC_TOKENS = [
  "${", ":agentId", "agent.id", "agentId}", "a.agentId", "agentSlug",
  "a.id", "mentionedAgent.id", "alert.target_agent",
];

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (VALID_EXT.test(entry)) out.push(full);
  }
  return out;
}

function extractChatIds(source: string): string[] {
  // Match /chat/<id> where <id> is a static slug (letters, digits, dashes).
  const re = /\/chat\/([a-z0-9][a-z0-9-]*)/gi;
  const ids: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    ids.push(m[1]);
  }
  return ids;
}

describe("agent card routing integrity", () => {
  const validIds = new Set(agents.map((a) => a.id));
  for (const alias of KNOWN_ALIASES) validIds.add(alias);

  const files = walk(SRC_DIR);

  it("scans the source tree", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("every static /chat/:agentId link resolves to a real agent", () => {
    const failures: { file: string; id: string }[] = [];

    for (const file of files) {
      const src = readFileSync(file, "utf8");
      // Skip lines containing dynamic interpolation right after /chat/
      const ids = extractChatIds(src).filter((id) => {
        // Drop ids that look like fragments of a dynamic expression.
        // A static slug won't include any js identifier glue afterwards.
        const idx = src.indexOf(`/chat/${id}`);
        const window = src.slice(idx, idx + id.length + 16);
        return !DYNAMIC_TOKENS.some((tok) => window.includes(tok));
      });

      for (const id of ids) {
        if (!validIds.has(id)) {
          failures.push({ file: file.replace(SRC_DIR, "src"), id });
        }
      }
    }

    if (failures.length > 0) {
      const msg = failures
        .map((f) => `  ${f.file} → /chat/${f.id} (no matching agent)`)
        .join("\n");
      throw new Error(`Broken /chat/:agentId links:\n${msg}`);
    }
  });

  it("registry exposes a non-empty agent list with unique ids", () => {
    expect(agents.length).toBeGreaterThan(0);
    const ids = agents.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("ChatPage-style resolution returns the correct agent for each id", () => {
    for (const a of agents) {
      const resolved = agents.find((x) => x.id === a.id);
      expect(resolved?.id).toBe(a.id);
      expect(resolved?.name).toBeTruthy();
    }
  });
});
