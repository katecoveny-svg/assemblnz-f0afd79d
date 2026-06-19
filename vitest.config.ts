import { defineConfig } from 'vitest/config';
import path from 'node:path';

// Vitest configuration scoped to the Next.js side of the repo.
//
// - `include` only catches `.test.ts` files under `lib/` and `app/` so we
//   don't accidentally try to run the Deno tests in `supabase/functions/**`,
//   which use Deno's std/assert and `Deno.test` and would error under Node.
// - `@/...` path alias mirrors `tsconfig.json` so filters can import
//   `@/lib/supabase/server` exactly like they do at runtime.
export default defineConfig({
  test: {
    include: [
      'lib/**/*.test.ts',
      'lib/**/__tests__/**/*.test.ts',
      'app/**/*.test.ts',
      'packages/**/*.test.ts',
      // Dash Loader pure-logic tests live beside the component under
      // components/ (node env — no DOM needed; the logic is framework-free).
      'components/**/*.test.ts',
    ],
    // Exclude self-contained tsx-runner scripts that pre-date vitest in this
    // repo. They live under __tests__ for proximity to the code they test but
    // are invoked via `npx tsx <file>` and call process.exit() at the end,
    // which vitest treats as a fatal pool error.
    exclude: ['lib/toro/__tests__/state-machine.test.ts', 'node_modules/**'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      // `server-only` is a Next.js build-time guard with no Node entry point;
      // stub it so server modules can be unit-tested under the node env.
      'server-only': path.resolve(__dirname, 'test/server-only-stub.ts'),
    },
  },
});
