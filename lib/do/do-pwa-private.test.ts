import { describe, expect, it } from 'vitest';
import { runInNewContext } from 'node:vm';
import { doServiceWorkerSource } from './do-service-worker';

describe('DO private navigation offline boundary', () => {
  it('never stores authenticated HTML and serves only the public shell offline', async () => {
    const handlers: Record<string, (event: unknown) => void> = {};
    const writes: unknown[] = [];
    let offline = false;
    runInNewContext(doServiceWorkerSource(), {
      self: { location: { origin: 'https://www.assembl.co.nz', hostname: 'www.assembl.co.nz' }, addEventListener: (name: string, cb: (event: unknown) => void) => { handlers[name] = cb; } },
      URL, Response,
      fetch: async () => { if (offline) throw new Error('offline'); return new Response('PRIVATE ACCOUNT DATA'); },
      caches: { open: async () => ({ put: (...args: unknown[]) => { writes.push(args); } }), match: async () => new Response('STALE PRIVATE DATA') },
    });
    let pending: Promise<Response> | undefined;
    const event = { request: { method: 'GET', mode: 'navigate', url: 'https://www.assembl.co.nz/do' }, respondWith: (response: Promise<Response>) => { pending = response; } };
    handlers.fetch(event);
    expect(await (await pending!).text()).toBe('PRIVATE ACCOUNT DATA');
    expect(writes).toEqual([]);
    offline = true;
    handlers.fetch(event);
    const fallback = await pending!;
    expect(await fallback.text()).toContain('Ready when you reconnect');
    expect(fallback.headers.get('Cache-Control')).toBe('no-store');
  });
});
