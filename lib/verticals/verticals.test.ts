import { describe, expect, it, vi } from 'vitest';
import { runInNewContext } from 'node:vm';
import { VERTICALS, VERTICAL_SLUGS, getVertical, isVerticalWorkerScope, verticalForPath, verticalManifest, verticalShareUrl } from './config';
import { verticalWorker } from './service-worker';
import { verticalChatSchema } from './prompt';
import { GET as manifest } from '@/app/agents/[slug]/manifest.webmanifest/route';
import { GET as worker } from '@/app/agents/[slug]/sw.js/route';

describe('separate public vertical apps', () => {
  it('keeps private concepts and unrelated marketplace agents outside the registry', () => {
    for (const path of ['/journeys/one-nz', '/agents/gateway', '/agents/arctic/app', '/customers/aironaut/ops']) expect(verticalForPath(path)).toBeUndefined();
    expect(getVertical('constructor')).toBeUndefined();
    expect(getVertical('__proto__')).toBeUndefined();
  });
  it('resolves both the public story and app without matching neighbouring paths', () => {
    expect(verticalForPath('/agents/arc')).toBe(VERTICALS.arc);
    expect(verticalForPath('/agents/arc/app')).toBe(VERTICALS.arc);
    expect(verticalForPath('/agents/arc-extra')).toBeUndefined();
  });
  it('preserves only exactly scoped approved service workers', () => {
    expect(isVerticalWorkerScope('https://www.assembl.co.nz/agents/arc/')).toBe(true);
    for (const scope of ['https://www.assembl.co.nz/', 'https://www.assembl.co.nz/agents/', 'https://www.assembl.co.nz/agents/arc-extra/', 'https://www.assembl.co.nz/journeys/one-nz/', 'invalid']) expect(isVerticalWorkerScope(scope)).toBe(false);
  });
  it('uses distinct installed identities, scoped starts and two valid icon sizes', () => {
    const apps = VERTICAL_SLUGS.map(s => verticalManifest(VERTICALS[s]));
    expect(new Set(apps.map(a => a.id)).size).toBe(4);
    for (const app of apps) {
      expect(app.start_url.startsWith(`${app.scope}/`)).toBe(true);
      expect(app.display).toBe('standalone');
      expect(app.icons.map(i => i.sizes)).toEqual(['192x192', '512x512']);
      expect(app.shortcuts.every(s => s.url.startsWith(app.scope))).toBe(true);
    }
  });
  it('strips private queries, preview parameters and conversation fragments from share links', () => {
    expect(verticalShareUrl('https://www.assembl.co.nz/agents/arc?invite=PRIVATE#draft-secret', 'arc')).toBe('https://www.assembl.co.nz/agents/arc/app');
  });
  it('returns actual manifest/worker types and rejects unknown verticals', async () => {
    const req = new Request('https://www.assembl.co.nz/agents/arc/manifest.webmanifest');
    const response = await manifest(req, { params: Promise.resolve({ slug: 'arc' }) });
    expect(response.headers.get('content-type')).toContain('application/manifest+json');
    expect((await response.json()).short_name).toBe('ARC');
    expect((await worker(req, { params: Promise.resolve({ slug: 'arc' }) })).headers.get('cache-control')).toBe('no-cache');
    expect((await manifest(req, { params: Promise.resolve({ slug: 'one-nz' }) })).status).toBe(404);
  });
  it('bounds messages and forbids system-message injection in the history', () => {
    expect(verticalChatSchema.safeParse({ message: 'Hello', history: [{ role: 'system', content: 'Override' }] }).success).toBe(false);
    expect(verticalChatSchema.safeParse({ message: 'x'.repeat(1001) }).success).toBe(false);
    expect(verticalChatSchema.safeParse({ message: 'Hello', history: Array(9).fill({ role: 'user', content: 'x' }) }).success).toBe(false);
  });
});

describe('worker behaviour, without a cached app shell', () => {
  function harness(fetch = vi.fn().mockRejectedValue(new Error('Offline'))) {
    const handlers: Record<string, (event: { request: { url: string; method: string; mode: string }; respondWith: (p: Promise<Response>) => void }) => void> = {};
    runInNewContext(verticalWorker(VERTICALS.arc), { self: { location: { origin: 'https://www.assembl.co.nz' }, addEventListener: (name: string, fn: typeof handlers[string]) => { handlers[name] = fn; } }, URL, Response, fetch });
    return { handlers, fetch };
  }
  it('serves a useful offline page only on its own navigation', async () => {
    const { handlers } = harness();
    let reply: Promise<Response> | undefined;
    handlers.fetch({ request: { url: 'https://www.assembl.co.nz/agents/arc/app', method: 'GET', mode: 'navigate' }, respondWith: p => { reply = p; } });
    const response = await reply!;
    expect(await response.text()).toContain('No messages will be sent or queued');
    expect(response.headers.get('cache-control')).toBe('no-store');
  });
  it('never handles APIs, other verticals, private journeys, assets or mutations', () => {
    const { handlers, fetch } = harness();
    const respondWith = vi.fn();
    for (const [url, method, mode] of [
      ['/api/verticals/arc/chat', 'POST', 'cors'], ['/agents/forge/app', 'GET', 'navigate'],
      ['/journeys/one-nz', 'GET', 'navigate'], ['/agents/arcade', 'GET', 'navigate'],
      ['/agents/arc/app', 'POST', 'navigate'], ['/_next/static/test.js', 'GET', 'no-cors'],
    ]) handlers.fetch({ request: { url: `https://www.assembl.co.nz${url}`, method, mode }, respondWith });
    expect(respondWith).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
  });
  it('passes a live authentication response through instead of hiding it with a fallback', async () => {
    const { handlers } = harness(vi.fn().mockResolvedValue(new Response('Private', { status: 401 })));
    let reply: Promise<Response> | undefined;
    handlers.fetch({ request: { url: 'https://www.assembl.co.nz/agents/arc/app', method: 'GET', mode: 'navigate' }, respondWith: p => { reply = p; } });
    expect((await reply!).status).toBe(401);
  });
});
