import { describe, expect, it, vi } from 'vitest';
import { POST } from './route';
import { REVENUE_PER_WAIT } from '@/components/dash/logic';

function jsonReq(body: unknown) {
  return new Request('https://x/api/dash/impression', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/dash/impression', () => {
  it('records a consumer impression and returns mocked revenue', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const res = await POST(
      jsonReq({
        mode: 'consumer',
        durationMs: 4200,
        advertiserId: 'westpac-small-biz',
        sponsorLine: 'Westpac Small Biz',
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.revenueGenerated).toBeCloseTo(REVENUE_PER_WAIT);
  });

  it('records a publisher impression', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const res = await POST(
      jsonReq({ mode: 'publisher', publisherId: 'archipro', revShareTier: 'anchor', durationMs: 1 }),
    );
    expect(res.status).toBe(200);
  });

  it('400s on an invalid mode', async () => {
    const res = await POST(jsonReq({ mode: 'whitelabel', durationMs: 1 }));
    expect(res.status).toBe(400);
  });

  it('400s on non-JSON', async () => {
    const res = await POST(
      new Request('https://x/api/dash/impression', { method: 'POST', body: 'oops' }),
    );
    expect(res.status).toBe(400);
  });
});
