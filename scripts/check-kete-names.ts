/**
 * check-kete-names.ts
 * Fails if standalone "HANGA" (not part of "WAIHANGA", "whakahanga", "ŌHANGA")
 * appears as a kete name in source files.
 */
import { execSync } from "child_process";

const result = execSync(
  `grep -rn '\\bHANGA\\b' src/ supabase/ agents/ --include='*.ts' --include='*.tsx' --include='*.md' --include='*.json' 2>/dev/null || true`,
  { encoding: "utf-8" }
);

const lines = result
  .split("\n")
  .filter(Boolean)
  .filter((l) => !l.includes("WAIHANGA"))
  .filter((l) => !l.includes("whakahanga"))
  .filter((l) => !l.includes("ŌHANGA"))
  .filter((l) => !l.includes("check-kete-names"));

if (lines.length > 0) {
  console.error("❌ Found standalone HANGA references (should be WAIHANGA):\n");
  lines.forEach((l) => console.error("  " + l));
  process.exit(1);
} else {
  console.log("✅ No standalone HANGA references found. All clear.");
  process.exit(0);
}
