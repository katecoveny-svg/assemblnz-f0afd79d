import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ generate: vi.fn(), consume: vi.fn() }));
vi.mock('@/lib/creative/generate', () => ({ generateImages: mocks.generate, isNotConfigured: () => false }));
vi.mock('@/lib/creative/ratelimit', () => ({ consume: mocks.consume, rateKey: () => 'test' }));
import { POST } from './route';
import { ASSEMBL_CREATIVE_PROFILE } from '@/lib/creative/assembl-brand';

const request = (extra: Record<string, unknown> = {}) => new Request('https://www.assembl.co.nz/api/creative/image', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ brief: 'An architectural studio', aspectRatio: '4:5', count: 1, ...extra }),
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.consume.mockResolvedValue({ ok: true, remaining: 2, limit: 3 });
  mocks.generate.mockResolvedValue({ images: ['data:image/png;base64,test'], provider: 'imagen', model: 'test', aspectRatio: '4:5' });
});

describe('Assembl image generation brand context', () => {
  it('passes current homepage art direction and the selected reference to the provider', async () => {
    expect((await POST(request({ brandProfile: ASSEMBL_CREATIVE_PROFILE, brandAssetId: 'atelier' }))).status).toBe(200);
    const [prompt, options] = mocks.generate.mock.calls[0];
    expect(prompt).toContain('An architectural studio');
    for (const token of ['#240B21', '#654A4E', '#916A70', '#F5F1F2', '#FFFDFB', 'Instrument Sans', 'IBM Plex Mono', 'homepage', 'No embedded words', 'Reference composition:']) expect(prompt).toContain(token);
    expect(prompt).not.toContain('#E9BCA9');
    expect(options).toMatchObject({ count: 1, aspectRatio: '4:5' });
  });

  it('does not overwrite another client brand with Assembl colours', async () => {
    await POST(request({ brief: 'Client-approved blue product photography' }));
    expect(mocks.generate.mock.calls[0][0]).toBe('Client-approved blue product photography');
  });

  it('rejects malformed briefs and unknown profiles before consuming a trial', async () => {
    for (const input of [{ brief: {} }, { brief: 'x'.repeat(6001) }, { brandProfile: 'old-gold-brand' }]) {
      expect((await POST(request(input))).status).toBe(400);
    }
    expect(mocks.consume).not.toHaveBeenCalled();
    expect(mocks.generate).not.toHaveBeenCalled();
  });

  it('retains the rate limit boundary for branded generations', async () => {
    mocks.consume.mockResolvedValue({ ok: false, limit: 3 });
    expect((await POST(request({ brandProfile: ASSEMBL_CREATIVE_PROFILE }))).status).toBe(429);
    expect(mocks.generate).not.toHaveBeenCalled();
  });
});
