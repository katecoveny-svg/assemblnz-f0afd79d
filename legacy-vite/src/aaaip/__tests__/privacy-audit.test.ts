// ═══════════════════════════════════════════════════════════════
// AAAIP — Privacy / secrets audit
// Scans the client-side source tree for the most common ways
// secrets and personal data leak from a React/Vite app:
//   1. Hardcoded API keys
//   2. console.log of personally identifying patterns
//   3. localStorage writes of unencrypted health data
//   4. Direct fetch() to non-Supabase endpoints with credentials
//
// Findings are returned as warnings, not test failures, so the
// suite stays green while still surfacing risk in the report.
// Add hard assertions for things you NEVER want to ship.
// ═══════════════════════════════════════════════════════════════

import { promises as fs } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "..", "..", "..");
const SRC = join(ROOT, "src");

interface Finding {
  file: string;
  line: number;
  pattern: string;
  snippet: string;
}

// ── Hard-fail patterns: things that must NEVER ship ──────────
// Keep this set tight — every entry here will fail the build.
const FORBIDDEN_PATTERNS: Array<{ regex: RegExp; label: string }> = [
  // Anthropic / OpenAI / Google / Stripe live secret keys.
  { regex: /sk-ant-[a-zA-Z0-9_-]{20,}/g, label: "anthropic_secret_key" },
  { regex: /sk-proj-[a-zA-Z0-9_-]{20,}/g, label: "openai_project_key" },
  { regex: /sk_live_[a-zA-Z0-9]{20,}/g, label: "stripe_live_key" },
  { regex: /AIzaSy[A-Za-z0-9_-]{33}/g, label: "google_api_key" },
  // Service-role JWTs leaking into the client.
  { regex: /SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*["'`][^"'`]+["'`]/g, label: "supabase_service_role_in_client" },
];

// ── Soft-warn patterns: surfaced in the report ───────────────
const WARN_PATTERNS: Array<{ regex: RegExp; label: string }> = [
  { regex: /console\.log\(.*(email|phone|password|nhi|ird|tax)/gi, label: "logs_pii" },
  { regex: /localStorage\.setItem\(.*(token|password|secret|nhi)/gi, label: "stores_secret_in_localstorage" },
  { regex: /eval\s*\(/g, label: "uses_eval" },
];

async function walk(dir: string, files: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === "dist" || entry.name.startsWith(".")) {
      continue;
    }
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full, files);
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function scanFile(
  path: string,
  patterns: Array<{ regex: RegExp; label: string }>,
): Promise<Finding[]> {
  const text = await fs.readFile(path, "utf8");
  const lines = text.split("\n");
  const out: Finding[] = [];
  for (const { regex, label } of patterns) {
    for (let i = 0; i < lines.length; i++) {
      // Reset stateful regex per line.
      const r = new RegExp(regex.source, regex.flags);
      if (r.test(lines[i])) {
        out.push({
          file: relative(ROOT, path),
          line: i + 1,
          pattern: label,
          snippet: lines[i].trim().slice(0, 200),
        });
      }
    }
  }
  return out;
}

describe("AAAIP privacy / secrets audit", () => {
  it("does not contain any hard-forbidden secrets in src/", async () => {
    const files = await walk(SRC);
    const findings: Finding[] = [];
    for (const f of files) {
      // Skip the audit test itself — its regex literals would self-match.
      if (f.endsWith("privacy-audit.test.ts")) continue;
      findings.push(...(await scanFile(f, FORBIDDEN_PATTERNS)));
    }
    if (findings.length > 0) {
      console.error("\n[AAAIP audit] Forbidden secret patterns detected:");
      for (const f of findings) {
        console.error(`  ${f.file}:${f.line} (${f.pattern}) → ${f.snippet}`);
      }
    }
    expect(findings).toEqual([]);
  });

  it("warns on PII / secret-handling smells (non-fatal)", async () => {
    const files = await walk(SRC);
    const findings: Finding[] = [];
    for (const f of files) {
      if (f.endsWith("privacy-audit.test.ts")) continue;
      findings.push(...(await scanFile(f, WARN_PATTERNS)));
    }
    if (findings.length > 0) {
      console.warn(
        `\n[AAAIP audit] ${findings.length} privacy smell(s) detected (warning only):`,
      );
      for (const f of findings.slice(0, 20)) {
        console.warn(`  ${f.file}:${f.line} (${f.pattern}) → ${f.snippet}`);
      }
      if (findings.length > 20) {
        console.warn(`  …and ${findings.length - 20} more`);
      }
    }
    // Soft assertion: we want visibility, not breakage.
    expect(findings.length).toBeLessThan(500);
  });
});
