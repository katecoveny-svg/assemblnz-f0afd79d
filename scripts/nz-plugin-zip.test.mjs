import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { unzipSync } from 'fflate';
import { developmentPluginZip } from './lib/nz-plugin-zip.mjs';

const source = `import { developmentPluginZip } from './scripts/lib/nz-plugin-zip.mjs';
const files = { 'z.txt': new TextEncoder().encode('fictional'), 'a/plugin.json': new TextEncoder().encode('{"schemaVersion":"1.0"}') };
process.stdout.write(Buffer.from(developmentPluginZip(files)).toString('base64'));`;
test('ZIP bytes, payloads and local/central DOS timestamps match across timezones', () => {
  const outputs = ['UTC', 'Pacific/Auckland', 'America/Los_Angeles', 'Asia/Kathmandu'].map(TZ => {
    const p = spawnSync(process.execPath, ['--input-type=module', '-e', source], { cwd: new URL('..', import.meta.url), env: { ...process.env, TZ }, encoding: 'utf8' });
    assert.equal(p.status, 0, p.stderr);
    return Buffer.from(p.stdout, 'base64');
  });
  for (const bytes of outputs) {
    assert.deepEqual(bytes, outputs[0]);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), createHash('sha256').update(outputs[0]).digest('hex'));
    const files = unzipSync(bytes);
    assert.equal(new TextDecoder().decode(files['z.txt']), 'fictional');
    assert.equal(new TextDecoder().decode(files['a/plugin.json']), '{"schemaVersion":"1.0"}');
    for (let i = 0; i < bytes.length - 46; i++) {
      const sig = bytes.readUInt32LE(i);
      const off = sig === 0x04034b50 ? 10 : sig === 0x02014b50 ? 12 : null;
      if (off !== null) { assert.equal(bytes.readUInt16LE(i + off), 0); assert.equal(bytes.readUInt16LE(i + off + 2), 0x5c21); }
    }
  }
});
test('member order is deterministic and input bytes remain unmodified', () => {
  const a = new TextEncoder().encode('a'), b = new TextEncoder().encode('b');
  assert.deepEqual(developmentPluginZip({ b, a }), developmentPluginZip({ a, b }));
  assert.equal(a[0], 97); assert.throws(() => developmentPluginZip({ a: 'not bytes' }));
});
