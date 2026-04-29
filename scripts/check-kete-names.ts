/**
 * check-kete-names.ts
 *
 * Fails CI if any retired kete name appears as a standalone token in the
 * codebase. Retired names (locked April 2026):
 *   HANGA, PAKIHI, WAKA, HANGARAU, HAUORA, TE KĀHUI REO
 *
 * Allowlist (do NOT flag):
 *   - WAIHANGA, whakahanga, ŌHANGA  (substrings containing HANGA)
 *   - This script itself
 *   - docs/legacy-kete-codes.md
 *   - Any line containing the marker `// ALLOW: retired-name reference`
 */
import { execSync } from "child_process";

type Pattern = { name: string; regex: string };

// Use word-boundary-ish patterns. Postgres-style \b in BRE/ERE works on
// ASCII boundaries; Te Kāhui Reo uses a multi-word match.
const PATTERNS: Pattern[] = [
  { name: "HANGA", regex: "\\bHANGA\\b" },
  { name: "PAKIHI", regex: "\\bPAKIHI\\b" },
  { name: "WAKA", regex: "\\bWAKA\\b" },
  { name: "HANGARAU", regex: "\\bHANGARAU\\b" },
  { name: "HAUORA", regex: "\\bHAUORA\\b" },
  { name: "TE KĀHUI REO", regex: "TE KĀHUI REO" },
  { name: "TE-KAHUI-REO", regex: "TE-KAHUI-REO" },
  { name: "TE KAHUI REO", regex: "TE KAHUI REO" },
];

const TARGETS = ["src/", "supabase/", "agents/", "public/"];

const ALLOW_SUBSTRINGS = [
  "WAIHANGA",
  "whakahanga",
  "ŌHANGA",
  "check-kete-names",
  "docs/legacy-kete-codes.md",
  "// ALLOW: retired-name reference",
];

/**
 * Path-based allowlist — files that legitimately retain retired-pack
 * references because admin pages still need to render historical agent
 * records. New code MUST NOT add retired names; these paths are the
 * only sanctioned home for them outside docs/legacy-kete-codes.md.
 */
const ALLOW_PATHS = [
  "src/data/agents.ts",
  "src/data/agentCapabilities.ts",
  "src/data/agentLiveDataMap.ts",
  "src/data/agentSkillConfig.ts",
  "src/lib/intentClassifier.ts",
  "src/components/SparkSection.tsx",
  "supabase/functions/agent-router/",
  "supabase/functions/chat/",
  "supabase/functions/claude-chat/",
  "supabase/functions/echo-respond/",
  "supabase/functions/iho-router/",
  "supabase/functions/mcp-chat/",
  "agents/echo/knowledge-base.md",
  "public/brand-assets.html",
  "public/unified-brand-system-v2.html",
];

const INCLUDES = [
  "*.ts",
  "*.tsx",
  "*.md",
  "*.json",
  "*.html",
  "*.txt",
];

const includeFlags = INCLUDES.map((g) => `--include='${g}'`).join(" ");
const targetList = TARGETS.join(" ");

const failures: { pattern: string; line: string }[] = [];

for (const p of PATTERNS) {
  const cmd = `grep -rnE ${includeFlags} '${p.regex}' ${targetList} 2>/dev/null || true`;
  const out = execSync(cmd, { encoding: "utf-8" });
  const lines = out
    .split("\n")
    .filter(Boolean)
    .filter((l) => !ALLOW_SUBSTRINGS.some((s) => l.includes(s)));
  for (const l of lines) failures.push({ pattern: p.name, line: l });
}

if (failures.length > 0) {
  console.error(
    "❌ Found retired kete-name references. Source of truth: 7 industry kete (Manaaki, Waihanga, Auaha, Arataki, Pikau, Hoko, Ako) + Tōro.\n" +
      "Retired names must be removed or moved into docs/legacy-kete-codes.md " +
      "(or marked with `// ALLOW: retired-name reference`).\n"
  );
  for (const f of failures) {
    console.error(`  [${f.pattern}] ${f.line}`);
  }
  process.exit(1);
} else {
  console.log("✅ No retired kete-name references found. All clear.");
  process.exit(0);
}
