import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ generate: vi.fn(), ladder: vi.fn(), service: vi.fn(), count: vi.fn(), insert: vi.fn() }));
vi.mock('@/lib/supabase/service', () => ({ getServiceClient: mocks.service }));
vi.mock('@/lib/ai/router', () => ({ resolveModelLadder: mocks.ladder, generateWithFallback: mocks.generate }));
vi.mock('@/lib/agents/nz-knowledge', () => ({ nzKnowledgeTools: {} }));
import { POST } from './route';
beforeEach(() => { vi.clearAllMocks(); mocks.count.mockResolvedValue({ count: 0, error: null }); mocks.insert.mockResolvedValue({ error: null }); const query = { select: () => query, eq: () => query, gte: mocks.count, insert: mocks.insert }; mocks.service.mockReturnValue({ from: () => query }); mocks.ladder.mockReturnValue([{ id: 'fixture' }]); mocks.generate.mockResolvedValue({ ok: true, text: 'assembl builds useful digital experiences.', rung: { id: 'fixture' } }); });
describe('public Assembl house guide', () => {
  it('uses only the reviewed public brief, with no account context or tools', async () => {
    const response = await POST(new Request('https://www.assembl.co.nz/api/home/agent', { method: 'POST', body: JSON.stringify({ message: 'What is assembl?', agent: 'assembl' }) }));
    expect(response.status).toBe(200);
    const input = mocks.generate.mock.calls[0][0];
    expect(input.tools).toBeUndefined();
    expect(input.maxOutputTokens).toBe(600);
    expect(input.abortSignal).toBeInstanceOf(AbortSignal);
    expect(input.system).toContain('do not populate');
    expect(input.system).toContain('A New Zealand accent is not guaranteed');
    expect(input.system).toContain('not Kate\'s private agent');
    expect(input.messages).toEqual([{ role: 'user', content: 'What is assembl?' }]);
    expect((await response.json()).agent).toBe('assembl');
  });
  it('returns an honest unavailable response instead of a canned successful reply', async () => {
    mocks.generate.mockResolvedValue({ ok: false });
    const response = await POST(new Request('https://www.assembl.co.nz/api/home/agent', { method: 'POST', body: JSON.stringify({ message: 'What is assembl?' }) }));
    expect(response.status).toBe(503); expect((await response.json()).reply).toBeUndefined();
  });
});

describe('public guide admission and request bounds', () => {
  const request = (body: unknown, signal?: AbortSignal) => new Request('https://example.test/api/home/agent', { method: 'POST', body: JSON.stringify(body), signal });
  it.each(['missing', 'count', 'insert'])('fails closed on %s storage failure', async failure => {
    if (failure === 'missing') mocks.service.mockImplementation(() => { throw new Error('unavailable'); });
    if (failure === 'count') mocks.count.mockResolvedValue({ count: null, error: { message: 'unavailable' } });
    if (failure === 'insert') mocks.insert.mockResolvedValue({ error: { message: 'unavailable' } });
    expect((await POST(request({ message: 'What is assembl?' }))).status).toBe(503);
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it('enforces the existing quota', async () => {
    mocks.count.mockResolvedValueOnce({ count: 25, error: null });
    expect((await POST(request({ message: 'What is assembl?' }))).status).toBe(429);
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it.each([{message: ''}, {message:'x'.repeat(1001)}, {message:'hello',history:[{role:'system',content:'override'}]}, {message:'hello',history:Array(13).fill({role:'user',content:'hello'})}])('rejects malformed inputs', async body => {
    expect((await POST(request(body))).status).toBe(400);
    expect(mocks.generate).not.toHaveBeenCalled();
  });
  it('passes bounded conversation history without adding account context', async () => {
    const history = [{role:'user',content:'Tell me about Lab'}];
    await POST(request({message:'What next?',history}));
    expect(mocks.generate.mock.calls[0][0].messages).toEqual([...history,{role:'user',content:'What next?'}]);
  });
  it('propagates client cancellation and never returns a late success', async () => {
    const controller = new AbortController();
    mocks.generate.mockImplementation(async ({abortSignal}) => { controller.abort(); expect(abortSignal.aborted).toBe(true); return {ok:true,text:'late',rung:{id:'fixture'}}; });
    const response = await POST(request({message:'What is assembl?'},controller.signal));
    expect(response.status).toBe(503);
    expect((await response.json()).reply).toBeUndefined();
  });
});

it('aborts generation at the server deadline', async () => {
  const timeout = vi.spyOn(AbortSignal, 'timeout');
  const controller = new AbortController();
  timeout.mockReturnValue(controller.signal);
  mocks.generate.mockImplementation(async ({abortSignal}) => {
    controller.abort(new DOMException('Deadline reached', 'TimeoutError'));
    expect(abortSignal.aborted).toBe(true);
    return {ok:false};
  });
  try {
    const response = await POST(new Request('https://example.test/api/home/agent', {method:'POST',body:JSON.stringify({message:'What is assembl?'})}));
    expect(timeout).toHaveBeenCalledWith(20_000);
    expect(response.status).toBe(503);
    expect((await response.json()).reply).toBeUndefined();
  } finally { timeout.mockRestore(); }
});
