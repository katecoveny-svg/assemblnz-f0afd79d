/**
 * Suite CLI reporter (Phase 1C).
 *
 *   pnpm test:agents            # run every bundle, print the five-axis report
 *   pnpm test:agents practice   # run one bundle
 *
 * Exits non-zero if any scenario fails — usable as a standalone CI step in
 * addition to the vitest gate. Deterministic, no secrets required.
 */

import { BUNDLE_IDS } from './bundles';
import { runBundleSuite, summariseResult } from './run-suite';
import type { BundleId } from './types';

async function main() {
  const arg = process.argv[2] as BundleId | undefined;
  const bundles = arg ? [arg] : BUNDLE_IDS;

  let failedTotal = 0;
  for (const bundle of bundles) {
    const suite = await runBundleSuite(bundle);
    failedTotal += suite.failed;
    const mark = suite.passed ? '✓' : '✗';
    console.log(`\n${mark} ${bundle} — ${suite.total - suite.failed}/${suite.total} passed`);
    for (const r of suite.results) console.log(summariseResult(r));
  }

  console.log(
    failedTotal === 0
      ? '\nAll agent scenarios passed. Gate is green.'
      : `\n${failedTotal} scenario(s) failed. Gate is red — merge blocked.`,
  );
  process.exit(failedTotal === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
