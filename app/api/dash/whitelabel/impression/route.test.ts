import { describe, expect, it, vi } from 'vitest';
import { POST } from './route';

function jsonReq(body: unknown) {
  return new Request('https://x/api/dash/whitelabel/impression', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/dash/whitelabel/impression', () => {
  it('records usage and returns ok', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const res = await POST(jsonReq({ publisherId: 'acme', durationMs: 3200 }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('400s without a publisherId', async () => {
    const res = await POST(jsonReq({ durationMs: 1 }));
    expect(res.status).toBe(400);
  });
});
