import { defineConfig } from 'tsup';

/**
 * Two build passes:
 *
 * 1. `tokens` — plain data, no directive banner, safe to import from React
 *    Server Components (`@assembl/canvas/tokens`).
 * 2. `index` + `motion` — components and framer-motion variants. They use
 *    hooks (`useReducedMotion`), so the bundles are stamped with the
 *    `"use client"` directive (tsup strips per-file directives when
 *    bundling, hence the banner).
 */
export default defineConfig([
  {
    entry: { tokens: 'src/tokens.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    outExtension({ format }) {
      return { js: format === 'cjs' ? '.cjs' : '.js' };
    },
  },
  {
    entry: { index: 'src/index.ts', motion: 'src/motion.tsx' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: false,
    external: ['react', 'framer-motion'],
    banner: { js: '"use client";' },
    outExtension({ format }) {
      return { js: format === 'cjs' ? '.cjs' : '.js' };
    },
  },
]);
