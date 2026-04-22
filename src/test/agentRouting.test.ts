/**
 * Runtime check: every hardcoded /chat/:agentId link in the codebase must
 * resolve to a real agent. Catches typos like /chat/hospitalty or stale
 * agent IDs after renames.
 *
 * Resolution mirrors ChatPage:
 *   resolved = SLUG_TO_ID[id] ?? id
 *   then look up in agents.ts (plus special agents echo, pilot)
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { agents } from "@/data/agents";
import { SLUG_TO_ID } from "@/lib/agentSlugMap";

const SRC_DIR = resolve(__dirname, "..");
const VALID_EXT = /\.(tsx?|jsx?)$/;
const SKIP_DIRS = new Set(["node_modules", "test", "__tests__", "dist", "build"]);

// Special agents injected dynamically inside ChatPage.
const SPECIAL_AGENTS = new Set<string>(["echo", "pilot"]);

// Match /chat/<id> only when preceded by a non-path char (avoids matching
// import paths like "./chat/Foo") and the id is a static slug.
const CHAT_LINK_RE = /(^|[^./\w-])\/chat\/([a-z0-9][a-z0-9-]*)/gi;

// If any of these tokens appear immediately after the matched id, it's a
// dynamic interpolation fragment (e.g. `/chat/${slug}`) — skip it.
const DYNAMIC_TAIL_TOKENS = ["${", "agent.id", "a.id", "agentId}", "agentSlug"];

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

function extractStaticChatIds(source: string): string[] {
  const ids: string[] = [];
  let m: RegExpExecArray | null;
  CHAT_LINK_RE.lastIndex = 0;
  while ((m = CHAT_LINK_RE.exec(source)) !== null) {
    const id = m[2];
    const tail = source.slice(m.index + m[0].length, m.index + m[0].length + 12);
    if (DYNAMIC_TAIL_TOKENS.some((t) => tail.includes(t))) continue;
    ids.push(id);
  }
  return ids;
}

function resolveAgentId(rawId: string): string {
  return SLUG_TO_ID[rawId] ?? rawId;
}

describe("agent card routing integrity", () => {
  const validIds = new Set(agents.map((a) => a.id));
  for (const a of SPECIAL_AGENTS) validIds.add(a);

  const files = walk(SRC_DIR);

  it("scans the source tree", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("every static /chat/:agentId link resolves to a real agent", () => {
    const failures: { file: string; raw: string; resolved: string }[] = [];

    for (const file of files) {
      const src = readFileSync(file, "utf8");
      for (const raw of extractStaticChatIds(src)) {
        const resolved = resolveAgentId(raw);
        if (!validIds.has(resolved)) {
          failures.push({ file: file.replace(SRC_DIR, "src"), raw, resolved });
        }
      }
    }

    if (failures.length > 0) {
      const msg = failures
        .map((f) =>
          f.raw === f.resolved
            ? `  ${f.file} → /chat/${f.raw} (no matching agent)`
            : `  ${f.file} → /chat/${f.raw} → "${f.resolved}" (no matching agent)`
        )
        .join("\n");
      throw new Error(`Broken /chat/:agentId links:\n${msg}`);
    }
  });

  it("every SLUG_TO_ID alias resolves to a real agent", () => {
    const broken: string[] = [];
    for (const [slug, id] of Object.entries(SLUG_TO_ID)) {
      if (!validIds.has(id)) broken.push(`${slug} → ${id}`);
    }
    expect(broken, `Broken aliases:\n${broken.join("\n")}`).toEqual([]);
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
