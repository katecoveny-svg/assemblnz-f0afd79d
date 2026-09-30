import { afterEach, expect, it, vi } from 'vitest';
// Keep the actual AI SDK and router. Only the HTTP boundary and TypeSafe service are intercepted.
vi.mock('@/lib/typesafe/transport', () => ({ evaluateTypeSafePayload: vi.fn(async () => ({
  evaluation: { model: 'jev-1.13.0', action: { choice: 'prepare', confidence: 0.95 }, usage: { input_tokens: 1, output_tokens: 1 } }, elapsedMs: 1, attempts: 1,
})) }));
import { runPersonalAssistant } from './assistant-server';
import { personalAssistantInputSchema } from './assistant';

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
it('the installed SDK actually sends Astra reasoning and strict output to fixed OpenAI Responses, without fallback', async () => {
  vi.stubEnv('OPENAI_API_KEY', 'TEST_ONLY_NOT_REAL');
  vi.stubEnv('OPENAI_BASE_URL', 'https://unapproved-proxy.example/v1');
  vi.stubEnv('TYPESAFE_API_KEY', 'TEST_ONLY_NOT_REAL'); vi.stubEnv('TYPESAFE_ENABLED', 'true');
  vi.stubEnv('TYPESAFE_PILOT_USER_IDS', 'owner'); vi.stubEnv('TYPESAFE_REVIEW_THRESHOLD', '0.75');
  const fetcher = vi.fn(async () => new Response(JSON.stringify({ error: { message: 'Fictional provider failure', type: 'test' } }), { status: 503, headers: { 'content-type': 'application/json' } }));
  vi.stubGlobal('fetch', fetcher);
  await expect(runPersonalAssistant(personalAssistantInputSchema.parse({ message: 'Fictional request: draft a short note.', consent: true }), 'owner')).rejects.toMatchObject({ code: 'astra_generation_failed' });
  expect(fetcher).toHaveBeenCalledOnce();
  const [url, options] = (fetcher.mock.calls as unknown as Array<[string, RequestInit]>)[0];
  expect(url).toBe('https://api.openai.com/v1/responses');
  const body = JSON.parse(String(options.body));
  expect(body).toMatchObject({ model: 'gpt-6-astra', reasoning: { effort: 'medium' }, store: false, max_output_tokens: 6000, text: { format: { type: 'json_schema', strict: true } } });
  expect(body.reasoning).not.toHaveProperty('summary');
  expect(body.input[0].role).toBe('developer');
  expect(body.tools).toBeUndefined();
  expect(body).not.toHaveProperty('previous_response_id');
});
