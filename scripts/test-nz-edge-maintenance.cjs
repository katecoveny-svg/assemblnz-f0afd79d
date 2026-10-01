const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const root = resolve(__dirname, '../security-proposals/nz-edge-maintenance');

for (const slug of ['mcp-nz-govt', 'compliance-scanner']) {
  const code = readFileSync(resolve(root, `proposed/${slug}/index.ts`), 'utf8');
  for (const method of ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']) {
    test(`${slug} ${method} never reads body/headers/env or calls effects`, async () => {
      let handler;
      const fail = () => { throw Error('forbidden effect'); };
      const Deno = { serve: h => { handler = h; }, env: { get: fail } };
      runInNewContext(code, { Deno, Response, fetch: fail, createClient: fail, console: { log: fail, error: fail } });
      const request = { method, json: fail, text: fail, arrayBuffer: fail,
        get headers() { return fail(); }, get body() { return fail(); } };
      const result = await handler(request);
      assert.equal(result.status, method === 'OPTIONS' ? 204 : 503);
      assert.equal(result.headers.get('access-control-allow-origin'), '*');
      assert.equal(result.headers.get('cache-control'), 'no-store');
      if (method === 'OPTIONS') assert.equal(await result.text(), '');
      else assert.deepEqual(await result.json(), { error: 'temporarily_unavailable', source: slug });
      assert.doesNotMatch(code, /import\s|fetch\s*\(|\.env\.|\.from\s*\(|req\.(json|text|headers|body)/);
    });
  }
}
test('rollback manifest preserves exact retrieved files and source hashes', () => {
  const manifest = JSON.parse(readFileSync(resolve(root, 'rollback-manifest.json'), 'utf8'));
  assert.deepEqual(manifest.functions.map(f => [f.slug, f.version, f.verify_jwt]), [
    ['mcp-nz-govt', 115, false], ['compliance-scanner', 102, false],
  ]);
  for (const f of manifest.functions) for (const file of f.files) {
    const content = readFileSync(resolve(root, 'rollback', f.slug, file.name));
    assert.equal(createHash('sha256').update(content).digest('hex'), file.sha256);
  }
});
