import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { DEFAULT_HUI_TEMPLATE_ID } from '@/lib/hui/templates';
const request = () => new Request('http://localhost/api/hui/generate-notes', { method: 'POST', body: JSON.stringify({ templateId: DEFAULT_HUI_TEMPLATE_ID, transcript: 'Discuss budget.\nNo decision has been made.', title: 'Fictional meeting' }) });
beforeEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', ''); vi.stubEnv('SUPABASE_URL', ''); });
describe('truthful meeting-note generation', () => {
  it('returns raw notes and provenance when unconfigured', async () => {
    const data = await (await POST(request())).json();
    expect(data.degraded).toBe(true);
    expect(data.provenance).toBe('raw-notes-fallback');
    expect(data.html).toContain('No decision has been made.');
    expect(data.html).not.toContain('None recorded.');
  });
  it('sanitizes provider attributes and labels preparation', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://example.invalid'); vi.stubEnv('SUPABASE_ANON_KEY', 'mock-only');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ response: '<h2 onclick="alert(1)">Draft</h2><p style="color:red">Check the source.</p>' })));
    const data = await (await POST(request())).json();
    expect(data.provenance).toBe('provider-draft'); expect(data.degraded).toBe(false);
    expect(data.html).toBe('<h2>Draft</h2><p>Check the source.</p>');
  });
  it('degrades visibly for failed, empty or malformed provider responses', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://example.invalid'); vi.stubEnv('SUPABASE_ANON_KEY', 'mock-only');
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    for (const response of [new Response('', { status: 503 }), Response.json({ response: '' }), new Response('not JSON')]) {
      fetcher.mockResolvedValue(response);
      expect((await (await POST(request())).json()).degraded).toBe(true);
    }
    fetcher.mockRejectedValue(new Error('mock offline'));
    expect((await (await POST(request())).json()).provenance).toBe('raw-notes-fallback');
  });
});
it.each([{}, {transcript:{text:'not a string'}}, {transcript:'x'.repeat(24001)}])('rejects invalid or oversized input without a provider call', async input => {
 const fetcher=vi.fn();vi.stubGlobal('fetch',fetcher);
 expect((await POST(new Request('http://localhost',{method:'POST',body:JSON.stringify({templateId:DEFAULT_HUI_TEMPLATE_ID,...input})}))).status).toBe(400);
 expect(fetcher).not.toHaveBeenCalled();
});
