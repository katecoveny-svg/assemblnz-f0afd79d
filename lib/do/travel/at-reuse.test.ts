import { afterEach, expect, it, vi } from 'vitest';
import { runNzLiveTool } from '@/lib/do-mcp/nz-live';
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
it('uses the existing Edge adapter without requiring a duplicate AT secret in Next', async () => {
  vi.stubEnv('AT_API_KEY', '');
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://example.invalid');
  const fetcher = vi.fn(async (_url: string, _init?: RequestInit) => new Response(JSON.stringify({ vehicles: [], count: 0 }), { status: 200 }));
  vi.stubGlobal('fetch', fetcher);
  const result = await runNzLiveTool('at_bus_positions', { route_ids: ['test-route'] });
  expect(result.ok).toBe(true);
  expect(fetcher).toHaveBeenCalledOnce();
  expect(fetcher.mock.calls[0]?.[0]).toBe('https://example.invalid/functions/v1/bus-positions');
});
