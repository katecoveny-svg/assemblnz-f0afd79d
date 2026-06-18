import { defineConfig } from 'vitest/config';

// Package-local config so `pnpm --filter @assembl/dash-sdk test` (or `vitest
// run` from this dir) finds the SDK's own tests. The root config also picks
// these up via its `packages/**/*.test.ts` include when run from the repo root.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
