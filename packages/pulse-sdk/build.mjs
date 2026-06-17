// Build the Pulse SDK to ESM + CJS and assert the minified public bundle stays
// under the 5KB trust-and-footprint budget. Run via `node build.mjs`.
import { build } from 'esbuild';
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';

const SIZE_BUDGET_BYTES = 5 * 1024; // ≤5KB minified — locked in the brief.
const entry = 'src/index.ts';

const common = {
  entryPoints: [entry],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['es2020'],
  logLevel: 'info',
};

await build({ ...common, format: 'esm', outfile: 'dist/index.mjs' });
await build({ ...common, format: 'cjs', outfile: 'dist/index.cjs' });

const min = readFileSync('dist/index.mjs');
const gz = gzipSync(min);
const kb = (n) => (n / 1024).toFixed(2);
console.log(`\nPulse SDK minified: ${kb(min.byteLength)} KB  (gzip ${kb(gz.byteLength)} KB)`);

if (min.byteLength > SIZE_BUDGET_BYTES) {
  console.error(`\n✗ Bundle ${kb(min.byteLength)} KB exceeds the ${kb(SIZE_BUDGET_BYTES)} KB budget.`);
  process.exit(1);
}
console.log(`✓ Under the ${kb(SIZE_BUDGET_BYTES)} KB budget.`);
