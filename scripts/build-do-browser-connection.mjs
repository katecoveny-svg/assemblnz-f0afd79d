import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { build } = createRequire(require.resolve('tsx'))('esbuild');
await build({ entryPoints: ['apps/do/browser/connection/entry.ts'], bundle: true, format: 'iife', globalName: 'DoTaskConnection', outfile: 'apps/do/extension/browser-task-core.js', minify: true, legalComments: 'none' });
