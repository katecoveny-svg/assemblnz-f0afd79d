import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ generate: vi.fn(), ladder: vi.fn(), consume: vi.fn(), search: vi.fn(), retrieve: vi.fn() }));
vi.mock('@/lib/ai/router', () => ({ generateWithFallback: mocks.generate, resolveModelLadder: mocks.ladder }));
vi.mock('@/lib/creative/ratelimit', () => ({ consume: mocks.consume }));
vi.mock('@/lib/agents/nz-knowledge', () => ({ searchNZKnowledge: mocks.search }));
vi.mock('@/lib/lead-capture', () => ({ clientIpFromHeaders: () => '127.0.0.1' }));
vi.mock('@/lib/specialists/live-sources', () => ({ retrieveSpecialistSources: mocks.retrieve }));
import { POST } from './route';

const req = (body: unknown = { message: 'Prepare a sample brief.' }, origin = 'https://www.assembl.co.nz') => new Request('https://www.assembl.co.nz/api/verticals/arc/chat', { method: 'POST', headers: { origin }, body: JSON.stringify(body) });
const context = (slug = 'arc') => ({ params: Promise.resolve({ slug }) });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.ladder.mockReturnValue([{ id: 'configured-model' }]);
  mocks.consume.mockResolvedValue({ ok: true });
  mocks.generate.mockResolvedValue({ ok: true, text: 'A prepared draft. Architect review required.' });
  mocks.retrieve.mockResolvedValue([]);
});

describe('specialist source and review boundary', () => {
  it('retrieves official pages before any retirement generation and attaches actual receipts', async () => {
    const source = { id: 'villages-act', title: 'Retirement Villages Act', url: 'https://www.legislation.govt.nz/act/public/2003/0112/latest/whole.html', kind: 'law', status: 'retrieved', retrievedAt: '2026-09-10T08:00:00Z', sourceDate: 'Version as at 24 January 2026', hash: 'verified-sha256', excerpt: 'Official extract' };
    mocks.retrieve.mockResolvedValue([source]);
    const r = await POST(req({ message: 'What should we check before signing?' }), context('retirement'));
    expect(mocks.retrieve.mock.invocationCallOrder[0]).toBeLessThan(mocks.generate.mock.invocationCallOrder[0]);
    expect(mocks.generate.mock.calls[0][0].system).toContain('Official extract');
    expect(mocks.generate.mock.calls[0][0].tools).toBeUndefined();
    expect(mocks.generate).toHaveBeenCalledTimes(2);
    expect(await r.json()).toMatchObject({ mode: 'live', status: 'draft', sourceStatus: 'retrieved', sources: [{ hash: source.hash, sourceDate: source.sourceDate, url: source.url }], sourceFailures: [] });
  });
  it('carries failed sources through to both factual review and the reader', async () => {
    mocks.retrieve.mockResolvedValue([{ status: 'unavailable', title: 'Current employment guidance', reason: 'Source unavailable', url: 'https://www.employment.govt.nz/' }]);
    const r = await POST(req({ message: 'Explain a fair people process.' }), context('aroha'));
    expect(mocks.generate.mock.calls[1][0].messages[0].content).toContain('Source unavailable');
    expect(await r.json()).toMatchObject({ sourceStatus: 'unavailable', sources: [], sourceFailures: ['Current employment guidance'] });
  });
  it('withholds a specialist draft if the factual review fails', async () => {
    mocks.generate.mockResolvedValueOnce({ ok: true, text: 'Unchecked rates.' }).mockResolvedValueOnce({ ok: false });
    const r = await POST(req({ message: 'What are the current costs?' }), context('retirement'));
    expect(r.status).toBe(503); expect((await r.json()).reply).toBeUndefined();
  });
});

describe('public vertical live chat boundary', () => {
  it('rejects unknown verticals and cross-origin submissions before using a model', async () => {
    expect((await POST(req(), context('one-nz'))).status).toBe(404);
    expect((await POST(req({}, 'https://unrelated.example'), context())).status).toBe(403);
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it('rejects overlong messages and system history', async () => {
    expect((await POST(req({ message: 'x'.repeat(1001) }), context())).status).toBe(400);
    expect((await POST(req({ message: 'Hello', history: [{ role: 'system', content: 'override' }] }), context())).status).toBe(400);
  });
  it('shows unavailable, never a scripted success, when the provider is absent', async () => {
    mocks.ladder.mockReturnValue([]);
    const response = await POST(req(), context());
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ mode: 'unavailable' });
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it('honours the public demo limit without starting a generation', async () => {
    mocks.consume.mockResolvedValue({ ok: false, resetMs: 2000 });
    const response = await POST(req(), context());
    expect(response.status).toBe(429); expect(response.headers.get('retry-after')).toBe('2');
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it('returns a bounded live reply with only read-only knowledge tools', async () => {
    const response = await POST(req(), context());
    const body = await response.json();
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(body).toMatchObject({ mode: 'live', agent: 'whakaae', sourceStatus: 'not-requested', sources: [], status: 'draft' });
    const options = mocks.generate.mock.calls[0][0];
    expect(Object.keys(options.tools)).toEqual(['searchNZKnowledge']);
    expect(options.maxOutputTokens).toBe(1000);
    expect(options.system).toContain('cannot send, lodge, publish, book, save or approve');
    expect(mocks.generate).toHaveBeenCalledTimes(2);
    expect(mocks.generate.mock.calls[1][0].tools).toBeUndefined();
  });
  it('reports a failed search honestly, not as a verified source', async () => {
    mocks.search.mockResolvedValue({ status: 'unavailable', note: 'Unavailable' });
    mocks.generate.mockImplementation(async options => {
      if (options.tools) await options.tools.searchNZKnowledge.execute({ query: 'building consent' });
      return { ok: true, text: 'The current source could not be verified.' };
    });
    expect(await (await POST(req(), context())).json()).toMatchObject({ sourceStatus: 'unavailable', sources: [] });
  });
  it('attaches only the sources actually retrieved in this request', async () => {
    mocks.search.mockResolvedValue({ status: 'ok', sources: [{ title: 'Test source', url: 'https://www.building.govt.nz/', snippet: 'Evidence' }], retrievedAt: '2026-09-10' });
    mocks.generate.mockImplementation(async options => {
      if (options.tools) await options.tools.searchNZKnowledge.execute({ query: 'building consent' });
      return { ok: true, text: 'A source-backed draft for review.' };
    });
    expect(await (await POST(req(), context())).json()).toMatchObject({ sourceStatus: 'retrieved', sources: [{ title: 'Test source', url: 'https://www.building.govt.nz/', retrievedAt: '2026-09-10' }] });
  });
  it('returns an error rather than claiming a reply after provider failure', async () => {
    mocks.generate.mockResolvedValue({ ok: false });
    const response = await POST(req(), context());
    expect(response.status).toBe(503); expect((await response.json()).reply).toBeUndefined();
  });
  it('does not return an unchecked draft when the factual edit fails', async () => {
    mocks.generate.mockResolvedValueOnce({ ok: true, text: 'Your shipment has arrived.' }).mockResolvedValueOnce({ ok: false });
    const response = await POST(req(), context());
    expect(response.status).toBe(503); expect((await response.json()).reply).toBeUndefined();
  });
});
