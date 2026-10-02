import { createRequire } from 'node:module';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const { build } = createRequire(resolve(root, 'packages/canvas/package.json'))('tsup');
await build({ entry: { worker: resolve(root, 'security-proposals/nz-plugin-hosting/parser-worker.ts') }, outDir: resolve(root, '.local-plugin-packages/freight-parser-proposal'), format: ['esm'], outExtension: () => ({ js: '.mjs' }), platform: 'node', target: 'node24', bundle: true, splitting: false, clean: true, noExternal: [/.*/], silent: true });
console.log('Built offline freight proposal worker; no route or deployment');
