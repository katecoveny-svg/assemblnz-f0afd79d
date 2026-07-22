#!/usr/bin/env tsx
/**
 * assembl — journey evaluation CLI
 * Runs the full everyday, assembled scenario suite. Exits non-zero when any
 * critical check fails, so CI/release gates can depend on it.
 *
 *   pnpm eval:journeys
 */

import { runEval } from '../lib/journey/eval/run-eval';

const report = runEval();

console.log(`\nassembl journey eval · v${report.version}`);
console.log('─'.repeat(52));
for (const r of report.results) {
  const mark = r.criticalFailed ? '✗' : r.passed ? '✓' : '±';
  console.log(`${mark} ${r.id.padEnd(14)} ${r.category}`);
  for (const c of r.checks.filter((x) => !x.passed)) {
    console.log(`    ↳ ${c.critical ? 'CRITICAL' : 'review'}: ${c.id} — ${c.detail}`);
  }
}
console.log('─'.repeat(52));
console.log(
  `${report.passed}/${report.total} scenarios passed · ${report.criticalFailures} critical failure(s)`,
);

if (report.criticalFailures > 0) {
  console.error('\nEval FAILED — critical checks did not pass.');
  process.exit(1);
}
console.log('Eval passed.\n');
