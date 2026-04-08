// ═══════════════════════════════════════════════════════════════
// SIM RUNNER — runs all Arataki + Pikau sims through the pipeline
// Usage:  node --experimental-strip-types supabase/functions/_shared/kete/run-sims.ts
// ═══════════════════════════════════════════════════════════════
import { runPipeline, maharaReset, maharaStoreSnapshot } from "./pipeline.ts";
import { arataki } from "./arataki/index.ts";
import { arataki_sims } from "./arataki/sims.ts";
import { pikau } from "./pikau/index.ts";
import { pikau_sims } from "./pikau/sims.ts";

interface SimResult {
  id: string;
  category: string;
  description: string;
  expected: string;
  actualStage: string;
  actualOk: boolean;
  pass: boolean;
  reasonMatch: boolean | null;
  blockedReason?: string;
  outputPreview?: string;
}

function classifyActual(result: { ok: boolean; stage: string }): string {
  if (result.ok) return "PASS";
  if (result.stage === "kahu")  return "BLOCK_KAHU";
  if (result.stage === "ta")    return "BLOCK_TA";
  if (result.stage === "mana")  return "BLOCK_MANA";
  return `BLOCK_${result.stage.toUpperCase()}`;
}

function runKete(name: string, kete: any, sims: any[]): SimResult[] {
  const out: SimResult[] = [];
  for (const s of sims) {
    maharaReset();
    const r: any = runPipeline(kete, s.request);
    const actual = classifyActual(r);
    const expectedMatch = actual === s.expected;
    let reasonMatch: boolean | null = null;
    if (s.expectedReasonContains) {
      const haystack = JSON.stringify({
        blocked: r.blockedReason ?? "",
        warnings: r.ta?.warnings ?? [],
        notes: r.ta?.notes ?? [],
        output: r.output ?? "",
      });
      reasonMatch = haystack.includes(s.expectedReasonContains);
    }
    const pass = expectedMatch && (reasonMatch === null || reasonMatch === true);
    out.push({
      id: s.id,
      category: s.category,
      description: s.description,
      expected: s.expected,
      actualStage: actual,
      actualOk: r.ok,
      pass,
      reasonMatch,
      blockedReason: r.blockedReason,
      outputPreview: (r.output ?? "").slice(0, 120),
    });
  }
  return out;
}

const arResults = runKete("ARATAKI", arataki, arataki_sims);
const piResults = runKete("PIKAU", pikau, pikau_sims);

function summary(label: string, results: SimResult[]) {
  const total = results.length;
  const passed = results.filter(r => r.pass).length;
  console.log(`\n══════ ${label} ══════`);
  console.log(`Total: ${total} · Passed: ${passed} · Failed: ${total - passed}`);
  for (const r of results) {
    const flag = r.pass ? "✅" : "❌";
    console.log(`  ${flag} ${r.id} [${r.category}] expected=${r.expected} actual=${r.actualStage}` +
      (r.reasonMatch === false ? " (reason mismatch)" : "") +
      (r.blockedReason ? `  ← ${r.blockedReason}` : ""));
  }
}

summary("ARATAKI", arResults);
summary("PIKAU", piResults);

const allPassed = [...arResults, ...piResults].every(r => r.pass);
console.log(`\n══════ OVERALL ══════`);
console.log(allPassed ? "ALL SIMS PASSED ✅" : "SIM FAILURES PRESENT ❌");

// Emit machine-readable JSON for the deliverables doc
const json = JSON.stringify({
  generatedAt: new Date().toISOString(),
  arataki: arResults,
  pikau: piResults,
  allPassed,
}, null, 2);
const outPath = process.argv[2] || "./sim-results.json";
import("node:fs").then(fs => {
  fs.writeFileSync(outPath, json);
  console.log(`Wrote ${outPath}`);
  if (!allPassed) process.exit(1);
});
