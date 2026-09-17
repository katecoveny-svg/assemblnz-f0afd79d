import { describe, expect, it, vi } from 'vitest';
import * as connections from './connections-state';
import type { State } from './connections-state';

const accountState: State = {
  signedIn: true, configured: true, availability: { gmail: true }, accountsAvailable: true,
  accounts: [{ app: 'gmail', label: 'Gmail', healthy: true }], capabilities: [],
};

describe('independent connection panels', () => {
  it('keeps personal account results when optional technical details fail', async () => {
    expect(connections.loadConnectionPanels).toBeTypeOf('function');
    const onConnections = vi.fn();
    const onTechnical = vi.fn();
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async (url) => {
      if (url === '/api/do/connections') return Response.json(accountState);
      return new Response('Unavailable', { status: 503 });
    });
    await connections.loadConnectionPanels({ onConnections, onTechnical }, fetcher);
    expect(onConnections).toHaveBeenCalledWith(accountState, '');
    expect(onTechnical).toHaveBeenCalledWith(null, 'Technical details could not be checked. Your personal connections are shown separately.');
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual(['/api/do/connections', '/api/do/mcp']);
    expect(fetcher.mock.calls.every(([, options]) => !options?.method || options.method === 'GET')).toBe(true);
  });
});
