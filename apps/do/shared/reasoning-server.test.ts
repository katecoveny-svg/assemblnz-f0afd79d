import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const gate = vi.hoisted(() => ({ plan: vi.fn(), admit: vi.fn(), finish: vi.fn(), check: vi.fn() }));
vi.mock('@/lib/billing/personal-do-plan', () => ({ enabledPersonalDoPlan: gate.plan }));
vi.mock('@/lib/billing/personal-do-access', () => ({ admitPersonalDoUsage: gate.admit }));
vi.mock('@/lib/typesafe/transport', () => ({ evaluateTypeSafePayload: gate.check }));
import { runDoTextReasoning } from './reasoning-server';
const owner = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const input = { message: 'Fictional request: prepare a reply.', context: '', history: [], consent: true, useSavedStyle: false, usePublicNz: false } as const;
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('OPENAI_API_KEY', 'TEST_ONLY_NOT_REAL'); vi.stubEnv('TYPESAFE_API_KEY', 'TEST_ONLY_NOT_REAL'); vi.stubEnv('TYPESAFE_ENABLED', 'true');
  gate.plan.mockReturnValue({ maxInputBytes: 12000, maxOutputTokens: 1000 }); gate.finish.mockResolvedValue(undefined);
  gate.admit.mockResolvedValue({ finish: gate.finish });
  gate.check.mockResolvedValue({ evaluation: { model: 'jev-1.13.0', action: { choice: 'prepare', confidence: 0.95 }, usage: { input_tokens: 1, output_tokens: 1 } }, elapsedMs: 1 });
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe('Shared DO Astra/TypeSafe admission (mocked HTTP only)', () => {
  it('cannot bypass consent, owner or missing budget before any provider request', async () => {
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    await expect(runDoTextReasoning({ ...input, consent: false } as never, owner)).rejects.toThrow();
    await expect(runDoTextReasoning(input as never, '')).rejects.toMatchObject({ code: 'sign_in_required' });
    gate.plan.mockReturnValue(null);
    await expect(runDoTextReasoning(input as never, owner)).rejects.toMatchObject({ code: 'usage_unavailable' });
    expect(gate.admit).not.toHaveBeenCalled(); expect(gate.check).not.toHaveBeenCalled(); expect(fetcher).not.toHaveBeenCalled();
  });
  it('entitlement/concurrency denial prevents classification and Astra transmission', async () => {
    gate.admit.mockRejectedValue(new Error('bounded admission denied'));
    await expect(runDoTextReasoning(input as never, owner)).rejects.toThrow('bounded admission denied');
    expect(gate.check).not.toHaveBeenCalled();
  });
  it('pre-cancelled calls never reserve or transmit', async () => {
    const cancel = new AbortController(); cancel.abort();
    await expect(runDoTextReasoning(input as never, owner, cancel.signal)).rejects.toMatchObject({ code: 'request_cancelled' });
    expect(gate.admit).not.toHaveBeenCalled(); expect(gate.check).not.toHaveBeenCalled();
  });
  it('installed SDK sends actual Astra ID/medium reasoning with no fallback after durable owner reservation', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ error: { message: 'Fictional interruption' } }), { status: 503, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetcher);
    await expect(runDoTextReasoning(input as never, owner, undefined, '11111111-1111-4111-8111-111111111111')).rejects.toMatchObject({ code: 'astra_generation_failed' });
    expect(gate.admit).toHaveBeenCalledWith(owner, input, '11111111-1111-4111-8111-111111111111');
    expect(gate.admit.mock.invocationCallOrder[0]).toBeLessThan(gate.check.mock.invocationCallOrder[0]);
    expect(fetcher).toHaveBeenCalledOnce();
    const [url, options] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://api.openai.com/v1/responses');
    const body = JSON.parse(String(options.body));
    expect(body).toMatchObject({ model: 'gpt-6-astra', reasoning: { effort: 'medium' }, max_output_tokens: 1000, store: false, text: { format: { type: 'json_schema', strict: true } } });
    expect(body.tools).toBeUndefined(); expect(body.previous_response_id).toBeUndefined();
    expect(gate.finish).toHaveBeenCalledWith(false, null);
  });
  it('unsupported classification cannot grant execution or invoke Astra', async () => {
    gate.check.mockResolvedValue({ evaluation: { model: 'jev-1.13.0', action: { choice: 'unsupported', confidence: 0.99 }, usage: { input_tokens: 1, output_tokens: 0 } }, elapsedMs: 1 });
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    expect(await runDoTextReasoning(input as never, owner)).toMatchObject({ state: 'unsupported', externalActions: false, generation: null });
    expect(fetcher).not.toHaveBeenCalled(); expect(gate.finish).toHaveBeenCalledWith(true, expect.any(Object));
  });
  it('saved style is Astra-only data and never expands classifier context or tools', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ error: { message: 'Fictional interruption' } }), { status: 503, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', fetcher);
    const style = 'Private saved wording preference: keep replies short.';
    await expect(runDoTextReasoning(input as never, owner, undefined, undefined, style)).rejects.toMatchObject({ code: 'astra_generation_failed' });
    expect(JSON.stringify(gate.check.mock.calls[0][0])).not.toContain(style);
    expect(JSON.stringify(gate.check.mock.calls[0][0])).not.toContain('communicationStyle');
    const body = JSON.parse(String((fetcher.mock.calls[0] as unknown as [string, RequestInit])[1].body));
    expect(JSON.stringify(body.input)).toContain(style);
    expect(body.tools).toBeUndefined();
  });
});
