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
    ],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
