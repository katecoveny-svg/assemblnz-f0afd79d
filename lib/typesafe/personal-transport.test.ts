import { expect, it, vi } from 'vitest';
import { evaluateTypeSafePayload, TYPESAFE_ENDPOINT } from './transport';
import { personalTypeSafePayload, parsePersonalTypeSafeEvaluation } from './personal';
import { personalAssistantInputSchema } from '@/apps/do/personal/assistant';
const input = personalAssistantInputSchema.parse({ message: 'Help me plan the house move.', consent: true });
const config = { apiKey: 'TEST_ONLY_NOT_REAL', model: 'jev-1.13.0' };
const payload = personalTypeSafePayload(input, config.model);
const reply = { model: 'jev-1.13.0', answers: { next_action: { type: 'choice', choice: 'prepare', confidence: 0.9, probabilities: { prepare: 0.9, clarify: 0.09, unsupported: 0.01 } } }, usage: { input_tokens: 100, output_tokens: 20 } };
it('uses the fixed TypeSafe endpoint with the existing documented personal rubric envelope', async () => {
  const fetcher = vi.fn(async (url, options) => {
    expect(url).toBe(TYPESAFE_ENDPOINT); expect(options.redirect).toBe('error'); expect(options.cache).toBe('no-store');
    expect(JSON.parse(options.body)).toEqual(payload); return Response.json(reply);
  });
  expect((await evaluateTypeSafePayload(payload, parsePersonalTypeSafeEvaluation, config, fetcher)).evaluation.action.choice).toBe('prepare');
});
it('rejects oversized provider responses without echoing content', async () => {
  await expect(evaluateTypeSafePayload(payload, parsePersonalTypeSafeEvaluation, config, async () => new Response('PRIVATE'.repeat(10000)))).rejects.toMatchObject({ code: 'provider_protocol_error', message: 'TypeSafe returned an oversized response.' });
});
it('aborts pending provider requests and prevents overload retry after cancellation', async () => {
  const controller = new AbortController();
  const fetcher = vi.fn(async () => { controller.abort(); throw new Error('PRIVATE'); });
  await expect(evaluateTypeSafePayload(payload, parsePersonalTypeSafeEvaluation, { ...config, signal: controller.signal }, fetcher)).rejects.toMatchObject({ code: 'request_cancelled' });
  expect(fetcher).toHaveBeenCalledOnce();
  const retry = new AbortController();
  const overloaded = vi.fn(async () => new Response('', { status: 429 }));
  await expect(evaluateTypeSafePayload(payload, parsePersonalTypeSafeEvaluation, { ...config, signal: retry.signal }, overloaded, async () => { retry.abort(); })).rejects.toMatchObject({ code: 'request_cancelled' });
  expect(overloaded).toHaveBeenCalledOnce();
});
