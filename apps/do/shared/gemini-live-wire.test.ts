import { afterEach, describe, expect, it, vi } from 'vitest';
import { GoogleGenAI } from '@google/genai';
import { doVoiceConfig } from './gemini-live';
afterEach(() => vi.unstubAllGlobals());
describe('Installed Google SDK token serialization', () => {
  it('serializes constrained Gemini 3.8 sessions to the documented v1beta endpoint', async () => {
    const wire = vi.fn(async () => new Response(JSON.stringify({ name: 'auth_tokens/wire-test' }), { headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', wire);
    const ai = new GoogleGenAI({ apiKey: 'test-only-key', httpOptions: { apiVersion: 'v1beta' } });
    const token = await ai.authTokens.create({ config: { uses: 1, expireTime: '2026-09-16T02:05:00Z', newSessionExpireTime: '2026-09-16T02:01:00Z', liveConnectConstraints: { model: 'gemini-3.8-live', config: doVoiceConfig('standard', 'Kore') } } });
    expect(token.name).toBe('auth_tokens/wire-test');
    const args = wire.mock.calls[0] as unknown as [RequestInfo, RequestInit];
    expect(String(args[0])).toBe('https://generativelanguage.googleapis.com/v1beta/auth_tokens');
    const body = JSON.parse(String(args[1].body));
    expect(body.uses).toBe(1);
    // The SDK's liveConnectConstraints maps to the REST API's immutable setup.
    expect(body.bidiGenerateContentSetup.model).toBe('models/gemini-3.8-live');
    expect(body.fieldMask).toBeUndefined(); // Empty mask + setup locks the entire setup.
    expect(JSON.stringify(body)).toContain('compile_do_agent');
    expect(JSON.stringify(body)).not.toContain('thinkingConfig');
    expect(new Headers(args[1].headers).get('x-goog-api-key')).toBe('test-only-key');
  });
});
