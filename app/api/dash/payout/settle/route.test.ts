import { describe, expect, it } from 'vitest';
import { POST } from './route';

function jsonReq(body: unknown) {
  return new Request('https://x/api/dash/payout/settle', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/dash/payout/settle', () => {
  it('settles a publisher anchor split (60/40)', async () => {
    const res = await POST(
      jsonReq({ mode: 'publisher', payeeId: 'archipro', period: '2026-06', revShareTier: 'anchor' }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.payeeId).toBe('archipro');
    expect(body.splitByDestination.publisher).toBeGreaterThan(body.splitByDestination.assembl);
  });

  it('settles a consumer split', async () => {
    const res = await POST(jsonReq({ mode: 'consumer', payeeId: 'user_1', period: '2026-06' }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.splitByDestination.payee).toBeGreaterThan(0);
  });

  it('returns a zero split for whitelabel (subscription-billed)', async () => {
    const res = await POST(jsonReq({ mode: 'whitelabel', payeeId: 'acme', period: '2026-06' }));
    const body = await res.json();
    expect(body.totalRevenue).toBe(0);
    expect(body.splitByDestination).toEqual({});
  });

  it('400s on an invalid mode', async () => {
    const res = await POST(jsonReq({ mode: 'bogus', payeeId: 'x', period: '2026-06' }));
    expect(res.status).toBe(400);
  });
});
