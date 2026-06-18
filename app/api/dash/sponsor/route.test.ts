import { describe, expect, it } from 'vitest';
import { GET } from './route';
import { MOCK_SPONSORS } from '@/components/dash/logic';

function req(url: string) {
  return new Request(url);
}

describe('GET /api/dash/sponsor', () => {
  it('returns a mocked NZ-brand sponsor for consumer mode', async () => {
    const res = GET(req('https://x/api/dash/sponsor?mode=consumer'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.text).toBe('string');
    expect(typeof body.advertiserId).toBe('string');
    expect(MOCK_SPONSORS.map((s) => s.advertiserId)).toContain(body.advertiserId);
  });

  it('returns a sponsor for publisher mode', async () => {
    const res = GET(req('https://x/api/dash/sponsor?mode=publisher&publisherId=archipro'));
    expect(res.status).toBe(200);
  });

  it('400s on a missing / invalid mode', async () => {
    expect(GET(req('https://x/api/dash/sponsor')).status).toBe(400);
    expect(GET(req('https://x/api/dash/sponsor?mode=whitelabel')).status).toBe(400);
  });

  it('is marked no-store (never cache an ad fill)', () => {
    const res = GET(req('https://x/api/dash/sponsor?mode=consumer'));
    expect(res.headers.get('cache-control')).toContain('no-store');
  });
});
