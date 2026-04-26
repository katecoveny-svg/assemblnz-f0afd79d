/**
 * check-kete-count.ts
 * Fails CI if any source file claims the wrong kete count.
 * Source of truth: seven industry kete + Tōro.
 *
 * Greps src/ and public/ for case-insensitive matches of:
 *   - "five industry kete"
 *   - "six industry kete"
 *   - "5 industry kete"
 *   - "6 industry kete"
 *
 * Exits 1 if any match. Pure shell-grep, no deps.
 */
import { execSync } from "child_process";

const PATTERNS = [
  "five industry kete",
  "six industry kete",
  "5 industry kete",
  "6 industry kete",
];

const TARGETS = ["src/", "public/"];

const cmd = `grep -rniE '${PATTERNS.join("|")}' ${TARGETS.join(" ")} \
  --include='*.ts' --include='*.tsx' --include='*.md' --include='*.json' \
  --include='*.html' --include='*.txt' 2>/dev/null || true`;

const result = execSync(cmd, { encoding: "utf-8" });

const lines = result
  .split("\n")
  .filter(Boolean)
  // Allow this guardrail script itself to mention the patterns
  .filter((l) => !l.includes("check-kete-count"));

if (lines.length > 0) {
  console.error(
    "❌ Found stale kete-count references. The source of truth is " +
      '"seven industry kete + Tōro". Update these files:\n'
  );
  lines.forEach((l) => console.error("  " + l));
  process.exit(1);
} else {
  console.log("✅ Kete count consistent — seven industry kete + Tōro everywhere.");
  process.exit(0);
}
