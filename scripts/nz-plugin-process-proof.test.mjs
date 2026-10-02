import test from 'node:test';
import assert from 'node:assert/strict';
import { credentialAndNativeMemoryProbe } from '../security-proposals/nz-plugin-hosting/process-proof.mjs';
test('clean process fixture receives only explicit noncredential environment fields', () => {
  const p = credentialAndNativeMemoryProbe();
  assert.ok(p.environmentKeys.every(k => ['LANG', 'NODE_ENV', 'TZ', '__CF_USER_TEXT_ENCODING'].includes(k)));
  for (const k of ['LANG', 'NODE_ENV', 'TZ']) assert.ok(p.environmentKeys.includes(k));
  assert.equal(p.bytes, 64 * 1024 * 1024);
  assert.ok(p.heapUsed < 16 * 1024 * 1024);
  assert.ok(p.external >= p.bytes);
  assert.ok(p.rss > 16 * 1024 * 1024);
  assert.ok(p.maxRssBytes >= p.rss * 0.8);
  console.log(JSON.stringify({ scope: 'clean local fixture process only, no deployed isolation proof', ...p }));
});
