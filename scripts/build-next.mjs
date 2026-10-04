import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

// The full application exceeds Node's default 2GB heap during TypeScript build.
// Preserve an explicitly configured limit (CI currently uses 6GB).
const require = createRequire(import.meta.url);
const inherited = process.env.NODE_OPTIONS || '';
const nodeOptions = /--max[-_]old[-_]space[-_]size(?:=|\s)/.test(inherited)
  ? inherited
  : `${inherited} --max-old-space-size=4096`.trim();
const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), 'build', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, NODE_OPTIONS: nodeOptions },
});
child.on('error', error => { console.error(error); process.exitCode = 1; });
child.on('exit', (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
