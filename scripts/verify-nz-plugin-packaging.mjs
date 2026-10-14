import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { unzipSync } from 'fflate';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const zones = ['UTC', 'Pacific/Auckland', 'America/Los_Angeles', 'Asia/Kathmandu'];
const baseline = new Map();
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const report = { zones, packages: [], scope: 'local self-contained development ZIPs; no network, deployment or submission' };
for (const TZ of zones) {
  const result = spawnSync(process.execPath, ['scripts/build-nz-plugin-candidates.mjs'], { cwd: root, env: { ...process.env, TZ }, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  for (const p of JSON.parse(result.stdout)) {
    const bytes = await readFile(resolve(root, '.local-plugin-packages', p.name));
    const payload = Object.fromEntries(Object.entries(unzipSync(bytes)).sort(([a], [b]) => a.localeCompare(b)).map(([path, data]) => [path, sha(data)]));
    if (!baseline.has(p.name)) {
      baseline.set(p.name, { bytes, payload }); report.packages.push({ name: p.name, bytes: bytes.length, sha256: sha(bytes), payloadHashes: payload });
    } else {
      assert.deepEqual(payload, baseline.get(p.name).payload, 'Packaged payload mismatch');
      assert.deepEqual(bytes, baseline.get(p.name).bytes, 'ZIP bytes differ across timezone');
    }
  }
}
await writeFile(resolve(root, '.local-plugin-packages/timezone-packaging-proof.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, packages: report.packages.map(({ payloadHashes, ...p }) => p) }, null, 2));
