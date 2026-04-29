/**
 * check-brand-voice.ts
 *
 * Greps user-facing files for forbidden phrases listed in
 * /BRAND-VOICE-RULES.md. Fails CI (exit 1) on any match.
 *
 * Scope: src/pages/, src/components/, public/, index.html
 *
 * Allowlist:
 *   - This script and BRAND-VOICE-RULES.md itself
 *   - PRICING-LOCKED.md, PRICING-SOURCE-OF-TRUTH.md (canonical pricing memory)
 *   - docs/legacy-kete-codes.md (historical reference)
 *   - Lines containing the marker `// ALLOW: brand-voice exception`
 *     or `<!-- ALLOW: brand-voice exception -->`
 */
import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";

type Rule = {
  name: string;
  // ERE regex passed to grep -E
  regex: string;
  // Optional substrings that, if present on the matching line, mean "skip"
  allowSubstrings?: string[];
};

const RULES: Rule[] = [
  { name: "100% accurate", regex: "100% accurate" },
  { name: "always right", regex: "\\balways right\\b" },
  { name: "never wrong", regex: "\\bnever wrong\\b" },
  { name: "Replaces human judgment", regex: "[Rr]eplaces human judgment" },
  { name: "no oversight required", regex: "no oversight required" },
  { name: "Trained on 50+ NZ Acts", regex: "[Tt]rained on 50\\+ NZ Acts" },
  { name: "44 specialist agents", regex: "44 specialist agents" },
  { name: "42 specialist agents", regex: "42 specialist agents" },
  { name: "78 agents", regex: "\\b78 agents\\b" },
  { name: "9 kete", regex: "\\b9 kete\\b" },
  { name: "7 industry kete", regex: "\\b7 industry kete\\b" },
  { name: "16 industries", regex: "\\b16 industries\\b" },
  { name: "$199", regex: "\\$199\\b" },
  { name: "$399", regex: "\\$399\\b" },
  { name: "$799", regex: "\\$799\\b" },
  { name: "$2,500", regex: "\\$2,500\\b" },
  { name: "$15k", regex: "\\$15k\\b" },
  { name: "$15,000", regex: "\\$15,000\\b" },
  { name: "enterprise-grade", regex: "enterprise-grade" },
  { name: "synergy", regex: "\\bsynergy\\b" },
  { name: "world-class", regex: "world-class" },
  { name: "cutting-edge", regex: "cutting-edge" },
  { name: "game-changing", regex: "game-changing" },
  { name: "revolutionary", regex: "\\brevolutionary\\b" },
  { name: "unleash", regex: "\\bunleash\\b" },
  { name: "supercharge", regex: "\\bsupercharge\\b" },
  { name: "disrupt", regex: "\\bdisrupt\\b" },
  // "leverage" only when used as a verb — heuristic: followed by a space + word
  { name: "leverage (verb)", regex: "\\bleverage [a-z]" },
  // Retired kete tokens (Hanga handled in check-kete-names; keep here too as a backstop)
  {
    name: "Hanga (standalone)",
    regex: "\\bHanga\\b",
    allowSubstrings: ["WAIHANGA", "Waihanga", "whakahanga", "ŌHANGA"],
  },
  { name: "Pakihi", regex: "\\bPakihi\\b" },
  { name: "Waka", regex: "\\bWaka\\b" },
  { name: "Hangarau", regex: "\\bHangarau\\b" },
  { name: "Hauora", regex: "\\bHauora\\b" },
  { name: "Te Kāhui Reo", regex: "Te Kāhui Reo" },
  { name: "Tikanga-led", regex: "[Tt]ikanga-led" },
];

const TARGETS = ["src/pages/", "src/components/", "public/", "index.html"];

const ALLOW_PATHS = [
  "BRAND-VOICE-RULES.md",
  "scripts/check-brand-voice.ts",
  "PRICING-LOCKED.md",
  "PRICING-SOURCE-OF-TRUTH.md",
  "docs/legacy-kete-codes.md",
];

const ALLOW_LINE_MARKERS = [
  "// ALLOW: brand-voice exception",
  "<!-- ALLOW: brand-voice exception -->",
  "/* ALLOW: brand-voice exception */",
];

const INCLUDES = ["*.ts", "*.tsx", "*.md", "*.json", "*.html", "*.txt", "*.css"];
const includeFlags = INCLUDES.map((g) => `--include='${g}'`).join(" ");

type Hit = { rule: string; file: string; line: number; text: string };
const hits: Hit[] = [];

const existingTargets = TARGETS.filter((t) => existsSync(t));

for (const rule of RULES) {
  const targetList = existingTargets.join(" ");
  if (!targetList) continue;
  const cmd = `grep -rnE ${includeFlags} '${rule.regex}' ${targetList} 2>/dev/null || true`;
  let out = "";
  try {
    out = execSync(cmd, { encoding: "utf-8" });
  } catch {
    out = "";
  }
  const lines = out.split("\n").filter(Boolean);
  for (const raw of lines) {
    // grep -rn output: file:lineno:content
    const m = raw.match(/^([^:]+):(\d+):(.*)$/);
    if (!m) continue;
    const [, file, lineNo, text] = m;
    if (ALLOW_PATHS.some((p) => file === p || file.startsWith(p))) continue;
    if (ALLOW_LINE_MARKERS.some((mk) => text.includes(mk))) continue;
    if (rule.allowSubstrings?.some((s) => text.includes(s))) continue;
    hits.push({ rule: rule.name, file, line: Number(lineNo), text: text.trim() });
  }
}

if (hits.length > 0) {
  console.error(
    `❌ Brand-voice check failed — ${hits.length} forbidden phrase${hits.length === 1 ? "" : "s"} in user-facing copy.\n` +
      `   Source of truth: /BRAND-VOICE-RULES.md\n`
  );
  for (const h of hits) {
    console.error(`  [${h.rule}] ${h.file}:${h.line}`);
    console.error(`    ${h.text.slice(0, 200)}`);
  }
  console.error(
    `\nFix the copy or, if the match is a genuine exception, add the line marker:\n` +
      `  // ALLOW: brand-voice exception\n`
  );
  process.exit(1);
} else {
  console.log("✅ Brand-voice check passed. No forbidden phrases found.");
  // Sanity check: BRAND-VOICE-RULES.md must exist
  if (!existsSync("BRAND-VOICE-RULES.md")) {
    console.error("⚠️  BRAND-VOICE-RULES.md is missing — restore before deploy.");
    process.exit(1);
  }
  // Sanity check: $399 must be in the rules file
  const rules = readFileSync("BRAND-VOICE-RULES.md", "utf-8");
  if (!rules.includes("$399")) {
    console.error("⚠️  BRAND-VOICE-RULES.md no longer lists $399 as forbidden.");
    process.exit(1);
  }
  process.exit(0);
}
