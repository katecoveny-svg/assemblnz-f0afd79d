/* Pascal's built dist uses extensionless relative imports (a bundler-oriented
   tsc build). Node ESM requires the extension, so append it on resolve, trying
   `.js` then `/index.js`. Nothing else about the modules changes. */
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve as pres } from 'node:path';

export async function resolve(spec, ctx, next) {
  if (spec.startsWith('.') && !/\.[cm]?js$|\.json$/.test(spec) && ctx.parentURL?.startsWith('file:')) {
    const base = dirname(fileURLToPath(ctx.parentURL));
    for (const cand of [spec + '.js', spec + '/index.js']) {
      const p = pres(base, cand);
      if (existsSync(p)) return next(pathToFileURL(p).href, ctx);
    }
  }
  return next(spec, ctx);
}
