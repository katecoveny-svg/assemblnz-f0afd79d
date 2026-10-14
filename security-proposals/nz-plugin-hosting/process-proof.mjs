import { spawnSync } from 'node:child_process';
/** Fixed fixture probe, no inherited parent env, key values, user arguments or network. */
export function credentialAndNativeMemoryProbe() {
  const source = `const b = Buffer.alloc(64 * 1024 * 1024, 7);
const m = process.memoryUsage();
process.stdout.write(JSON.stringify({ bytes: b.length, heapUsed: m.heapUsed, rss: m.rss, external: m.external, maxRssBytes: process.resourceUsage().maxRSS * 1024, environmentKeys: Object.keys(process.env).sort() }));`;
  const r = spawnSync(process.execPath, ['--max-old-space-size=16', '--input-type=module', '-e', source], {
    env: { NODE_ENV: 'production', TZ: 'UTC', LANG: 'C' }, encoding: 'utf8', timeout: 3000, maxBuffer: 4096,
  });
  if (r.status !== 0) throw new Error('Bounded fixture process unavailable');
  return JSON.parse(r.stdout);
}
