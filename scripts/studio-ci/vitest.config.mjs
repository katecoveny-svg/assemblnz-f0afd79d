import {defineConfig} from 'vitest/config';
import path from 'node:path';
export default defineConfig({test:{include:['lib/private-showpiece/**/*.test.ts','scripts/studio-ci/**/*.test.ts']},resolve:{alias:{'@':process.cwd(),'server-only':path.resolve('test/server-only-stub.ts')}}});
