import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateImages } from './generate';

beforeEach(() => { vi.stubEnv('GEMINI_API_KEY', 'test-key'); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('native Google image generation', () => {
  it('sends actual reference pixels, format and cancellation to the current model', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ candidates: [{ content: { parts: [
      { thought: true, inlineData: { mimeType: 'image/png', data: 'intermediate' } },
      { inlineData: { mimeType: 'image/png', data: 'finished' } },
    ] } }] }));
    vi.stubGlobal('fetch', fetcher);
    const signal = new AbortController().signal;
    const result = await generateImages('A paper atelier', { count: 1, aspectRatio: '4:5', referenceDataUrl: 'data:image/jpeg;base64,cGhvdG8=', signal });
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent');
    expect(url).not.toContain('test-key');
    expect(init.signal).toBe(signal);
    const body = JSON.parse(init.body);
    expect(body.contents[0].parts[1]).toEqual({ inlineData: { mimeType: 'image/jpeg', data: 'cGhvdG8=' } });
    expect(body.generationConfig.imageConfig).toEqual({ aspectRatio: '4:5', imageSize: '1K' });
    expect(result).toMatchObject({ provider: 'gemini', images: ['data:image/png;base64,finished'] });
  });

  it('fails clearly when the provider returns no final image', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ candidates: [{ content: { parts: [{ text: 'Unable to generate' }] } }] })));
    await expect(generateImages('A paper atelier', { count: 1 })).rejects.toThrow('No image was returned');
  });

  it('does not disclose provider error bodies or silently discard a reference', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('sensitive provider detail', { status: 429 }));
    vi.stubGlobal('fetch', fetcher);
    await expect(generateImages('A paper atelier', { count: 1 })).rejects.toThrow('Image generation is unavailable (429)');
    expect(fetcher).toHaveBeenCalledTimes(1);
    for (const name of ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY']) vi.stubEnv(name, '');
    vi.stubEnv('FAL_KEY', 'test-fal-key');
    await expect(generateImages('A paper atelier', { count: 1, referenceDataUrl: 'data:image/jpeg;base64,cGhvdG8=' })).rejects.toThrow('GEMINI_API_KEY not configured');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
