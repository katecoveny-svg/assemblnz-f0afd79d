import { describe, expect, it, vi } from 'vitest';
import { createOpenAI } from '@ai-sdk/openai';
vi.mock('./call-log', () => ({ recordModelCall: vi.fn(), providerFromModelId: () => 'synthetic' }));
vi.mock('./fallback-log', () => ({ recordModelFallback: vi.fn() }));
import { generateWithFallback, type ModelRung } from './router';
const metadataCases = [
  ['completed', null, 'provider-ended'], ['incomplete', 'max_output_tokens', 'incomplete'],
  ['incomplete', null, 'incomplete'], [undefined, null, 'unverified'],
] as const;
import { transcriptionCompletion } from './completion';
describe('actual installed SDK, injected fetch only', () => {
  it.each(metadataCases)('passes actual Responses %s terminal metadata through without another call', async (status, reason, expected) => {
    const fetch = vi.fn(async () => Response.json({
      id: 'resp_synthetic', object: 'response', created_at: 1, model: 'gpt-4.1-mini', ...(status ? { status } : {}), incomplete_details: reason ? { reason } : null,
      output: [{ id: 'msg_synthetic', type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: 'Synthetic notes.', annotations: [] }] }],
      usage: { input_tokens: 5, output_tokens: 4, total_tokens: 9 },
    }));
    const provider = createOpenAI({ apiKey: 'synthetic-only-not-a-key', fetch });
    const rung: ModelRung = { id: 'synthetic', label: 'Synthetic', isPrimary: true, model: provider.responses('gpt-4.1-mini') };
    const result = await generateWithFallback({ ladder: [rung], system: 'Transcribe.', messages: [{ role: 'user', content: 'Synthetic fixture' }], maxOutputTokens: 1200, fallback: 'none' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(transcriptionCompletion(result.completion).status).toBe(expected);
    expect(fetch).toHaveBeenCalledOnce();
  });
  it('does not let the actual SDK retry an HTTP error or reach another provider', async () => {
    const fetch = vi.fn(async () => Response.json({ error: { message: 'synthetic service failure', type: 'server_error' } }, { status: 500 }));
    const forbidden = vi.fn(async () => { throw new Error('second provider reached'); });
    const first = createOpenAI({ apiKey: 'synthetic-only-not-a-key', fetch });
    const second = createOpenAI({ apiKey: 'synthetic-only-not-a-key', fetch: forbidden });
    const ladder: ModelRung[] = [first, second].map((p, index) => ({ id: `synthetic-${index}`, label: 'Synthetic', isPrimary: index === 0, model: p.responses('gpt-4.1-mini') }));
    expect((await generateWithFallback({ ladder, system: 'Transcribe.', messages: [{ role: 'user', content: 'Synthetic' }], fallback: 'none', maxOutputTokens: 1200 })).ok).toBe(false);
    expect(fetch).toHaveBeenCalledOnce(); expect(forbidden).not.toHaveBeenCalled();
  });
});
