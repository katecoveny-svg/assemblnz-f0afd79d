import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';
import { expect, it, vi } from 'vitest';
import * as memoryAuth from '../../supabase/functions/_shared/memory-auth';

const alice = '11111111-1111-4111-8111-111111111111';
const bob = '22222222-2222-4222-8222-222222222222';
const service = 'synthetic-service-test-value';

// Execute the actual Edge handler, replacing only its hosted dependencies.
// No real database, provider, credential, microphone, or user data is used.
function loadHandler(name: string, verifiedUser: { id: string; is_anonymous?: boolean } | null = { id: alice }) {
  const getUser = vi.fn(async () => ({ data: { user: verifiedUser }, error: null }));
  const rpc = vi.fn(async () => ({ data: [], error: null }));
  const from = vi.fn(() => { throw new Error('Unexpected database access'); });
  const embedText = vi.fn(async () => [1, 0, 0]);
  let handler: (req: Request) => Promise<Response> = () => { throw new Error('Handler was not registered'); };
  const capture = (fn: typeof handler) => { handler = fn; };
  const source = readFileSync(resolve(`supabase/functions/${name}/index.ts`), 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  });
  const dependencies = (path: string) => {
    if (path.includes('/http/server.ts')) return { serve: capture };
    if (path.includes('supabase-js')) return { createClient: () => ({ auth: { getUser }, rpc, from }) };
    if (path.endsWith('/embed.ts')) return { embedText };
    if (path.endsWith('/memory-auth.ts')) return memoryAuth;
    throw new Error(`Unexpected dependency ${path}`);
  };
  const settings: Record<string, string> = {
    SUPABASE_URL: 'https://test.invalid', SUPABASE_SERVICE_ROLE_KEY: service,
    GEMINI_API_KEY: 'synthetic-provider-test-value',
  };
  new Function('require', 'exports', 'Deno', outputText)(dependencies, {}, {
    env: { get: (key: string) => settings[key] }, serve: capture,
  });
  return { handler, getUser, rpc, from, embedText };
}
const request = (token?: string, body: unknown = { query: 'A synthetic query' }) => new Request('https://test.invalid', {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  body: JSON.stringify(body),
});

it('rejects signed-out recall before model or database access', async () => {
  const h = loadHandler('memory-recall');
  expect((await h.handler(request(undefined, { user_id: bob, query: 'private' }))).status).toBe(401);
  expect(h.rpc).not.toHaveBeenCalled(); expect(h.embedText).not.toHaveBeenCalled();
});
it('rejects a forged recall owner before model or database access', async () => {
  const h = loadHandler('memory-recall');
  expect((await h.handler(request('user-token', { user_id: bob, query: 'private' }))).status).toBe(403);
  expect(h.rpc).not.toHaveBeenCalled(); expect(h.embedText).not.toHaveBeenCalled();
});
it('derives recall owner from Auth when the client omits it', async () => {
  const h = loadHandler('memory-recall');
  expect((await h.handler(request('user-token'))).status).toBe(200);
  expect(h.rpc).toHaveBeenCalledWith('match_agent_memory', expect.objectContaining({ p_user_id: alice }));
});
it('does not allow a service recall without an explicit owner', async () => {
  const h = loadHandler('memory-recall');
  expect((await h.handler(request(service))).status).toBe(403);
  expect(h.rpc).not.toHaveBeenCalled(); expect(h.embedText).not.toHaveBeenCalled();
});
it('retains explicitly scoped trusted-service recall', async () => {
  const h = loadHandler('memory-recall');
  expect((await h.handler(request(service, { user_id: bob, query: 'synthetic' }))).status).toBe(200);
  expect(h.rpc).toHaveBeenCalledWith('match_agent_memory', expect.objectContaining({ p_user_id: bob }));
});
it('bounds query and result count before calling the provider', async () => {
  for (const body of [{ query: 'x', limit: 1000 }, { query: 'x'.repeat(8001) }, { query: { text: 'x' } }]) {
    const h = loadHandler('memory-recall');
    expect((await h.handler(request('user-token', body))).status).toBe(400);
    expect(h.rpc).not.toHaveBeenCalled(); expect(h.embedText).not.toHaveBeenCalled();
  }
});
it.each(['memory-extractor', 'memory-backfill-embeddings'])('%s refuses browser callers before touching data', async name => {
  const h = loadHandler(name);
  expect((await h.handler(request('user-token'))).status).toBe(401);
  expect(h.from).not.toHaveBeenCalled();
});
