import { beforeEach, describe, expect, it, vi } from 'vitest';
const calls = vi.hoisted(() => ({ generate: vi.fn(), log: vi.fn(), fallback: vi.fn() }));
vi.mock('ai', () => ({ generateText: calls.generate, stepCountIs: vi.fn() }));
vi.mock('./call-log', () => ({ recordModelCall: calls.log, providerFromModelId: () => 'synthetic' }));
vi.mock('./fallback-log', () => ({ recordModelFallback: calls.fallback }));
import { generateWithFallback, FALLBACK_DISCLOSURE, type ModelRung } from './router';
const ladder = [{ id: 'synthetic-first', isPrimary: false, label: 'Synthetic first', model: {} }, { id: 'synthetic-second', isPrimary: false, label: 'Synthetic second', model: {} }] as ModelRung[];
beforeEach(() => { vi.clearAllMocks(); calls.generate.mockReset(); });
describe('one explicitly consented transcription dispatch', () => {
  it('does not retry/fallback on error and keeps disclosure out of transcript instructions', async () => {
    calls.generate.mockRejectedValue(new Error('synthetic failure'));
    const result = await generateWithFallback({ ladder, system: 'Transcribe only.', messages: [], maxOutputTokens: 1200, fallback: 'none' });
    expect(result.ok).toBe(false); expect(calls.generate).toHaveBeenCalledOnce();
    expect(calls.generate.mock.calls[0][0]).toMatchObject({ system: 'Transcribe only.', maxRetries: 0, maxOutputTokens: 1200 });
    expect(calls.fallback.mock.calls[0][0].fallbackModel).toBeNull();
  });
  it('returns partial text and actual completion without extra dispatch', async () => {
    calls.generate.mockResolvedValue({ text: 'Synthetic partial.', usage: {}, finishReason: 'length', rawFinishReason: 'max_output_tokens', response: { body: { status: 'incomplete', private: 'secret' } } });
    const result = await generateWithFallback({ ladder, system: 'Transcribe only.', messages: [], fallback: 'none' });
    expect(result).toMatchObject({ ok: true, text: 'Synthetic partial.', completion: { finishReason: 'length', rawFinishReason: 'max_output_tokens', providerStatus: 'incomplete' } });
    expect(JSON.stringify(result)).not.toContain('secret'); expect(calls.generate).toHaveBeenCalledOnce();
  });
  it('preserves previous fallback/retry-default behavior for all other callers', async () => {
    calls.generate.mockRejectedValueOnce(new Error('first failed')).mockResolvedValueOnce({ text: 'second result', usage: {}, finishReason: 'stop' });
    expect((await generateWithFallback({ ladder, system: 'Existing caller.', messages: [] })).ok).toBe(true);
    expect(calls.generate).toHaveBeenCalledTimes(2);
    expect(calls.generate.mock.calls[0][0].maxRetries).toBeUndefined();
    expect(calls.generate.mock.calls[1][0].system).toContain(FALLBACK_DISCLOSURE);
  });
});
